import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { db } from './db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'aemeth_trader_secure_secret_key_2026_x89f_precision';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin';
  exp: number;
}

// Lightweight, secure JWT implementation using Node.js crypto
export function signToken(payload: Omit<TokenPayload, 'exp'>, expiresInHours = 72): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const fullPayload: TokenPayload = { ...payload, exp };
  
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    
    if (signature !== expectedSig) return null;
    
    const payload: TokenPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    
    return payload;
  } catch {
    return null;
  }
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'customer' | 'admin';
    name?: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // optional auth (continue without req.user)
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (payload) {
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  }
  next();
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Administrator access required' });
  }
  next();
}
