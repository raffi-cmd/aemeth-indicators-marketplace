import React, { useState } from 'react';
import { X, ShieldAlert, FileText, Scale } from 'lucide-react';

interface LegalModalProps {
  initialTab?: 'terms' | 'privacy' | 'refund' | 'license' | 'disclaimer';
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ initialTab = 'disclaimer', onClose }) => {
  const [tab, setTab] = useState(initialTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0e0e15] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-red-950/60 my-6 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#14141d]">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-red-400" />
            <h3 className="font-heading font-bold text-white text-base">
              Aemeth Legal & Regulatory Policies
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 px-6 py-3 border-b border-white/5 bg-[#101016] overflow-x-auto scrollbar-none">
          {[
            { id: 'disclaimer', label: 'Risk Disclaimer' },
            { id: 'license', label: 'Digital License' },
            { id: 'refund', label: 'Refund Policy' },
            { id: 'terms', label: 'Terms of Service' },
            { id: 'privacy', label: 'Privacy Policy' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                tab === t.id
                  ? 'bg-[#ff2a3b] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto text-xs text-zinc-300 leading-relaxed space-y-4">
          
          {tab === 'disclaimer' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold font-mono text-sm">
                <ShieldAlert className="w-5 h-5" />
                <span>MANDATORY TRADING RISK DISCLAIMER</span>
              </div>
              <p>
                Trading Foreign Exchange (Forex), Gold (XAUUSD), Indices, Commodities, and Cryptocurrencies carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you.
              </p>
              <p>
                <strong>No Financial Advice:</strong> The TradingView indicators, Pine Script code, and Expert Advisors provided by Aemeth Trader Analysis are software analytical tools engineered for technical market visualization. They do not constitute personalized financial, investment, or trading advice.
              </p>
              <p>
                <strong>Past Performance Not Indicative:</strong> Hypothetical or simulated performance results have certain inherent limitations. Past performance of any algorithm does not guarantee future results. You should never trade with capital you cannot afford to lose.
              </p>
            </div>
          )}

          {tab === 'license' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">Single-User Commercial License Agreement</h4>
              <p>
                By purchasing an indicator from Aemeth Trader Analysis, you are granted a non-exclusive, non-transferable, revocable single-user license to use the indicator on your personal TradingView charts.
              </p>
              <p>
                <strong>Source Code Redistribution Prohibited:</strong> For open-source Pine Script products, you may modify the code for personal trading use. You may NOT resell, redistribute, sub-license, publish publicly, or share the source code with third parties.
              </p>
              <p>
                Watermarked records and order reference hashes are encoded into delivered source files to prevent unauthorized redistribution.
              </p>
            </div>
          )}

          {tab === 'refund' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">Digital Product Refund Policy</h4>
              <p>
                Due to the immediate digital delivery and non-tangible nature of uncompiled Pine Script code and TradingView invite authorizations, all purchases are non-refundable once digital files have been downloaded or script access has been granted to your TradingView username.
              </p>
              <p>
                If you encounter any technical difficulty installing or adding an indicator to your TradingView charts, our technical support desk will work directly with you to resolve the issue.
              </p>
            </div>
          )}

          {tab === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">Terms of Service</h4>
              <p>
                By accessing this website and purchasing digital goods, you agree to be bound by these Terms of Service. You represent that you are at least 18 years of age and legally authorized to enter into binding agreements.
              </p>
              <p>
                Aemeth Trader Analysis reserves the right to terminate access or revoke TradingView invite permissions for any user found violating single-user redistribution terms or engaging in fraudulent payment chargebacks.
              </p>
            </div>
          )}

          {tab === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">Privacy & Data Protection</h4>
              <p>
                We value your privacy. We collect only necessary customer information (such as email and TradingView username) strictly to fulfill indicator orders and provide license management.
              </p>
              <p>
                We never sell, rent, or trade your personal information to third parties. Sensitive payment credentials (credit card numbers, private keys) are processed directly by authorized payment providers and are never stored on our database servers.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#14141d] border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-full cursor-pointer"
          >
            Close Policy
          </button>
        </div>

      </div>
    </div>
  );
};
