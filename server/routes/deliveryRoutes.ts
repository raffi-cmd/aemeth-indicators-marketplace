import { Router } from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { db } from '../db.ts';
import { requireAuth, type AuthRequest } from '../auth.ts';

export const deliveryRoutes = Router();

// Helper to authenticate access to an order/delivery via JWT OR Order Access Token
function isAuthorizedForOrder(req: AuthRequest, order: any): boolean {
  if (!order) return false;

  // 1. Authenticated user (admin or owner)
  if (req.user && (req.user.role === 'admin' || req.user.id === order.user_id)) {
    return true;
  }

  // 2. Token authentication (query param, header, or body)
  const token = (req.query.token as string) || 
                (req.headers['x-order-token'] as string) || 
                (req.body && req.body.token);

  if (!token || typeof token !== 'string') return false;

  if (order.access_token && token === order.access_token) {
    return true;
  }

  if (order.access_token_hash) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    if (hash === order.access_token_hash) return true;
  }

  return false;
}

// Helper to fetch Pine Script content for a product
function getProductPineScript(productId: string): { content: string; version: string } {
  const version = db.prepare(`
    SELECT pine_script_content, version_number, source_file_path
    FROM product_versions
    WHERE product_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `).get(productId) as any;

  let content = version?.pine_script_content;

  if (!content && version?.source_file_path && fs.existsSync(version.source_file_path)) {
    content = fs.readFileSync(version.source_file_path, 'utf8');
  }

  return {
    content: content || '',
    version: version?.version_number || '1.0.0',
  };
}

