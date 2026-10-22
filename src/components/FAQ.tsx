import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export const FAQ: React.FC = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
    { q: t.faq.q5, a: t.faq.a5 },
    { q: t.faq.q6, a: t.faq.a6 },
    { q: t.faq.q7, a: t.faq.a7 },
  ];

  return (
    <section id="faq-section" className="w-full py-16 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono">
            {t.faq.sectionTag}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            {t.faq.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-light">
            {t.faq.subtitle}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="bg-[#0b1120] border border-slate-800 rounded-2xl overflow-hidden transition-colors hover:border-slate-700"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm font-bold text-white font-heading">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-blue-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 font-light">
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
