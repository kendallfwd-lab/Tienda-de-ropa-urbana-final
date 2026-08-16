import React from 'react';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  MessageCircle, 
  Plus, 
  Minus, 
  ShieldCheck,
  Tag,
  CheckCircle2,
  Truck
} from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onProceedToOrder: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToOrder
}) => {
  if (!isOpen) return null;

  const totalItemsCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotalCRC = items.reduce((sum, item) => sum + (item.product.priceCRC || 0) * (item.quantity || 1), 0);
  const subtotalUSD = Math.round(subtotalCRC / 515);

  const handleQuickWhatsAppCheckout = () => {
    if (items.length === 0) return;

    let msg = `🐺 *CONSULTA / PEDIDO DESDE EL CARRITO - LESLIE STORE*\n\n`;
    msg += `¡Hola! Me interesan las siguientes prendas de su tienda:\n\n`;
    items.forEach((item, idx) => {
      const itemSubtotal = (item.product?.priceCRC || 0) * (item.quantity || 1);
      msg += `${idx + 1}. *${item.product.name}*\n`;
      msg += `   • Marca: ${item.product.brand || 'Leslie Store'}\n`;
      msg += `   • Talla seleccionada: *${item.selectedSize}*\n`;
      msg += `   • Cantidad: *${item.quantity}*\n`;
      msg += `   • Precio: ₡${(item.product?.priceCRC || 0).toLocaleString()} c/u\n`;
      msg += `   • Subtotal: *₡${itemSubtotal.toLocaleString()}*\n\n`;
    });
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💰 *TOTAL PRENDAS:* *₡${(subtotalCRC || 0).toLocaleString()}* (~$${subtotalUSD} USD)\n\n`;
    msg += `📍 ¿Tienen disponibilidad en su local en El Roble (Frente al CTP) o para envío por Correos de Costa Rica?`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/50671949843?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex w-full sm:w-auto">
        <div className="w-full sm:w-[480px] max-w-full bg-white flex flex-col text-zinc-900 shadow-2xl relative">
          
          {/* Top Header */}
          <div className="px-4 py-3.5 sm:px-6 sm:py-4 bg-zinc-950 text-white border-b-2 border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 shadow-xs">
                <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base uppercase tracking-wider text-white flex items-center gap-2">
                  <span>Tu Carrito de Ropa</span>
                  {totalItemsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 text-[11px] font-black font-mono">
                      {totalItemsCount} {totalItemsCount === 1 ? 'prenda' : 'prendas'}
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-zinc-400 font-medium">
                  Leslie Store • El Roble, Puntarenas
                </p>
              </div>
            </div>

            <button
              id="close-cart-drawer"
              onClick={onClose}
              aria-label="Cerrar carrito"
              className="w-10 h-10 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-400 hover:text-white border border-zinc-800 transition-all flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3.5 bg-zinc-100/70">
            {items.length === 0 ? (
              <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-white border-2 border-zinc-950 flex items-center justify-center text-3xl shadow-sm">
                  🛍️
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <h4 className="font-black text-zinc-950 text-base uppercase tracking-wide">Tu carrito está vacío</h4>
                  <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                    Aún no has agregado prendas. Revisa nuestras camisetas oversize, combos Clemont y gorras urbanas.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-zinc-950 hover:bg-zinc-900 active:scale-95 text-white font-black text-xs rounded-2xl shadow-md uppercase tracking-wider transition-all border border-zinc-800 cursor-pointer"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              <>
                {/* Control bar: Count & Clear */}
                <div className="flex items-center justify-between px-1 text-xs font-bold text-zinc-600 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-zinc-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Prendas en tu orden ({items.length}):</span>
                  </span>
                  
                  <button
                    onClick={onClearCart}
                    className="text-red-600 hover:text-red-700 active:scale-95 flex items-center gap-1 font-black cursor-pointer text-xs py-1 px-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Vaciar todo</span>
                  </button>
                </div>

                {/* Garments List */}
                <div className="space-y-3">
                  {items.map((item) => {
                    const unitPrice = item.product?.priceCRC || 0;
                    const itemTotal = unitPrice * (item.quantity || 1);

                    return (
                      <div
                        key={item.id}
                        className="p-3 sm:p-4 rounded-2xl bg-white border-2 border-zinc-950 shadow-sm hover:shadow-md transition-all flex gap-3 sm:gap-4 items-start"
                      >
                        {/* Product Image - Larger & High Clarity */}
                        <div className="relative shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            referrerPolicy="no-referrer"
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-zinc-100 border border-zinc-300 shadow-2xs"
                          />
                          {item.quantity > 1 && (
                            <span className="absolute -top-1.5 -left-1.5 bg-zinc-950 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border border-zinc-700 font-mono shadow-xs">
                              x{item.quantity}
                            </span>
                          )}
                        </div>

                        {/* Garment Details & Controls */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                          {/* Brand & Talla Badge */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] sm:text-[11px] font-black uppercase text-blue-900 tracking-wider truncate">
                              {item.product.brand || 'Leslie Store'}
                            </span>

                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-950 text-amber-300 text-[10px] sm:text-[11px] font-black uppercase tracking-wider shrink-0 border border-zinc-800">
                              <Tag className="w-2.5 h-2.5" />
                              <span>Talla {item.selectedSize}</span>
                            </span>
                          </div>

                          {/* Garment Name */}
                          <h4 className="text-xs sm:text-sm font-black text-zinc-950 leading-tight uppercase line-clamp-2 my-1">
                            {item.product.name}
                          </h4>

                          {/* Price breakdown */}
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="text-[11px] text-zinc-500 font-bold">
                              <span>₡{unitPrice.toLocaleString()}</span>
                              {item.quantity > 1 && (
                                <span className="text-[10px] text-zinc-400 ml-1">c/u</span>
                              )}
                            </div>

                            <div className="font-mono text-zinc-950 font-black text-sm sm:text-base">
                              ₡{itemTotal.toLocaleString()}
                            </div>
                          </div>

                          {/* Controls row: Stepper + Delete button */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-200 mt-2">
                            {/* Touch-Friendly Quantity Stepper */}
                            <div className="flex items-center rounded-xl bg-zinc-100 border border-zinc-300 p-0.5 shadow-2xs">
                              <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white hover:bg-zinc-200 active:bg-zinc-300 text-zinc-900 font-black transition-colors cursor-pointer border border-zinc-200"
                                aria-label="Reducir cantidad"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>

                              <span className="w-8 text-center text-xs sm:text-sm font-black text-zinc-950 font-mono">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-white hover:bg-zinc-200 active:bg-zinc-300 text-zinc-900 font-black transition-colors cursor-pointer border border-zinc-200"
                                aria-label="Aumentar cantidad"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Remove button */}
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-red-600 active:text-red-700 font-black uppercase tracking-wider transition-colors p-1.5 cursor-pointer"
                              title="Quitar prenda del carrito"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden xs:inline">Quitar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Safe Delivery Badge inside list */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-semibold flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-amber-800 shrink-0" />
                  <span className="text-[11px] leading-tight">
                    <strong>Envíos a todo Costa Rica</strong> por Correos de Costa Rica o retiro gratis en nuestro local en El Roble.
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Bottom Sticky Checkout Bar */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t-2 border-zinc-950 bg-white space-y-3 shrink-0 shadow-lg">
              {/* Subtotal & Conversion */}
              <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-zinc-600 font-bold uppercase tracking-wider">
                    Total a Pagar:
                  </span>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono tracking-tight">
                      ₡{(subtotalCRC || 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-500 font-bold ml-1">CRC</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-zinc-500 font-medium">
                  <span>Equivalente aproximado:</span>
                  <span className="font-mono font-bold text-zinc-700">≈ ${subtotalUSD} USD</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  id="checkout-proceed-btn"
                  onClick={() => {
                    onClose();
                    onProceedToOrder();
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-zinc-950 hover:bg-zinc-900 active:scale-98 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border border-zinc-800 min-h-[48px]"
                >
                  <span>Apartar / Finalizar Pedido</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>

                <button
                  id="checkout-whatsapp-btn"
                  onClick={handleQuickWhatsAppCheckout}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer min-h-[44px]"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                  <span>Enviar Prendas por WhatsApp</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pago Seguro vía SINPE Móvil o Efectivo en Tienda</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

