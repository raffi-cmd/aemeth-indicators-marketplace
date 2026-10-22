import React, { useState, useEffect } from 'react';
import { X, Check, Copy, Building2, Wallet, CreditCard, RefreshCw, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTranslation } from '../i18n/LanguageContext';
import { api } from '../services/api';
import type { Product, PaymentMethod, SiteSettings } from '../types/marketplace';

interface CheckoutModalProps {
  products: Product[];
  onClose: () => void;
  onSuccess: (orderNumber: string, accessToken: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  products,
  onClose,
  onSuccess,
}) => {
  const { t, lang } = useTranslation();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [customerEmail, setCustomerEmail] = useState('');
  const [tradingviewUsername, setTradingviewUsername] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [config, setConfig] = useState<SiteSettings | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Order state after server creation
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [cryptoTxid, setCryptoTxid] = useState('');
  const [cryptoAsset, setCryptoAsset] = useState('USDT-TRC20');
  
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Check if any selected product requires TradingView username
  const requiresTvUsername = products.some(
    (p) => p.type === 'private_protected' || p.type === 'bundle'
  );

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

  // Step 1: Create Guest Order
  const handleCreateGuestOrder = async () => {
    if (!customerEmail.trim()) {
      setError(lang === 'id' ? 'Silakan masukkan alamat email yang valid.' : 'Please enter a valid email address.');
      return;
    }

    if (requiresTvUsername && !tradingviewUsername.trim()) {
      setError(
        lang === 'id'
          ? 'Username TradingView diperlukan untuk indikator Invite-Only / Bundle.'
          : 'TradingView username is required for Invite-Only / Bundle scripts.'
      );
      return;
    }

    if (!termsAccepted) {
      setError(
        lang === 'id'
          ? 'Anda harus menyetujui Ketentuan Layanan dan Peringatan Risiko.'
          : 'You must accept the Terms of Service and Risk Disclaimer.'
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.createGuestOrder({
        product_ids: products.map((p) => p.id),
        payment_method: paymentMethod,
        customer_email: customerEmail.trim(),
        customer_tv_username: tradingviewUsername.trim() || undefined,
      });

      if (!res.success || !res.order) {
        throw new Error(res.error || 'Failed to create order');
      }

      setCreatedOrder(res.order);
      setIsSubmitting(false);

      if (paymentMethod === 'paypal') {
        initiatePaypal(res.order.id);
      }
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const initiatePaypal = async (orderId: string) => {
    try {
      const res = await api.createPaypalOrder(orderId);
      if (res.success) {
        const cap = await api.capturePaypalOrder(orderId, res.paypalOrderId);
        if (cap.success) triggerSuccess();
      }
    } catch (err: any) {
      setError('PayPal simulation error: ' + err.message);
    }
  };

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

  const handleSubmitCryptoTxid = async () => {
    if (!createdOrder) return;
    if (!cryptoTxid.trim()) {
      setError(lang === 'id' ? 'Silakan masukkan hash transaksi (TXID)' : 'Please enter your transaction hash (TXID)');
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
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#3b82f6', '#10b981'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0b1120] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070b14]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <h3 className="font-heading font-bold text-white text-base">
              {t.checkout.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
                {t.checkout.orderSuccessTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed font-light">
                {t.checkout.orderSuccessDesc}
              </p>

              {/* Order Reference Box */}
              <div className="bg-[#070b14] border border-slate-800 rounded-2xl p-4 max-w-md mx-auto text-left space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{t.checkout.orderReference}:</span>
                  <strong className="text-white font-mono">{createdOrder?.order_number}</strong>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Guest Access Token:</span>
                  <span className="text-blue-400 font-mono text-[11px] truncate max-w-[200px]">
                    {createdOrder?.access_token}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onSuccess(createdOrder?.order_number, createdOrder?.access_token);
                  }}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
                >
                  <span>{t.checkout.trackOrderCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : !createdOrder ? (
            /* Step 1: Items summary & Guest Checkout Inputs */
            <div className="space-y-6">
              
              {/* Product Summary */}
              <div className="bg-[#070b14] rounded-2xl p-4 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                  {t.checkout.itemsToPurchase} ({products.length})
                </span>
                <div className="space-y-2">
                  {products.map((p) => {
                    const title = lang === 'id' ? p.title_id || p.title : p.title_en || p.title;
                    return (
                      <div key={p.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-200 font-medium truncate max-w-[280px]">
                          {title}
                        </span>
                        <span className="font-mono text-white font-bold">
                          ${(p.price_cents / 100).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
                  <span className="text-xs font-bold text-slate-300">{t.checkout.totalDue}</span>
                  <span className="text-xl font-extrabold font-heading text-white">
                    ${(totalCents / 100).toFixed(2)} <span className="text-xs font-mono text-slate-400">USD</span>
                  </span>
                </div>
              </div>

              {/* Guest Inputs */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                  {t.checkout.customerDetails}
                </span>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    {t.checkout.emailLabel}
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder={t.checkout.emailPlaceholder}
                    className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    {t.checkout.tvUsernameLabel} <span className="text-blue-400">{t.checkout.tvUsernameNote}</span>
                  </label>
                  <input
                    type="text"
                    value={tradingviewUsername}
                    onChange={(e) => setTradingviewUsername(e.target.value)}
                    placeholder={t.checkout.tvUsernamePlaceholder}
                    className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                  {t.checkout.paymentMethodTitle}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'bank_transfer'
                        ? 'bg-blue-950/60 border-blue-500 text-white shadow-sm'
                        : 'bg-[#070b14] border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Building2 className="w-5 h-5 mb-1.5 text-blue-400" />
                    <span className="text-xs font-bold">{t.checkout.bankTransfer}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{t.checkout.bankTransferDesc}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('crypto')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'crypto'
                        ? 'bg-blue-950/60 border-blue-500 text-white shadow-sm'
                        : 'bg-[#070b14] border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Wallet className="w-5 h-5 mb-1.5 text-emerald-400" />
                    <span className="text-xs font-bold">{t.checkout.cryptoDeposit}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{t.checkout.cryptoDepositDesc}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'paypal'
                        ? 'bg-blue-950/60 border-blue-500 text-white shadow-sm'
                        : 'bg-[#070b14] border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mb-1.5 text-indigo-400" />
                    <span className="text-xs font-bold">{t.checkout.paypal}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{t.checkout.paypalDesc}</span>
                  </button>
                </div>
              </div>

              {/* Terms Agreement Checkbox */}
              <div className="flex items-start gap-2 pt-1 text-xs text-slate-300">
                <input
                  type="checkbox"
                  id="terms-check"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="terms-check" className="cursor-pointer">
                  {t.checkout.termsAgreement}
                </label>
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
                onClick={handleCreateGuestOrder}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t.checkout.validatingServer}</span>
                  </>
                ) : (
                  <>
                    <span>{t.checkout.generateInvoice}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </div>
          ) : (
            /* Step 2: Payment Details Screen */
            <div className="space-y-6">
              
              {/* Order Reference Pill */}
              <div className="flex items-center justify-between bg-[#070b14] p-3 rounded-xl border border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-400">{t.checkout.orderReference}:</span>
                  <span className="text-white font-bold ml-2">{createdOrder.order_number}</span>
                </div>
                <div>
                  <span className="text-slate-400">{t.checkout.amountDue}:</span>
                  <span className="text-white font-bold ml-2">${(createdOrder.total_cents / 100).toFixed(2)} USD</span>
                </div>
              </div>

              {/* Bank Transfer Instructions */}
              {paymentMethod === 'bank_transfer' && (
                <div className="space-y-4">
                  <div className="bg-[#070b14] rounded-2xl p-4 border border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block font-mono">
                      Bank Central Asia (BCA)
                    </span>
                    <div className="flex items-center justify-between text-xs bg-[#0b1120] p-3 rounded-xl border border-slate-800">
                      <div>
                        <div className="font-mono text-white font-bold">{config?.bank_bca_account || '8040-192-384'}</div>
                        <div className="text-[11px] text-slate-400">{config?.bank_bca_holder || 'PT AEMETH TRADER ANALISIS'}</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(config?.bank_bca_account || '8040-192-384', 'bca')}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg flex items-center gap-1 cursor-pointer font-mono"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{isCopied === 'bca' ? t.checkout.copied : t.checkout.copy}</span>
                      </button>
                    </div>

                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block pt-2 font-mono">
                      Bank Mandiri
                    </span>
                    <div className="flex items-center justify-between text-xs bg-[#0b1120] p-3 rounded-xl border border-slate-800">
                      <div>
                        <div className="font-mono text-white font-bold">{config?.bank_mandiri_account || '137-00-9821-441'}</div>
                        <div className="text-[11px] text-slate-400">{config?.bank_mandiri_holder || 'PT AEMETH TRADER ANALISIS'}</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(config?.bank_mandiri_account || '137-00-9821-441', 'mandiri')}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg flex items-center gap-1 cursor-pointer font-mono"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{isCopied === 'mandiri' ? t.checkout.copied : t.checkout.copy}</span>
                      </button>
                    </div>
                  </div>

                  {/* Receipt Upload Dropzone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      {t.checkout.uploadReceiptTitle}
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={handleSubmitBankReceipt}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-full shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>{t.checkout.confirmBankPayment}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Crypto Deposit Instructions */}
              {paymentMethod === 'crypto' && (
                <div className="space-y-4">
                  <div className="bg-[#070b14] rounded-2xl p-4 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      {['USDT-TRC20', 'USDT-ERC20', 'BTC'].map((coin) => (
                        <button
                          key={coin}
                          type="button"
                          onClick={() => setCryptoAsset(coin)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer font-mono ${
                            cryptoAsset === coin
                              ? 'bg-blue-950 border-blue-500 text-blue-300'
                              : 'bg-black/40 border-slate-800 text-slate-400'
                          }`}
                        >
                          {coin}
                        </button>
                      ))}
                    </div>

                    <div className="text-xs bg-[#0b1120] p-3 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {t.checkout.cryptoDestinationTitle}:
                      </span>
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
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg shrink-0 flex items-center gap-1 cursor-pointer font-mono"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{isCopied === 'crypto' ? t.checkout.copied : t.checkout.copy}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      {t.checkout.cryptoTxidLabel}
                    </label>
                    <input
                      type="text"
                      value={cryptoTxid}
                      onChange={(e) => setCryptoTxid(e.target.value)}
                      placeholder={t.checkout.cryptoTxidPlaceholder}
                      className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <button
                    onClick={handleSubmitCryptoTxid}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-full shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>{t.checkout.confirmCryptoPayment}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* PayPal processing */}
              {paymentMethod === 'paypal' && (
                <div className="text-center py-6 space-y-3">
                  <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-300 font-light">
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
