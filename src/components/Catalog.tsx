import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, Code, Lock, Layers, ArrowRight, Eye, Check } from 'lucide-react';
import type { Product, ProductCategory, ProductType } from '../types/marketplace';

interface CatalogProps {
  products: Product[];
  isLoading: boolean;
  onSelectProduct: (product: Product) => void;
  onQuickBuy: (product: Product) => void;
}

export const Catalog: React.FC<CatalogProps> = ({
  products,
  isLoading,
  onSelectProduct,
  onQuickBuy,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

  // Filter products
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.short_desc.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || p.category === selectedCategory;

    const matchesType =
      selectedType === 'all' || p.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  // Sort products
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price_cents - b.price_cents;
    if (sortBy === 'price_desc') return b.price_cents - a.price_cents;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Indicators' },
    { id: 'liquidity', label: 'Liquidity & Order Flow' },
    { id: 'volume', label: 'Volume Delta' },
    { id: 'trend', label: 'Multi-Timeframe Trend' },
    { id: 'reversal', label: 'Reversal & Exhaustion' },
    { id: 'bundle', label: 'Bundles & Suites' },
  ];

  return (
    <section id="catalog-section" className="w-full py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              Algorithmic Storefront
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
              Institutional Indicator Catalog
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl">
              Select between open-source editable Pine Script source code or proprietary TradingView invite-only indicator access.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 bg-[#121218] border border-white/8 rounded-full px-4 py-2 text-xs font-mono text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{products.length} Active Scripts Ready for Instant Delivery</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#101016]/90 backdrop-blur-xl border border-white/8 rounded-3xl p-4 space-y-4 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by indicator name (e.g. Liquidity, Delta, Trend)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#181822] text-xs sm:text-sm text-zinc-100 placeholder-zinc-400 pl-10 pr-4 py-2.5 rounded-full border border-white/5 focus:outline-none focus:border-red-500/50 transition-colors"
              />
            </div>

            {/* Product Type Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-[#181822] text-xs sm:text-sm text-zinc-200 px-3.5 py-2.5 rounded-full border border-white/5 focus:outline-none focus:border-red-500/50 transition-colors"
              >
                <option value="all">All Product Types</option>
                <option value="open_source">Open-Source (.pine code)</option>
                <option value="private_protected">TradingView Invite-Only</option>
                <option value="bundle">Bundles (Multi-Indicator)</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="md:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-[#181822] text-xs sm:text-sm text-zinc-200 px-3.5 py-2.5 rounded-full border border-white/5 focus:outline-none focus:border-red-500/50 transition-colors"
              >
                <option value="newest">Sort by: Newest Releases</option>
                <option value="price_asc">Sort by: Price (Low to High)</option>
                <option value="price_desc">Sort by: Price (High to Low)</option>
              </select>
            </div>

          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#ff2a3b] text-white shadow-md shadow-red-500/40 glow-pill'
                    : 'bg-[#181822]/80 text-zinc-400 hover:text-white hover:bg-[#20202d] border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-[#121218] rounded-3xl h-96 animate-pulse border border-white/5 p-6"></div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="bg-[#101016] border border-white/5 rounded-3xl p-12 text-center space-y-3">
            <Filter className="w-8 h-8 text-zinc-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">No indicators match your filter</h3>
            <p className="text-xs text-zinc-400">Try clearing your search query or switching categories.</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setSelectedType('all');
              }}
              className="mt-2 px-4 py-2 rounded-full bg-[#ff2a3b] text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((product) => {
              const isBundle = product.type === 'bundle';
              const isOpenSource = product.type === 'open_source';
              const isPrivate = product.type === 'private_protected';

              return (
                <div
                  key={product.id}
                  className="group bg-[#101016]/90 backdrop-blur-xl border border-white/8 hover:border-red-500/35 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-red-950/40"
                >
                  {/* Card Thumbnail / Header Visual */}
                  <div className="relative h-48 w-full overflow-hidden bg-black/40">
                    <img
                      src={product.thumbnail_url}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101016] via-transparent to-black/40"></div>

                    {/* Badge top-left */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
                      {isOpenSource && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-[10px] font-bold text-emerald-300">
                          <Code className="w-3 h-3" /> Open-Source .pine
                        </span>
                      )}
                      {isPrivate && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-950/80 backdrop-blur-md border border-red-500/30 text-[10px] font-bold text-red-300">
                          <Lock className="w-3 h-3" /> TradingView Invite-Only
                        </span>
                      )}
                      {isBundle && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-extrabold shadow-md">
                          <Layers className="w-3 h-3" /> Complete Suite
                        </span>
                      )}
                    </div>

                    {/* Version Badge top-right */}
                    <div className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-md text-[10px] font-mono text-zinc-300">
                      v{product.version}
                    </div>

                    {/* Anti-Repaint Guarantee banner on image */}
                    <div className="absolute bottom-2 left-3.5 right-3.5 flex items-center justify-between text-[10px] font-mono text-zinc-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/5">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <ShieldCheck className="w-3 h-3" /> Candle 1 Strict Lock
                      </span>
                      <span className="text-zinc-400">TradingView v5</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold font-heading text-white group-hover:text-red-400 transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                        {product.short_desc}
                      </p>
                    </div>

                    {/* Features Snippet */}
                    <ul className="space-y-1.5 pt-1 border-t border-white/5">
                      {product.features.slice(0, 3).map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] text-zinc-300">
                          <Check className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Price and CTA row */}
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-extrabold font-heading text-white">
                            ${(product.price_cents / 100).toFixed(0)}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-400">USD</span>
                          {product.discount_cents ? (
                            <span className="text-xs line-through text-zinc-400 font-mono">
                              ${((product.price_cents + product.discount_cents) / 100).toFixed(0)}
                            </span>
                          ) : null}
                        </div>
                        <span className="text-[10px] text-zinc-400 block">
                          Lifetime updates included
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectProduct(product)}
                          className="p-2.5 rounded-full bg-[#1b1b24] hover:bg-[#252533] text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                          title="View Technical Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onQuickBuy(product)}
                          className="flex items-center gap-1.5 bg-[#ff2a3b] hover:bg-[#e02434] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all cursor-pointer"
                        >
                          <span>Get Access</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
