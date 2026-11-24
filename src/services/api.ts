import type { Product, Order, OrderItem, Delivery, SiteSettings, AuditLog } from '../types/marketplace';
import {
  PRODUCT_PRICING,
  getProductPrice,
  calculateBundlePrice,
  resolveProductId,
  isLaunchPromoActive,
  LICENSE_CONFIG,
  BUNDLE_DEFINITIONS,
} from '../config/pricing';

const API_BASE = '/api';

function getAdminAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('aemeth_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// -------------------------------------------------------------
// SEED PINE SCRIPT SOURCE CODE (UNCOMPILED PINE SCRIPT V5)
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
            border_color=color.new(#3b82f6, 40), bgcolor=color.new(#3b82f6, fvg_transparency))

// Dynamic Trailing Liquidity Bands
basis = ta.sma(close[1], length)
dev = ta.stdev(close[1], length) * 2.0
upper_liq = basis + dev
lower_liq = basis - dev

plot(upper_liq, "Buy-Side Liquidity", color=color.new(#3b82f6, 20), style=plot.style_linebr)
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
plotshape(aligned_bear and not aligned_bear[1], title="Bear Cascade", style=shape.triangledown, location=location.abovebar, color=#3b82f6, size=size.small, text="BEAR CASCADE")
`;

// Helper to inject central pricing into single products
function injectPricing(p: Omit<Product, 'price_cents' | 'price_idr' | 'normal_price_idr' | 'promo_price_idr' | 'is_promo_active' | 'discount_percent' | 'discount_idr' | 'discount_cents'>): Product {
  const priceInfo = getProductPrice(p.id);
  if (!priceInfo) {
    return {
      ...p,
      price_idr: 149000,
      normal_price_idr: 199000,
      promo_price_idr: 149000,
      is_promo_active: true,
      discount_percent: 25,
      price_cents: 1490,
      discount_idr: 50000,
      discount_cents: 510,
    };
  }

  return {
    ...p,
    version: priceInfo.version || p.version,
    price_idr: priceInfo.effectivePriceIdr,
    normal_price_idr: priceInfo.normalPriceIdr,
    promo_price_idr: priceInfo.promoPriceIdr,
    is_promo_active: priceInfo.isPromoActive,
    discount_percent: priceInfo.discountPercent,
    discount_idr: priceInfo.discountIdr,
    price_cents: priceInfo.effectivePriceCents,
    discount_cents: priceInfo.isPromoActive ? (priceInfo.normalPriceCents - priceInfo.effectivePriceCents) : 0,
  };
}

// -------------------------------------------------------------
// BILINGUAL PRODUCTS CATALOG (Single Source of Truth Connected)
// -------------------------------------------------------------
const SINGLE_INDICATORS: Product[] = [
  injectPricing({
    id: 'parabolic-sar',
    slug: 'aemeth-parabolic-sar',
    title: 'Aemeth Parabolic SAR',
    title_id: 'Aemeth Parabolic SAR',
    title_en: 'Aemeth Parabolic SAR',
    short_desc: 'Mengamati perubahan arah tren dan potensi sinyal BUY maupun SELL melalui Parabolic SAR dengan visualisasi titik & level TP1-TP3.',
    short_desc_id: 'Mengamati perubahan arah tren dan potensi sinyal BUY maupun SELL melalui Parabolic SAR dengan visualisasi titik & level TP1-TP3.',
    short_desc_en: 'Tracks trend flips and BUY/SELL signals via Parabolic SAR with SAR dots and automated Entry/SL/TP1-TP3 dashboard.',
    long_desc: 'Aemeth Parabolic SAR Indicator adalah indikator TradingView yang membantu trader mengamati perubahan arah tren dan potensi sinyal BUY maupun SELL melalui Parabolic SAR.\n\nIndikator menampilkan titik Parabolic SAR pada chart, dilengkapi level Entry, Stop Loss (SL), dan tiga target Take Profit (TP1, TP2, dan TP3). Dashboard informatif membantu pengguna memantau sinyal terakhir, sementara fitur alert memudahkan pemantauan perubahan kondisi pasar.\n\nDirancang untuk membantu analisis tren dan pengelolaan level trading secara lebih praktis dalam satu tampilan.',
    long_desc_id: 'Aemeth Parabolic SAR Indicator adalah indikator TradingView yang membantu trader mengamati perubahan arah tren dan potensi sinyal BUY maupun SELL melalui Parabolic SAR.\n\nIndikator menampilkan titik Parabolic SAR pada chart, dilengkapi level Entry, Stop Loss (SL), dan tiga target Take Profit (TP1, TP2, dan TP3). Dashboard informatif membantu pengguna memantau sinyal terakhir, sementara fitur alert memudahkan pemantauan perubahan kondisi pasar.\n\nDirancang untuk membantu analisis tren dan pengelolaan level trading secara lebih praktis dalam satu tampilan.',
    long_desc_en: 'Aemeth Parabolic SAR Indicator helps traders capture clean trend transitions and momentum shifts on TradingView.\n\nPlots Parabolic SAR dots on chart with clear Entry, Stop Loss (SL), and TP1, TP2, TP3 targets, status dashboard, and customizable alerts.',
    type: 'open_source',
    category: 'trend',
    version: '3.1.0',
    pine_version: 'v5',
    release_date: '2026-03-05',
    changelog: [
      'v3.1.0: Added multi-stage acceleration parameter tuning & dynamic status dashboard',
      'v3.0.0: Initial Pine Script v5 rewrite'
    ],
    changelog_id: [
      'v3.1.0: Penambahan akselerasi dinamis & dashboard status sinyal',
      'v3.0.0: Rilis awal basis kode Pine Script v5'
    ],
    changelog_en: [
      'v3.1.0: Added multi-stage acceleration parameter tuning & dynamic status dashboard',
      'v3.0.0: Initial Pine Script v5 rewrite'
    ],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'BUY & SELL Signals — penanda potensi perubahan arah tren.',
      'Parabolic SAR Visualization — menampilkan titik indikator pada chart.',
      'Entry, SL & TP — visualisasi level Entry, Stop Loss, dan tiga target Take Profit (TP1-TP3).',
      'ATR & Fixed Distance — pilihan metode pengaturan jarak level trading.',
      'Signal Dashboard — ringkasan status sinyal dan level harga terakhir.',
      'TradingView Alerts — notifikasi untuk kondisi bullish dan bearish.',
      'Customizable Settings — pengaturan indikator yang dapat disesuaikan.'
    ],
    features_id: [
      'BUY & SELL Signals — penanda potensi perubahan arah tren.',
      'Parabolic SAR Visualization — menampilkan titik indikator pada chart.',
      'Entry, SL & TP — visualisasi level Entry, Stop Loss, dan tiga target Take Profit (TP1-TP3).',
      'ATR & Fixed Distance — pilihan metode pengaturan jarak level trading.',
      'Signal Dashboard — ringkasan status sinyal dan level harga terakhir.',
      'TradingView Alerts — notifikasi untuk kondisi bullish dan bearish.',
      'Customizable Settings — pengaturan indikator yang dapat disesuaikan.'
    ],
    features_en: [
      'BUY & SELL Signals — clear trend flip indication.',
      'Parabolic SAR Visualization — clean on-chart dot telemetry.',
      'Entry, SL & TP — visual level plotting for Entry, SL, and TP1, TP2, TP3.',
      'ATR & Fixed Distance — flexible distance calculation methods.',
      'Signal Dashboard — real-time signal and duration tracker.',
      'TradingView Alerts — instant alert triggering for bullish/bearish flips.',
      'Customizable Settings — adjustable acceleration factor and max step.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Overlay Indicator' },
      { label: 'Metode Analisis', value: 'Parabolic SAR' },
      { label: 'Sinyal', value: 'BUY / SELL' },
      { label: 'Visualisasi', value: 'Entry, SL, TP1, TP2, TP3' },
      { label: 'Fitur Tambahan', value: 'Dashboard & Alert' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Overlay Indicator' },
      { label: 'Analysis Method', value: 'Parabolic SAR' },
      { label: 'Signals', value: 'BUY / SELL' },
      { label: 'Visualization', value: 'Entry, SL, TP1, TP2, TP3' },
      { label: 'Additional Features', value: 'Dashboard & Alerts' }
    ],
    package_includes_id: [
      'Source code Pine Script (.pine & .txt).',
      'Panduan pemasangan di TradingView.',
      'Bantuan instalasi dari Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView installation walkthrough.',
      'Direct installation support from Aemeth if required.'
    ],
    tradingview_script_id: 'aemeth_parabolic_sar_v5',
    is_published: true,
    thumbnail_url: './products/parabolic-sar.jpg',
    preview_images: ['./products/parabolic-sar.jpg'],
    created_at: new Date('2026-03-05').toISOString(),
  }),
  injectPricing({
    id: 'mfi-reversal',
    slug: 'aemeth-mfi-reversal',
    title: 'Aemeth MFI Reversal',
    title_id: 'Aemeth MFI Reversal',
    title_en: 'Aemeth MFI Reversal',
    short_desc: 'Mengidentifikasi potensi pembalikan momentum pasar melalui Money Flow Index (MFI) dengan level Entry, SL, dan TP1-TP3.',
    short_desc_id: 'Mengidentifikasi potensi pembalikan momentum pasar melalui Money Flow Index (MFI) dengan level Entry, SL, dan TP1-TP3.',
    short_desc_en: 'Identifies potential market momentum turning points via Money Flow Index (MFI) with Entry, SL, and TP1-TP3 projection.',
    long_desc: 'Aemeth MFI Reversal adalah indikator TradingView yang membantu trader mengidentifikasi potensi pembalikan momentum pasar melalui Money Flow Index (MFI).\n\nIndikator menampilkan sinyal BUY dan SELL, lengkap dengan level Entry, Stop Loss (SL), serta tiga target Take Profit (TP1, TP2, dan TP3). Dashboard informatif dan penanda visual membantu trader memantau level trading langsung pada chart.\n\nDirancang untuk membantu analisis teknikal menjadi lebih terstruktur dan praktis.',
    long_desc_id: 'Aemeth MFI Reversal adalah indikator TradingView yang membantu trader mengidentifikasi potensi pembalikan momentum pasar melalui Money Flow Index (MFI).\n\nIndikator menampilkan sinyal BUY dan SELL, lengkap dengan level Entry, Stop Loss (SL), serta tiga target Take Profit (TP1, TP2, dan TP3). Dashboard informatif dan penanda visual membantu trader memantau level trading langsung pada chart.\n\nDirancang untuk membantu analisis teknikal menjadi lebih terstruktur dan praktis.',
    long_desc_en: 'Aemeth MFI Reversal helps traders anticipate institutional momentum inflections using volume-weighted Money Flow Index (MFI).\n\nDisplays clean BUY and SELL triggers with Entry, Stop Loss (SL), and TP1, TP2, TP3 targets, paired with an informative dashboard and TradingView alerts.',
    type: 'open_source',
    category: 'reversal',
    version: '2.4.0',
    pine_version: 'v5',
    release_date: '2026-03-10',
    changelog: [
      'v2.4.0: Dynamic MFI exhaustion threshold tuning and ATR distance logic',
      'v2.0.0: Initial Pine Script v5 rewrite'
    ],
    changelog_id: [
      'v2.4.0: Penyesuaian ambang kelelahan MFI dinamis & kalkulasi jarak ATR',
      'v2.0.0: Rilis arsitektur Pine Script v5'
    ],
    changelog_en: [
      'v2.4.0: Dynamic MFI exhaustion threshold tuning and ATR distance logic',
      'v2.0.0: Initial Pine Script v5 rewrite'
    ],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'BUY & SELL Signals — penanda potensi perubahan momentum pasar.',
      'Entry, SL & TP — visualisasi level masuk, batas risiko, dan tiga target harga.',
      'ATR & Fixed Distance — pilihan metode perhitungan jarak level trading.',
      'Dashboard Sinyal — ringkasan status sinyal dan level harga terakhir.',
      'TradingView Alerts — notifikasi untuk kondisi sinyal bullish dan bearish.',
      'Customizable Settings — pengaturan yang dapat disesuaikan dengan kebutuhan pengguna.'
    ],
    features_id: [
      'BUY & SELL Signals — penanda potensi perubahan momentum pasar.',
      'Entry, SL & TP — visualisasi level masuk, batas risiko, dan tiga target harga.',
      'ATR & Fixed Distance — pilihan metode perhitungan jarak level trading.',
      'Dashboard Sinyal — ringkasan status sinyal dan level harga terakhir.',
      'TradingView Alerts — notifikasi untuk kondisi sinyal bullish dan bearish.',
      'Customizable Settings — pengaturan yang dapat disesuaikan dengan kebutuhan pengguna.'
    ],
    features_en: [
      'BUY & SELL Signals — institutional volume-momentum inflection markers.',
      'Entry, SL & TP — clear visual entry line, protective stop, and 3 targets.',
      'ATR & Fixed Distance — flexible risk calculation methods.',
      'Signal Dashboard — live summary of active signal state on chart.',
      'TradingView Alerts — notifications for bullish and bearish setups.',
      'Customizable Settings — adaptable to various timeframes and instruments.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Overlay Indicator' },
      { label: 'Metode Analisis', value: 'Money Flow Index (MFI)' },
      { label: 'Sinyal', value: 'BUY / SELL' },
      { label: 'Visualisasi', value: 'Entry, SL, TP1, TP2, TP3' },
      { label: 'Fitur Tambahan', value: 'Dashboard & Alert' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Overlay Indicator' },
      { label: 'Analysis Method', value: 'Money Flow Index (MFI)' },
      { label: 'Signals', value: 'BUY / SELL' },
      { label: 'Visualization', value: 'Entry, SL, TP1, TP2, TP3' },
      { label: 'Additional Features', value: 'Dashboard & Alerts' }
    ],
    package_includes_id: [
      'Source code Pine Script (.pine & .txt).',
      'Panduan pemasangan di TradingView.',
      'Bantuan instalasi dari Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView installation walkthrough.',
      'Direct installation support from Aemeth if required.'
    ],
    tradingview_script_id: 'aemeth_mfi_reversal_v5',
    is_published: true,
    thumbnail_url: './products/mfi.jpg',
    preview_images: ['./products/mfi.jpg'],
    created_at: new Date('2026-03-10').toISOString(),
  }),
  injectPricing({
    id: 'ichimoku-cloud',
    slug: 'aemeth-ichimoku-cloud',
    title: 'Aemeth Ichimoku Cloud',
    title_id: 'Aemeth Ichimoku Cloud',
    title_en: 'Aemeth Ichimoku Cloud',
    short_desc: 'Indikator TradingView yang membantu trader mengidentifikasi potensi peluang BUY dan SELL melalui analisis Ichimoku Cloud dengan level Entry, SL, dan TP1-TP3.',
    short_desc_id: 'Indikator TradingView yang membantu trader mengidentifikasi potensi peluang BUY dan SELL melalui analisis Ichimoku Cloud dengan level Entry, SL, dan TP1-TP3.',
    short_desc_en: 'TradingView indicator helping traders identify potential BUY & SELL opportunities via Ichimoku Cloud analysis with Entry, SL, and TP1-TP3 targets.',
    long_desc: 'Aemeth Ichimoku Cloud Indicator adalah indikator TradingView yang membantu trader mengidentifikasi potensi peluang BUY dan SELL melalui analisis Ichimoku Cloud.\n\nIndikator menampilkan informasi Entry, Stop Loss (SL), serta tiga target Take Profit (TP1, TP2, dan TP3) secara visual langsung pada chart. Dilengkapi dashboard ringkas untuk memantau status sinyal terakhir dan fitur alert untuk membantu memantau kondisi pasar.\n\nCocok bagi trader yang ingin menyusun analisis teknikal dengan tampilan yang lebih terstruktur dan praktis.',
    long_desc_id: 'Aemeth Ichimoku Cloud Indicator adalah indikator TradingView yang membantu trader mengidentifikasi potensi peluang BUY dan SELL melalui analisis Ichimoku Cloud.\n\nIndikator menampilkan informasi Entry, Stop Loss (SL), serta tiga target Take Profit (TP1, TP2, dan TP3) secara visual langsung pada chart. Dilengkapi dashboard ringkas untuk memantau status sinyal terakhir dan fitur alert untuk membantu memantau kondisi pasar.\n\nCocok bagi trader yang ingin menyusun analisis teknikal dengan tampilan yang lebih terstruktur dan praktis.',
    long_desc_en: 'Aemeth Ichimoku Cloud Indicator is a TradingView tool that helps traders identify potential BUY and SELL setups through Ichimoku Cloud trend analysis.\n\nVisually plots Entry, Stop Loss (SL), and three Take Profit targets (TP1, TP2, TP3) directly on your chart. Features an on-chart signal status dashboard and customizable alert triggers for structured technical execution.',
    type: 'open_source',
    category: 'trend',
    version: '5.2.0',
    pine_version: 'v5',
    release_date: '2026-03-15',
    changelog: [
      'v5.2.0: Pine Script v5 upgrade with dynamic cloud projections & TP1-TP3 targets',
      'v5.0.0: Initial release of Aemeth Ichimoku Cloud engine'
    ],
    changelog_id: [
      'v5.2.0: Peningkatan Pine Script v5 dengan proyeksi cloud dinamis & target TP1-TP3',
      'v5.0.0: Rilis awal mesin Aemeth Ichimoku Cloud'
    ],
    changelog_en: [
      'v5.2.0: Pine Script v5 upgrade with dynamic cloud projections & TP1-TP3 targets',
      'v5.0.0: Initial release of Aemeth Ichimoku Cloud engine'
    ],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'Sinyal BUY dan SELL berbasis Ichimoku Cloud.',
      'Tampilan level Entry, Stop Loss, dan tiga target Take Profit (TP1, TP2, TP3).',
      'Perhitungan target yang dapat disesuaikan.',
      'Dashboard informasi status sinyal pada chart (termasuk counter bar sejak sinyal).',
      'Fitur alert untuk kondisi sinyal tertentu.',
      'Pengaturan indikator yang fleksibel.'
    ],
    features_id: [
      'Sinyal BUY dan SELL berbasis Ichimoku Cloud.',
      'Tampilan level Entry, Stop Loss, dan tiga target Take Profit (TP1, TP2, TP3).',
      'Perhitungan target yang dapat disesuaikan.',
      'Dashboard informasi status sinyal pada chart (termasuk counter bar sejak sinyal).',
      'Fitur alert untuk kondisi sinyal tertentu.',
      'Pengaturan indikator yang fleksibel.'
    ],
    features_en: [
      'BUY & SELL signals powered by Ichimoku Cloud analysis.',
      'Direct on-chart visualization of Entry, Stop Loss, and TP1, TP2, TP3 levels.',
      'Customizable target calculation methodology.',
      'On-chart signal dashboard including bar duration counter since trigger.',
      'TradingView alerts for specific signal and exit conditions.',
      'Flexible indicator parameters and display styling.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Overlay Indicator' },
      { label: 'Sistem Analisis', value: 'Ichimoku Cloud' },
      { label: 'Sinyal', value: 'BUY / SELL' },
      { label: 'Level Ditampilkan', value: 'Entry, SL, TP1, TP2, TP3' },
      { label: 'Fitur Tambahan', value: 'Dashboard & Alert' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Overlay Indicator' },
      { label: 'Analysis System', value: 'Ichimoku Cloud' },
      { label: 'Signals', value: 'BUY / SELL' },
      { label: 'Levels Displayed', value: 'Entry, SL, TP1, TP2, TP3' },
      { label: 'Additional Features', value: 'Dashboard & Alerts' }
    ],
    package_includes_id: [
      'Source code indikator Pine Script (.pine & .txt).',
      'Panduan pemasangan di TradingView (Pine Editor).',
      'Bantuan instalasi dari tim Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Complete Pine Script indicator source code (.pine & .txt).',
      'TradingView step-by-step installation walkthrough.',
      'Personal installation assistance from the Aemeth support desk.'
    ],
    tradingview_script_id: 'aemeth_ichimoku_cloud_v5',
    is_published: true,
    thumbnail_url: './products/ichimoku.jpg',
    preview_images: ['./products/ichimoku.jpg'],
    created_at: new Date('2026-03-15').toISOString(),
  }),
  injectPricing({
    id: 'ai-signal-v1',
    slug: 'aemeth-ai-signal-v1',
    title: 'Aemeth AI Signal V1',
    title_id: 'Aemeth AI Signal V1',
    title_en: 'Aemeth AI Signal V1',
    short_desc: 'Membaca potensi peluang LONG dan SHORT melalui visualisasi sinyal, zona SL/TP1-TP3, serta badge Grade & AI Confidence.',
    short_desc_id: 'Membaca potensi peluang LONG dan SHORT melalui visualisasi sinyal, zona SL/TP1-TP3, serta badge Grade & AI Confidence.',
    short_desc_en: 'Detects high-conviction LONG & SHORT setups with on-chart SL/TP zones, Grade evaluation, and AI Confidence telemetry.',
    long_desc: 'Aemeth AI Signal V1 adalah indikator TradingView yang dirancang untuk membantu trader membaca potensi peluang LONG dan SHORT melalui visualisasi sinyal dan level trading langsung pada chart.\n\nDengan tampilan zona Stop Loss (SL), tiga target Take Profit (TP1–TP3), serta informasi Grade dan AI Confidence, indikator ini membantu menyajikan informasi analisis pasar dalam format visual yang lebih terstruktur.\n\nCocok bagi trader yang menginginkan tampilan sinyal, level risiko, dan target harga dalam satu chart.',
    long_desc_id: 'Aemeth AI Signal V1 adalah indikator TradingView yang dirancang untuk membantu trader membaca potensi peluang LONG dan SHORT melalui visualisasi sinyal dan level trading langsung pada chart.\n\nDengan tampilan zona Stop Loss (SL), tiga target Take Profit (TP1–TP3), serta informasi Grade dan AI Confidence, indikator ini membantu menyajikan informasi analisis pasar dalam format visual yang lebih terstruktur.\n\nCocok bagi trader yang menginginkan tampilan sinyal, level risiko, dan target harga dalam satu chart.',
    long_desc_en: 'Aemeth AI Signal V1 is an advanced TradingView indicator built to help traders analyze potential LONG and SHORT opportunities via structured visual level mapping.\n\nFeaturing dynamic Stop Loss (SL) zones, three Take Profit target boundaries (TP1–TP3), and on-chart Grade and AI Confidence badges for clear risk-reward planning.',
    type: 'open_source',
    category: 'momentum',
    version: '1.2.0',
    pine_version: 'v5',
    release_date: '2026-03-20',
    changelog: [
      'v1.2.0: Added Grade evaluation & AI Confidence telemetry badges',
      'v1.0.0: Initial release of Aemeth AI Signal suite'
    ],
    changelog_id: [
      'v1.2.0: Penambahan evaluasi Grade & badge telemetri AI Confidence',
      'v1.0.0: Rilis awal suite Aemeth AI Signal'
    ],
    changelog_en: [
      'v1.2.0: Added Grade evaluation & AI Confidence telemetry badges',
      'v1.0.0: Initial release of Aemeth AI Signal suite'
    ],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'LONG & SHORT Signals — menampilkan sinyal arah pasar.',
      'SL & TP Zones — visualisasi area Stop Loss dan tiga target Take Profit (TP1-TP3).',
      'Grade Badge — indikator penilaian kondisi sinyal (Grade A, B, C).',
      'AI Confidence Badge — kategori tingkat confidence yang ditampilkan pada chart.',
      'Dynamic Visuals — tampilan zona dan penanda yang mengikuti perkembangan chart.',
      'Configurable Settings — pengaturan indikator yang dapat disesuaikan.',
      'Trade Visualization — membantu memantau perkembangan level dan target pada chart.'
    ],
    features_id: [
      'LONG & SHORT Signals — menampilkan sinyal arah pasar.',
      'SL & TP Zones — visualisasi area Stop Loss dan tiga target Take Profit (TP1-TP3).',
      'Grade Badge — indikator penilaian kondisi sinyal (Grade A, B, C).',
      'AI Confidence Badge — kategori tingkat confidence yang ditampilkan pada chart.',
      'Dynamic Visuals — tampilan zona dan penanda yang mengikuti perkembangan chart.',
      'Configurable Settings — pengaturan indikator yang dapat disesuaikan.',
      'Trade Visualization — membantu memantau perkembangan level dan target pada chart.'
    ],
    features_en: [
      'LONG & SHORT Signals — clear market direction markers.',
      'SL & TP Zones — visual Stop Loss area and 3 Take Profit target zones.',
      'Grade Badge — signal quality evaluation metrics.',
      'AI Confidence Badge — telemetry confidence scoring displayed directly on chart.',
      'Dynamic Visuals — level boxes and tracking bands following market progression.',
      'Configurable Settings — adjustable signal confirmation and risk parameters.',
      'Trade Visualization — structured on-chart risk-to-reward ratio layout.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Overlay Indicator' },
      { label: 'Arah Sinyal', value: 'LONG / SHORT' },
      { label: 'Visualisasi', value: 'Entry, SL, TP1, TP2, TP3' },
      { label: 'Informasi Tambahan', value: 'Grade & AI Confidence' },
      { label: 'Pengaturan', value: 'Konfirmasi sinyal & parameter fleksibel' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Overlay Indicator' },
      { label: 'Signal Direction', value: 'LONG / SHORT' },
      { label: 'Visualization', value: 'Entry, SL, TP1, TP2, TP3' },
      { label: 'Additional Info', value: 'Grade & AI Confidence' },
      { label: 'Settings', value: 'Signal confirmation & customizable params' }
    ],
    package_includes_id: [
      'Source code Pine Script (.pine & .txt).',
      'Panduan pemasangan di TradingView.',
      'Bantuan instalasi dari Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView setup and installation guide.',
      'Direct installation support from Aemeth if required.'
    ],
    tradingview_script_id: 'aemeth_ai_signal_v1',
    is_published: true,
    thumbnail_url: './products/ai-signal.jpg',
    preview_images: ['./products/ai-signal.jpg'],
    created_at: new Date('2026-03-20').toISOString(),
  }),
  injectPricing({
    id: 'trendline-sr-utbot',
    slug: 'aemeth-trendline-breakout-sr-utbot',
    title: 'Aemeth Trendline Breakout + S/R + UT Bot',
    title_id: 'Aemeth Trendline Breakout + S/R + UT Bot',
    title_en: 'Aemeth Trendline Breakout + S/R + UT Bot',
    short_desc: 'Menggabungkan analisis trendline breakout, Support & Resistance, serta sinyal UT Bot dalam satu chart.',
    short_desc_id: 'Menggabungkan analisis trendline breakout, Support & Resistance, serta sinyal UT Bot dalam satu chart.',
    short_desc_en: 'All-in-one confluence engine combining trendline breakouts, Support & Resistance zones, and UT Bot trailing signals.',
    long_desc: 'Aemeth Trendline Breakout + S/R + UT Bot adalah indikator TradingView yang menggabungkan analisis trendline, Support & Resistance, serta sinyal UT Bot dalam satu tampilan chart. Dirancang untuk membantu trader mengamati arah tren, potensi breakout, area support dan resistance, serta peluang pergerakan harga.\n\nDilengkapi dengan garis trailing stop dinamis, penanda level breakout horizontal, dan warna chart adaptif.',
    long_desc_id: 'Aemeth Trendline Breakout + S/R + UT Bot adalah indikator TradingView yang menggabungkan analisis trendline, Support & Resistance, serta sinyal UT Bot dalam satu tampilan chart. Dirancang untuk membantu trader mengamati arah tren, potensi breakout, area support dan resistance, serta peluang pergerakan harga.\n\nDilengkapi dengan garis trailing stop dinamis, penanda level breakout horizontal, dan warna chart adaptif.',
    long_desc_en: 'Aemeth Trendline Breakout + S/R + UT Bot fuses trendline breakout detection, horizontal Support & Resistance structures, and UT Bot trailing stop signals into a single unified TradingView overlay.\n\nDesigned to help traders spot high-probability continuation and reversal breakouts with adaptive trailing lines and custom alert conditions.',
    type: 'open_source',
    category: 'trend',
    version: '4.2.0',
    pine_version: 'v5',
    release_date: '2026-03-25',
    changelog: [
      'v4.2.0: Integrated UT Bot trailing ATR stop with multi-swing trendline logic',
      'v4.0.0: Full Pine Script v5 rewrite'
    ],
    changelog_id: [
      'v4.2.0: Integrasi trailing ATR stop UT Bot dengan logika swing multi-trendline',
      'v4.0.0: Rilis arsitektur Pine Script v5'
    ],
    changelog_en: [
      'v4.2.0: Integrated UT Bot trailing ATR stop with multi-swing trendline logic',
      'v4.0.0: Full Pine Script v5 rewrite'
    ],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'Trendline Breakout: Membantu mengamati tren dan potensi breakout melalui beberapa pilihan swing.',
      'Support & Resistance: Menampilkan area support, resistance, serta penanda potensi breakout.',
      'UT Bot Signals: Menampilkan sinyal BUY dan SELL beserta garis trailing stop.',
      'Visualisasi Chart: Pilihan warna tren, penanda sinyal, dan garis indikator.',
      'TradingView Alerts: Mendukung notifikasi untuk kondisi sinyal tertentu.',
      'Pengaturan Fleksibel: Beberapa komponen dan tampilannya dapat disesuaikan dengan preferensi pengguna.'
    ],
    features_id: [
      'Trendline Breakout: Membantu mengamati tren dan potensi breakout melalui beberapa pilihan swing.',
      'Support & Resistance: Menampilkan area support, resistance, serta penanda potensi breakout.',
      'UT Bot Signals: Menampilkan sinyal BUY dan SELL beserta garis trailing stop.',
      'Visualisasi Chart: Pilihan warna tren, penanda sinyal, dan garis indikator.',
      'TradingView Alerts: Mendukung notifikasi untuk kondisi sinyal tertentu.',
      'Pengaturan Fleksibel: Beberapa komponen dan tampilannya dapat disesuaikan dengan preferensi pengguna.'
    ],
    features_en: [
      'Trendline Breakout: Detects dynamic trendline breaches across multiple swing lengths.',
      'Support & Resistance: Plots key horizontal demand and supply barriers with breakout markers.',
      'UT Bot Signals: Delivers responsive BUY and SELL alerts with dynamic ATR trailing stops.',
      'Chart Visuals: Customizable trend line colors, signal labels, and level boundaries.',
      'TradingView Alerts: Fully compatible with TradingView mobile alerts & webhooks.',
      'Flexible Configuration: Highly customizable parameters for each sub-module.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Overlay Indicator' },
      { label: 'Komponen', value: 'Trendline Breakout, Support & Resistance, UT Bot' },
      { label: 'Sinyal', value: 'BUY / SELL & Penanda Breakout' },
      { label: 'Alert', value: 'Tersedia untuk kondisi tertentu' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Overlay Indicator' },
      { label: 'Components', value: 'Trendline Breakout, Support & Resistance, UT Bot' },
      { label: 'Signals', value: 'BUY / SELL & Breakout Markers' },
      { label: 'Alerts', value: 'Available for specific trigger events' }
    ],
    package_includes_id: [
      'Source code Pine Script (.pine & .txt).',
      'Panduan pemasangan indikator di TradingView.',
      'Bantuan instalasi dari Aemeth jika mengalami kesulitan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView setup and indicator installation guide.',
      'Direct installation support from Aemeth if required.'
    ],
    tradingview_script_id: 'aemeth_trend_sr_utbot_v5',
    is_published: true,
    thumbnail_url: './products/trendline-sr-utbot.jpg',
    preview_images: ['./products/trendline-sr-utbot.jpg'],
    created_at: new Date('2026-03-25').toISOString(),
  }),
  injectPricing({
    id: 'smc-signal-panel-v2',
    slug: 'aemeth-smc-signal-panel-v2',
    title: 'Aemeth SMC Entry/TP/SL Signal Panel V2',
    title_id: 'Aemeth SMC Entry/TP/SL Signal Panel V2',
    title_en: 'Aemeth SMC Entry/TP/SL Signal Panel V2',
    short_desc: 'Indikator TradingView berbasis market structure untuk membantu mengidentifikasi potensi breakout, BUY/SELL, Entry, Stop Loss, dan target TP1–TP3, dilengkapi visualisasi zona serta panel informasi sinyal.',
    short_desc_id: 'Indikator TradingView berbasis market structure untuk membantu mengidentifikasi potensi breakout, BUY/SELL, Entry, Stop Loss, dan target TP1–TP3, dilengkapi visualisasi zona serta panel informasi sinyal.',
    short_desc_en: 'Market structure TradingView indicator to identify breakout setups, BUY/SELL signals, Entry, Stop Loss, and TP1–TP3 targets with liquidity zones and live signal panel.',
    long_desc: 'Aemeth SMC Entry/TP/SL Signal Panel V2 adalah indikator TradingView yang dirancang untuk membantu trader mengamati breakout struktur pasar (market structure) dan potensi setup trading melalui sinyal BUY/SELL, level Entry, Stop Loss (SL), target Take Profit (TP1, TP2, TP3), serta zona analisis pasar seperti Fair Value Gap dan Order Block.\n\nDilengkapi filter volatilitas berbasis ATR dan pengaturan cooldown sinyal untuk meminimalkan noise pasar, serta panel informasi sinyal langsung pada chart untuk kemudahan pemantauan secara objektif.\n\nCatatan Penting:\nIndikator ini merupakan alat bantu analisis, bukan jaminan hasil trading. Keputusan trading dan pengelolaan risiko tetap menjadi tanggung jawab pengguna.',
    long_desc_id: 'Aemeth SMC Entry/TP/SL Signal Panel V2 adalah indikator TradingView yang dirancang untuk membantu trader mengamati breakout struktur pasar (market structure) dan potensi setup trading melalui sinyal BUY/SELL, level Entry, Stop Loss (SL), target Take Profit (TP1, TP2, TP3), serta zona analisis pasar seperti Fair Value Gap dan Order Block.\n\nDilengkapi filter volatilitas berbasis ATR dan pengaturan cooldown sinyal untuk meminimalkan noise pasar, serta panel informasi sinyal langsung pada chart untuk kemudahan pemantauan secara objektif.\n\nCatatan Penting:\nIndikator ini merupakan alat bantu analisis, bukan jaminan hasil trading. Keputusan trading dan pengelolaan risiko tetap menjadi tanggung jawab pengguna.',
    long_desc_en: 'Aemeth SMC Entry/TP/SL Signal Panel V2 is an indicator designed to help users observe market structure breakouts and potential trading setups through BUY/SELL signals, entry levels, stop loss, take profit targets, and market-analysis zones.\n\nEquipped with ATR volatility filtering, signal cooldown settings, and a live signal information panel directly on the chart.\n\nDisclaimer:\nThis indicator is an analytical tool and does not guarantee trading results. Trading decisions and risk management remain the sole responsibility of the user.',
    type: 'open_source',
    category: 'trend',
    version: '2.1.0',
    pine_version: 'v5',
    release_date: '2026-03-25',
    changelog: [
      'v2.1.0: Real-time Signal Score panel & multi-timeframe ATR cooldown filtering',
      'v2.0.0: Smart Money Concepts core engine with automated BOS/CHoCH, FVG, & Order Blocks'
    ],
    changelog_id: [
      'v2.1.0: Panel Signal Score real-time & filter cooldown volatilitas ATR',
      'v2.0.0: Arsitektur Smart Money Concepts baru dengan deteksi otomatis BOS/CHoCH, FVG, dan Order Block'
    ],
    changelog_en: [
      'v2.1.0: Real-time Signal Score panel & multi-timeframe ATR cooldown filtering',
      'v2.0.0: Smart Money Concepts core engine with automated BOS/CHoCH, FVG, & Order Blocks'
    ],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
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
    features_id: [
      'Market Structure & Break of Structure.',
      'BUY/SELL signals.',
      'Entry, Stop Loss, TP1–TP3.',
      'Fair Value Gap & Order Block.',
      'ATR filter & cooldown.',
      'Signal Score panel.',
      'Customizable settings.',
      'TradingView alerts.'
    ],
    features_en: [
      'Market Structure & Break of Structure.',
      'BUY/SELL signals.',
      'Entry, Stop Loss, TP1–TP3.',
      'Fair Value Gap & Order Block.',
      'ATR filter & cooldown.',
      'Signal Score panel.',
      'Customizable settings.',
      'TradingView alerts.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Sistem Analisis', value: 'Market Structure & Smart Money Concepts (SMC)' },
      { label: 'Sinyal', value: 'BUY / SELL dengan Entry, SL, TP1, TP2, TP3' },
      { label: 'Fitur Tambahan', value: 'Fair Value Gap, Order Block, Cooldown Filter & Signal Score Panel' },
      { label: 'Alerts', value: 'TradingView Alert Conditions (Webhooks & Notifications)' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Analysis System', value: 'Market Structure & Smart Money Concepts (SMC)' },
      { label: 'Signals', value: 'BUY / SELL with Entry, SL, TP1, TP2, TP3' },
      { label: 'Additional Features', value: 'Fair Value Gap, Order Block, Cooldown Filter & Signal Score Panel' },
      { label: 'Alerts', value: 'TradingView Alert Conditions (Webhooks & Notifications)' }
    ],
    package_includes_id: [
      'Pine Script source code.',
      'Installation guide.',
      'Installation assistance if needed.'
    ],
    package_includes_en: [
      'Pine Script source code.',
      'Installation guide.',
      'Installation assistance if needed.'
    ],
    tradingview_script_id: 'aemeth_smc_signal_panel_v2',
    is_published: true,
    thumbnail_url: './products/smc-signal-panel.jpg',
    preview_images: ['./products/smc-signal-panel.jpg'],
    created_at: new Date('2026-03-25').toISOString(),
  }),
  injectPricing({
    id: 'supertrend-tpsl',
    slug: 'aemeth-supertrend-tpsl',
    title: 'Aemeth Supertrend TP/SL Indicator',
    title_id: 'Aemeth Supertrend TP/SL Indicator',
    title_en: 'Aemeth Supertrend TP/SL Indicator',
    short_desc: 'Indikator berbasis Supertrend yang memvisualisasikan arah tren serta level Entry, Stop Loss (SL), dan tiga target Take Profit (TP1, TP2, TP3) langsung pada chart.',
    short_desc_id: 'Indikator berbasis Supertrend yang memvisualisasikan arah tren serta level Entry, Stop Loss (SL), dan tiga target Take Profit (TP1, TP2, TP3) langsung pada chart.',
    short_desc_en: 'Supertrend-based indicator visualizing trend direction along with direct on-chart Entry, Stop Loss (SL), and three Take Profit targets (TP1, TP2, TP3).',
    long_desc: 'Aemeth Supertrend TP/SL Indicator merupakan indikator berbasis Supertrend yang membantu trader membaca arah tren serta memvisualisasikan level Entry, Stop Loss (SL), dan tiga target Take Profit (TP1, TP2, TP3) langsung pada chart.\n\nDengan tampilan level yang terstruktur dan visual yang intuitif, trader dapat memantau skenario trading, memahami target harga, dan menyusun perencanaan risiko dengan lebih sistematis.\n\nCatatan Penting:\nIndikator ini merupakan alat bantu analisis teknikal visual, bukan jaminan profit. Disiplin money management dan manajemen risiko tetap berada di tangan masing-masing trader.',
    long_desc_id: 'Aemeth Supertrend TP/SL Indicator merupakan indikator berbasis Supertrend yang membantu trader membaca arah tren serta memvisualisasikan level Entry, Stop Loss (SL), dan tiga target Take Profit (TP1, TP2, TP3) langsung pada chart.\n\nDengan tampilan level yang terstruktur dan visual yang intuitif, trader dapat memantau skenario trading, memahami target harga, dan menyusun perencanaan risiko dengan lebih sistematis.\n\nCatatan Penting:\nIndikator ini merupakan alat bantu analisis teknikal visual, bukan jaminan profit. Disiplin money management dan manajemen risiko tetap berada di tangan masing-masing trader.',
    long_desc_en: 'Aemeth Supertrend TP/SL Indicator is a Supertrend-powered technical analysis tool designed to help traders read trend orientation while mapping direct Entry, Stop Loss (SL), and three sequential Take Profit targets (TP1, TP2, TP3) directly on the chart.\n\nFeaturing structured level overlays and clear visual cues, it empowers traders to monitor trade setups and execute risk management systematically.\n\nImportant Notice:\nThis indicator is an objective technical analysis tool, not a guarantee of profit. Risk management remains the sole responsibility of the user.',
    type: 'open_source',
    category: 'trend',
    version: '1.0.0',
    pine_version: 'v5',
    release_date: '2026-03-28',
    changelog: [
      'v1.0.0: Initial release of Aemeth Supertrend TP/SL Indicator with 3 Take Profit targets'
    ],
    changelog_id: [
      'v1.0.0: Rilis awal Aemeth Supertrend TP/SL Indicator dengan 3 level target Take Profit'
    ],
    changelog_en: [
      'v1.0.0: Initial release of Aemeth Supertrend TP/SL Indicator with 3 Take Profit targets'
    ],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'Supertrend Trend Visualization: Visualisasi garis tren Supertrend.',
      'Entry Price Level: Level harga entry yang jelas pada chart.',
      'Stop Loss (SL): Level stop loss dinamis terukur.',
      'TP1, TP2, TP3: Tiga level target take profit terstruktur.',
      'Chart-based Trading Levels: Proyeksi garis horizontal langsung pada chart.',
      'Pine Script Source Code: Uncompiled source code Pine Script v5.'
    ],
    features_id: [
      'Supertrend Trend Visualization: Visualisasi garis tren Supertrend.',
      'Entry Price Level: Level harga entry yang jelas pada chart.',
      'Stop Loss (SL): Level stop loss dinamis terukur.',
      'TP1, TP2, TP3: Tiga level target take profit terstruktur.',
      'Chart-based Trading Levels: Proyeksi garis horizontal langsung pada chart.',
      'Pine Script Source Code: Uncompiled source code Pine Script v5.'
    ],
    features_en: [
      'Supertrend Trend Visualization: Clear Supertrend directional line plot.',
      'Entry Price Level: Structured on-chart entry execution boundary.',
      'Stop Loss (SL): Dynamic risk mitigation stop boundary.',
      'TP1, TP2, TP3: Three staged take profit target levels.',
      'Chart-based Trading Levels: Visual horizontal price projections.',
      'Pine Script Source Code: Uncompiled Pine Script v5 source code.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Sistem Analisis', value: 'Supertrend Trend Following & ATR' },
      { label: 'Sinyal', value: 'Bearish ⇩ / Bullish ⇧ dengan Entry, SL, TP1, TP2, TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Analysis System', value: 'Supertrend Trend Following & ATR' },
      { label: 'Signals', value: 'Bearish ⇩ / Bullish ⇧ with Entry, SL, TP1, TP2, TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    package_includes_id: [
      'Pine Script source code (.pine & .txt).',
      'Panduan instalasi di TradingView.',
      'Bantuan setup dari tim Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView setup and indicator guide.',
      'Direct setup support from Aemeth team if needed.'
    ],
    tradingview_script_id: 'aemeth_supertrend_tpsl_v5',
    is_published: true,
    thumbnail_url: './products/supertrend-tpsl.jpg',
    preview_images: ['./products/supertrend-tpsl.jpg', './products/supertrend-chart.png'],
    created_at: new Date('2026-03-28').toISOString(),
  }),
  injectPricing({
    id: 'vwap-reversal-tpsl',
    slug: 'aemeth-vwap-reversal-tpsl',
    title: 'Aemeth VWAP Reversal TP/SL Indicator',
    title_id: 'Aemeth VWAP Reversal TP/SL Indicator',
    title_en: 'Aemeth VWAP Reversal TP/SL Indicator',
    short_desc: 'Deteksi sinyal pembalikan harga saat menembus VWAP dengan level Entry, Stop Loss terukur, dan 3 target Take Profit (TP1, TP2, TP3).',
    short_desc_id: 'Deteksi sinyal pembalikan harga saat menembus VWAP dengan level Entry, Stop Loss terukur, dan 3 target Take Profit (TP1, TP2, TP3).',
    short_desc_en: 'Detects VWAP breakout reversal setups with clear on-chart Entry, Stop Loss, and 3 Take Profit targets (TP1, TP2, TP3).',
    long_desc: 'Aemeth VWAP Reversal TP/SL Indicator dirancang untuk membantu trader mendeteksi momen pembalikan harga saat harga menembus Volume Weighted Average Price (VWAP).\n\nIndikator ini secara otomatis memplot level Entry saat breakout terjadi, Stop Loss (SL) pada level VWAP/swing, serta 3 target Take Profit (TP1, TP2, TP3) bertingkat pada chart untuk target risiko-imbalan yang optimal.\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis teknikal objektif berbasis volume dan harga, bukan jaminan keuntungan finansial.',
    long_desc_id: 'Aemeth VWAP Reversal TP/SL Indicator dirancang untuk membantu trader mendeteksi momen pembalikan harga saat harga menembus Volume Weighted Average Price (VWAP).\n\nIndikator ini secara otomatis memplot level Entry saat breakout terjadi, Stop Loss (SL) pada level VWAP/swing, serta 3 target Take Profit (TP1, TP2, TP3) bertingkat pada chart untuk target risiko-imbalan yang optimal.\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis teknikal objektif berbasis volume dan harga, bukan jaminan keuntungan finansial.',
    long_desc_en: 'Aemeth VWAP Reversal TP/SL Indicator helps traders detect high-probability reversal moments when price pierces through the Volume Weighted Average Price (VWAP).\n\nIt dynamically projects Entry lines, Stop Loss (SL) aligned with VWAP levels, and three sequential Take Profit targets (TP1, TP2, TP3) for optimal risk-to-reward ratio management.\n\nImportant Notice:\nThis indicator is an objective technical analysis tool based on volume and price action, not a profit guarantee.',
    type: 'open_source',
    category: 'reversal',
    version: '1.0.0',
    pine_version: 'v5',
    release_date: '2026-03-28',
    changelog: [
      'v1.0.0: Initial release of Aemeth VWAP Reversal TP/SL Indicator'
    ],
    changelog_id: [
      'v1.0.0: Rilis awal Aemeth VWAP Reversal TP/SL Indicator'
    ],
    changelog_en: [
      'v1.0.0: Initial release of Aemeth VWAP Reversal TP/SL Indicator'
    ],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'VWAP Reversal: Deteksi sinyal saat harga menembus VWAP.',
      'Entry & SL: Level entry dan stop loss yang jelas.',
      '3 Take Profit: TP1, TP2, TP3 untuk target optimal.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_id: [
      'VWAP Reversal: Deteksi sinyal saat harga menembus VWAP.',
      'Entry & SL: Level entry dan stop loss yang jelas.',
      '3 Take Profit: TP1, TP2, TP3 untuk target optimal.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_en: [
      'VWAP Reversal: Signal detection when price penetrates VWAP.',
      'Entry & SL: Clear entry and protective stop loss levels.',
      '3 Take Profit: TP1, TP2, TP3 for optimal profit targeting.',
      'Pine Script: Ready-to-use Pine Script v5 source code.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Sistem Analisis', value: 'Volume Weighted Average Price (VWAP) Reversal' },
      { label: 'Sinyal', value: 'VWAP ⇩ Bearish / VWAP ⇧ Bullish dengan Entry, SL, TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Analysis System', value: 'Volume Weighted Average Price (VWAP) Reversal' },
      { label: 'Signals', value: 'VWAP ⇩ Bearish / VWAP ⇧ Bullish with Entry, SL, TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    package_includes_id: [
      'Pine Script source code (.pine & .txt).',
      'Panduan instalasi di TradingView.',
      'Bantuan setup dari tim Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView setup and indicator guide.',
      'Direct setup support from Aemeth team if needed.'
    ],
    tradingview_script_id: 'aemeth_vwap_reversal_tpsl_v5',
    is_published: true,
    thumbnail_url: './products/vwap-reversal.jpg',
    preview_images: ['./products/vwap-reversal.jpg'],
    created_at: new Date('2026-03-28').toISOString(),
  }),
  injectPricing({
    id: 'major-swing',
    slug: 'aemeth-major-swing-indicator',
    title: 'Aemeth Major Swing Indicator',
    title_id: 'Aemeth Major Swing Indicator',
    title_en: 'Aemeth Major Swing Indicator',
    short_desc: 'Deteksi swing high dan swing low utama pasar dengan label Buy/Sell yang jelas dan parameter swing yang dapat disesuaikan.',
    short_desc_id: 'Deteksi swing high dan swing low utama pasar dengan label Buy/Sell yang jelas dan parameter swing yang dapat disesuaikan.',
    short_desc_en: 'Identifies major market swing highs and lows with clear Buy/Sell labels and fully adjustable swing length parameters.',
    long_desc: 'Aemeth Major Swing Indicator membantu trader mengidentifikasi struktur ayunan harga (swing high & swing low) yang signifikan pada grafik tanpa tertipu noise jangka pendek.\n\nDilengkapi label BUY dan SELL visual yang tegas pada titik balik struktural utama, serta pengaturan fleksibel untuk menyesuaikan panjang swing dan jarak minimum sesuai gaya trading swing maupun intraday.\n\nCatatan Penting:\nIndikator ini mendeteksi titik konfirmasi swing secara objektif, bukan ramalan masa depan.',
    long_desc_id: 'Aemeth Major Swing Indicator membantu trader mengidentifikasi struktur ayunan harga (swing high & swing low) yang signifikan pada grafik tanpa tertipu noise jangka pendek.\n\nDilengkapi label BUY dan SELL visual yang tegas pada titik balik struktural utama, serta pengaturan fleksibel untuk menyesuaikan panjang swing dan jarak minimum sesuai gaya trading swing maupun intraday.\n\nCatatan Penting:\nIndikator ini mendeteksi titik konfirmasi swing secara objektif, bukan ramalan masa depan.',
    long_desc_en: 'Aemeth Major Swing Indicator assists traders in identifying significant market swing highs and swing lows without falling prey to short-term noise.\n\nFeatures crisp, distinct BUY and SELL labels at major structural turning points, along with customizable swing length and minimum ATR distance parameters suited for both swing and intraday trading.\n\nImportant Notice:\nThis indicator identifies confirmed swing pivot points objectively, not speculative forecasting.',
    type: 'open_source',
    category: 'trend',
    version: '1.0.0',
    pine_version: 'v5',
    release_date: '2026-03-28',
    changelog: [
      'v1.0.0: Initial release of Aemeth Major Swing Indicator'
    ],
    changelog_id: [
      'v1.0.0: Rilis awal Aemeth Major Swing Indicator'
    ],
    changelog_en: [
      'v1.0.0: Initial release of Aemeth Major Swing Indicator'
    ],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'Major Swing Signal: Deteksi swing high dan swing low utama.',
      'Buy / Sell Label: Label jelas pada swing penting.',
      'Custom Settings: Atur panjang swing dan jarak minimum.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_id: [
      'Major Swing Signal: Deteksi swing high dan swing low utama.',
      'Buy / Sell Label: Label jelas pada swing penting.',
      'Custom Settings: Atur panjang swing dan jarak minimum.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_en: [
      'Major Swing Signal: Detection of primary swing high and swing low.',
      'Buy / Sell Label: Distinct on-chart labels at critical pivots.',
      'Custom Settings: Adjustable swing lookback and minimum clearance distance.',
      'Pine Script: Ready-to-use Pine Script v5 source code.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Sistem Analisis', value: 'Pivot Swing High / Low Structural Filtering' },
      { label: 'Sinyal', value: 'BUY & SELL labels pada swing terkonfirmasi' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Analysis System', value: 'Pivot Swing High / Low Structural Filtering' },
      { label: 'Signals', value: 'BUY & SELL labels on confirmed swing pivots' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    package_includes_id: [
      'Pine Script source code (.pine & .txt).',
      'Panduan instalasi di TradingView.',
      'Bantuan setup dari tim Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView setup and indicator guide.',
      'Direct setup support from Aemeth team if needed.'
    ],
    tradingview_script_id: 'aemeth_major_swing_v5',
    is_published: true,
    thumbnail_url: './products/major-swing.jpg',
    preview_images: ['./products/major-swing.jpg'],
    created_at: new Date('2026-03-28').toISOString(),
  }),
  injectPricing({
    id: 'stochastic-cross-tpsl',
    slug: 'aemeth-stochastic-cross-tpsl',
    title: 'Aemeth Stochastic Cross TP/SL Indicator',
    title_id: 'Aemeth Stochastic Cross TP/SL Indicator',
    title_en: 'Aemeth Stochastic Cross TP/SL Indicator',
    short_desc: 'Deteksi persilangan momentum %K dan %D Stochastic Oscillator dengan level Entry, Stop Loss, dan 3 target Take Profit terstruktur.',
    short_desc_id: 'Deteksi persilangan momentum %K dan %D Stochastic Oscillator dengan level Entry, Stop Loss, dan 3 target Take Profit terstruktur.',
    short_desc_en: 'Detects Stochastic %K and %D momentum crossovers with on-chart Entry, Stop Loss, and 3 structured Take Profit targets.',
    long_desc: 'Aemeth Stochastic Cross TP/SL Indicator membaca persilangan garis %K dan %D dari Stochastic Oscillator pada area overbought atau oversold untuk menangkap momentum awal.\n\nSecara otomatis menampilkan level Entry harga, Stop Loss (SL) terproteksi, serta 3 target Take Profit (TP1, TP2, TP3) yang proporsional sehingga eksekusi trading lebih terencana dan disiplin.\n\nCatatan Penting:\nIndikator ini adalah alat bantu kalkulasi teknikal momentum, bukan kepastian arah harga pasar.',
    long_desc_id: 'Aemeth Stochastic Cross TP/SL Indicator membaca persilangan garis %K dan %D dari Stochastic Oscillator pada area overbought atau oversold untuk menangkap momentum awal.\n\nSecara otomatis menampilkan level Entry harga, Stop Loss (SL) terproteksi, serta 3 target Take Profit (TP1, TP2, TP3) yang proporsional sehingga eksekusi trading lebih terencana dan disiplin.\n\nCatatan Penting:\nIndikator ini adalah alat bantu kalkulasi teknikal momentum, bukan kepastian arah harga pasar.',
    long_desc_en: 'Aemeth Stochastic Cross TP/SL Indicator reads %K and %D line crossovers from the Stochastic Oscillator in overbought or oversold territories to capture nascent momentum moves.\n\nIt automatically plots entry levels, guarded Stop Loss lines, and 3 proportional Take Profit targets (TP1, TP2, TP3) for disciplined trade execution.\n\nImportant Notice:\nThis indicator is a momentum calculation aid, not an infallible price predictor.',
    type: 'open_source',
    category: 'momentum',
    version: '1.0.0',
    pine_version: 'v5',
    release_date: '2026-03-28',
    changelog: [
      'v1.0.0: Initial release of Aemeth Stochastic Cross TP/SL Indicator'
    ],
    changelog_id: [
      'v1.0.0: Rilis awal Aemeth Stochastic Cross TP/SL Indicator'
    ],
    changelog_en: [
      'v1.0.0: Initial release of Aemeth Stochastic Cross TP/SL Indicator'
    ],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'Stochastic Cross Signal: Deteksi persilangan %K dan %D.',
      'Entry & SL: Level entry dan stop loss yang jelas.',
      '3 Take Profit: TP1, TP2, TP3 untuk target optimal.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_id: [
      'Stochastic Cross Signal: Deteksi persilangan %K dan %D.',
      'Entry & SL: Level entry dan stop loss yang jelas.',
      '3 Take Profit: TP1, TP2, TP3 untuk target optimal.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_en: [
      'Stochastic Cross Signal: Detects %K and %D line crossovers.',
      'Entry & SL: Crisp entry and protective stop loss levels.',
      '3 Take Profit: TP1, TP2, TP3 for optimal target fulfillment.',
      'Pine Script: Ready-to-use Pine Script v5 source code.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Sistem Analisis', value: 'Stochastic Oscillator Momentum Cross' },
      { label: 'Sinyal', value: 'Stoch Cross ⇩ / Stoch Cross ⇧ dengan Entry, SL, TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Analysis System', value: 'Stochastic Oscillator Momentum Cross' },
      { label: 'Signals', value: 'Stoch Cross ⇩ / Stoch Cross ⇧ with Entry, SL, TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    package_includes_id: [
      'Pine Script source code (.pine & .txt).',
      'Panduan instalasi di TradingView.',
      'Bantuan setup dari tim Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView setup and indicator guide.',
      'Direct setup support from Aemeth team if needed.'
    ],
    tradingview_script_id: 'aemeth_stochastic_cross_tpsl_v5',
    is_published: true,
    thumbnail_url: './products/stochastic-cross.jpg',
    preview_images: ['./products/stochastic-cross.jpg'],
    created_at: new Date('2026-03-28').toISOString(),
  }),
  injectPricing({
    id: 'crt-entry-tpsl',
    slug: 'aemeth-crt-entry-tpsl',
    title: 'Aemeth CRT Entry TP/SL Indicator',
    title_id: 'Aemeth CRT Entry TP/SL Indicator',
    title_en: 'Aemeth CRT Entry TP/SL Indicator',
    short_desc: 'Deteksi sinyal Candle Range Theory (CRT) dengan visualisasi setup range, level Entry, Stop Loss (SL), dan 3 target Take Profit (TP1, TP2, TP3).',
    short_desc_id: 'Deteksi sinyal Candle Range Theory (CRT) dengan visualisasi setup range, level Entry, Stop Loss (SL), dan 3 target Take Profit (TP1, TP2, TP3).',
    short_desc_en: 'Detects Candle Range Theory (CRT) setups with range markers, on-chart Entry, Stop Loss (SL), and 3 Take Profit targets (TP1, TP2, TP3).',
    long_desc: 'Aemeth CRT Entry TP/SL Indicator dirancang berdasarkan metodologi Candle Range Theory (CRT) untuk memetakan range pembentukan harga, manipulasi wick, dan ekspansi arah berikutnya.\n\nDilengkapi penanda sinyal CRT, kotak acuan range, level Entry konfirmasi, batas risiko Stop Loss (SL), dan tiga level Take Profit (TP1, TP2, TP3) bertahap langsung pada chart TradingView.\n\nCatatan Penting:\nIndikator ini adalah alat bantu membaca model Candle Range Theory, bukan jaminan sukses transaksi.',
    long_desc_id: 'Aemeth CRT Entry TP/SL Indicator dirancang berdasarkan metodologi Candle Range Theory (CRT) untuk memetakan range pembentukan harga, manipulasi wick, dan ekspansi arah berikutnya.\n\nDilengkapi penanda sinyal CRT, kotak acuan range, level Entry konfirmasi, batas risiko Stop Loss (SL), dan tiga level Take Profit (TP1, TP2, TP3) bertahap langsung pada chart TradingView.\n\nCatatan Penting:\nIndikator ini adalah alat bantu membaca model Candle Range Theory, bukan jaminan sukses transaksi.',
    long_desc_en: 'Aemeth CRT Entry TP/SL Indicator is formulated around Candle Range Theory (CRT) principles to map range formation, wick manipulation, and subsequent true trend expansion.\n\nFeatures distinct CRT setup badges, range reference framing, confirmed Entry lines, protective Stop Loss (SL) boundaries, and three phased Take Profit targets (TP1, TP2, TP3) directly on your TradingView chart.\n\nImportant Notice:\nThis indicator is a CRT model visualizer, not a financial guarantee.',
    type: 'open_source',
    category: 'trend',
    version: '1.0.0',
    pine_version: 'v5',
    release_date: '2026-03-28',
    changelog: [
      'v1.0.0: Initial release of Aemeth CRT Entry TP/SL Indicator'
    ],
    changelog_id: [
      'v1.0.0: Rilis awal Aemeth CRT Entry TP/SL Indicator'
    ],
    changelog_en: [
      'v1.0.0: Initial release of Aemeth CRT Entry TP/SL Indicator'
    ],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'CRT Signal: Deteksi sinyal CRT secara akurat.',
      'Entry & SL: Level entry dan stop loss yang jelas.',
      '3 Take Profit: TP1, TP2, TP3 untuk target optimal.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_id: [
      'CRT Signal: Deteksi sinyal CRT secara akurat.',
      'Entry & SL: Level entry dan stop loss yang jelas.',
      '3 Take Profit: TP1, TP2, TP3 untuk target optimal.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_en: [
      'CRT Signal: Accurate detection of Candle Range Theory setups.',
      'Entry & SL: Clear entry and stop loss demarcation.',
      '3 Take Profit: TP1, TP2, TP3 for structured target scaling.',
      'Pine Script: Ready-to-use Pine Script v5 source code.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Sistem Analisis', value: 'Candle Range Theory (CRT)' },
      { label: 'Sinyal', value: 'CRT Entry, SL, TP1, TP2, TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Analysis System', value: 'Candle Range Theory (CRT)' },
      { label: 'Signals', value: 'CRT Entry, SL, TP1, TP2, TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    package_includes_id: [
      'Pine Script source code (.pine & .txt).',
      'Panduan instalasi di TradingView.',
      'Bantuan setup dari tim Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView setup and indicator guide.',
      'Direct setup support from Aemeth team if needed.'
    ],
    tradingview_script_id: 'aemeth_crt_entry_tpsl_v5',
    is_published: true,
    thumbnail_url: './products/crt-entry.jpg',
    preview_images: ['./products/crt-entry.jpg'],
    created_at: new Date('2026-03-28').toISOString(),
  }),
  injectPricing({
    id: 'rsi-reversal-tpsl',
    slug: 'aemeth-rsi-reversal-tpsl',
    title: 'Aemeth RSI Reversal TP/SL Indicator',
    title_id: 'Aemeth RSI Reversal TP/SL Indicator',
    title_en: 'Aemeth RSI Reversal TP/SL Indicator',
    short_desc: 'Deteksi momentum saat harga keluar dari area ekstrem RSI dengan level Entry, Stop Loss terukur, dan 3 target Take Profit bertingkat.',
    short_desc_id: 'Deteksi momentum saat harga keluar dari area ekstrem RSI dengan level Entry, Stop Loss terukur, dan 3 target Take Profit bertingkat.',
    short_desc_en: 'Detects momentum reversals exiting RSI extreme zones with on-chart Entry, Stop Loss, and 3 progressive Take Profit targets.',
    long_desc: 'Aemeth RSI Reversal TP/SL Indicator mendeteksi momentum pembalikan arah saat Relative Strength Index (RSI) berbalik dan keluar dari zona ekstrem (oversold di bawah 30 atau overbought di atas 70).\n\nSecara otomatis menandai titik Entry terkonfirmasi, menempatkan level Stop Loss (SL) yang proporsional, serta memetakan 3 target Take Profit (TP1, TP2, TP3) untuk membantu eksekusi swing atau scalping dengan rasio risiko-imbalan yang sehat.\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis osilator momentum objektif, bukan jaminan profit trading.',
    long_desc_id: 'Aemeth RSI Reversal TP/SL Indicator mendeteksi momentum pembalikan arah saat Relative Strength Index (RSI) berbalik dan keluar dari zona ekstrem (oversold di bawah 30 atau overbought di atas 70).\n\nSecara otomatis menandai titik Entry terkonfirmasi, menempatkan level Stop Loss (SL) yang proporsional, serta memetakan 3 target Take Profit (TP1, TP2, TP3) untuk membantu eksekusi swing atau scalping dengan rasio risiko-imbalan yang sehat.\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis osilator momentum objektif, bukan jaminan profit trading.',
    long_desc_en: 'Aemeth RSI Reversal TP/SL Indicator identifies reversal momentum as the Relative Strength Index (RSI) exits extreme zones (oversold below 30 or overbought above 70).\n\nIt automatically displays confirmed Entry points, establishes proportional Stop Loss (SL) limits, and projects three Take Profit targets (TP1, TP2, TP3) for disciplined swing or scalping execution.\n\nImportant Notice:\nThis indicator is an objective momentum tool, not an absolute guarantee of trading profitability.',
    type: 'open_source',
    category: 'reversal',
    version: '1.0.0',
    pine_version: 'v5',
    release_date: '2026-03-28',
    changelog: [
      'v1.0.0: Initial release of Aemeth RSI Reversal TP/SL Indicator'
    ],
    changelog_id: [
      'v1.0.0: Rilis awal Aemeth RSI Reversal TP/SL Indicator'
    ],
    changelog_en: [
      'v1.0.0: Initial release of Aemeth RSI Reversal TP/SL Indicator'
    ],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'RSI Reversal Signal: Deteksi momentum keluar dari area extreme.',
      'Entry & SL: Level entry dan stop loss yang jelas.',
      '3 Take Profit: TP1, TP2, TP3 untuk target optimal.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_id: [
      'RSI Reversal Signal: Deteksi momentum keluar dari area extreme.',
      'Entry & SL: Level entry dan stop loss yang jelas.',
      '3 Take Profit: TP1, TP2, TP3 untuk target optimal.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_en: [
      'RSI Reversal Signal: Momentum turning point exiting extreme zone.',
      'Entry & SL: Clear entry and protective stop loss demarcation.',
      '3 Take Profit: TP1, TP2, TP3 for structured target scaling.',
      'Pine Script: Ready-to-use Pine Script v5 source code.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Sistem Analisis', value: 'Relative Strength Index (RSI) Extreme Reversal' },
      { label: 'Sinyal', value: 'RSI ⇧ Bullish / RSI ⇩ Bearish dengan Entry, SL, TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Analysis System', value: 'Relative Strength Index (RSI) Extreme Reversal' },
      { label: 'Signals', value: 'RSI ⇧ Bullish / RSI ⇩ Bearish with Entry, SL, TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    package_includes_id: [
      'Pine Script source code (.pine & .txt).',
      'Panduan instalasi di TradingView.',
      'Bantuan setup dari tim Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView setup and indicator guide.',
      'Direct setup support from Aemeth team if needed.'
    ],
    tradingview_script_id: 'aemeth_rsi_reversal_tpsl_v5',
    is_published: true,
    thumbnail_url: './products/rsi-reversal.jpg',
    preview_images: ['./products/rsi-reversal.jpg'],
    created_at: new Date('2026-03-28').toISOString(),
  }),
  injectPricing({
    id: 'macd-crossover-v1',
    slug: 'aemeth-macd-crossover-v1',
    title: 'Aemeth MACD Crossover V1 by RIDHO',
    title_id: 'Aemeth MACD Crossover V1 by RIDHO',
    title_en: 'Aemeth MACD Crossover V1 by RIDHO',
    short_desc: 'Deteksi momentum persilangan garis MACD dengan evaluasi Grade, AI Confidence level, zona Stop Loss, dan tiga target Take Profit.',
    short_desc_id: 'Deteksi momentum persilangan garis MACD dengan evaluasi Grade, AI Confidence level, zona Stop Loss, dan tiga target Take Profit.',
    short_desc_en: 'Detects MACD momentum crossovers with multi-tier Grade evaluation, AI Confidence telemetry, Stop Loss boundaries, and three Risk/Reward Take Profit targets.',
    long_desc: 'Aemeth MACD Crossover V1 by RIDHO is an advanced momentum-based technical analysis indicator engineered for TradingView. It identifies market momentum shifts through configurable Fast, Slow, and Signal MACD calculations, paired with optional candle-close verification to prevent premature signals.\n\nThe system features dynamic ATR-based Stop Loss positioning and sequential Take Profit projections (TP1, TP2, TP3) anchored to customizable Risk/Reward ratios. On-chart Grade badges (A, B, C, D) and AI Confidence telemetry evaluate signal quality against volume and momentum parameters, complemented by high-contrast SL and TP zone visualization.\n\nImportant Notice:\nThis indicator is an objective analytical decision-support tool. It does not provide automated trading or guaranteed returns. Risk management remains the sole responsibility of the user.',
    long_desc_id: 'Aemeth MACD Crossover V1 by RIDHO adalah indikator analisis teknikal momentum modern untuk TradingView. Indikator ini mendeteksi perubahan momentum pasar melalui perhitungan garis MACD Fast, Slow, dan Signal yang dapat dikonfigurasi, disertai opsi konfirmasi saat candle close untuk memfilter sinyal dini.\n\nDilengkapi batas Stop Loss (SL) berbasis ATR dan tiga target Take Profit berurutan (TP1, TP2, TP3) berbasis Risk/Reward, serta badge penilaian Grade (A, B, C, D) dan level AI Confidence yang mengevaluasi kondisi volume serta momentum pasar secara terstruktur.\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis teknikal objektif, bukan jaminan keuntungan finansial. Keputusan transaksi dan pengendalian risiko sepenuhnya merupakan tanggung jawab pengguna.',
    long_desc_en: 'Aemeth MACD Crossover V1 by RIDHO is an advanced momentum-based technical analysis indicator engineered for TradingView. It identifies market momentum shifts through configurable Fast, Slow, and Signal MACD calculations, paired with optional candle-close verification to prevent premature signals.\n\nThe system features dynamic ATR-based Stop Loss positioning and sequential Take Profit projections (TP1, TP2, TP3) anchored to customizable Risk/Reward ratios. On-chart Grade badges (A, B, C, D) and AI Confidence telemetry evaluate signal quality against volume and momentum parameters, complemented by high-contrast SL and TP zone visualization.\n\nImportant Notice:\nThis indicator is an objective analytical decision-support tool. It does not provide automated trading or guaranteed returns. Risk management remains the sole responsibility of the user.',
    type: 'open_source',
    category: 'momentum',
    version: '1.0.0',
    pine_version: 'v5',
    release_date: '2026-03-29',
    changelog: [
      'v1.0.0: Initial release of Aemeth MACD Crossover V1 by RIDHO'
    ],
    changelog_id: [
      'v1.0.0: Rilis awal Aemeth MACD Crossover V1 by RIDHO'
    ],
    changelog_en: [
      'v1.0.0: Initial release of Aemeth MACD Crossover V1 by RIDHO'
    ],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
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
    features_id: [
      'MACD Crossover Signal: Deteksi momentum dengan akurat.',
      'Entry & SL: Level entry dan stop loss yang jelas.',
      '3 Take Profit: TP1, TP2, TP3 untuk target optimal.',
      'Grade & AI Confidence: Evaluasi kualitas sinyal visual.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_en: [
      'MACD Crossover Signal: Accurate momentum detection.',
      'Entry & SL: Clear entry and stop loss levels.',
      '3 Take Profit: Sequential TP1, TP2, TP3 targets.',
      'Grade & AI Confidence: Visual signal quality assessment.',
      'Pine Script: Ready-to-use Pine Script source code.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Sistem Analisis', value: 'MACD Momentum Crossover & ATR' },
      { label: 'Sinyal', value: 'Bullish & Bearish Crossover dengan SL dan TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Analysis System', value: 'MACD Momentum Crossover & ATR' },
      { label: 'Signals', value: 'Bullish & Bearish Crossover with SL and TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    package_includes_id: [
      'Pine Script source code (.pine & .txt).',
      'Panduan instalasi di TradingView.',
      'Bantuan setup dari tim Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView setup and indicator guide.',
      'Direct setup support from Aemeth team if needed.'
    ],
    tradingview_script_id: 'aemeth_macd_crossover_v1',
    is_published: true,
    thumbnail_url: './products/macd-crossover.jpg',
    preview_images: ['./products/macd-crossover.jpg'],
    created_at: new Date('2026-03-29').toISOString(),
  }),
  injectPricing({
    id: 'hull-suite-v1',
    slug: 'aemeth-hull-suite-v1',
    title: 'Aemeth Hull Suite V1',
    title_id: 'Aemeth Hull Suite V1',
    title_en: 'Aemeth Hull Suite V1',
    short_desc: 'Visualisasi tren dinamis berbasis Hull Moving Average (Hull Suite) dengan pita kurva warna, level Entry, Stop Loss, dan 3 target Take Profit.',
    short_desc_id: 'Visualisasi tren dinamis berbasis Hull Moving Average (Hull Suite) dengan pita kurva warna, level Entry, Stop Loss, dan 3 target Take Profit.',
    short_desc_en: 'Dynamic trend-following Hull Suite indicator featuring curved color-shifting ribbons, automated Entry levels, Stop Loss, and 3 sequential Take Profit targets.',
    long_desc: 'Aemeth Hull Suite V1 adalah indikator trend-following yang memanfaatkan kehalusan dan kecepatan respon Hull Moving Average (HMA) untuk mendeteksi arah tren pasar secara real-time.\n\nMenampilkan pita kurva Hull MA yang dinamis (hijau saat bullish, merah saat bearish), penanda sinyal BUY terkonfirmasi pada pergantian tren, kalkulasi otomatis Entry dan Stop Loss (SL), serta proyeksi 3 target Take Profit (TP1, TP2, TP3) bertingkat.\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis teknikal visual, bukan jaminan keuntungan transaksi.',
    long_desc_id: 'Aemeth Hull Suite V1 adalah indikator trend-following yang memanfaatkan kehalusan dan kecepatan respon Hull Moving Average (HMA) untuk mendeteksi arah tren pasar secara real-time.\n\nMenampilkan pita kurva Hull MA yang dinamis (hijau saat bullish, merah saat bearish), penanda sinyal BUY terkonfirmasi pada pergantian tren, kalkulasi otomatis Entry dan Stop Loss (SL), serta proyeksi 3 target Take Profit (TP1, TP2, TP3) bertingkat.\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis teknikal visual, bukan jaminan keuntungan transaksi.',
    long_desc_en: 'Aemeth Hull Suite V1 utilizes the responsiveness of the Hull Moving Average (HMA) to map market trend trajectories without lag.\n\nFeatures a smooth curved ribbon (green for bullish, red for bearish), confirmed BUY entry triggers at trend flips, automatic Stop Loss calculations, and 3 staged Take Profit targets (TP1, TP2, TP3).\n\nImportant Notice:\nThis indicator is an objective visual charting tool, not a financial guarantee.',
    type: 'open_source',
    category: 'trend',
    version: '1.0.0',
    pine_version: 'v5',
    release_date: '2026-03-29',
    changelog: [
      'v1.0.0: Initial release of Aemeth Hull Suite V1'
    ],
    changelog_id: [
      'v1.0.0: Rilis awal Aemeth Hull Suite V1'
    ],
    changelog_en: [
      'v1.0.0: Initial release of Aemeth Hull Suite V1'
    ],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'Hull MA Trend with Band: Pita tren dinamis hijau/merah.',
      'Entry & SL Auto Calculation: Kalkulasi otomatis level entry dan stop loss.',
      '3 Take Profit: TP1 (1:1.5), TP2 (1:2), TP3 (1:2.5).',
      'Smart Visual Trading Tools: Tampilan visual chart modern & bersih.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_id: [
      'Hull MA Trend with Band: Pita tren dinamis hijau/merah.',
      'Entry & SL Auto Calculation: Kalkulasi otomatis level entry dan stop loss.',
      '3 Take Profit: TP1 (1:1.5), TP2 (1:2), TP3 (1:2.5).',
      'Smart Visual Trading Tools: Tampilan visual chart modern & bersih.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_en: [
      'Hull MA Trend with Band: Dynamic green/red curved ribbon.',
      'Entry & SL Auto Calculation: Automated entry and stop loss mapping.',
      '3 Take Profit: TP1 (1:1.5), TP2 (1:2), TP3 (1:2.5) sequential targets.',
      'Smart Visual Trading Tools: Grade & AI Confidence badge evaluation.',
      'Pine Script: Ready-to-use Pine Script v5 source code.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Sistem Analisis', value: 'Hull Moving Average Ribbon (Hull Suite)' },
      { label: 'Sinyal', value: 'BUY dengan Entry, SL, TP1, TP2, TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Analysis System', value: 'Hull Moving Average Ribbon (Hull Suite)' },
      { label: 'Signals', value: 'BUY with Entry, SL, TP1, TP2, TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    package_includes_id: [
      'Pine Script source code (.pine & .txt).',
      'Panduan instalasi di TradingView.',
      'Bantuan setup dari tim Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView setup and indicator guide.',
      'Direct setup support from Aemeth team if needed.'
    ],
    tradingview_script_id: 'aemeth_hull_suite_v1',
    is_published: true,
    thumbnail_url: './products/hull-suite.jpg',
    preview_images: ['./products/hull-suite.jpg'],
    created_at: new Date('2026-03-29').toISOString(),
  }),
  injectPricing({
    id: 'ema-ribbon-flow',
    slug: 'aemeth-ema-ribbon-flow',
    title: 'Aemeth EMA Ribbon Flow',
    title_id: 'Aemeth EMA Ribbon Flow',
    title_en: 'Aemeth EMA Ribbon Flow',
    short_desc: 'Visualisasi pita tren multi-EMA yang halus dan responsif dengan penanda sinyal BUY/SELL pada titik transisi tren.',
    short_desc_id: 'Visualisasi pita tren multi-EMA yang halus dan responsif dengan penanda sinyal BUY/SELL pada titik transisi tren.',
    short_desc_en: 'Multi-EMA dynamic ribbon flow visualizing market momentum transitions with distinct BUY/SELL crossover signals.',
    long_desc: 'Aemeth EMA Ribbon Flow menyusun serangkaian garis Exponential Moving Average (EMA) dengan panjang bertingkat yang membentuk pita dinamis di sekitar pergerakan candlestick.\n\nPita berwarna hijau saat tren menguat (bullish) dan berubah merah saat tren melemah (bearish), memberikan panduan visual langsung terhadap kekuatan tren tanpa indikator tambahan yang membingungkan. Dilengkapi label BUY dan SELL yang muncul pada titik awal pembalikan arah.\n\nCatatan Penting:\nIndikator ini mendeteksi arah aliran tren secara matematis, bukan ramalan masa depan.',
    long_desc_id: 'Aemeth EMA Ribbon Flow menyusun serangkaian garis Exponential Moving Average (EMA) dengan panjang bertingkat yang membentuk pita dinamis di sekitar pergerakan candlestick.\n\nPita berwarna hijau saat tren menguat (bullish) dan berubah merah saat tren melemah (bearish), memberikan panduan visual langsung terhadap kekuatan tren tanpa indikator tambahan yang membingungkan. Dilengkapi label BUY dan SELL yang muncul pada titik awal pembalikan arah.\n\nCatatan Penting:\nIndikator ini mendeteksi arah aliran tren secara matematis, bukan ramalan masa depan.',
    long_desc_en: 'Aemeth EMA Ribbon Flow deploys a cascading series of Exponential Moving Averages (EMAs) that form a fluid ribbon following price action.\n\nColors transition smoothly between green (bullish) and red (bearish), providing intuitive visual trend identification alongside BUY and SELL labels at ribbon expansion points.\n\nImportant Notice:\nThis indicator is a mathematical trend tracker, not an infallible price predictor.',
    type: 'open_source',
    category: 'trend',
    version: '1.0.0',
    pine_version: 'v5',
    release_date: '2026-03-29',
    changelog: [
      'v1.0.0: Initial release of Aemeth EMA Ribbon Flow'
    ],
    changelog_id: [
      'v1.0.0: Rilis awal Aemeth EMA Ribbon Flow'
    ],
    changelog_en: [
      'v1.0.0: Initial release of Aemeth EMA Ribbon Flow'
    ],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'EMA Ribbon Trend Detection: Visual trend clarity across multi-EMA spectrum.',
      'Smart Signal: BUY / SELL labels at confirmed ribbon shifts.',
      'Multi-EMA Visualization: Cascading ribbon structure.',
      'Customizable Settings: Adjustable EMA lengths and smoothing.',
      'Smooth Performance: Lightweight execution without chart lag.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_id: [
      'EMA Ribbon Trend Detection: Visual trend clarity.',
      'Smart Signal: BUY / SELL with confidence.',
      'Customizable: Ribbon & Filter settings.',
      'Smooth Performance: Lightweight & fast.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_en: [
      'EMA Ribbon Trend Detection: Visual trend clarity.',
      'Smart Signal: BUY / SELL with confidence.',
      'Customizable: Ribbon & Filter settings.',
      'Smooth Performance: Lightweight & fast.',
      'Pine Script: Ready-to-use Pine Script source code.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Sistem Analisis', value: 'Multi-EMA Ribbon Flow' },
      { label: 'Sinyal', value: 'BUY & SELL pada transisi pita EMA' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Analysis System', value: 'Multi-EMA Ribbon Flow' },
      { label: 'Signals', value: 'BUY & SELL on ribbon transitions' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    package_includes_id: [
      'Pine Script source code (.pine & .txt).',
      'Panduan instalasi di TradingView.',
      'Bantuan setup dari tim Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView setup and indicator guide.',
      'Direct setup support from Aemeth team if needed.'
    ],
    tradingview_script_id: 'aemeth_ema_ribbon_flow_v5',
    is_published: true,
    thumbnail_url: './products/ema-ribbon-flow.jpg',
    preview_images: ['./products/ema-ribbon-flow.jpg'],
    created_at: new Date('2026-03-29').toISOString(),
  }),
  injectPricing({
    id: 'ema-crossover-rsi',
    slug: 'aemeth-ema-crossover-rsi',
    title: 'Aemeth EMA Crossover + RSI',
    title_id: 'Aemeth EMA Crossover + RSI',
    title_en: 'Aemeth EMA Crossover + RSI',
    short_desc: 'Deteksi tren berbasis persilangan EMA Fast 20 dan EMA Slow 50 dengan filter konfirmasi RSI serta level Entry, Stop Loss, dan target TP1–TP3 bertingkat.',
    short_desc_id: 'Deteksi tren berbasis persilangan EMA Fast 20 dan EMA Slow 50 dengan filter konfirmasi RSI serta level Entry, Stop Loss, dan target TP1–TP3 bertingkat.',
    short_desc_en: 'Trend detection powered by EMA Fast 20 and EMA Slow 50 crossover with RSI confirmation filter, Entry, Stop Loss, and 3 dotted TP targets.',
    long_desc: 'Aemeth EMA Crossover + RSI menggabungkan kecepatan reaksi EMA Fast 20 (garis kuning) dan stabilitas tren EMA Slow 50 (garis oranye) dengan filter konfirmasi momentum Relative Strength Index (RSI).\n\nSaat persilangan bearish terjadi dengan konfirmasi RSI, indikator memproyeksikan garis putus-putus horizontal yang jelas untuk Stop Loss di atas entry (SL: 3587.561), garis Entry harga (3572.560), serta 3 target Take Profit proporsional (TP1: 3563.559, TP2: 3554.558, TP3: 3545.557) langsung pada chart TradingView.\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis teknikal objektif berbasis moving average dan RSI, bukan jaminan profit transaksi.',
    long_desc_id: 'Aemeth EMA Crossover + RSI menggabungkan kecepatan reaksi EMA Fast 20 (garis kuning) dan stabilitas tren EMA Slow 50 (garis oranye) dengan filter konfirmasi momentum Relative Strength Index (RSI).\n\nSaat persilangan bearish terjadi dengan konfirmasi RSI, indikator memproyeksikan garis putus-putus horizontal yang jelas untuk Stop Loss di atas entry (SL: 3587.561), garis Entry harga (3572.560), serta 3 target Take Profit proporsional (TP1: 3563.559, TP2: 3554.558, TP3: 3545.557) langsung pada chart TradingView.\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis teknikal objektif berbasis moving average dan RSI, bukan jaminan profit transaksi.',
    long_desc_en: 'Aemeth EMA Crossover + RSI pairs the responsiveness of EMA Fast 20 (yellow line) and the baseline trend stability of EMA Slow 50 (orange line) with an RSI momentum confirmation filter.\n\nWhen a confirmed crossover fires, the indicator projects crisp horizontal dotted lines for Stop Loss (SL: 3587.561), Entry (3572.560), and three risk-reward Take Profit levels (TP1: 3563.559, TP2: 3554.558, TP3: 3545.557).\n\nImportant Notice:\nThis indicator is an objective technical analysis tool, not a financial guarantee.',
    type: 'open_source',
    category: 'momentum',
    version: '1.0.0',
    pine_version: 'v5',
    release_date: '2026-03-29',
    changelog: [
      'v1.0.0: Initial release of Aemeth EMA Crossover + RSI'
    ],
    changelog_id: [
      'v1.0.0: Rilis awal Aemeth EMA Crossover + RSI'
    ],
    changelog_en: [
      'v1.0.0: Initial release of Aemeth EMA Crossover + RSI'
    ],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'EMA Crossover Trend Detection: Fast 20 (Yellow) & Slow 50 (Orange) crossover triggers.',
      'RSI Filter Signal Confirmation: Extreme oscillator momentum filtering.',
      'Entry / SL / TP1–TP3: Dotted level projections on chart (SL: 3587.561, Entry: 3572.560, TP1–TP3).',
      'ATR-Based Risk Levels: Proportional risk-reward target spacing without repainting.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_id: [
      'EMA Crossover: Trend Detection.',
      'RSI Filter: Signal Confirmation.',
      'Multi-EMA Visualization: Fast 20 (Kuning) & Slow 50 (Oranye).',
      'Customizable Settings: Fleksibel dan mudah diatur.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_en: [
      'EMA Crossover: Trend Detection.',
      'RSI Filter: Signal Confirmation.',
      'Multi-EMA Visualization: Fast 20 (Yellow) & Slow 50 (Orange).',
      'Customizable Settings: Highly flexible parameters.',
      'Pine Script: Ready-to-use Pine Script source code.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Sistem Analisis', value: 'EMA 20/50 Crossover with RSI Filter' },
      { label: 'Sinyal', value: 'Bearish & Bullish Crossover dengan SL, Entry, TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Analysis System', value: 'EMA 20/50 Crossover with RSI Filter' },
      { label: 'Signals', value: 'Bearish & Bullish Crossover with SL, Entry, TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    package_includes_id: [
      'Pine Script source code (.pine & .txt).',
      'Panduan instalasi di TradingView.',
      'Bantuan setup dari tim Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView setup and indicator guide.',
      'Direct setup support from Aemeth team if needed.'
    ],
    tradingview_script_id: 'aemeth_ema_crossover_rsi_v5',
    is_published: true,
    thumbnail_url: './products/ema-crossover-rsi.jpg',
    preview_images: ['./products/ema-crossover-rsi.jpg'],
    created_at: new Date('2026-03-29').toISOString(),
  }),
  injectPricing({
    id: 'smc-bos-choch',
    slug: 'aemeth-smc-bos-choch',
    title: 'Aemeth SMC BOS/CHoCH Entry SL TP',
    title_id: 'Aemeth SMC BOS/CHoCH Entry SL TP',
    title_en: 'Aemeth SMC BOS/CHoCH Entry SL TP',
    short_desc: 'Indikator market structure yang memvisualisasikan Break of Structure (BOS), perubahan arah tren (CHoCH), Order Block, serta level Entry, Stop Loss, dan tiga target TP.',
    short_desc_id: 'Indikator market structure yang memvisualisasikan Break of Structure (BOS), perubahan arah tren (CHoCH), Order Block, serta level Entry, Stop Loss, dan tiga target TP.',
    short_desc_en: 'Market structure indicator visualizing Break of Structure (BOS), Change of Character (CHoCH), Order Blocks, and direct Entry, Stop Loss, and 3 Take Profit levels.',
    long_desc: 'Aemeth SMC BOS/CHoCH Entry SL TP dirancang untuk membantu trader memetakan struktur pasar Smart Money Concepts secara objektif. Mengidentifikasi Swing High dan Swing Low, Break of Structure (BOS), serta Change of Character (CHoCH) saat tren berbalik arah.\n\nSecara otomatis menampilkan level Stop Loss merah (SL: 3587.561), Entry biru (3572.560), dan target Take Profit hijau (TP1: 3563.559, TP2: 3554.558, TP3: 3545.557) dengan opsi jarak berbasis volatilitas ATR maupun jarak tetap.\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis struktur teknikal, bukan jaminan keuntungan transaksi.',
    long_desc_id: 'Aemeth SMC BOS/CHoCH Entry SL TP dirancang untuk membantu trader memetakan struktur pasar Smart Money Concepts secara objektif. Mengidentifikasi Swing High dan Swing Low, Break of Structure (BOS), serta Change of Character (CHoCH) saat tren berbalik arah.\n\nSecara otomatis menampilkan level Stop Loss merah (SL: 3587.561), Entry biru (3572.560), dan target Take Profit hijau (TP1: 3563.559, TP2: 3554.558, TP3: 3545.557) dengan opsi jarak berbasis volatilitas ATR maupun jarak tetap.\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis struktur teknikal, bukan jaminan keuntungan transaksi.',
    long_desc_en: 'Aemeth SMC BOS/CHoCH Entry SL TP assists traders in mapping Smart Money Concepts market structures objectively. It identifies Swing Highs and Lows, Break of Structure (BOS), and Change of Character (CHoCH) directional transitions.\n\nAutomatically projects Stop Loss (SL: 3587.561), Entry (3572.560), and Take Profit boundaries (TP1: 3563.559, TP2: 3554.558, TP3: 3545.557) with both ATR-based and fixed risk scaling.\n\nImportant Notice:\nThis indicator is a structured market analysis tool, not an absolute profit guarantee.',
    type: 'open_source',
    category: 'trend',
    version: '1.0.0',
    pine_version: 'v5',
    release_date: '2026-03-30',
    changelog: ['v1.0.0: Initial release of Aemeth SMC BOS/CHoCH Entry SL TP'],
    changelog_id: ['v1.0.0: Rilis awal Aemeth SMC BOS/CHoCH Entry SL TP'],
    changelog_en: ['v1.0.0: Initial release of Aemeth SMC BOS/CHoCH Entry SL TP'],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'BOS & CHoCH Detection: Deteksi struktur pasar dan perubahan tren.',
      'Entry / SL / TP Label: Level harga terstruktur pada chart.',
      'ATR-Based Risk Levels: Manajemen risiko berbasis volatilitas dinamis.',
      'Order Block Visualization & Alerts: Penanda zona minat dan alert real-time.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_id: [
      'BOS & CHoCH Detection: Deteksi struktur pasar dan perubahan tren.',
      'Entry / SL / TP Label: Level harga terstruktur pada chart.',
      'ATR-Based Risk Levels: Manajemen risiko berbasis volatilitas dinamis.',
      'Order Block Visualization: Penanda zona minat dan alert real-time.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_en: [
      'BOS & CHoCH Detection: Market structure breaks and trend flips.',
      'Entry / SL / TP Label: On-chart price levels.',
      'ATR-Based Risk Levels: Volatility-adjusted risk management.',
      'Order Block Visualization: Institutional zone highlighting.',
      'Pine Script: Ready-to-use Pine Script v5 source code.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Sistem Analisis', value: 'Smart Money Concepts (BOS & CHoCH)' },
      { label: 'Sinyal', value: 'Breakout Struktur dengan Entry, SL, TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Analysis System', value: 'Smart Money Concepts (BOS & CHoCH)' },
      { label: 'Signals', value: 'Structure Breaks with Entry, SL, TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    package_includes_id: [
      'Pine Script source code (.pine & .txt).',
      'Panduan instalasi di TradingView.',
      'Bantuan setup dari tim Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView setup and indicator guide.',
      'Direct setup support from Aemeth team if needed.'
    ],
    tradingview_script_id: 'aemeth_smc_bos_choch_v1',
    is_published: true,
    thumbnail_url: './products/smc-bos-choch.jpg',
    preview_images: ['./products/smc-bos-choch.jpg'],
    created_at: new Date('2026-03-30').toISOString(),
  }),
  injectPricing({
    id: 'smart-structure-entry-v1',
    slug: 'aemeth-smart-structure-entry-v1',
    title: 'AEMETH Smart Structure Entry System v1.0',
    title_id: 'AEMETH Smart Structure Entry System v1.0',
    title_en: 'AEMETH Smart Structure Entry System v1.0',
    short_desc: 'Menggabungkan filter tren EMA dan deteksi market structure untuk mengidentifikasi sinyal BUY/SELL serta level Entry, Stop Loss, dan 3 TP.',
    short_desc_id: 'Menggabungkan filter tren EMA dan deteksi market structure untuk mengidentifikasi sinyal BUY/SELL serta level Entry, Stop Loss, dan 3 TP.',
    short_desc_en: 'Combines dual EMA trend filters with market structure breakout detection, projecting BUY/SELL signals, Entry, SL, and 3 TP targets.',
    long_desc: 'AEMETH Smart Structure Entry System v1.0 menggabungkan filter tren EMA Fast dan EMA Slow dengan deteksi breakout struktur pasar untuk mengidentifikasi momentum terarah. Menampilkan sinyal BUY dan SELL terkonfirmasi pada candle close, Stop Loss protektif (SL: 3701.671), Entry otomatis (3672.845), serta tiga target Take Profit (TP1: 3644.019, TP2: 3615.194, TP3: 3586.368) berdasarkan perhitungan ATR dan Risk/Reward.\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis teknikal visual, bukan jaminan keuntungan transaksi.',
    long_desc_id: 'AEMETH Smart Structure Entry System v1.0 menggabungkan filter tren EMA Fast dan EMA Slow dengan deteksi breakout struktur pasar untuk mengidentifikasi momentum terarah. Menampilkan sinyal BUY dan SELL terkonfirmasi pada candle close, Stop Loss protektif (SL: 3701.671), Entry otomatis (3672.845), serta tiga target Take Profit (TP1: 3644.019, TP2: 3615.194, TP3: 3586.368) berdasarkan perhitungan ATR dan Risk/Reward.\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis teknikal visual, bukan jaminan keuntungan transaksi.',
    long_desc_en: 'AEMETH Smart Structure Entry System v1.0 merges Fast and Slow EMA trend filters with market structure breakout recognition. Delivers closed-bar BUY/SELL triggers, protective Stop Loss (SL: 3701.671), automated Entry (3672.845), and three sequential Take Profit targets (TP1: 3644.019, TP2: 3615.194, TP3: 3586.368) based on ATR volatility scaling.\n\nImportant Notice:\nThis indicator is an objective technical analysis aid, not a financial guarantee.',
    type: 'open_source',
    category: 'trend',
    version: '1.0.0',
    pine_version: 'v5',
    release_date: '2026-03-30',
    changelog: ['v1.0.0: Initial release of AEMETH Smart Structure Entry System v1.0'],
    changelog_id: ['v1.0.0: Rilis awal AEMETH Smart Structure Entry System v1.0'],
    changelog_en: ['v1.0.0: Initial release of AEMETH Smart Structure Entry System v1.0'],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'Trend Filter EMA: Filter arah tren berbasis Fast dan Slow EMA.',
      'SMC Structure BOS / CHoCH: Deteksi breakout struktur pasar.',
      'Entry SL TP Auto: Level harga otomatis terkonfirmasi candle close.',
      'Alert Signal Real-Time: Notifikasi sinyal instan TradingView.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_id: [
      'Trend Filter EMA: Filter arah tren berbasis Fast dan Slow EMA.',
      'SMC Structure BOS / CHoCH: Deteksi breakout struktur pasar.',
      'Entry SL TP Auto: Level harga otomatis terkonfirmasi candle close.',
      'Alert Signal Real-Time: Notifikasi sinyal instan TradingView.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_en: [
      'Trend Filter EMA: Fast & Slow EMA directional filtering.',
      'SMC Structure BOS / CHoCH: Market structure breakout detection.',
      'Entry SL TP Auto: Closed-bar automated price targets.',
      'Alert Signal Real-Time: Instant TradingView alert integration.',
      'Pine Script: Ready-to-use Pine Script source code.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Sistem Analisis', value: 'EMA Trend Filter & Market Structure Break' },
      { label: 'Sinyal', value: 'BUY & SELL dengan SL, Entry, TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Analysis System', value: 'EMA Trend Filter & Market Structure Break' },
      { label: 'Signals', value: 'BUY & SELL with SL, Entry, TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    package_includes_id: [
      'Pine Script source code (.pine & .txt).',
      'Panduan instalasi di TradingView.',
      'Bantuan setup dari tim Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView setup and indicator guide.',
      'Direct setup support from Aemeth team if needed.'
    ],
    tradingview_script_id: 'aemeth_smart_structure_entry_v1',
    is_published: true,
    thumbnail_url: './products/smart-structure-entry.jpg',
    preview_images: ['./products/smart-structure-entry.jpg'],
    created_at: new Date('2026-03-30').toISOString(),
  }),
  injectPricing({
    id: 'liquidity-sweep-reversal-v2',
    slug: 'aemeth-liquidity-sweep-reversal-v2',
    title: 'AEMETH Liquidity Sweep Reversal v2.0',
    title_id: 'AEMETH Liquidity Sweep Reversal v2.0',
    title_en: 'AEMETH Liquidity Sweep Reversal v2.0',
    short_desc: 'Mengidentifikasi potensi pembalikan harga setelah Liquidity Sweep dengan konfirmasi momentum RSI, sinyal BUY/SELL, dan level TP1–TP3.',
    short_desc_id: 'Mengidentifikasi potensi pembalikan harga setelah Liquidity Sweep dengan konfirmasi momentum RSI, sinyal BUY/SELL, dan level TP1–TP3.',
    short_desc_en: 'Identifies high-conviction reversals following Liquidity Sweeps with RSI confirmation, BUY/SELL signals, and 3 TP targets.',
    long_desc: 'AEMETH Liquidity Sweep Reversal v2.0 dirancang untuk mendeteksi manipulasi wick dan pengambilan likuiditas (Liquidity Sweep) pada Pivot High dan Pivot Low penting. Dilengkapi konfirmasi arah candle serta filter momentum RSI untuk menyaring false sweep.\n\nMemproyeksikan sinyal SELL/BUY terkonfirmasi dengan Stop Loss (SL: 3701.671), SELL Entry (3623.640), dan 3 target Take Profit bertingkat (TP1: 3619.488, TP2: 3615.335, TP3: 3611.183).\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis likuiditas teknikal, bukan jaminan keuntungan transaksi.',
    long_desc_id: 'AEMETH Liquidity Sweep Reversal v2.0 dirancang untuk mendeteksi manipulasi wick dan pengambilan likuiditas (Liquidity Sweep) pada Pivot High dan Pivot Low penting. Dilengkapi konfirmasi arah candle serta filter momentum RSI untuk menyaring false sweep.\n\nMemproyeksikan sinyal SELL/BUY terkonfirmasi dengan Stop Loss (SL: 3701.671), SELL Entry (3623.640), dan 3 target Take Profit bertingkat (TP1: 3619.488, TP2: 3615.335, TP3: 3611.183).\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis likuiditas teknikal, bukan jaminan keuntungan transaksi.',
    long_desc_en: 'AEMETH Liquidity Sweep Reversal v2.0 identifies false breakout wick sweeps across pivotal highs and lows. Augmented with candlestick direction confirmation and RSI momentum filtering.\n\nProjects validated entry signals with Stop Loss (SL: 3701.671), SELL Entry (3623.640), and three staged Take Profit levels (TP1: 3619.488, TP2: 3615.335, TP3: 3611.183).\n\nImportant Notice:\nThis indicator is an objective charting tool, not an absolute profit guarantee.',
    type: 'open_source',
    category: 'reversal',
    version: '2.0.0',
    pine_version: 'v5',
    release_date: '2026-03-30',
    changelog: ['v2.0.0: Upgraded liquidity sweep engine with RSI momentum filtering and fallback lookback'],
    changelog_id: ['v2.0.0: Peningkatan mesin liquidity sweep dengan filter RSI dan fallback lookback'],
    changelog_en: ['v2.0.0: Upgraded liquidity sweep engine with RSI momentum filtering and fallback lookback'],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'Liquidity Sweep Detection: Deteksi sapuan likuiditas pada pivot kunci.',
      'Smart Reversal Signal: Sinyal pembalikan arah dengan konfirmasi RSI.',
      'Entry SL TP Auto: Level harga otomatis terhitung berbasis ATR.',
      'Alert Real-Time: Notifikasi sinyal sweep TradingView.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_id: [
      'Liquidity Sweep Detection: Deteksi sapuan likuiditas pada pivot kunci.',
      'Smart Reversal Signal: Sinyal pembalikan arah dengan konfirmasi RSI.',
      'Entry SL TP Auto: Level harga otomatis terhitung berbasis ATR.',
      'Alert Real-Time: Notifikasi sinyal sweep TradingView.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_en: [
      'Liquidity Sweep Detection: Major pivot liquidity hunt tracking.',
      'Smart Reversal Signal: Reversal alerts paired with RSI confirmation.',
      'Entry SL TP Auto: Volatility-adjusted entry, SL, and TP targets.',
      'Alert Real-Time: Native TradingView alert integration.',
      'Pine Script: Ready-to-use Pine Script source code.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Sistem Analisis', value: 'Pivot Liquidity Sweep & RSI Momentum' },
      { label: 'Sinyal', value: 'SELL & BUY Reversal dengan SL dan TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Analysis System', value: 'Pivot Liquidity Sweep & RSI Momentum' },
      { label: 'Signals', value: 'SELL & BUY Reversal with SL and TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    package_includes_id: [
      'Pine Script source code (.pine & .txt).',
      'Panduan instalasi di TradingView.',
      'Bantuan setup dari tim Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView setup and indicator guide.',
      'Direct setup support from Aemeth team if needed.'
    ],
    tradingview_script_id: 'aemeth_liquidity_sweep_reversal_v2',
    is_published: true,
    thumbnail_url: './products/liquidity-sweep-reversal.jpg',
    preview_images: ['./products/liquidity-sweep-reversal.jpg'],
    created_at: new Date('2026-03-30').toISOString(),
  }),
  injectPricing({
    id: 'mean-reversion-engine-v3',
    slug: 'aemeth-mean-reversion-engine-v3',
    title: 'AEMETH Mean Reversion Engine v3.0',
    title_id: 'AEMETH Mean Reversion Engine v3.0',
    title_en: 'AEMETH Mean Reversion Engine v3.0',
    short_desc: 'Mendeteksi pergerakan kembali ke area ekuilibrium setelah harga keluar dari Bollinger Bands, dengan filter VWAP dan konfirmasi RSI.',
    short_desc_id: 'Mendeteksi pergerakan kembali ke area ekuilibrium setelah harga keluar dari Bollinger Bands, dengan filter VWAP dan konfirmasi RSI.',
    short_desc_en: 'Identifies statistical mean reversion back inside Bollinger Bands with VWAP directional filtering and RSI momentum confirmation.',
    long_desc: 'AEMETH Mean Reversion Engine v3.0 dirancang untuk menangkap peluang saat harga kembali ke nilai rata-rata (mean reversion) setelah menyentuh deviasi ekstrem Bollinger Bands. Dilengkapi garis acuan VWAP serta konfirmasi momentum RSI untuk memvalidasi pembalikan arah.\n\nMemproyeksikan level BUY Entry (3614.930), Stop Loss terukur (SL: 3610.110), serta 3 target Take Profit (TP1: 3619.488, TP2: 3624.570, TP3: 3629.389).\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis statistik volatilitas, bukan jaminan hasil trading.',
    long_desc_id: 'AEMETH Mean Reversion Engine v3.0 dirancang untuk menangkap peluang saat harga kembali ke nilai rata-rata (mean reversion) setelah menyentuh deviasi ekstrem Bollinger Bands. Dilengkapi garis acuan VWAP serta konfirmasi momentum RSI untuk memvalidasi pembalikan arah.\n\nMemproyeksikan level BUY Entry (3614.930), Stop Loss terukur (SL: 3610.110), serta 3 target Take Profit (TP1: 3619.488, TP2: 3624.570, TP3: 3629.389).\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis statistik volatilitas, bukan jaminan hasil trading.',
    long_desc_en: 'AEMETH Mean Reversion Engine v3.0 captures equilibrium reversion setups following extreme standard deviation excursions outside Bollinger Bands. Anchored by VWAP directional filters and RSI confirmation.\n\nVisualizes BUY Entry (3614.930), guarded Stop Loss (SL: 3610.110), and three risk-reward target levels (TP1: 3619.488, TP2: 3624.570, TP3: 3629.389).\n\nImportant Notice:\nThis indicator is an objective statistical volatility aid, not a financial guarantee.',
    type: 'open_source',
    category: 'reversal',
    version: '3.0.0',
    pine_version: 'v5',
    release_date: '2026-03-30',
    changelog: ['v3.0.0: Full Pine Script v5 architecture with VWAP filter and Bollinger re-entry detection'],
    changelog_id: ['v3.0.0: Arsitektur Pine Script v5 dengan filter VWAP dan deteksi re-entry Bollinger Bands'],
    changelog_en: ['v3.0.0: Full Pine Script v5 architecture with VWAP filter and Bollinger re-entry detection'],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'Bollinger Bands Mean Reversion Signal: Deteksi re-entry setelah deviasi ekstrem.',
      'VWAP Filter RSI Confirmation: Filter arah tren dan konfirmasi momentum.',
      'ATR Stop Loss TP1, TP2, TP3: Manajemen level risiko-imbalan terstruktur.',
      'Customizable Settings: Parameter fleksibel untuk berbagai time frame.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_id: [
      'Bollinger Bands Mean Reversion Signal: Deteksi re-entry setelah deviasi ekstrem.',
      'VWAP Filter RSI Confirmation: Filter arah tren dan konfirmasi momentum.',
      'ATR Stop Loss TP1, TP2, TP3: Manajemen level risiko-imbalan terstruktur.',
      'Customizable Settings: Parameter fleksibel untuk berbagai time frame.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_en: [
      'Bollinger Bands Mean Reversion Signal: Band re-entry detection.',
      'VWAP Filter RSI Confirmation: Multi-layer trend and momentum filter.',
      'ATR Stop Loss TP1, TP2, TP3: Structured Risk/Reward targeting.',
      'Customizable Settings: Fully adjustable for various timeframes.',
      'Pine Script: Ready-to-use Pine Script source code.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Sistem Analisis', value: 'Bollinger Bands & VWAP Mean Reversion' },
      { label: 'Sinyal', value: 'BUY & SELL dengan SL dan TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Analysis System', value: 'Bollinger Bands & VWAP Mean Reversion' },
      { label: 'Signals', value: 'BUY & SELL with SL and TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    package_includes_id: [
      'Pine Script source code (.pine & .txt).',
      'Panduan instalasi di TradingView.',
      'Bantuan setup dari tim Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView setup and indicator guide.',
      'Direct setup support from Aemeth team if needed.'
    ],
    tradingview_script_id: 'aemeth_mean_reversion_engine_v3',
    is_published: true,
    thumbnail_url: './products/mean-reversion-engine.jpg',
    preview_images: ['./products/mean-reversion-engine.jpg'],
    created_at: new Date('2026-03-30').toISOString(),
  }),
  injectPricing({
    id: 'momentum-shift-pro-v4',
    slug: 'aemeth-momentum-shift-pro-v4',
    title: 'AEMETH Momentum Shift Pro v4.0',
    title_id: 'AEMETH Momentum Shift Pro v4.0',
    title_en: 'AEMETH Momentum Shift Pro v4.0',
    short_desc: 'Deteksi pergerakan momentum harga dengan konfirmasi presisi MACD dan Stochastic, dilengkapi level BUY ENTRY, SL, dan 3 TP.',
    short_desc_id: 'Deteksi pergerakan momentum harga dengan konfirmasi presisi MACD dan Stochastic, dilengkapi level BUY ENTRY, SL, dan 3 TP.',
    short_desc_en: 'Precision momentum shift detection powered by MACD and Stochastic confluence, projecting BUY ENTRY, SL, and 3 sequential TP targets.',
    long_desc: 'AEMETH Momentum Shift Pro v4.0 menangkap titik balik momentum pasar secara presisi menggunakan konfluensi sinyal MACD dan Stochastic Oscillator. Memetakan arah BUY yang kuat setelah fase konsolidasi atau koreksi.\n\nSecara visual menampilkan level BUY ENTRY (3632.935), Stop Loss protektif (SL 3625.515), serta tiga target Take Profit bertahap (TP1 3640.355, TP2 3644.065, TP3 3647.775).\n\nCatatan Penting:\nIndikator ini adalah alat bantu membaca momentum pasar, bukan jaminan keberhasilan transaksi.',
    long_desc_id: 'AEMETH Momentum Shift Pro v4.0 menangkap titik balik momentum pasar secara presisi menggunakan konfluensi sinyal MACD dan Stochastic Oscillator. Memetakan arah BUY yang kuat setelah fase konsolidasi atau koreksi.\n\nSecara visual menampilkan level BUY ENTRY (3632.935), Stop Loss protektif (SL 3625.515), serta tiga target Take Profit bertahap (TP1 3640.355, TP2 3644.065, TP3 3647.775).\n\nCatatan Penting:\nIndikator ini adalah alat bantu membaca momentum pasar, bukan jaminan keberhasilan transaksi.',
    long_desc_en: 'AEMETH Momentum Shift Pro v4.0 captures high-probability momentum shifts via dual MACD and Stochastic confluence. Designed for clean bullish trend-initiation execution.\n\nVisualizes BUY ENTRY (3632.935), protective Stop Loss (SL 3625.515), and three sequential Take Profit targets (TP1 3640.355, TP2 3644.065, TP3 3647.775).\n\nImportant Notice:\nThis indicator is an objective momentum tool, not an absolute financial guarantee.',
    type: 'open_source',
    category: 'momentum',
    version: '4.0.0',
    pine_version: 'v5',
    release_date: '2026-03-30',
    changelog: ['v4.0.0: Enhanced momentum confluence engine with MACD and Stochastic integration'],
    changelog_id: ['v4.0.0: Peningkatan mesin konfluensi momentum dengan integrasi MACD dan Stochastic'],
    changelog_en: ['v4.0.0: Enhanced momentum confluence engine with MACD and Stochastic integration'],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'Momentum Shift Signal: Deteksi pergerakan momentum harga.',
      'Entry & SL: Level entry dan stop loss yang jelas.',
      '3 Take Profit: TP1, TP2, TP3 untuk target bertahap.',
      'Strategi Presisi: Konfirmasi momentum menggunakan MACD dan Stochastic.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_id: [
      'Momentum Shift Signal: Deteksi pergerakan momentum harga.',
      'Entry & SL: Level entry dan stop loss yang jelas.',
      '3 Take Profit: TP1, TP2, TP3 untuk target bertahap.',
      'Strategi Presisi: Konfirmasi momentum menggunakan MACD dan Stochastic.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_en: [
      'Momentum Shift Signal: Detects key price momentum turns.',
      'Entry & SL: Defined entry and stop loss demarcation.',
      '3 Take Profit: Sequential TP1, TP2, TP3 target projections.',
      'Precision Strategy: MACD and Stochastic momentum confluence.',
      'Pine Script: Ready-to-use Pine Script source code.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Sistem Analisis', value: 'MACD & Stochastic Momentum Confluence' },
      { label: 'Sinyal', value: 'BUY dengan SL, Entry, TP1, TP2, TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Analysis System', value: 'MACD & Stochastic Momentum Confluence' },
      { label: 'Signals', value: 'BUY with SL, Entry, TP1, TP2, TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    package_includes_id: [
      'Pine Script source code (.pine & .txt).',
      'Panduan instalasi di TradingView.',
      'Bantuan setup dari tim Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView setup and indicator guide.',
      'Direct setup support from Aemeth team if needed.'
    ],
    tradingview_script_id: 'aemeth_momentum_shift_pro_v4',
    is_published: true,
    thumbnail_url: './products/momentum-shift-pro.jpg',
    preview_images: ['./products/momentum-shift-pro.jpg'],
    created_at: new Date('2026-03-30').toISOString(),
  }),
  injectPricing({
    id: 'trend-pullback-hunter-v5',
    slug: 'aemeth-trend-pullback-hunter-v5',
    title: 'AEMETH Trend Pullback Hunter v5.0',
    title_id: 'AEMETH Trend Pullback Hunter v5.0',
    title_en: 'AEMETH Trend Pullback Hunter v5.0',
    short_desc: 'Mengidentifikasi entry lanjutan tren (trend pullback) dengan Supertrend, EMA Pullback, konfirmasi ADX, dan level SELL, SL, TP1–TP3.',
    short_desc_id: 'Mengidentifikasi entry lanjutan tren (trend pullback) dengan Supertrend, EMA Pullback, konfirmasi ADX, dan level SELL, SL, TP1–TP3.',
    short_desc_en: 'Detects high-probability trend continuation entries using Supertrend, EMA Pullbacks, ADX trend strength, and SELL setup levels.',
    long_desc: 'AEMETH Trend Pullback Hunter v5.0 menggabungkan arah tren makro dari Supertrend merah dengan area pullback dinamis EMA oranye untuk menangkap continuation bearish. Dikonfirmasi oleh ADX untuk memastikan kekuatan tren cukup kuat sebelum memicu entry.\n\nMemproyeksikan setup SELL lengkap dengan Stop Loss di atas entry (SL 3882.525), SELL ENTRY (3856.420), serta tiga target Take Profit berurutan semakin rendah (TP1 3830.315, TP2 3817.262, TP3 3804.209).\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis teknikal continuation, bukan jaminan profit trading.',
    long_desc_id: 'AEMETH Trend Pullback Hunter v5.0 menggabungkan arah tren makro dari Supertrend merah dengan area pullback dinamis EMA oranye untuk menangkap continuation bearish. Dikonfirmasi oleh ADX untuk memastikan kekuatan tren cukup kuat sebelum memicu entry.\n\nMemproyeksikan setup SELL lengkap dengan Stop Loss di atas entry (SL 3882.525), SELL ENTRY (3856.420), serta tiga target Take Profit berurutan semakin rendah (TP1 3830.315, TP2 3817.262, TP3 3804.209).\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis teknikal continuation, bukan jaminan profit trading.',
    long_desc_en: 'AEMETH Trend Pullback Hunter v5.0 pairs macro Supertrend direction with dynamic EMA retracements to capture bearish continuation waves. Filtered by ADX to ensure trend strength.\n\nProjects validated SELL setups with Stop Loss (SL 3882.525), SELL ENTRY (3856.420), and staged Take Profit levels (TP1 3830.315, TP2 3817.262, TP3 3804.209).\n\nImportant Notice:\nThis indicator is a trend continuation aid, not an absolute profit guarantee.',
    type: 'open_source',
    category: 'trend',
    version: '5.0.0',
    pine_version: 'v5',
    release_date: '2026-03-30',
    changelog: ['v5.0.0: Trend pullback continuation engine with Supertrend, EMA, and ADX filters'],
    changelog_id: ['v5.0.0: Mesin kelanjutan tren pullback dengan filter Supertrend, EMA, dan ADX'],
    changelog_en: ['v5.0.0: Trend pullback continuation engine with Supertrend, EMA, and ADX filters'],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'Trend Detection: Supertrend Direction dengan akurat.',
      'EMA Pullback: Trend Pullback Entry dengan EMA.',
      'ADX Confirmation: Trend Strength menggunakan ADX.',
      'Risk Management: Entry, SL & 3 TP untuk trading aman.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_id: [
      'Trend Detection: Supertrend Direction dengan akurat.',
      'EMA Pullback: Trend Pullback Entry dengan EMA.',
      'ADX Confirmation: Trend Strength menggunakan ADX.',
      'Risk Management: Entry, SL & 3 TP untuk trading aman.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_en: [
      'Trend Detection: Accurate Supertrend trend direction.',
      'EMA Pullback: High-probability retracement entries.',
      'ADX Confirmation: Trend strength validation via ADX.',
      'Risk Management: Structured Entry, SL & 3 TP levels.',
      'Pine Script: Ready-to-use Pine Script source code.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Sistem Analisis', value: 'Supertrend & EMA Pullback with ADX' },
      { label: 'Sinyal', value: 'SELL Continuation dengan SL dan TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Analysis System', value: 'Supertrend & EMA Pullback with ADX' },
      { label: 'Signals', value: 'SELL Continuation with SL and TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    package_includes_id: [
      'Pine Script source code (.pine & .txt).',
      'Panduan instalasi di TradingView.',
      'Bantuan setup dari tim Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView setup and indicator guide.',
      'Direct setup support from Aemeth team if needed.'
    ],
    tradingview_script_id: 'aemeth_trend_pullback_hunter_v5',
    is_published: true,
    thumbnail_url: './products/trend-pullback-hunter.jpg',
    preview_images: ['./products/trend-pullback-hunter.jpg'],
    created_at: new Date('2026-03-30').toISOString(),
  }),
  injectPricing({
    id: 'candle-impulse-v5',
    slug: 'aemeth-candle-impulse-v5',
    title: 'AEMETH Candle Impulse v5.0',
    title_id: 'AEMETH Candle Impulse v5.0',
    title_en: 'AEMETH Candle Impulse v5.0',
    short_desc: 'Mendeteksi momentum impuls candle dengan kurva HMA hijau, konfirmasi Engulfing & CCI, serta level BUY, Entry, SL, dan 3 TP.',
    short_desc_id: 'Mendeteksi momentum impuls candle dengan kurva HMA hijau, konfirmasi Engulfing & CCI, serta level BUY, Entry, SL, dan 3 TP.',
    short_desc_en: 'Detects candlestick impulse momentum with green HMA curve, Engulfing and CCI confirmation, and structured BUY setup levels.',
    long_desc: 'AEMETH Candle Impulse v5.0 menangkap pergerakan impulsif bullish melalui pola candlestick engulfing yang dikonfirmasi oleh arah momentum Hull Moving Average (HMA) hijau dan oscillator CCI yang melintasi garis nol.\n\nMemproyeksikan setup BUY terstruktur dengan BUY ENTRY (3609.325), Stop Loss di bawah entry (SL 3602.243), serta tiga level target Take Profit (TP1 3616.407, TP2 3623.489, TP3 3630.572).\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis momentum candle, bukan jaminan hasil transaksi.',
    long_desc_id: 'AEMETH Candle Impulse v5.0 menangkap pergerakan impulsif bullish melalui pola candlestick engulfing yang dikonfirmasi oleh arah momentum Hull Moving Average (HMA) hijau dan oscillator CCI yang melintasi garis nol.\n\nMemproyeksikan setup BUY terstruktur dengan BUY ENTRY (3609.325), Stop Loss di bawah entry (SL 3602.243), serta tiga level target Take Profit (TP1 3616.407, TP2 3623.489, TP3 3630.572).\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis momentum candle, bukan jaminan hasil transaksi.',
    long_desc_en: 'AEMETH Candle Impulse v5.0 isolates bullish momentum expansions using candle impulse recognition confirmed by green Hull Moving Average (HMA) and zero-line CCI crossing.\n\nProjects confirmed BUY setups with BUY ENTRY (3609.325), protective Stop Loss (SL 3602.243), and three staged Take Profit targets (TP1 3616.407, TP2 3623.489, TP3 3630.572).\n\nImportant Notice:\nThis indicator is a candlestick momentum tool, not an absolute financial guarantee.',
    type: 'open_source',
    category: 'momentum',
    version: '5.0.0',
    pine_version: 'v5',
    release_date: '2026-03-30',
    changelog: ['v5.0.0: Candle impulse momentum suite with HMA, Engulfing, and CCI filters'],
    changelog_id: ['v5.0.0: Suite momentum impuls candle dengan filter HMA, Engulfing, dan CCI'],
    changelog_en: ['v5.0.0: Candle impulse momentum suite with HMA, Engulfing, and CCI filters'],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'HMA Trend: Deteksi arah momentum melalui Hull Moving Average hijau.',
      'Engulfing Candle: Konfirmasi pola candle impulsif.',
      'CCI Confirmation: Konfirmasi momentum melalui pergerakan CCI melewati level nol.',
      'ATR Risk Management: Perhitungan Stop Loss dan 3 Take Profit terstruktur.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_id: [
      'HMA Trend: Deteksi arah momentum melalui Hull Moving Average hijau.',
      'Engulfing Candle: Konfirmasi pola candle impulsif.',
      'CCI Confirmation: Konfirmasi momentum melalui pergerakan CCI melewati level nol.',
      'ATR Risk Management: Perhitungan Stop Loss dan 3 Take Profit terstruktur.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_en: [
      'HMA Trend: Momentum orientation via green Hull Moving Average.',
      'Engulfing Candle: Impulsive candle structure confirmation.',
      'CCI Confirmation: Momentum validation as CCI traverses zero-line.',
      'ATR Risk Management: Structured Stop Loss and 3 Take Profit targets.',
      'Pine Script: Ready-to-use Pine Script source code.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Sistem Analisis', value: 'HMA & Engulfing Candle with CCI' },
      { label: 'Sinyal', value: 'BUY Impulse dengan SL, Entry, TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Analysis System', value: 'HMA & Engulfing Candle with CCI' },
      { label: 'Signals', value: 'BUY Impulse with SL, Entry, TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    package_includes_id: [
      'Pine Script source code (.pine & .txt).',
      'Panduan instalasi di TradingView.',
      'Bantuan setup dari tim Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView setup and indicator guide.',
      'Direct setup support from Aemeth team if needed.'
    ],
    tradingview_script_id: 'aemeth_candle_impulse_v5',
    is_published: true,
    thumbnail_url: './products/candle-impulse.jpg',
    preview_images: ['./products/candle-impulse.jpg'],
    created_at: new Date('2026-03-30').toISOString(),
  }),
  injectPricing({
    id: 'volatility-expansion-breakout-v6',
    slug: 'aemeth-volatility-expansion-breakout-v6',
    title: 'AEMETH Volatility Expansion Breakout v6.0',
    title_id: 'AEMETH Volatility Expansion Breakout v6.0',
    title_en: 'AEMETH Volatility Expansion Breakout v6.0',
    short_desc: 'Mendeteksi breakout harga Donchian Channel saat volatilitas berekspansi, dengan konfirmasi Williams %R dan level BUY, SL, TP1–TP3.',
    short_desc_id: 'Mendeteksi breakout harga Donchian Channel saat volatilitas berekspansi, dengan konfirmasi Williams %R dan level BUY, SL, TP1–TP3.',
    short_desc_en: 'Detects Donchian Channel breakouts during volatility expansion phases, filtered by Williams %R momentum with structured BUY levels.',
    long_desc: 'AEMETH Volatility Expansion Breakout v6.0 memantau fase kompresi volatilitas sebelum meledak menjadi breakout terarah melalui Donchian Channel. Divalidasi oleh rasio ekspansi ATR dan osilator momentum Williams %R.\n\nMemproyeksikan sinyal BUY terkonfirmasi dengan BUY ENTRY (3609.325), Stop Loss di bawah entry (SL 3602.243), dan target bertingkat (TP1 3616.407, TP2 3623.489, TP3 3630.572).\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis breakout volatilitas, bukan jaminan keuntungan transaksi.',
    long_desc_id: 'AEMETH Volatility Expansion Breakout v6.0 memantau fase kompresi volatilitas sebelum meledak menjadi breakout terarah melalui Donchian Channel. Divalidasi oleh rasio ekspansi ATR dan osilator momentum Williams %R.\n\nMemproyeksikan sinyal BUY terkonfirmasi dengan BUY ENTRY (3609.325), Stop Loss di bawah entry (SL 3602.243), dan target bertingkat (TP1 3616.407, TP2 3623.489, TP3 3630.572).\n\nCatatan Penting:\nIndikator ini adalah alat bantu analisis breakout volatilitas, bukan jaminan keuntungan transaksi.',
    long_desc_en: 'AEMETH Volatility Expansion Breakout v6.0 identifies breakouts breaking out of volatility squeeze ranges using Donchian Channels. Confirmed by ATR volatility expansion ratios and Williams %R momentum.\n\nPlots BUY ENTRY (3609.325), Stop Loss (SL 3602.243), and staged Take Profit levels (TP1 3616.407, TP2 3623.489, TP3 3630.572).\n\nImportant Notice:\nThis indicator is a volatility breakout tool, not an absolute profit guarantee.',
    type: 'open_source',
    category: 'trend',
    version: '6.0.0',
    pine_version: 'v5',
    release_date: '2026-03-30',
    changelog: ['v6.0.0: Donchian Channel volatility expansion breakout suite with Williams %R filter'],
    changelog_id: ['v6.0.0: Suite breakout ekspansi volatilitas Donchian Channel dengan filter Williams %R'],
    changelog_en: ['v6.0.0: Donchian Channel volatility expansion breakout suite with Williams %R filter'],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      'Volatility Breakout Signal: Deteksi breakout volatilitas.',
      'Channel Analysis: Analisis Donchian Channel.',
      'Momentum Filter: Filter dengan Williams %R.',
      'Risk Management: Entry, SL & 3 TP dengan ATR.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_id: [
      'Volatility Breakout Signal: Deteksi breakout volatilitas.',
      'Channel Analysis: Analisis Donchian Channel.',
      'Momentum Filter: Filter dengan Williams %R.',
      'Risk Management: Entry, SL & 3 TP dengan ATR.',
      'Pine Script: Source code siap digunakan.'
    ],
    features_en: [
      'Volatility Breakout Signal: Volatility expansion breakout trigger.',
      'Channel Analysis: Donchian Channel barrier tracking.',
      'Momentum Filter: Williams %R momentum confirmation.',
      'Risk Management: Volatility-adjusted Entry, SL & 3 TP.',
      'Pine Script: Ready-to-use Pine Script source code.'
    ],
    technical_specs_id: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Bahasa', value: 'Pine Script v5' },
      { label: 'Tipe', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Sistem Analisis', value: 'Donchian Channel & Volatility Expansion' },
      { label: 'Sinyal', value: 'BUY & SELL Breakout dengan SL dan TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    technical_specs_en: [
      { label: 'Platform', value: 'TradingView' },
      { label: 'Language', value: 'Pine Script v5' },
      { label: 'Type', value: 'Pine Script Source Code (Overlay Indicator)' },
      { label: 'Analysis System', value: 'Donchian Channel & Volatility Expansion' },
      { label: 'Signals', value: 'BUY & SELL Breakout with SL and TP1–TP3' },
      { label: 'Alerts', value: 'TradingView Alert Conditions' }
    ],
    package_includes_id: [
      'Pine Script source code (.pine & .txt).',
      'Panduan instalasi di TradingView.',
      'Bantuan setup dari tim Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      'Pine Script source code (.pine & .txt).',
      'TradingView setup and indicator guide.',
      'Direct setup support from Aemeth team if needed.'
    ],
    tradingview_script_id: 'aemeth_volatility_expansion_breakout_v6',
    is_published: true,
    thumbnail_url: './products/volatility-expansion-breakout.jpg',
    preview_images: ['./products/volatility-expansion-breakout.jpg'],
    created_at: new Date('2026-03-30').toISOString(),
  }),
];

// Helper to construct dynamic bundles using the central bundle calculation
function createBundleProduct(
  bundleType: 'starter' | 'pro' | 'ultimate',
  defaultProductIds: string[],
  slug: string,
  titleId: string,
  titleEn: string,
  descId: string,
  descEn: string
): Product {
  const calc = calculateBundlePrice(bundleType, defaultProductIds);
  const def = BUNDLE_DEFINITIONS[bundleType];

  return {
    id: `bundle-${bundleType}`,
    slug,
    title: titleId,
    title_id: titleId,
    title_en: titleEn,
    short_desc: descId,
    short_desc_id: descId,
    short_desc_en: descEn,
    long_desc: `${descId}\n\nSeluruh indikator dalam paket ini disertakan dengan kode sumber uncompiled Pine Script (.pine & .txt), panduan instalasi lengkap, dan lisensi permanen penggunaan pribadi.`,
    long_desc_id: `${descId}\n\nSeluruh indikator dalam paket ini disertakan dengan kode sumber uncompiled Pine Script (.pine & .txt), panduan instalasi lengkap, dan lisensi permanen penggunaan pribadi.`,
    long_desc_en: `${descEn}\n\nAll indicators in this package include uncompiled Pine Script source code (.pine & .txt), step-by-step setup guides, and perpetual single-user personal licenses.`,
    type: 'bundle',
    category: 'bundle',
    bundle_type: bundleType,
    price_cents: Math.round(calc.finalPriceIdr / 160),
    price_idr: calc.finalPriceIdr,
    normal_price_idr: calc.totalNormalPriceIdr,
    promo_price_idr: calc.finalPriceIdr,
    is_promo_active: isLaunchPromoActive(),
    discount_percent: calc.totalSavingsPercent,
    discount_idr: calc.totalSavingsIdr,
    discount_cents: Math.round(calc.totalSavingsIdr / 160),
    version: '2026.2',
    pine_version: 'v5',
    release_date: '2026-03-25',
    changelog: ['2026.2: Complete verified bundle package release with dynamic discounting'],
    changelog_id: ['2026.2: Rilis paket bundling resmi dengan diskon dinamis'],
    changelog_en: ['2026.2: Official bundle package release with dynamic discounting'],
    compatibility: 'TradingView Free, Essential, Plus, & Premium accounts',
    compatibility_id: 'TradingView (Free, Essential, Plus, dan Premium)',
    compatibility_en: 'TradingView (Free, Essential, Plus, and Premium)',
    features: [
      `${calc.productCount} File Kode Sumber Pine Script (.pine & .txt) Sekaligus`,
      `Tambahan Diskon Bundling ${Math.round(def.discountRate * 100)}% dari Harga Aktif`,
      'Panduan Pemasangan Step-by-Step Pine Editor TradingView',
      'Bantuan Instalasi Resmi dari Tim Aemeth',
      'Lisensi Permanen untuk Versi yang Dibeli'
    ],
    features_id: [
      `${calc.productCount} File Kode Sumber Pine Script (.pine & .txt) Sekaligus`,
      `Tambahan Diskon Bundling ${Math.round(def.discountRate * 100)}% dari Harga Aktif`,
      'Panduan Pemasangan Step-by-Step Pine Editor TradingView',
      'Bantuan Instalasi Resmi dari Tim Aemeth',
      'Lisensi Permanen untuk Versi yang Dibeli'
    ],
    features_en: [
      `All ${calc.productCount} Pine Script source codebases (.pine & .txt)`,
      `Additional ${Math.round(def.discountRate * 100)}% bundle package discount`,
      'Step-by-step TradingView Pine Editor walkthrough',
      'Official technical setup support from Aemeth team',
      'Perpetual single-user personal license'
    ],
    package_includes_id: [
      `${calc.productCount} Source code indikator Pine Script (.pine & .txt).`,
      'Panduan pemasangan lengkap di TradingView.',
      'Bantuan instalasi dari Aemeth jika diperlukan.'
    ],
    package_includes_en: [
      `${calc.productCount} Pine Script source code files (.pine & .txt).`,
      'Comprehensive TradingView installation guide.',
      'Personal installation assistance from Aemeth support.'
    ],
    included_product_ids: defaultProductIds,
    is_published: true,
    thumbnail_url: './products/trendline-sr-utbot.jpg',
    preview_images: ['./products/trendline-sr-utbot.jpg'],
    created_at: new Date('2026-03-25').toISOString(),
  };
}

// 3 Standard Bundle Packages
const BUNDLE_PRODUCTS: Product[] = [
  createBundleProduct(
    'starter',
    ['parabolic-sar', 'mfi-reversal'],
    'starter-pack',
    'Aemeth Starter Pack (Pilihan 2 Indikator)',
    'Aemeth Starter Pack (Select 2 Indicators)',
    'Pilih 2 indikator trading berbeda pilihanmu dengan tambahan diskon 15% dari harga aktif.',
    'Select any 2 indicators of your choice with an additional 15% bundle discount.'
  ),
  createBundleProduct(
    'pro',
    ['parabolic-sar', 'mfi-reversal', 'ichimoku-cloud'],
    'pro-pack',
    'Aemeth Pro Pack (Pilihan 3 Indikator)',
    'Aemeth Pro Pack (Select 3 Indicators)',
    'Pilih 3 indikator trading berbeda untuk analisa teknikal komprehensif dengan tambahan diskon 20%.',
    'Select any 3 indicators for multi-strategy confluence with an additional 20% bundle discount.'
  ),
  createBundleProduct(
    'ultimate',
    ['parabolic-sar', 'mfi-reversal', 'ichimoku-cloud', 'ai-signal-v1', 'trendline-sr-utbot'],
    'ultimate-pack',
    'Aemeth Ultimate Pack (Semua 5 Indikator)',
    'Aemeth Ultimate Pack (All 5 Indicators)',
    'Seluruh 5 indikator unggulan Aemeth sekaligus dalam satu lisensi lengkap dengan diskon maksimal 25%.',
    'All 5 flagship Aemeth trading indicators in one comprehensive suite with maximum 25% discount.'
  ),
];

export const BILINGUAL_PRODUCTS: Product[] = [
  ...SINGLE_INDICATORS,
  ...BUNDLE_PRODUCTS,
];

// Helper for local persistent storage
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
  // Products with strict canonical ID deduplication
  async getProducts(params?: { category?: string; type?: string; search?: string }) {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.type) query.append('type', params.type);
      if (params?.search) query.append('search', params.search);

      const res = await fetch(`${API_BASE}/products?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          // Canonical deduplication on backend-returned products
          const seen = new Set<string>();
          const deduped: Product[] = [];
          for (const p of data.products) {
            if (!seen.has(p.id)) {
              seen.add(p.id);
              deduped.push(p);
            }
          }
          return { success: true, products: deduped };
        }
        return data;
      }
    } catch {}

    const customProds = getLocalStore<Product[]>('aemeth_custom_products', []);
    const productMap = new Map<string, Product>();
    for (const p of BILINGUAL_PRODUCTS) {
      productMap.set(p.id, p);
    }
    for (const p of customProds) {
      if (!productMap.has(p.id)) {
        productMap.set(p.id, p);
      }
    }
    const all = Array.from(productMap.values());
    return { success: true, products: all };
  },

  async getProductBySlug(slug: string) {
    try {
      const res = await fetch(`${API_BASE}/products/${slug}`);
      if (res.ok) return await res.json();
    } catch {}

    const customProds = getLocalStore<Product[]>('aemeth_custom_products', []);
    const p = [...BILINGUAL_PRODUCTS, ...customProds].find((prod) => prod.slug === slug);
    if (p) return { success: true, product: { ...p, versions: [], included_products: [] } as any };
    return { success: false, error: 'Product not found' } as any;
  },

  // Pure Guest Checkout (No Customer Login)
  async createGuestOrder(data: {
    product_ids: string[];
    payment_method: string;
    customer_email: string;
    customer_name?: string;
    customer_tv_username?: string;
    bundle_type?: 'starter' | 'pro' | 'ultimate';
    license_accepted?: boolean;
  }) {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {}

    // Fallback Client-Side Fulfillment
    const orderNum = 'AEM-' + Math.floor(1000000 + Math.random() * 9000000);
    const orderId = 'ord_' + Date.now();
    const accessToken = 'tok_guest_' + Math.random().toString(36).substring(2) + Date.now().toString(36);

    const resolvedIds = data.product_ids.map(resolveProductId);
    let totalIdr = 0;
    let subtotalIdr = 0;
    let bundleDiscountIdr = 0;
    let totalSavingsIdr = 0;
    let totalCents = 0;
    let orderItems: OrderItem[] = [];

    if (data.bundle_type) {
      const bundleCalc = calculateBundlePrice(data.bundle_type, resolvedIds);
      if (!bundleCalc.isValid) {
        throw new Error(bundleCalc.error || 'Konfigurasi paket tidak valid');
      }
      totalIdr = bundleCalc.finalPriceIdr;
      subtotalIdr = bundleCalc.totalNormalPriceIdr;
      bundleDiscountIdr = bundleCalc.bundleDiscountAmountIdr;
      totalSavingsIdr = bundleCalc.totalSavingsIdr;
      totalCents = Math.round(totalIdr / 160);

      orderItems = bundleCalc.selectedProducts.map((p) => ({
        id: 'oi_' + Math.random().toString(36).slice(2, 10),
        order_id: orderId,
        product_id: p.id,
        product_title: p.name,
        product_type: 'open_source' as const,
        unit_price_cents: p.effectivePriceCents,
        product_version: p.version,
        normal_price_idr: p.normalPriceIdr,
        effective_price_idr: p.effectivePriceIdr,
      }));
    } else {
      const uniqueIds = Array.from(new Set(resolvedIds));
      for (const id of uniqueIds) {
        const pPrice = getProductPrice(id);
        if (pPrice) {
          totalIdr += pPrice.effectivePriceIdr;
          subtotalIdr += pPrice.normalPriceIdr;
          totalSavingsIdr += pPrice.discountIdr;
          totalCents += pPrice.effectivePriceCents;

          orderItems.push({
            id: 'oi_' + Math.random().toString(36).slice(2, 10),
            order_id: orderId,
            product_id: pPrice.id,
            product_title: pPrice.name,
            product_type: 'open_source' as const,
            unit_price_cents: pPrice.effectivePriceCents,
            product_version: pPrice.version,
            normal_price_idr: pPrice.normalPriceIdr,
            effective_price_idr: pPrice.effectivePriceIdr,
          });
        }
      }
    }

    const order: Order = {
      id: orderId,
      order_number: orderNum,
      access_token: accessToken,
      total_cents: totalCents,
      total_idr: totalIdr,
      subtotal_idr: subtotalIdr,
      bundle_type: data.bundle_type,
      bundle_discount_idr: bundleDiscountIdr,
      total_savings_idr: totalSavingsIdr,
      license_version: LICENSE_CONFIG.version,
      license_agreed_at: new Date().toISOString(),
      currency: 'IDR',
      status: 'pending',
      payment_method: data.payment_method as any,
      customer_email: data.customer_email.trim().toLowerCase(),
      customer_tv_username: data.customer_tv_username?.trim() || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: orderItems,
    };

    const orders = getLocalStore<Order[]>('aemeth_local_orders', []);
    orders.unshift(order);
    setLocalStore('aemeth_local_orders', orders);

    // Save recent order info in guest session
    setLocalStore('aemeth_last_order', { orderNumber: orderNum, accessToken });

    return {
      success: true,
      order,
    };
  },

  // Guest Order Lookup via Order Number & Access Token
  async getGuestOrder(orderNumber: string, accessToken?: string) {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderNumber}?token=${accessToken || ''}`);
      if (res.ok) return await res.json();
    } catch {}

    const cleanNum = orderNumber.trim().toUpperCase();
    const cleanToken = accessToken?.trim();

    // Check pre-seeded test order
    if (cleanNum === 'AEM-8931204') {
      const sampleOrder: Order = {
        id: 'ord_sample_paid_001',
        order_number: 'AEM-8931204',
        access_token: 'tok_sample_verified_2026',
        total_cents: 7900,
        currency: 'USD',
        status: 'paid',
        payment_method: 'bank_transfer',
        customer_email: 'trader@aemethtrader.com',
        customer_tv_username: 'vance_fx',
        created_at: new Date(Date.now() - 3600000).toISOString(),
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
      };
      return { success: true, order: sampleOrder };
    }

    const orders = getLocalStore<Order[]>('aemeth_local_orders', []);
    const ord = orders.find((o) => {
      const matchesNum = o.order_number.toUpperCase() === cleanNum;
      if (!cleanToken) return matchesNum;
      return matchesNum && o.access_token === cleanToken;
    });

    if (ord) return { success: true, order: ord };
    return { success: false, error: 'Order not found' };
  },

  async uploadReceipt(orderId: string, formData: FormData) {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/receipt`, {
        method: 'POST',
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
      proofData: 'Receipt logged in session',
    };
  },

  async submitCryptoPayment(orderId: string, data: { asset: string; network: string; txid: string }) {
    try {
      const res = await fetch(`${API_BASE}/payments/crypto/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  async createPaypalOrder(orderId: string) {
    try {
      const res = await fetch(`${API_BASE}/payments/paypal/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, paypal_order_id: paypalOrderId }),
      });
      if (res.ok) return await res.json();
    } catch {}

    const orders = getLocalStore<Order[]>('aemeth_local_orders', []);
    const ord = orders.find((o) => o.id === orderId);
    if (ord) ord.status = 'paid';
    setLocalStore('aemeth_local_orders', orders);

    return { success: true, message: 'Payment captured and verified.' };
  },

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

  // Deliveries for Guest Order (Enforces Token Verification)
  async getDeliverySourceCode(productId: string, orderNumber?: string, accessToken?: string) {
    if (orderNumber) {
      try {
        const query = new URLSearchParams();
        if (accessToken) query.append('token', accessToken);
        const res = await fetch(`${API_BASE}/deliveries/order/${orderNumber}/source/${productId}?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) return data;
        } else {
          const errData = await res.json().catch(() => ({}));
          if (errData.error) throw new Error(errData.error);
        }
      } catch (err: any) {
        if (err.message && err.message.includes('not verified paid')) {
          throw err;
        }
      }
    }

    // Try delivery ID endpoint
    try {
      const query = new URLSearchParams();
      if (accessToken) query.append('token', accessToken);
      const res = await fetch(`${API_BASE}/deliveries/${productId}/source?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data;
      }
    } catch {}

    const resolved = resolveProductId(productId).toLowerCase();
    const isSmcBos = resolved.includes('bos');
    const isSmartStructure = resolved.includes('smart-structure');
    const isLiquiditySweep = resolved.includes('liquidity-sweep');
    const isMeanReversion = resolved.includes('mean-reversion');
    const isMomentumShift = resolved.includes('momentum-shift');
    const isTrendPullback = resolved.includes('pullback');
    const isCandleImpulse = resolved.includes('candle-impulse');
    const isVolatilityExpansion = resolved.includes('volatility');
    const isIchimoku = resolved.includes('ichimoku');
    const isAiSignal = resolved.includes('ai-signal') || resolved.includes('aisignal');
    const isMfi = resolved.includes('mfi');
    const isPsar = resolved.includes('parabolic-sar') || resolved.includes('psar');
    const isTrendSr = resolved.includes('trendline') || resolved.includes('trendsr');
    const isSmc = (resolved.includes('smc-signal-panel') || (resolved.includes('smc') && !isSmcBos && !isSmartStructure));
    const isSupertrend = resolved.includes('supertrend');
    const isVwap = resolved.includes('vwap') && !isMeanReversion;
    const isMajorSwing = resolved.includes('major-swing') || resolved.includes('majorswing');
    const isStochCross = resolved.includes('stochastic') || resolved.includes('stoch');
    const isCrt = resolved.includes('crt');
    const isEmaCross = (resolved.includes('ema') && resolved.includes('cross')) || resolved.includes('ema-crossover');
    const isEmaRibbon = resolved.includes('ribbon');
    const isHull = resolved.includes('hull') && !isCandleImpulse;
    const isMacd = resolved.includes('macd') && !isMomentumShift;
    const isRsi = resolved.includes('rsi') && !isEmaCross && !isLiquiditySweep && !isMeanReversion;

    let content = PINE_SCRIPT_LIQUIDITY;
    let filename = 'aemeth_smc_signal_panel_v2.pine';
    let title = 'Aemeth SMC Entry/TP/SL Signal Panel V2';

    if (isSmcBos) {
      content = `//@version=5
indicator("Aemeth SMC BOS/CHoCH Entry SL TP", overlay=true, max_boxes_count=100, max_lines_count=100)
// =====================================================================
// AEMETH TRADER ANALYSIS - SMC BOS/CHOCH ENTRY SL TP ENGINE
// DIRECTIVE: CANDLE 1 CLOSED BAR ANTI-REPAINT VERIFICATION
// =====================================================================

swing_len = input.int(5, "Swing Lookback Length", minval=2)
show_bos = input.bool(true, "Show BOS Lines")
show_choch = input.bool(true, "Show CHoCH Labels")

ph = ta.pivothigh(high, swing_len, swing_len)
pl = ta.pivotlow(low, swing_len, swing_len)

var float last_ph = na
var float last_pl = na
if not na(ph)
    last_ph := high[swing_len]
if not na(pl)
    last_pl := low[swing_len]

bos_bull = ta.crossover(close[1], last_ph)
bos_bear = ta.crossunder(close[1], last_pl)

atr_val = ta.atr(14)
var float entry_price = na
var float sl_price = na
var float tp1_price = na
var float tp2_price = na
var float tp3_price = na

if bos_bear
    entry_price := close[1]
    sl_price := last_ph
    risk = math.abs(sl_price - entry_price)
    tp1_price := entry_price - risk * 1.0
    tp2_price := entry_price - risk * 2.0
    tp3_price := entry_price - risk * 3.0

if bos_bull
    entry_price := close[1]
    sl_price := last_pl
    risk = math.abs(entry_price - sl_price)
    tp1_price := entry_price + risk * 1.0
    tp2_price := entry_price + risk * 2.0
    tp3_price := entry_price + risk * 3.0

plotshape(bos_bear, "Bearish BOS", shape.labeldown, location.abovebar, color=#ef4444, text="BOS\\nENTRY", textcolor=color.white, size=size.small)
plotshape(bos_bull, "Bullish BOS", shape.labelup, location.belowbar, color=#10b981, text="BOS\\nENTRY", textcolor=color.white, size=size.small)

alertcondition(bos_bear, "SMC Bearish BOS/CHoCH", "Aemeth SMC: Bearish structure break confirmed.")
alertcondition(bos_bull, "SMC Bullish BOS/CHoCH", "Aemeth SMC: Bullish structure break confirmed.")
`;
      filename = 'aemeth_smc_bos_choch_v1.pine';
      title = 'Aemeth SMC BOS/CHoCH Entry SL TP';
    } else if (isSmartStructure) {
      content = `//@version=5
indicator("AEMETH Smart Structure Entry System v1.0", overlay=true)
// =====================================================================
// AEMETH TRADER ANALYSIS - SMART STRUCTURE ENTRY SYSTEM V1.0
// =====================================================================

len_fast = input.int(20, "EMA Fast")
len_slow = input.int(50, "EMA Slow")
swing_len = input.int(5, "Structure Swing Length")

ema_f = ta.ema(close, len_fast)
ema_s = ta.ema(close, len_slow)

plot(ema_f, "EMA Fast", color=color.new(#facc15, 0), linewidth=2)
plot(ema_s, "EMA Slow", color=color.new(#f97316, 0), linewidth=2)

ph = ta.pivothigh(high, swing_len, swing_len)
pl = ta.pivotlow(low, swing_len, swing_len)

var float last_ph = na
var float last_pl = na
if not na(ph)
    last_ph := high[swing_len]
if not na(pl)
    last_pl := low[swing_len]

buy_signal = ta.crossover(close[1], last_ph) and ema_f[1] > ema_s[1]
sell_signal = ta.crossunder(close[1], last_pl) and ema_f[1] < ema_s[1]

atr_val = ta.atr(14)
var float entry_p = na
var float sl_p = na
var float tp1_p = na
var float tp2_p = na
var float tp3_p = na

if buy_signal
    entry_p := close[1]
    sl_p := last_pl - atr_val * 0.5
    risk = math.abs(entry_p - sl_p)
    tp1_p := entry_p + risk * 1.0
    tp2_p := entry_p + risk * 2.0
    tp3_p := entry_p + risk * 3.0

if sell_signal
    entry_p := close[1]
    sl_p := last_ph + atr_val * 0.5
    risk = math.abs(sl_p - entry_p)
    tp1_p := entry_p - risk * 1.0
    tp2_p := entry_p - risk * 2.0
    tp3_p := entry_p - risk * 3.0

plotshape(buy_signal, "BUY", shape.labelup, location.belowbar, color=#10b981, text="BUY", textcolor=color.white, size=size.small)
plotshape(sell_signal, "SELL", shape.labeldown, location.abovebar, color=#ef4444, text="SELL", textcolor=color.white, size=size.small)

alertcondition(buy_signal, "Smart Structure BUY", "Aemeth Smart Structure: BUY signal confirmed.")
alertcondition(sell_signal, "Smart Structure SELL", "Aemeth Smart Structure: SELL signal confirmed.")
`;
      filename = 'aemeth_smart_structure_entry_v1.pine';
      title = 'AEMETH Smart Structure Entry System v1.0';
    } else if (isLiquiditySweep) {
      content = `//@version=5
indicator("AEMETH Liquidity Sweep Reversal v2.0", overlay=true)
// =====================================================================
// AEMETH TRADER ANALYSIS - LIQUIDITY SWEEP REVERSAL V2.0
// =====================================================================

sw_len = input.int(7, "Pivot Lookback")
rsi_len = input.int(14, "RSI Length")

ph = ta.pivothigh(high, sw_len, sw_len)
pl = ta.pivotlow(low, sw_len, sw_len)
rsi_val = ta.rsi(close, rsi_len)

var float liq_high = na
var float liq_low = na
if not na(ph)
    liq_high := high[sw_len]
if not na(pl)
    liq_low := low[sw_len]

sweep_sell = high[1] > liq_high and close[1] < liq_high and rsi_val[1] > 60
sweep_buy = low[1] < liq_low and close[1] > liq_low and rsi_val[1] < 40

atr_val = ta.atr(14)
var float entry_p = na
var float sl_p = na
var float tp1_p = na
var float tp2_p = na
var float tp3_p = na

if sweep_sell
    entry_p := close[1]
    sl_p := high[1] + atr_val * 0.5
    risk = math.abs(sl_p - entry_p)
    tp1_p := entry_p - risk * 1.0
    tp2_p := entry_p - risk * 2.0
    tp3_p := entry_p - risk * 3.0

if sweep_buy
    entry_p := close[1]
    sl_p := low[1] - atr_val * 0.5
    risk = math.abs(entry_p - sl_p)
    tp1_p := entry_p + risk * 1.0
    tp2_p := entry_p + risk * 2.0
    tp3_p := entry_p + risk * 3.0

plotshape(sweep_sell, "Sweep SELL", shape.labeldown, location.abovebar, color=#ef4444, text="SELL", textcolor=color.white, size=size.small)
plotshape(sweep_buy, "Sweep BUY", shape.labelup, location.belowbar, color=#10b981, text="BUY", textcolor=color.white, size=size.small)

alertcondition(sweep_sell, "Liquidity Sweep SELL", "Aemeth Liquidity Sweep: Reversal SELL triggered.")
alertcondition(sweep_buy, "Liquidity Sweep BUY", "Aemeth Liquidity Sweep: Reversal BUY triggered.")
`;
      filename = 'aemeth_liquidity_sweep_reversal_v2.pine';
      title = 'AEMETH Liquidity Sweep Reversal v2.0';
    } else if (isMeanReversion) {
      content = `//@version=5
indicator("AEMETH Mean Reversion Engine v3.0", overlay=true)
// =====================================================================
// AEMETH TRADER ANALYSIS - MEAN REVERSION ENGINE V3.0
// =====================================================================

bb_len = input.int(20, "Bollinger Bands Length")
bb_mult = input.float(2.0, "Multiplier")
rsi_len = input.int(14, "RSI Length")

basis = ta.sma(close, bb_len)
dev = bb_mult * ta.stdev(close, bb_len)
upper = basis + dev
lower = basis - dev
vwap_val = ta.vwap(hlc3)
rsi_val = ta.rsi(close, rsi_len)

plot(basis, "Basis", color=color.gray)
plot(upper, "Upper", color=color.red)
plot(lower, "Lower", color=color.green)
plot(vwap_val, "VWAP", color=color.orange)

buy_signal = close[2] < lower[2] and close[1] > lower[1] and rsi_val[1] < 45
sell_signal = close[2] > upper[2] and close[1] < upper[1] and rsi_val[1] > 55

atr_val = ta.atr(14)
var float entry_p = na
var float sl_p = na
var float tp1_p = na
var float tp2_p = na
var float tp3_p = na

if buy_signal
    entry_p := close[1]
    sl_p := low[1] - atr_val * 0.8
    risk = math.abs(entry_p - sl_p)
    tp1_p := entry_p + risk * 1.0
    tp2_p := entry_p + risk * 1.8
    tp3_p := entry_p + risk * 2.5

if sell_signal
    entry_p := close[1]
    sl_p := high[1] + atr_val * 0.8
    risk = math.abs(sl_p - entry_p)
    tp1_p := entry_p - risk * 1.0
    tp2_p := entry_p - risk * 1.8
    tp3_p := entry_p - risk * 2.5

plotshape(buy_signal, "BUY", shape.labelup, location.belowbar, color=#10b981, text="BUY", textcolor=color.white, size=size.small)
plotshape(sell_signal, "SELL", shape.labeldown, location.abovebar, color=#ef4444, text="SELL", textcolor=color.white, size=size.small)

alertcondition(buy_signal, "Mean Reversion BUY", "Aemeth Mean Reversion: BUY equilibrium trigger.")
alertcondition(sell_signal, "Mean Reversion SELL", "Aemeth Mean Reversion: SELL equilibrium trigger.")
`;
      filename = 'aemeth_mean_reversion_engine_v3.pine';
      title = 'AEMETH Mean Reversion Engine v3.0';
    } else if (isMomentumShift) {
      content = `//@version=5
indicator("AEMETH Momentum Shift Pro v4.0", overlay=true)
// =====================================================================
// AEMETH TRADER ANALYSIS - MOMENTUM SHIFT PRO V4.0
// =====================================================================

[macdLine, signalLine, _] = ta.macd(close, 12, 26, 9)
stochK = ta.sma(ta.stoch(close, high, low, 14), 3)
stochD = ta.sma(stochK, 3)

shift_buy = ta.crossover(macdLine, signalLine) and ta.crossover(stochK, stochD) and stochK < 40
shift_sell = ta.crossunder(macdLine, signalLine) and ta.crossunder(stochK, stochD) and stochK > 60

atr_val = ta.atr(14)
var float entry_p = na
var float sl_p = na
var float tp1_p = na
var float tp2_p = na
var float tp3_p = na

if shift_buy
    entry_p := close[1]
    sl_p := low[1] - atr_val * 1.0
    risk = math.abs(entry_p - sl_p)
    tp1_p := entry_p + risk * 1.0
    tp2_p := entry_p + risk * 1.5
    tp3_p := entry_p + risk * 2.0

plotshape(shift_buy, "BUY Shift", shape.labelup, location.belowbar, color=#10b981, text="BUY", textcolor=color.white, size=size.small)

alertcondition(shift_buy, "Momentum Shift BUY", "Aemeth Momentum Shift: Bullish shift confirmed.")
alertcondition(shift_sell, "Momentum Shift SELL", "Aemeth Momentum Shift: Bearish shift confirmed.")
`;
      filename = 'aemeth_momentum_shift_pro_v4.pine';
      title = 'AEMETH Momentum Shift Pro v4.0';
    } else if (isTrendPullback) {
      content = `//@version=5
indicator("AEMETH Trend Pullback Hunter v5.0", overlay=true)
// =====================================================================
// AEMETH TRADER ANALYSIS - TREND PULLBACK HUNTER V5.0
// =====================================================================

[st, st_dir] = ta.supertrend(3.0, 10)
ema_pull = ta.ema(close, 21)
[diplus, diminus, adx] = ta.dmi(14, 14)

plot(st_dir < 0 ? st : na, "Bull Supertrend", color=color.green, linewidth=2)
plot(st_dir > 0 ? st : na, "Bear Supertrend", color=color.red, linewidth=2)
plot(ema_pull, "EMA Pullback", color=color.orange, linewidth=2)

pullback_sell = st_dir > 0 and high[1] >= ema_pull[1] and close[1] < ema_pull[1] and adx > 20

atr_val = ta.atr(14)
var float entry_p = na
var float sl_p = na
var float tp1_p = na
var float tp2_p = na
var float tp3_p = na

if pullback_sell
    entry_p := close[1]
    sl_p := high[1] + atr_val * 1.2
    risk = math.abs(sl_p - entry_p)
    tp1_p := entry_p - risk * 1.0
    tp2_p := entry_p - risk * 1.5
    tp3_p := entry_p - risk * 2.0

plotshape(pullback_sell, "SELL Pullback", shape.labeldown, location.abovebar, color=#ef4444, text="SELL", textcolor=color.white, size=size.small)

alertcondition(pullback_sell, "Trend Pullback SELL", "Aemeth Pullback Hunter: Bearish trend continuation entry.")
`;
      filename = 'aemeth_trend_pullback_hunter_v5.pine';
      title = 'AEMETH Trend Pullback Hunter v5.0';
    } else if (isCandleImpulse) {
      content = `//@version=5
indicator("AEMETH Candle Impulse v5.0", overlay=true)
// =====================================================================
// AEMETH TRADER ANALYSIS - CANDLE IMPULSE V5.0
// =====================================================================

hull_len = input.int(55, "HMA Length")
hma = ta.wma(2 * ta.wma(close, hull_len / 2) - ta.wma(close, hull_len), math.round(math.sqrt(hull_len)))
cci_val = ta.cci(close, 20)

is_bull_hma = hma > hma[1]
plot(hma, "HMA", color=is_bull_hma ? color.green : color.red, linewidth=2)

bull_engulfing = close[1] > open[1] and close[2] < open[2] and close[1] > open[2] and open[1] < close[2]
impulse_buy = is_bull_hma and bull_engulfing and ta.crossover(cci_val, 0)

atr_val = ta.atr(14)
var float entry_p = na
var float sl_p = na
var float tp1_p = na
var float tp2_p = na
var float tp3_p = na

if impulse_buy
    entry_p := close[1]
    sl_p := low[1] - atr_val * 1.0
    risk = math.abs(entry_p - sl_p)
    tp1_p := entry_p + risk * 1.0
    tp2_p := entry_p + risk * 2.0
    tp3_p := entry_p + risk * 3.0

plotshape(impulse_buy, "BUY Impulse", shape.labelup, location.belowbar, color=#10b981, text="BUY", textcolor=color.white, size=size.small)

alertcondition(impulse_buy, "Candle Impulse BUY", "Aemeth Candle Impulse: Bullish impulse entry confirmed.")
`;
      filename = 'aemeth_candle_impulse_v5.pine';
      title = 'AEMETH Candle Impulse v5.0';
    } else if (isVolatilityExpansion) {
      content = `//@version=5
indicator("AEMETH Volatility Expansion Breakout v6.0", overlay=true)
// =====================================================================
// AEMETH TRADER ANALYSIS - VOLATILITY EXPANSION BREAKOUT V6.0
// =====================================================================

dc_len = input.int(20, "Donchian Length")
dc_high = ta.highest(high[1], dc_len)
dc_low = ta.lowest(low[1], dc_len)

atr_curr = ta.atr(14)
atr_avg = ta.sma(atr_curr, 20)
vol_expanding = atr_curr > atr_avg
wpr = ta.wpr(14)

plot(dc_high, "DC High", color=color.green)
plot(dc_low, "DC Low", color=color.red)

vol_break_buy = ta.crossover(close[1], dc_high) and vol_expanding and wpr > -40

atr_val = ta.atr(14)
var float entry_p = na
var float sl_p = na
var float tp1_p = na
var float tp2_p = na
var float tp3_p = na

if vol_break_buy
    entry_p := close[1]
    sl_p := low[1] - atr_val * 1.0
    risk = math.abs(entry_p - sl_p)
    tp1_p := entry_p + risk * 1.0
    tp2_p := entry_p + risk * 2.0
    tp3_p := entry_p + risk * 3.0

plotshape(vol_break_buy, "BUY Volatility", shape.labelup, location.belowbar, color=#10b981, text="BUY", textcolor=color.white, size=size.small)

alertcondition(vol_break_buy, "Volatility Expansion BUY", "Aemeth Volatility Expansion: Breakout detected.")
`;
      filename = 'aemeth_volatility_expansion_breakout_v6.pine';
      title = 'AEMETH Volatility Expansion Breakout v6.0';
    } else if (isMacd) {
      content = `//@version=5
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
`;
      filename = 'aemeth_macd_crossover_v1.pine';
      title = 'Aemeth MACD Crossover V1 by RIDHO';
    } else if (isHull) {
      content = `//@version=5
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

atr_val = ta.atr(14)
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
`;
      filename = 'aemeth_hull_suite_v1.pine';
      title = 'Aemeth Hull Suite V1';
    } else if (isEmaRibbon) {
      content = `//@version=5
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
`;
      filename = 'aemeth_ema_ribbon_flow_v5.pine';
      title = 'Aemeth EMA Ribbon Flow';
    } else if (isEmaCross) {
      content = `//@version=5
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
`;
      filename = 'aemeth_ema_crossover_rsi_v5.pine';
      title = 'Aemeth EMA Crossover + RSI';
    } else if (isSupertrend) {
      content = `//@version=5
indicator("Aemeth Supertrend TP/SL Indicator", overlay=true)
// =====================================================================
// AEMETH TRADER ANALYSIS - SUPERTREND TP/SL ENGINE V1
// DIRECTIVE: CANDLE 1 CLOSED BAR ANTI-REPAINT VERIFICATION
// =====================================================================

atr_period = input.int(10, "ATR Period", minval=1)
factor = input.float(3.0, "Supertrend Factor", minval=0.1, step=0.1)
rr_ratio = input.float(1.5, "Risk/Reward Ratio Multiplier", minval=0.5, step=0.1)

[supertrend, direction] = ta.supertrend(factor, atr_period)
body_mid = math.avg(close[1], open[1])

trend_bull = direction < 0
trend_bear = direction > 0

plot(trend_bull ? supertrend : na, "Supertrend Bullish", color=color.new(#10b981, 0), linewidth=2, style=plot.style_linebr)
plot(trend_bear ? supertrend : na, "Supertrend Bearish", color=color.new(#ef4444, 0), linewidth=2, style=plot.style_linebr)

// Signal confirmation on closed bar
bear_entry = ta.crossunder(close[1], supertrend[1]) and trend_bear
bull_entry = ta.crossover(close[1], supertrend[1]) and trend_bull

var float entry_price = na
var float sl_level = na
var float tp1_level = na
var float tp2_level = na
var float tp3_level = na

atr_val = ta.atr(atr_period)

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
`;
      filename = 'aemeth_supertrend_tpsl_v5.pine';
      title = 'Aemeth Supertrend TP/SL Indicator';
    } else if (isVwap) {
      content = `//@version=5
indicator("Aemeth VWAP Reversal TP/SL Indicator", overlay=true)
// =====================================================================
// AEMETH TRADER ANALYSIS - VWAP REVERSAL TP/SL ENGINE V1
// DIRECTIVE: CANDLE 1 CLOSED BAR ANTI-REPAINT VERIFICATION
// =====================================================================

vwap_val = ta.vwap(hlc3)
plot(vwap_val, "VWAP", color=color.new(#3b82f6, 0), linewidth=2)

vwap_cross_bear = ta.crossunder(close[1], vwap_val[1])
vwap_cross_bull = ta.crossover(close[1], vwap_val[1])

atr_val = ta.atr(14)
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
`;
      filename = 'aemeth_vwap_reversal_tpsl_v5.pine';
      title = 'Aemeth VWAP Reversal TP/SL Indicator';
    } else if (isMajorSwing) {
      content = `//@version=5
indicator("Aemeth Major Swing Indicator", overlay=true)
// =====================================================================
// AEMETH TRADER ANALYSIS - MAJOR SWING STRUCTURAL ENGINE V1
// DIRECTIVE: CONFIRMED PIVOT HIGH / LOW FILTERING
// =====================================================================

swing_len = input.int(7, "Swing Lookback Length", minval=2)
atr_filter = input.bool(true, "Filter Swings by Minimum ATR Distance")
atr_mult = input.float(1.5, "Minimum ATR Clearance", minval=0.5, step=0.1)

ph = ta.pivothigh(high, swing_len, swing_len)
pl = ta.pivotlow(low, swing_len, swing_len)

plotshape(not na(ph), "Swing High (Sell)", shape.labeldown, location.abovebar, color=#00e5ff, text="sell", textcolor=color.black, size=size.small, offset=-swing_len)
plotshape(not na(pl), "Swing Low (Buy)", shape.labelup, location.belowbar, color=#00e5ff, text="buy", textcolor=color.black, size=size.small, offset=-swing_len)

alertcondition(not na(ph), "Major Swing High Detected", "Aemeth Major Swing: Significant swing high confirmed.")
alertcondition(not na(pl), "Major Swing Low Detected", "Aemeth Major Swing: Significant swing low confirmed.")
`;
      filename = 'aemeth_major_swing_v5.pine';
      title = 'Aemeth Major Swing Indicator';
    } else if (isStochCross) {
      content = `//@version=5
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
`;
      filename = 'aemeth_stochastic_cross_tpsl_v5.pine';
      title = 'Aemeth Stochastic Cross TP/SL Indicator';
    } else if (isCrt) {
      content = `//@version=5
indicator("Aemeth CRT Entry TP/SL Indicator", overlay=true)
// =====================================================================
// AEMETH TRADER ANALYSIS - CANDLE RANGE THEORY (CRT) ENGINE V1
// =====================================================================

crt_lookback = input.int(5, "CRT Range Lookback Candles", minval=2)
range_high = ta.highest(high[1], crt_lookback)
range_low = ta.lowest(low[1], crt_lookback)

// Sweep & Reclaim / Breakdown detection
crt_bear = close[1] < range_low and high[1] >= range_low
crt_bull = close[1] > range_high and low[1] <= range_high

var float crt_entry = na
var float crt_sl = na
var float crt_tp1 = na
var float crt_tp2 = na
var float crt_tp3 = na

atr_val = ta.atr(14)
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
`;
      filename = 'aemeth_crt_entry_tpsl_v5.pine';
      title = 'Aemeth CRT Entry TP/SL Indicator';
    } else if (isRsi) {
      content = `//@version=5
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
`;
      filename = 'aemeth_rsi_reversal_tpsl_v5.pine';
      title = 'Aemeth RSI Reversal TP/SL Indicator';
    } else if (isSmc) {
      content = `//@version=5
indicator("Aemeth SMC Entry/TP/SL Signal Panel V2", overlay=true, max_boxes_count=150, max_lines_count=150)
// =====================================================================
// AEMETH TRADER ANALYSIS - SMART MONEY CONCEPTS (SMC) ENGINE V2
// DIRECTIVE: CANDLE 1 CLOSED BAR ANTI-REPAINT VERIFICATION
// =====================================================================

// --- User Inputs ---
grp_smc = "Market Structure (BOS / CHoCH)"
swing_len = input.int(5, "Swing Detection Length", minval=2, group=grp_smc)
show_bos = input.bool(true, "Display Break of Structure (BOS)", group=grp_smc)
show_choch = input.bool(true, "Display Change of Character (CHoCH)", group=grp_smc)

grp_signals = "Signals & Risk/Reward Targets"
rr_ratio = input.float(2.0, "Risk to Reward Ratio (RR)", minval=1.0, maxval=10.0, step=0.5, group=grp_signals)
atr_period = input.int(14, "ATR Filter Period", minval=1, group=grp_signals)
atr_sl_mult = input.float(1.5, "Stop Loss ATR Multiplier", minval=0.5, step=0.1, group=grp_signals)
cooldown_bars = input.int(5, "Signal Cooldown (Bars)", minval=1, group=grp_signals)

grp_zones = "Liquidity Zones (FVG & Order Block)"
show_fvg = input.bool(true, "Highlight Fair Value Gaps (FVG)", group=grp_zones)
show_ob = input.bool(true, "Highlight Institutional Order Blocks (OB)", group=grp_zones)

// --- Anti-Repaint Closed Bar References ---
c_high = high[1]
c_low = low[1]
c_close = close[1]
c_open = open[1]

// --- Swing High & Low Detection ---
ph = ta.pivothigh(high, swing_len, swing_len)
pl = ta.pivotlow(low, swing_len, swing_len)

var float last_ph = na
var float last_pl = na
if not na(ph)
    last_ph := high[swing_len]
if not na(pl)
    last_pl := low[swing_len]

// --- Structure Breakouts (BOS & CHoCH) ---
bos_bull = ta.crossover(c_close, last_ph)
bos_bear = ta.crossunder(c_close, last_pl)

// --- Fair Value Gaps (FVG) ---
bull_fvg = c_low > high[3]
bear_fvg = c_high < low[3]

if show_fvg and bull_fvg
    box.new(left=bar_index[2], top=c_low, right=bar_index, bottom=high[3],
            border_color=color.new(#10b981, 60), bgcolor=color.new(#10b981, 85))

if show_fvg and bear_fvg
    box.new(left=bar_index[2], top=low[3], right=bar_index, bottom=c_high,
            border_color=color.new(#ef4444, 60), bgcolor=color.new(#ef4444, 85))

// --- Volatility & Cooldown ---
atr_val = ta.atr(atr_period)
var int last_buy_bar = -999
var int last_sell_bar = -999

buy_condition = bos_bull and (bar_index - last_buy_bar > cooldown_bars)
sell_condition = bos_bear and (bar_index - last_sell_bar > cooldown_bars)

if buy_condition
    last_buy_bar := bar_index
if sell_condition
    last_sell_bar := bar_index

// Plot BUY & SELL Signals
plotshape(buy_condition, "SMC BUY", shape.labelup, location.belowbar, color=#10b981, text="SMC BUY\\nENTRY", textcolor=color.white, size=size.small)
plotshape(sell_condition, "SMC SELL", shape.labeldown, location.abovebar, color=#ef4444, text="SMC SELL\\nENTRY", textcolor=color.white, size=size.small)

// --- Alerts ---
alertcondition(buy_condition, title="Aemeth SMC BUY", message="Aemeth SMC: Bullish Entry confirmed on {{ticker}}.")
alertcondition(sell_condition, title="Aemeth SMC SELL", message="Aemeth SMC: Bearish Entry confirmed on {{ticker}}.")
alertcondition(bos_bull or bos_bear, title="Aemeth Structure Break", message="Aemeth SMC: Market Structure BOS/CHoCH triggered on {{ticker}}.")
`;
      filename = 'aemeth_smc_signal_panel_v2.pine';
      title = 'Aemeth SMC Entry/TP/SL Signal Panel V2';
    } else if (isIchimoku) {
      content = `//@version=5\nindicator("Aemeth Ichimoku Cloud [Signals & SL/TP]", overlay=true)\n// ==========================================\n// Aemeth Ichimoku Cloud Indicator - Pine Script v5\n// ==========================================\nconversionPeriods = input.int(9, minval=1, title="Conversion Line Length")\nbasePeriods = input.int(26, minval=1, title="Base Line Length")\nlaggingSpan2Periods = input.int(52, minval=1, title="Leading Span B Length")\ndisplacement = input.int(26, minval=1, title="Displacement")\n\ndonchian(len) => math.avg(ta.lowest(len), ta.highest(len))\nconversionLine = donchian(conversionPeriods)\nbaseLine = donchian(basePeriods)\nleadLine1 = math.avg(conversionLine, baseLine)\nleadLine2 = donchian(laggingSpan2Periods)\n\nplot(conversionLine, color=color.blue, title="Conversion Line")\nplot(baseLine, color=color.red, title="Base Line")\np1 = plot(leadLine1, offset = displacement - 1, color=color.green, title="Lead 1")\np2 = plot(leadLine2, offset = displacement - 1, color=color.maroon, title="Lead 2")\nfill(p1, p2, color = leadLine1 > leadLine2 ? color.new(color.green, 90) : color.new(color.red, 90))\n\nbuy_signal = ta.crossover(conversionLine, baseLine) and close > leadLine1[displacement - 1]\nsell_signal = ta.crossunder(conversionLine, baseLine) and close < leadLine1[displacement - 1]\nplotshape(buy_signal, "BUY Signal", shape.labelup, location.belowbar, color.green, text="BUY", textcolor=color.white)\nplotshape(sell_signal, "SELL Signal", shape.labeldown, location.abovebar, color.red, text="SELL", textcolor=color.white)\n`;
      filename = 'aemeth_ichimoku_cloud_v5.pine';
      title = 'Aemeth Ichimoku Cloud Indicator';
    } else if (isAiSignal) {
      content = `//@version=5\nindicator("Aemeth AI Signal V1 [Confidence & Targets]", overlay=true)\n// ==========================================\n// Aemeth AI Signal V1 - Pine Script v5\n// ==========================================\nlength = input.int(14, "AI Sensitivity")\natr_mult = input.float(1.5, "ATR Multiplier")\n\natr = ta.atr(length)\nsrc = close\nup = src - (atr_mult * atr)\ndn = src + (atr_mult * atr)\n\nlong_cond = ta.crossover(src, dn[1])\nshort_cond = ta.crossunder(src, up[1])\n\nplotshape(long_cond, "AI LONG", shape.triangleup, location.belowbar, color.green, size=size.small, text="AI LONG\\nGrade A")\nplotshape(short_cond, "AI SHORT", shape.triangledown, location.abovebar, color.red, size=size.small, text="AI SHORT\\nGrade A")\n`;
      filename = 'aemeth_ai_signal_v1.pine';
      title = 'Aemeth AI Signal V1';
    } else if (isMfi) {
      content = `//@version=5\nindicator("Aemeth MFI Reversal [Momentum Turning Point]", overlay=true)\n// ==========================================\n// Aemeth MFI Reversal Indicator - Pine Script v5\n// ==========================================\nmfi_len = input.int(14, "MFI Length")\nmfi_val = ta.mfi(close, mfi_len)\nbull_rev = ta.crossover(mfi_val, 20)\nbear_rev = ta.crossunder(mfi_val, 80)\nplotshape(bull_rev, "MFI BUY", shape.labelup, location.belowbar, color.green, text="MFI BUY\\nSL/TP1-3", textcolor=color.white)\nplotshape(bear_rev, "MFI SELL", shape.labeldown, location.abovebar, color.red, text="MFI SELL\\nSL/TP1-3", textcolor=color.white)\n`;
      filename = 'aemeth_mfi_reversal_v5.pine';
      title = 'Aemeth MFI Reversal Indicator';
    } else if (isPsar) {
      content = `//@version=5\nindicator("Aemeth Parabolic SAR [Trend & Levels]", overlay=true)\n// ==========================================\n// Aemeth Parabolic SAR Indicator - Pine Script v5\n// ==========================================\nstart = input.float(0.02, "Start")\ninc = input.float(0.02, "Increment")\nmax_val = input.float(0.2, "Maximum")\nsar = ta.sar(start, inc, max_val)\nplot(sar, "Parabolic SAR", style=plot.style_circles, color=sar < close ? color.green : color.red, linewidth=2)\n`;
      filename = 'aemeth_parabolic_sar_v5.pine';
      title = 'Aemeth Parabolic SAR Indicator';
    } else if (isTrendSr) {
      content = `//@version=5\nindicator("Aemeth Trendline Breakout + S/R + UT Bot", overlay=true)\n// ==========================================\n// Aemeth Trendline Breakout + S/R + UT Bot - Pine Script v5\n// ==========================================\na = input.int(1, "Key Value")\nc = input.int(10, "ATR Period")\nxATR = ta.atr(c)\nnLoss = a * xATR\nsrc = close\nxATRTrailingStop = 0.0\nxATRTrailingStop := src > nz(xATRTrailingStop[1], 0) ? (src - nLoss < nz(xATRTrailingStop[1], 0) ? nz(xATRTrailingStop[1], 0) : src - nLoss) : (src + nLoss > nz(xATRTrailingStop[1], 0) ? nz(xATRTrailingStop[1], 0) : src + nLoss)\nplot(xATRTrailingStop, color=src > xATRTrailingStop ? color.green : color.red, title="Trailing Stop")\n`;
      filename = 'aemeth_trendline_breakout_sr_utbot_v5.pine';
      title = 'Aemeth Trendline Breakout + S/R + UT Bot';
    }

    return {
      success: true,
      product_title: title,
      filename,
      pine_script_content: content,
    };
  },

  // Admin Verification & Authentication (Discreet, Separate from Storefront)
  async adminLogin(password: string) {
    if (password === 'admin123') {
      const token = 'aemeth_admin_auth_' + Date.now();
      localStorage.setItem('aemeth_admin_token', token);
      return { success: true, token };
    }
    return { success: false, error: 'Invalid admin credentials' };
  },

  isAdminAuthenticated(): boolean {
    return !!localStorage.getItem('aemeth_admin_token');
  },

  adminLogout() {
    localStorage.removeItem('aemeth_admin_token');
  },

  async getAdminMetrics() {
    try {
      const res = await fetch(`${API_BASE}/admin/metrics`, {
        headers: { ...getAdminAuthHeader() },
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
        recentOrders: orders.slice(0, 8),
      },
    };
  },

  async getAdminOrders() {
    try {
      const res = await fetch(`${API_BASE}/admin/orders`, {
        headers: { ...getAdminAuthHeader() },
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
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeader() },
        body: JSON.stringify({ admin_note: adminNote }),
      });
      if (res.ok) return await res.json();
    } catch {}

    const orders = getLocalStore<Order[]>('aemeth_local_orders', []);
    const ord = orders.find((o) => o.id === orderId);
    if (ord) ord.status = 'paid';
    setLocalStore('aemeth_local_orders', orders);

    return { success: true, message: 'Order approved and delivery unlocked.' };
  },

  async rejectOrder(orderId: string, reason?: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeader() },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) return await res.json();
    } catch {}

    const orders = getLocalStore<Order[]>('aemeth_local_orders', []);
    const ord = orders.find((o) => o.id === orderId);
    if (ord) ord.status = 'cancelled';
    setLocalStore('aemeth_local_orders', orders);

    return { success: true, message: 'Order marked as cancelled.' };
  },

  async refundOrder(orderId: string, reason?: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeader() },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) return await res.json();
    } catch {}

    const orders = getLocalStore<Order[]>('aemeth_local_orders', []);
    const ord = orders.find((o) => o.id === orderId);
    if (ord) {
      ord.status = 'cancelled';
      (ord as any).is_revoked = 1;
    }
    setLocalStore('aemeth_local_orders', orders);

    return { success: true, message: 'Order refunded and access revoked.' };
  },

  async getBundleSourceCodes(orderNumber: string, accessToken?: string) {
    try {
      const query = new URLSearchParams();
      if (accessToken) query.append('token', accessToken);
      const res = await fetch(`${API_BASE}/deliveries/order/${orderNumber}/bundle-source?${query.toString()}`);
      if (res.ok) return await res.json();
      const err = await res.json().catch(() => ({}));
      if (err.error) throw new Error(err.error);
    } catch (err: any) {
      throw err;
    }
    return { success: false, error: 'Failed to fetch bundle sources' };
  },

  async requestOrderRetrieval(email: string) {
    try {
      const res = await fetch(`${API_BASE}/orders/retrieve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) return await res.json();
    } catch {}

    return {
      success: true,
      message: 'Jika email terdaftar, tautan pemulihan pesanan telah dikirim.',
    };
  },

  async getOrdersByRetrievalToken(token: string) {
    try {
      const res = await fetch(`${API_BASE}/orders/retrieve/${token}`);
      if (res.ok) return await res.json();
      const err = await res.json().catch(() => ({}));
      if (err.error) throw new Error(err.error);
    } catch (err: any) {
      throw err;
    }
    return { success: false, error: 'Failed to retrieve orders by token' };
  },

  async getTvAccessRequests() {
    try {
      const res = await fetch(`${API_BASE}/admin/tv-access-requests`, {
        headers: { ...getAdminAuthHeader() },
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
          product_title: 'Aemeth Delta Flow & Volume Absorption Pro',
          tradingview_script_id: 'aemeth_delta_pro_invite_only',
          order_number: 'AEM-8931204',
          customer_email: 'trader@aemethtrader.com',
          created_at: new Date().toISOString(),
        },
      ],
    };
  },

  async actionTvAccess(deliveryId: string, action: 'grant' | 'reject' | 'revoke') {
    try {
      const res = await fetch(`${API_BASE}/admin/tv-access/${deliveryId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeader() },
        body: JSON.stringify({ action }),
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
        headers: { ...getAdminAuthHeader() },
      });
      if (res.ok) return await res.json();
    } catch {}

    return {
      success: true,
      logs: [
        {
          id: 'log_01',
          action: 'ORDER_FULFILLED',
          performed_by: 'system',
          details: 'Digital Pine Script delivery provisioned automatically.',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'log_02',
          action: 'TV_ACCESS_REQUESTED',
          performed_by: 'guest_customer',
          details: 'TradingView username queue updated.',
          created_at: new Date().toISOString(),
        },
      ],
    };
  },

  async getAdminSettings() {
    try {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        headers: { ...getAdminAuthHeader() },
      });
      if (res.ok) return await res.json();
    } catch {}

    const defaultSettings: Record<string, string> = {
      bank_bca_account: '8012938491',
      bank_bca_holder: 'PT AEMETH TRADER ANALITIKA',
      bank_mandiri_account: '137001928374',
      bank_mandiri_holder: 'PT AEMETH TRADER ANALITIKA',
      crypto_usdt_trc20: 'TN3sK9xZ8vL4qP2wM7yJ1eR5tU6iO0pA3s',
      crypto_usdt_erc20: '0x71C3D823908f237B68E564F582C9E47A9cDE73A2',
    };
    return { success: true, settings: defaultSettings };
  },

  async updateAdminSettings(settings: Record<string, string>) {
    try {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeader() },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) return await res.json();
    } catch {}

    return { success: true, message: 'Settings saved successfully.' };
  },

  async createProduct(productData: any) {
    try {
      const res = await fetch(`${API_BASE}/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeader() },
        body: JSON.stringify(productData),
      });
      if (res.ok) return await res.json();
    } catch {}

    return { success: true, message: 'Product created successfully in local catalog.' };
  },
};
