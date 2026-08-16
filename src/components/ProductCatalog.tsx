import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Flame, 
  MessageCircle, 
  Search, 
  SlidersHorizontal, 
  Eye, 
  Check, 
  Star, 
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS, STORE_BRANDS, STORE_INFO } from '../data/storeData';

interface ProductCatalogProps {
  products?: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: string) => void;
  onDirectWhatsApp: (product: Product, size: string) => void;
  initialSearch?: string;
  onOpenSizeAdvisor?: () => void;
}

const CATEGORIES = [
  { id: 'all', name: 'Todos los Drops', icon: '🔥' },
  { id: 'camisetas', name: 'Camisetas Oversize', icon: '👕' },
  { id: 'conjuntos', name: 'Shorts & Conjuntos', icon: '🩳' },
  { id: 'jeans', name: 'Jeans & Cargo', icon: '👖' },
  { id: 'gorras', name: 'Gorras Streetwear', icon: '🧢' },
  { id: 'calzado', name: 'Tenis & Calzado', icon: '👟' },
  { id: 'combos', name: 'Combos & Packs', icon: '🏷️' },
];

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products = PRODUCTS,
  onSelectProduct,
  onAddToCart,
  onDirectWhatsApp,
  initialSearch = '',
  onOpenSizeAdvisor
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [selectedSizesMap, setSelectedSizesMap] = useState<{ [productId: string]: string }>({});

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      // Brand filter
      if (selectedBrand !== 'all' && p.brand !== selectedBrand) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchTag = p.tag?.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchDesc && !matchTag) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.priceCRC - b.priceCRC;
      if (sortBy === 'price-desc') return b.priceCRC - a.priceCRC;
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [selectedCategory, selectedBrand, searchQuery, sortBy]);

  const handleSelectSize = (productId: string, size: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSizesMap((prev) => ({ ...prev, [productId]: size }));
  };

  const getActiveSize = (product: Product) => {
    return selectedSizesMap[product.id] || product.sizes[0] || 'M';
  };

  return (
    <section id="catalogo" className="py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-950 text-white text-xs font-black uppercase tracking-widest border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span>Drops &amp; Confección 2026</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tighter uppercase font-heading">
              Catálogo Oficial Leslie Store
            </h2>
            
            <p className="text-zinc-600 text-sm sm:text-base">
              Prendas de alta confección urbana, corte Boxy Fit y telas pesadas. Elige tu talla y agrega al carrito o consulta en WhatsApp al <strong>7194 9843</strong>.
            </p>
          </div>

          {/* Quick size helper trigger */}
          {onOpenSizeAdvisor && (
            <button
              onClick={onOpenSizeAdvisor}
              className="px-4 py-2.5 rounded-2xl bg-zinc-50 border border-zinc-300 hover:border-zinc-950 text-zinc-900 text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-2 shrink-0 transition-all hover:bg-zinc-100"
            >
              <span className="text-blue-900">📏</span>
              <span>Guía de Tallas Boxy</span>
            </button>
          )}
        </div>

        {/* Filters and Search Bar Container */}
        <div className="p-4 sm:p-5 rounded-3xl bg-zinc-50 border border-zinc-200 shadow-sm mb-8 space-y-4">
          {/* Categories Tab Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-zinc-950 text-white shadow-md border border-zinc-800 scale-[1.02]'
                      : 'bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input, Brand Filter & Sorting Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-zinc-200 items-center">
            {/* Search */}
            <div className="sm:col-span-6 relative">
              <input
                type="text"
                placeholder="Buscar por diseño, pedrería o estilo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 transition-colors"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-zinc-400 hover:text-zinc-600 absolute right-3 top-2.5 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Brand Dropdown */}
            <div className="sm:col-span-3">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded-2xl px-3 py-2.5 text-xs text-zinc-900 font-black uppercase focus:outline-none focus:border-zinc-950"
              >
                <option value="all">Todas las Marcas</option>
                {STORE_BRANDS.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="sm:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-white border border-zinc-300 rounded-2xl px-3 py-2.5 text-xs text-zinc-900 font-black uppercase focus:outline-none focus:border-zinc-950"
              >
                <option value="featured">✨ Destacados / Drops</option>
                <option value="price-asc">💵 Menor a Mayor Precio</option>
                <option value="price-desc">💎 Mayor a Menor Precio</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6 text-xs text-zinc-500 font-bold uppercase tracking-wider">
          <span>Mostrando <strong>{filteredProducts.length}</strong> prendas en tienda</span>
          <span className="hidden sm:inline">Puntarenas • Envíos Express Costa Rica</span>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center mx-auto text-xl">
              🔍
            </div>
            <h3 className="text-base font-black text-zinc-950 uppercase">No encontramos prendas con esos filtros</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Intenta cambiar la búsqueda o restablecer los filtros para ver las camisetas y combos disponibles.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedBrand('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-zinc-950 text-white text-xs font-black uppercase hover:bg-zinc-900 cursor-pointer"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {filteredProducts.map((product) => {
              const activeSize = getActiveSize(product);

              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group rounded-2xl sm:rounded-3xl bg-white border sm:border-2 border-zinc-900 p-2.5 sm:p-4 flex flex-col justify-between space-y-2.5 sm:space-y-4 hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="space-y-2 sm:space-y-3">
                    {/* Image Frame */}
                    <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200">
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-1.5 sm:top-2.5 left-1.5 sm:left-2.5 flex flex-col gap-1 z-10">
                        {product.tag && (
                          <span className="px-1.5 sm:px-2.5 py-0.5 rounded sm:rounded-md bg-red-600 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow">
                            {product.tag}
                          </span>
                        )}
                        {product.isViral && !product.tag && (
                          <span className="px-1.5 sm:px-2.5 py-0.5 rounded sm:rounded-md bg-zinc-950 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow border border-zinc-800">
                            Viral 🔥
                          </span>
                        )}
                      </div>

                      {/* Stock pill */}
                      {product.stockCount && product.stockCount <= 4 && (
                        <div className="absolute bottom-1.5 sm:bottom-2.5 left-1.5 sm:left-2.5 px-1.5 sm:px-2 py-0.5 rounded bg-red-600 text-white text-[8px] sm:text-[10px] font-black shadow">
                          ¡Últimas {product.stockCount}!
                        </div>
                      )}

                      {/* Quick view hover icon */}
                      <div className="absolute inset-0 bg-zinc-950/20 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center">
                        <span className="p-2.5 rounded-full bg-white text-zinc-950 shadow-lg flex items-center gap-1 text-xs font-black uppercase tracking-wider transform scale-90 group-hover:scale-100 transition-transform">
                          <Eye className="w-3.5 h-3.5 text-blue-900" />
                          <span>Ver Detalles</span>
                        </span>
                      </div>
                    </div>

                    {/* Brand & Name */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] sm:text-[11px] font-black text-blue-900 uppercase tracking-wider truncate">
                          {product.brand}
                        </span>
                        <span className="text-[8px] sm:text-[10px] text-zinc-400 font-bold uppercase hidden xs:inline">
                          {product.category === 'camisetas' ? 'Boxy' : 'Drop'}
                        </span>
                      </div>

                      <h3 className="font-black text-zinc-950 text-xs sm:text-sm leading-tight sm:leading-snug line-clamp-2 mt-0.5 sm:mt-1 uppercase">
                        {product.name}
                      </h3>
                    </div>

                    {/* Sizes Selection Chips on card */}
                    <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between text-[9px] sm:text-[11px]">
                        <span className="text-zinc-500 font-bold uppercase">Talla:</span>
                        <span className="font-black text-zinc-950 font-mono">{activeSize}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-0.5">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={(e) => handleSelectSize(product.id, size, e)}
                            className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded sm:rounded-lg text-[10px] sm:text-xs font-black transition-all ${
                              activeSize === size
                                ? 'bg-zinc-950 text-white shadow-xs'
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="pt-2 sm:pt-3 border-t border-zinc-200 space-y-2 sm:space-y-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="flex items-baseline gap-1 sm:gap-1.5">
                          <span className="text-sm sm:text-xl font-black text-zinc-950 font-mono">
                            ₡{(product.priceCRC || 0).toLocaleString()}
                          </span>
                          {product.originalPriceCRC ? (
                            <span className="text-[9px] sm:text-xs text-zinc-400 line-through font-mono font-bold hidden xs:inline">
                              ₡{(product.originalPriceCRC || 0).toLocaleString()}
                            </span>
                          ) : null}
                        </div>
                        <span className="text-[8px] sm:text-[10px] text-zinc-500 font-mono block">
                          ≈ ${product.priceUSD} USD
                        </span>
                      </div>

                      <span className="text-[8px] sm:text-[10px] text-emerald-700 font-black bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-300 uppercase">
                        Stock
                      </span>
                    </div>

                    {/* Button Grid: Add to Cart + WhatsApp Direct */}
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => onAddToCart(product, activeSize)}
                        className="w-full py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl sm:rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 shadow-sm active:scale-95 transition-all border border-zinc-800 cursor-pointer"
                        title="Agregar al carrito"
                      >
                        <ShoppingBag className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-400" />
                        <span className="truncate">Carrito</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDirectWhatsApp(product, activeSize)}
                        className="w-full py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                        title="Consultar por WhatsApp"
                      >
                        <MessageCircle className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-white text-emerald-600" />
                        <span className="truncate">WhatsApp</span>
                      </button>
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

