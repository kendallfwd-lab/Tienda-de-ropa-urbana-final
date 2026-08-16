import React from 'react';
import {
  ArrowRight,
  MapPin,
  MessageCircle,
  Ruler,
  ShoppingBag,
  Sparkles,
  Star,
  Truck
} from 'lucide-react';
import { STORE_INFO } from '../data/storeData';

interface HeroBannerProps {
  onExploreCatalog: () => void;
  onGoToOrders: () => void;
  onGoToCombos: () => void;
  onGoToOutfitBuilder: () => void;
  onGoToLocation: () => void;
  onOpenSizeAdvisor?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreCatalog,
  onGoToOrders,
  onGoToCombos,
  onGoToOutfitBuilder,
  onGoToLocation,
  onOpenSizeAdvisor
}) => {
  return (
    <section id="inicio" className="relative overflow-hidden bg-zinc-950 text-white">
      {/* Portada principal basada en el letrero y logo real de Leslie Store */}
      <div className="relative min-h-[520px] sm:min-h-[620px] lg:min-h-[720px] flex items-end">
        <img
          src="/images/hero.webp"
          alt="Entrada de Leslie Store con el logo del lobo y el rótulo de la tienda"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-black/20" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-8 sm:pb-14 lg:pb-16 pt-28 sm:pt-40">
          <div className="max-w-3xl space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-3 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-[0.14em] sm:tracking-[0.16em] backdrop-blur-md">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span>Leslie Store · Streetwear en Puntarenas</span>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <p className="text-[11px] sm:text-sm font-bold uppercase tracking-[0.22em] sm:tracking-[0.28em] text-zinc-300">
                El Roble · Costa Rica
              </p>
              <h1 className="max-w-2xl text-3xl sm:text-5xl lg:text-7xl font-black uppercase tracking-[-0.04em] leading-[0.98] sm:leading-[0.95]">
                Streetwear con identidad propia.
              </h1>
              <p className="max-w-xl text-xs sm:text-base lg:text-lg leading-relaxed text-zinc-200">
                Camisetas gráficas oversize, conjuntos, gorras y calzado con la estética urbana que ves en tienda. Explora el catálogo y arma tu próximo outfit Leslie Store.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3">
              <button
                onClick={onExploreCatalog}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 px-5 sm:px-6 py-3 sm:py-3.5 text-xs font-black uppercase tracking-wider text-zinc-950 transition cursor-pointer shadow-md"
              >
                <ShoppingBag className="w-4 h-4" />
                Ver catálogo
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onGoToOutfitBuilder}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-black/40 px-5 sm:px-6 py-3 sm:py-3.5 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-black/60 cursor-pointer"
              >
                Armar outfit (-15%)
              </button>

              <a
                href={STORE_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 sm:px-6 py-3 sm:py-3.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-emerald-500 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                WhatsApp Directo
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-1 sm:pt-2 max-w-3xl">
              <button
                onClick={onGoToLocation}
                className="rounded-2xl border border-white/15 bg-black/45 p-2.5 sm:p-3 text-left backdrop-blur-md transition hover:bg-black/60 cursor-pointer"
              >
                <MapPin className="mb-1.5 sm:mb-2 w-4 h-4 text-red-500" />
                <span className="block text-[10px] sm:text-[11px] font-black uppercase">Ubicación</span>
                <span className="block text-[9px] sm:text-[10px] text-zinc-300">Frente al CTP</span>
              </button>

              <button
                onClick={onGoToOrders}
                className="rounded-2xl border border-white/15 bg-black/45 p-2.5 sm:p-3 text-left backdrop-blur-md transition hover:bg-black/60 cursor-pointer"
              >
                <Truck className="mb-1.5 sm:mb-2 w-4 h-4 text-blue-400" />
                <span className="block text-[10px] sm:text-[11px] font-black uppercase">Pedidos</span>
                <span className="block text-[9px] sm:text-[10px] text-zinc-300">Envíos a Costa Rica</span>
              </button>

              <button
                onClick={onGoToCombos}
                className="rounded-2xl border border-white/15 bg-black/45 p-2.5 sm:p-3 text-left backdrop-blur-md transition hover:bg-black/60 cursor-pointer"
              >
                <Star className="mb-1.5 sm:mb-2 w-4 h-4 text-amber-400" />
                <span className="block text-[10px] sm:text-[11px] font-black uppercase">Combos</span>
                <span className="block text-[9px] sm:text-[10px] text-zinc-300">Looks completos</span>
              </button>

              <button
                onClick={onOpenSizeAdvisor}
                disabled={!onOpenSizeAdvisor}
                className="rounded-2xl border border-white/15 bg-black/45 p-2.5 sm:p-3 text-left backdrop-blur-md transition hover:bg-black/60 disabled:opacity-60 cursor-pointer"
              >
                <Ruler className="mb-1.5 sm:mb-2 w-4 h-4 text-cyan-400" />
                <span className="block text-[10px] sm:text-[11px] font-black uppercase">Tallas</span>
                <span className="block text-[9px] sm:text-[10px] text-zinc-300">Guía rápida</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
