import React from 'react';
import { ArrowRight, Check, Code, ShieldCheck, Zap, Lock, Terminal } from 'lucide-react';

interface BentoFeaturesProps {
  onExplore: () => void;
}

export const BentoFeatures: React.FC<BentoFeaturesProps> = ({ onExplore }) => {
  return (
    <section className="w-full py-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Editorial Statement directly styled like reference */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-400 uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            About Aemeth Analytical Logic
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-white leading-snug">
            We <span className="text-red-500">design and deploy indicators</span> with mathematical edge at the core, ensuring every <span className="text-red-500">signal delivers actionable execution</span>.
          </h2>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card 1: Large Featured Card */}
          <div className="lg:col-span-7 bg-[#101016]/80 backdrop-blur-xl border border-white/8 rounded-3xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden relative group hover:border-red-500/30 transition-all shadow-xl">
            {/* Ambient subtle red corner glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-4 relative z-10">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                Engineered for High-Conviction Setups
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white">
                Institutional Liquidity & Order Flow Suite
              </h3>
              <p className="text-sm text-zinc-400 max-w-md">
                No lagging indicators. Powered by real session liquidity pools, fair value gap imbalances, and candle-close anti-repaint execution.
              </p>
              <div>
                <button
                  onClick={onExplore}
                  className="inline-flex items-center gap-2 bg-[#1b1b24] hover:bg-[#252533] text-white text-xs font-bold px-4 py-2 rounded-full border border-white/10 transition-colors"
                >
                  <span>Explore Open-Source & Private</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dark Chart / Code Preview Frame */}
            <div className="mt-8 rounded-2xl overflow-hidden border border-red-500/20 bg-[#09090e] p-4 relative shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 text-[11px] font-mono text-zinc-400">
                <span className="text-red-400 flex items-center gap-1.5">
                  <Terminal className="w-3 h-3" /> AEMETH_LIQUIDITY_MATRIX.pine
                </span>
                <span className="text-zinc-400">Candle 1 Locked (Fixed Closed Bar)</span>
              </div>
              <div className="pt-3 font-mono text-[11px] text-zinc-300 space-y-1 overflow-x-auto">
                <div className="text-zinc-400">// Strict Anti-Repaint Rule: Calculate only on bar [1]</div>
                <div><span className="text-red-400">closed_high</span> = high[1]</div>
                <div><span className="text-red-400">closed_low</span> = low[1]</div>
                <div><span className="text-emerald-400">bullish_fvg</span> = closed_low &gt; high[3]</div>
                <div className="text-zinc-300">if bullish_fvg: box.new(left=bar_index[2], top=closed_low, bgcolor=#10b981)</div>
              </div>
            </div>

          </div>

          {/* Right Column Stack */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Metric Card */}
            <div className="bg-[#101016]/80 backdrop-blur-xl border border-white/8 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-red-500/30 transition-all shadow-xl">
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed">
                  Trusted by 120+ prop traders across 4 asset classes — shipping institutional setups from 1m to 4h.
                </p>
                <div className="flex items-center gap-1 text-red-500 text-xs">
                  {'★'.repeat(5)}
                </div>
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold font-heading text-white pt-4">
                120+
                <span className="text-xs font-normal text-zinc-400 block font-sans mt-1">
                  Active Prop Traders Passing Challenges
                </span>
              </div>
            </div>

            {/* Testimonial Card directly mirroring reference layout */}
            <div className="bg-[#101016]/80 backdrop-blur-xl border border-white/8 rounded-3xl p-6 flex items-center gap-4 hover:border-red-500/30 transition-all shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-zinc-800 p-0.5 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Trader"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              <div className="space-y-1">
                <span className="text-xl text-red-400 font-serif leading-none block">“</span>
                <p className="text-xs text-zinc-300 leading-snug">
                  Good indicators feel obvious — because the algorithmic noise is filtered out.
                </p>
                <span className="text-[11px] text-zinc-400 block pt-1 font-mono">
                  Alexander Vance | Senior Prop Trader
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Brand / Platform Logos Ribbon */}
        <div className="pt-6 pb-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
          <span className="text-xs font-mono text-zinc-400">ECOSYSTEM & COMPATIBILITY:</span>
          <span className="text-sm font-bold tracking-wider text-zinc-300">TRADINGVIEW</span>
          <span className="text-sm font-bold tracking-wider text-zinc-300">PINE SCRIPT v5</span>
          <span className="text-sm font-bold tracking-wider text-zinc-300">FTMO</span>
          <span className="text-sm font-bold tracking-wider text-zinc-300">IC MARKETS</span>
          <span className="text-sm font-bold tracking-wider text-zinc-300">BYBIT</span>
          <span className="text-sm font-bold tracking-wider text-zinc-300">BINANCE</span>
        </div>

      </div>
    </section>
  );
};
