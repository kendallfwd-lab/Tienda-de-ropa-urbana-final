import React from 'react';
import { ShoppingBag, Flame, Tag, Check, ArrowRight, MessageCircle, Percent } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS, STORE_INFO } from '../data/storeData';

interface CombosSectionProps {
  products?: Product[];
  onAddToCart: (product: Product, size: string) => void;
  onDirectWhatsApp: (product: Product, size: string) => void;
  onSelectProduct: (product: Product) => void;
  onGoToOutfitBuilder?: () => void;
}

export const CombosSection: React.FC<CombosSectionProps> = ({
  products = PRODUCTS,
  onAddToCart,
  onDirectWhatsApp,
  onSelectProduct,
  onGoToOutfitBuilder
}) => {
  const comboProducts = products.filter(p => p.category === 'combos' || p.isViral);

  return (
    <section id="combos" className="py-16 bg-zinc-100 relative border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Container with Black/White Base and Red/Blue accents */}
        <div className="rounded-3xl bg-zinc-950 p-8 lg:p-12 relative overflow-hidden shadow-2xl text-white border-2 border-zinc-800">
          {/* Subtle accent corner highlights */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-950/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-950/30 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="max-w-2xl space-y-3 mb-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-xs font-black uppercase tracking-widest text-white">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              Packs &amp; Drops con -15% OFF
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter leading-tight uppercase font-heading">
              Combos de Outfits Completos Leslie Store
            </h2>
            
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Lleva tu outfit armado listo para la calle. Camiseta gráfica + Short Clemont o Jeans + Gorra trucker con hasta un <strong className="text-white">15% de descuento especial</strong>.
            </p>
          </div>

          {/* Combos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {comboProducts.slice(0, 3).map((combo) => (
              <div
                key={combo.id}
                className="rounded-3xl bg-white text-zinc-900 p-5 flex flex-col justify-between space-y-4 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 shadow-xl border-2 border-zinc-900"
              >
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200">
                    <img
                      src={combo.image}
                      alt={combo.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow">
                        {combo.tag || 'Pack Especial'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-black text-blue-900 uppercase tracking-wider">
                      {combo.brand}
                    </span>
                    <h3 className="text-base font-black text-zinc-950 leading-snug uppercase">
                      {combo.name}
                    </h3>
                  </div>

                  <p className="text-xs text-zinc-600 line-clamp-2">
                    {combo.description}
                  </p>

                  <ul className="space-y-1 text-xs text-zinc-700 pt-1">
                    {combo.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5 font-medium">
                        <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-zinc-200 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-zinc-950 font-mono">
                        ₡{(combo.priceCRC || 0).toLocaleString()}
                      </span>
                      {combo.originalPriceCRC ? (
                        <span className="text-xs text-zinc-400 line-through block font-mono font-bold">
                          ₡{(combo.originalPriceCRC || 0).toLocaleString()}
                        </span>
                      ) : null}
                    </div>

                    <button
                      onClick={() => onSelectProduct(combo)}
                      className="text-xs text-blue-900 hover:text-blue-950 font-black uppercase underline underline-offset-2"
                    >
                      Personalizar tallas
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onAddToCart(combo, 'L')}
                      className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all border border-zinc-800"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-white" />
                      <span>Al Carrito</span>
                    </button>

                    <button
                      onClick={() => onDirectWhatsApp(combo, 'L')}
                      className="w-full py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Callout */}
          {onGoToOutfitBuilder && (
            <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <span className="text-zinc-400 font-bold uppercase tracking-wider text-center sm:text-left">
                ¿Prefieres armar tu propia combinación con 15% OFF?
              </span>
              <button
                onClick={onGoToOutfitBuilder}
                className="px-5 py-2.5 rounded-2xl bg-white text-zinc-950 font-black text-xs hover:bg-zinc-100 shadow-md flex items-center gap-2 transition-all shrink-0 uppercase tracking-wider"
              >
                <span>Armar Outfit Urbano</span>
                <ArrowRight className="w-3.5 h-3.5 text-red-600" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

