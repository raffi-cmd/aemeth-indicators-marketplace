import { Router } from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import multer from 'multer';
import { db } from '../db.ts';
import { requireAuth, type AuthRequest } from '../auth.ts';

import {
  getProductPrice,
  calculateBundlePrice,
  resolveProductId,
  LICENSE_CONFIG,
} from '../../src/config/pricing.ts';

export const orderRoutes = Router();

// Configure multer for payment receipts
const receiptStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.resolve('server/storage/receipts');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = 'receipt_' + Date.now() + '_' + crypto.randomUUID().slice(0, 8) + ext;
    cb(null, unique);
  },
});
const uploadReceipt = multer({
  storage: receiptStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// Helper: Fulfill an order when verified paid
export function fulfillOrder(orderId: string) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
  if (!order) return;

  const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId) as any[];

  for (const item of orderItems) {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id) as any;
    if (!product) continue;

    if (product.type === 'bundle') {
      // Provision each bundled product
      const bundleChildren = db.prepare(`
        SELECT p.* FROM bundle_items bi
        JOIN products p ON bi.product_id = p.id
        WHERE bi.bundle_id = ?
      `).all(product.id) as any[];

      for (const child of bundleChildren) {
        provisionDelivery(order, child);
      }
    } else {
      provisionDelivery(order, product);
    }
  }

  // Update order status to paid
  db.prepare(`
    UPDATE orders 
    SET status = 'paid', updated_at = datetime('now')
    WHERE id = ?
  `).run(orderId);
}

