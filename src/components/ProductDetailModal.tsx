import React, { useState } from 'react';
import { X, ShieldCheck, Check, Code, Lock, Layers, Zap, AlertTriangle, ArrowRight, GitCommit, Calendar, Cpu, ChevronDown, Package, ListChecks } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { getPriceAmount } from '../utils/currency';
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

          {/* Specifications & Compatibility Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#070b14] border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Version</span>
              <span className="text-xs font-bold font-mono text-white flex items-center gap-1">
                <GitCommit className="w-3.5 h-3.5 text-blue-400" />
                v{product.version}
              </span>
            </div>

            <div className="bg-[#070b14] border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Pine Script</span>
              <span className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" />
                {product.pine_version || 'Pine v5'}
              </span>
            </div>

            <div className="bg-[#070b14] border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Release Date</span>
              <span className="text-xs font-bold font-mono text-slate-200 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {product.release_date || '2025-01-15'}
              </span>
            </div>

            <div className="bg-[#070b14] border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Platform</span>
              <span className="text-xs font-bold font-mono text-blue-300 truncate">
                TradingView Free/Pro
              </span>
            </div>
          </div>

          {/* Compatibility Notes */}
          {product.compatibility && (
            <div className="text-xs bg-[#070b14] border border-slate-800/80 rounded-xl p-3.5 text-slate-300 space-y-1">
              <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block">
                {lang === 'id' ? 'Catatan Kompatibilitas' : 'Compatibility Notes'}
              </span>
              <p className="font-light leading-relaxed">{product.compatibility}</p>
            </div>
          )}

          {/* Changelog Accordion */}
          {product.changelog && product.changelog.length > 0 && (
            <div className="bg-[#070b14] border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                <GitCommit className="w-3.5 h-3.5 text-blue-400" />
                <span>{lang === 'id' ? 'Riwayat Versi (Changelog)' : 'Version Changelog'}</span>
              </h4>
              <div className="space-y-2">
                {product.changelog.map((entry, idx) => (
                  <div key={idx} className="border-l-2 border-blue-500/40 pl-3 py-0.5">
                    <span className="text-xs font-mono text-slate-300 leading-relaxed block">
                      {entry}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Technical Specs List */}
          {((lang === 'id' ? product.technical_specs_id || product.technical_specs : product.technical_specs_en || product.technical_specs) || []).length > 0 && (
            <div className="bg-[#070b14] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-blue-400" />
                <span>{lang === 'id' ? 'Spesifikasi Teknis' : 'Technical Specifications'}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {(lang === 'id' ? product.technical_specs_id || product.technical_specs : product.technical_specs_en || product.technical_specs)?.map((spec, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#0b1120] p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 font-medium">{spec.label}</span>
                    <strong className="text-white font-mono text-[11px] text-right">{spec.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Yang Kamu Dapatkan (What You Get) */}
          {((lang === 'id' ? product.package_includes_id || product.package_includes : product.package_includes_en || product.package_includes) || []).length > 0 && (
            <div className="bg-[#070b14] border border-blue-500/20 rounded-2xl p-4 sm:p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 font-mono flex items-center gap-1.5">
                <Package className="w-4 h-4 text-blue-400" />
                <span>{lang === 'id' ? 'Yang Kamu Dapatkan' : 'What You Receive'}</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-200">
                {(lang === 'id' ? product.package_includes_id || product.package_includes : product.package_includes_en || product.package_includes)?.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{inc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

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

          {/* Catatan / Risk Disclaimer */}
          <div className="flex items-start gap-2.5 text-[11px] text-slate-300 bg-black/40 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5 font-heading">{lang === 'id' ? 'Catatan Penting:' : 'Important Notice:'}</strong>
              <p>
                {lang === 'id'
                  ? 'Indikator ini merupakan alat bantu analisis teknikal dan tidak menjamin keuntungan. Selalu lakukan pengujian serta pengelolaan risiko secara mandiri. Source code diberikan sesuai ketentuan lisensi produk Aemeth. Dilarang mendistribusikan ulang atau menjual kembali kode tanpa izin.'
                  : 'This indicator is a technical analysis visualization tool and does not guarantee financial profit. Always conduct your own backtesting and apply prudent risk management. Source code is licensed for single-user personal use; unauthorized redistribution or resale is prohibited.'}
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer / Checkout CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 sm:px-6 py-4 border-t border-slate-800 bg-[#070b14] gap-3">
          <div>
            {(() => {
              const pInfo = getPriceAmount(product.price_cents, lang, product.price_idr);
              return (
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                    {pInfo.amount}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{pInfo.currency}</span>
                  {product.discount_cents ? (
                    <span className="text-xs line-through text-slate-500 font-mono ml-2">
                      {lang === 'id' && product.discount_idr && product.price_idr
                        ? `Rp ${(product.price_idr + product.discount_idr).toLocaleString('id-ID')}`
                        : `$${((product.price_cents + product.discount_cents) / 100).toFixed(0)}`}
                    </span>
                  ) : null}
                </div>
              );
            })()}
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
              <Check className="w-3 h-3" /> {t.productDetail.pricingLabel}
            </span>
          </div>

          <button
            onClick={() => {
              onClose();
              onBuy(product);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            <span>{t.productDetail.proceedToCheckout}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
