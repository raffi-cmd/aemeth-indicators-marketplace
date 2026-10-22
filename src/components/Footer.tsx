import React from 'react';
import { ShieldCheck, AlertTriangle, Lock } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface FooterProps {
  onOpenLegal: (tab: 'terms' | 'privacy' | 'refund' | 'license' | 'disclaimer') => void;
  onNavigate: (tab: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal, onNavigate, onOpenAdmin }) => {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-[#05070c] border-t border-white/5 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 p-0.5">
                <div className="w-full h-full bg-[#070b14] rounded-full flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                </div>
              </div>
              <span className="font-heading font-extrabold text-base tracking-tight text-white">
                Aemeth Trader Analysis
              </span>
            </div>

            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed font-light">
              {t.footer.tagline}
            </p>

            <div className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.footer.antiRepaintDirective}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              {t.footer.marketplaceHeading}
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <button onClick={() => onNavigate('catalog')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  {t.nav.indicators}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('bundles')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  {t.nav.bundles}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  {t.nav.howItWorks}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  {t.nav.faq}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('order-status')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  {t.nav.trackOrder}
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              {t.footer.legalHeading}
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <button onClick={() => onOpenLegal('disclaimer')} className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  <span>{t.legal.disclaimerTab}</span>
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('license')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  {t.legal.licenseTab}
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('refund')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  {t.legal.refundTab}
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('terms')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  {t.legal.termsTab}
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('privacy')} className="hover:text-blue-400 transition-colors cursor-pointer">
                  {t.legal.privacyTab}
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Mandatory Regulatory Risk Disclaimer Bar */}
        <div className="pt-8 border-t border-white/5 space-y-4 text-[11px] text-zinc-400 leading-relaxed">
          <p>
            {t.footer.regulatoryDisclaimer}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/5 text-[11px] font-mono text-zinc-400">
            <span>{t.footer.copyright}</span>
            <div className="flex items-center gap-4">
              <span>{t.footer.tradingViewTrademark}</span>
              {/* Discrete admin access button */}
              <button 
                onClick={onOpenAdmin}
                className="text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1 cursor-pointer opacity-40 hover:opacity-100"
                title={t.footer.adminAccess}
              >
                <Lock className="w-2.5 h-2.5" />
                <span className="text-[10px]">{t.footer.adminAccess}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
