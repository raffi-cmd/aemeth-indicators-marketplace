import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BentoFeatures } from './components/BentoFeatures';
import { Catalog } from './components/Catalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { HowItWorks } from './components/HowItWorks';
import { FAQ } from './components/FAQ';
import { LegalModal } from './components/LegalModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { api } from './services/api';
import type { Product, User } from './types/marketplace';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Cart & Checkout state
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy' | 'refund' | 'license' | 'disclaimer' | null>(null);

  // Fetch products and user on mount
  const refreshUser = async () => {
    const token = localStorage.getItem('aemeth_token');
    if (!token) return;
    try {
      const res = await api.getMe();
      if (res.success) {
        setCurrentUser(res.user);
      } else {
        localStorage.removeItem('aemeth_token');
        setCurrentUser(null);
      }
    } catch {
      localStorage.removeItem('aemeth_token');
      setCurrentUser(null);
    }
  };

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
    refreshUser();
    loadProducts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('aemeth_token');
    setCurrentUser(null);
    if (activeTab === 'dashboard' || activeTab === 'admin') {
      setActiveTab('home');
    }
  };

  const handleQuickBuy = (product: Product) => {
    setCartItems([product]);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = (_orderId: string) => {
    setIsCheckoutOpen(false);
    setCartItems([]);
    if (currentUser) {
      setActiveTab('dashboard');
    } else {
      setIsAuthOpen(true);
    }
  };

  // Find bundle product for quick bundle navigation
  const bundleProduct = products.find((p) => p.type === 'bundle');

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col antialiased selection:bg-[#ff2a3b]/40 selection:text-white">
      
      {/* Floating Pill Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
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
                  setActiveTab('catalog');
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

        {activeTab === 'dashboard' && currentUser && (
          <CustomerDashboard
            currentUser={currentUser}
            onRefreshUser={refreshUser}
          />
        )}

        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenLegal={(tab) => setLegalModalTab(tab)}
        onNavigate={(tab) => setActiveTab(tab)}
      />

      {/* Modals */}
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

      {isCheckoutOpen && (
        <CheckoutModal
          products={cartItems.length > 0 ? cartItems : products.slice(0, 1)}
          currentUser={currentUser}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthOpen(false);
          }}
        />
      )}

      {legalModalTab && (
        <LegalModal
          initialTab={legalModalTab}
          onClose={() => setLegalModalTab(null)}
        />
      )}

    </div>
  );
}

export default App;
