import React, { useState } from 'react';
import { 
  Terminal, ShieldCheck, AlertTriangle, 
  ExternalLink, MessageCircle, Send, AlertCircle
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface InstallationGuideProps {
  onBackToCatalog?: () => void;
  productContext?: { title: string; orderNumber?: string };
}

export const InstallationGuide: React.FC<InstallationGuideProps> = ({
  onBackToCatalog,
  productContext,
}) => {
  const { t, lang } = useTranslation();
  const [activeTab, setActiveTab] = useState<'steps' | 'troubleshoot'>('steps');

  // WhatsApp & Telegram support helpers with prefilled query parameters (NO tokens, passwords, or code secrets)
  const productTitle = productContext?.title || 'Aemeth TradingView Indicator';
  const orderRef = productContext?.orderNumber ? ` (Order: ${productContext.orderNumber})` : '';

  const waMessage = lang === 'id'
    ? `Halo Admin Aemeth, saya membutuhkan bantuan panduan instalasi Pine Script untuk produk: ${productTitle}${orderRef}.`
    : `Hello Aemeth Support, I would like assistance installing the Pine Script indicator: ${productTitle}${orderRef}.`;

  const waUrl = `https://wa.me/6282123456789?text=${encodeURIComponent(waMessage)}`;
  const tgUrl = `https://t.me/aemethtrader?text=${encodeURIComponent(waMessage)}`;

  const steps = [
    {
      num: '01',
      title: t.installationGuide.step1Title,
      desc: t.installationGuide.step1Desc,
      tip: lang === 'id' 
        ? 'Tips: Anda dapat menggunakan akun TradingView gratis maupun berbayar (Essential/Plus/Premium).' 
        : 'Tip: Compatible with TradingView Free, Essential, Plus, and Premium account tiers.',
    },
    {
      num: '02',
      title: t.installationGuide.step2Title,
      desc: t.installationGuide.step2Desc,
      tip: lang === 'id'
        ? 'Shortcut: Tekan tombol Alt + E di keyboard Windows atau Option + E di Mac untuk membuka/menutup Pine Editor secara cepat.'
        : 'Shortcut: Press Alt + E (Windows) or Option + E (Mac) to quickly toggle the Pine Editor console.',
    },
    {
      num: '03',
      title: t.installationGuide.step3Title,
      desc: t.installationGuide.step3Desc,
      tip: lang === 'id'
        ? 'Penting: Pastikan baris paling pertama //@version=5 tidak terhapus agar compiler TradingView memproses kode dengan benar.'
        : 'Important: Ensure the very first line //@version=5 is intact so TradingView compiles the code with the correct compiler version.',
    },
    {
      num: '04',
      title: t.installationGuide.step4Title,
      desc: t.installationGuide.step4Desc,
      tip: lang === 'id'
        ? 'Skrip akan tersimpan secara permanen di akun TradingView Anda pada folder "My Scripts".'
        : 'The script will be permanently saved to your TradingView account under "My Scripts".',
    },
    {
      num: '05',
      title: t.installationGuide.step5Title,
      desc: t.installationGuide.step5Desc,
      tip: lang === 'id'
        ? 'Selesai! Anda dapat mengubah parameter warna, periode, dan alert melalui menu "Settings" (ikon roda gigi) pada indikator di chart.'
        : 'Done! You can adjust parameters, colors, and alerts via the "Settings" gear icon on the indicator legend.',
    },
  ];

  const troubleshoots = [
    {
      title: t.installationGuide.err1Title,
      desc: t.installationGuide.err1Desc,
      fix: t.installationGuide.err1Fix,
    },
    {
      title: t.installationGuide.err2Title,
      desc: t.installationGuide.err2Desc,
      fix: t.installationGuide.err2Fix,
    },
    {
      title: t.installationGuide.err3Title,
      desc: t.installationGuide.err3Desc,
      fix: t.installationGuide.err3Fix,
    },
    {
      title: t.installationGuide.err4Title,
      desc: t.installationGuide.err4Desc,
      fix: t.installationGuide.err4Fix,
    },
  ];

  return (
    <div className="w-full py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono">
          {t.installationGuide.sectionTag}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
          {t.installationGuide.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
          {t.installationGuide.subtitle}
        </p>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setActiveTab('steps')}
            className={`px-5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeTab === 'steps'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-[#0b1120] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {t.installationGuide.tabSteps}
          </button>
          <button
            onClick={() => setActiveTab('troubleshoot')}
            className={`px-5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeTab === 'troubleshoot'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-[#0b1120] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {t.installationGuide.tabTroubleshooting}
          </button>
        </div>
      </div>

      {/* Tab 1: Step-by-Step Installation */}
      {activeTab === 'steps' && (
        <div className="space-y-6">
          <div className="bg-[#0b1120] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
            <h2 className="text-xl font-extrabold font-heading text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-400" />
              <span>{t.installationGuide.stepsTitle}</span>
            </h2>

            <div className="space-y-8">
              {steps.map((st, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-5 items-start border-b border-slate-800/80 pb-8 last:border-0 last:pb-0">
                  <div className="w-12 h-12 rounded-2xl bg-blue-950/70 border border-blue-500/30 text-blue-400 flex items-center justify-center font-heading font-extrabold text-lg shrink-0">
                    {st.num}
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-base font-bold text-white font-heading">
                      {st.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                      {st.desc}
                    </p>
                    <div className="bg-[#070b14] border border-slate-800/80 rounded-xl px-3.5 py-2 text-[11px] text-blue-300 font-mono flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{st.tip}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Troubleshooting Compiler Errors */}
      {activeTab === 'troubleshoot' && (
        <div className="space-y-6">
          <div className="bg-[#0b1120] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h2 className="text-xl font-extrabold font-heading text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>{t.installationGuide.troubleshootTitle}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {troubleshoots.map((tb, i) => (
                <div key={i} className="bg-[#070b14] border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <h4 className="text-xs font-bold text-white font-mono leading-tight">
                      {tb.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    {tb.desc}
                  </p>
                  <div className="bg-blue-950/40 border border-blue-500/20 rounded-xl p-3 text-[11px] text-blue-300 leading-relaxed">
                    <strong className="text-white block mb-0.5 font-mono">
                      {lang === 'id' ? 'Langkah Solusi:' : 'Resolution:'}
                    </strong>
                    <span>{tb.fix}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Personal Installation Support Callout */}
      <div className="bg-gradient-to-r from-blue-950/40 via-[#0b1120] to-indigo-950/40 border border-blue-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="max-w-2xl space-y-2">
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider font-mono">
            {lang === 'id' ? 'Bantuan Instalasi Personal' : 'Personal Installation Assistance'}
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-white">
            {t.installationGuide.needManualHelp}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
            {t.installationGuide.needManualHelpDesc}
          </p>
        </div>

        {/* WhatsApp & Telegram Direct Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/25"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t.installationGuide.askOnWhatsApp}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>

          <a
            href={tgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/25"
          >
            <Send className="w-4 h-4" />
            <span>{t.installationGuide.askOnTelegram}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>

          {onBackToCatalog && (
            <button
              onClick={onBackToCatalog}
              className="px-5 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer sm:ml-auto"
            >
              {lang === 'id' ? 'Kembali ke Katalog' : 'Back to Catalog'}
            </button>
          )}
        </div>

        {/* Operating Hours Note */}
        <p className="text-[11px] text-slate-400 font-mono leading-relaxed pt-2 border-t border-slate-800">
          {t.orderStatus.supportHoursNotice} • {t.installationGuide.supportNote}
        </p>
      </div>

    </div>
  );
};
