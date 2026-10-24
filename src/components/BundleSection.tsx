import React, { useState, useMemo } from 'react';
import { Layers, Check, Sparkles, Shield, ArrowRight, Info, AlertCircle } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { calculateBundlePrice, BUNDLE_DEFINITIONS, isLaunchPromoActive } from '../config/pricing';
import { formatIdr } from '../utils/currency';
import type { Product } from '../types/marketplace';

interface BundleSectionProps {
  products: Product[];
  onCheckoutBundle: (bundleType: 'starter' | 'pro' | 'ultimate', selectedProductIds: string[]) => void;
}

export const BundleSection: React.FC<BundleSectionProps> = ({ products, onCheckoutBundle }) => {
  const { t, lang } = useTranslation();
  const [activeBundle, setActiveBundle] = useState<'starter' | 'pro' | 'ultimate'>('ultimate');

  // Filter only single indicators
  const singleProducts = useMemo(() => {
    return products.filter((p) => p.type !== 'bundle');
  }, [products]);

  const allProductIds = useMemo(() => {
    return singleProducts.map((p) => p.id);
  }, [singleProducts]);

  // Selections for custom bundles
  const [starterSelection, setStarterSelection] = useState<string[]>(() => {
    return allProductIds.slice(0, 2);
  });

  const [proSelection, setProSelection] = useState<string[]>(() => {
    return allProductIds.slice(0, 3);
  });

  const currentSelection = useMemo(() => {
    if (activeBundle === 'starter') return starterSelection;
    if (activeBundle === 'pro') return proSelection;
    return allProductIds;
  }, [activeBundle, starterSelection, proSelection, allProductIds]);

  const requiredCount = activeBundle === 'starter' ? 2 : activeBundle === 'pro' ? 3 : allProductIds.length;

  const toggleProduct = (id: string) => {
    if (activeBundle === 'ultimate') return; // All always included in ultimate

    if (activeBundle === 'starter') {
      if (starterSelection.includes(id)) {
        if (starterSelection.length > 1) {
          setStarterSelection(starterSelection.filter((item) => item !== id));
        }
      } else {
        if (starterSelection.length < 2) {
          setStarterSelection([...starterSelection, id]);
        } else {
          // Replace second item
          setStarterSelection([starterSelection[0], id]);
        }
      }
    } else if (activeBundle === 'pro') {
      if (proSelection.includes(id)) {
        if (proSelection.length > 1) {
          setProSelection(proSelection.filter((item) => item !== id));
        }
      } else {
        if (proSelection.length < 3) {
          setProSelection([...proSelection, id]);
        } else {
          // Replace third item
          setProSelection([proSelection[0], proSelection[1], id]);
        }
      }
    }
  };

  // Calculate live bundle price
  const bundleCalc = useMemo(() => {
    return calculateBundlePrice(activeBundle, currentSelection);
  }, [activeBundle, currentSelection]);

  const promoActive = isLaunchPromoActive();

  const handleBuy = () => {
    if (!bundleCalc.isValid) return;
    onCheckoutBundle(activeBundle, currentSelection);
  };

  return (
    <div id="bundle-builder" className="w-full bg-[#0b1120] border border-blue-500/30 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl space-y-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="space-y-3 relative z-10 text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-400 text-xs font-bold font-mono tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          {t.bundles.sectionTag}
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-white tracking-tight">
          {t.bundles.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
          {t.bundles.subtitle}
        </p>
      </div>

      {/* Bundle Tab Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10 max-w-4xl mx-auto">
        {(['starter', 'pro', 'ultimate'] as const).map((type) => {
          const isSelected = activeBundle === type;
          const def = BUNDLE_DEFINITIONS[type];
          const discountLabel = `-${Math.round(def.discountRate * 100)}%`;

          return (
            <button
              key={type}
              type="button"
              onClick={() => setActiveBundle(type)}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-blue-950/70 border-blue-500 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-500'
                  : 'bg-[#070b14]/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-heading font-extrabold text-sm sm:text-base text-white flex items-center gap-1.5">
                  <Layers className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                  {type === 'starter' ? t.bundles.starterTitle : type === 'pro' ? t.bundles.proTitle : t.bundles.ultimateTitle}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[11px] font-mono font-bold">
                  {discountLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {type === 'starter' ? t.bundles.starterDesc : type === 'pro' ? t.bundles.proDesc : t.bundles.ultimateDesc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Interactive Product Picker & Real-time Calculation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        
        {/* Left: Product Selector Checklist */}
        <div className="lg:col-span-7 bg-[#070b14] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold font-heading text-white">
                {t.bundles.selectPrompt}
              </h3>
              <p className="text-xs text-slate-400">
                {activeBundle === 'starter' && t.bundles.twoRequired}
                {activeBundle === 'pro' && t.bundles.threeRequired}
                {activeBundle === 'ultimate' && t.bundles.allIncluded}
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800/80 text-blue-300 font-bold border border-slate-700">
              {currentSelection.length} / {requiredCount} {lang === 'id' ? 'Dipilih' : 'Selected'}
            </span>
          </div>

          <div className="space-y-2.5">
            {singleProducts.map((product) => {
              const isSelected = currentSelection.includes(product.id);
              const isDisabled = activeBundle === 'ultimate';

              const title = lang === 'id' ? product.title_id || product.title : product.title_en || product.title;
              const priceIdr = product.price_idr || 149000;
              const normalPriceIdr = product.normal_price_idr || 199000;

              return (
                <div
                  key={product.id}
                  onClick={() => !isDisabled && toggleProduct(product.id)}
                  className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500/50 text-white'
                      : 'bg-black/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                  } ${isDisabled ? 'cursor-default opacity-95' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-700 bg-black/60'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <img
                      src={product.thumbnail_url}
                      alt={title}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0"
                    />

                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-semibold text-white block truncate">
                        {title}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        v{product.version} • Pine v5
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-bold font-mono text-white block">
                      {formatIdr(priceIdr)}
                    </span>
                    {promoActive && normalPriceIdr > priceIdr && (
                      <span className="text-[10px] font-mono text-slate-500 line-through block">
                        {formatIdr(normalPriceIdr)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* License & Update terms banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs text-slate-400 leading-relaxed">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p>{t.bundles.licenseNotice}</p>
          </div>
        </div>

        {/* Right: Transparent Price Breakdown & Checkout Card */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#0b1120] to-[#070b14] border border-blue-500/40 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl sticky top-24">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold block mb-1">
              {lang === 'id' ? 'Rincian Perhitungan Transparan' : 'Transparent Pricing Breakdown'}
            </span>
            <h3 className="text-xl font-extrabold font-heading text-white">
              {activeBundle === 'starter' ? t.bundles.starterTitle : activeBundle === 'pro' ? t.bundles.proTitle : t.bundles.ultimateTitle}
            </h3>
          </div>

          {/* Price Breakdown Rows */}
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span>{t.bundles.normalTotal}</span>
              <span className="font-mono text-slate-300">
                {formatIdr(bundleCalc.totalNormalPriceIdr)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>{t.bundles.promoSubtotal}</span>
              <span className="font-mono text-slate-300">
                {formatIdr(bundleCalc.subtotalEffectiveIdr)}
              </span>
            </div>

            <div className="flex items-center justify-between text-emerald-400 font-semibold">
              <span className="flex items-center gap-1">
                <span>{t.bundles.bundleDiscount}</span>
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/30">
                  -{Math.round(bundleCalc.bundleDiscountRate * 100)}%
                </span>
              </span>
              <span className="font-mono">
                -{formatIdr(bundleCalc.bundleDiscountAmountIdr)}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-heading uppercase tracking-wider">
                  {t.bundles.totalDue}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {lang === 'id' ? 'Dibulatkan ke ribuan' : 'Rounded to nearest thousand'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                  {formatIdr(bundleCalc.finalPriceIdr)}
                </span>
              </div>
            </div>

            {/* Total Savings Pill */}
            {bundleCalc.totalSavingsIdr > 0 && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-emerald-300 text-xs">
                <span className="flex items-center gap-1.5 font-bold">
                  <Check className="w-4 h-4 text-emerald-400" />
                  {t.bundles.totalSavings}
                </span>
                <span className="font-mono font-extrabold text-sm">
                  {formatIdr(bundleCalc.totalSavingsIdr)} ({bundleCalc.totalSavingsPercent}%)
                </span>
              </div>
            )}
          </div>

          {/* Validation Error if any */}
          {!bundleCalc.isValid && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{bundleCalc.error}</span>
            </div>
          )}

          {/* Checkout CTA */}
          <button
            type="button"
            disabled={!bundleCalc.isValid}
            onClick={handleBuy}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{t.bundles.checkoutBundle}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Guarantee Banner */}
          <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {lang === 'id' 
                ? 'Paket bundling dijamin tidak pernah lebih mahal dari harga satuan.'
                : 'Bundle packages are guaranteed never to exceed individual prices.'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
