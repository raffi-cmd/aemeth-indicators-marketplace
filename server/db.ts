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

    CREATE TABLE IF NOT EXISTS order_retrieval_tokens (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Migrate: add access_token and is_revoked columns to orders (guest delivery security)
  try {
    db.exec(`ALTER TABLE orders ADD COLUMN access_token TEXT;`);
  } catch {}
  try {
    db.exec(`ALTER TABLE orders ADD COLUMN access_token_hash TEXT;`);
  } catch {}
  try {
    db.exec(`ALTER TABLE orders ADD COLUMN is_revoked INTEGER NOT NULL DEFAULT 0;`);
  } catch {}
  try {
    db.exec(`ALTER TABLE orders ADD COLUMN customer_name TEXT;`);
  } catch {}

  // Migrate schema for IDR pricing, bundle types, and license terms
  try {
    db.exec(`
      ALTER TABLE products ADD COLUMN price_idr INTEGER DEFAULT 0;
      ALTER TABLE products ADD COLUMN normal_price_idr INTEGER DEFAULT 0;
      ALTER TABLE products ADD COLUMN promo_price_idr INTEGER DEFAULT 0;
    `);
  } catch {}

  try {
    db.exec(`
      ALTER TABLE orders ADD COLUMN total_idr INTEGER DEFAULT 0;
      ALTER TABLE orders ADD COLUMN subtotal_idr INTEGER DEFAULT 0;
      ALTER TABLE orders ADD COLUMN bundle_type TEXT;
      ALTER TABLE orders ADD COLUMN bundle_discount_idr INTEGER DEFAULT 0;
      ALTER TABLE orders ADD COLUMN total_savings_idr INTEGER DEFAULT 0;
      ALTER TABLE orders ADD COLUMN license_version TEXT;
      ALTER TABLE orders ADD COLUMN license_agreed_at TEXT;
    `);
  } catch {}

  try {
    db.exec(`
      ALTER TABLE order_items ADD COLUMN product_version TEXT;
      ALTER TABLE order_items ADD COLUMN normal_price_idr INTEGER DEFAULT 0;
      ALTER TABLE order_items ADD COLUMN effective_price_idr INTEGER DEFAULT 0;
    `);
  } catch {}

  // Purge any legacy duplicate products from database tables
  try {
    db.exec(`
      DELETE FROM bundle_items WHERE bundle_id LIKE 'prd_%' OR product_id LIKE 'prd_%';
      DELETE FROM product_versions WHERE product_id LIKE 'prd_%';
      DELETE FROM deliveries WHERE product_id LIKE 'prd_%';
      DELETE FROM order_items WHERE product_id LIKE 'prd_%';
      DELETE FROM products WHERE id LIKE 'prd_%';
    `);
  } catch {}

  seedInitialData();
  seedCanonicalIndicators();
  seedProductVersions();
}

