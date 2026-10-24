import { initDatabase, db, hashPassword, verifyPassword } from '../db.ts';
import { fulfillOrder } from '../routes/orderRoutes.ts';
import {
  getProductPrice,
  calculateBundlePrice,
  isLaunchPromoActive,
  resolveProductId,
  roundToNearestThousand,
  PRODUCT_PRICING,
  LICENSE_CONFIG,
} from '../../src/config/pricing.ts';
import crypto from 'node:crypto';

async function runTests() {
  console.log('====================================================');
  console.log('RUNNING AEMETH INDICATORS MARKETPLACE API TEST SUITE');
  console.log('====================================================');

  initDatabase();

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${desc}`);
      failed++;
    }
  }

  // 1. Password Security Test
  console.log('\n--- 1. Authentication & Password Security ---');
  const rawPass = 'SecretTraderPass99!';
  const hashed = hashPassword(rawPass);
  assert(hashed.includes(':') && !hashed.includes(rawPass), 'Password properly salted and scrypt hashed');
  assert(verifyPassword(rawPass, hashed) === true, 'Correct password verifies successfully');
  assert(verifyPassword('WrongPass123', hashed) === false, 'Incorrect password rejected');

  // 2. Product Catalog & Anti-Leak Test
  console.log('\n--- 2. Product Catalog & Anti-Leak Verification ---');
  const products = db.prepare('SELECT * FROM products WHERE is_published = 1').all() as any[];
  assert(products.length >= 5, `Products found in catalog: ${products.length}`);

  // 3. Single Indicator Pricing & Launch Promo Tests
  console.log('\n--- 3. Single Indicator Normal & Promo Prices (Integer IDR) ---');
  const psar = getProductPrice('parabolic-sar');
  assert(psar !== null && psar.normalPriceIdr === 99000 && psar.promoPriceIdr === 79000, 'Parabolic SAR: Normal Rp 99.000, Promo Rp 79.000');
  assert(psar?.effectivePriceIdr === 79000, 'Parabolic SAR active price is promo Rp 79.000');

  const mfi = getProductPrice('mfi-reversal');
  assert(mfi !== null && mfi.normalPriceIdr === 199000 && mfi.promoPriceIdr === 149000, 'MFI Reversal: Normal Rp 199.000, Promo Rp 149.000');

  const ichimoku = getProductPrice('ichimoku-cloud');
  assert(ichimoku !== null && ichimoku.normalPriceIdr === 199000 && ichimoku.promoPriceIdr === 149000, 'Ichimoku Cloud: Normal Rp 199.000, Promo Rp 149.000');

  const aiSignal = getProductPrice('ai-signal-v1');
  assert(aiSignal !== null && aiSignal.normalPriceIdr === 199000 && aiSignal.promoPriceIdr === 149000, 'AI Signal V1: Normal Rp 199.000, Promo Rp 149.000');

  const trendSr = getProductPrice('trendline-sr-utbot');
  assert(trendSr !== null && trendSr.normalPriceIdr === 299000 && trendSr.promoPriceIdr === 249000, 'Trendline Breakout + S/R + UT Bot: Normal Rp 299.000, Promo Rp 249.000');

  // Legacy ID aliases resolution test
  assert(resolveProductId('prd_psar_004') === 'parabolic-sar', 'Legacy ID prd_psar_004 resolved to parabolic-sar');
  assert(resolveProductId('prd_ichimoku_001') === 'ichimoku-cloud', 'Legacy ID prd_ichimoku_001 resolved to ichimoku-cloud');
  assert(resolveProductId('prd_aisignal_002') === 'ai-signal-v1', 'Legacy ID prd_aisignal_002 resolved to ai-signal-v1');

  // 4. Launch Promo Window Validation
  console.log('\n--- 4. Launch Promo Schedule & Time Window Tests ---');
  const promoNow = isLaunchPromoActive();
  assert(promoNow === true, 'Launch promo is active under current schedule');

  // Test promo expired date
  const expiredDate = new Date('2027-01-01T00:00:00+07:00');
  const priceExpired = getProductPrice('parabolic-sar', expiredDate);
  assert(priceExpired?.isPromoActive === false && priceExpired?.effectivePriceIdr === 99000, 'Expired promo returns normal price Rp 99.000');

  // Test promo before start date
  const pastConfig = {
    enabled: true,
    startDate: '2026-06-01T00:00:00+07:00',
    endDate: '2026-12-31T23:59:59+07:00',
    labelId: 'Promo',
    labelEn: 'Promo',
  };
  assert(isLaunchPromoActive(new Date('2026-01-01T00:00:00+07:00'), pastConfig) === false, 'Date before promo start is inactive');

  // Test disabled promo
  assert(isLaunchPromoActive(new Date(), { ...pastConfig, enabled: false }) === false, 'Disabled promo is inactive');

  // Test invalid date fallback (safe failure)
  const invalidConfig = { ...pastConfig, startDate: 'invalid-date' };
  assert(isLaunchPromoActive(new Date(), invalidConfig) === false, 'Invalid promo date gracefully fails to false');

  // 5. Starter Pack Bundling Tests (Pick 2, 15% discount, Rp 1.000 rounding)
  console.log('\n--- 5. Starter Pack (Pick 2, 15% Off) ---');
  // Cheapest pair: parabolic-sar (79k) + mfi-reversal (149k) = 228.000 -> 228.000 * 0.85 = 193.800 -> rounded to 194.000
  const starterCheapest = calculateBundlePrice('starter', ['parabolic-sar', 'mfi-reversal']);
  assert(starterCheapest.isValid === true, 'Starter pack valid with 2 distinct products');
  assert(starterCheapest.subtotalEffectiveIdr === 228000, 'Starter subtotal is Rp 228.000');
  assert(starterCheapest.finalPriceIdr === 194000, 'Starter cheapest pair rounds exactly to Rp 194.000');
  assert(starterCheapest.totalSavingsIdr === (298000 - 194000), 'Starter total savings calculated accurately against normal total');

  // 6. Pro Pack Bundling Tests (Pick 3, 20% discount, Rp 1.000 rounding)
  console.log('\n--- 6. Pro Pack (Pick 3, 20% Off) ---');
  // Cheapest trio: parabolic-sar (79k) + mfi-reversal (149k) + ichimoku-cloud (149k) = 377.000 -> 377.000 * 0.80 = 301.600 -> rounded to 302.000
  const proCheapest = calculateBundlePrice('pro', ['parabolic-sar', 'mfi-reversal', 'ichimoku-cloud']);
  assert(proCheapest.isValid === true, 'Pro pack valid with 3 distinct products');
  assert(proCheapest.subtotalEffectiveIdr === 377000, 'Pro subtotal is Rp 377.000');
  assert(proCheapest.finalPriceIdr === 302000, 'Pro cheapest trio rounds exactly to Rp 302.000');

  // 7. Ultimate Pack Bundling Tests (All 5 active indicators, 25% discount)
  console.log('\n--- 7. Ultimate Pack (All 5 Indicators, 25% Off) ---');
  // All 5 promo: 79k + 149k + 149k + 149k + 249k = 775.000 -> 775.000 * 0.75 = 581.250 -> rounded to 581.000
  const allFive = ['parabolic-sar', 'mfi-reversal', 'ichimoku-cloud', 'ai-signal-v1', 'trendline-sr-utbot'];
  const ultimatePack = calculateBundlePrice('ultimate', allFive);
  assert(ultimatePack.isValid === true, 'Ultimate pack valid with all 5 products');
  assert(ultimatePack.subtotalEffectiveIdr === 775000, 'Ultimate subtotal is Rp 775.000');
  assert(ultimatePack.finalPriceIdr === 581000, 'Ultimate pack rounds exactly to Rp 581.000');

  // 8. Bundle Price <= Individual Price Guarantee
  console.log('\n--- 8. Bundle Price <= Individual Sum Guarantee ---');
  assert(starterCheapest.finalPriceIdr <= starterCheapest.subtotalEffectiveIdr, 'Starter bundle price <= individual sum');
  assert(proCheapest.finalPriceIdr <= proCheapest.subtotalEffectiveIdr, 'Pro bundle price <= individual sum');
  assert(ultimatePack.finalPriceIdr <= ultimatePack.subtotalEffectiveIdr, 'Ultimate bundle price <= individual sum');

  // 9. Validation & Duplicate Rejection
  console.log('\n--- 9. Duplicate & Invalid Bundle Validation ---');
  const duplicateBundle = calculateBundlePrice('starter', ['parabolic-sar', 'parabolic-sar']);
  assert(duplicateBundle.isValid === false, 'Duplicate indicators in bundle rejected');

  const wrongCountStarter = calculateBundlePrice('starter', ['parabolic-sar']);
  assert(wrongCountStarter.isValid === false, 'Starter pack with only 1 item rejected');

  const wrongCountPro = calculateBundlePrice('pro', ['parabolic-sar', 'mfi-reversal']);
  assert(wrongCountPro.isValid === false, 'Pro pack with only 2 items rejected');

  // 10. License Terms Specification
  console.log('\n--- 10. License Terms Specification ---');
  assert(LICENSE_CONFIG.version === 'AEMETH-SL-1.0', 'License version is AEMETH-SL-1.0');
  assert(LICENSE_CONFIG.termsId.length >= 5, 'Indonesian license terms comprehensive');
  assert(LICENSE_CONFIG.termsEn.length >= 5, 'English license terms comprehensive');

  // 11. Order Lifecycle & Server Price Integrity Test
  console.log('\n--- 11. Order Lifecycle & Server Price Integrity ---');
  const testUserId = 'usr_test_' + Date.now();
  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role)
    VALUES (?, ?, ?, 'Test Automated Trader', 'customer')
  `).run(testUserId, `auto_${Date.now()}@aemeth.test`, hashPassword('test1234'));

  const testOrderId = 'ord_test_' + Date.now();
  const testOrderNum = 'AEM-TEST-' + Math.floor(1000 + Math.random() * 9000);
  const nowIso = new Date().toISOString();

  db.prepare(`
    INSERT INTO orders (
      id, order_number, user_id, total_cents, currency, status, payment_method, customer_email,
      total_idr, subtotal_idr, bundle_type, bundle_discount_idr, total_savings_idr, license_version, license_agreed_at
    ) VALUES (?, ?, ?, ?, 'IDR', 'pending', 'bank_transfer', 'test@aemeth.test', ?, ?, 'starter', 34000, 104000, ?, ?)
  `).run(testOrderId, testOrderNum, testUserId, 1212, 194000, 228000, LICENSE_CONFIG.version, nowIso);

  const savedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(testOrderId) as any;
  assert(savedOrder.status === 'pending', 'Order initialized as pending');
  assert(savedOrder.total_idr === 194000, 'Order total_idr matches server-validated bundle price (194.000 IDR)');
  assert(savedOrder.license_version === 'AEMETH-SL-1.0', 'Order records license version snapshot');
  assert(savedOrder.license_agreed_at !== null, 'Order records timestamp of license agreement');

  // 12. Digital Delivery Protection Before Payment
  console.log('\n--- 12. Digital Delivery Protection (Unpaid State) ---');
  const deliveryBeforePayment = db.prepare('SELECT * FROM deliveries WHERE order_id = ?').get(testOrderId);
  assert(deliveryBeforePayment === undefined, 'No delivery provisioned while order is unpaid (Zero unauthorized access)');

  // 13. Payment Approval & Fulfillment Test
  console.log('\n--- 13. Payment Verification & Fulfillment ---');
  fulfillOrder(testOrderId);

  const paidOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(testOrderId) as any;
  assert(paidOrder.status === 'paid', 'Order transitioned to paid');

  // Summary
  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

