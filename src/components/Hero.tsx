import React from 'react';
import { ArrowRight, ShieldCheck, Zap, TrendingUp, CheckCircle, Flame, Sparkles } from 'lucide-react';

interface HeroProps {
  onExplore: () => void;
  onViewBundles: () => void;
  onHowItWorks: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore, onViewBundles, onHowItWorks }) => {
  return (
    <section className="relative w-full pt-6 pb-16 overflow-hidden">
      {/* Background ambient radial red glows */}
      <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-[#ff2a3b]/15 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="absolute top-80 left-1/4 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[160px] pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Split: Left Content, Right Bioluminescent Visual Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column (Editorial Headline & Metrics) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 bg-[#171720]/80 backdrop-blur-md border border-red-500/30 rounded-full px-3.5 py-1 shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#ff2a3b] animate-ping"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-300">
                Institutional TradingView Marketplace
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.08] text-white">
                Trade With Clarity.
                <br />
                <span className="text-gradient-red drop-shadow-sm">
                  Analyze With Precision.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 max-w-xl pt-2 leading-relaxed font-light">
                Institutional Pine Script v5 indicators, quantitative order block visualizers, and protected multi-timeframe engines. Clean algorithmic signals with <strong>strict Candle-1 zero-repaint execution</strong>.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                onClick={onExplore}
                className="group flex items-center gap-2.5 bg-gradient-to-r from-[#ff2a3b] to-[#e01d2d] hover:from-[#ff3d4c] hover:to-[#ff2a3b] text-white text-xs sm:text-sm font-bold rounded-full px-6 py-3.5 shadow-xl shadow-red-500/30 hover:shadow-red-500/50 transition-all cursor-pointer"
              >
                <span>Explore Indicators</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onViewBundles}
                className="flex items-center gap-2 bg-[#14141c]/90 hover:bg-[#1f1f2a] text-zinc-200 hover:text-white text-xs sm:text-sm font-semibold rounded-full px-5 py-3.5 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer shadow-md"
              >
                <Flame className="w-4 h-4 text-red-400" />
                <span>View Complete Suite (Save 35%)</span>
              </button>
            </div>

            {/* 3 Metric Glass Cards in a row - Directly matches reference layout */}
            <div className="grid grid-cols-3 gap-3 pt-4 max-w-lg">
              <div className="bg-[#111117]/80 backdrop-blur-md border border-white/8 rounded-2xl p-3.5 shadow-lg hover:border-red-500/30 transition-colors">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                  Verified Traders
                </span>
                <div className="text-xl sm:text-2xl font-bold font-heading text-white">
                  3,400+
                </div>
                <div className="flex -space-x-1.5 mt-2">
                  <div className="w-4 h-4 rounded-full bg-red-500/60 border border-zinc-900"></div>
                  <div className="w-4 h-4 rounded-full bg-zinc-600 border border-zinc-900"></div>
                  <div className="w-4 h-4 rounded-full bg-red-400 border border-zinc-900"></div>
                </div>
              </div>

              <div className="bg-[#111117]/80 backdrop-blur-md border border-white/8 rounded-2xl p-3.5 shadow-lg hover:border-red-500/30 transition-colors">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                  Candle-1 Directive
                </span>
                <div className="text-xl sm:text-2xl font-bold font-heading text-white">
                  100%
                </div>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
                  <ShieldCheck className="w-3 h-3" /> Anti-Repaint
                </span>
              </div>

              <div className="bg-[#111117]/80 backdrop-blur-md border border-white/8 rounded-2xl p-3.5 shadow-lg hover:border-red-500/30 transition-colors">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                  Delivery Speed
                </span>
                <div className="text-xl sm:text-2xl font-bold font-heading text-white">
                  &lt;1s
                </div>
                <span className="text-[10px] text-red-400 font-mono flex items-center gap-1 mt-1">
                  <Zap className="w-3 h-3" /> Instant Script
                </span>
              </div>
            </div>

          </div>

          {/* Right Column (Hero Visual with Glowing Jellyfish Art & Floating Telemetry Stack) */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            
            {/* Glowing Art Visual Container */}
            <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-3xl overflow-hidden border border-red-500/25 bg-gradient-to-b from-[#161622] via-[#0d0d14] to-[#070709] shadow-2xl shadow-red-950/60 p-4 flex flex-col justify-between">
              
              {/* Art Image Background (Bioluminescent jellyfish & neon crimson lighting from reference) */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-75 mix-blend-screen scale-105 pointer-events-none transition-transform duration-700 hover:scale-110"
                style={{ backgroundImage: `url('/hero_art.jpg')` }}
              ></div>

              {/* Ambient Red Glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-black/30 pointer-events-none"></div>

              {/* Top Tag inside card */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-red-400">
                  <Sparkles className="w-3 h-3" /> Aemeth Engine v5
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  01/04
                </span>
              </div>

              {/* Middle Floating Telemetry Stat */}
              <div className="relative z-10 space-y-4 my-auto pt-24">
                <div className="bg-[#0e0e16]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
                  <span className="text-xs text-zinc-400 font-medium">Algorithmic Releases</span>
                  <div className="text-3xl font-extrabold font-heading text-white mt-0.5">
                    230+
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Pine Script v5 strategies & indicators deployed worldwide.
                  </p>
                </div>

                <div className="bg-[#0e0e16]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
                  <span className="text-xs text-zinc-400 font-medium">Prop Traders Supported</span>
                  <div className="text-3xl font-extrabold font-heading text-white mt-0.5">
                    400+
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 pt-2 border-t border-white/5">
                    <span>FTMO</span>
                    <span>IC Markets</span>
                    <span>Exness</span>
                    <span>Bybit</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="relative z-10 pt-2">
                <button
                  onClick={onExplore}
                  className="w-full py-3 bg-[#ff2a3b] hover:bg-[#e02434] text-white text-xs font-bold rounded-xl shadow-lg shadow-red-500/40 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Get Instant Indicator Access</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
