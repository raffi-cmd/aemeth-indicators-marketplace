# Aemeth Trader Analysis — TradingView Indicators Marketplace

Dedicated, production-ready digital marketplace for selling and delivering premium **TradingView Pine Script indicators and multi-indicator suites**. Engineered with an editorial dark cyber-noir aesthetic directly mirroring the high-end reference design: deep obsidian black (`#070709`), glowing neon-crimson/ruby accents (`#ff2a3b`), floating pill navigation, and modular bento telemetry.

---

## ⚡ Key Highlights & Core Capabilities

1. **Exact Visual Direction Matching Reference Image**:
   - Bioluminescent neon-crimson hero visual with fluid organic glow.
   - Floating pill navigation bar with active red pill indicator and blur backdrop.
   - Bento grid telemetry: `3,400+ Verified Traders`, `100% Candle-1 Anti-Repaint Directive`, `<1s Delivery Speed`, `230+ Script Releases`.
   - Frosted glass cards (`bg-glass`, `bg-glass-card`) with subtle red borders.

2. **Supported Product Delivery Paradigms**:
   - **Type A: Open-Source Pine Script Indicators**
     - Uncompiled `.pine` and `.txt` source files.
     - Interactive in-dashboard code viewer with single-click clipboard copying.
     - Direct authenticated download endpoint streaming files with user license watermarks.
   - **Type B: Private / Protected TradingView Indicators**
     - Confidential algorithmic IP protected from source leakage.
     - Customer submits TradingView username via dashboard or checkout.
     - Institutional publisher workflow: queue tracking (`awaiting_tv_username` → `access_requested` → `access_granted`).
     - Real-time step-by-step instructions for customers to load approved scripts from TradingView's *Invite-Only Scripts* panel.
   - **Type C: Indicator Bundles (Institutional Suites)**
     - Multi-product bundle fulfillment provisioning all child scripts upon a single verified order.

3. **Multi-Method Payment Engine**:
   - **Bank Transfer**: BCA, Mandiri, and Wire transfer with unique order reference (`AEM-XXXXXXXX`) and receipt file upload.
   - **PayPal v2 Orders**: Server-side order creation and verification with instant fulfillment.
   - **Crypto Payments**: Segregated networks (USDT TRC-20, USDT ERC-20, BTC) with wallet address copying and TXID submission.
   - **Manual & P2P Review**: Dedicated queue for admin verification before digital release.

4. **Security & Zero-Leakage Architecture**:
   - Server-side price calculation strictly ignores client-supplied pricing.
   - Unpaid or canceled orders cannot unlock source code or generate downloads.
   - Scrypt password hashing with unique random salts.
   - Zero external binary compilation needed: leverages Node.js v24 native `node:sqlite` (`DatabaseSync`) with WAL mode.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Canvas Confetti.
- **Backend API**: Node.js v24, Express, TypeScript / ESM.
- **Database**: Native `node:sqlite` (`server/data/marketplace.db`) with relational integrity and automatic seeding.
- **Security**: Crypto scrypt hashing, HMAC-SHA256 tokens, RBAC, authenticated stream downloads.

---

## 🚀 Running Locally (Windows)

### 1. Run Automated Test Suite
Verify that all 16 business logic tests pass (auth, prices, order lifecycle, payments, digital deliveries):
```bash
npm run test:api
```

### 2. Start Both Backend and Frontend Concurrently
```bash
npm start
```
* Or start individually in separate terminals:
  - Backend API: `npm run server` (runs on `http://localhost:5000`)
  - Frontend UI: `npm run dev` (runs on `http://localhost:3000`)

### 3. Open in Browser
Visit **`http://localhost:3000`**

---

## 👤 Pre-Seeded Test Credentials

| Role | Email | Password | Pre-Assigned Access |
|---|---|---|---|
| **Administrator** | `admin@aemethtrader.com` | `admin123` | Full Admin Portal, Order Approvals, TV Access Queue, Settings |
| **Trader / Customer** | `trader@aemethtrader.com` | `trader123` | 1 Paid Order, Instant Pine Script Downloads, TV Access Manager |

---

## ⚖️ Legal & Regulatory Disclaimers

© 2026 AEMETH TRADER ANALYSIS. All Rights Reserved.  
*Trading Forex, Gold (XAUUSD), Indices, and Cryptocurrencies involves substantial risk of loss. Analytical tools and Pine Script indicators do not constitute financial advice.*
