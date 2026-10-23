import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, Code, Lock, Layers, ArrowRight, Eye, Check } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { getPriceAmount } from '../utils/currency';
import type { Product } from '../types/marketplace';

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
  const { t, lang } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

  // Filter products
  const filtered = products.filter((p) => {
    const title = (lang === 'id' ? p.title_id || p.title : p.title_en || p.title).toLowerCase();
    const desc = (lang === 'id' ? p.short_desc_id || p.short_desc : p.short_desc_en || p.short_desc).toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch = title.includes(query) || desc.includes(query);
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesType = selectedType === 'all' || p.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  // Sort products
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price_cents - b.price_cents;
    if (sortBy === 'price_desc') return b.price_cents - a.price_cents;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const categories = [
    { id: 'all', label: t.catalog.allCategories },
    { id: 'liquidity', label: t.catalog.catLiquidity },
    { id: 'volume', label: t.catalog.catVolume },
    { id: 'trend', label: t.catalog.catTrend },
    { id: 'reversal', label: t.catalog.catReversal },
    { id: 'bundle', label: t.catalog.catBundle },
  ];

  return (
    <section id="catalog-section" className="w-full py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              {t.catalog.sectionTag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
              {t.catalog.title}
            </h2>
            <p className="text-sm text-slate-400 max-w-xl font-light">
              {t.catalog.description}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#0b1120] border border-slate-800 rounded-full px-4 py-2 text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{products.length} {t.catalog.activeScriptsCount}</span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-[#0b1120] border border-slate-800 rounded-3xl p-4 space-y-4 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Search */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.catalog.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#070b14] text-xs sm:text-sm text-slate-100 placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-full border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors font-sans"
              />
            </div>

            {/* Product Type Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-[#070b14] text-xs sm:text-sm text-slate-200 px-3.5 py-2.5 rounded-full border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="all">{t.catalog.allTypes}</option>
                <option value="open_source">{t.catalog.openSourceType}</option>
                <option value="private_protected">{t.catalog.privateType}</option>
                <option value="bundle">{t.catalog.bundleType}</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="md:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-[#070b14] text-xs sm:text-sm text-slate-200 px-3.5 py-2.5 rounded-full border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="newest">{t.catalog.sortNewest}</option>
                <option value="price_asc">{t.catalog.sortPriceAsc}</option>
                <option value="price_desc">{t.catalog.sortPriceDesc}</option>
              </select>
            </div>

          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'bg-[#070b14] text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
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
              <div key={n} className="bg-[#0b1120] rounded-3xl h-96 animate-pulse border border-slate-800 p-6"></div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="bg-[#0b1120] border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Filter className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">{t.catalog.emptyTitle}</h3>
            <p className="text-xs text-slate-400">{t.catalog.emptyDesc}</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setSelectedType('all');
              }}
              className="mt-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
            >
              {t.catalog.resetFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((product) => {
              const isBundle = product.type === 'bundle';
              const isOpenSource = product.type === 'open_source';
              const isPrivate = product.type === 'private_protected';

              const title = lang === 'id' ? product.title_id || product.title : product.title_en || product.title;
              const shortDesc = lang === 'id' ? product.short_desc_id || product.short_desc : product.short_desc_en || product.short_desc;
              const features = (lang === 'id' ? product.features_id || product.features : product.features_en || product.features) || [];

              return (
                <div
                  key={product.id}
                  className="group bg-[#0b1120] border border-slate-800 hover:border-blue-500/40 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl"
                >
                  {/* Card Thumbnail */}
                  <div className="relative h-48 w-full overflow-hidden bg-black">
                    <img
                      src={product.thumbnail_url}
                      alt={title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-black/40"></div>

                    {/* Badge top-left */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
                      {isOpenSource && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 font-mono">
                          <Code className="w-3 h-3" /> {t.catalog.openSourceType}
                        </span>
                      )}
                      {isPrivate && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-[10px] font-bold text-blue-300 font-mono">
                          <Lock className="w-3 h-3" /> {t.catalog.privateType}
                        </span>
                      )}
                      {isBundle && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold shadow-sm font-mono">
                          <Layers className="w-3 h-3" /> {t.catalog.bundleType}
                        </span>
                      )}
                    </div>

                    {/* Version Badges top-right */}
                    <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                      {product.pine_version && (
                        <div className="bg-blue-950/80 backdrop-blur-md border border-blue-500/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-blue-300">
                          {product.pine_version}
                        </div>
                      )}
                      <div className="bg-black/60 backdrop-blur-md border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
                        v{product.version}
                      </div>
                    </div>

                    {/* Anti-Repaint Guarantee & Pine compatibility banner on image */}
                    <div className="absolute bottom-2 left-3.5 right-3.5 flex items-center justify-between text-[10px] font-mono text-slate-300 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <ShieldCheck className="w-3 h-3" /> {t.catalog.antiRepaintLock}
                      </span>
                      <span className="text-slate-400">{product.pine_version || 'Pine v5'}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold font-heading text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                        {title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 font-light">
                        {shortDesc}
                      </p>
                    </div>

                    {/* Features Snippet */}
                    <ul className="space-y-1.5 pt-1 border-t border-slate-800/80">
                      {features.slice(0, 3).map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                          <Check className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Price and CTA row */}
                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                      <div>
                        {(() => {
                          const pInfo = getPriceAmount(product.price_cents, lang, product.price_idr);
                          return (
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              <span className="text-xl sm:text-2xl font-extrabold font-heading text-white">
                                {pInfo.amount}
                              </span>
                              <span className="text-[10px] sm:text-[11px] font-mono text-slate-400">{pInfo.currency}</span>
                              {product.discount_cents ? (
                                <span className="text-xs line-through text-slate-500 font-mono">
                                  {lang === 'id' && product.discount_idr && product.price_idr
                                    ? `Rp ${(product.price_idr + product.discount_idr).toLocaleString('id-ID')}`
                                    : `$${((product.price_cents + product.discount_cents) / 100).toFixed(0)}`}
                                </span>
                              ) : null}
                            </div>
                          );
                        })()}
                        <span className="text-[10px] text-slate-500 block">
                          {t.catalog.lifetimeUpdates}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <button
                          onClick={() => onSelectProduct(product)}
                          className="p-2 sm:p-2.5 rounded-full bg-[#070b14] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                          title={t.catalog.viewDetails}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onQuickBuy(product)}
                          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-md shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
                        >
                          <span>{t.catalog.getAccess}</span>
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
