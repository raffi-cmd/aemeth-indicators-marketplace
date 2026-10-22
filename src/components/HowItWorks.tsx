import React from 'react';
import { Search, ShoppingBag, ShieldCheck, Download, Code, Lock } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface HowItWorksProps {
  onExplore: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onExplore }) => {
  const { t } = useTranslation();

  const steps = [
    {
      num: t.howItWorks.step1Num,
      icon: Search,
      title: t.howItWorks.step1Title,
      desc: t.howItWorks.step1Desc,
    },
    {
      num: t.howItWorks.step2Num,
      icon: ShoppingBag,
      title: t.howItWorks.step2Title,
      desc: t.howItWorks.step2Desc,
    },
    {
      num: t.howItWorks.step3Num,
      icon: ShieldCheck,
      title: t.howItWorks.step3Title,
      desc: t.howItWorks.step3Desc,
    },
    {
      num: t.howItWorks.step4Num,
      icon: Download,
      title: t.howItWorks.step4Title,
      desc: t.howItWorks.step4Desc,
    },
  ];

  return (
    <section id="how-it-works-section" className="w-full py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono">
            {t.howItWorks.sectionTag}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            {t.howItWorks.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-light">
            {t.howItWorks.subtitle}
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={i}
                className="bg-[#0b1120] border border-slate-800 hover:border-blue-500/30 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xl transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-blue-950/70 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-extrabold font-heading text-slate-700">
                      {st.num}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white font-heading">
                    {st.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dual Delivery Model Explainer Card */}
        <div className="bg-[#0b1120] border border-slate-800 rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-xl">
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[11px] font-bold text-emerald-300 font-mono">
              <Code className="w-3.5 h-3.5" /> {t.howItWorks.openSourceCardBadge}
            </div>
            <h4 className="text-lg font-bold text-white font-heading">
              {t.howItWorks.openSourceCardTitle}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              {t.howItWorks.openSourceCardDesc}
            </p>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-[11px] font-bold text-blue-300 font-mono">
              <Lock className="w-3.5 h-3.5" /> {t.howItWorks.inviteCardBadge}
            </div>
            <h4 className="text-lg font-bold text-white font-heading">
              {t.howItWorks.inviteCardTitle}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              {t.howItWorks.inviteCardDesc}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
