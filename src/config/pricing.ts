/**
 * AEMETH TRADER ANALYSIS - CENTRALIZED PRICING ENGINE
 * 
 * Single source of truth for:
 * 1. Single indicator normal & launch promo prices (stored as integer Rupiah).
 * 2. Launch promo schedule and status (Asia/Jakarta timezone).
 * 3. Bundling discount rules (Starter 15%, Pro 20%, Ultimate 25%).
 * 4. Transparent price, discount, and savings calculations.
 */

export interface ProductPricingDefinition {
  id: string;
  name: string;
  normalPriceIdr: number;
  promoPriceIdr: number;
  normalPriceCents: number;
  promoPriceCents: number;
  isPublished: boolean;
  version: string;
}

export interface LaunchPromoConfig {
  enabled: boolean;
  startDate: string; // ISO 8601 with Asia/Jakarta offset (+07:00)
  endDate: string;   // ISO 8601 with Asia/Jakarta offset (+07:00)
  labelId: string;
  labelEn: string;
}

export interface BundleDefinition {
  type: 'starter' | 'pro' | 'ultimate';
  requiredCount: number | 'all';
  discountRate: number; // e.g. 0.15 for 15%
  nameId: string;
  nameEn: string;
  descriptionId: string;
  descriptionEn: string;
}

// -------------------------------------------------------------
// 1. LAUNCH PROMO CONFIGURATION
// Configurable start and end dates in Asia/Jakarta timezone.
// -------------------------------------------------------------
export const LAUNCH_PROMO_CONFIG: LaunchPromoConfig = {
  enabled: true,
  startDate: '2026-03-01T00:00:00+07:00',
  endDate: '2026-12-31T23:59:59+07:00',
  labelId: 'Promo Peluncuran',
  labelEn: 'Launch Special Promo',
};

// -------------------------------------------------------------
// 2. CENTRALIZED PRODUCT PRICING DATA (Integer Rupiah)
// -------------------------------------------------------------
export const PRODUCT_PRICING: Record<string, ProductPricingDefinition> = {
  'parabolic-sar': {
    id: 'parabolic-sar',
    name: 'Aemeth Parabolic SAR',
    normalPriceIdr: 99000,
    promoPriceIdr: 79000,
    normalPriceCents: 1000,
    promoPriceCents: 790,
    isPublished: true,
    version: '3.1.0',
  },
  'mfi-reversal': {
    id: 'mfi-reversal',
    name: 'Aemeth MFI Reversal',
    normalPriceIdr: 199000,
    promoPriceIdr: 149000,
    normalPriceCents: 2000,
    promoPriceCents: 1490,
    isPublished: true,
    version: '2.4.0',
  },
  'ichimoku-cloud': {
    id: 'ichimoku-cloud',
    name: 'Aemeth Ichimoku Cloud',
    normalPriceIdr: 199000,
    promoPriceIdr: 149000,
    normalPriceCents: 2000,
    promoPriceCents: 1490,
    isPublished: true,
    version: '5.2.0',
  },
  'ai-signal-v1': {
    id: 'ai-signal-v1',
    name: 'Aemeth AI Signal V1',
    normalPriceIdr: 199000,
    promoPriceIdr: 149000,
    normalPriceCents: 2000,
    promoPriceCents: 1490,
    isPublished: true,
    version: '1.2.0',
  },
  'trendline-sr-utbot': {
    id: 'trendline-sr-utbot',
    name: 'Aemeth Trendline Breakout + S/R + UT Bot',
    normalPriceIdr: 299000,
    promoPriceIdr: 249000,
    normalPriceCents: 3000,
    promoPriceCents: 2490,
    isPublished: true,
    version: '4.2.0',
  },
};

// Aliases for legacy compatibility
export const LEGACY_PRODUCT_ID_MAP: Record<string, string> = {
  'prd_psar_004': 'parabolic-sar',
  'prd_mfi_003': 'mfi-reversal',
  'prd_ichimoku_001': 'ichimoku-cloud',
  'prd_aisignal_002': 'ai-signal-v1',
  'prd_trendsr_005': 'trendline-sr-utbot',
};

