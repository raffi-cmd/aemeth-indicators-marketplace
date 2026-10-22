import React from 'react';
import { ArrowRight, ShieldCheck, Code, Zap, Layers, Terminal } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface HeroProps {
  onExplore: () => void;
  onHowItWorks: () => void;
  onViewBundles?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore, onHowItWorks, onViewBundles }) => {
  const { t } = useTranslation();

  return (
    <section className="relative w-full pt-8 pb-16 overflow-hidden">
      {/* Subtle restrained ambient lighting */}
      <div className="absolute top-10 right-1/4 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-indigo-600/8 rounded-full blur-[150px] pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column (Editorial Headline & Value Pillars) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 bg-[#0b1120] border border-blue-500/30 rounded-full px-3.5 py-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300 font-mono">
                {t.hero.tag}
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.08] text-white">
                {t.hero.headlinePart1}
                <br />
                <span className="text-gradient-blue drop-shadow-sm">
                  {t.hero.headlinePart2}
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl pt-2 leading-relaxed font-light">
                {t.hero.description}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                onClick={onExplore}
                className="group flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-full px-6 py-3.5 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                <span>{t.hero.ctaPrimary}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onHowItWorks}
                className="flex items-center gap-2 bg-[#0b1120] hover:bg-slate-800 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold rounded-full px-5 py-3.5 border border-slate-700 hover:border-blue-500/40 transition-all cursor-pointer"
              >
                <span>{t.hero.ctaSecondary}</span>
              </button>
            </div>

            {/* 3 Value Pillars (Transparent & Factual) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 max-w-2xl">
              <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs font-mono mb-1">
                  <Code className="w-4 h-4" />
                  <span>{t.hero.pillar1Title}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {t.hero.pillar1Desc}
                </p>
              </div>

              <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs font-mono mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.hero.pillar2Title}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {t.hero.pillar2Desc}
                </p>
              </div>

              <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs font-mono mb-1">
                  <Zap className="w-4 h-4" />
                  <span>{t.hero.pillar3Title}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {t.hero.pillar3Desc}
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Clean Institutional Technical Preview Card */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            
            <div className="relative w-full max-w-[440px] rounded-3xl overflow-hidden border border-slate-800 bg-[#0b1120] p-6 shadow-2xl space-y-5">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                  </div>
                  <span className="text-xs font-mono text-slate-400 pl-2">
                    Aemeth_Engine_v5.pine
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-blue-950/80 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded">
                  PINE v5
                </span>
              </div>

              {/* Code Snippet Box */}
              <div className="bg-[#070b14] rounded-2xl p-4 border border-slate-800/80 font-mono text-[11px] space-y-1.5 text-slate-300">
                <div className="text-slate-500">// SECTION 2 DIRECTIVE: CANDLE 1 CLOSED BAR</div>
                <div><span className="text-blue-400">bar_closed</span> = barstate.isconfirmed</div>
                <div><span className="text-blue-400">c_high</span> = high[1], <span className="text-blue-400">c_low</span> = low[1]</div>
                <div className="text-emerald-400">fvg_bull = c_low &gt; high[3]</div>
                <div className="text-blue-300">plot(upper_liq, color=#3b82f6)</div>
                <div className="text-emerald-400">plot(lower_liq, color=#10b981)</div>
              </div>

              {/* Technical Specifications Summary */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="text-slate-400">Execution Engine:</span>
                  <strong className="text-white font-mono">Candle 1 Anti-Repaint</strong>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="text-slate-400">Supported Markets:</span>
                  <span className="text-slate-200 font-mono">Forex, Crypto, Indices</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="text-slate-400">Delivery Formats:</span>
                  <span className="text-blue-400 font-mono font-bold">.pine / Invite-Only</span>
                </div>
              </div>

              {/* Quick Action Button */}
              <button
                onClick={onExplore}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
              >
                <span>{t.hero.ctaPrimary}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
