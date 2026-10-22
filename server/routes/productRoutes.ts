import { Router } from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { db } from '../db.ts';
import { requireAdmin, type AuthRequest } from '../auth.ts';

export const productRoutes = Router();

// GET all published products (public)
productRoutes.get('/', (req, res) => {
  try {
    const { category, type, search } = req.query;
    
    let query = 'SELECT * FROM products WHERE is_published = 1';
    const params: any[] = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(String(category));
    }

    if (type && type !== 'all') {
      query += ' AND type = ?';
      params.push(String(type));
    }

    if (search) {
      query += ' AND (title LIKE ? OR short_desc LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const products = db.prepare(query).all(...params) as any[];

    // Parse JSON fields
    const formatted = products.map((p) => {
      let includedProducts: any[] = [];
      if (p.type === 'bundle') {
        const bundleItems = db.prepare(`
          SELECT p.id, p.title, p.type, p.price_cents, p.thumbnail_url
          FROM bundle_items bi
          JOIN products p ON bi.product_id = p.id
          WHERE bi.bundle_id = ?
        `).all(p.id);
        includedProducts = bundleItems;
      }

      return {
        ...p,
        features: JSON.parse(p.features_json || '[]'),
        preview_images: JSON.parse(p.preview_images_json || '[]'),
        included_products: includedProducts,
      };
    });

    res.json({ success: true, products: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single product by slug (public)
productRoutes.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const product = db.prepare('SELECT * FROM products WHERE slug = ?').get(slug) as any;

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    let includedProducts: any[] = [];
    if (product.type === 'bundle') {
      const items = db.prepare(`
        SELECT p.id, p.slug, p.title, p.type, p.price_cents, p.thumbnail_url, p.short_desc
        FROM bundle_items bi
        JOIN products p ON bi.product_id = p.id
        WHERE bi.bundle_id = ?
      `).all(product.id);
      includedProducts = items;
    }

    const versions = db.prepare(`
      SELECT id, version_number, changelog, created_at
      FROM product_versions
      WHERE product_id = ?
      ORDER BY created_at DESC
    `).all(product.id);

    res.json({
      success: true,
      product: {
        ...product,
        features: JSON.parse(product.features_json || '[]'),
        preview_images: JSON.parse(product.preview_images_json || '[]'),
        included_products: includedProducts,
        versions,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Create product
productRoutes.post('/', requireAdmin, (req: AuthRequest, res) => {
  try {
    const {
      title,
      slug,
      short_desc,
      long_desc,
      type,
      category,
      price_cents,
      discount_cents = 0,
      version = '1.0.0',
      features = [],
      tradingview_script_id,
      thumbnail_url,
      preview_images = [],
      included_product_ids = [],
      initial_pine_code,
    } = req.body;

    if (!title || !slug || !price_cents || !type || !category) {
      return res.status(400).json({ success: false, error: 'Missing required product fields' });
    }

    const productId = 'prd_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);

    db.prepare(`
      INSERT INTO products (
        id, slug, title, short_desc, long_desc, type, category, price_cents,
        discount_cents, version, features_json, tradingview_script_id, is_published,
        thumbnail_url, preview_images_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(
      productId,
      slug,
      title,
      short_desc,
      long_desc,
      type,
      category,
      Number(price_cents),
      Number(discount_cents),
      version,
      JSON.stringify(features),
      tradingview_script_id || null,
      thumbnail_url || 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80',
      JSON.stringify(preview_images)
    );

    // If bundle, link items
    if (type === 'bundle' && Array.isArray(included_product_ids)) {
      const insertBi = db.prepare('INSERT INTO bundle_items (id, bundle_id, product_id) VALUES (?, ?, ?)');
      for (const pId of included_product_ids) {
        insertBi.run('bi_' + crypto.randomUUID().slice(0, 12), productId, pId);
      }
    }

    // If initial pine code provided for open source script, create version and file
    if (type === 'open_source' && initial_pine_code) {
      const storageDir = path.resolve('server/storage/protected_scripts');
      const filename = `${slug}_v${version.replace(/\./g, '_')}.pine`;
      const filePath = path.join(storageDir, filename);
      fs.writeFileSync(filePath, initial_pine_code, 'utf8');

      db.prepare(`
        INSERT INTO product_versions (id, product_id, version_number, changelog, source_file_path, pine_script_content)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run('ver_' + crypto.randomUUID().slice(0, 12), productId, version, 'Initial Release', filePath, initial_pine_code);
    }

    // Log action in audit logs
    db.prepare(`
      INSERT INTO audit_logs (id, admin_user_id, action, target_entity, target_id, details_json)
      VALUES (?, ?, 'CREATE_PRODUCT', 'products', ?, ?)
    `).run('aud_' + crypto.randomUUID().slice(0, 12), req.user!.id, productId, JSON.stringify({ title, type, price_cents }));

    res.status(201).json({ success: true, productId });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