export function resolveProductId(id: string): string {
  return LEGACY_PRODUCT_ID_MAP[id] || id;
}

// -------------------------------------------------------------
// 3. BUNDLE DEFINITIONS
// -------------------------------------------------------------
export const BUNDLE_DEFINITIONS: Record<'starter' | 'pro' | 'ultimate', BundleDefinition> = {
  starter: {
    type: 'starter',
    requiredCount: 2,
    discountRate: 0.15, // 15%
    nameId: 'Starter Pack',
    nameEn: 'Starter Pack',
    descriptionId: 'Pilih 2 indikator berbeda pilihanmu dengan tambahan diskon 15%.',
    descriptionEn: 'Select any 2 indicators of your choice with an additional 15% discount.',
  },
  pro: {
    type: 'pro',
    requiredCount: 3,
    discountRate: 0.20, // 20%
    nameId: 'Pro Pack',
    nameEn: 'Pro Pack',
    descriptionId: 'Pilih 3 indikator berbeda untuk analisa multi-strategi dengan diskon 20%.',
    descriptionEn: 'Select any 3 indicators for multi-strategy confluence with a 20% discount.',
  },
  ultimate: {
    type: 'ultimate',
    requiredCount: 'all',
    discountRate: 0.25, // 25%
    nameId: 'Ultimate Pack',
    nameEn: 'Ultimate Pack',
    descriptionId: 'Seluruh 5 indikator aktif Aemeth dalam satu paket lengkap dengan diskon maksimal 25%.',
    descriptionEn: 'All 5 active Aemeth indicators in one comprehensive package with maximum 25% discount.',
  },
};

// -------------------------------------------------------------
// 4. PROMO VALIDATION (Asia/Jakarta Safe)
// -------------------------------------------------------------
export function isLaunchPromoActive(customDate?: Date, promoConfig: LaunchPromoConfig = LAUNCH_PROMO_CONFIG): boolean {
  if (!promoConfig.enabled) return false;

  const startMs = Date.parse(promoConfig.startDate);
  const endMs = Date.parse(promoConfig.endDate);

  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    return false;
  }

  if (startMs >= endMs) {
    return false;
  }

  const currentMs = customDate ? customDate.getTime() : Date.now();
  return currentMs >= startMs && currentMs <= endMs;
}

// -------------------------------------------------------------
// 5. PRODUCT PRICE LOOKUP
// -------------------------------------------------------------
export interface ProductPriceResult {
  id: string;
  name: string;
  normalPriceIdr: number;
  promoPriceIdr: number;
  effectivePriceIdr: number;
  isPromoActive: boolean;
  discountIdr: number;
  discountPercent: number;
  normalPriceCents: number;
  effectivePriceCents: number;
  version: string;
}

export function calculateDiscountPercent(normalPrice: number, finalPrice: number): number {
  if (normalPrice <= 0 || finalPrice >= normalPrice) return 0;
  return Math.round(((normalPrice - finalPrice) / normalPrice) * 100);
}

export function roundToNearestThousand(val: number): number {
  return Math.round(val / 1000) * 1000;
}

export function getProductPrice(productId: string, customDate?: Date): ProductPriceResult | null {
  const resolvedId = resolveProductId(productId);
  const definition = PRODUCT_PRICING[resolvedId];
  if (!definition || !definition.isPublished) return null;

  const promoActive = isLaunchPromoActive(customDate);
  const effectivePriceIdr = promoActive ? definition.promoPriceIdr : definition.normalPriceIdr;
  const effectivePriceCents = promoActive ? definition.promoPriceCents : definition.normalPriceCents;
  const discountIdr = definition.normalPriceIdr - effectivePriceIdr;
  const discountPercent = calculateDiscountPercent(definition.normalPriceIdr, effectivePriceIdr);

  return {
    id: definition.id,
    name: definition.name,
    normalPriceIdr: definition.normalPriceIdr,
    promoPriceIdr: definition.promoPriceIdr,
    effectivePriceIdr,
    isPromoActive: promoActive,
    discountIdr,
    discountPercent,
    normalPriceCents: definition.normalPriceCents,
    effectivePriceCents,
    version: definition.version,
  };
}

