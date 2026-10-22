import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { initDatabase } from './db.ts';
import { authMiddleware } from './auth.ts';
import { authRoutes } from './routes/authRoutes.ts';
import { productRoutes } from './routes/productRoutes.ts';
import { orderRoutes } from './routes/orderRoutes.ts';
import { paymentRoutes } from './routes/paymentRoutes.ts';
import { deliveryRoutes } from './routes/deliveryRoutes.ts';
import { adminRoutes } from './routes/adminRoutes.ts';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database & Seeds
initDatabase();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

// Static uploads (receipts for admin viewing)
app.use('/storage/receipts', express.static(path.resolve('server/storage/receipts')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Aemeth Trader Analysis — Indicator Marketplace API',
    timestamp: new Date().toISOString(),
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[AEMETH SERVER] Server listening on http://localhost:${PORT}`);
});
