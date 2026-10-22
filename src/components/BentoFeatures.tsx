import React from 'react';
import { ArrowRight, ShieldCheck, Code, Lock, Terminal, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface BentoFeaturesProps {
  onExplore: () => void;
}

export const BentoFeatures: React.FC<BentoFeaturesProps> = ({ onExplore }) => {
  const { t } = useTranslation();

  return (
    <section className="w-full py-14 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Editorial Statement */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            {t.bento.sectionTag}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-white leading-snug">
            {t.bento.quoteTitle} <span className="text-blue-400">{t.bento.quoteHighlight1}</span> {t.bento.quoteHighlight2}
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card 1: Large Featured Card */}
          <div className="lg:col-span-7 bg-[#0b1120] border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden relative shadow-xl hover:border-blue-500/30 transition-all">
            <div className="space-y-4 relative z-10">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {t.bento.card1Badge}
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white">
                {t.bento.card1Title}
              </h3>
              <p className="text-sm text-slate-400 max-w-md leading-relaxed font-light">
                {t.bento.card1Desc}
              </p>
              <div>
                <button
                  onClick={onExplore}
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-full border border-slate-700 transition-colors cursor-pointer"
                >
                  <span>{t.bento.card1Cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Code preview block */}
            <div className="mt-8 rounded-2xl overflow-hidden border border-slate-800 bg-[#070b14] p-4 relative shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                <span className="text-blue-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> AEMETH_LIQUIDITY_MATRIX.pine
                </span>
                <span className="text-slate-400">TradingView v5</span>
              </div>
              <div className="pt-3 font-mono text-[11px] text-slate-300 space-y-1 overflow-x-auto">
                <div className="text-slate-500">// Fixed Closed Bar confirmation (Prevents Candle 0 repaint)</div>
                <div><span className="text-blue-400">closed_high</span> = high[1]</div>
                <div><span className="text-blue-400">closed_low</span> = low[1]</div>
                <div><span className="text-emerald-400">bullish_fvg</span> = closed_low &gt; high[3]</div>
                <div className="text-slate-300">if show_fvg and bullish_fvg: box.new(left=bar_index[2], top=closed_low, bgcolor=#10b981)</div>
              </div>
            </div>

          </div>

          {/* Right Column Stack */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Metric Card */}
            <div className="bg-[#0b1120] border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl hover:border-blue-500/30 transition-all">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.bento.card2Subtitle}</span>
                </span>
                <h4 className="text-xl font-bold font-heading text-white">
                  {t.bento.card2Title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  {t.bento.card2Desc}
                </p>
              </div>
            </div>

            {/* Product Type Transparency Card */}
            <div className="bg-[#0b1120] border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl hover:border-blue-500/30 transition-all">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-blue-400 flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  <span>Open-Source & Invite-Only</span>
                </span>
                <h4 className="text-xl font-bold font-heading text-white">
                  {t.bento.card3Title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  {t.bento.card3Desc}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Compatibility Ribbon */}
        <div className="pt-6 pb-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-6 opacity-75">
          <span className="text-xs font-mono text-slate-400">{t.bento.ecosystemTitle}</span>
          <span className="text-sm font-bold tracking-wider text-slate-300 font-mono">TRADINGVIEW (v5 & v6)</span>
          <span className="text-sm font-bold tracking-wider text-slate-300 font-mono">PINE SCRIPT</span>
          <span className="text-sm font-bold tracking-wider text-slate-300 font-mono">FOREX & GOLD</span>
          <span className="text-sm font-bold tracking-wider text-slate-300 font-mono">CRYPTO (BINANCE/BYBIT)</span>
          <span className="text-sm font-bold tracking-wider text-slate-300 font-mono">STOCK INDICES</span>
        </div>

      </div>
    </section>
  );
};
