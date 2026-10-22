import React from 'react';
import { X, ShieldCheck, Check, Code, Lock, Layers, Zap, AlertTriangle, ArrowRight } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
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
  const { t, lang } = useTranslation();
  if (!product) return null;

  const isOpenSource = product.type === 'open_source';
  const isPrivate = product.type === 'private_protected';
  const isBundle = product.type === 'bundle';

  const title = lang === 'id' ? product.title_id || product.title : product.title_en || product.title;
  const longDesc = lang === 'id' ? product.long_desc_id || product.long_desc : product.long_desc_en || product.long_desc;
  const features = (lang === 'id' ? product.features_id || product.features : product.features_en || product.features) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0b1120] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070b14]">
          <div className="flex items-center gap-2">
            {isOpenSource && (
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 flex items-center gap-1 font-mono">
                <Code className="w-3 h-3" /> {t.productDetail.openSourceBadge}
              </span>
            )}
            {isPrivate && (
              <span className="px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-[10px] font-bold text-blue-300 flex items-center gap-1 font-mono">
                <Lock className="w-3 h-3" /> {t.productDetail.privateBadge}
              </span>
            )}
            {isBundle && (
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold flex items-center gap-1 font-mono">
                <Layers className="w-3 h-3" /> {t.productDetail.bundleBadge}
              </span>
            )}
            <span className="text-xs font-mono text-slate-400">v{product.version}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Header Image & Title */}
          <div className="relative h-56 rounded-2xl overflow-hidden border border-slate-800 bg-black">
            <img
              src={product.thumbnail_url}
              alt={title}
              className="w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-black/30"></div>
            
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                {title}
              </h2>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
              {t.productDetail.technicalOverview}
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed font-light">
              {longDesc}
            </p>
          </div>

          {/* Anti-Repaint Directive Alert */}
          <div className="rounded-2xl bg-[#070b14] border border-emerald-500/30 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t.productDetail.antiRepaintDirectiveTitle}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              {t.productDetail.antiRepaintDirectiveDesc}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              {t.productDetail.keyFeatures}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2 bg-[#070b14] border border-slate-800 rounded-xl p-3 text-xs text-slate-200">
                  <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Method Explanation */}
          <div className="rounded-2xl bg-[#070b14] border border-slate-800 p-4 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-heading">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>{t.productDetail.deliveryMethodTitle}</span>
            </h4>
            {isOpenSource && (
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                {t.productDetail.openSourceDeliveryDesc}
              </p>
            )}
            {isPrivate && (
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                {t.productDetail.privateDeliveryDesc}
              </p>
            )}
            {isBundle && (
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                {t.productDetail.bundleDeliveryDesc}
              </p>
            )}
          </div>

          {/* Risk Disclaimer */}
          <div className="flex items-start gap-2.5 text-[11px] text-slate-400 bg-black/40 p-3 rounded-xl border border-slate-800">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong>{t.productDetail.riskDisclaimerTitle}:</strong> {t.productDetail.riskDisclaimerDesc}
            </p>
          </div>

        </div>

        {/* Modal Footer / Checkout CTA */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-[#070b14]">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-heading text-white">
                ${(product.price_cents / 100).toFixed(0)}
              </span>
              <span className="text-xs font-mono text-slate-400">USD</span>
              {product.discount_cents ? (
                <span className="text-xs line-through text-slate-500 font-mono ml-2">
                  ${((product.price_cents + product.discount_cents) / 100).toFixed(0)}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
              <Check className="w-3 h-3" /> {t.productDetail.pricingLabel}
            </span>
          </div>

          <button
            onClick={() => {
              onClose();
              onBuy(product);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            <span>{t.productDetail.proceedToCheckout}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
