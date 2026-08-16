import React, { useState } from 'react';
import { 
  Send, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  MessageCircle,
  Plus,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { CartItem, OrderFormState, Product, Order } from '../types';
import { STORE_INFO, PRODUCTS } from '../data/storeData';
import { saveOrder } from '../lib/storeService';

interface OrderSectionProps {
  items: CartItem[];
  onAddQuickItem: (productId: string, size: string) => void;
  onOpenCart: () => void;
}

export const OrderSection: React.FC<OrderSectionProps> = ({
  items,
  onAddQuickItem,
  onOpenCart
}) => {
  const [formData, setFormData] = useState<OrderFormState>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    province: 'Puntarenas',
    canton: 'Puntarenas (El Roble / Chacarita)',
    exactAddress: '',
    shippingType: 'tienda',
    paymentMethod: 'sinpe',
    notes: ''
  });

  const [copiedSinpe, setCopiedSinpe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate pricing
  const subtotalCRC = items.reduce(
    (sum, item) => sum + item.product.priceCRC * item.quantity,
    0
  );

  const selectedShipping = STORE_INFO.shippingOptions.find(
    s => s.id === formData.shippingType
  ) || STORE_INFO.shippingOptions[0];

  const shippingCostCRC = items.length > 0 ? selectedShipping.costCRC : 0;
  const totalCRC = subtotalCRC + shippingCostCRC;
  const totalUSD = Math.round(totalCRC / 515);

  const handleCopySinpe = () => {
    navigator.clipboard.writeText('71949843');
    setCopiedSinpe(true);
    setTimeout(() => setCopiedSinpe(false), 2500);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendOrderWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.customerPhone.trim()) {
      alert('Por favor completa tu nombre y número de teléfono.');
      return;
    }

    setIsSubmitting(true);

    // Save order in Firestore & local state for Admin Dashboard tracking
    try {
      const orderRecord: Order = {
        id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerEmail: formData.customerEmail?.trim() || '',
        province: formData.province,
        canton: formData.canton,
        exactAddress: formData.exactAddress,
        shippingType: formData.shippingType,
        shippingCostCRC: shippingCostCRC,
        paymentMethod: formData.paymentMethod,
        items: items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          size: item.selectedSize,
          priceCRC: item.product.priceCRC,
          quantity: item.quantity,
          image: item.product.image
        })),
        subtotalCRC,
        totalCRC,
        status: 'Pendiente',
        notes: formData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveOrder(orderRecord);
    } catch (err) {
      console.warn('Could not record order in database:', err);
    }

    // Build the formatted WhatsApp message
    let orderText = `🐺 *NUEVO PEDIDO / APARTADO - LESLIE STORE*\n\n`;
    orderText += `👤 *Cliente:* ${formData.customerName}\n`;
    orderText += `📱 *Teléfono:* ${formData.customerPhone}\n`;
    orderText += `📍 *Ubicación:* ${formData.province}, ${formData.canton}\n`;
    orderText += `🏠 *Dirección Exacta:* ${formData.exactAddress || 'Retiro en tienda El Roble'}\n\n`;

    orderText += `📦 *DETALLE DE PRENDAS:* \n`;
    if (items.length === 0) {
      orderText += `• (Consulta general de catálogo / pedido rápido)\n`;
    } else {
      items.forEach((item, idx) => {
        orderText += `${idx + 1}. *${item.product.name}*\n`;
        orderText += `   - Talla: *${item.selectedSize}*\n`;
        orderText += `   - Cantidad: ${item.quantity}\n`;
        orderText += `   - Subtotal: ₡${((item.product?.priceCRC || 0) * (item.quantity || 1)).toLocaleString()}\n`;
      });
    }

    orderText += `\n🚚 *Método de Entrega:* ${selectedShipping.name} (₡${(shippingCostCRC || 0).toLocaleString()})\n`;
    orderText += `💳 *Método de Pago:* ${formData.paymentMethod === 'sinpe' ? 'SINPE Móvil (7194-9843)' : formData.paymentMethod === 'efectivo' ? 'Efectivo en Tienda' : 'Transferencia Bancaria'}\n`;
    orderText += `💰 *TOTAL A PAGAR:* *₡${(totalCRC || 0).toLocaleString()}* (~$${totalUSD} USD)\n\n`;

    if (formData.notes) {
      orderText += `📝 *Notas:* ${formData.notes}\n\n`;
    }

    orderText += `_Mensaje generado automáticamente desde la web oficial de Leslie Store Puntarenas._`;

    const encoded = encodeURIComponent(orderText);
    const waUrl = `https://wa.me/50671949843?text=${encoded}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setIsSubmitting(false);
  };

  return (
    <section id="pedidos" className="py-16 bg-zinc-50 relative border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-950 text-white text-xs font-black uppercase tracking-widest border border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            Apartados &amp; Pedidos por WhatsApp
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tighter uppercase font-heading">
            Aparta tu Prenda o Solicita Envío a Domicilio
          </h2>
          
          <p className="text-zinc-600 text-sm sm:text-base">
            Envía tu pedido directamente a nuestro WhatsApp oficial <strong>7194 9843</strong> para apartar tu talla de inmediato o coordinar tu entrega por SINPE Móvil.
          </p>
        </div>

        {/* 2 Column Layout: Form & Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Col 1: Customer & Shipping Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border-2 border-zinc-950 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-zinc-950 uppercase flex items-center gap-2 pb-3 border-b border-zinc-200">
              <span className="w-7 h-7 rounded-xl bg-zinc-950 text-white text-xs flex items-center justify-center font-black">1</span>
              <span>Datos para Entrega y Contacto</span>
            </h3>

            <form onSubmit={handleSendOrderWhatsApp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-zinc-800 uppercase block mb-1.5">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Ej. Kendall Morales"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-zinc-800 uppercase block mb-1.5">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    placeholder="Ej. 8888 8888"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white transition-colors font-medium"
                  />
                </div>
              </div>

              {/* Province & Canton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-zinc-800 uppercase block mb-1.5">
                    Provincia
                  </label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-2.5 text-xs text-zinc-900 font-black uppercase focus:outline-none focus:border-zinc-950"
                  >
                    <option value="Puntarenas">Puntarenas</option>
                    <option value="San José">San José</option>
                    <option value="Alajuela">Alajuela</option>
                    <option value="Heredia">Heredia</option>
                    <option value="Cartago">Cartago</option>
                    <option value="Guanacaste">Guanacaste</option>
                    <option value="Limón">Limón</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-zinc-800 uppercase block mb-1.5">
                    Cantón / Zona
                  </label>
                  <input
                    type="text"
                    name="canton"
                    value={formData.canton}
                    onChange={handleInputChange}
                    placeholder="Ej. El Roble, Barranca, Esparza, etc."
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white transition-colors font-medium"
                  />
                </div>
              </div>

              {/* Exact Address */}
              <div>
                <label className="text-xs font-black text-zinc-800 uppercase block mb-1.5">
                  Dirección Exacta o Punto de Referencia
                </label>
                <textarea
                  rows={2}
                  name="exactAddress"
                  value={formData.exactAddress}
                  onChange={handleInputChange}
                  placeholder="Ej. 100m norte del Supermercado, casa blanca portón negro..."
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white transition-colors font-medium"
                />
              </div>

              {/* Shipping Method Options */}
              <div className="pt-2 space-y-2">
                <label className="text-xs font-black text-zinc-800 uppercase block">
                  Método de Entrega
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {STORE_INFO.shippingOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between ${
                        formData.shippingType === opt.id
                          ? 'border-zinc-950 bg-zinc-100 shadow-sm'
                          : 'border-zinc-200 bg-white hover:border-zinc-400'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="radio"
                          name="shippingType"
                          value={opt.id}
                          checked={formData.shippingType === opt.id}
                          onChange={handleInputChange}
                          className="mt-0.5 text-zinc-950 focus:ring-zinc-950"
                        />
                        <div>
                          <p className="text-xs font-black text-zinc-950 uppercase">{opt.name}</p>
                          <p className="text-[10px] text-zinc-500 font-medium">{opt.time}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-black text-blue-900">
                        {opt.costCRC === 0 ? 'GRATIS' : `₡${(opt.costCRC || 0).toLocaleString()}`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Method Options */}
              <div className="pt-2 space-y-2">
                <label className="text-xs font-black text-zinc-800 uppercase block">
                  Método de Pago Preferido
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'sinpe' }))}
                    className={`p-2.5 rounded-2xl border-2 text-center text-xs font-black uppercase transition-all ${
                      formData.paymentMethod === 'sinpe'
                        ? 'border-zinc-950 bg-zinc-950 text-white'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    📱 SINPE Móvil
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'efectivo' }))}
                    className={`p-2.5 rounded-2xl border-2 text-center text-xs font-black uppercase transition-all ${
                      formData.paymentMethod === 'efectivo'
                        ? 'border-zinc-950 bg-zinc-950 text-white'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    💵 Efectivo
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'transferencia' }))}
                    className={`p-2.5 rounded-2xl border-2 text-center text-xs font-black uppercase transition-all ${
                      formData.paymentMethod === 'transferencia'
                        ? 'border-zinc-950 bg-zinc-950 text-white'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    🏦 Transferencia
                  </button>
                </div>
              </div>

              {/* Additional notes */}
              <div>
                <label className="text-xs font-black text-zinc-800 uppercase block mb-1">
                  Notas o Solicitudes Especiales
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Ej. Deseo empacado para regalo / entregar después de las 3pm"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white font-medium"
                />
              </div>

              {/* Action Submit */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-95 transition-all"
                >
                  <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                  <span>Enviar Pedido a WhatsApp Oficial (7194 9843)</span>
                </button>
              </div>
            </form>
          </div>

          {/* Col 2: Order Summary & SINPE Box */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* SINPE Móvil Official Card */}
            <div className="p-6 rounded-3xl bg-zinc-950 text-white border-2 border-zinc-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow">
                    📱
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm uppercase">Pago por SINPE Móvil</h4>
                    <p className="text-[11px] text-zinc-400">{STORE_INFO.sinpeHolder}</p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-black border border-emerald-800 uppercase">
                  Activo
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">
                    Número de SINPE Móvil
                  </span>
                  <span className="text-xl font-black text-white font-mono tracking-wider">
                    7194 9843
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopySinpe}
                  className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    copiedSinpe
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white hover:bg-zinc-200 text-zinc-950'
                  }`}
                >
                  {copiedSinpe ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSinpe ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Envía el comprobante por WhatsApp tras presionar el botón de pedido para apartar tu ropa de inmediato.
              </p>
            </div>

            {/* Cart Items List & Total Card */}
            <div className="p-6 rounded-3xl bg-white border-2 border-zinc-950 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <h4 className="font-black text-zinc-950 text-sm uppercase flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-blue-900" />
                  <span>Prendas en tu Pedido ({items.reduce((a, b) => a + b.quantity, 0)})</span>
                </h4>

                {items.length > 0 && (
                  <button
                    onClick={onOpenCart}
                    className="text-xs text-blue-900 hover:text-blue-950 font-black uppercase underline"
                  >
                    Editar carrito
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <div className="text-center py-6 space-y-3">
                  <p className="text-xs text-zinc-500">
                    Tu carrito está vacío. Puedes agregar prendas desde el catálogo o solicitar una consulta general.
                  </p>
                  
                  {/* Quick add popular item */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onAddQuickItem(PRODUCTS[0].id, 'L')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-black uppercase border border-zinc-300 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-red-600" />
                      <span>+ Agregar Camiseta Life Emotion (L)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs p-2.5 rounded-2xl bg-zinc-50 border border-zinc-200"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-10 h-10 rounded-xl object-cover border border-zinc-200"
                        />
                        <div>
                          <p className="font-black text-zinc-900 line-clamp-1 uppercase">{item.product.name}</p>
                          <p className="text-[10px] text-zinc-500">
                            Talla: <strong>{item.selectedSize}</strong> • Cant: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-black text-zinc-950">
                        ₡{((item.product?.priceCRC || 0) * (item.quantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Calculation */}
              <div className="pt-3 border-t border-zinc-200 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-500 font-bold uppercase">
                  <span>Subtotal prendas:</span>
                  <span className="font-mono text-zinc-900 font-black">₡{(subtotalCRC || 0).toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-zinc-500 font-bold uppercase">
                  <span>Envío ({selectedShipping.name}):</span>
                  <span className="font-mono text-zinc-900 font-black">
                    {shippingCostCRC === 0 ? 'GRATIS' : `₡${(shippingCostCRC || 0).toLocaleString()}`}
                  </span>
                </div>

                <div className="pt-3 border-t border-zinc-200 flex items-baseline justify-between">
                  <div>
                    <span className="font-black text-zinc-950 text-sm uppercase block">Total a Pagar:</span>
                    <span className="text-[10px] text-zinc-500 font-mono">≈ ${totalUSD} USD</span>
                  </div>
                  <span className="text-2xl font-black text-zinc-950 font-mono">
                    ₡{(totalCRC || 0).toLocaleString()}
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