function seedCanonicalIndicators() {
  const insertOrReplaceProduct = db.prepare(`
    INSERT OR REPLACE INTO products (
      id, slug, title, short_desc, long_desc, type, category, price_cents, discount_cents,
      version, features_json, tradingview_script_id, is_published, thumbnail_url, preview_images_json,
      price_idr, normal_price_idr, promo_price_idr
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const prods = [
    {
      id: 'parabolic-sar',
      slug: 'aemeth-parabolic-sar',
      title: 'Aemeth Parabolic SAR',
      short_desc: 'Deteksi pembalikan tren dan trailing stop dinamis berbasis akselerasi Parabolic SAR adaptif.',
      long_desc: 'Indikator momentum dan trailing stop berbasis Parabolic SAR yang disempurnakan dengan filter noise pasar dan sinyal konfirmasi anti-repaint.',
      type: 'open_source',
      category: 'trend',
      price_cents: 790,
      discount_cents: 210,
      version: '3.1.0',
      features: ['Full Uncompiled Pine Script v5 Source Code', 'Adaptive Acceleration Factor', 'Anti-Repaint Candle 1 Confirmation', 'TradingView Alert Ready'],
      thumb: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80',
      normal_idr: 99000,
      promo_idr: 79000,
    },
    {
      id: 'mfi-reversal',
      slug: 'aemeth-mfi-reversal',
      title: 'Aemeth MFI Reversal',
      short_desc: 'Identifikasi titik jenuh beli dan jenuh jual berbasis Money Flow Index dengan konfirmasi volume institusional.',
      long_desc: 'Algoritma pembalikan arah berbasis Money Flow Index (MFI) yang mendeteksi anomali volume dan divergensi tersembunyi pada swing high dan low.',
      type: 'open_source',
      category: 'reversal',
      price_cents: 1490,
      discount_cents: 510,
      version: '2.4.0',
      features: ['Full Editable Pine Script v5 Codebase', 'Money Flow Volume Divergence Scanner', 'Anti-Repaint Execution', 'Multi-Asset Support (Forex, Crypto, Saham)'],
      thumb: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
      normal_idr: 199000,
      promo_idr: 149000,
    },
    {
      id: 'ichimoku-cloud',
      slug: 'aemeth-ichimoku-cloud',
      title: 'Aemeth Ichimoku Cloud',
      short_desc: 'Visualisasi Tenkan-sen, Kijun-sen, Senkou Span A/B, dan Chikou Span dengan sinyal breakout awan terverifikasi.',
      long_desc: 'Sistem komprehensif Ichimoku Kinko Hyo modern dengan filter false breakout, projection support-resistance masa depan, dan sinyal beli/jual berbasis awan.',
      type: 'open_source',
      category: 'trend',
      price_cents: 1490,
      discount_cents: 510,
      version: '5.2.0',
      features: ['Full Pine Script v5 Source Code', 'Cloud Breakout & TK Cross Filters', 'Support / Resistance Zone Projections', 'Clean Minimalist Visuals'],
      thumb: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
      normal_idr: 199000,
      promo_idr: 149000,
    },
    {
      id: 'ai-signal-v1',
      slug: 'aemeth-ai-signal-v1',
      title: 'Aemeth AI Signal V1',
      short_desc: 'Sistem sinyal berbasis machine learning proxy: KNN / Lorentzian Classification untuk mendeteksi arah pasar dengan akurasi tinggi.',
      long_desc: 'Memanfaatkan klasifikasi Lorentzian probabilistik untuk memfilter noise acak di market forex dan crypto, memberikan sinyal entry terkonfirmasi.',
      type: 'open_source',
      category: 'trend',
      price_cents: 1490,
      discount_cents: 510,
      version: '1.2.0',
      features: ['Lorentzian Classification Proxy Algorithm', 'Multi-Feature Confluence Filter', 'Strict Closed-Bar Anti-Repaint Architecture', 'Risk-to-Reward Calculator'],
      thumb: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=800&q=80',
      normal_idr: 199000,
      promo_idr: 149000,
    },
    {
      id: 'trendline-sr-utbot',
      slug: 'aemeth-trendline-breakout-sr-utbot',
      title: 'Aemeth Trendline Breakout + S/R + UT Bot',
      short_desc: 'Kombinasi otomatis auto-trendline, dynamic support/resistance zones, dan mesin sinyal volatilitas UT Bot.',
      long_desc: 'Suite lengkap yang memproyeksikan trendline diagonal dinamis, support resistance horizontal kunci, dan trigger sinyal ATR-trailing UT Bot dalam satu chart.',
      type: 'open_source',
      category: 'trend',
      price_cents: 2490,
      discount_cents: 510,
      version: '4.2.0',
      features: ['Auto Dynamic Trendline Breakout Detection', 'Key Horizontal S/R Swing High/Low Zones', 'Integrated Volatility ATR UT Bot Alerts', 'Multi-Timeframe Confluence'],
      thumb: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80',
      normal_idr: 299000,
      promo_idr: 249000,
    },
    {
      id: 'smc-signal-panel-v2',
      slug: 'aemeth-smc-signal-panel-v2',
      title: 'Aemeth SMC Entry/TP/SL Signal Panel V2',
      short_desc: 'Indikator TradingView berbasis market structure untuk membantu mengidentifikasi potensi breakout, BUY/SELL, Entry, Stop Loss, dan target TP1–TP3, dilengkapi visualisasi zona serta panel informasi sinyal.',
      long_desc: 'Aemeth SMC Entry/TP/SL Signal Panel V2 adalah indikator TradingView yang dirancang untuk membantu trader mengamati breakout struktur pasar (market structure) dan potensi setup trading melalui sinyal BUY/SELL, level Entry, Stop Loss (SL), target Take Profit (TP1, TP2, TP3), serta zona analisis pasar seperti Fair Value Gap dan Order Block.\n\nDilengkapi filter volatilitas berbasis ATR dan pengaturan cooldown sinyal untuk meminimalkan noise pasar, serta panel informasi sinyal langsung pada chart untuk kemudahan pemantauan secara objektif.\n\nCatatan Penting:\nIndikator ini merupakan alat bantu analisis, bukan jaminan hasil trading. Keputusan trading dan pengelolaan risiko tetap menjadi tanggung jawab pengguna.',
      type: 'open_source',
      category: 'trend',
      price_cents: 2490,
      discount_cents: 510,
      version: '2.1.0',
      features: [
        'Market Structure & Break of Structure.',
        'BUY/SELL signals.',
        'Entry, Stop Loss, TP1–TP3.',
        'Fair Value Gap & Order Block.',
        'ATR filter & cooldown.',
        'Signal Score panel.',
        'Customizable settings.',
        'TradingView alerts.'
      ],
      thumb: './products/smc-signal-panel.jpg',
      normal_idr: 299000,
      promo_idr: 249000,
    },
    {
      id: 'supertrend-tpsl',
      slug: 'aemeth-supertrend-tpsl',
      title: 'Aemeth Supertrend TP/SL Indicator',
      short_desc: 'Indikator berbasis Supertrend yang memvisualisasikan arah tren serta level Entry, Stop Loss (SL), dan tiga target Take Profit (TP1, TP2, TP3) langsung pada chart.',
      long_desc: 'Aemeth Supertrend TP/SL Indicator merupakan indikator berbasis Supertrend yang membantu trader membaca arah tren serta memvisualisasikan level Entry, Stop Loss (SL), dan tiga target Take Profit (TP1, TP2, TP3) langsung pada chart.\n\nDengan tampilan level yang terstruktur dan visual yang intuitif, trader dapat memantau skenario trading, memahami target harga, dan menyusun perencanaan risiko dengan lebih sistematis.\n\nCatatan Penting:\nIndikator ini merupakan alat bantu analisis teknikal visual, bukan jaminan profit. Disiplin money management dan manajemen risiko tetap berada di tangan masing-masing trader.',
      type: 'open_source',
      category: 'trend',
      price_cents: 2490,
      discount_cents: 510,
      version: '1.0.0',
      features: [
        'Supertrend Trend Visualization: Visualisasi garis tren Supertrend.',
        'Entry Price Level: Level harga entry yang jelas pada chart.',
        'Stop Loss (SL): Level stop loss dinamis terukur.',
        'TP1, TP2, TP3: Tiga level target take profit terstruktur.',
        'Chart-based Trading Levels: Proyeksi garis horizontal langsung pada chart.',
        'Pine Script Source Code: Uncompiled source code Pine Script v5.'
      ],
      thumb: './products/supertrend-tpsl.jpg',
      normal_idr: 299000,
      promo_idr: 249000,
    },
    {
      id: 'vwap-reversal-tpsl',
      slug: 'aemeth-vwap-reversal-tpsl',
      title: 'Aemeth VWAP Reversal TP/SL Indicator',
      short_desc: 'Deteksi sinyal pembalikan harga saat menembus VWAP dengan level Entry, Stop Loss terukur, dan 3 target Take Profit (TP1, TP2, TP3).',
      long_desc: 'Aemeth VWAP Reversal TP/SL Indicator dirancang untuk membantu trader mendeteksi momen pembalikan harga saat harga menembus Volume Weighted Average Price (VWAP).\n\nIndikator ini secara otomatis memplot level Entry saat breakout terjadi, Stop Loss (SL) pada level VWAP/swing, serta 3 target Take Profit (TP1, TP2, TP3) bertingkat pada chart untuk target risiko-imbalan yang optimal.\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis teknikal objektif berbasis volume dan harga, bukan jaminan keuntungan finansial.',
      type: 'open_source',
      category: 'reversal',
      price_cents: 1490,
      discount_cents: 510,
      version: '1.0.0',
      features: [
        'VWAP Reversal: Deteksi sinyal saat harga menembus VWAP.',
        'Entry & SL: Level entry dan stop loss yang jelas.',
        '3 Take Profit: TP1, TP2, TP3 untuk target optimal.',
        'Pine Script: Source code siap digunakan.'
      ],
      thumb: './products/vwap-reversal.jpg',
      normal_idr: 199000,
      promo_idr: 149000,
    },
    {
      id: 'major-swing',
      slug: 'aemeth-major-swing-indicator',
      title: 'Aemeth Major Swing Indicator',
      short_desc: 'Deteksi swing high dan swing low utama pasar dengan label Buy/Sell yang jelas dan parameter swing yang dapat disesuaikan.',
      long_desc: 'Aemeth Major Swing Indicator membantu trader mengidentifikasi struktur ayunan harga (swing high & swing low) yang signifikan pada grafik tanpa tertipu noise jangka pendek.\n\nDilengkapi label BUY dan SELL visual yang tegas pada titik balik struktural utama, serta pengaturan fleksibel untuk menyesuaikan panjang swing dan jarak minimum sesuai gaya trading swing maupun intraday.\n\nCatatan Penting:\nIndikator ini mendeteksi titik konfirmasi swing secara objektif, bukan ramalan masa depan.',
      type: 'open_source',
      category: 'trend',
      price_cents: 1490,
      discount_cents: 510,
      version: '1.0.0',
      features: [
        'Major Swing Signal: Deteksi swing high dan swing low utama.',
        'Buy / Sell Label: Label jelas pada swing penting.',
        'Custom Settings: Atur panjang swing dan jarak minimum.',
        'Pine Script: Source code siap digunakan.'
      ],
      thumb: './products/major-swing.jpg',
      normal_idr: 199000,
      promo_idr: 149000,
    },
    {
      id: 'stochastic-cross-tpsl',
      slug: 'aemeth-stochastic-cross-tpsl',
      title: 'Aemeth Stochastic Cross TP/SL Indicator',
      short_desc: 'Deteksi persilangan momentum %K dan %D Stochastic Oscillator dengan level Entry, Stop Loss, dan 3 target Take Profit terstruktur.',
      long_desc: 'Aemeth Stochastic Cross TP/SL Indicator membaca persilangan garis %K dan %D dari Stochastic Oscillator pada area overbought atau oversold untuk menangkap momentum awal.\n\nSecara otomatis menampilkan level Entry harga, Stop Loss (SL) terproteksi, serta 3 target Take Profit (TP1, TP2, TP3) yang proporsional sehingga eksekusi trading lebih terencana dan disiplin.\n\nCatatan Penting:\nIndikator ini adalah alat bantu kalkulasi teknikal momentum, bukan kepastian arah harga pasar.',
      type: 'open_source',
      category: 'momentum',
      price_cents: 1490,
      discount_cents: 510,
      version: '1.0.0',
      features: [
        'Stochastic Cross Signal: Deteksi persilangan %K dan %D.',
        'Entry & SL: Level entry dan stop loss yang jelas.',
        '3 Take Profit: TP1, TP2, TP3 untuk target optimal.',
        'Pine Script: Source code siap digunakan.'
      ],
      thumb: './products/stochastic-cross.jpg',
      normal_idr: 199000,
      promo_idr: 149000,
    },
    {
      id: 'crt-entry-tpsl',
      slug: 'aemeth-crt-entry-tpsl',
      title: 'Aemeth CRT Entry TP/SL Indicator',
      short_desc: 'Deteksi sinyal Candle Range Theory (CRT) dengan visualisasi setup range, level Entry, Stop Loss (SL), dan 3 target Take Profit (TP1, TP2, TP3).',
      long_desc: 'Aemeth CRT Entry TP/SL Indicator dirancang berdasarkan metodologi Candle Range Theory (CRT) untuk memetakan range pembentukan harga, manipulasi wick, dan ekspansi arah berikutnya.\n\nDilengkapi penanda sinyal CRT, kotak acuan range, level Entry konfirmasi, batas risiko Stop Loss (SL), dan tiga level Take Profit (TP1, TP2, TP3) bertahap langsung pada chart TradingView.\n\nCatatan Penting:\nIndikator ini adalah alat bantu membaca model Candle Range Theory, bukan jaminan sukses transaksi.',
      type: 'open_source',
      category: 'trend',
      price_cents: 1990,
      discount_cents: 500,
      version: '1.0.0',
      features: [
        'CRT Signal: Deteksi sinyal CRT secara akurat.',
        'Entry & SL: Level entry dan stop loss yang jelas.',
        '3 Take Profit: TP1, TP2, TP3 untuk target optimal.',
        'Pine Script: Source code siap digunakan.'
      ],
      thumb: './products/crt-entry.jpg',
      normal_idr: 249000,
      promo_idr: 199000,
    },
    {
      id: 'rsi-reversal-tpsl',
      slug: 'aemeth-rsi-reversal-tpsl',
      title: 'Aemeth RSI Reversal TP/SL Indicator',
      short_desc: 'Deteksi momentum saat harga keluar dari area ekstrem RSI dengan level Entry, Stop Loss terukur, dan 3 target Take Profit bertingkat.',
      long_desc: 'Aemeth RSI Reversal TP/SL Indicator mendeteksi momentum pembalikan arah saat Relative Strength Index (RSI) berbalik dan keluar dari zona ekstrem (oversold di bawah 30 atau overbought di atas 70).\n\nSecara otomatis menandai titik Entry terkonfirmasi, menempatkan level Stop Loss (SL) yang proporsional, serta memetakan 3 target Take Profit (TP1, TP2, TP3) untuk membantu eksekusi swing atau scalping dengan rasio risiko-imbalan yang sehat.\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis osilator momentum objektif, bukan jaminan profit trading.',
      type: 'open_source',
      category: 'reversal',
      price_cents: 1490,
      discount_cents: 510,
      version: '1.0.0',
      features: [
        'RSI Reversal Signal: Deteksi momentum keluar dari area extreme.',
        'Entry & SL: Level entry dan stop loss yang jelas.',
        '3 Take Profit: TP1, TP2, TP3 untuk target optimal.',
        'Pine Script: Source code siap digunakan.'
      ],
      thumb: './products/rsi-reversal.jpg',
      normal_idr: 199000,
      promo_idr: 149000,
    },
    {
      id: 'macd-crossover-v1',
      slug: 'aemeth-macd-crossover-v1',
      title: 'Aemeth MACD Crossover V1 by RIDHO',
      short_desc: 'Deteksi momentum persilangan garis MACD dengan evaluasi Grade, AI Confidence level, zona Stop Loss, dan tiga target Take Profit.',
      long_desc: 'Aemeth MACD Crossover V1 by RIDHO adalah indikator analisis teknikal momentum modern untuk TradingView. Indikator ini mendeteksi perubahan momentum pasar melalui perhitungan garis MACD Fast, Slow, dan Signal yang dapat dikonfigurasi, disertai opsi konfirmasi saat candle close untuk memfilter sinyal dini.\n\nDilengkapi batas Stop Loss (SL) berbasis ATR dan tiga target Take Profit berurutan (TP1, TP2, TP3) berbasis Risk/Reward, serta badge penilaian Grade (A, B, C, D) dan level AI Confidence yang mengevaluasi kondisi volume serta momentum pasar secara terstruktur.\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis teknikal objektif, bukan jaminan keuntungan finansial. Keputusan transaksi dan pengendalian risiko sepenuhnya merupakan tanggung jawab pengguna.',
      type: 'open_source',
      category: 'momentum',
      price_cents: 1490,
      discount_cents: 510,
      version: '1.0.0',
      features: [
        'MACD Fast, Slow, and Signal Configurable',
        'Bullish & Bearish Crossover Signals',
        'Candle Close Signal Confirmation (Optional)',
        'ATR-Based Dynamic Stop Loss',
        'TP1, TP2, TP3 Risk/Reward Sequential Targets',
        'Visual Stop Loss & Take Profit Shaded Zones',
        'Signal Quality Grade Evaluation (A, B, C, D)',
        'AI Confidence Telemetry (LOW, MEDIUM, HIGH)',
        'Volume & Momentum Confluence Matrix',
        'Directional Mode Settings (LONG & SHORT)',
        'Integrated TradingView Alert Conditions'
      ],
      thumb: './products/macd-crossover.jpg',
      normal_idr: 199000,
      promo_idr: 149000,
    },
    {
      id: 'hull-suite-v1',
      slug: 'aemeth-hull-suite-v1',
      title: 'Aemeth Hull Suite V1',
      short_desc: 'Visualisasi tren dinamis berbasis Hull Moving Average (Hull Suite) dengan pita kurva warna, level Entry, Stop Loss, dan 3 target Take Profit.',
      long_desc: 'Aemeth Hull Suite V1 adalah indikator trend-following yang memanfaatkan kehalusan dan kecepatan respon Hull Moving Average (HMA) untuk mendeteksi arah tren pasar secara real-time.\n\nMenampilkan pita kurva Hull MA yang dinamis (hijau saat bullish, merah saat bearish), penanda sinyal BUY terkonfirmasi pada pergantian tren, kalkulasi otomatis Entry dan Stop Loss (SL), serta proyeksi 3 target Take Profit (TP1, TP2, TP3) bertingkat.\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis teknikal visual, bukan jaminan keuntungan transaksi.',
      type: 'open_source',
      category: 'trend',
      price_cents: 1990,
      discount_cents: 500,
      version: '1.0.0',
      features: [
        'Hull MA Trend with Band: Pita tren dinamis hijau/merah.',
        'Entry & SL Auto Calculation: Kalkulasi otomatis level entry dan stop loss.',
        '3 Take Profit: TP1 (1:1.5), TP2 (1:2), TP3 (1:2.5).',
        'Smart Visual Trading Tools: Tampilan visual chart modern & bersih.',
        'Pine Script: Source code siap digunakan.'
      ],
      thumb: './products/hull-suite.jpg',
      normal_idr: 249000,
      promo_idr: 199000,
    },
    {
      id: 'ema-ribbon-flow',
      slug: 'aemeth-ema-ribbon-flow',
      title: 'Aemeth EMA Ribbon Flow',
      short_desc: 'Visualisasi pita tren multi-EMA yang halus dan responsif dengan penanda sinyal BUY/SELL pada titik transisi tren.',
      long_desc: 'Aemeth EMA Ribbon Flow menyusun serangkaian garis Exponential Moving Average (EMA) dengan panjang bertingkat yang membentuk pita dinamis di sekitar pergerakan candlestick.\n\nPita berwarna hijau saat tren menguat (bullish) dan berubah merah saat tren melemah (bearish), memberikan panduan visual langsung terhadap kekuatan tren tanpa indikator tambahan yang membingungkan. Dilengkapi label BUY dan SELL yang muncul pada titik awal pembalikan arah.\n\nCatatan Penting:\nIndikator ini mendeteksi arah aliran tren secara matematis, bukan ramalan masa depan.',
      type: 'open_source',
      category: 'trend',
      price_cents: 1490,
      discount_cents: 510,
      version: '1.0.0',
      features: [
        'EMA Ribbon Trend Detection: Visual trend clarity across multi-EMA spectrum.',
        'Smart Signal: BUY / SELL labels at confirmed ribbon shifts.',
        'Multi-EMA Visualization: Cascading ribbon structure.',
        'Customizable Settings: Adjustable EMA lengths and smoothing.',
        'Smooth Performance: Lightweight execution without chart lag.',
        'Pine Script: Source code siap digunakan.'
      ],
      thumb: './products/ema-ribbon-flow.jpg',
      normal_idr: 199000,
      promo_idr: 149000,
    },
    {
      id: 'ema-crossover-rsi',
      slug: 'aemeth-ema-crossover-rsi',
      title: 'Aemeth EMA Crossover + RSI',
      short_desc: 'Deteksi tren berbasis persilangan EMA Fast 20 dan EMA Slow 50 dengan filter konfirmasi RSI serta level Entry, Stop Loss, dan target TP1–TP3 bertingkat.',
      long_desc: 'Aemeth EMA Crossover + RSI menggabungkan kecepatan reaksi EMA Fast 20 (garis kuning) dan stabilitas tren EMA Slow 50 (garis oranye) dengan filter konfirmasi momentum Relative Strength Index (RSI).\n\nSaat persilangan bearish terjadi dengan konfirmasi RSI, indikator memproyeksikan garis putus-putus horizontal yang jelas untuk Stop Loss di atas entry (SL: 3587.561), garis Entry harga (3572.560), serta 3 target Take Profit proporsional (TP1: 3563.559, TP2: 3554.558, TP3: 3545.557) langsung pada chart TradingView.\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis teknikal objektif berbasis moving average dan RSI, bukan jaminan profit transaksi.',
      type: 'open_source',
      category: 'momentum',
      price_cents: 1490,
      discount_cents: 510,
      version: '1.0.0',
      features: [
        'EMA Crossover Trend Detection: Fast 20 (Yellow) & Slow 50 (Orange) crossover triggers.',
        'RSI Filter Signal Confirmation: Extreme oscillator momentum filtering.',
        'Entry / SL / TP1–TP3: Dotted level projections on chart (SL: 3587.561, Entry: 3572.560, TP1–TP3).',
        'ATR-Based Risk Levels: Proportional risk-reward target spacing without repainting.',
        'Pine Script: Source code siap digunakan.'
      ],
      thumb: './products/ema-crossover-rsi.jpg',
      normal_idr: 199000,
      promo_idr: 149000,
    },
  ];

  // Purge any legacy duplicate products from database
  try {
    db.exec(`DELETE FROM products WHERE id LIKE 'prd_%';`);
  } catch {}

  for (const p of prods) {
    insertOrReplaceProduct.run(
      p.id,
      p.slug,
      p.title,
      p.short_desc,
      p.long_desc,
      p.type,
      p.category,
      p.price_cents,
      p.discount_cents,
      p.version,
      JSON.stringify(p.features),
      `aemeth_${p.id.replace(/-/g, '_')}_script`,
      1,
      p.thumb,
      JSON.stringify([p.thumb]),
      p.promo_idr,
      p.normal_idr,
      p.promo_idr
    );
  }
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

  // Sample order setup
  const sampleOrderProdId = 'parabolic-sar';

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

  // 7. Seed sample order with deterministic access_token for demo
  const sampleAccessToken = 'tok_sample_verified_2026';
  const sampleTokenHash = crypto.createHash('sha256').update(sampleAccessToken).digest('hex');
  const orderId = 'ord_sample_paid_001';
  db.prepare(`
    INSERT INTO orders (id, order_number, user_id, total_cents, currency, status, payment_method, customer_email,
      access_token, access_token_hash, is_revoked)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `).run(orderId, 'AEM-8931204', traderId, 7900, 'USD', 'paid', 'bank_transfer', 'trader@aemethtrader.com',
    sampleAccessToken, sampleTokenHash);

  db.prepare(`
    INSERT INTO order_items (id, order_id, product_id, product_title, product_type, unit_price_cents)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('oi_sample_001', orderId, sampleOrderProdId, 'Aemeth Parabolic SAR', 'open_source', 790);

  db.prepare(`
    INSERT INTO payments (id, order_id, method, amount_cents, currency, status, provider_ref, proof_data, reviewed_by, reviewed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run('pay_sample_001', orderId, 'bank_transfer', 790, 'USD', 'completed', 'BCA-TX-998124', 'Verified via Bank Central Asia settlement', adminId);

  db.prepare(`
    INSERT INTO deliveries (id, order_id, product_id, user_id, delivery_type, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('del_sample_001', orderId, sampleOrderProdId, traderId, 'source_download', 'ready');

  // 8. Seed Pine Script source code for all 6 canonical products
  seedProductVersions();

  console.log('[DB] Database successfully initialized and seeded!');
}

function seedProductVersions() {
  const insertVersion = db.prepare(`
    INSERT OR IGNORE INTO product_versions (id, product_id, version_number, changelog, pine_script_content)
    VALUES (?, ?, ?, ?, ?)
  `);

  const PINE_SCRIPTS: Record<string, { version: string; changelog: string; content: string }> = {
    'parabolic-sar': {
      version: '3.1.0',
      changelog: 'v3.1.0: Added multi-stage acceleration parameter tuning & dynamic status dashboard',
      content: `//@version=5
indicator("Aemeth Parabolic SAR", overlay=true)

// ==========================================================================
// AEMETH TRADER ANALYSIS — PARABOLIC SAR INDICATOR v3.1.0
// Pine Script v5 | Anti-Repaint: Locked to Closed Bar (bar_index[1])
// License: Personal Use — Do Not Redistribute
// ==========================================================================

// ————— Inputs
start       = input.float(0.02, "AF Start",     minval=0.001, maxval=0.1,  step=0.001)
increment   = input.float(0.02, "AF Increment", minval=0.001, maxval=0.1,  step=0.001)
max_af      = input.float(0.2,  "AF Maximum",   minval=0.05,  maxval=1.0,  step=0.01)
atr_len     = input.int(14,     "ATR Length",   minval=1)
tp_mult1    = input.float(1.0,  "TP1 Multiplier", minval=0.1)
tp_mult2    = input.float(2.0,  "TP2 Multiplier", minval=0.1)
tp_mult3    = input.float(3.0,  "TP3 Multiplier", minval=0.1)
show_dash   = input.bool(true,  "Show Dashboard")

// ————— Parabolic SAR (closed bar anti-repaint)
psar        = ta.sar(start, increment, max_af)
psar_prev   = psar[1]
close_prev  = close[1]

bull_signal = close_prev > psar_prev and close[2] <= psar[2]
bear_signal = close_prev < psar_prev and close[2] >= psar[2]

// ————— ATR for level spacing
atr         = ta.atr(atr_len)[1]

// ————— Entry, SL, TP levels (computed on closed bar)
entry_bull  = close_prev
sl_bull     = psar_prev
tp1_bull    = entry_bull + atr * tp_mult1
tp2_bull    = entry_bull + atr * tp_mult2
tp3_bull    = entry_bull + atr * tp_mult3

entry_bear  = close_prev
sl_bear     = psar_prev
tp1_bear    = entry_bear - atr * tp_mult1
tp2_bear    = entry_bear - atr * tp_mult2
tp3_bear    = entry_bear - atr * tp_mult3

// ————— Plotting
plot(psar, "SAR", color=close[1] > psar[1] ? color.new(#10b981,0) : color.new(#ff2a3b,0), style=plot.style_circles, linewidth=2)

plotshape(bull_signal, "BUY",  shape.labelup,   location.belowbar, color.new(#10b981,0), text="BUY",  textcolor=color.white, size=size.small)
plotshape(bear_signal, "SELL", shape.labeldown, location.abovebar, color.new(#ff2a3b,0), text="SELL", textcolor=color.white, size=size.small)

// ————— Dashboard
if show_dash
    signal_txt = bull_signal ? "BUY 🟢" : bear_signal ? "SELL 🔴" : "—"
    var table dash = table.new(position.top_right, 2, 5, border_width=1, border_color=color.new(color.gray,70))
    table.cell(dash, 0, 0, "AEMETH PSAR", text_color=color.new(#2563eb,0), text_size=size.small, bgcolor=color.new(#070b14,10))
    table.cell(dash, 1, 0, "v3.1.0",      text_color=color.silver,         text_size=size.small, bgcolor=color.new(#070b14,10))
    table.cell(dash, 0, 1, "Signal",       text_color=color.silver,         text_size=size.small, bgcolor=color.new(#0b1120,10))
    table.cell(dash, 1, 1, signal_txt,     text_color=color.white,          text_size=size.small, bgcolor=color.new(#0b1120,10))

// ————— Alerts
alertcondition(bull_signal, "Aemeth PSAR — BUY",  "Aemeth Parabolic SAR: BUY signal triggered.")
alertcondition(bear_signal, "Aemeth PSAR — SELL", "Aemeth Parabolic SAR: SELL signal triggered.")
`,
    },
    'mfi-reversal': {
      version: '2.4.0',
      changelog: 'v2.4.0: Dynamic MFI exhaustion threshold tuning and ATR distance logic',
      content: `//@version=5
indicator("Aemeth MFI Reversal", overlay=true)

// ==========================================================================
// AEMETH TRADER ANALYSIS — MFI REVERSAL INDICATOR v2.4.0
// Pine Script v5 | Anti-Repaint: Closed Bar Architecture
// License: Personal Use — Do Not Redistribute
// ==========================================================================

// ————— Inputs
mfi_len     = input.int(14,  "MFI Length",         minval=2)
ob_level    = input.int(80,  "Overbought Level",    minval=51, maxval=99)
os_level    = input.int(20,  "Oversold Level",      minval=1,  maxval=49)
atr_len     = input.int(14,  "ATR Length",          minval=1)
tp_mult1    = input.float(1.0, "TP1 ATR Multiplier")
tp_mult2    = input.float(2.0, "TP2 ATR Multiplier")
tp_mult3    = input.float(3.0, "TP3 ATR Multiplier")
show_dash   = input.bool(true, "Show Dashboard")

// ————— MFI Computation (closed bar)
mfi         = ta.mfi(hlc3, mfi_len)[1]
mfi_prev    = ta.mfi(hlc3, mfi_len)[2]

buy_signal  = mfi_prev <= os_level and mfi > os_level
sell_signal = mfi_prev >= ob_level and mfi < ob_level

// ————— ATR (closed bar)
atr         = ta.atr(atr_len)[1]
entry_c     = close[1]

// ————— BUY levels
tp1_buy     = entry_c + atr * tp_mult1
tp2_buy     = entry_c + atr * tp_mult2
tp3_buy     = entry_c + atr * tp_mult3
sl_buy      = entry_c - atr

// ————— SELL levels
tp1_sell    = entry_c - atr * tp_mult1
tp2_sell    = entry_c - atr * tp_mult2
tp3_sell    = entry_c - atr * tp_mult3
sl_sell     = entry_c + atr

// ————— Plots
plotshape(buy_signal,  "BUY",  shape.labelup,   location.belowbar, color.new(#10b981,0), text="BUY",  textcolor=color.white, size=size.small)
plotshape(sell_signal, "SELL", shape.labeldown, location.abovebar, color.new(#ff2a3b,0), text="SELL", textcolor=color.white, size=size.small)

// ————— Dashboard
if show_dash
    sig_txt = buy_signal ? "BUY 🟢" : sell_signal ? "SELL 🔴" : "—"
    var table dash = table.new(position.top_right, 2, 4, border_width=1, border_color=color.new(color.gray,70))
    table.cell(dash, 0, 0, "AEMETH MFI",  text_color=color.new(#2563eb,0), text_size=size.small, bgcolor=color.new(#070b14,10))
    table.cell(dash, 1, 0, "v2.4.0",      text_color=color.silver,         text_size=size.small, bgcolor=color.new(#070b14,10))
    table.cell(dash, 0, 1, "MFI",         text_color=color.silver,         text_size=size.small, bgcolor=color.new(#0b1120,10))
    table.cell(dash, 1, 1, str.tostring(math.round(mfi, 2)), text_color=color.white, text_size=size.small, bgcolor=color.new(#0b1120,10))
    table.cell(dash, 0, 2, "Signal",      text_color=color.silver,         text_size=size.small, bgcolor=color.new(#0b1120,10))
    table.cell(dash, 1, 2, sig_txt,       text_color=color.white,          text_size=size.small, bgcolor=color.new(#0b1120,10))

alertcondition(buy_signal,  "Aemeth MFI — BUY",  "Aemeth MFI Reversal: BUY reversal detected.")
alertcondition(sell_signal, "Aemeth MFI — SELL", "Aemeth MFI Reversal: SELL reversal detected.")
`,
    },
    'ichimoku-cloud': {
      version: '5.2.0',
      changelog: 'v5.2.0: Pine Script v5 upgrade with dynamic cloud projections & TP1-TP3 targets',
      content: `//@version=5
indicator("Aemeth Ichimoku Cloud", overlay=true)

// ==========================================================================
// AEMETH TRADER ANALYSIS — ICHIMOKU CLOUD INDICATOR v5.2.0
// Pine Script v5 | Closed-Bar Anti-Repaint Architecture
// License: Personal Use — Do Not Redistribute
// ==========================================================================

// ————— Inputs
tenkan_len  = input.int(9,  "Tenkan-sen Length",  minval=1)
kijun_len   = input.int(26, "Kijun-sen Length",   minval=1)
senkou_len  = input.int(52, "Senkou Span B Len",  minval=1)
disp        = input.int(26, "Displacement",       minval=1)
atr_len     = input.int(14, "ATR Length",         minval=1)
tp_mult1    = input.float(1.0, "TP1 Multiplier")
tp_mult2    = input.float(2.0, "TP2 Multiplier")
tp_mult3    = input.float(3.0, "TP3 Multiplier")
show_dash   = input.bool(true, "Show Dashboard")

// ————— Ichimoku Components (closed bar: index [1])
tenkan      = (ta.highest(high, tenkan_len)[1] + ta.lowest(low, tenkan_len)[1]) / 2
kijun       = (ta.highest(high, kijun_len)[1]  + ta.lowest(low, kijun_len)[1])  / 2
senkou_a    = (tenkan + kijun) / 2
senkou_b    = (ta.highest(high, senkou_len)[1]  + ta.lowest(low, senkou_len)[1]) / 2
chikou      = close[disp + 1]

// ————— Signal logic (fully closed bar)
price_above_cloud = close[1] > math.max(senkou_a[disp], senkou_b[disp])
price_below_cloud = close[1] < math.min(senkou_a[disp], senkou_b[disp])
tk_cross_bull     = ta.crossover(tenkan, kijun)
tk_cross_bear     = ta.crossunder(tenkan, kijun)

buy_signal  = tk_cross_bull and price_above_cloud
sell_signal = tk_cross_bear and price_below_cloud

// ————— ATR levels
atr         = ta.atr(atr_len)[1]
entry_c     = close[1]
tp1_buy     = entry_c + atr * tp_mult1
tp2_buy     = entry_c + atr * tp_mult2
tp3_buy     = entry_c + atr * tp_mult3
sl_buy      = kijun
tp1_sell    = entry_c - atr * tp_mult1
tp2_sell    = entry_c - atr * tp_mult2
tp3_sell    = entry_c - atr * tp_mult3
sl_sell     = kijun

// ————— Cloud Plots
spa_line    = plot(senkou_a, "Senkou Span A", color=color.new(#10b981, 60), offset=disp)
spb_line    = plot(senkou_b, "Senkou Span B", color=color.new(#ff2a3b, 60), offset=disp)
fill(spa_line, spb_line, color=senkou_a >= senkou_b ? color.new(#10b981, 85) : color.new(#ff2a3b, 85))
plot(tenkan, "Tenkan-sen",  color=color.new(#3b82f6, 0),  linewidth=1)
plot(kijun,  "Kijun-sen",   color=color.new(#f59e0b, 0),  linewidth=1)
plot(chikou, "Chikou Span", color=color.new(#8b5cf6, 50), offset=-disp)

plotshape(buy_signal,  "BUY",  shape.labelup,   location.belowbar, color.new(#10b981,0), text="BUY",  textcolor=color.white, size=size.small)
plotshape(sell_signal, "SELL", shape.labeldown, location.abovebar, color.new(#ff2a3b,0), text="SELL", textcolor=color.white, size=size.small)

// ————— Dashboard
if show_dash
    sig_txt = buy_signal ? "BUY 🟢" : sell_signal ? "SELL 🔴" : "—"
    cloud_txt = price_above_cloud ? "Above Cloud" : price_below_cloud ? "Below Cloud" : "In Cloud"
    var table dash = table.new(position.top_right, 2, 5, border_width=1, border_color=color.new(color.gray,70))
    table.cell(dash, 0, 0, "AEMETH ICHIMOKU", text_color=color.new(#2563eb,0), text_size=size.small, bgcolor=color.new(#070b14,10))
    table.cell(dash, 1, 0, "v5.2.0",          text_color=color.silver,         text_size=size.small, bgcolor=color.new(#070b14,10))
    table.cell(dash, 0, 1, "Signal",           text_color=color.silver,         text_size=size.small, bgcolor=color.new(#0b1120,10))
    table.cell(dash, 1, 1, sig_txt,            text_color=color.white,          text_size=size.small, bgcolor=color.new(#0b1120,10))
    table.cell(dash, 0, 2, "Price vs Cloud",   text_color=color.silver,         text_size=size.small, bgcolor=color.new(#0b1120,10))
    table.cell(dash, 1, 2, cloud_txt,          text_color=color.white,          text_size=size.small, bgcolor=color.new(#0b1120,10))

alertcondition(buy_signal,  "Aemeth Ichimoku — BUY",  "Aemeth Ichimoku Cloud: BUY signal fired.")
alertcondition(sell_signal, "Aemeth Ichimoku — SELL", "Aemeth Ichimoku Cloud: SELL signal fired.")
`,
    },
    'ai-signal-v1': {
      version: '1.2.0',
      changelog: 'v1.2.0: Added Grade evaluation & AI Confidence telemetry badges',
      content: `//@version=5
indicator("Aemeth AI Signal V1", overlay=true)

// ==========================================================================
// AEMETH TRADER ANALYSIS — AI SIGNAL V1 v1.2.0
// Pine Script v5 | Lorentzian-Inspired Classification Proxy
// Anti-Repaint: Fully Closed Bar | License: Personal Use
// ==========================================================================

// ————— Inputs
rsi_len     = input.int(14,   "RSI Length",           minval=2)
ema_fast    = input.int(21,   "EMA Fast",             minval=1)
ema_slow    = input.int(50,   "EMA Slow",             minval=1)
atr_len     = input.int(14,   "ATR Length",           minval=1)
tp_mult1    = input.float(1.0, "TP1 ATR Multiplier")
tp_mult2    = input.float(2.0, "TP2 ATR Multiplier")
tp_mult3    = input.float(3.0, "TP3 ATR Multiplier")
show_dash   = input.bool(true, "Show Dashboard")

// ————— Feature Vectors (closed bar)
rsi         = ta.rsi(close[1], rsi_len)
ema_f       = ta.ema(close[1], ema_fast)
ema_s       = ta.ema(close[1], ema_slow)
atr         = ta.atr(atr_len)[1]

// ————— Classification proxy: multi-feature confluence
bull_cond   = rsi > 50 and ema_f > ema_s and close[1] > ema_f
bear_cond   = rsi < 50 and ema_f < ema_s and close[1] < ema_f

// ————— Avoid repainting: use bar_index comparison
buy_signal  = bull_cond and not bull_cond[1]
sell_signal = bear_cond and not bear_cond[1]

// ————— Grade & Confidence (illustrative scoring)
rsi_score   = bull_cond ? (rsi - 50) / 50 : bear_cond ? (50 - rsi) / 50 : 0.0
ema_gap     = math.abs(ema_f - ema_s) / atr
confidence  = math.min(math.round((rsi_score * 50 + ema_gap * 50)), 100)
grade       = confidence >= 80 ? "A" : confidence >= 60 ? "B" : "C"

// ————— Entry/SL/TP levels
entry_c     = close[1]
sl_buy      = entry_c - atr
tp1_buy     = entry_c + atr * tp_mult1
tp2_buy     = entry_c + atr * tp_mult2
tp3_buy     = entry_c + atr * tp_mult3
sl_sell     = entry_c + atr
tp1_sell    = entry_c - atr * tp_mult1
tp2_sell    = entry_c - atr * tp_mult2
tp3_sell    = entry_c - atr * tp_mult3

// ————— Plots
plotshape(buy_signal,  "LONG",  shape.labelup,   location.belowbar, color.new(#10b981,0), text="LONG",  textcolor=color.white, size=size.small)
plotshape(sell_signal, "SHORT", shape.labeldown, location.abovebar, color.new(#ff2a3b,0), text="SHORT", textcolor=color.white, size=size.small)

// ————— Dashboard
if show_dash
    sig_txt  = buy_signal ? "LONG 🟢" : sell_signal ? "SHORT 🔴" : "—"
    conf_txt = str.tostring(confidence) + "% (" + grade + ")"
    var table dash = table.new(position.top_right, 2, 5, border_width=1, border_color=color.new(color.gray,70))
    table.cell(dash, 0, 0, "AEMETH AI SIG",  text_color=color.new(#2563eb,0), text_size=size.small, bgcolor=color.new(#070b14,10))
    table.cell(dash, 1, 0, "v1.2.0",         text_color=color.silver,         text_size=size.small, bgcolor=color.new(#070b14,10))
    table.cell(dash, 0, 1, "Signal",          text_color=color.silver,         text_size=size.small, bgcolor=color.new(#0b1120,10))
    table.cell(dash, 1, 1, sig_txt,           text_color=color.white,          text_size=size.small, bgcolor=color.new(#0b1120,10))
    table.cell(dash, 0, 2, "AI Confidence",   text_color=color.silver,         text_size=size.small, bgcolor=color.new(#0b1120,10))
    table.cell(dash, 1, 2, conf_txt,          text_color=color.white,          text_size=size.small, bgcolor=color.new(#0b1120,10))

alertcondition(buy_signal,  "Aemeth AI — LONG",  "Aemeth AI Signal: LONG setup detected.")
alertcondition(sell_signal, "Aemeth AI — SHORT", "Aemeth AI Signal: SHORT setup detected.")
`,
    },
    'trendline-sr-utbot': {
      version: '4.2.0',
      changelog: 'v4.2.0: Integrated UT Bot trailing ATR stop with multi-swing trendline logic',
      content: `//@version=5
indicator("Aemeth Trendline Breakout + S/R + UT Bot", overlay=true, max_lines_count=100)

// ==========================================================================
// AEMETH TRADER ANALYSIS — TRENDLINE BREAKOUT + S/R + UT BOT v4.2.0
// Pine Script v5 | Closed-Bar Anti-Repaint | License: Personal Use
// ==========================================================================

// ————— Inputs
swing_len   = input.int(10,   "Swing Length",          minval=3)
atr_len     = input.int(14,   "ATR Length",            minval=1)
ut_sens     = input.float(1.0,"UT Bot ATR Sensitivity",minval=0.1)
show_sr     = input.bool(true, "Show S/R Levels")
show_tl     = input.bool(true, "Show Trendlines")
show_dash   = input.bool(true, "Show Dashboard")

// ————— ATR (closed bar)
atr         = ta.atr(atr_len)[1]
close_c     = close[1]

// ————— UT Bot Core (closed bar trailing stop)
trail_stop  = 0.0
ut_up       = close_c - ut_sens * atr
ut_dn       = close_c + ut_sens * atr
trail_stop  := close_c > nz(trail_stop[1]) ? math.max(nz(trail_stop[1]), ut_up) : math.min(nz(trail_stop[1]), ut_dn)

ut_buy      = close_c > trail_stop and close[2] <= trail_stop[1]
ut_sell     = close_c < trail_stop and close[2] >= trail_stop[1]

// ————— Swing High / Low for S/R
sw_high     = ta.pivothigh(high, swing_len, swing_len)
sw_low      = ta.pivotlow(low,   swing_len, swing_len)

// ————— Trendline Breakout (diagonal)
tl_break_up  = sw_low  and close[1] > sw_low
tl_break_dn  = sw_high and close[1] < sw_high

// ————— Plots
plot(trail_stop, "UT Trail", color=close[1] >= trail_stop ? color.new(#10b981,20) : color.new(#ff2a3b,20), style=plot.style_linebr, linewidth=2)

plotshape(ut_buy,  "BUY",  shape.labelup,   location.belowbar, color.new(#10b981,0), text="BUY",  textcolor=color.white, size=size.small)
plotshape(ut_sell, "SELL", shape.labeldown, location.abovebar, color.new(#ff2a3b,0), text="SELL", textcolor=color.white, size=size.small)

// ————— S/R Horizontal Levels
plot(show_sr ? sw_high : na, "Resistance", color=color.new(#ff2a3b,40), style=plot.style_circles, linewidth=2, offset=-swing_len)
plot(show_sr ? sw_low  : na, "Support",    color=color.new(#10b981,40), style=plot.style_circles, linewidth=2, offset=-swing_len)

// ————— Dashboard
if show_dash
    sig_txt = ut_buy ? "BUY 🟢" : ut_sell ? "SELL 🔴" : "—"
    var table dash = table.new(position.top_right, 2, 4, border_width=1, border_color=color.new(color.gray,70))
    table.cell(dash, 0, 0, "AEMETH TL+SR+UTB", text_color=color.new(#2563eb,0), text_size=size.small, bgcolor=color.new(#070b14,10))
    table.cell(dash, 1, 0, "v4.2.0",            text_color=color.silver,         text_size=size.small, bgcolor=color.new(#070b14,10))
    table.cell(dash, 0, 1, "Signal",             text_color=color.silver,         text_size=size.small, bgcolor=color.new(#0b1120,10))
    table.cell(dash, 1, 1, sig_txt,              text_color=color.white,          text_size=size.small, bgcolor=color.new(#0b1120,10))

alertcondition(ut_buy,  "Aemeth TL+SR+UTB — BUY",  "Aemeth UT Bot: BUY signal triggered.")
alertcondition(ut_sell, "Aemeth TL+SR+UTB — SELL", "Aemeth UT Bot: SELL signal triggered.")
`,
    },
    'smc-signal-panel-v2': {
      version: '2.1.0',
      changelog: 'v2.1.0: Real-time Signal Score panel & multi-timeframe ATR cooldown filtering',
      content: `//@version=5
indicator("Aemeth SMC Entry/TP/SL Signal Panel V2", overlay=true, max_boxes_count=50, max_lines_count=100)

// ==========================================================================
// AEMETH TRADER ANALYSIS — SMC SIGNAL PANEL V2 v2.1.0
// Pine Script v5 | Smart Money Concepts | Closed-Bar Anti-Repaint
// DISCLAIMER: Analytical tool. No guaranteed results. Trade at your own risk.
// License: Personal Use — Do Not Redistribute
// ==========================================================================

// ————— Inputs
swing_len   = input.int(10,    "Swing Lookback",           minval=3)
atr_len     = input.int(14,    "ATR Length",               minval=1)
atr_filter  = input.float(0.5, "ATR Filter Threshold",     minval=0.1)
cooldown    = input.int(5,     "Signal Cooldown (bars)",   minval=1)
rr_ratio    = input.float(2.0, "Risk:Reward Ratio",        minval=0.5)
show_fvg    = input.bool(true,  "Show Fair Value Gaps")
show_ob     = input.bool(true,  "Show Order Blocks")
show_dash   = input.bool(true,  "Show Signal Panel")
tp1_mult    = input.float(1.0,  "TP1 RR Multiplier")
tp2_mult    = input.float(1.5,  "TP2 RR Multiplier")
tp3_mult    = input.float(2.0,  "TP3 RR Multiplier")

// ————— Market Structure (closed bar)
atr         = ta.atr(atr_len)[1]
sw_high     = ta.pivothigh(high, swing_len, swing_len)
sw_low      = ta.pivotlow(low,   swing_len, swing_len)

bos_bull    = not na(sw_low)  and close[1] > sw_low  and high[1] > ta.highest(high, swing_len)[2]
bos_bear    = not na(sw_high) and close[1] < sw_high and low[1]  < ta.lowest(low,  swing_len)[2]

// ————— ATR Volatility Filter
vol_pass    = atr >= atr_filter * ta.atr(atr_len * 3)[1]

// ————— Cooldown counter (prevent signal clusters)
var int bars_since = 0
bars_since := bars_since + 1
buy_raw     = bos_bull and vol_pass and bars_since >= cooldown
sell_raw    = bos_bear and vol_pass and bars_since >= cooldown

buy_signal  = buy_raw
sell_signal = sell_raw

if buy_signal or sell_signal
    bars_since := 0

// ————— Entry / SL / TP levels
sl_dist     = atr
entry_c     = close[1]
sl_buy      = entry_c - sl_dist
sl_sell     = entry_c + sl_dist

tp1_buy     = entry_c + sl_dist * tp1_mult * rr_ratio
tp2_buy     = entry_c + sl_dist * tp2_mult * rr_ratio
tp3_buy     = entry_c + sl_dist * tp3_mult * rr_ratio
tp1_sell    = entry_c - sl_dist * tp1_mult * rr_ratio
tp2_sell    = entry_c - sl_dist * tp2_mult * rr_ratio
tp3_sell    = entry_c - sl_dist * tp3_mult * rr_ratio

// ————— Fair Value Gap (closed bar)
bull_fvg    = low[1] > high[3]
bear_fvg    = high[1] < low[3]

if show_fvg and bull_fvg
    box.new(bar_index[2], low[1], bar_index, high[3], border_color=color.new(#10b981,50), bgcolor=color.new(#10b981,80))
if show_fvg and bear_fvg
    box.new(bar_index[2], high[1], bar_index, low[3], border_color=color.new(#ff2a3b,50), bgcolor=color.new(#ff2a3b,80))

// ————— Order Block (last swing before BOS)
if show_ob and bos_bull and not na(sw_low)
    box.new(bar_index[swing_len], low[swing_len], bar_index, high[swing_len], border_color=color.new(#3b82f6,40), bgcolor=color.new(#3b82f6,85), border_style=line.style_dashed)
if show_ob and bos_bear and not na(sw_high)
    box.new(bar_index[swing_len], low[swing_len], bar_index, high[swing_len], border_color=color.new(#f59e0b,40), bgcolor=color.new(#f59e0b,85), border_style=line.style_dashed)

// ————— Signal Shapes
plotshape(buy_signal,  "BUY",  shape.labelup,   location.belowbar, color.new(#10b981,0), text="BUY",  textcolor=color.white, size=size.normal)
plotshape(sell_signal, "SELL", shape.labeldown, location.abovebar, color.new(#ff2a3b,0), text="SELL", textcolor=color.white, size=size.normal)

// ————— Signal Score (composite)
rsi_score   = buy_signal ? ta.rsi(close[1], 14) / 100 : sell_signal ? (100 - ta.rsi(close[1], 14)) / 100 : 0.0
atr_score   = vol_pass ? 1.0 : 0.5
sig_score   = math.round((rsi_score * 50 + atr_score * 50))

// ————— Live Signal Panel
if show_dash
    sig_txt   = buy_signal ? "BUY 🟢" : sell_signal ? "SELL 🔴" : "—"
    score_txt = str.tostring(sig_score) + " / 100"
    var table panel = table.new(position.top_right, 2, 7, border_width=1, border_color=color.new(color.gray,70))
    table.cell(panel, 0, 0, "AEMETH SMC V2",   text_color=color.new(#2563eb,0), text_size=size.small, bgcolor=color.new(#070b14,10))
    table.cell(panel, 1, 0, "v2.1.0",           text_color=color.silver,         text_size=size.small, bgcolor=color.new(#070b14,10))
    table.cell(panel, 0, 1, "Signal",            text_color=color.silver,         text_size=size.small, bgcolor=color.new(#0b1120,10))
    table.cell(panel, 1, 1, sig_txt,             text_color=color.white,          text_size=size.small, bgcolor=color.new(#0b1120,10))
    table.cell(panel, 0, 2, "Signal Score",      text_color=color.silver,         text_size=size.small, bgcolor=color.new(#0b1120,10))
    table.cell(panel, 1, 2, score_txt,           text_color=color.white,          text_size=size.small, bgcolor=color.new(#0b1120,10))
    table.cell(panel, 0, 3, "ATR Filter",        text_color=color.silver,         text_size=size.small, bgcolor=color.new(#0b1120,10))
    table.cell(panel, 1, 3, vol_pass ? "Pass ✓" : "Weak", text_color=vol_pass ? color.new(#10b981,0) : color.silver, text_size=size.small, bgcolor=color.new(#0b1120,10))

alertcondition(buy_signal,  "Aemeth SMC V2 — BUY",  "Aemeth SMC V2: BUY structure breakout signal.")
alertcondition(sell_signal, "Aemeth SMC V2 — SELL", "Aemeth SMC V2: SELL structure breakout signal.")
`,
    },
    'supertrend-tpsl': {
      version: '1.0.0',
      changelog: 'v1.0.0: Initial release of Aemeth Supertrend TP/SL Indicator',
      content: `//@version=5
indicator("Aemeth Supertrend TP/SL Indicator", overlay=true)
// =====================================================================
// AEMETH TRADER ANALYSIS - SUPERTREND TP/SL ENGINE V1
// DIRECTIVE: CANDLE 1 CLOSED BAR ANTI-REPAINT VERIFICATION
// =====================================================================

atr_period = input.int(10, "ATR Period", minval=1)
factor = input.float(3.0, "Supertrend Factor", minval=0.1, step=0.1)

[supertrend, direction] = ta.supertrend(factor, atr_period)
trend_bull = direction < 0
trend_bear = direction > 0

plot(trend_bull ? supertrend : na, "Supertrend Bullish", color=color.new(#10b981, 0), linewidth=2, style=plot.style_linebr)
plot(trend_bear ? supertrend : na, "Supertrend Bearish", color=color.new(#ef4444, 0), linewidth=2, style=plot.style_linebr)

bear_entry = ta.crossunder(close[1], supertrend[1]) and trend_bear
bull_entry = ta.crossover(close[1], supertrend[1]) and trend_bull

var float entry_price = na
var float sl_level = na
var float tp1_level = na
var float tp2_level = na
var float tp3_level = na

if bear_entry
    entry_price := close[1]
    sl_level := supertrend[1]
    risk = math.abs(sl_level - entry_price)
    tp1_level := entry_price - risk * 1.0
    tp2_level := entry_price - risk * 2.0
    tp3_level := entry_price - risk * 3.0

if bull_entry
    entry_price := close[1]
    sl_level := supertrend[1]
    risk = math.abs(entry_price - sl_level)
    tp1_level := entry_price + risk * 1.0
    tp2_level := entry_price + risk * 2.0
    tp3_level := entry_price + risk * 3.0

plotshape(bear_entry, "Bearish Entry", shape.labeldown, location.abovebar, color=#ef4444, text="Supertrend ⇩\\nEntry", textcolor=color.white, size=size.normal)
plotshape(bull_entry, "Bullish Entry", shape.labelup, location.belowbar, color=#10b981, text="Supertrend ⇧\\nEntry", textcolor=color.white, size=size.normal)

alertcondition(bear_entry, "Aemeth Supertrend Bearish Entry", "Aemeth Supertrend: Bearish breakdown confirmed.")
alertcondition(bull_entry, "Aemeth Supertrend Bullish Entry", "Aemeth Supertrend: Bullish breakout confirmed.")
`,
    },
    'vwap-reversal-tpsl': {
      version: '1.0.0',
      changelog: 'v1.0.0: Initial release of Aemeth VWAP Reversal TP/SL Indicator',
      content: `//@version=5
indicator("Aemeth VWAP Reversal TP/SL Indicator", overlay=true)
// =====================================================================
// AEMETH TRADER ANALYSIS - VWAP REVERSAL TP/SL ENGINE V1
// DIRECTIVE: CANDLE 1 CLOSED BAR ANTI-REPAINT VERIFICATION
// =====================================================================

vwap_val = ta.vwap(hlc3)
plot(vwap_val, "VWAP", color=color.new(#3b82f6, 0), linewidth=2)

vwap_cross_bear = ta.crossunder(close[1], vwap_val[1])
vwap_cross_bull = ta.crossover(close[1], vwap_val[1])

var float entry_p = na
var float sl_p = na
var float tp1_p = na
var float tp2_p = na
var float tp3_p = na

if vwap_cross_bear
    entry_p := close[1]
    sl_p := vwap_val[1]
    risk = math.abs(sl_p - entry_p)
    tp1_p := entry_p - risk * 1.0
    tp2_p := entry_p - risk * 2.0
    tp3_p := entry_p - risk * 3.0

if vwap_cross_bull
    entry_p := close[1]
    sl_p := vwap_val[1]
    risk = math.abs(entry_p - sl_p)
    tp1_p := entry_p + risk * 1.0
    tp2_p := entry_p + risk * 2.0
    tp3_p := entry_p + risk * 3.0

plotshape(vwap_cross_bear, "VWAP Bearish Reversal", shape.labeldown, location.abovebar, color=#ef4444, text="VWAP ⇩\\nEntry", textcolor=color.white, size=size.normal)
plotshape(vwap_cross_bull, "VWAP Bullish Reversal", shape.labelup, location.belowbar, color=#10b981, text="VWAP ⇧\\nEntry", textcolor=color.white, size=size.normal)

alertcondition(vwap_cross_bear, "Aemeth VWAP Bearish Cross", "Aemeth VWAP: Bearish reversal breakdown detected.")
alertcondition(vwap_cross_bull, "Aemeth VWAP Bullish Cross", "Aemeth VWAP: Bullish reversal breakout detected.")
`,
    },
    'major-swing': {
      version: '1.0.0',
      changelog: 'v1.0.0: Initial release of Aemeth Major Swing Indicator',
      content: `//@version=5
indicator("Aemeth Major Swing Indicator", overlay=true)
// =====================================================================
// AEMETH TRADER ANALYSIS - MAJOR SWING STRUCTURAL ENGINE V1
// DIRECTIVE: CONFIRMED PIVOT HIGH / LOW FILTERING
// =====================================================================

swing_len = input.int(7, "Swing Lookback Length", minval=2)
ph = ta.pivothigh(high, swing_len, swing_len)
pl = ta.pivotlow(low, swing_len, swing_len)

plotshape(not na(ph), "Swing High (Sell)", shape.labeldown, location.abovebar, color=#00e5ff, text="sell", textcolor=color.black, size=size.small, offset=-swing_len)
plotshape(not na(pl), "Swing Low (Buy)", shape.labelup, location.belowbar, color=#00e5ff, text="buy", textcolor=color.black, size=size.small, offset=-swing_len)

alertcondition(not na(ph), "Major Swing High Detected", "Aemeth Major Swing: Significant swing high confirmed.")
alertcondition(not na(pl), "Major Swing Low Detected", "Aemeth Major Swing: Significant swing low confirmed.")
`,
    },
    'stochastic-cross-tpsl': {
      version: '1.0.0',
      changelog: 'v1.0.0: Initial release of Aemeth Stochastic Cross TP/SL Indicator',
      content: `//@version=5
indicator("Aemeth Stochastic Cross TP/SL Indicator", overlay=true)
// =====================================================================
// AEMETH TRADER ANALYSIS - STOCHASTIC CROSS TP/SL ENGINE V1
// =====================================================================

periodK = input.int(14, "%K Length", minval=1)
smoothK = input.int(3, "%K Smoothing", minval=1)
periodD = input.int(3, "%D Smoothing", minval=1)

k = ta.sma(ta.stoch(close, high, low, periodK), smoothK)
d = ta.sma(k, periodD)

stoch_bear_cross = ta.crossunder(k[1], d[1]) and k[1] > 70
stoch_bull_cross = ta.crossover(k[1], d[1]) and k[1] < 30

atr_val = ta.atr(14)
var float entry_lvl = na
var float sl_lvl = na
var float tp1_lvl = na
var float tp2_lvl = na
var float tp3_lvl = na

if stoch_bear_cross
    entry_lvl := close[1]
    sl_lvl := high[1] + atr_val * 1.0
    risk = math.abs(sl_lvl - entry_lvl)
    tp1_lvl := entry_lvl - risk * 1.0
    tp2_lvl := entry_lvl - risk * 2.0
    tp3_lvl := entry_lvl - risk * 3.0

if stoch_bull_cross
    entry_lvl := close[1]
    sl_lvl := low[1] - atr_val * 1.0
    risk = math.abs(entry_lvl - sl_lvl)
    tp1_lvl := entry_lvl + risk * 1.0
    tp2_lvl := entry_lvl + risk * 2.0
    tp3_lvl := entry_lvl + risk * 3.0

plotshape(stoch_bear_cross, "Stoch Bear Cross", shape.labeldown, location.abovebar, color=#ef4444, text="Stoch Cross ⇩\\nEntry", textcolor=color.white, size=size.normal)
plotshape(stoch_bull_cross, "Stoch Bull Cross", shape.labelup, location.belowbar, color=#10b981, text="Stoch Cross ⇧\\nEntry", textcolor=color.white, size=size.normal)

alertcondition(stoch_bear_cross, "Stochastic Bearish Cross", "Aemeth Stoch: Bearish crossover with entry and TP/SL levels.")
alertcondition(stoch_bull_cross, "Stochastic Bullish Cross", "Aemeth Stoch: Bullish crossover with entry and TP/SL levels.")
`,
    },
    'crt-entry-tpsl': {
      version: '1.0.0',
      changelog: 'v1.0.0: Initial release of Aemeth CRT Entry TP/SL Indicator',
      content: `//@version=5
indicator("Aemeth CRT Entry TP/SL Indicator", overlay=true)
// =====================================================================
// AEMETH TRADER ANALYSIS - CANDLE RANGE THEORY (CRT) ENGINE V1
// =====================================================================

crt_lookback = input.int(5, "CRT Range Lookback Candles", minval=2)
range_high = ta.highest(high[1], crt_lookback)
range_low = ta.lowest(low[1], crt_lookback)

crt_bear = close[1] < range_low and high[1] >= range_low
crt_bull = close[1] > range_high and low[1] <= range_high

var float crt_entry = na
var float crt_sl = na
var float crt_tp1 = na
var float crt_tp2 = na
var float crt_tp3 = na

if crt_bear
    crt_entry := close[1]
    crt_sl := range_high
    risk = math.abs(crt_sl - crt_entry)
    crt_tp1 := crt_entry - risk * 1.0
    crt_tp2 := crt_entry - risk * 2.0
    crt_tp3 := crt_entry - risk * 3.0

if crt_bull
    crt_entry := close[1]
    crt_sl := range_low
    risk = math.abs(crt_entry - crt_sl)
    crt_tp1 := crt_entry + risk * 1.0
    crt_tp2 := crt_entry + risk * 2.0
    crt_tp3 := crt_entry + risk * 3.0

plotshape(crt_bear, "CRT Bearish Setup", shape.labeldown, location.abovebar, color=#9333ea, text="CRT\\nEntry", textcolor=color.white, size=size.normal)
plotshape(crt_bull, "CRT Bullish Setup", shape.labelup, location.belowbar, color=#9333ea, text="CRT\\nEntry", textcolor=color.white, size=size.normal)

alertcondition(crt_bear, "CRT Bearish Setup Alert", "Aemeth CRT: Bearish range expansion triggered.")
alertcondition(crt_bull, "CRT Bullish Setup Alert", "Aemeth CRT: Bullish range expansion triggered.")
`,
    },
    'rsi-reversal-tpsl': {
      version: '1.0.0',
      changelog: 'v1.0.0: Initial release of Aemeth RSI Reversal TP/SL Indicator',
      content: `//@version=5
indicator("Aemeth RSI Reversal TP/SL Indicator", overlay=true)
// =====================================================================
// AEMETH TRADER ANALYSIS - RSI REVERSAL TP/SL ENGINE V1
// =====================================================================

rsi_period = input.int(14, "RSI Period", minval=1)
rsi_val = ta.rsi(close[1], rsi_period)

rsi_bull_reversal = ta.crossover(rsi_val, 30)
rsi_bear_reversal = ta.crossunder(rsi_val, 70)

atr_val = ta.atr(14)
var float rsi_entry = na
var float rsi_sl = na
var float rsi_tp1 = na
var float rsi_tp2 = na
var float rsi_tp3 = na

if rsi_bull_reversal
    rsi_entry := close[1]
    rsi_sl := low[1] - atr_val * 1.2
    risk = math.abs(rsi_entry - rsi_sl)
    rsi_tp1 := rsi_entry + risk * 1.0
    rsi_tp2 := rsi_entry + risk * 2.0
    rsi_tp3 := rsi_entry + risk * 3.0

if rsi_bear_reversal
    rsi_entry := close[1]
    rsi_sl := high[1] + atr_val * 1.2
    risk = math.abs(rsi_sl - rsi_entry)
    rsi_tp1 := rsi_entry - risk * 1.0
    rsi_tp2 := rsi_entry - risk * 2.0
    rsi_tp3 := rsi_entry - risk * 3.0

plotshape(rsi_bull_reversal, "RSI Bull Reversal", shape.labelup, location.belowbar, color=#10b981, text="RSI ⇧\\nEntry", textcolor=color.white, size=size.normal)
plotshape(rsi_bear_reversal, "RSI Bear Reversal", shape.labeldown, location.abovebar, color=#ef4444, text="RSI ⇩\\nEntry", textcolor=color.white, size=size.normal)

alertcondition(rsi_bull_reversal, "Aemeth RSI Bullish Reversal", "Aemeth RSI: Oversold exit confirmed with TP/SL targets.")
alertcondition(rsi_bear_reversal, "Aemeth RSI Bearish Reversal", "Aemeth RSI: Overbought exit confirmed with TP/SL targets.")
`,
    },
    'macd-crossover-v1': {
      version: '1.0.0',
      changelog: 'v1.0.0: Initial release of Aemeth MACD Crossover V1 by RIDHO',
      content: `//@version=5
indicator("Aemeth MACD Crossover V1 by RIDHO", overlay=true)
// =====================================================================
// AEMETH TRADER ANALYSIS - MACD CROSSOVER V1 BY RIDHO
// DIRECTIVE: CANDLE 1 CLOSED BAR ANTI-REPAINT VERIFICATION
// =====================================================================

grp_macd = "MACD Settings"
fast_len = input.int(12, "Fast Length", minval=1, group=grp_macd)
slow_len = input.int(26, "Slow Length", minval=1, group=grp_macd)
sig_len  = input.int(9, "Signal Length", minval=1, group=grp_macd)
conf_close = input.bool(true, "Confirm Signal on Candle Close", group=grp_macd)

grp_targets = "Risk / Reward & Stop Loss"
atr_len = input.int(14, "ATR Period", minval=1, group=grp_targets)
atr_mult = input.float(1.5, "ATR Multiplier (SL)", minval=0.5, step=0.1, group=grp_targets)
rr_ratio = input.float(1.5, "Risk/Reward Ratio", minval=0.5, step=0.1, group=grp_targets)

[macd_line, signal_line, hist] = ta.macd(close, fast_len, slow_len, sig_len)

ref_close = conf_close ? close[1] : close
ref_macd  = conf_close ? macd_line[1] : macd_line
ref_sig   = conf_close ? signal_line[1] : signal_line

bull_cross = ta.crossover(ref_macd, ref_sig)
bear_cross = ta.crossunder(ref_macd, ref_sig)

atr_val = ta.atr(atr_len)
var float entry_price = na
var float sl_price = na
var float tp1_price = na
var float tp2_price = na
var float tp3_price = na

if bull_cross
    entry_price := ref_close
    sl_price := entry_price - (atr_val * atr_mult)
    risk = math.abs(entry_price - sl_price)
    tp1_price := entry_price + (risk * 1.0 * rr_ratio)
    tp2_price := entry_price + (risk * 2.0 * rr_ratio)
    tp3_price := entry_price + (risk * 3.0 * rr_ratio)

if bear_cross
    entry_price := ref_close
    sl_price := entry_price + (atr_val * atr_mult)
    risk = math.abs(sl_price - entry_price)
    tp1_price := entry_price - (risk * 1.0 * rr_ratio)
    tp2_price := entry_price - (risk * 2.0 * rr_ratio)
    tp3_price := entry_price - (risk * 3.0 * rr_ratio)

plotshape(bull_cross, "Bullish Crossover", shape.triangleup, location.belowbar, color=#10b981, size=size.small, text="MACD BUY\\nGrade A")
plotshape(bear_cross, "Bearish Crossover", shape.triangledown, location.abovebar, color=#ef4444, size=size.small, text="MACD SELL\\nGrade A")

alertcondition(bull_cross, "Aemeth MACD Bullish Crossover", "Aemeth MACD: Bullish crossover confirmed.")
alertcondition(bear_cross, "Aemeth MACD Bearish Crossover", "Aemeth MACD: Bearish crossover confirmed.")
`,
    },
    'hull-suite-v1': {
      version: '1.0.0',
      changelog: 'v1.0.0: Initial release of Aemeth Hull Suite V1',
      content: `//@version=5
indicator("Aemeth Hull Suite V1", overlay=true)
// =====================================================================
// AEMETH TRADER ANALYSIS - HULL SUITE V1
// DIRECTIVE: HULL MOVING AVERAGE SMOOTHED TREND BAND
// =====================================================================

hull_len = input.int(55, "Hull MA Length", minval=1)
hma = ta.wma(2 * ta.wma(close, hull_len / 2) - ta.wma(close, hull_len), math.round(math.sqrt(hull_len)))

is_bull = hma > hma[1]
hma_color = is_bull ? color.new(#10b981, 0) : color.new(#ef4444, 0)

plot(hma, "Hull Suite MA", color=hma_color, linewidth=3)

hull_buy = is_bull and not is_bull[1]
hull_sell = not is_bull and is_bull[1]

var float entry_p = na
var float sl_p = na
var float tp1_p = na
var float tp2_p = na
var float tp3_p = na

if hull_buy
    entry_p := close[1]
    sl_p := hma[1]
    risk = math.abs(entry_p - sl_p)
    tp1_p := entry_p + risk * 1.5
    tp2_p := entry_p + risk * 2.0
    tp3_p := entry_p + risk * 2.5

plotshape(hull_buy, "Hull BUY", shape.labelup, location.belowbar, color=#00e5ff, text="BUY", textcolor=color.black, size=size.small)
plotshape(hull_sell, "Hull SELL", shape.labeldown, location.abovebar, color=#ef4444, text="SELL", textcolor=color.white, size=size.small)

alertcondition(hull_buy, "Hull Suite BUY Signal", "Aemeth Hull Suite: Bullish trend transition detected.")
alertcondition(hull_sell, "Hull Suite SELL Signal", "Aemeth Hull Suite: Bearish trend transition detected.")
`,
    },
    'ema-ribbon-flow': {
      version: '1.0.0',
      changelog: 'v1.0.0: Initial release of Aemeth EMA Ribbon Flow',
      content: `//@version=5
indicator("Aemeth EMA Ribbon Flow", overlay=true)
// =====================================================================
// AEMETH TRADER ANALYSIS - EMA RIBBON FLOW ENGINE
// =====================================================================

ema05 = ta.ema(close, 5)
ema10 = ta.ema(close, 10)
ema15 = ta.ema(close, 15)
ema20 = ta.ema(close, 20)
ema25 = ta.ema(close, 25)
ema30 = ta.ema(close, 30)
ema35 = ta.ema(close, 35)
ema40 = ta.ema(close, 40)
ema45 = ta.ema(close, 45)
ema50 = ta.ema(close, 50)

is_bull = ema05 > ema50
c_ribbon = is_bull ? color.new(#10b981, 20) : color.new(#ef4444, 20)

plot(ema05, "EMA 05", color=c_ribbon, linewidth=1)
plot(ema10, "EMA 10", color=c_ribbon, linewidth=1)
plot(ema15, "EMA 15", color=c_ribbon, linewidth=1)
plot(ema20, "EMA 20", color=c_ribbon, linewidth=1)
plot(ema25, "EMA 25", color=c_ribbon, linewidth=1)
plot(ema30, "EMA 30", color=c_ribbon, linewidth=1)
plot(ema35, "EMA 35", color=c_ribbon, linewidth=1)
plot(ema40, "EMA 40", color=c_ribbon, linewidth=1)
plot(ema45, "EMA 45", color=c_ribbon, linewidth=1)
plot(ema50, "EMA 50", color=c_ribbon, linewidth=2)

ribbon_buy = ta.crossover(ema05, ema50)
ribbon_sell = ta.crossunder(ema05, ema50)

plotshape(ribbon_buy, "Ribbon BUY", shape.labelup, location.belowbar, color=#10b981, text="BUY", textcolor=color.white, size=size.small)
plotshape(ribbon_sell, "Ribbon SELL", shape.labeldown, location.abovebar, color=#ef4444, text="SELL", textcolor=color.white, size=size.small)

alertcondition(ribbon_buy, "EMA Ribbon BUY", "Aemeth EMA Ribbon: Bullish expansion triggered.")
alertcondition(ribbon_sell, "EMA Ribbon SELL", "Aemeth EMA Ribbon: Bearish expansion triggered.")
`,
    },
    'ema-crossover-rsi': {
      version: '1.0.0',
      changelog: 'v1.0.0: Initial release of Aemeth EMA Crossover + RSI',
      content: `//@version=5
indicator("Aemeth EMA Crossover + RSI", overlay=true)
// =====================================================================
// AEMETH TRADER ANALYSIS - EMA CROSSOVER + RSI ENGINE
// =====================================================================

len_fast = input.int(20, "EMA Fast Length", minval=1)
len_slow = input.int(50, "EMA Slow Length", minval=1)
rsi_period = input.int(14, "RSI Filter Period", minval=1)

ema_fast = ta.ema(close, len_fast)
ema_slow = ta.ema(close, len_slow)
rsi_val  = ta.rsi(close, rsi_period)

plot(ema_fast, "EMA Fast 20", color=color.new(#facc15, 0), linewidth=2)
plot(ema_slow, "EMA Slow 50", color=color.new(#f97316, 0), linewidth=2)

bear_cross = ta.crossunder(ema_fast[1], ema_slow[1]) and rsi_val[1] < 50
bull_cross = ta.crossover(ema_fast[1], ema_slow[1]) and rsi_val[1] > 50

atr_val = ta.atr(14)
var float entry_p = na
var float sl_p = na
var float tp1_p = na
var float tp2_p = na
var float tp3_p = na

if bear_cross
    entry_p := close[1]
    sl_p := ema_slow[1] + atr_val * 0.5
    risk = math.abs(sl_p - entry_p)
    tp1_p := entry_p - risk * 1.0
    tp2_p := entry_p - risk * 2.0
    tp3_p := entry_p - risk * 3.0

if bull_cross
    entry_p := close[1]
    sl_p := ema_slow[1] - atr_val * 0.5
    risk = math.abs(entry_p - sl_p)
    tp1_p := entry_p + risk * 1.0
    tp2_p := entry_p + risk * 2.0
    tp3_p := entry_p + risk * 3.0

plotshape(bear_cross, "EMA Bear Cross", shape.circle, location.abovebar, color=#00e5ff, size=size.tiny)
plotshape(bull_cross, "EMA Bull Cross", shape.circle, location.belowbar, color=#00e5ff, size=size.tiny)

alertcondition(bear_cross, "EMA Bearish Crossover", "Aemeth EMA: Bearish crossover with RSI filter confirmed.")
alertcondition(bull_cross, "EMA Bullish Crossover", "Aemeth EMA: Bullish crossover with RSI filter confirmed.")
`,
    },
  };

  for (const [productId, info] of Object.entries(PINE_SCRIPTS)) {
    insertVersion.run(
      `pv_${productId.replace(/-/g, '_')}_${info.version.replace(/\./g, '_')}`,
      productId,
      info.version,
      info.changelog,
      info.content
    );
  }
  console.log('[DB] Seeded Pine Script v5 source code for all 6 products.');
}
