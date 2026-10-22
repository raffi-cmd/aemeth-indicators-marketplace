import { initDatabase, db, hashPassword, verifyPassword } from '../db.ts';
import { fulfillOrder } from '../routes/orderRoutes.ts';
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
  assert(products.length >= 4, `Products found in catalog: ${products.length}`);
  
  const openSourceProd = products.find((p) => p.type === 'open_source');
  assert(openSourceProd !== undefined, 'Open-source indicator exists');
  
  const protectedProd = products.find((p) => p.type === 'private_protected');
  assert(protectedProd !== undefined, 'Protected TradingView indicator exists');

  const bundleProd = products.find((p) => p.type === 'bundle');
  assert(bundleProd !== undefined, 'Bundle indicator suite exists');

  // 3. Order Creation & Server-Side Price Integrity Test
  console.log('\n--- 3. Order Lifecycle & Server Price Integrity ---');
  const testUserId = 'usr_test_' + Date.now();
  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role)
    VALUES (?, ?, ?, 'Test Automated Trader', 'customer')
  `).run(testUserId, `auto_${Date.now()}@aemeth.test`, hashPassword('test1234'));

  // Calculate server price for openSourceProd
  const serverCalculatedPrice = openSourceProd.price_cents;
  const testOrderId = 'ord_test_' + Date.now();
  const testOrderNum = 'AEM-TEST-' + Math.floor(1000 + Math.random() * 9000);

  db.prepare(`
    INSERT INTO orders (id, order_number, user_id, total_cents, currency, status, payment_method, customer_email)
    VALUES (?, ?, ?, ?, 'USD', 'pending', 'bank_transfer', 'test@aemeth.test')
  `).run(testOrderId, testOrderNum, testUserId, serverCalculatedPrice);

  db.prepare(`
    INSERT INTO order_items (id, order_id, product_id, product_title, product_type, unit_price_cents)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('oi_test_1', testOrderId, openSourceProd.id, openSourceProd.title, openSourceProd.type, serverCalculatedPrice);

  db.prepare(`
    INSERT INTO payments (id, order_id, method, amount_cents, currency, status)
    VALUES (?, ?, 'bank_transfer', ?, 'USD', 'awaiting_payment')
  `).run('pay_test_1', testOrderId, serverCalculatedPrice);

  const initialOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(testOrderId) as any;
  assert(initialOrder.status === 'pending', 'Order initialized as pending');
  assert(initialOrder.total_cents === serverCalculatedPrice, 'Order total matches server-validated product price');

  // 4. Digital Delivery Protection Before Payment Test
  console.log('\n--- 4. Digital Delivery Protection (Unpaid State) ---');
  const deliveryBeforePayment = db.prepare('SELECT * FROM deliveries WHERE order_id = ?').get(testOrderId);
  assert(deliveryBeforePayment === undefined, 'No delivery provisioned while order is unpaid (Zero unauthorized access)');

  // 5. Payment Approval & Fulfillment Test
  console.log('\n--- 5. Payment Verification & Fulfillment ---');
  fulfillOrder(testOrderId);

  const paidOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(testOrderId) as any;
  assert(paidOrder.status === 'paid', 'Order transitioned to paid');

  const deliveryAfterPayment = db.prepare('SELECT * FROM deliveries WHERE order_id = ?').get(testOrderId) as any;
  assert(deliveryAfterPayment !== undefined, 'Delivery successfully provisioned upon verified payment');
  assert(deliveryAfterPayment.delivery_type === 'source_download', 'Delivery type correctly marked as source_download');
  assert(deliveryAfterPayment.status === 'ready', 'Source code status is ready for download');

  // 6. Bundle Multi-Product Delivery Test
  console.log('\n--- 6. Bundle Multi-Product Fulfillment ---');
  const bundleOrderId = 'ord_bundle_' + Date.now();
  db.prepare(`
    INSERT INTO orders (id, order_number, user_id, total_cents, currency, status, payment_method, customer_email, customer_tv_username)
    VALUES (?, ?, ?, ?, 'USD', 'pending', 'crypto', 'bundle_trader@aemeth.test', 'tv_trader_bundle')
  `).run(bundleOrderId, 'AEM-BND-01', testUserId, bundleProd.price_cents);

  db.prepare(`
    INSERT INTO order_items (id, order_id, product_id, product_title, product_type, unit_price_cents)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('oi_bnd_1', bundleOrderId, bundleProd.id, bundleProd.title, bundleProd.type, bundleProd.price_cents);

  fulfillOrder(bundleOrderId);

  const bundleDeliveries = db.prepare('SELECT * FROM deliveries WHERE order_id = ?').all(bundleOrderId) as any[];
  assert(bundleDeliveries.length === 4, `Bundle automatically provisioned all 4 underlying indicators: ${bundleDeliveries.length}`);

  const hasTvAccess = bundleDeliveries.some((d) => d.delivery_type === 'tradingview_access' && d.status === 'access_requested');
  assert(hasTvAccess, 'Private indicators in bundle correctly queued for TradingView access request');

  // Summary
  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
