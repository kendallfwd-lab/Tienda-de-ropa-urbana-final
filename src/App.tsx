import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { BrandMarquee } from './components/BrandMarquee';
import { OutfitBuilder } from './components/OutfitBuilder';
import { ProductCatalog } from './components/ProductCatalog';
import { CombosSection } from './components/CombosSection';
import { OrderSection } from './components/OrderSection';
import { TikTokShowcase } from './components/TikTokShowcase';
import { StoreInfoSection } from './components/StoreInfoSection';
import { ReviewsSection } from './components/ReviewsSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SizeAdvisorModal } from './components/SizeAdvisorModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { CartDrawer } from './components/CartDrawer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { Product, CartItem, TikTokVideo } from './types';
import { PRODUCTS, TIKTOK_VIDEOS, STORE_INFO } from './data/storeData';
import { fetchProducts, fetchTikTokVideos, getLocalProducts, getLocalTikToks } from './lib/storeService';
import { AdminUser, getCurrentAdminSession, logoutAdminUser } from './lib/authService';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => getLocalProducts());
  const [tiktokVideos, setTikTokVideos] = useState<TikTokVideo[]>(() => getLocalTikToks());
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => getCurrentAdminSession());
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('leslie_store_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [isSizeAdvisorOpen, setIsSizeAdvisorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load products and TikTok videos from Firestore / Database on mount
  useEffect(() => {
    let isMounted = true;
    
    async function loadDatabaseContent() {
      try {
        const [fetchedProducts, fetchedTikToks] = await Promise.all([
          fetchProducts(),
          fetchTikTokVideos()
        ]);
        if (isMounted) {
          if (fetchedProducts && fetchedProducts.length > 0) {
            setProducts(fetchedProducts);
          }
          if (fetchedTikToks && fetchedTikToks.length > 0) {
            setTikTokVideos(fetchedTikToks);
          }
        }
      } catch (e) {
        console.warn('Could not load Firestore data', e);
      }
    }

    loadDatabaseContent();
    return () => { isMounted = false; };
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('leslie_store_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAddToCart = (product: Product, size: string, quantity: number = 1) => {
    setCartItems(prev => {
      const itemId = `${product.id}-${size}`;
      const existing = prev.find(item => item.id === itemId);
      if (existing) {
        return prev.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: itemId,
            product,
            selectedSize: size,
            quantity
          }
        ];
      }
    });

    showToast(`✓ Agregado: ${product.name} (Talla ${size})`);
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    showToast('Prenda eliminada del carrito');
  };

  const handleClearCart = () => {
    setCartItems([]);
    showToast('Carrito vaciado');
  };

  const handleDirectWhatsApp = (product: Product, size: string, quantity: number = 1) => {
    const totalCRC = (product.priceCRC || 0) * (quantity || 1);
    const msg = `🐺 *CONSULTA / PEDIDO DIRECTO - LESLIE STORE*\n\n` +
      `¡Hola! Me interesa la siguiente prenda:\n` +
      `• *${product.name}*\n` +
      `• Marca: ${product.brand}\n` +
      `• Talla: *${size}*\n` +
      `• Cantidad: ${quantity}\n` +
      `• Total: ₡${(totalCRC || 0).toLocaleString()}\n\n` +
      `¿Tienen disponible para entrega en Puntarenas o envío por Correos de CR?`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/50671949843?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const handleAddQuickItem = (productId: string, size: string) => {
    const prod = products.find(p => p.id === productId) || PRODUCTS.find(p => p.id === productId);
    if (prod) {
      handleAddToCart(prod, size, 1);
    }
  };

  const handleNavigateTo = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleProceedToOrderFromCart = () => {
    setIsCartOpen(false);
    handleNavigateTo('pedidos');
  };

  const handleOpenAdminTrigger = () => {
    if (adminUser) {
      setIsAdminPanelOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleLogoutAdmin = async () => {
    await logoutAdminUser();
    setAdminUser(null);
    setIsAdminPanelOpen(false);
    showToast('✓ Sesión administrativa cerrada correctamente');
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-600 selection:text-white font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 border border-white/20">
          <CheckCircle2 className="w-4 h-4 text-cyan-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar with Admin Panel & Cart */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigateTo={handleNavigateTo}
        onOpenSizeAdvisor={() => setIsSizeAdvisorOpen(true)}
        onOpenAdminPanel={handleOpenAdminTrigger}
        adminUser={adminUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Banner with Modern Light & Indigo/Violet Gradient Theme */}
        <HeroBanner
          onExploreCatalog={() => handleNavigateTo('catalogo')}
          onGoToOrders={() => handleNavigateTo('pedidos')}
          onGoToCombos={() => handleNavigateTo('combos')}
          onGoToOutfitBuilder={() => handleNavigateTo('armador-outfits')}
          onGoToLocation={() => handleNavigateTo('ubicacion')}
          onOpenSizeAdvisor={() => setIsSizeAdvisorOpen(true)}
        />

        {/* Rolling Brands Marquee */}
        <BrandMarquee />

        {/* Interactive 3-Piece Outfit Builder with 15% Discount */}
        <OutfitBuilder
          products={products}
          onAddToCart={handleAddToCart}
          onDirectWhatsApp={handleDirectWhatsApp}
          onOpenSizeAdvisor={() => setIsSizeAdvisorOpen(true)}
        />

        {/* Product Catalog with Categories, Brand & Price Filters */}
        <ProductCatalog
          products={products}
          onSelectProduct={(product) => setSelectedProductModal(product)}
          onAddToCart={handleAddToCart}
          onDirectWhatsApp={handleDirectWhatsApp}
          initialSearch={searchQuery}
          onOpenSizeAdvisor={() => setIsSizeAdvisorOpen(true)}
        />

        {/* Combos and Special Packs */}
        <CombosSection
          products={products}
          onAddToCart={handleAddToCart}
          onDirectWhatsApp={handleDirectWhatsApp}
          onSelectProduct={(product) => setSelectedProductModal(product)}
          onGoToOutfitBuilder={() => handleNavigateTo('armador-outfits')}
        />

        {/* TikTok & Social Showcase */}
        <TikTokShowcase videos={tiktokVideos} />

        {/* Order Section (Apartado de Pedidos con SINPE Móvil) */}
        <OrderSection
          items={cartItems}
          onAddQuickItem={handleAddQuickItem}
          onOpenCart={() => setIsCartOpen(true)}
        />

        {/* Physical Store Info & Location (Frente al CTP El Roble) */}
        <StoreInfoSection />

        {/* Reviews Section (5.0 ⭐ Google Maps) */}
        <ReviewsSection />
      </main>

      {/* Footer */}
      <Footer 
        onNavigateTo={handleNavigateTo} 
        onOpenAdminPanel={handleOpenAdminTrigger}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductModal}
        onClose={() => setSelectedProductModal(null)}
        onAddToCart={handleAddToCart}
        onDirectWhatsApp={handleDirectWhatsApp}
        onOpenSizeAdvisor={() => {
          setSelectedProductModal(null);
          setIsSizeAdvisorOpen(true);
        }}
      />

      {/* Size & Fit Advisor Modal */}
      <SizeAdvisorModal
        isOpen={isSizeAdvisorOpen}
        onClose={() => setIsSizeAdvisorOpen(false)}
        onSelectSize={(size) => {
          showToast(`Talla ${size} seleccionada como preferencia`);
        }}
      />

      {/* Admin Login Modal (Username / Email & Password with Password Reset via Email) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={(user) => {
          setAdminUser(user);
          setIsAdminLoginOpen(false);
          setIsAdminPanelOpen(true);
          showToast(`✓ Bienvenido, ${user.username}`);
        }}
        onShowToast={showToast}
      />

      {/* Admin Panel Modal (Base de Datos, Productos, TikToks, Exportador Shopify & Seguridad) */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        products={products}
        tiktokVideos={tiktokVideos}
        adminUser={adminUser}
        onLogout={handleLogoutAdmin}
        onProductsUpdated={(updated) => setProducts(updated)}
        onTikToksUpdated={(updated) => setTikTokVideos(updated)}
        onShowToast={showToast}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToOrder={handleProceedToOrderFromCart}
      />

      {/* Floating WhatsApp Quick Contact Button */}
      <FloatingWhatsApp />
    </div>
  );
}
