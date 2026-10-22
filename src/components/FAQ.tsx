import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I install an open-source Pine Script indicator in TradingView?',
      a: 'After verified payment, navigate to "Downloads & Pine Code" in your customer dashboard. Copy the raw Pine Script code. In TradingView, open the bottom panel named "Pine Editor", click "New", paste the code, and click "Add to Chart". You can also save it as a favorite indicator.',
    },
    {
      q: 'How do private / invite-only indicators work?',
      a: 'For proprietary protected indicators, access is authorized directly to your TradingView username by our administrator. Once approved, the indicator appears under the "Invite-Only Scripts" tab in your TradingView Indicators dialog. No source code installation is required.',
    },
    {
      q: 'How long does delivery take after payment?',
      a: 'Open-source indicator downloads and copyable code unlock immediately upon payment verification (<1s for PayPal; within minutes for reviewed bank transfer or crypto transactions). TradingView invite authorizations are typically provisioned within 1 to 4 hours.',
    },
    {
      q: 'Do your indicators repaint historical bars?',
      a: 'No. All Aemeth indicators follow our strict Section 2 Anti-Repaint Directive: calculations and signals lock exclusively to Candle 1 (Fixed Closed Bar). Once a bar closes, the signal will never shift or disappear.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept Bank Transfer (BCA, Mandiri, International Wire), PayPal (Credit/Debit cards worldwide), and Crypto Deposits (USDT on TRC-20, USDT on ERC-20, and Bitcoin).',
    },
    {
      q: 'Will I receive updates when new indicator versions are released?',
      a: 'Yes. Every purchase grants lifetime access to future version updates and algorithmic enhancements within that indicator series at no extra charge.',
    },
    {
      q: 'What is your refund policy?',
      a: 'Due to the non-returnable digital nature of downloadable Pine Script source code and proprietary script access, all sales are final once digital files or invite-only authorizations have been delivered. If you experience technical setup issues, our dedicated support team will assist you until it is working properly.',
    },
  ];

  return (
    <section id="faq-section" className="w-full py-16 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider font-mono">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            Everything You Need To Know
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Clear, transparent answers about indicator licensing, delivery, and TradingView compatibility.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="bg-[#101016]/90 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm font-bold text-white font-heading">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-red-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-zinc-300 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
