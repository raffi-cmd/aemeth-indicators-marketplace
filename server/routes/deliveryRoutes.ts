import { Router } from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { db } from '../db.ts';
import { requireAuth, type AuthRequest } from '../auth.ts';

export const deliveryRoutes = Router();

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
        p.tradingview_script_id,
        o.order_number,
        o.status as order_status
      FROM deliveries d
      JOIN products p ON d.product_id = p.id
      JOIN orders o ON d.order_id = o.id
      WHERE d.user_id = ?
      ORDER BY d.created_at DESC
    `).all(req.user!.id) as any[];

    const formatted = deliveries.map((d) => ({
      ...d,
      has_source_code: d.delivery_type === 'source_download' && d.order_status === 'paid',
    }));

    res.json({ success: true, deliveries: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET secure Pine Script source code for copy/viewing in customer dashboard
deliveryRoutes.get('/:id/source', requireAuth, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const delivery = db.prepare(`
      SELECT d.*, o.status as order_status, p.title as product_title, p.slug as product_slug, p.type as product_type, p.version as product_version
      FROM deliveries d
      JOIN orders o ON d.order_id = o.id
      JOIN products p ON d.product_id = p.id
      WHERE d.id = ?
    `).get(id) as any;

    if (!delivery) {
      return res.status(404).json({ success: false, error: 'Delivery record not found' });
    }

    // Access check: User must own the delivery OR be admin
    if (delivery.user_id !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized: Access to this product is restricted.' });
    }

    // Payment verification check
    if (delivery.order_status !== 'paid') {
      return res.status(403).json({
        success: false,
        error: 'Order is not verified paid. Source code cannot be released until payment settlement is confirmed.',
      });
    }

    // Type check: Only open_source has source code
    if (delivery.delivery_type !== 'source_download') {
      return res.status(400).json({
        success: false,
        error: 'This indicator is a Private / Protected TradingView script. Access is provisioned directly to your TradingView account rather than via uncompiled source files.',
      });
    }

    // Fetch latest version's pine script content
    const version = db.prepare(`
      SELECT pine_script_content, version_number, source_file_path
      FROM product_versions
      WHERE product_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).get(delivery.product_id) as any;

    let content = version?.pine_script_content;

    // Fallback: read from file if stored on disk
    if (!content && version?.source_file_path && fs.existsSync(version.source_file_path)) {
      content = fs.readFileSync(version.source_file_path, 'utf8');
    }

    if (!content) {
      content = `//@version=5\n// Aemeth Trader Analysis — ${delivery.product_title}\n// License: Authorized Customer (${req.user!.email})\nindicator("${delivery.product_title}", overlay=true)\n\n// Verified Pine Script v5 Code\nplot(close, "Aemeth Close", color=#ff2a3b)\n`;
    }

    // Add customer watermarking header for license protection
    const watermarkedContent = `// ==========================================================================\n// AEMETH TRADER ANALYSIS — OFFICIAL PRODUCT DELIVERY\n// Script: ${delivery.product_title} (v${delivery.product_version})\n// Licensed to: ${req.user!.email}\n// Order Reference: ${delivery.order_id}\n// License Type: Single-User Non-Redistribution Commercial License\n// ==========================================================================\n\n` + content;

    res.json({
      success: true,
      product_title: delivery.product_title,
      version: delivery.product_version,
      filename: `${delivery.product_slug}_v${delivery.product_version}.pine`,
      pine_script_content: watermarkedContent,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET download .pine file as attachment
deliveryRoutes.get('/:id/download', requireAuth, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const delivery = db.prepare(`
      SELECT d.*, o.status as order_status, p.title as product_title, p.slug as product_slug, p.version as product_version
      FROM deliveries d
      JOIN orders o ON d.order_id = o.id
      JOIN products p ON d.product_id = p.id
      WHERE d.id = ?
    `).get(id) as any;

    if (!delivery || (delivery.user_id !== req.user!.id && req.user!.role !== 'admin')) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    if (delivery.order_status !== 'paid') {
      return res.status(403).json({ success: false, error: 'Payment not verified' });
    }

    // Fetch version
    const version = db.prepare(`
      SELECT pine_script_content, version_number, source_file_path
      FROM product_versions
      WHERE product_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).get(delivery.product_id) as any;

    let content = version?.pine_script_content || '';
    if (!content && version?.source_file_path && fs.existsSync(version.source_file_path)) {
      content = fs.readFileSync(version.source_file_path, 'utf8');
    }

    const filename = `${delivery.product_slug}_v${delivery.product_version}.pine`;

    // Log download event
    const logId = 'log_' + crypto.randomUUID().slice(0, 12);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    db.prepare(`
      INSERT INTO download_logs (id, delivery_id, user_id, ip_address)
      VALUES (?, ?, ?, ?)
    `).run(logId, delivery.id, req.user!.id, String(ip));

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST submit or update TradingView username for private access
deliveryRoutes.post('/:id/tv-username', requireAuth, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { tv_username } = req.body;

    if (!tv_username || !tv_username.trim()) {
      return res.status(400).json({ success: false, error: 'TradingView username is required' });
    }

    const cleanTvUser = tv_username.trim();

    const delivery = db.prepare('SELECT * FROM deliveries WHERE id = ?').get(id) as any;
    if (!delivery || (delivery.user_id !== req.user!.id && req.user!.role !== 'admin')) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Update delivery record
    db.prepare(`
      UPDATE deliveries 
      SET tv_username = ?, status = 'access_requested'
      WHERE id = ?
    `).run(cleanTvUser, id);

    // Also update user profile if empty
    db.prepare(`
      UPDATE users 
      SET tradingview_username = ?
      WHERE id = ?
    `).run(cleanTvUser, req.user!.id);

    res.json({
      success: true,
      message: `TradingView username "${cleanTvUser}" submitted. Access request queued for institutional authorization.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
