import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  Clock, 
  Ruler,
  MessageCircle, 
  Menu, 
  X, 
  LogIn,
  Sparkles,
  Flame
} from 'lucide-react';
import { WolfLogo } from './WolfLogo';
import { STORE_INFO } from '../data/storeData';
import { AdminUser } from '../lib/authService';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onNavigateTo: (sectionId: string) => void;
  onOpenSizeAdvisor?: () => void;
  onOpenAdminPanel?: () => void;
  adminUser?: AdminUser | null;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onNavigateTo,
  onOpenSizeAdvisor,
  onOpenAdminPanel,
  adminUser
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    onNavigateTo(sectionId);
  };

  return (
    <>
      {/* Top Notification Bar - Mobile-optimized Streetwear Black Bar */}
      <div className="bg-zinc-950 text-white text-xs font-semibold py-2 px-3 sm:px-4 border-b border-zinc-850">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Enter Button situated above logo + Location */}
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs min-w-0">
            {onOpenAdminPanel && (
              <button
                onClick={onOpenAdminPanel}
                title="Ingresar al sistema"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-200 hover:text-white border border-zinc-700 text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0"
              >
                <LogIn className="w-3 h-3 text-red-500" />
                <span>{adminUser ? `Admin (${adminUser.username})` : 'Enter'}</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 font-bold text-zinc-300 truncate">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shrink-0" />
              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 hidden xs:inline" />
              <span className="truncate text-[11px] sm:text-xs">Puntarenas (Frente al CTP)</span>
            </div>

            <span className="hidden xl:flex items-center gap-1 text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Lun a Sáb: 9am - 7pm</span>
            </span>
          </div>

          {/* Right: SINPE & WhatsApp Quick Links */}
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-200">
              <span className="px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 text-[9px] font-black uppercase tracking-wider">SINPE</span>
              <span className="text-[11px] font-mono font-bold">7194-9843</span>
            </div>

            <a
              href={STORE_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-300 transition-colors py-0.5 px-1.5 rounded-lg hover:bg-zinc-900"
              title="Escribir por WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
              <span className="hidden xs:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-zinc-200 py-2 sm:py-2.5'
            : 'bg-white border-b border-zinc-200 py-2.5 sm:py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Left: Logo - Leslie Store */}
            <div 
              onClick={() => handleNavClick('inicio')}
              className="cursor-pointer select-none group flex items-center gap-2 p-1 -m-1 rounded-2xl hover:bg-zinc-100/80 transition-all"
              title="Leslie Store • Streetwear Oficial"
            >
              <WolfLogo size={38} showText={true} />
            </div>

            {/* Middle: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              <button
                onClick={() => handleNavClick('catalogo')}
                className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-zinc-800 hover:text-zinc-950 hover:bg-zinc-100 transition-all"
              >
                Catálogo Oversize
              </button>

              <button
                onClick={() => handleNavClick('armador-outfits')}
                className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-zinc-950 text-white hover:bg-zinc-900 transition-all flex items-center gap-1.5 shadow-sm border border-zinc-800"
              >
                <span className="px-1 py-0.2 rounded bg-red-600 text-white text-[10px] font-black">-15%</span>
                <span>Armar Outfit</span>
              </button>

              <button
                onClick={() => handleNavClick('combos')}
                className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-zinc-800 hover:text-zinc-950 hover:bg-zinc-100 transition-all"
              >
                Combos Clemont
              </button>

              <button
                onClick={() => handleNavClick('pedidos')}
                className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-zinc-800 hover:text-zinc-950 hover:bg-zinc-100 transition-all"
              >
                Apartar Pedido
              </button>

              <button
                onClick={() => handleNavClick('tiktok')}
                className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-zinc-800 hover:text-zinc-950 hover:bg-zinc-100 transition-all flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                <span>TikTok ({STORE_INFO.followersTikTok})</span>
              </button>

              <button
                onClick={() => handleNavClick('ubicacion')}
                className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-zinc-800 hover:text-zinc-950 hover:bg-zinc-100 transition-all"
              >
                Ubicación
              </button>
            </nav>

            {/* Right Tools: Combos, Size advisor, Shopping Cart, and Mobile Menu */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              
              {/* Combos Quick Access Button (Direct in top navbar) */}
              <button
                onClick={() => handleNavClick('combos')}
                aria-label="Ver combos y promociones"
                className="relative flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-950 font-black text-xs uppercase tracking-wider border border-zinc-300 sm:border-2 sm:border-zinc-950 shadow-xs transition-all cursor-pointer select-none min-h-[42px]"
                title="Ver Combos Clemont"
              >
                <Flame className="w-3.5 h-3.5 text-red-600 fill-red-600 shrink-0" />
                <span className="font-heading tracking-wide">Combos</span>
                <span className="hidden md:inline-block px-1 py-0.2 rounded bg-red-600 text-white text-[9px] font-black uppercase ml-0.5">
                  Top
                </span>
              </button>

              {/* Size advisor button (Desktop) */}
              {onOpenSizeAdvisor && (
                <button
                  onClick={onOpenSizeAdvisor}
                  title="Calcular Talla"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 text-xs font-black tracking-wider uppercase transition-colors cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5 text-blue-900" />
                  <span>Guía de Tallas</span>
                </button>
              )}

              {/* Shopping Cart Button - Enhanced for Mobile & Desktop with Items Counter */}
              <button
                id="cart-button"
                onClick={onOpenCart}
                aria-label="Abrir carrito de compras"
                className={`relative flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider border-2 border-zinc-950 shadow-md transition-all active:scale-95 cursor-pointer select-none min-h-[42px] ${
                  cartCount > 0 
                    ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 ring-2 ring-amber-400/50 ring-offset-1 animate-pulse-subtle' 
                    : 'bg-zinc-950 hover:bg-zinc-900 text-white'
                }`}
                title="Ver Carrito de Compras"
              >
                <ShoppingBag className={`w-4 h-4 stroke-[2.5] ${cartCount > 0 ? 'text-zinc-950' : 'text-amber-400'}`} />
                <span className="font-heading tracking-wide">
                  Carrito
                </span>
                
                {cartCount > 0 ? (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-zinc-950 text-amber-300 text-[11px] font-black font-mono ml-0.5 border border-zinc-800 shadow-xs">
                    {cartCount}
                  </span>
                ) : (
                  <span className="hidden xs:inline-flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-mono ml-0.5">
                    0
                  </span>
                )}
              </button>

              {/* Mobile menu toggle button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Abrir menú"
                className="lg:hidden p-2 rounded-xl text-zinc-900 hover:bg-zinc-100 border border-zinc-300 transition-colors cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-zinc-200 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => handleNavClick('catalogo')}
                className="p-3 text-left rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-900 transition-colors uppercase border border-zinc-200/80 active:scale-98"
              >
                👕 Catálogo Oversize
              </button>

              <button
                onClick={() => handleNavClick('armador-outfits')}
                className="p-3 text-left rounded-xl bg-zinc-950 text-white transition-colors uppercase flex items-center justify-between border border-zinc-800 active:scale-98"
              >
                <span>✨ Armar Outfit</span>
                <span className="text-[10px] bg-red-600 px-1.5 py-0.5 rounded font-black">-15%</span>
              </button>

              <button
                onClick={() => handleNavClick('combos')}
                className="p-3 text-left rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-900 transition-colors uppercase border border-zinc-200/80 active:scale-98"
              >
                🏷️ Combos Clemont
              </button>

              <button
                onClick={() => handleNavClick('pedidos')}
                className="p-3 text-left rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-900 transition-colors uppercase border border-zinc-200/80 active:scale-98"
              >
                📦 Apartar Pedido
              </button>

              <button
                onClick={() => handleNavClick('tiktok')}
                className="p-3 text-left rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-900 transition-colors uppercase border border-zinc-200/80 active:scale-98"
              >
                🎬 TikTok ({STORE_INFO.followersTikTok})
              </button>

              <button
                onClick={() => handleNavClick('ubicacion')}
                className="p-3 text-left rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-900 transition-colors uppercase border border-zinc-200/80 active:scale-98"
              >
                📍 El Roble (CTP)
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {onOpenSizeAdvisor && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSizeAdvisor();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 font-bold text-xs flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer active:scale-98"
                >
                  <Ruler className="w-4 h-4 text-blue-900" />
                  <span>Guía de Tallas (Boxy &amp; Oversize)</span>
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-600">
              <span>SINPE Móvil: <strong>7194-9843</strong></span>
              <a
                href={STORE_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 font-bold flex items-center gap-1 hover:underline"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};


