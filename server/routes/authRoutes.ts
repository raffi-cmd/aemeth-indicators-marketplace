import { Router } from 'express';
import crypto from 'node:crypto';
import { db, hashPassword, verifyPassword } from '../db.ts';
import { signToken, requireAuth, type AuthRequest } from '../auth.ts';

export const authRoutes = Router();

// Register new customer
authRoutes.post('/register', (req, res) => {
  try {
    const { email, password, name, tradingview_username } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email is already registered' });
    }

    const userId = 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const passwordHash = hashPassword(password);
    const cleanTvUser = tradingview_username ? String(tradingview_username).trim() : null;

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, tradingview_username)
      VALUES (?, ?, ?, ?, 'customer', ?)
    `).run(userId, cleanEmail, passwordHash, name.trim(), cleanTvUser);

    const token = signToken({ userId, email: cleanEmail, role: 'customer' });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        email: cleanEmail,
        name: name.trim(),
        role: 'customer',
        tradingview_username: cleanTvUser,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login
authRoutes.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail) as any;

    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tradingview_username: user.tradingview_username,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get current authenticated user
authRoutes.get('/me', requireAuth, (req: AuthRequest, res) => {
  try {
    const user = db.prepare('SELECT id, email, name, role, tradingview_username, created_at FROM users WHERE id = ?').get(req.user!.id) as any;
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update profile / TradingView username
authRoutes.put('/profile', requireAuth, (req: AuthRequest, res) => {
  try {
    const { name, tradingview_username } = req.body;
    const cleanTvUser = tradingview_username !== undefined ? String(tradingview_username).trim() : null;

    db.prepare(`
      UPDATE users 
      SET name = COALESCE(?, name), tradingview_username = COALESCE(?, tradingview_username)
      WHERE id = ?
    `).run(name || null, cleanTvUser, req.user!.id);

    // If TV username updated, also update any deliveries waiting for tv_username
    if (cleanTvUser) {
      db.prepare(`
        UPDATE deliveries
        SET tv_username = ?, status = 'access_requested'
        WHERE user_id = ? AND status = 'awaiting_tv_username'
      `).run(cleanTvUser, req.user!.id);
    }

    const updated = db.prepare('SELECT id, email, name, role, tradingview_username FROM users WHERE id = ?').get(req.user!.id) as any;
    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