// -------------------------------------------------------------
// 6. BUNDLE PRICE CALCULATION
// -------------------------------------------------------------
export interface BundleCalculationResult {
  bundleType: 'starter' | 'pro' | 'ultimate';
  bundleName: string;
  isValid: boolean;
  error?: string;
  selectedProducts: ProductPriceResult[];
  productCount: number;
  totalNormalPriceIdr: number;
  subtotalEffectiveIdr: number;
  bundleDiscountRate: number;
  bundleDiscountAmountIdr: number;
  finalPriceIdr: number;
  totalSavingsIdr: number;
  totalSavingsPercent: number;
}

export function calculateBundlePrice(
  bundleType: 'starter' | 'pro' | 'ultimate',
  productIds: string[],
  customDate?: Date
): BundleCalculationResult {
  const bundleDef = BUNDLE_DEFINITIONS[bundleType];
  const bundleName = bundleDef.nameId;

  // 1. Resolve and deduplicate IDs
  const resolvedIds = productIds.map(resolveProductId);
  const uniqueIds = Array.from(new Set(resolvedIds));

  // Check duplicate product selection
  if (uniqueIds.length !== productIds.length) {
    return {
      bundleType,
      bundleName,
      isValid: false,
      error: 'Produk duplikat tidak diizinkan dalam paket bundling.',
      selectedProducts: [],
      productCount: uniqueIds.length,
      totalNormalPriceIdr: 0,
      subtotalEffectiveIdr: 0,
      bundleDiscountRate: bundleDef.discountRate,
      bundleDiscountAmountIdr: 0,
      finalPriceIdr: 0,
      totalSavingsIdr: 0,
      totalSavingsPercent: 0,
    };
  }

  // 2. Fetch and validate each product
  const products: ProductPriceResult[] = [];
  for (const id of uniqueIds) {
    const priceRes = getProductPrice(id, customDate);
    if (!priceRes) {
      return {
        bundleType,
        bundleName,
        isValid: false,
        error: `Produk '${id}' tidak ditemukan atau tidak aktif.`,
        selectedProducts: [],
        productCount: uniqueIds.length,
        totalNormalPriceIdr: 0,
        subtotalEffectiveIdr: 0,
        bundleDiscountRate: bundleDef.discountRate,
        bundleDiscountAmountIdr: 0,
        finalPriceIdr: 0,
        totalSavingsIdr: 0,
        totalSavingsPercent: 0,
      };
    }
    products.push(priceRes);
  }

  // 3. Validate required product count
  const allActiveProductIds = Object.keys(PRODUCT_PRICING).filter((k) => PRODUCT_PRICING[k].isPublished);
  const expectedCount = bundleDef.requiredCount === 'all' ? allActiveProductIds.length : bundleDef.requiredCount;

  if (products.length !== expectedCount) {
    return {
      bundleType,
      bundleName,
      isValid: false,
      error: `Paket ${bundleName} membutuhkan ${expectedCount} indikator berbeda (dipilih: ${products.length}).`,
      selectedProducts: products,
      productCount: products.length,
      totalNormalPriceIdr: 0,
      subtotalEffectiveIdr: 0,
      bundleDiscountRate: bundleDef.discountRate,
      bundleDiscountAmountIdr: 0,
      finalPriceIdr: 0,
      totalSavingsIdr: 0,
      totalSavingsPercent: 0,
    };
  }

  // 4. Calculate prices
  const totalNormalPriceIdr = products.reduce((sum, p) => sum + p.normalPriceIdr, 0);
  const subtotalEffectiveIdr = products.reduce((sum, p) => sum + p.effectivePriceIdr, 0);

  // Bundling discount applied to active effective subtotal
  const rawDiscount = subtotalEffectiveIdr * bundleDef.discountRate;
  const rawFinal = subtotalEffectiveIdr - rawDiscount;

  // Consistent rounding to nearest thousand Rupiah
  const finalPriceIdr = roundToNearestThousand(rawFinal);

  // Guarantee: bundle must never be more expensive than individual active purchases
  const guaranteedFinalPriceIdr = Math.min(finalPriceIdr, subtotalEffectiveIdr);
  const bundleDiscountAmountIdr = subtotalEffectiveIdr - guaranteedFinalPriceIdr;

  // Total savings compared against original normal prices
  const totalSavingsIdr = totalNormalPriceIdr - guaranteedFinalPriceIdr;
  const totalSavingsPercent = calculateDiscountPercent(totalNormalPriceIdr, guaranteedFinalPriceIdr);

  return {
    bundleType,
    bundleName,
    isValid: true,
    selectedProducts: products,
    productCount: products.length,
    totalNormalPriceIdr,
    subtotalEffectiveIdr,
    bundleDiscountRate: bundleDef.discountRate,
    bundleDiscountAmountIdr,
    finalPriceIdr: guaranteedFinalPriceIdr,
    totalSavingsIdr,
    totalSavingsPercent,
  };
}

