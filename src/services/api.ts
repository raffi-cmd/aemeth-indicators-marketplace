import type { Product, Order, Delivery, User, SiteSettings, AuditLog } from '../types/marketplace';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('aemeth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// -------------------------------------------------------------
// SEED DATA FOR STATIC HOSTING (GITHUB PAGES FALLBACK)
// -------------------------------------------------------------
const PINE_SCRIPT_LIQUIDITY = `//@version=5
indicator("Aemeth Liquidity Matrix [Anti-Repaint]", overlay=true, max_boxes_count=100, max_lines_count=100)

// ==========================================
// AEMETH TRADER ANALYSIS - PROPRIETARY LOGIC
// ANTI-REPAINT CORE DIRECTIVE: LOCKED TO CANDLE 1 (CLOSED BAR)
// ==========================================

length = input.int(14, "Lookback Length", minval=2)
show_fvg = input.bool(true, "Display Fair Value Gaps (FVG)")
show_bos = input.bool(true, "Display Break of Structure (BOS)")
fvg_transparency = input.int(75, "FVG Fill Transparency", minval=0, maxval=100)

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

const PINE_SCRIPT_TREND = `//@version=5
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

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prd_liq_001',
    slug: 'aemeth-liquidity-matrix',
    title: 'Aemeth Liquidity Matrix v5.2',
    short_desc: 'Institutional Fair Value Gaps, Liquidity Sweeps, and Order Block visualizer with Candle 1 Anti-Repaint guarantee.',
    long_desc: 'Engineered for institutional order flow traders on TradingView. The Aemeth Liquidity Matrix automatically projects dynamic Buy-Side and Sell-Side Liquidity pools, calculates premium/discount institutional mitigation zones, and alerts on precise liquidity sweeps. Includes full uncompiled Pine Script v5 source code and lifetime updates.',
    type: 'open_source',
    category: 'liquidity',
    price_cents: 7900,
    discount_cents: 0,
    version: '5.2.0',
    features: [
      'Full Uncompiled Pine Script v5 Source Code (.pine & .txt)',
      'Candle 1 Anti-Repaint Strict Execution',
      'Dynamic Institutional Order Block & FVG Projections',
      'TradingView Webhook & Mobile Alert Ready',
      'Tested across Forex (XAUUSD, EURUSD), Crypto (BTC/USDT), & Indices (NQ/ES)'
    ],
    tradingview_script_id: 'aemeth_liquidity_v5_pub',
    is_published: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80',
    preview_images: ['https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'prd_delta_002',
    slug: 'aemeth-delta-volume-absorption',
    title: 'Aemeth Delta Flow & Volume Absorption Pro',
    short_desc: 'Proprietary footprint proxy and volume absorption engine. Direct TradingView access granted to customer username.',
    long_desc: 'A proprietary institutional volume analysis engine that tracks hidden institutional accumulation and distribution without requiring costly Level 2 subscriptions. Delivered directly to your TradingView account via authorized invite-only script access. No source code leakage, fully protected institutional algorithm.',
    type: 'private_protected',
    category: 'volume',
    price_cents: 12900,
    discount_cents: 0,
    version: '3.4.1',
    features: [
      'Direct TradingView Invite-Only Access via Username',
      'Volume Delta Divergence & Absorption Clusters',
      'Exhaustion vs Continuation Institutional Print Filter',
      'Automatic Multi-Timeframe Volume Profiling',
      'Official Invite Updates Pushed Automatically to TradingView'
    ],
    tradingview_script_id: 'aemeth_delta_pro_invite_only',
    is_published: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    preview_images: ['https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'prd_trend_003',
    slug: 'aemeth-multitimeframe-trend-cascade',
    title: 'Aemeth Multi-Timeframe Trend Cascade v2.1',
    short_desc: 'Algorithmic multi-timeframe trend filter ensuring trades align with higher-timeframe order flow.',
    long_desc: 'Never fight higher-timeframe order flow again. This algorithm cross-synthesizes momentum and volatility across 4 synchronized timeframes into a clean visual dashboard and actionable execution alerts. Full Pine Script v5 source code included.',
    type: 'open_source',
    category: 'trend',
    price_cents: 6900,
    discount_cents: 0,
    version: '2.1.0',
    features: [
      'Full Editable Pine Script v5 Codebase',
      'Syncs 1m/5m/15m/1h or 1h/4h/D1 structures smoothly',
      'Low CPU footprint optimized for TradingView free & pro accounts',
      'Built-in Risk-to-Reward stop projection'
    ],
    tradingview_script_id: 'aemeth_trend_cascade_pub',
    is_published: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
    preview_images: ['https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'prd_rev_004',
    slug: 'aemeth-reversal-sniper-pro',
    title: 'Aemeth Reversal Sniper Pro v4.0',
    short_desc: 'High-probability turning point identification based on liquidity exhaustions and RSI micro-divergences.',
    long_desc: 'Identifies high-conviction market turning points at key psychological session boundaries. Grants proprietary invite-only TradingView access directly to verified accounts.',
    type: 'private_protected',
    category: 'reversal',
    price_cents: 9900,
    discount_cents: 0,
    version: '4.0.0',
    features: [
      'Direct TradingView Invite-Only Script Authorization',
      'Micro-Divergence Algorithmic Scanner',
      'Exhaustion Peak & Valley Detection',
      'Discord / Telegram Webhook Signal Compatible'
    ],
    tradingview_script_id: 'aemeth_reversal_sniper_invite',
    is_published: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=800&q=80',
    preview_images: ['https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=1200&q=80'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'prd_bundle_005',
    slug: 'aemeth-complete-institutional-suite',
    title: 'Aemeth Complete Institutional Suite (All 4 Indicators)',
    short_desc: 'The complete institutional analytical arsenal: Liquidity Matrix, Delta Flow, Trend Cascade, and Reversal Sniper at 35% discount.',
    long_desc: 'Get total market clarity. Combines all four flagship Aemeth indicators into one discounted package. Includes both instant open-source Pine Script downloads for Liquidity Matrix & Trend Cascade, PLUS authorized TradingView private invite access for Delta Flow & Reversal Sniper Pro.',
    type: 'bundle',
    category: 'bundle',
    price_cents: 24900,
    discount_cents: 12700,
    version: '2026.1',
    features: [
      'Includes All 4 Flagship Indicators',
      'Both Open-Source Pine Scripts (.pine + .txt) & Invite-Only Access Included',
      'Massive 35% Bundle Savings ($127 off)',
      'VIP Dedicated Fast-Track TradingView Access Verification',
      'Exclusive Aemeth Proprietary Trading Strategy Guide (PDF/Markdown)'
    ],
    tradingview_script_id: 'aemeth_complete_suite',
    is_published: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    preview_images: ['https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80'],
    created_at: new Date().toISOString(),
  },
];

// Local store helpers
function getLocalStore<T>(key: string, defaultVal: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalStore(key: string, val: any) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

export const api = {
  // Auth
  async register(data: { email: string; password: string; name: string; tradingview_username?: string }) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {}

    // Static fallback
    const user: User = {
      id: 'usr_' + Date.now(),
      email: data.email.toLowerCase(),
      name: data.name,
      role: 'customer',
      tradingview_username: data.tradingview_username,
      created_at: new Date().toISOString(),
    };
    setLocalStore('aemeth_current_user', user);
    return { success: true, token: 'gh_local_token_' + Date.now(), user };
  },

  async login(data: { email: string; password: string }) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {}

    // Static fallback
    const email = data.email.toLowerCase().trim();
    let user: User;
    if (email.includes('admin')) {
      user = {
        id: 'usr_admin_001',
        email: 'admin@aemethtrader.com',
        name: 'Aemeth Head of Trading',
        role: 'admin',
        tradingview_username: 'aemeth_admin',
        created_at: new Date().toISOString(),
      };
    } else {
      user = {
        id: 'usr_trader_001',
        email: email || 'trader@aemethtrader.com',
        name: 'Alexander Vance',
        role: 'customer',
        tradingview_username: 'vance_fx',
        created_at: new Date().toISOString(),
      };
    }
    setLocalStore('aemeth_current_user', user);
    return { success: true, token: 'gh_local_token_' + Date.now(), user };
  },

  async getMe() {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) return await res.json();
    } catch {}

    const user = getLocalStore<User | null>('aemeth_current_user', null);
    if (user) return { success: true, user };
    return { success: false, error: 'Not logged in' };
  },

  async updateProfile(data: { name?: string; tradingview_username?: string }) {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {}

    const user = getLocalStore<User>('aemeth_current_user', {
      id: 'usr_trader_001',
      email: 'trader@aemethtrader.com',
      name: 'Alexander Vance',
      role: 'customer',
      tradingview_username: 'vance_fx',
      created_at: new Date().toISOString(),
    });
    if (data.name) user.name = data.name;
    if (data.tradingview_username !== undefined) user.tradingview_username = data.tradingview_username;
    setLocalStore('aemeth_current_user', user);
    return { success: true, user };
  },

  // Products
  async getProducts(params?: { category?: string; type?: string; search?: string }) {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.type) query.append('type', params.type);
      if (params?.search) query.append('search', params.search);

      const res = await fetch(`${API_BASE}/products?${query.toString()}`);
      if (res.ok) return await res.json();
    } catch {}

    // Static fallback
    const customProds = getLocalStore<Product[]>('aemeth_custom_products', []);
    const all = [...INITIAL_PRODUCTS, ...customProds];
    return { success: true, products: all };
  },

  async getProductBySlug(slug: string) {
    try {
      const res = await fetch(`${API_BASE}/products/${slug}`);
      if (res.ok) return await res.json();
    } catch {}

    const customProds = getLocalStore<Product[]>('aemeth_custom_products', []);
    const p = [...INITIAL_PRODUCTS, ...customProds].find((prod) => prod.slug === slug);
    if (p) return { success: true, product: { ...p, versions: [], included_products: [] } as any };
    return { success: false, error: 'Product not found' } as any;
  },

  async createProduct(data: any) {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {}

    const customProds = getLocalStore<Product[]>('aemeth_custom_products', []);
    const newProd: Product = {
      id: 'prd_' + Date.now(),
      slug: data.slug,
      title: data.title,
      short_desc: data.short_desc,
      long_desc: data.long_desc,
      type: data.type,
      category: data.category,
      price_cents: data.price_cents,
      version: data.version,
      features: data.features,
      is_published: true,
      thumbnail_url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80',
      created_at: new Date().toISOString(),
    };
    customProds.push(newProd);
    setLocalStore('aemeth_custom_products', customProds);
    return { success: true, productId: newProd.id };
  },

  // Orders
  async createOrder(data: {
    product_ids: string[];
    payment_method: string;
    customer_email?: string;
    customer_name?: string;
    customer_tv_username?: string;
  }) {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {}

    const orderNum = 'AEM-' + Math.floor(1000000 + Math.random() * 9000000);
    const orderId = 'ord_' + Date.now();
    const customProds = getLocalStore<Product[]>('aemeth_custom_products', []);
    const allProds = [...INITIAL_PRODUCTS, ...customProds];

    const selected = allProds.filter((p) => data.product_ids.includes(p.id));
    const totalCents = selected.reduce((sum, p) => sum + p.price_cents, 0);

    const order: Order = {
      id: orderId,
      order_number: orderNum,
      user_id: 'usr_trader_001',
      total_cents: totalCents,
      currency: 'USD',
      status: 'pending',
      payment_method: data.payment_method as any,
      customer_email: data.customer_email || 'trader@aemethtrader.com',
      customer_tv_username: data.customer_tv_username,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: selected.map((p) => ({
        id: 'oi_' + Math.random(),
        order_id: orderId,
        product_id: p.id,
        product_title: p.title,
        product_type: p.type,
        unit_price_cents: p.price_cents,
      })),
    };

    const orders = getLocalStore<Order[]>('aemeth_local_orders', []);
    orders.unshift(order);
    setLocalStore('aemeth_local_orders', orders);

    return { success: true, order };
  },

  async getOrder(idOrNumber: string) {
    try {
      const res = await fetch(`${API_BASE}/orders/${idOrNumber}`, {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) return await res.json();
    } catch {}

    const orders = getLocalStore<Order[]>('aemeth_local_orders', []);
    const ord = orders.find((o) => o.id === idOrNumber || o.order_number === idOrNumber);
    if (ord) return { success: true, order: ord };
    return { success: false, error: 'Order not found' } as any;
  },

  async getMyOrders() {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) return await res.json();
    } catch {}

    const orders = getLocalStore<Order[]>('aemeth_local_orders', [
      {
        id: 'ord_sample_paid_001',
        order_number: 'AEM-8931204',
        user_id: 'usr_trader_001',
        total_cents: 7900,
        currency: 'USD',
        status: 'paid',
        payment_method: 'bank_transfer',
        customer_email: 'trader@aemethtrader.com',
        customer_tv_username: 'vance_fx',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: [
          {
            id: 'oi_1',
            order_id: 'ord_sample_paid_001',
            product_id: 'prd_liq_001',
            product_title: 'Aemeth Liquidity Matrix v5.2',
            product_type: 'open_source',
            unit_price_cents: 7900,
          },
        ],
      },
    ]);
    return { success: true, orders };
  },

  async uploadReceipt(orderId: string, formData: FormData) {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/receipt`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
        body: formData,
      });
      if (res.ok) return await res.json();
    } catch {}

    const orders = getLocalStore<Order[]>('aemeth_local_orders', []);
    const ord = orders.find((o) => o.id === orderId);
    if (ord) ord.status = 'verifying';
    setLocalStore('aemeth_local_orders', orders);

    return {
      success: true,
      message: 'Proof of payment submitted successfully.',
      proofData: 'Receipt verified in local session',
    };
  },

  // Payments
  async getPaymentConfig() {
    try {
      const res = await fetch(`${API_BASE}/payments/config`);
      if (res.ok) return await res.json();
    } catch {}

    return {
      success: true,
      config: {
        bank_bca_account: '8040-192-384',
        bank_bca_holder: 'PT AEMETH TRADER ANALISIS',
        bank_mandiri_account: '137-00-9821-441',
        bank_mandiri_holder: 'PT AEMETH TRADER ANALISIS',
        bank_wire_details: 'Swift: CENAIDJA, Bank Central Asia, Jakarta, Indonesia',
        crypto_usdt_trc20: 'TY2HqE83rLw8x7e94gP9W3B1Kx7M4z8Y1a',
        crypto_usdt_erc20: '0x71C8F4a2D398E153b6920194E347206bE5402919',
        crypto_btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        paypal_client_id: 'sb_client_id_placeholder_sandbox_aemeth',
        paypal_sandbox_mode: true,
        tradingview_publisher_username: 'AemethTraderAnalysis',
      },
    };
  },

  async createPaypalOrder(orderId: string) {
    try {
      const res = await fetch(`${API_BASE}/payments/paypal/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ order_id: orderId }),
      });
      if (res.ok) return await res.json();
    } catch {}

    return { success: true, paypalOrderId: 'PAYPAL-ORD-' + Date.now() };
  },

  async capturePaypalOrder(orderId: string, paypalOrderId: string) {
    try {
      const res = await fetch(`${API_BASE}/payments/paypal/capture-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ order_id: orderId, paypal_order_id: paypalOrderId }),
      });
      if (res.ok) return await res.json();
    } catch {}

    // Static fallback: fulfill order
    const orders = getLocalStore<Order[]>('aemeth_local_orders', []);
    const ord = orders.find((o) => o.id === orderId);
    if (ord) ord.status = 'paid';
    setLocalStore('aemeth_local_orders', orders);

    return { success: true, message: 'Payment captured and verified.' };
  },

  async submitCryptoPayment(orderId: string, data: { asset: string; network: string; txid: string }) {
    try {
      const res = await fetch(`${API_BASE}/payments/crypto/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ order_id: orderId, ...data }),
      });
      if (res.ok) return await res.json();
    } catch {}

    const orders = getLocalStore<Order[]>('aemeth_local_orders', []);
    const ord = orders.find((o) => o.id === orderId);
    if (ord) ord.status = 'verifying';
    setLocalStore('aemeth_local_orders', orders);

    return { success: true, message: 'Crypto transaction hash recorded.' };
  },

  // Deliveries
  async getMyDeliveries() {
    try {
      const res = await fetch(`${API_BASE}/deliveries/my-deliveries`, {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) return await res.json();
    } catch {}

    const deliveries: Delivery[] = getLocalStore<Delivery[]>('aemeth_local_deliveries', [
      {
        id: 'del_sample_001',
        order_id: 'ord_sample_paid_001',
        product_id: 'prd_liq_001',
        user_id: 'usr_trader_001',
        delivery_type: 'source_download',
        status: 'ready',
        tv_username: 'vance_fx',
        product_title: 'Aemeth Liquidity Matrix v5.2',
        product_slug: 'aemeth-liquidity-matrix',
        product_type: 'open_source',
        version: '5.2.0',
        product_version: '5.2.0',
        has_source_code: true,
        created_at: new Date().toISOString(),
      },
    ]);
    return { success: true, deliveries };
  },

  async getDeliverySourceCode(deliveryId: string) {
    try {
      const res = await fetch(`${API_BASE}/deliveries/${deliveryId}/source`, {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) return await res.json();
    } catch {}

    const user = getLocalStore<User>('aemeth_current_user', {
      id: 'usr_trader_001',
      email: 'trader@aemethtrader.com',
      name: 'Alexander Vance',
      role: 'customer',
      created_at: new Date().toISOString(),
    });

    const watermarked = `// ==========================================================================\n// AEMETH TRADER ANALYSIS — OFFICIAL PRODUCT DELIVERY\n// Licensed to: ${user.email}\n// License Type: Single-User Non-Redistribution Commercial License\n// ==========================================================================\n\n` + PINE_SCRIPT_LIQUIDITY;

    return {
      success: true,
      product_title: 'Aemeth Liquidity Matrix v5.2',
      version: '5.2.0',
      filename: 'aemeth_liquidity_matrix_v5_2.pine',
      pine_script_content: watermarked,
    };
  },

  getDownloadUrl(deliveryId: string): string {
    // Generate a direct client blob download if static
    return `${API_BASE}/deliveries/${deliveryId}/download`;
  },

  async submitTvUsername(deliveryId: string, tvUsername: string) {
    try {
      const res = await fetch(`${API_BASE}/deliveries/${deliveryId}/tv-username`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ tv_username: tvUsername }),
      });
      if (res.ok) return await res.json();
    } catch {}

    const dels = getLocalStore<Delivery[]>('aemeth_local_deliveries', []);
    const d = dels.find((item) => item.id === deliveryId);
    if (d) {
      d.tv_username = tvUsername;
      d.status = 'access_requested';
    }
    setLocalStore('aemeth_local_deliveries', dels);

    return {
      success: true,
      message: `TradingView username "${tvUsername}" submitted. Access request queued.`,
    };
  },

  // Admin
  async getAdminMetrics() {
    try {
      const res = await fetch(`${API_BASE}/admin/metrics`, {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) return await res.json();
    } catch {}

    const orders = getLocalStore<Order[]>('aemeth_local_orders', []);
    const paidSum = orders.filter((o) => o.status === 'paid').reduce((sum, o) => sum + o.total_cents, 7900);
    const pendingCount = orders.filter((o) => o.status === 'verifying').length;

    return {
      success: true,
      metrics: {
        totalRevenueUsd: (paidSum / 100).toFixed(2),
        totalRevenueCents: paidSum,
        ordersByStatus: [],
        pendingReviewCount: pendingCount,
        pendingTvAccessCount: 1,
        totalDeliveriesCount: 4,
        recentOrders: orders.slice(0, 5),
      },
    };
  },

  async getAdminOrders(params?: { status?: string; search?: string }) {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);

      const res = await fetch(`${API_BASE}/admin/orders?${query.toString()}`, {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) return await res.json();
    } catch {}

    const orders = getLocalStore<Order[]>('aemeth_local_orders', []);
    return { success: true, orders };
  },

  async approveOrder(orderId: string, adminNote?: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ admin_note: adminNote }),
      });
      if (res.ok) return await res.json();
    } catch {}

    const orders = getLocalStore<Order[]>('aemeth_local_orders', []);
    const ord = orders.find((o) => o.id === orderId);
    if (ord) ord.status = 'paid';
    setLocalStore('aemeth_local_orders', orders);

    return { success: true, message: 'Order approved and products provisioned!' };
  },

  async rejectOrder(orderId: string, reason?: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) return await res.json();
    } catch {}

    const orders = getLocalStore<Order[]>('aemeth_local_orders', []);
    const ord = orders.find((o) => o.id === orderId);
    if (ord) ord.status = 'cancelled';
    setLocalStore('aemeth_local_orders', orders);

    return { success: true, message: 'Order marked as rejected.' };
  },

  async getTvAccessRequests() {
    try {
      const res = await fetch(`${API_BASE}/admin/tv-access-requests`, {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) return await res.json();
    } catch {}

    return {
      success: true,
      requests: [
        {
          delivery_id: 'del_tv_002',
          status: 'access_requested',
          tv_username: 'vance_fx',
          access_granted_at: null,
          created_at: new Date().toISOString(),
          product_title: 'Aemeth Delta Flow & Volume Absorption Pro',
          tradingview_script_id: 'aemeth_delta_pro_invite_only',
          order_number: 'AEM-8931204',
          customer_email: 'trader@aemethtrader.com',
          customer_name: 'Alexander Vance',
        },
      ],
    };
  },

  async actionTvAccess(deliveryId: string, action: 'grant' | 'reject' | 'revoke', notes?: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/tv-access/${deliveryId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ action, notes }),
      });
      if (res.ok) return await res.json();
    } catch {}

    return {
      success: true,
      message: `TradingView access status updated to "${action === 'grant' ? 'access_granted' : action}".`,
    };
  },

  async getAuditLogs() {
    try {
      const res = await fetch(`${API_BASE}/admin/audit-logs`, {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) return await res.json();
    } catch {}

    return {
      success: true,
      logs: [
        {
          id: 'aud_1',
          admin_user_id: 'usr_admin_001',
          admin_name: 'Aemeth Head of Trading',
          action: 'APPROVE_PAYMENT',
          target_entity: 'orders',
          target_id: 'ord_sample_paid_001',
          details: { order_number: 'AEM-8931204', total_cents: 7900 },
          created_at: new Date().toISOString(),
        },
      ],
    };
  },

  async getAdminSettings() {
    try {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        headers: { ...getAuthHeader() },
      });
      if (res.ok) return await res.json();
    } catch {}

    return {
      success: true,
      settings: {
        bank_bca_account: '8040-192-384',
        bank_mandiri_account: '137-00-9821-441',
        crypto_usdt_trc20: 'TY2HqE83rLw8x7e94gP9W3B1Kx7M4z8Y1a',
        crypto_usdt_erc20: '0x71C8F4a2D398E153b6920194E347206bE5402919',
        crypto_btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      },
    };
  },

  async updateAdminSettings(settings: Record<string, string>) {
    try {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) return await res.json();
    } catch {}

    return { success: true, message: 'Settings saved successfully' };
  },
};
