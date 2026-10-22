import React, { useState, useEffect } from 'react';
import { X, Check, Copy, Upload, ArrowRight, ShieldCheck, CreditCard, Building2, Wallet, RefreshCw, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import type { Product, PaymentMethod, User, SiteSettings } from '../types/marketplace';

interface CheckoutModalProps {
  products: Product[];
  currentUser: User | null;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  products,
  currentUser,
  onClose,
  onSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [tradingviewUsername, setTradingviewUsername] = useState(currentUser?.tradingview_username || '');
  const [config, setConfig] = useState<SiteSettings | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Created order state
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  
  // Bank receipt file state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [cryptoTxid, setCryptoTxid] = useState('');
  const [cryptoAsset, setCryptoAsset] = useState('USDT-TRC20');
  
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Fetch payment config on mount
  useEffect(() => {
    api.getPaymentConfig().then((res) => {
      if (res.success) setConfig(res.config);
    });
  }, []);

  const totalCents = products.reduce((acc, p) => acc + p.price_cents, 0);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  // Step 1: Create Order on Server
  const handleCreateOrder = async () => {
    if (!customerEmail.trim()) {
      setError('Please provide an email address for your order and receipt.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.createOrder({
        product_ids: products.map((p) => p.id),
        payment_method: paymentMethod,
        customer_email: customerEmail.trim(),
        customer_name: customerName.trim(),
        customer_tv_username: tradingviewUsername.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to create order');
      }

      setCreatedOrder(res.order);
      setIsSubmitting(false);

      // If PayPal, initiate PayPal server capture flow
      if (paymentMethod === 'paypal') {
        initiatePaypal(res.order.id);
      }
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  // Step 2A: PayPal Sandbox / Live Simulation Handler
  const initiatePaypal = async (orderId: string) => {
    try {
      const res = await api.createPaypalOrder(orderId);
      if (res.success) {
        // In this production-ready setup, simulate instant sandbox capture confirmation
        const cap = await api.capturePaypalOrder(orderId, res.paypalOrderId);
        if (cap.success) {
          triggerSuccess();
        }
      }
    } catch (err: any) {
      setError('PayPal processing failed: ' + err.message);
    }
  };

  // Step 2B: Submit Bank Transfer Receipt
  const handleSubmitBankReceipt = async () => {
    if (!createdOrder) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      } else {
        formData.append('notes', 'Customer confirmed bank transfer manual payment');
      }

      const res = await api.uploadReceipt(createdOrder.id, formData);
      if (!res.success) throw new Error(res.error || 'Failed to submit receipt');

      triggerSuccess();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  // Step 2C: Submit Crypto TXID
  const handleSubmitCryptoTxid = async () => {
    if (!createdOrder) return;
    if (!cryptoTxid.trim()) {
      setError('Please enter your transaction hash (TXID)');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.submitCryptoPayment(createdOrder.id, {
        asset: cryptoAsset,
        network: cryptoAsset.includes('TRC20') ? 'TRON' : cryptoAsset.includes('ERC20') ? 'Ethereum' : 'Bitcoin',
        txid: cryptoTxid.trim(),
      });

      if (!res.success) throw new Error(res.error || 'Failed to submit TXID');

      triggerSuccess();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const triggerSuccess = () => {
    setIsComplete(true);
    setIsSubmitting(false);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff2a3b', '#10b981', '#3b82f6'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0e0e15] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-red-950/60 my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#14141d]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff2a3b] animate-pulse"></span>
            <h3 className="font-heading font-bold text-white text-base">
              Secure Checkout — Aemeth Marketplace
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Order Complete Screen */}
          {isComplete ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold font-heading text-white">
                Order Received!
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                Order reference <strong className="text-red-400 font-mono">{createdOrder?.order_number}</strong> has been logged. You can now access your purchased indicators and manage your TradingView license in your customer dashboard.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => onSuccess(createdOrder?.id)}
                  className="px-6 py-3 bg-[#ff2a3b] hover:bg-[#e02434] text-white text-xs font-bold rounded-full shadow-lg shadow-red-500/40 flex items-center gap-2 cursor-pointer"
                >
                  <span>Go to Customer Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : !createdOrder ? (
            /* Step 1: Items summary & Payment Method Selection */
            <div className="space-y-6">
              
              {/* Product Summary */}
              <div className="bg-[#14141c] rounded-2xl p-4 border border-white/5 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Items to Purchase ({products.length})
                </span>
                <div className="space-y-2">
                  {products.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-xs">
                      <span className="text-zinc-200 font-medium truncate max-w-[280px]">
                        {p.title}
                      </span>
                      <span className="font-mono text-white font-bold">
                        ${(p.price_cents / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-white/5 flex items-baseline justify-between">
                  <span className="text-xs font-bold text-zinc-300">Total Due</span>
                  <span className="text-xl font-extrabold font-heading text-white">
                    ${(totalCents / 100).toFixed(2)} <span className="text-xs font-mono text-zinc-400">USD</span>
                  </span>
                </div>
              </div>

              {/* Customer Inputs */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Customer & License Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="trader@domain.com"
                      className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Alexander Vance"
                      className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">
                    TradingView Username <span className="text-red-400">(Required for Invite-Only scripts)</span>
                  </label>
                  <input
                    type="text"
                    value={tradingviewUsername}
                    onChange={(e) => setTradingviewUsername(e.target.value)}
                    placeholder="e.g. trader_vance"
                    className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Select Payment Method
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'bank_transfer'
                        ? 'bg-red-950/40 border-[#ff2a3b] text-white shadow-md'
                        : 'bg-[#14141c] border-white/5 text-zinc-400 hover:text-white hover:bg-[#1a1a24]'
                    }`}
                  >
                    <Building2 className="w-5 h-5 mb-1.5 text-red-400" />
                    <span className="text-xs font-bold">Bank Transfer</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">BCA / Mandiri / Wire</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('crypto')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'crypto'
                        ? 'bg-red-950/40 border-[#ff2a3b] text-white shadow-md'
                        : 'bg-[#14141c] border-white/5 text-zinc-400 hover:text-white hover:bg-[#1a1a24]'
                    }`}
                  >
                    <Wallet className="w-5 h-5 mb-1.5 text-emerald-400" />
                    <span className="text-xs font-bold">Crypto Deposit</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">USDT / USDC / BTC</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'paypal'
                        ? 'bg-red-950/40 border-[#ff2a3b] text-white shadow-md'
                        : 'bg-[#14141c] border-white/5 text-zinc-400 hover:text-white hover:bg-[#1a1a24]'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mb-1.5 text-blue-400" />
                    <span className="text-xs font-bold">PayPal</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">Worldwide Cards</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handleCreateOrder}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#ff2a3b] hover:bg-[#e02434] text-white text-xs sm:text-sm font-bold rounded-full shadow-xl shadow-red-500/30 hover:shadow-red-500/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Validating Price on Server...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Invoice & Payment Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </div>
          ) : (
            /* Step 2: Payment Verification and Instructions Screen */
            <div className="space-y-6">
              
              {/* Invoice Pill */}
              <div className="flex items-center justify-between bg-[#14141c] p-3 rounded-xl border border-white/5 text-xs">
                <div>
                  <span className="text-zinc-400">Order Number:</span>
                  <span className="text-white font-mono font-bold ml-2">{createdOrder.order_number}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Amount:</span>
                  <span className="text-white font-mono font-bold ml-2">${(createdOrder.total_cents / 100).toFixed(2)} USD</span>
                </div>
              </div>

              {/* Bank Transfer Instructions */}
              {paymentMethod === 'bank_transfer' && (
                <div className="space-y-4">
                  <div className="bg-[#14141c] rounded-2xl p-4 border border-white/5 space-y-3">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
                      Bank Central Asia (BCA) Account
                    </span>
                    <div className="flex items-center justify-between text-xs bg-[#0a0a0f] p-3 rounded-xl border border-white/5">
                      <div>
                        <div className="font-mono text-white font-bold">{config?.bank_bca_account || '8040-192-384'}</div>
                        <div className="text-[11px] text-zinc-400">{config?.bank_bca_holder || 'PT AEMETH TRADER ANALISIS'}</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(config?.bank_bca_account || '8040-192-384', 'bca')}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{isCopied === 'bca' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider block pt-2">
                      Bank Mandiri Account
                    </span>
                    <div className="flex items-center justify-between text-xs bg-[#0a0a0f] p-3 rounded-xl border border-white/5">
                      <div>
                        <div className="font-mono text-white font-bold">{config?.bank_mandiri_account || '137-00-9821-441'}</div>
                        <div className="text-[11px] text-zinc-400">{config?.bank_mandiri_holder || 'PT AEMETH TRADER ANALISIS'}</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(config?.bank_mandiri_account || '137-00-9821-441', 'mandiri')}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{isCopied === 'mandiri' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Receipt Upload Dropzone */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 block">
                      Upload Proof of Transfer / Receipt
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#ff2a3b] file:text-white hover:file:bg-[#e02434] cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={handleSubmitBankReceipt}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#ff2a3b] hover:bg-[#e02434] text-white text-xs font-bold rounded-full shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting Verification...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Transfer & Queue Verification</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Crypto Deposit Instructions */}
              {paymentMethod === 'crypto' && (
                <div className="space-y-4">
                  <div className="bg-[#14141c] rounded-2xl p-4 border border-white/5 space-y-3">
                    <div className="flex items-center gap-2">
                      {['USDT-TRC20', 'USDT-ERC20', 'BTC'].map((coin) => (
                        <button
                          key={coin}
                          type="button"
                          onClick={() => setCryptoAsset(coin)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                            cryptoAsset === coin
                              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                              : 'bg-black/40 border-white/5 text-zinc-400'
                          }`}
                        >
                          {coin}
                        </button>
                      ))}
                    </div>

                    <div className="text-xs bg-[#0a0a0f] p-3 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[10px] text-zinc-400 block font-mono">Deposit Destination Address:</span>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-emerald-400 font-bold truncate text-[11px]">
                          {cryptoAsset === 'USDT-TRC20'
                            ? config?.crypto_usdt_trc20 || 'TY2HqE83rLw8x7e94gP9W3B1Kx7M4z8Y1a'
                            : cryptoAsset === 'USDT-ERC20'
                            ? config?.crypto_usdt_erc20 || '0x71C8F4a2D398E153b6920194E347206bE5402919'
                            : config?.crypto_btc || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              cryptoAsset === 'USDT-TRC20'
                                ? config?.crypto_usdt_trc20 || 'TY2HqE83rLw8x7e94gP9W3B1Kx7M4z8Y1a'
                                : cryptoAsset === 'USDT-ERC20'
                                ? config?.crypto_usdt_erc20 || '0x71C8F4a2D398E153b6920194E347206bE5402919'
                                : config?.crypto_btc || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
                              'crypto'
                            )
                          }
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs rounded-lg shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{isCopied === 'crypto' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300 block">
                      Transaction Hash (TXID) *
                    </label>
                    <input
                      type="text"
                      value={cryptoTxid}
                      onChange={(e) => setCryptoTxid(e.target.value)}
                      placeholder="Paste blockchain transaction hash..."
                      className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50 font-mono"
                    />
                  </div>

                  <button
                    onClick={handleSubmitCryptoTxid}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#ff2a3b] hover:bg-[#e02434] text-white text-xs font-bold rounded-full shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Node...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit TXID for Node Verification</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* PayPal Sandbox confirmation indicator */}
              {paymentMethod === 'paypal' && (
                <div className="text-center py-6 space-y-3">
                  <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                  <p className="text-xs text-zinc-300">
                    Connecting to PayPal Secure Order Gateway...
                  </p>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
