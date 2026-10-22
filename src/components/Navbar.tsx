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
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand / Logo */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 p-0.5 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/50 transition-all">
            <div className="w-full h-full bg-[#070b14] rounded-full flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-base tracking-tight text-white group-hover:text-blue-400 transition-colors">
                Aemeth
              </span>
              <span className="font-heading font-medium text-xs text-blue-400 tracking-wider uppercase font-mono">
                TradingView
              </span>
            </div>
          </div>
        </button>

        {/* Floating Pill Navigation */}
        <nav className="hidden lg:flex items-center bg-[#0b1120]/90 backdrop-blur-xl border border-slate-800 rounded-full px-2 py-1.5 shadow-xl shadow-black/50">
          {[
            { id: 'home', label: t.nav.home },
            { id: 'catalog', label: t.nav.indicators },
            { id: 'bundles', label: t.nav.bundles },
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
        <div className="flex items-center gap-2.5">
          
          {/* Language Switcher ID | EN */}
          <div className="flex items-center bg-[#0b1120] border border-slate-800 rounded-full p-1 text-xs font-mono">
            <button
              onClick={() => setLang('id')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer font-bold ${
                lang === 'id' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              ID
            </button>
            <span className="text-slate-600 px-0.5">|</span>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-full transition-all cursor-pointer font-bold ${
                lang === 'en' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* Cart / Guest Checkout Pill */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full px-4 py-2 text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{t.nav.cart}</span>
            {cartCount > 0 && (
              <span className="flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-white text-blue-900">
                {cartCount}
              </span>
            )}
          </button>

        </div>
      </div>

      {/* Mobile Navigation Scrollbar */}
      <div className="flex lg:hidden overflow-x-auto py-2 gap-1.5 mt-2 justify-center scrollbar-none">
        {[
          { id: 'home', label: t.nav.home },
          { id: 'catalog', label: t.nav.indicators },
          { id: 'bundles', label: t.nav.bundles },
          { id: 'how-it-works', label: t.nav.howItWorks },
          { id: 'faq', label: t.nav.faq },
          { id: 'order-status', label: t.nav.trackOrder },
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-[#0b1120] text-slate-400 border border-slate-800'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
