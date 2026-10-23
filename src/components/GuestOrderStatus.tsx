import React, { useState, useEffect } from 'react';
import { 
  Search, ShieldCheck, Clock, CheckCircle2, AlertCircle, Copy, Check, Download, 
  Terminal, Lock, Code, ExternalLink, HelpCircle, ArrowRight, BookOpen, MessageCircle, Send, FileText
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { formatPriceExact } from '../utils/currency';
import type { Order } from '../types/marketplace';

interface GuestOrderStatusProps {
  initialOrderNumber?: string;
  initialToken?: string;
  onNavigateToGuide?: (context?: { title: string; orderNumber?: string }) => void;
}

export const GuestOrderStatus: React.FC<GuestOrderStatusProps> = ({
  initialOrderNumber = '',
  initialToken = '',
  onNavigateToGuide,
}) => {
  const { t, lang } = useTranslation();
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [accessToken, setAccessToken] = useState(initialToken);
  const [isSearching, setIsSearching] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Source code state
  const [activePineScript, setActivePineScript] = useState<{ title: string; code: string; filename: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedOrderRef, setCopiedOrderRef] = useState(false);

  useEffect(() => {
    // If order number provided in props or session, auto-fetch
    if (initialOrderNumber) {
      handleLookup(initialOrderNumber, initialToken);
    } else {
      const saved = localStorage.getItem('aemeth_last_order');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.orderNumber) {
            setOrderNumber(parsed.orderNumber);
            setAccessToken(parsed.accessToken || '');
            handleLookup(parsed.orderNumber, parsed.accessToken);
          }
        } catch {}
      }
    }
  }, [initialOrderNumber, initialToken]);

  const handleLookup = async (lookupNum = orderNumber, lookupToken = accessToken) => {
    if (!lookupNum.trim()) return;
    setIsSearching(true);
    setNotFound(false);
    setOrder(null);
    setActivePineScript(null);

    try {
      const res = await api.getGuestOrder(lookupNum.trim(), lookupToken.trim());
      if (res.success && res.order) {
        setOrder(res.order);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewPineSource = async (productId: string) => {
    try {
      const res = await api.getDeliverySourceCode(productId);
      if (res.success) {
        setActivePineScript({
          title: res.product_title,
          filename: res.filename,
          code: res.pine_script_content,
        });
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDownloadPineBlob = (filename: string, code: string) => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyCode = () => {
    if (!activePineScript) return;
    navigator.clipboard.writeText(activePineScript.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyOrderRef = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.order_number);
    setCopiedOrderRef(true);
    setTimeout(() => setCopiedOrderRef(false), 2000);
  };

  return (
    <div className="w-full py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono">
          {t.orderStatus.title}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
          {t.orderStatus.lookupTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          {t.orderStatus.subtitle}
        </p>
      </div>

      {/* Lookup Card */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-6">
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              {t.checkout.orderReference} *
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. AEM-8931204"
              className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-6">
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Guest Access Token (Optional)
            </label>
            <input
              type="text"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="tok_guest_..."
              className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={() => handleLookup()}
          disabled={isSearching || !orderNumber.trim()}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSearching ? (
            <span>{t.orderStatus.searching}</span>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>{t.orderStatus.lookupButton}</span>
            </>
          )}
        </button>

        {/* Demo order quick hint */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-800/60">
          <span>{lang === 'id' ? 'Contoh order terverifikasi:' : 'Sample verified order:'}</span>
          <button
            onClick={() => {
              setOrderNumber('AEM-8931204');
              setAccessToken('tok_sample_verified_2026');
              handleLookup('AEM-8931204', 'tok_sample_verified_2026');
            }}
            className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
          >
            AEM-8931204
          </button>
        </div>
      </div>

      {notFound && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{t.orderStatus.orderNotFound}</span>
        </div>
      )}

      {/* Order Details & Digital Delivery View */}
      {order && (
        <div className="bg-[#0b1120] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {t.orderStatus.orderFoundTitle}
              </span>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold font-mono text-white">
                  {order.order_number}
                </h3>
                <button
                  onClick={copyOrderRef}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Copy Reference"
                >
                  {copiedOrderRef ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {new Date(order.created_at).toLocaleDateString()} • {order.customer_email}
              </p>
            </div>

            {/* Status Badge */}
            <div>
              {order.status === 'paid' && (
                <span className="px-4 py-2 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono flex items-center gap-1.5 shadow-md">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t.orderStatus.statusPaid}</span>
                </span>
              )}
              {order.status === 'verifying' && (
                <span className="px-4 py-2 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono flex items-center gap-1.5 shadow-md">
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>{t.orderStatus.statusVerifying}</span>
                </span>
              )}
              {order.status === 'pending' && (
                <span className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold font-mono flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{t.orderStatus.statusAwaiting}</span>
                </span>
              )}
              {order.status === 'cancelled' && (
                <span className="px-4 py-2 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold font-mono flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span>{t.orderStatus.statusCancelled}</span>
                </span>
              )}
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              {t.orderStatus.purchasedItems}
            </h4>

            <div className="space-y-3">
              {order.items?.map((item) => {
                const isOpenSource = item.product_type === 'open_source';
                const isPaid = order.status === 'paid';

                return (
                  <div
                    key={item.id}
                    className="p-5 bg-[#070b14] border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {isOpenSource ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 flex items-center gap-1 font-mono">
                            <Code className="w-3 h-3" /> Open-Source .pine
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-950/70 border border-blue-500/30 text-[10px] font-bold text-blue-300 flex items-center gap-1 font-mono">
                            <Lock className="w-3 h-3" /> TradingView Invite-Only
                          </span>
                        )}
                      </div>
                      <h5 className="text-base font-bold text-white font-heading">
                        {item.product_title}
                      </h5>
                      <span className="text-xs font-mono text-slate-400">
                        {formatPriceExact(item.unit_price_cents, lang)}
                      </span>
                    </div>

                    {/* Delivery Actions */}
                    <div>
                      {isPaid && isOpenSource && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewPineSource(item.product_id)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                          >
                            <Terminal className="w-3.5 h-3.5" />
                            <span>{t.orderStatus.viewSourceCode}</span>
                          </button>
                        </div>
                      )}

                      {isPaid && !isOpenSource && (
                        <div className="bg-blue-950/60 border border-blue-500/30 rounded-xl px-3.5 py-2 text-xs font-mono text-blue-300">
                          <span className="font-bold">{t.orderStatus.inviteStatusGranted}</span>
                          <span className="block text-[10px] text-slate-300 mt-0.5">
                            Username: {order.customer_tv_username || 'Submitted'}
                          </span>
                        </div>
                      )}

                      {!isPaid && (
                        <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                          {lang === 'id' ? 'Menunggu verifikasi pembayaran' : 'Awaiting payment verification'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Source Code Viewer */}
          {activePineScript && (
            <div className="rounded-2xl border border-blue-500/40 bg-[#05080f] overflow-hidden shadow-2xl space-y-0">
              <div className="px-5 py-3.5 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  <span>{activePineScript.filename}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyCode}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? t.checkout.copied : t.checkout.copy}</span>
                  </button>
                  <button
                    onClick={() => handleDownloadPineBlob(activePineScript.filename, activePineScript.code)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                    title="Download as TradingView .pine script"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>.pine</span>
                  </button>
                  <button
                    onClick={() => {
                      const txtFilename = activePineScript.filename.replace(/\.pine$/i, '') + '.txt';
                      handleDownloadPineBlob(txtFilename, activePineScript.code);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                    title="Download as standard plain text .txt"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>.txt</span>
                  </button>
                </div>
              </div>
              <div className="p-5 font-mono text-xs text-slate-200 bg-[#03060c] max-h-80 overflow-y-auto leading-relaxed">
                <pre className="whitespace-pre-wrap">{activePineScript.code}</pre>
              </div>
            </div>
          )}

          {/* Dedicated Installation Guide Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#070b14] to-[#0b1120] border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400">
                  <BookOpen className="w-4 h-4" />
                </span>
                <span className="font-bold text-white text-sm font-heading">
                  {lang === 'id' ? 'Panduan Instalasi TradingView Lengkap' : 'Complete TradingView Installation Guide'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {lang === 'id' 
                  ? 'Panduan 5 langkah membuka Pine Editor, menyimpan skrip, dan solusi compiler error (//@version=5, undeclared identifier).' 
                  : '5-step walkthrough to paste into Pine Editor, save your script, and resolve common compiler errors.'}
              </p>
            </div>
            {onNavigateToGuide && (
              <button
                onClick={() => onNavigateToGuide({
                  title: order.items?.[0]?.product_title || 'Aemeth Indicator',
                  orderNumber: order.order_number,
                })}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
              >
                <span>{lang === 'id' ? 'Buka Panduan Lengkap' : 'Open Full Guide'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Pine Editor Steps */}
          <div className="p-5 rounded-2xl bg-[#070b14] border border-slate-800 text-xs space-y-2">
            <span className="font-bold text-white block font-heading">
              {t.orderStatus.howToLoadTitle}
            </span>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              {t.orderStatus.howToLoadSteps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Safe WhatsApp & Telegram Installation Support */}
          {(() => {
            const firstItemTitle = order.items?.[0]?.product_title || 'Aemeth Indicator';
            const safeWaMessage = lang === 'id'
              ? `Halo Admin Aemeth, saya membutuhkan bantuan instalasi indikator Pine Script: ${firstItemTitle} (Order: ${order.order_number}).`
              : `Hello Aemeth Support, I need assistance installing the Pine Script indicator: ${firstItemTitle} (Order: ${order.order_number}).`;
            const waUrl = `https://wa.me/6282123456789?text=${encodeURIComponent(safeWaMessage)}`;
            const tgUrl = `https://t.me/aemethtrader?text=${encodeURIComponent(safeWaMessage)}`;

            return (
              <div className="p-5 rounded-2xl bg-[#070b14] border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-bold font-heading text-white flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                      <span>{t.installationGuide.needManualHelp}</span>
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {t.installationGuide.needManualHelpDesc}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0">
                    {t.orderStatus.supportHoursNotice}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp Support</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>

                  <a
                    href={tgUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-sky-400" />
                    <span>Telegram Support</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>

                  <a
                    href="mailto:support@aemethtrader.com"
                    className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Email Support</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </div>

                <p className="text-[10px] text-slate-400 italic">
                  * {t.installationGuide.supportNote}
                </p>
              </div>
            );
          })()}

        </div>
      )}

    </div>
  );
};