// -------------------------------------------------------------
// 7. LICENSE SPECIFICATION & TERMS
// -------------------------------------------------------------
export const LICENSE_CONFIG = {
  version: 'AEMETH-SL-1.0',
  titleId: 'Ketentuan Lisensi Permanen Source Code',
  titleEn: 'Permanent Source Code License Terms',
  termsId: [
    'Lisensi Permanen: Pembelian memberikan hak non-eksklusif dan permanen untuk menggunakan versi source code yang dibeli.',
    'Penggunaan Pribadi: Lisensi hanya berlaku untuk satu pengguna individual (personal use) dan akun TradingView pribadi Anda.',
    'Hak Cipta Terlindungi: Pembelian tidak mengalihkan hak cipta intelektual atas indikator atau algoritma yang dimiliki oleh Aemeth Trader Analysis.',
    'Larangan Redistribusi: Dilarang keras membagikan, menjual ulang, menerbitkan ulang, mendistribusikan, atau menyewakan source code baik sebagian maupun keseluruhan kepada pihak ketiga tanpa izin tertulis.',
    'Ruang Lingkup Pembaruan: Pembelian memberikan hak atas versi rilis spesifik saat transaksi. Pembaruan mayor rilis baru atau fitur di luar versi yang dibeli tidak disertakan secara otomatis kecuali dinyatakan khusus.',
    'Bantuan Instalasi: Bantuan teknis instalasi diberikan sesuai panduan Pine Editor pada dokumentasi resmi dan tidak mencakup modifikasi kode kustom tanpa batas.',
    'Peringatan Risiko: Indikator merupakan instrumen visual analisis teknikal, bukan jaminan keuntungan finansial atau kepastian sinyal trading. Risiko trading sepenuhnya berada pada pengguna.',
  ],
  termsEn: [
    'Permanent License: Purchase grants a non-exclusive, perpetual license to use the specifically acquired source code version.',
    'Single-User Personal License: Licensed strictly for one individual user and your personal TradingView charts.',
    'Retained Copyright: All intellectual property and copyrights remain the exclusive property of Aemeth Trader Analysis.',
    'No Unauthorized Redistribution: Resale, sublicensing, sharing, republishing, or redistribution of the source code in whole or in part without prior written permission is strictly prohibited.',
    'Version Scope: Purchase covers the specific release version designated on your invoice. Future major releases and rewrites are not included automatically unless explicitly offered.',
    'Installation Support: Support is limited to official Pine Editor installation and syntax guidance as described in product specs.',
    'Risk Disclaimer: Technical indicators are analytical tools and do not guarantee profits or future trading results. Trading involves financial risk.',
  ],
};
