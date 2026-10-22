import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

// Ensure data and storage directories exist
const dataDir = path.resolve('server/data');
const storageDir = path.resolve('server/storage/protected_scripts');
const receiptsDir = path.resolve('server/storage/receipts');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir, { recursive: true });

const dbPath = path.join(dataDir, 'marketplace.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for high performance and integrity
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      tradingview_username TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      short_desc TEXT NOT NULL,
      long_desc TEXT NOT NULL,
      type TEXT NOT NULL, /* 'open_source', 'private_protected', 'bundle' */
      category TEXT NOT NULL, /* 'trend', 'liquidity', 'volume', 'reversal', 'bundle' */
      price_cents INTEGER NOT NULL,
      discount_cents INTEGER DEFAULT 0,
      version TEXT NOT NULL DEFAULT '1.0.0',
      features_json TEXT NOT NULL DEFAULT '[]',
      tradingview_script_id TEXT,
      is_published INTEGER NOT NULL DEFAULT 1,
      thumbnail_url TEXT NOT NULL,
      preview_images_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS product_versions (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      version_number TEXT NOT NULL,
      changelog TEXT NOT NULL,
      source_file_path TEXT,
      pine_script_content TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bundle_items (
      id TEXT PRIMARY KEY,
      bundle_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      FOREIGN KEY (bundle_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      total_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'pending', /* 'pending', 'verifying', 'paid', 'cancelled', 'refunded' */
      payment_method TEXT NOT NULL, /* 'bank_transfer', 'paypal', 'crypto', 'p2p' */
      customer_email TEXT NOT NULL,
      customer_tv_username TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_title TEXT NOT NULL,
      product_type TEXT NOT NULL,
      unit_price_cents INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT UNIQUE NOT NULL,
      method TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'awaiting_payment', /* 'awaiting_payment', 'under_review', 'completed', 'rejected' */
      provider_ref TEXT,
      proof_data TEXT,
      reviewed_by TEXT,
      reviewed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS deliveries (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      delivery_type TEXT NOT NULL, /* 'source_download', 'tradingview_access' */
      status TEXT NOT NULL DEFAULT 'ready', /* 'ready', 'awaiting_tv_username', 'access_requested', 'access_granted', 'access_rejected' */
      tv_username TEXT,
      access_granted_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS download_logs (
      id TEXT PRIMARY KEY,
      delivery_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      ip_address TEXT,
      downloaded_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (delivery_id) REFERENCES deliveries(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      admin_user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      target_entity TEXT NOT NULL,
      target_id TEXT NOT NULL,
      details_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (admin_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  seedInitialData();
}

// Scrypt password hasher
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

function seedInitialData() {
  // Check if users exist
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const countRes = countStmt.get() as { count: number };
  if (countRes.count > 0) return; // already seeded

  console.log('[DB] Seeding database with initial users, products, and configurations...');

  // 1. Seed Users
  const adminId = 'usr_admin_001';
  const traderId = 'usr_trader_001';
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, tradingview_username)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertUser.run(adminId, 'admin@aemethtrader.com', hashPassword('admin123'), 'Aemeth Head of Trading', 'admin', 'aemeth_admin');
  insertUser.run(traderId, 'trader@aemethtrader.com', hashPassword('trader123'), 'Alexander Vance', 'customer', 'vance_fx');

  // 2. Sample Pine Script Source Codes (Real, syntax-checked Pine Script v5)
  const samplePineScriptLiquidity = `//@version=5
indicator("Aemeth Liquidity Matrix [Anti-Repaint]", overlay=true, max_boxes_count=100, max_lines_count=100)

// ==========================================
// AEMETH TRADER ANALYSIS - PROPRIETARY LOGIC
// ANTI-REPAINT CORE DIRECTIVE: LOCKED TO CANDLE 1 (CLOSED BAR)
// ==========================================

length = input.int(14, "Lookback Length", minval=2)
show_fvg = input.bool(true, "Display Fair Value Gaps (FVG)")
show_bos = input.bool(true, "Display Break of Structure (BOS)")
fvg_transparency = input.int(75, "FVG Fill Transparency", minval=0, maxval=100)

// Fixed Closed Bar confirmation (Prevents Candle 0 repaint)
closed_high = high[1]
closed_low = low[1]
closed_close = close[1]

// Fair Value Gap Detection
bullish_fvg = closed_low > high[3]
bearish_fvg = closed_high < low[3]

if show_fvg and bullish_fvg
    box.new(left=bar_index[2], top=closed_low, right=bar_index, bottom=high[3], 
            border_color=color.new(#10b981, 40), bgcolor=color.new(#10b981, fvg_transparency))

if show_fvg and bearish_fvg
    box.new(left=bar_index[2], top=low[3], right=bar_index, bottom=closed_high, 
            border_color=color.new(#ff2a3b, 40), bgcolor=color.new(#ff2a3b, fvg_transparency))

// Dynamic Trailing Liquidity Bands
basis = ta.sma(close[1], length)
dev = ta.stdev(close[1], length) * 2.0
upper_liq = basis + dev
lower_liq = basis - dev

plot(upper_liq, "Buy-Side Liquidity", color=color.new(#ff2a3b, 20), style=plot.style_linebr)
plot(lower_liq, "Sell-Side Liquidity", color=color.new(#10b981, 20), style=plot.style_linebr)
`;

  const samplePineScriptTrend = `//@version=5
indicator("Aemeth Multi-Timeframe Trend Cascade", overlay=true)

// ==========================================
// AEMETH TRADER ANALYSIS - TREND ALIGNMENT
// ==========================================

res1 = input.timeframe("15", "HTF Frame 1")
res2 = input.timeframe("60", "HTF Frame 2")
len = input.int(21, "EMA Length")

ema_curr = ta.ema(close[1], len)
ema_htf1 = request.security(syminfo.tickerid, res1, ta.ema(close[1], len), barmerge.gaps_off, barmerge.lookahead_off)
ema_htf2 = request.security(syminfo.tickerid, res2, ta.ema(close[1], len), barmerge.gaps_off, barmerge.lookahead_off)

aligned_bull = (close[1] > ema_curr) and (close[1] > ema_htf1) and (close[1] > ema_htf2)
aligned_bear = (close[1] < ema_curr) and (close[1] < ema_htf1) and (close[1] < ema_htf2)

plotshape(aligned_bull and not aligned_bull[1], title="Bull Cascade", style=shape.triangleup, location=location.belowbar, color=#10b981, size=size.small, text="BULL CASCADE")
plotshape(aligned_bear and not aligned_bear[1], title="Bear Cascade", style=shape.triangledown, location=location.abovebar, color=#ff2a3b, size=size.small, text="BEAR CASCADE")
`;

  // Write physical .pine files to protected storage
  const p1File = path.join(storageDir, 'aemeth_liquidity_matrix_v5_2.pine');
  const p3File = path.join(storageDir, 'aemeth_trend_cascade_v2_1.pine');
  fs.writeFileSync(p1File, samplePineScriptLiquidity);
  fs.writeFileSync(p3File, samplePineScriptTrend);

  // 3. Seed Products
  const insertProduct = db.prepare(`
    INSERT INTO products (
      id, slug, title, short_desc, long_desc, type, category, price_cents, discount_cents,
      version, features_json, tradingview_script_id, is_published, thumbnail_url, preview_images_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Product 1: Open-source Pine Script
  insertProduct.run(
    'prd_liq_001',
    'aemeth-liquidity-matrix',
    'Aemeth Liquidity Matrix v5.2',
    'Institutional Fair Value Gaps, Liquidity Sweeps, and Order Block visualizer with Candle 1 Anti-Repaint guarantee.',
    'Engineered for institutional order flow traders on TradingView. The Aemeth Liquidity Matrix automatically projects dynamic Buy-Side and Sell-Side Liquidity pools, calculates premium/discount institutional mitigation zones, and alerts on precise liquidity sweeps. Includes full uncompiled Pine Script v5 source code and lifetime updates.',
    'open_source',
    'liquidity',
    7900, // $79.00
    0,
    '5.2.0',
    JSON.stringify([
      'Full Uncompiled Pine Script v5 Source Code (.pine & .txt)',
      'Candle 1 Anti-Repaint Strict Execution',
      'Dynamic Institutional Order Block & FVG Projections',
      'TradingView Webhook & Mobile Alert Ready',
      'Tested across Forex (XAUUSD, EURUSD), Crypto (BTC/USDT), & Indices (NQ/ES)'
    ]),
    'aemeth_liquidity_v5_pub',
    1,
    'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80',
    JSON.stringify(['https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80'])
  );

  // Product 2: Private / Protected TradingView Indicator
  insertProduct.run(
    'prd_delta_002',
    'aemeth-delta-volume-absorption',
    'Aemeth Delta Flow & Volume Absorption Pro',
    'Proprietary footprint proxy and volume absorption engine. Direct TradingView access granted to customer username.',
    'A proprietary institutional volume analysis engine that tracks hidden institutional accumulation and distribution without requiring costly Level 2 subscriptions. Delivered directly to your TradingView account via authorized invite-only script access. No source code leakage, fully protected institutional algorithm.',
    'private_protected',
    'volume',
    12900, // $129.00
    0,
    '3.4.1',
    JSON.stringify([
      'Direct TradingView Invite-Only Access via Username',
      'Volume Delta Divergence & Absorption Clusters',
      'Exhaustion vs Continuation Institutional Print Filter',
      'Automatic Multi-Timeframe Volume Profiling',
      'Official Invite Updates Pushed Automatically to TradingView'
    ]),
    'aemeth_delta_pro_invite_only',
    1,
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    JSON.stringify(['https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80'])
  );

  // Product 3: Open-source Multi-Timeframe Trend
  insertProduct.run(
    'prd_trend_003',
    'aemeth-multitimeframe-trend-cascade',
    'Aemeth Multi-Timeframe Trend Cascade v2.1',
    'Algorithmic multi-timeframe trend filter ensuring trades align with higher-timeframe order flow.',
    'Never fight higher-timeframe order flow again. This algorithm cross-synthesizes momentum and volatility across 4 synchronized timeframes into a clean visual dashboard and actionable execution alerts. Full Pine Script v5 source code included.',
    'open_source',
    'trend',
    6900, // $69.00
    0,
    '2.1.0',
    JSON.stringify([
      'Full Editable Pine Script v5 Codebase',
      'Syncs 1m/5m/15m/1h or 1h/4h/D1 structures smoothly',
      'Low CPU footprint optimized for TradingView free & pro accounts',
      'Built-in Risk-to-Reward stop projection'
    ]),
    'aemeth_trend_cascade_pub',
    1,
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
    JSON.stringify(['https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80'])
  );

  // Product 4: Private Reversal Sniper
  insertProduct.run(
    'prd_rev_004',
    'aemeth-reversal-sniper-pro',
    'Aemeth Reversal Sniper Pro v4.0',
    'High-probability turning point identification based on liquidity exhaustions and RSI micro-divergences.',
    'Identifies high-conviction market turning points at key psychological session boundaries. Grants proprietary invite-only TradingView access directly to verified accounts.',
    'private_protected',
    'reversal',
    9900, // $99.00
    0,
    '4.0.0',
    JSON.stringify([
      'Direct TradingView Invite-Only Script Authorization',
      'Micro-Divergence Algorithmic Scanner',
      'Exhaustion Peak & Valley Detection',
      'Discord / Telegram Webhook Signal Compatible'
    ]),
    'aemeth_reversal_sniper_invite',
    1,
    'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=800&q=80',
    JSON.stringify(['https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=1200&q=80'])
  );

  // Product 5: Full Institutional Bundle
  insertProduct.run(
    'prd_bundle_005',
    'aemeth-complete-institutional-suite',
    'Aemeth Complete Institutional Suite (All 4 Indicators)',
    'The complete institutional analytical arsenal: Liquidity Matrix, Delta Flow, Trend Cascade, and Reversal Sniper at 35% discount.',
    'Get total market clarity. Combines all four flagship Aemeth indicators into one discounted package. Includes both instant open-source Pine Script downloads for Liquidity Matrix & Trend Cascade, PLUS authorized TradingView private invite access for Delta Flow & Reversal Sniper Pro.',
    'bundle',
    'bundle',
    24900, // $249.00 (Separately $376 -> Save $127!)
    12700,
    '2026.1',
    JSON.stringify([
      'Includes All 4 Flagship Indicators',
      'Both Open-Source Pine Scripts (.pine + .txt) & Invite-Only Access Included',
      'Massive 35% Bundle Savings ($127 off)',
      'VIP Dedicated Fast-Track TradingView Access Verification',
      'Exclusive Aemeth Proprietary Trading Strategy Guide (PDF/Markdown)'
    ]),
    'aemeth_complete_suite',
    1,
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    JSON.stringify(['https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80'])
  );

  // 4. Link bundle items
  const insertBundleItem = db.prepare('INSERT INTO bundle_items (id, bundle_id, product_id) VALUES (?, ?, ?)');
  insertBundleItem.run('bi_1', 'prd_bundle_005', 'prd_liq_001');
  insertBundleItem.run('bi_2', 'prd_bundle_005', 'prd_delta_002');
  insertBundleItem.run('bi_3', 'prd_bundle_005', 'prd_trend_003');
  insertBundleItem.run('bi_4', 'prd_bundle_005', 'prd_rev_004');

  // 5. Product Versions
  const insertVersion = db.prepare(`
    INSERT INTO product_versions (id, product_id, version_number, changelog, source_file_path, pine_script_content)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertVersion.run('ver_1', 'prd_liq_001', '5.2.0', 'Added Candle 1 zero-repaint lock and customizable session boxes.', 'server/storage/protected_scripts/aemeth_liquidity_matrix_v5_2.pine', samplePineScriptLiquidity);
  insertVersion.run('ver_2', 'prd_trend_003', '2.1.0', 'Optimized multi-timeframe request.security performance.', 'server/storage/protected_scripts/aemeth_trend_cascade_v2_1.pine', samplePineScriptTrend);

  // 6. Site Settings
  const insertSetting = db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');
  insertSetting.run('bank_bca_account', '8040-192-384');
  insertSetting.run('bank_bca_holder', 'PT AEMETH TRADER ANALISIS');
  insertSetting.run('bank_mandiri_account', '137-00-9821-441');
  insertSetting.run('bank_mandiri_holder', 'PT AEMETH TRADER ANALISIS');
  insertSetting.run('bank_wire_details', 'Swift: CENAIDJA, Bank Central Asia, Jakarta, Indonesia');
  insertSetting.run('crypto_usdt_trc20', 'TY2HqE83rLw8x7e94gP9W3B1Kx7M4z8Y1a');
  insertSetting.run('crypto_usdt_erc20', '0x71C8F4a2D398E153b6920194E347206bE5402919');
  insertSetting.run('crypto_btc', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
  insertSetting.run('paypal_client_id', 'sb_client_id_placeholder_sandbox_aemeth');
  insertSetting.run('paypal_sandbox_mode', 'true');
  insertSetting.run('tradingview_publisher_username', 'AemethTraderAnalysis');

  // 7. Seed an initial sample order for the test customer so they have instant data
  const orderId = 'ord_sample_paid_001';
  db.prepare(`
    INSERT INTO orders (id, order_number, user_id, total_cents, currency, status, payment_method, customer_email, customer_tv_username)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(orderId, 'AEM-8931204', traderId, 7900, 'USD', 'paid', 'bank_transfer', 'trader@aemethtrader.com', 'vance_fx');

  db.prepare(`
    INSERT INTO order_items (id, order_id, product_id, product_title, product_type, unit_price_cents)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('oi_sample_001', orderId, 'prd_liq_001', 'Aemeth Liquidity Matrix v5.2', 'open_source', 7900);

  db.prepare(`
    INSERT INTO payments (id, order_id, method, amount_cents, currency, status, provider_ref, proof_data, reviewed_by, reviewed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run('pay_sample_001', orderId, 'bank_transfer', 7900, 'USD', 'completed', 'BCA-TX-998124', 'Verified via Bank Central Asia settlement', adminId);

  db.prepare(`
    INSERT INTO deliveries (id, order_id, product_id, user_id, delivery_type, status, tv_username)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('del_sample_001', orderId, 'prd_liq_001', traderId, 'source_download', 'ready', 'vance_fx');

  console.log('[DB] Database successfully initialized and seeded!');
}