// GET all deliveries for authenticated user
deliveryRoutes.get('/my-deliveries', requireAuth, (req: AuthRequest, res) => {
  try {
    const deliveries = db.prepare(`
      SELECT 
        d.*,
        p.title as product_title,
        p.slug as product_slug,
        p.type as product_type,
        p.version as product_version,
        p.thumbnail_url,
        o.order_number,
        o.status as order_status,
        o.is_revoked as order_is_revoked
      FROM deliveries d
      JOIN products p ON d.product_id = p.id
      JOIN orders o ON d.order_id = o.id
      WHERE d.user_id = ?
      ORDER BY d.created_at DESC
    `).all(req.user!.id) as any[];

    const formatted = deliveries.map((d) => ({
      ...d,
      has_source_code: d.order_status === 'paid' && d.order_is_revoked !== 1,
    }));

    res.json({ success: true, deliveries: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET source code by order number and product ID (Supports Guest Token Authentication)
deliveryRoutes.get('/order/:orderNumber/source/:productId', (req: AuthRequest, res) => {
  try {
    const { orderNumber, productId } = req.params;

    const order = db.prepare('SELECT * FROM orders WHERE order_number = ? OR id = ?').get(orderNumber, orderNumber) as any;
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (!isAuthorizedForOrder(req, order)) {
      return res.status(403).json({ success: false, error: 'Access denied: Valid order access token is required.' });
    }

    if (order.is_revoked === 1 || order.status === 'refunded' || order.status === 'cancelled') {
      return res.status(403).json({ success: false, error: 'Access revoked: This order has been cancelled or refunded.' });
    }

    if (order.status !== 'paid') {
      return res.status(403).json({
        success: false,
        error: 'Order is not verified paid. Source code cannot be released until payment settlement is confirmed.',
      });
    }

    // Check if product is in order items OR in bundle
    const product = db.prepare('SELECT * FROM products WHERE id = ? OR slug = ?').get(productId, productId) as any;
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const orderItem = db.prepare('SELECT * FROM order_items WHERE order_id = ? AND product_id = ?').get(order.id, product.id) as any;
    let isItemInBundle = false;

    if (!orderItem) {
      // Check if order has a bundle containing this product
      const bundleItem = db.prepare(`
        SELECT oi.id FROM order_items oi
        JOIN bundle_items bi ON oi.product_id = bi.bundle_id
        WHERE oi.order_id = ? AND bi.product_id = ?
      `).get(order.id, product.id);

      // Or check bundle_type in orders
      if (order.bundle_type) {
        // If Starter, Pro, or Ultimate, check if product is part of this order's deliveries
        const delivery = db.prepare('SELECT id FROM deliveries WHERE order_id = ? AND product_id = ?').get(order.id, product.id);
        if (delivery) isItemInBundle = true;
      }

      if (!bundleItem && !isItemInBundle) {
        return res.status(403).json({ success: false, error: 'Product not included in this order' });
      }
    }

    const { content, version } = getProductPineScript(product.id);

    if (!content) {
      return res.status(404).json({ success: false, error: 'Source code not available for this product version' });
    }

    // Add personal license watermark header
    const watermarked = `// ==========================================================================\n// AEMETH TRADER ANALYSIS — OFFICIAL PRODUCT DELIVERY\n// Script: ${product.title} (v${version})\n// Licensed to: ${order.customer_email}\n// Order Reference: ${order.order_number}\n// License Type: Single-User Personal License (Do Not Redistribute)\n// ==========================================================================\n\n` + content;

    res.json({
      success: true,
      product_id: product.id,
      product_title: product.title,
      product_slug: product.slug,
      version,
      filename: `${product.slug}_v${version}.pine`,
      pine_script_content: watermarked,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET all source codes in a bundle order
deliveryRoutes.get('/order/:orderNumber/bundle-source', (req: AuthRequest, res) => {
  try {
    const { orderNumber } = req.params;

    const order = db.prepare('SELECT * FROM orders WHERE order_number = ? OR id = ?').get(orderNumber, orderNumber) as any;
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (!isAuthorizedForOrder(req, order)) {
      return res.status(403).json({ success: false, error: 'Access denied: Valid order access token is required.' });
    }

    if (order.is_revoked === 1 || order.status === 'refunded' || order.status === 'cancelled') {
      return res.status(403).json({ success: false, error: 'Access revoked: This order has been cancelled or refunded.' });
    }

    if (order.status !== 'paid') {
      return res.status(403).json({
        success: false,
        error: 'Order is not verified paid. Source code cannot be released until payment settlement is confirmed.',
      });
    }

    // Get all products provisioned in deliveries for this order
    const deliveries = db.prepare(`
      SELECT d.*, p.title as product_title, p.slug as product_slug, p.version as product_version
      FROM deliveries d
      JOIN products p ON d.product_id = p.id
      WHERE d.order_id = ?
    `).all(order.id) as any[];

    if (deliveries.length === 0) {
      // Fallback: check order_items
      const items = db.prepare(`
        SELECT oi.*, p.title as product_title, p.slug as product_slug, p.version as product_version
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).all(order.id) as any[];

      deliveries.push(...items.map((i) => ({ ...i, product_id: i.product_id })));
    }

    const scripts = deliveries.map((del) => {
      const { content, version } = getProductPineScript(del.product_id);
      const watermarked = `// ==========================================================================\n// AEMETH TRADER ANALYSIS — OFFICIAL PRODUCT DELIVERY\n// Script: ${del.product_title} (v${version})\n// Licensed to: ${order.customer_email}\n// Order Reference: ${order.order_number}\n// License Type: Single-User Personal License (Do Not Redistribute)\n// ==========================================================================\n\n` + content;

      return {
        product_id: del.product_id,
        product_title: del.product_title,
        product_slug: del.product_slug,
        version,
        filename: `${del.product_slug}_v${version}.pine`,
        pine_script_content: watermarked,
      };
    });

    // Generate combined bundle text with clear dividers
    const combinedSource = scripts.map((s, idx) => {
      return `// ##########################################################################\n// [SCRIPT ${idx + 1} OF ${scripts.length}]: ${s.product_title.toUpperCase()}\n// ##########################################################################\n\n${s.pine_script_content}\n\n`;
    }).join('\n');

    res.json({
      success: true,
      order_number: order.order_number,
      customer_email: order.customer_email,
      bundle_type: order.bundle_type,
      total_scripts: scripts.length,
      scripts,
      combined_source: combinedSource,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET secure Pine Script source code for copy/viewing by delivery ID
deliveryRoutes.get('/:id/source', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const delivery = db.prepare(`
      SELECT d.*, o.order_number, o.status as order_status, o.access_token, o.access_token_hash, 
             o.is_revoked as order_is_revoked, o.customer_email, o.user_id as order_user_id,
             p.title as product_title, p.slug as product_slug, p.type as product_type, p.version as product_version
      FROM deliveries d
      JOIN orders o ON d.order_id = o.id
      JOIN products p ON d.product_id = p.id
      WHERE d.id = ?
    `).get(id) as any;

    if (!delivery) {
      return res.status(404).json({ success: false, error: 'Delivery record not found' });
    }

    const orderObj = {
      user_id: delivery.order_user_id,
      access_token: delivery.access_token,
      access_token_hash: delivery.access_token_hash,
    };

    if (!isAuthorizedForOrder(req, orderObj)) {
      return res.status(403).json({ success: false, error: 'Unauthorized: Access to this delivery is restricted.' });
    }

    if (delivery.order_is_revoked === 1 || delivery.order_status === 'refunded' || delivery.order_status === 'cancelled') {
      return res.status(403).json({ success: false, error: 'Access revoked: Order has been cancelled or refunded.' });
    }

    if (delivery.order_status !== 'paid') {
      return res.status(403).json({
        success: false,
        error: 'Order is not verified paid. Source code cannot be released until payment settlement is confirmed.',
      });
    }

    const { content, version } = getProductPineScript(delivery.product_id);
    const watermarkedContent = `// ==========================================================================\n// AEMETH TRADER ANALYSIS — OFFICIAL PRODUCT DELIVERY\n// Script: ${delivery.product_title} (v${version})\n// Licensed to: ${delivery.customer_email}\n// Order Reference: ${delivery.order_number}\n// License Type: Single-User Personal License (Do Not Redistribute)\n// ==========================================================================\n\n` + content;

    res.json({
      success: true,
      product_title: delivery.product_title,
      version,
      filename: `${delivery.product_slug}_v${version}.pine`,
      pine_script_content: watermarkedContent,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET download .pine or .txt file as attachment
deliveryRoutes.get('/:id/download', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const format = (req.query.format as string) === 'txt' ? 'txt' : 'pine';

    const delivery = db.prepare(`
      SELECT d.*, o.order_number, o.status as order_status, o.access_token, o.access_token_hash,
             o.is_revoked as order_is_revoked, o.customer_email, o.user_id as order_user_id,
             p.title as product_title, p.slug as product_slug, p.version as product_version
      FROM deliveries d
      JOIN orders o ON d.order_id = o.id
      JOIN products p ON d.product_id = p.id
      WHERE d.id = ?
    `).get(id) as any;

    if (!delivery) {
      return res.status(404).json({ success: false, error: 'Delivery record not found' });
    }

    const orderObj = {
      user_id: delivery.order_user_id,
      access_token: delivery.access_token,
      access_token_hash: delivery.access_token_hash,
    };

    if (!isAuthorizedForOrder(req, orderObj)) {
      return res.status(403).json({ success: false, error: 'Unauthorized: Access to this product is restricted.' });
    }

    if (delivery.order_is_revoked === 1 || delivery.order_status !== 'paid') {
      return res.status(403).json({ success: false, error: 'Payment not verified or access revoked.' });
    }

    const { content, version } = getProductPineScript(delivery.product_id);
    const filename = `${delivery.product_slug}_v${version}.${format}`;

    // Log download event
    const logId = 'log_' + crypto.randomUUID().slice(0, 12);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userId = req.user?.id || delivery.order_user_id;

    db.prepare(`
      INSERT INTO download_logs (id, delivery_id, user_id, ip_address)
      VALUES (?, ?, ?, ?)
    `).run(logId, delivery.id, userId, String(ip));

    const watermarkedContent = `// ==========================================================================\n// AEMETH TRADER ANALYSIS — OFFICIAL PRODUCT DELIVERY\n// Script: ${delivery.product_title} (v${version})\n// Licensed to: ${delivery.customer_email}\n// Order Reference: ${delivery.order_number}\n// License Type: Single-User Personal License (Do Not Redistribute)\n// ==========================================================================\n\n` + content;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(watermarkedContent);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
