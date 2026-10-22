import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BentoFeatures } from './components/BentoFeatures';
import { Catalog } from './components/Catalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { GuestOrderStatus } from './components/GuestOrderStatus';
import { AdminDashboard } from './components/AdminDashboard';
import { HowItWorks } from './components/HowItWorks';
import { FAQ } from './components/FAQ';
import { LegalModal } from './components/LegalModal';
import { Footer } from './components/Footer';
import { api } from './services/api';
import { Lock, X, AlertCircle } from 'lucide-react';
import type { Product } from './types/marketplace';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Cart & Checkout state
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Guest Order Tracking state
  const [trackedOrder, setTrackedOrder] = useState<{ orderNumber: string; token: string }>({
    orderNumber: '',
    token: '',
  });

  // Admin Access state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('aemeth_admin_session') === 'active';
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy' | 'refund' | 'license' | 'disclaimer' | null>(null);

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await api.getProducts();
      if (res.success) {
        setProducts(res.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();

    // Check if URL contains order query params, e.g. ?order=AEM-12345678&token=tok_xxx
    const params = new URLSearchParams(window.location.search);
    const orderNum = params.get('order');
    const token = params.get('token');
    if (orderNum) {
      setTrackedOrder({ orderNumber: orderNum, token: token || '' });
      setActiveTab('order-status');
    }
  }, []);

  const handleQuickBuy = (product: Product) => {
    setCartItems([product]);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = (orderNumber: string, accessToken: string) => {
    setIsCheckoutOpen(false);
    setCartItems([]);
    setTrackedOrder({ orderNumber, token: accessToken });
    setActiveTab('order-status');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin credentials verification
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput.trim() === 'admin123' || adminPasswordInput.trim() === 'Aemeth@2026') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('aemeth_admin_session', 'active');
      setIsAdminModalOpen(false);
      setAdminPasswordInput('');
      setAdminError(null);
      setActiveTab('admin');
    } else {
      setAdminError('Invalid administrator credentials.');
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('aemeth_admin_session');
    setIsAdminLoggedIn(false);
    setActiveTab('home');
  };

  const bundleProduct = products.find((p) => p.type === 'bundle');

  return (
    <div className="min-h-screen bg-[#070b14] text-zinc-100 flex flex-col antialiased selection:bg-blue-600/30 selection:text-white">
      
      {/* Floating Pill Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartItems.length}
        onOpenCart={() => {
          if (cartItems.length === 0 && products.length > 0) {
            setCartItems([products[0]]);
          }
          setIsCheckoutOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === 'home' && (
          <>
            <Hero
              onExplore={() => {
                setActiveTab('catalog');
                const el = document.getElementById('catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onViewBundles={() => {
                if (bundleProduct) {
                  setSelectedProduct(bundleProduct);
                } else {
                  setActiveTab('bundles');
                }
              }}
              onHowItWorks={() => {
                setActiveTab('how-it-works');
              }}
            />

            <BentoFeatures
              onExplore={() => {
                setActiveTab('catalog');
              }}
            />

            <Catalog
              products={products}
              isLoading={isLoadingProducts}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onQuickBuy={handleQuickBuy}
            />

            <HowItWorks
              onExplore={() => setActiveTab('catalog')}
            />

            <FAQ />
          </>
        )}

        {activeTab === 'catalog' && (
          <div className="pt-6">
            <Catalog
              products={products}
              isLoading={isLoadingProducts}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onQuickBuy={handleQuickBuy}
            />
          </div>
        )}

        {activeTab === 'bundles' && (
          <div className="pt-6">
            <Catalog
              products={products.filter((p) => p.type === 'bundle')}
              isLoading={isLoadingProducts}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onQuickBuy={handleQuickBuy}
            />
          </div>
        )}

        {activeTab === 'how-it-works' && (
          <div className="pt-6">
            <HowItWorks onExplore={() => setActiveTab('catalog')} />
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="pt-6">
            <FAQ />
          </div>
        )}

        {activeTab === 'order-status' && (
          <div className="pt-6">
            <GuestOrderStatus
              initialOrderNumber={trackedOrder.orderNumber}
              initialToken={trackedOrder.token}
            />
          </div>
        )}

        {activeTab === 'admin' && isAdminLoggedIn && (
          <AdminDashboard
            onLogout={handleAdminLogout}
            onClose={() => setActiveTab('home')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenLegal={(tab) => setLegalModalTab(tab)}
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenAdmin={() => {
          if (isAdminLoggedIn) {
            setActiveTab('admin');
          } else {
            setIsAdminModalOpen(true);
          }
        }}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuy={(p) => {
            setSelectedProduct(null);
            handleQuickBuy(p);
          }}
        />
      )}

      {/* Guest Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          products={cartItems.length > 0 ? cartItems : products.slice(0, 1)}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* Legal & Regulatory Modal */}
      {legalModalTab && (
        <LegalModal
          initialTab={legalModalTab}
          onClose={() => setLegalModalTab(null)}
        />
      )}

      {/* Discrete Admin Login Gate */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#0b1120] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => {
                setIsAdminModalOpen(false);
                setAdminError(null);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-bold text-white text-base">
                Admin Authentication
              </h3>
            </div>

            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Enter the administrator access key to manage orders, TradingView invite queues, and system settings.
            </p>

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Master Access Key"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              {adminError && (
                <div className="flex items-center gap-1.5 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>{adminError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-lg shadow-blue-600/30"
              >
                Access Portal
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
