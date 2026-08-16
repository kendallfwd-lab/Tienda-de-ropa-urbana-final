import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  MessageCircle, 
  Star, 
  Check, 
  Truck, 
  ShieldCheck, 
  Sparkles,
  Ruler,
  Share2,
  ChevronRight
} from 'lucide-react';
import { Product } from '../types';
import { STORE_INFO } from '../data/storeData';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, quantity: number) => void;
  onDirectWhatsApp: (product: Product, size: string, quantity: number) => void;
  onOpenSizeAdvisor?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onDirectWhatsApp,
  onOpenSizeAdvisor
}) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync state when product changes
  React.useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || 'M');
      setSelectedImage(product.image);
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border-2 border-zinc-950 overflow-hidden my-8 text-zinc-900">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
          {/* Gallery Col */}
          <div className="md:col-span-6 space-y-4">
            {/* Main Active Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 border-2 border-zinc-950">
              <img
                src={selectedImage || product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />

              {product.tag && (
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-lg bg-zinc-950 text-white text-xs font-black uppercase tracking-wider border border-zinc-800 shadow">
                    {product.tag}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.galleryImages && product.galleryImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {product.galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === img
                        ? 'border-zinc-950 ring-2 ring-zinc-950/20'
                        : 'border-zinc-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quality specs */}
            <div className="p-4 rounded-2xl bg-zinc-50 border-2 border-zinc-950 space-y-2 text-xs">
              <span className="font-black text-zinc-950 uppercase tracking-wider text-[11px] block">
                ✦ Especificaciones Streetwear
              </span>
              <ul className="space-y-1 text-zinc-700 font-medium">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-red-600 font-black" />
                  <span>Algodón pesado de alta densidad (240 GSM)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-red-600 font-black" />
                  <span>Costuras reforzadas de hombro a hombro</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-red-600 font-black" />
                  <span>Acabado suave pre-lavado (No encoge)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Product Details & Purchase Controls */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-900">
                    {product.brand}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-zinc-900 font-black">5.0 ({product.reviewsCount} opiniones)</span>
                  </div>
                </div>

                <h2 className="text-2xl font-black text-zinc-950 leading-tight mt-1 uppercase font-heading">
                  {product.name}
                </h2>
              </div>

              {/* Price box */}
              <div className="p-4 rounded-2xl bg-zinc-50 border-2 border-zinc-950 flex items-baseline justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-zinc-950 font-mono">
                      ₡{(product.priceCRC || 0).toLocaleString()}
                    </span>
                    {product.originalPriceCRC ? (
                      <span className="text-sm text-zinc-400 line-through font-mono">
                        ₡{(product.originalPriceCRC || 0).toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-xs text-zinc-500 font-mono font-bold">
                    Precio internacional: ≈ ${product.priceUSD} USD
                  </span>
                </div>

                <span className="text-xs font-black text-zinc-950 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-300 uppercase">
                  En Stock Puntarenas
                </span>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                {product.description}
              </p>

              {/* Size Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-zinc-900 uppercase">Selecciona tu Talla:</span>
                  {onOpenSizeAdvisor && (
                    <button
                      onClick={onOpenSizeAdvisor}
                      className="text-blue-900 hover:text-blue-950 font-black uppercase flex items-center gap-1"
                    >
                      <Ruler className="w-3.5 h-3.5 text-red-600" />
                      <span>Calcular mi Talla</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`py-2.5 px-3 rounded-xl font-black text-xs border-2 uppercase transition-all ${
                        selectedSize === size
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-md scale-[1.02]'
                          : 'bg-white text-zinc-800 border-zinc-300 hover:border-zinc-950'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-zinc-900 uppercase">Cantidad:</span>
                <div className="flex items-center border-2 border-zinc-950 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 font-black hover:bg-zinc-100 text-zinc-900"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 font-mono font-black text-zinc-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 font-black hover:bg-zinc-100 text-zinc-900"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-zinc-200 space-y-2.5">
              <button
                onClick={() => {
                  onAddToCart(product, selectedSize, quantity);
                  onClose();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 border border-zinc-800"
              >
                <ShoppingBag className="w-4 h-4 text-red-500" />
                <span>Agregar al Carrito (Talla {selectedSize})</span>
              </button>

              <button
                onClick={() => {
                  onDirectWhatsApp(product, selectedSize, quantity);
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                <span>Pedir Directo por WhatsApp</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 font-bold">
                <span>📍 Retiro en El Roble o Envío Nacional</span>
                <button
                  onClick={handleShare}
                  className="hover:text-zinc-900 flex items-center gap-1 font-black uppercase"
                >
                  <Share2 className="w-3 h-3 text-blue-900" />
                  <span>{copiedLink ? 'Enlace copiado' : 'Compartir'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

