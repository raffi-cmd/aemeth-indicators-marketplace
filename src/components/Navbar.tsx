import React from 'react';
import { ShoppingCart, Search, Globe } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
}) => {
  const { t, lang, setLang } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full max-w-full bg-[#070b14]/90 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-6 lg:px-8 pt-3 pb-2 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Brand / Logo */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 text-left group focus:outline-none cursor-pointer shrink-0 min-w-0"
        >
          <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 p-0.5 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/50 transition-all shrink-0">
            <div className="w-full h-full bg-[#070b14] rounded-full flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="font-heading font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-blue-400 transition-colors">
              Aemeth
            </span>
            <span className="font-heading font-medium text-[10px] sm:text-xs text-blue-400 tracking-wider uppercase font-mono hidden sm:inline-block">
              TradingView
            </span>
          </div>
        </button>

        {/* Floating Pill Navigation */}
        <nav className="hidden lg:flex items-center bg-[#0b1120]/90 backdrop-blur-xl border border-slate-800 rounded-full px-2 py-1.5 shadow-xl shadow-black/50">
          {[
            { id: 'home', label: t.nav.home },
            { id: 'catalog', label: t.nav.indicators },
            { id: 'bundles', label: t.nav.bundles },
            { id: 'installation-guide', label: t.nav.installationGuide },
            { id: 'how-it-works', label: t.nav.howItWorks },
            { id: 'faq', label: t.nav.faq },
            { id: 'order-status', label: t.nav.trackOrder },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 glow-pill font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls: Language Switcher & Cart */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Language Switcher ID | EN */}
          <div className="flex items-center bg-[#0b1120] border border-slate-800 rounded-full p-0.5 sm:p-1 text-[11px] sm:text-xs font-mono">
            <button
              onClick={() => setLang('id')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full transition-all cursor-pointer font-bold ${
                lang === 'id' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              ID
            </button>
            <span className="text-slate-600 px-0.5 text-[10px]">|</span>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full transition-all cursor-pointer font-bold ${
                lang === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* Cart / Guest Checkout Pill */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer shrink-0"
          >
            <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{t.nav.cart}</span>
            {cartCount > 0 && (
              <span className="flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-white text-blue-900 shrink-0">
                {cartCount}
              </span>
            )}
          </button>

        </div>
      </div>

      {/* Mobile Navigation Scrollbar */}
      <div className="w-full max-w-full overflow-x-auto no-scrollbar touch-pan-x mt-2 pt-1 lg:hidden">
        <div className="flex py-1 gap-1.5 justify-start w-max min-w-full px-0.5">
          {[
            { id: 'home', label: t.nav.home },
            { id: 'catalog', label: t.nav.indicators },
            { id: 'bundles', label: t.nav.bundles },
            { id: 'installation-guide', label: t.nav.installationGuide },
            { id: 'how-it-works', label: t.nav.howItWorks },
            { id: 'faq', label: t.nav.faq },
            { id: 'order-status', label: t.nav.trackOrder },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 font-bold'
                    : 'bg-[#0b1120] text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