function provisionDelivery(order: any, product: any) {
  // Check if delivery already exists for this order & product to prevent duplicates
  const existing = db.prepare(`
    SELECT id FROM deliveries WHERE order_id = ? AND product_id = ?
  `).get(order.id, product.id);

  if (existing) return;

  const deliveryId = 'del_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  // Aemeth digital delivery model: 100% direct Pine Script source code delivery
  const deliveryType = 'source_download';
  const status = 'ready';

  db.prepare(`
    INSERT INTO deliveries (id, order_id, product_id, user_id, delivery_type, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(deliveryId, order.id, product.id, order.user_id, deliveryType, status);
}

// POST create order (authenticated or guest with email)
orderRoutes.post('/', (req: AuthRequest, res) => {
  try {
    const {
      product_ids,
      payment_method,
      customer_email,
      customer_name,
      customer_tv_username,
      bundle_type,
      license_accepted,
    } = req.body;

    if (!Array.isArray(product_ids) || product_ids.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one product must be selected' });
    }

    if (!payment_method) {
      return res.status(400).json({ success: false, error: 'Payment method is required' });
    }

    // Check duplicate products
    const uniqueIds = new Set(product_ids.map(resolveProductId));
    if (uniqueIds.size !== product_ids.length) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate products detected in order. Each indicator can only be selected once.',
      });
    }

    // Determine user
    let userId = req.user?.id;
    let email = req.user?.email || customer_email;
    let tvUsername = customer_tv_username;

    if (!userId) {
      if (!email) {
        return res.status(400).json({ success: false, error: 'Customer email is required for checkout' });
      }
      email = String(email).toLowerCase().trim();
      
      // Find or create guest user
      const existingUser = db.prepare('SELECT id, tradingview_username FROM users WHERE email = ?').get(email) as any;
      if (existingUser) {
        userId = existingUser.id;
        tvUsername = tvUsername || existingUser.tradingview_username;
      } else {
        userId = 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
        const randomPassHash = crypto.randomBytes(32).toString('hex');
        db.prepare(`
          INSERT INTO users (id, email, password_hash, name, role, tradingview_username)
          VALUES (?, ?, ?, ?, 'customer', ?)
        `).run(userId, email, randomPassHash, customer_name || 'Trader', tvUsername || null);
      }
    }

    // Server-side authoritative price calculation (ignore any client-provided price)
    let totalIdr = 0;
    let subtotalIdr = 0;
    let bundleDiscountIdr = 0;
    let totalSavingsIdr = 0;
    let totalCents = 0;
    const itemsToInsert: any[] = [];

    if (bundle_type) {
      const bundleCalc = calculateBundlePrice(bundle_type, product_ids);
      if (!bundleCalc.isValid) {
        return res.status(400).json({ success: false, error: bundleCalc.error || 'Invalid bundle package configuration' });
      }

      totalIdr = bundleCalc.finalPriceIdr;
      subtotalIdr = bundleCalc.totalNormalPriceIdr;
      bundleDiscountIdr = bundleCalc.bundleDiscountAmountIdr;
      totalSavingsIdr = bundleCalc.totalSavingsIdr;
      totalCents = Math.round(totalIdr / 160);

      for (const prod of bundleCalc.selectedProducts) {
        itemsToInsert.push({
          id: prod.id,
          title: prod.name,
          type: 'open_source',
          version: prod.version,
          unit_price_cents: prod.effectivePriceCents,
          normal_price_idr: prod.normalPriceIdr,
          effective_price_idr: prod.effectivePriceIdr,
        });
      }
    } else {
      for (const rawId of product_ids) {
        const resolvedId = resolveProductId(rawId);
        const priceInfo = getProductPrice(resolvedId);

        if (!priceInfo) {
          return res.status(400).json({ success: false, error: `Product not available: ${rawId}` });
        }

        totalIdr += priceInfo.effectivePriceIdr;
        subtotalIdr += priceInfo.normalPriceIdr;
        totalSavingsIdr += priceInfo.discountIdr;
        totalCents += priceInfo.effectivePriceCents;

        itemsToInsert.push({
          id: priceInfo.id,
          title: priceInfo.name,
          type: 'open_source',
          version: priceInfo.version,
          unit_price_cents: priceInfo.effectivePriceCents,
          normal_price_idr: priceInfo.normalPriceIdr,
          effective_price_idr: priceInfo.effectivePriceIdr,
        });
      }
    }

    const orderId = 'ord_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const orderNumber = 'AEM-' + Math.floor(1000000 + Math.random() * 9000000);
    const licenseAgreedAt = license_accepted ? new Date().toISOString() : null;

    // Generate high-entropy access token for secure digital delivery
    const accessToken = 'tok_' + crypto.randomBytes(24).toString('hex');
    const accessTokenHash = crypto.createHash('sha256').update(accessToken).digest('hex');

    // Create Order with IDR, License, and Access Token fields
    db.prepare(`
      INSERT INTO orders (
        id, order_number, user_id, total_cents, currency, status, payment_method, customer_email, customer_tv_username,
        total_idr, subtotal_idr, bundle_type, bundle_discount_idr, total_savings_idr, license_version, license_agreed_at,
        access_token, access_token_hash, customer_name, is_revoked
      ) VALUES (?, ?, ?, ?, 'IDR', 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(
      orderId,
      orderNumber,
      userId,
      totalCents,
      payment_method,
      email,
      tvUsername || null,
      totalIdr,
      subtotalIdr,
      bundle_type || null,
      bundleDiscountIdr,
      totalSavingsIdr,
      LICENSE_CONFIG.version,
      licenseAgreedAt,
      accessToken,
      accessTokenHash,
      customer_name || 'Trader'
    );

    // Create Order Items with IDR prices and version
    const insertItem = db.prepare(`
      INSERT INTO order_items (
        id, order_id, product_id, product_title, product_type, unit_price_cents,
        product_version, normal_price_idr, effective_price_idr
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of itemsToInsert) {
      insertItem.run(
        'oi_' + crypto.randomUUID().slice(0, 12),
        orderId,
        item.id,
        item.title,
        item.type,
        item.unit_price_cents,
        item.version,
        item.normal_price_idr,
        item.effective_price_idr
      );
    }

    // Create Payment Record
    const paymentId = 'pay_' + crypto.randomUUID().slice(0, 12);
    db.prepare(`
      INSERT INTO payments (id, order_id, method, amount_cents, currency, status)
      VALUES (?, ?, ?, ?, 'IDR', 'awaiting_payment')
    `).run(paymentId, orderId, payment_method, totalIdr);

    res.status(201).json({
      success: true,
      order: {
        id: orderId,
        order_number: orderNumber,
        access_token: accessToken,
        total_cents: totalCents,
        total_idr: totalIdr,
        subtotal_idr: subtotalIdr,
        bundle_type: bundle_type || null,
        bundle_discount_idr: bundleDiscountIdr,
        total_savings_idr: totalSavingsIdr,
        currency: 'IDR',
        status: 'pending',
        payment_method,
        customer_email: email,
        license_version: LICENSE_CONFIG.version,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST request magic retrieval token for order history
orderRoutes.post('/retrieve', (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !String(email).trim()) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const orders = db.prepare('SELECT id FROM orders WHERE LOWER(customer_email) = ?').all(cleanEmail);

    // Generate high-entropy token regardless of whether orders exist (prevent user enumeration timing attacks)
    const token = 'ret_' + crypto.randomBytes(24).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    if (orders.length > 0) {
      db.prepare(`
        INSERT INTO order_retrieval_tokens (id, email, token_hash, expires_at, used)
        VALUES (?, ?, ?, ?, 0)
      `).run('ort_' + crypto.randomUUID().slice(0, 12), cleanEmail, tokenHash, expiresAt);
    }

    // In production this sends an email. In our API, we return success and the token for client handling.
    res.json({
      success: true,
      message: 'Jika email terdaftar, tautan pemulihan pesanan telah dikirim.',
      token,
      order_count: orders.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET orders via magic retrieval token
orderRoutes.get('/retrieve/:token', (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token is required' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const retRecord = db.prepare(`
      SELECT * FROM order_retrieval_tokens
      WHERE token_hash = ? AND used = 0 AND expires_at > datetime('now')
    `).get(tokenHash) as any;

    if (!retRecord) {
      return res.status(404).json({ success: false, error: 'Tautan pemulihan tidak valid atau sudah kedaluwarsa' });
    }

    const orders = db.prepare(`
      SELECT o.*, p.status as payment_status
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE LOWER(o.customer_email) = ?
      ORDER BY o.created_at DESC
    `).all(retRecord.email.toLowerCase()) as any[];

    const formatted = orders.map((o) => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
      return { ...o, items };
    });

    res.json({
      success: true,
      email: retRecord.email,
      orders: formatted,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET order by ID or order number (requires token or user auth)
orderRoutes.get('/:idOrNumber', (req: AuthRequest, res) => {
  try {
    const { idOrNumber } = req.params;
    const order = db.prepare(`
      SELECT * FROM orders WHERE id = ? OR order_number = ?
    `).get(idOrNumber, idOrNumber) as any;

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Check authorization:
    // 1. Admin or order owner logged in via JWT
    const isOwnerAuth = req.user && (req.user.role === 'admin' || req.user.id === order.user_id);

    // 2. Guest access token validation
    const queryToken = (req.query.token as string) || (req.headers['x-order-token'] as string);
    const isValidToken = queryToken && (
      queryToken === order.access_token ||
      (order.access_token_hash && crypto.createHash('sha256').update(queryToken).digest('hex') === order.access_token_hash)
    );

    if (!isOwnerAuth && !isValidToken) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Valid order access token is required to view order details.',
      });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    const payment = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(order.id);

    res.json({
      success: true,
      order: {
        ...order,
        items,
        payment,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET user orders (authenticated)
orderRoutes.get('/', requireAuth, (req: AuthRequest, res) => {
  try {
    const orders = db.prepare(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.user!.id) as any[];

    const formatted = orders.map((o) => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
      const payment = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(o.id);
      return { ...o, items, payment };
    });

    res.json({ success: true, orders: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Upload bank receipt / payment proof
orderRoutes.post('/:id/receipt', uploadReceipt.single('receipt'), (req, res) => {
  try {
    const { id } = req.params;
    const { notes, txid } = req.body;

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    let proofData = '';
    if (req.file) {
      proofData = `/storage/receipts/${req.file.filename}`;
    } else if (txid) {
      proofData = `TXID: ${txid}`;
    } else if (notes) {
      proofData = `Notes: ${notes}`;
    }

    // Update payment record to under_review
    db.prepare(`
      UPDATE payments 
      SET status = 'under_review', proof_data = ?
      WHERE order_id = ?
    `).run(proofData, id);

    // Update order status to verifying
    db.prepare(`
      UPDATE orders
      SET status = 'verifying', updated_at = datetime('now')
      WHERE id = ?
    `).run(id);

    res.json({
      success: true,
      message: 'Proof of payment submitted successfully. Our team will verify and activate your access shortly.',
      proofData,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
