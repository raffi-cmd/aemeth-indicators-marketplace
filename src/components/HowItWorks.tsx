import React from 'react';
import { Search, ShoppingBag, ShieldCheck, Download, CheckCircle, ArrowRight, Lock, Code } from 'lucide-react';

interface HowItWorksProps {
  onExplore: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onExplore }) => {
  const steps = [
    {
      num: '01',
      icon: Search,
      title: 'Browse & Select Indicator',
      desc: 'Explore institutional Pine Script v5 indicators or multi-indicator bundles. Compare open-source vs private protected access modes.',
    },
    {
      num: '02',
      icon: ShoppingBag,
      title: 'Server-Validated Checkout',
      desc: 'Select Bank Transfer (BCA/Mandiri), PayPal, or Crypto (USDT/BTC). Prices and amounts are verified on the server.',
    },
    {
      num: '03',
      icon: ShieldCheck,
      title: 'Verified Settlement',
      desc: 'Immediate automated or authorized manual verification ensures secure, non-repudiable transaction settlement.',
    },
    {
      num: '04',
      icon: Download,
      title: 'Instant Delivery & License',
      desc: 'Download uncompiled .pine source files or receive authorized invite-only script access directly to your TradingView username.',
    },
  ];

  return (
    <section id="how-it-works-section" className="w-full py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider font-mono">
            End-To-End Fulfillment Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            How Purchasing & Delivery Work
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            From checkout verification to direct TradingView chart execution in 4 seamless steps.
          </p>
        </div>

        {/* 4 Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={i}
                className="bg-[#101016]/90 backdrop-blur-xl border border-white/8 hover:border-red-500/30 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xl relative group transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-red-950/60 border border-red-500/30 text-red-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-extrabold font-heading text-white/20 group-hover:text-red-500/40 transition-colors">
                      {st.num}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white font-heading">
                    {st.title}
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dual Delivery Model Explainer Card */}
        <div className="bg-gradient-to-r from-[#12121c] via-[#0d0d14] to-[#12121c] border border-white/10 rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl">
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[11px] font-bold text-emerald-300">
              <Code className="w-3.5 h-3.5" /> Open-Source Pine Script Delivery
            </div>
            <h4 className="text-lg font-bold text-white">Full Source Code Ownership</h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              For open-source indicators, you receive raw uncompiled <code>.pine</code> and <code>.txt</code> files. Inspect the code, create alerts, and modify parameters directly in your TradingView Pine Editor.
            </p>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/30 text-[11px] font-bold text-red-300">
              <Lock className="w-3.5 h-3.5" /> Private / Protected Indicator Delivery
            </div>
            <h4 className="text-lg font-bold text-white">Direct TradingView Account Authorization</h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              For proprietary algorithms where IP is confidential, access is granted directly to your TradingView username by our institutional publisher account. Simply open your TradingView "Invite-Only Scripts" tab.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
