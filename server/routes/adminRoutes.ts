import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.ts';
import { requireAdmin, type AuthRequest } from '../auth.ts';
import { fulfillOrder } from './orderRoutes.ts';

export const adminRoutes = Router();

// Enforce admin role for all admin routes
adminRoutes.use(requireAdmin);

// Dashboard telemetry & metrics
adminRoutes.get('/metrics', (_req, res) => {
  try {
    // Total verified revenue in USD (ONLY completed payments)
    const revRow = db.prepare(`
      SELECT SUM(amount_cents) as total_cents
      FROM payments
      WHERE status = 'completed'
    `).get() as any;

    const totalRevenueCents = revRow?.total_cents || 0;

    // Counts by order status
    const ordersByStatus = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `).all() as any[];

    // Pending manual payment review count
    const pendingReviews = db.prepare(`
      SELECT COUNT(*) as count
      FROM payments
      WHERE status = 'under_review'
    `).get() as any;

    // Pending TradingView access requests count
    const pendingTvAccess = db.prepare(`
      SELECT COUNT(*) as count
      FROM deliveries
      WHERE delivery_type = 'tradingview_access' AND status = 'access_requested'
    `).get() as any;

    // Active deliveries count
    const totalDeliveries = db.prepare(`
      SELECT COUNT(*) as count FROM deliveries
    `).get() as any;

    // Recent 10 orders
    const recentOrders = db.prepare(`
      SELECT o.id, o.order_number, o.total_cents, o.currency, o.status, o.payment_method, o.customer_email, o.created_at, p.status as payment_status
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      ORDER BY o.created_at DESC
      LIMIT 10
    `).all();

    res.json({
      success: true,
      metrics: {
        totalRevenueUsd: (totalRevenueCents / 100).toFixed(2),
        totalRevenueCents,
        ordersByStatus,
        pendingReviewCount: pendingReviews?.count || 0,
        pendingTvAccessCount: pendingTvAccess?.count || 0,
        totalDeliveriesCount: totalDeliveries?.count || 0,
        recentOrders,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// View all orders (with filters)
adminRoutes.get('/orders', (req, res) => {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT o.*, p.status as payment_status, p.proof_data, p.provider_ref, p.reviewed_by, p.reviewed_at
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ' AND o.status = ?';
      params.push(String(status));
    }

    if (search) {
      query += ' AND (o.order_number LIKE ? OR o.customer_email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY o.created_at DESC';

    const orders = db.prepare(query).all(...params) as any[];

    const formatted = orders.map((o) => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
      return { ...o, items };
    });

    res.json({ success: true, orders: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Approve payment manually (Bank transfer / Crypto / P2P)
adminRoutes.post('/orders/:id/approve', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { admin_note } = req.body;

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Update payment record
    db.prepare(`
      UPDATE payments 
      SET status = 'completed', reviewed_by = ?, reviewed_at = datetime('now'),
          proof_data = COALESCE(proof_data, '') || ' | Approved by ' || ? || ': ' || COALESCE(?, 'Settlement Verified')
      WHERE order_id = ?
    `).run(req.user!.id, req.user!.email, admin_note || 'Approved', id);

    // Fulfill order & create deliveries
    fulfillOrder(id);

    // Record audit log
    db.prepare(`
      INSERT INTO audit_logs (id, admin_user_id, action, target_entity, target_id, details_json)
      VALUES (?, ?, 'APPROVE_PAYMENT', 'orders', ?, ?)
    `).run(
      'aud_' + crypto.randomUUID().slice(0, 12),
      req.user!.id,
      id,
      JSON.stringify({ order_number: order.order_number, total_cents: order.total_cents, note: admin_note })
    );

    res.json({ success: true, message: `Order ${order.order_number} approved and products provisioned!` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reject payment
adminRoutes.post('/orders/:id/reject', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    db.prepare(`
      UPDATE payments 
      SET status = 'rejected', reviewed_by = ?, reviewed_at = datetime('now'),
          proof_data = COALESCE(proof_data, '') || ' | Rejected: ' || COALESCE(?, 'Invalid payment proof')
      WHERE order_id = ?
    `).run(req.user!.id, reason || 'Invalid payment', id);

    db.prepare(`
      UPDATE orders 
      SET status = 'cancelled', updated_at = datetime('now')
      WHERE id = ?
    `).run(id);

    // Record audit log
    db.prepare(`
      INSERT INTO audit_logs (id, admin_user_id, action, target_entity, target_id, details_json)
      VALUES (?, ?, 'REJECT_PAYMENT', 'orders', ?, ?)
    `).run(
      'aud_' + crypto.randomUUID().slice(0, 12),
      req.user!.id,
      id,
      JSON.stringify({ order_number: order.order_number, reason })
    );

    res.json({ success: true, message: `Order ${order.order_number} marked as rejected.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET TradingView access requests
adminRoutes.get('/tv-access-requests', (_req, res) => {
  try {
    const requests = db.prepare(`
      SELECT 
        d.id as delivery_id,
        d.status,
        d.tv_username,
        d.access_granted_at,
        d.created_at,
        p.title as product_title,
        p.tradingview_script_id,
        o.order_number,
        o.customer_email,
        u.name as customer_name
      FROM deliveries d
      JOIN products p ON d.product_id = p.id
      JOIN orders o ON d.order_id = o.id
      JOIN users u ON d.user_id = u.id
      WHERE d.delivery_type = 'tradingview_access'
      ORDER BY 
        CASE d.status
          WHEN 'access_requested' THEN 1
          WHEN 'awaiting_tv_username' THEN 2
          WHEN 'access_granted' THEN 3
          ELSE 4
        END,
        d.created_at DESC
    `).all();

    res.json({ success: true, requests });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update TradingView access status (grant/reject/revoke)
adminRoutes.post('/tv-access/:deliveryId/action', (req: AuthRequest, res) => {
  try {
    const { deliveryId } = req.params;
    const { action, notes } = req.body; // 'grant', 'reject', 'revoke'

    let newStatus = 'access_granted';
    if (action === 'reject') newStatus = 'access_rejected';
    if (action === 'revoke') newStatus = 'awaiting_tv_username';

    const delivery = db.prepare('SELECT * FROM deliveries WHERE id = ?').get(deliveryId) as any;
    if (!delivery) {
      return res.status(404).json({ success: false, error: 'Delivery record not found' });
    }

    const grantedAt = action === 'grant' ? new Date().toISOString() : null;

    db.prepare(`
      UPDATE deliveries 
      SET status = ?, access_granted_at = COALESCE(?, access_granted_at)
      WHERE id = ?
    `).run(newStatus, grantedAt, deliveryId);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, admin_user_id, action, target_entity, target_id, details_json)
      VALUES (?, ?, 'TV_ACCESS_ACTION', 'deliveries', ?, ?)
    `).run(
      'aud_' + crypto.randomUUID().slice(0, 12),
      req.user!.id,
      deliveryId,
      JSON.stringify({ action, tv_username: delivery.tv_username, notes })
    );

    res.json({
      success: true,
      message: `TradingView access status updated to "${newStatus}" for ${delivery.tv_username || 'user'}.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Audit logs
adminRoutes.get('/audit-logs', (_req, res) => {
  try {
    const logs = db.prepare(`
      SELECT a.*, u.name as admin_name, u.email as admin_email
      FROM audit_logs a
      JOIN users u ON a.admin_user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `).all() as any[];

    const formatted = logs.map((l) => ({
      ...l,
      details: JSON.parse(l.details_json || '{}'),
    }));

    res.json({ success: true, logs: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Site settings
adminRoutes.get('/settings', (_req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM site_settings').all() as any[];
    const settings: Record<string, string> = {};
    for (const r of rows) settings[r.key] = r.value;
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRoutes.put('/settings', (req: AuthRequest, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, error: 'Settings object required' });
    }

    const updateStmt = db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');
    for (const [key, val] of Object.entries(settings)) {
      updateStmt.run(key, String(val));
    }

    db.prepare(`
      INSERT INTO audit_logs (id, admin_user_id, action, target_entity, target_id, details_json)
      VALUES (?, ?, 'UPDATE_SETTINGS', 'site_settings', 'global', ?)
    `).run('aud_' + crypto.randomUUID().slice(0, 12), req.user!.id, JSON.stringify(Object.keys(settings)));

    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
