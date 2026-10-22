import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface FooterProps {
  onOpenLegal: (tab: 'terms' | 'privacy' | 'refund' | 'license' | 'disclaimer') => void;
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal, onNavigate }) => {
  return (
    <footer className="w-full bg-[#050507] border-t border-white/5 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff2a3b] to-[#ff6b78] p-0.5">
                <div className="w-full h-full bg-[#070709] rounded-full flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff2a3b]"></span>
                </div>
              </div>
              <span className="font-heading font-extrabold text-base tracking-tight text-white">
                Aemeth Trader Analysis
              </span>
            </div>

            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed font-light">
              “Precision in Every Signal.” Institutional TradingView Pine Script indicators, quantitative order block visualizers, and algorithmic execution suites.
            </p>

            <div className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Section 2 Directive: Anti-Repaint Candle 1 Strict Lock</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <button onClick={() => onNavigate('catalog')} className="hover:text-red-400 transition-colors">
                  All Indicators
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('bundles')} className="hover:text-red-400 transition-colors">
                  Complete Institutional Suite
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-red-400 transition-colors">
                  How Delivery Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-red-400 transition-colors">
                  FAQ & Installation Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Legal & Compliance
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <button onClick={() => onOpenLegal('disclaimer')} className="hover:text-red-400 transition-colors flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  <span>Trading Risk Disclaimer</span>
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('license')} className="hover:text-red-400 transition-colors">
                  Digital Product License
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('refund')} className="hover:text-red-400 transition-colors">
                  Refund & Cancellation Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('terms')} className="hover:text-red-400 transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('privacy')} className="hover:text-red-400 transition-colors">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Mandatory Regulatory Risk Disclaimer Bar */}
        <div className="pt-8 border-t border-white/5 space-y-4 text-[11px] text-zinc-400 leading-relaxed">
          <p>
            <strong>Regulatory Trading Risk Disclosure:</strong> Foreign exchange, equities, indices, commodities, and cryptocurrency trading involves high risk and is not suitable for all investors. The high degree of leverage available in trading can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite. The possibility exists that you could sustain a loss of some or all of your initial capital.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/5 text-[11px] font-mono text-zinc-400">
            <span>© 2026 AEMETH TRADER ANALYSIS. All Rights Reserved.</span>
            <span>TradingView® is a registered trademark of TradingView, Inc.</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
