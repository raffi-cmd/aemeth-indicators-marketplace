import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Shield, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import type { User } from '../types/marketplace';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [tvUsername, setTvUsername] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const res = await api.login({ email, password });
        if (!res.success) throw new Error(res.error || 'Login failed');
        localStorage.setItem('aemeth_token', res.token);
        onSuccess(res.user);
      } else {
        const res = await api.register({
          email,
          password,
          name,
          tradingview_username: tvUsername || undefined,
        });
        if (!res.success) throw new Error(res.error || 'Registration failed');
        localStorage.setItem('aemeth_token', res.token);
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login({ email: demoEmail, password: demoPass });
      if (!res.success) throw new Error(res.error);
      localStorage.setItem('aemeth_token', res.token);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#0e0e15] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-red-950/60 my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#14141d]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff2a3b] animate-pulse"></span>
            <h3 className="font-heading font-bold text-white text-base">
              {mode === 'login' ? 'Customer Authentication' : 'Create Trader Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex border-b border-white/5 bg-[#101016]">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
              mode === 'login'
                ? 'border-[#ff2a3b] text-white bg-red-950/20'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
              mode === 'register'
                ? 'border-[#ff2a3b] text-white bg-red-950/20'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          
          {mode === 'register' && (
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alexander Vance"
                className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50"
                required
              />
            </div>
          )}

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="trader@aemethtrader.com"
              className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50"
              required
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50"
              required
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">
                TradingView Username (Optional)
              </label>
              <input
                type="text"
                value={tvUsername}
                onChange={(e) => setTvUsername(e.target.value)}
                placeholder="e.g. vance_trading"
                className="w-full bg-[#181824] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/50 font-mono"
              />
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#ff2a3b] hover:bg-[#e02434] text-white text-xs font-bold rounded-full shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Demo Login Helpers */}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <span className="text-[10px] text-zinc-400 font-mono block text-center uppercase">
              Quick One-Click Test Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('trader@aemethtrader.com', 'trader123')}
                className="py-2 px-3 bg-[#181824] hover:bg-[#202030] text-zinc-200 text-xs font-semibold rounded-xl border border-white/5 text-center cursor-pointer"
              >
                👤 Demo Trader
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@aemethtrader.com', 'admin123')}
                className="py-2 px-3 bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/30 text-center cursor-pointer"
              >
                🛡️ Demo Admin
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
