import React from 'react';
import { User as UserIcon, Shield, ShoppingCart, LogOut, Code, Sparkles } from 'lucide-react';
import type { User } from '../types/marketplace';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
  cartCount,
  onOpenCart,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff2a3b] to-[#ff6b78] p-0.5 shadow-md shadow-red-500/30 group-hover:shadow-red-500/60 transition-all">
            <div className="w-full h-full bg-[#070709] rounded-full flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff2a3b] animate-pulse"></span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-base tracking-tight text-white group-hover:text-red-400 transition-colors">
                Aemeth
              </span>
              <span className="font-heading font-medium text-xs text-red-500 tracking-wider uppercase">
                Indicators
              </span>
            </div>
          </div>
        </button>

        {/* Floating Pill Navigation - Directly mirrors the reference image */}
        <nav className="hidden md:flex items-center bg-[#111117]/85 backdrop-blur-xl border border-white/10 rounded-full px-2 py-1.5 shadow-xl shadow-black/60">
          {[
            { id: 'home', label: 'Home' },
            { id: 'catalog', label: 'Indicators' },
            { id: 'bundles', label: 'Bundles' },
            { id: 'how-it-works', label: 'How It Works' },
            { id: 'faq', label: 'FAQ' },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-[#ff2a3b] text-white shadow-md shadow-red-500/50 glow-pill font-bold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Cart Pill */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 bg-[#121218]/90 hover:bg-[#1c1c24] border border-white/10 rounded-full px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition-all shadow-md"
            title="Cart"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Checkout</span>
            {cartCount > 0 && (
              <span className="flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-[#ff2a3b] text-white">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Menu / Dashboard / Sign In */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-[#121218]/90 border border-white/10 rounded-full p-1 pl-3 shadow-md">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-[#ff2a3b] text-white shadow-sm'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="max-w-[100px] truncate">{currentUser.name.split(' ')[0]}</span>
              </button>

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all ${
                    activeTab === 'admin'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-amber-400 hover:bg-amber-500/10'
                  }`}
                  title="Admin Portal"
                >
                  <Shield className="w-3 h-3" />
                  <span>Admin</span>
                </button>
              )}

              <button
                onClick={onLogout}
                className="p-1.5 text-zinc-400 hover:text-red-400 rounded-full hover:bg-white/5 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-[#ff2a3b] hover:bg-[#e02434] text-white text-xs font-bold rounded-full px-4 py-2 transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="flex md:hidden overflow-x-auto py-2 gap-1.5 mt-2 justify-center scrollbar-none">
        {[
          { id: 'home', label: 'Home' },
          { id: 'catalog', label: 'Indicators' },
          { id: 'bundles', label: 'Bundles' },
          { id: 'how-it-works', label: 'How It Works' },
          { id: 'faq', label: 'FAQ' },
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#ff2a3b] text-white shadow-md shadow-red-500/40'
                  : 'bg-[#121218] text-zinc-400 border border-white/5'
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
