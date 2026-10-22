import React from 'react';
import { X, ShieldCheck, Check, Code, Lock, Layers, Zap, AlertTriangle, ArrowRight, BookOpen } from 'lucide-react';
import type { Product } from '../types/marketplace';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onBuy: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onBuy,
}) => {
  if (!product) return null;

  const isOpenSource = product.type === 'open_source';
  const isPrivate = product.type === 'private_protected';
  const isBundle = product.type === 'bundle';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0e0e15] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-red-950/50 my-8">
        
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#14141d]/80">
          <div className="flex items-center gap-2">
            {isOpenSource && (
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                <Code className="w-3 h-3" /> Open-Source Pine Script v5
              </span>
            )}
            {isPrivate && (
              <span className="px-3 py-1 rounded-full bg-red-950/80 border border-red-500/30 text-[10px] font-bold text-red-300 flex items-center gap-1">
                <Lock className="w-3 h-3" /> TradingView Invite-Only Access
              </span>
            )}
            {isBundle && (
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-extrabold flex items-center gap-1">
                <Layers className="w-3 h-3" /> Institutional Suite (All 4 Included)
              </span>
            )}
            <span className="text-xs font-mono text-zinc-400">v{product.version}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Header Image & Title */}
          <div className="relative h-56 rounded-2xl overflow-hidden border border-white/10 bg-black">
            <img
              src={product.thumbnail_url}
              alt={product.title}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e15] via-transparent to-black/30"></div>
            
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                {product.title}
              </h2>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">
              Technical Description & Overview
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed font-light">
              {product.long_desc}
            </p>
          </div>

          {/* Anti-Repaint Directives Alert */}
          <div className="rounded-2xl bg-gradient-to-r from-red-950/40 via-[#14141c] to-[#0e0e15] border border-red-500/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-red-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>CORE ARCHITECTURAL DIRECTIVE: CANDLE 1 ZERO-REPAINT</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Every signal and mathematical structure is anchored strictly to closed historical bars (bar [1]). Signals will <strong>never repaint, shift, or disappear</strong> after candle close.
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Key Capabilities & Included Features
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {product.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2 bg-[#14141c] border border-white/5 rounded-xl p-3 text-xs text-zinc-200">
                  <Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Access Flow Explanation */}
          <div className="rounded-2xl bg-[#14141c] border border-white/5 p-4 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>How You Will Receive This Product</span>
            </h4>
            {isOpenSource && (
              <p className="text-xs text-zinc-300 leading-relaxed">
                Immediately following payment verification, uncompiled <strong>.pine</strong> and <strong>.txt</strong> source code files unlock in your customer dashboard. You can copy the raw code or download the file directly into your TradingView Pine Editor.
              </p>
            )}
            {isPrivate && (
              <p className="text-xs text-zinc-300 leading-relaxed">
                During checkout or inside your customer dashboard, provide your <strong>TradingView username</strong>. Our institutional administrator will authorize your username for private invite-only script access within TradingView. You will find the indicator directly in your TradingView "Invite-Only Scripts" tab.
              </p>
            )}
            {isBundle && (
              <p className="text-xs text-zinc-300 leading-relaxed">
                This comprehensive bundle provisions all 4 flagship indicators simultaneously. You receive full open-source Pine Script files for the public components, plus authorized TradingView invite access for the protected volume and reversal engines.
              </p>
            )}
          </div>

          {/* Risk Disclaimer */}
          <div className="flex items-start gap-2.5 text-[11px] text-zinc-400 bg-black/40 p-3 rounded-xl border border-white/5">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong>Regulatory Risk Disclosure:</strong> All trading involves substantial financial risk. Aemeth Trader Analysis tools are technical analytical indicators designed to assist trade decision-making and do not constitute financial advice or guarantees of profit.
            </p>
          </div>

        </div>

        {/* Modal Footer / Checkout CTA */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-[#14141d]/90">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-heading text-white">
                ${(product.price_cents / 100).toFixed(0)}
              </span>
              <span className="text-xs font-mono text-zinc-400">USD</span>
              {product.discount_cents ? (
                <span className="text-xs line-through text-zinc-400 font-mono ml-2">
                  ${((product.price_cents + product.discount_cents) / 100).toFixed(0)}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
              <Check className="w-3 h-3" /> One-Time Payment • Lifetime Access
            </span>
          </div>

          <button
            onClick={() => {
              onClose();
              onBuy(product);
            }}
            className="flex items-center gap-2 bg-[#ff2a3b] hover:bg-[#e02434] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full shadow-xl shadow-red-500/30 hover:shadow-red-500/50 transition-all cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
