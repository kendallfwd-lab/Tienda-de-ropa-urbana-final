import React, { useState } from 'react';
import { Sparkles, Check, ShoppingBag, MessageCircle, RefreshCw, Shirt, Scissors, HelpCircle, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS, STORE_INFO } from '../data/storeData';

interface OutfitBuilderProps {
  products?: Product[];
  onAddToCart: (product: Product, size: string) => void;
  onDirectWhatsApp: (product: Product, size: string) => void;
  onOpenSizeAdvisor: () => void;
}

export const OutfitBuilder: React.FC<OutfitBuilderProps> = ({
  products = PRODUCTS,
  onAddToCart,
  onDirectWhatsApp,
  onOpenSizeAdvisor
}) => {
  const tops = products.filter(p => p.category === 'camisetas').length > 0
    ? products.filter(p => p.category === 'camisetas')
    : products.slice(0, 4);

  const bottoms = products.filter(p => p.category === 'conjuntos' || p.category === 'jeans').length > 0
    ? products.filter(p => p.category === 'conjuntos' || p.category === 'jeans')
    : products.slice(2, 6);

  const accessories = products.filter(p => p.category === 'gorras').length > 0
    ? products.filter(p => p.category === 'gorras')
    : products.slice(4, 8);

  const defaultTop = tops[0] || products[0] || PRODUCTS[0];
  const defaultBottom = bottoms[0] || products[1] || PRODUCTS[1];
  const defaultAcc = accessories[0] || products[2] || PRODUCTS[2];

  const [selectedTopId, setSelectedTopId] = useState<string>(defaultTop?.id || 'top-1');
  const [selectedBottomId, setSelectedBottomId] = useState<string>(defaultBottom?.id || 'bot-1');
  const [selectedAccessoryId, setSelectedAccessoryId] = useState<string>(defaultAcc?.id || 'acc-1');

  const selectedTop = products.find(p => p.id === selectedTopId) || defaultTop;
  const selectedBottom = products.find(p => p.id === selectedBottomId) || defaultBottom;
  const selectedAccessory = products.find(p => p.id === selectedAccessoryId) || defaultAcc;

  const [topSize, setTopSize] = useState<string>('L');
  const [bottomSize, setBottomSize] = useState<string>('32');
  const [accessorySize, setAccessorySize] = useState<string>('Única');

  // Calculate pricing with 15% combo bundle discount
  const rawSubtotal = (selectedTop?.priceCRC || 0) + (selectedBottom?.priceCRC || 0) + (selectedAccessory?.priceCRC || 0);
  const discountAmount = Math.round(rawSubtotal * 0.15);
  const finalPriceCRC = rawSubtotal - discountAmount;
  const finalPriceUSD = Math.round(finalPriceCRC / 515);

  const handleRandomize = () => {
    const randomTop = tops[Math.floor(Math.random() * tops.length)];
    const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
    const randomAcc = accessories[Math.floor(Math.random() * accessories.length)];
    if (randomTop) setSelectedTopId(randomTop.id);
    if (randomBottom) setSelectedBottomId(randomBottom.id);
    if (randomAcc) setSelectedAccessoryId(randomAcc.id);
  };

  const handleOrderWhatsApp = () => {
    const msg = `🐺 *PEDIDO DE OUTFIT PERSONALIZADO - LESLIE STORE*\n\n` +
      `¡Hola! Armé mi propio combo de outfit en la página web con el 15% de Descuento:\n\n` +
      `1️⃣ *Prenda Superior:* ${selectedTop?.name || 'Prenda'} (Talla: ${topSize}) - ₡${(selectedTop?.priceCRC || 0).toLocaleString()}\n` +
      `2️⃣ *Prenda Inferior:* ${selectedBottom?.name || 'Prenda'} (Talla: ${bottomSize}) - ₡${(selectedBottom?.priceCRC || 0).toLocaleString()}\n` +
      `3️⃣ *Gorra/Accesorio:* ${selectedAccessory?.name || 'Accesorio'} (Talla: ${accessorySize}) - ₡${(selectedAccessory?.priceCRC || 0).toLocaleString()}\n\n` +
      `💰 *Precio Regular:* ~₡${(rawSubtotal || 0).toLocaleString()}~\n` +
      `🎉 *Descuento Combo (15%):* -₡${(discountAmount || 0).toLocaleString()}\n` +
      `🔥 *TOTAL OUTFIT:* *₡${(finalPriceCRC || 0).toLocaleString()}* (~$${finalPriceUSD} USD)\n\n` +
      `¿Tienen estas tallas disponibles para apartar o enviar a domicilio?`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/50671949843?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const handleAddAllToCart = () => {
    // Add custom virtual combo item
    const comboProduct: Product = {
      id: `custom-combo-${Date.now()}`,
      name: `Combo Outfit: ${selectedTop.brand} + ${selectedBottom.brand} + ${selectedAccessory.brand}`,
      brand: 'Leslie Custom Combo',
      category: 'combos',
      priceCRC: finalPriceCRC,
      priceUSD: finalPriceUSD,
      originalPriceCRC: rawSubtotal,
      image: selectedTop.image,
      galleryImages: [selectedTop.image, selectedBottom.image, selectedAccessory.image],
      sizes: [`${topSize} / ${bottomSize} / ${accessorySize}`],
      description: `Outfit personalizado con 15% OFF: ${selectedTop.name} (Talla ${topSize}) + ${selectedBottom.name} (Talla ${bottomSize}) + ${selectedAccessory.name}`,
      features: [
        `Camiseta: ${selectedTop.name} [Talla ${topSize}]`,
        `Inferior: ${selectedBottom.name} [Talla ${bottomSize}]`,
        `Gorra: ${selectedAccessory.name}`,
        'Descuento 15% por paquete aplicado'
      ],
      tag: '15% Descuento Combo 🏷️',
      inStock: true,
      rating: 5.0,
      reviewsCount: 1
    };

    onAddToCart(comboProduct, `${topSize} / ${bottomSize}`);
  };

  return (
    <section id="armador-outfits" className="py-16 bg-zinc-50 border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-950 text-white text-xs font-black uppercase tracking-widest border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span>Creador de Outfits Urbano</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tighter uppercase font-heading">
              Arma tu Outfit Oversize &amp; Ahorra un <span className="underline decoration-red-600 decoration-4">15% OFF</span>
            </h2>

            <p className="text-zinc-600 text-sm sm:text-base">
              Selecciona tu camiseta favorita, combínala con un short Clemont o jeans desgastados y añade una gorra. ¡Calculamos tu descuento al instante!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRandomize}
              className="px-4 py-2.5 rounded-2xl bg-white border border-zinc-300 hover:border-zinc-950 text-zinc-900 text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-900" />
              <span>Random Outfit</span>
            </button>

            <button
              onClick={onOpenSizeAdvisor}
              className="px-4 py-2.5 rounded-2xl bg-zinc-950 text-white text-xs font-black uppercase tracking-wider hover:bg-zinc-900 flex items-center gap-2 transition-all border border-zinc-800"
            >
              <Shirt className="w-3.5 h-3.5 text-red-500" />
              <span>Guía de Tallas</span>
            </button>
          </div>
        </div>

        {/* 3 Step Interactive Outfit Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Col Left: 3 Selectors (Top, Bottom, Cap) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Selector de Camisetas */}
            <div className="p-5 rounded-3xl bg-white border-2 border-zinc-950 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-zinc-950 text-white text-xs font-black flex items-center justify-center">1</span>
                  <h3 className="font-black text-zinc-950 text-sm sm:text-base uppercase">Elige tu Camiseta Oversize</h3>
                </div>
                <span className="text-xs font-black text-blue-900 uppercase">{selectedTop.brand}</span>
              </div>

              {/* Scrollable list */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {tops.map((top) => (
                  <button
                    key={top.id}
                    onClick={() => setSelectedTopId(top.id)}
                    className={`relative rounded-2xl p-2 text-left border-2 transition-all overflow-hidden ${
                      selectedTop.id === top.id
                        ? 'border-zinc-950 bg-zinc-100 ring-2 ring-zinc-950 shadow-md'
                        : 'border-zinc-200 bg-white hover:border-zinc-400'
                    }`}
                  >
                    <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-zinc-100">
                      <img
                        src={top.image}
                        alt={top.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[11px] font-black text-zinc-950 line-clamp-1 uppercase">{top.name}</p>
                    <p className="text-[10px] text-zinc-600 font-mono font-bold">₡{(top.priceCRC || 0).toLocaleString()}</p>
                    
                    {selectedTop.id === top.id && (
                      <div className="absolute top-3 right-3 p-1 rounded-full bg-red-600 text-white shadow">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Talla selector for Top */}
              <div className="pt-2 flex items-center justify-between border-t border-zinc-200 text-xs">
                <span className="text-zinc-600 font-bold uppercase text-[11px]">Talla Camiseta:</span>
                <div className="flex gap-1.5">
                  {(selectedTop?.sizes || ['S', 'M', 'L', 'XL']).map((s) => (
                    <button
                      key={s}
                      onClick={() => setTopSize(s)}
                      className={`px-3 py-1 rounded-lg font-black text-xs transition-colors ${
                        topSize === s
                          ? 'bg-zinc-950 text-white shadow-sm'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Selector de Shorts / Jeans */}
            <div className="p-5 rounded-3xl bg-white border-2 border-zinc-950 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-zinc-950 text-white text-xs font-black flex items-center justify-center">2</span>
                  <h3 className="font-black text-zinc-950 text-sm sm:text-base uppercase">Elige Short o Jeans</h3>
                </div>
                <span className="text-xs font-black text-blue-900 uppercase">{selectedBottom?.brand || 'Leslie'}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {bottoms.map((bottom) => (
                  <button
                    key={bottom.id}
                    onClick={() => setSelectedBottomId(bottom.id)}
                    className={`relative rounded-2xl p-2 text-left border-2 transition-all overflow-hidden ${
                      selectedBottom.id === bottom.id
                        ? 'border-zinc-950 bg-zinc-100 ring-2 ring-zinc-950 shadow-md'
                        : 'border-zinc-200 bg-white hover:border-zinc-400'
                    }`}
                  >
                    <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-zinc-100">
                      <img
                        src={bottom.image}
                        alt={bottom.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[11px] font-black text-zinc-950 line-clamp-1 uppercase">{bottom.name}</p>
                    <p className="text-[10px] text-zinc-600 font-mono font-bold">₡{(bottom.priceCRC || 0).toLocaleString()}</p>
                    
                    {selectedBottom.id === bottom.id && (
                      <div className="absolute top-3 right-3 p-1 rounded-full bg-red-600 text-white shadow">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-zinc-200 text-xs">
                <span className="text-zinc-600 font-bold uppercase text-[11px]">Talla Inferior:</span>
                <div className="flex gap-1.5">
                  {(selectedBottom?.sizes || ['30', '32', '34']).map((s) => (
                    <button
                      key={s}
                      onClick={() => setBottomSize(s)}
                      className={`px-3 py-1 rounded-lg font-black text-xs transition-colors ${
                        bottomSize === s
                          ? 'bg-zinc-950 text-white shadow-sm'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Selector de Gorras */}
            <div className="p-5 rounded-3xl bg-white border-2 border-zinc-950 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-zinc-950 text-white text-xs font-black flex items-center justify-center">3</span>
                  <h3 className="font-black text-zinc-950 text-sm sm:text-base uppercase">Elige tu Gorra Streetwear</h3>
                </div>
                <span className="text-xs font-black text-blue-900 uppercase">{selectedAccessory?.brand || 'Leslie'}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {accessories.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => setSelectedAccessoryId(acc.id)}
                    className={`relative rounded-2xl p-2 text-left border-2 transition-all overflow-hidden ${
                      selectedAccessory.id === acc.id
                        ? 'border-zinc-950 bg-zinc-100 ring-2 ring-zinc-950 shadow-md'
                        : 'border-zinc-200 bg-white hover:border-zinc-400'
                    }`}
                  >
                    <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-zinc-100">
                      <img
                        src={acc.image}
                        alt={acc.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[11px] font-black text-zinc-950 line-clamp-1 uppercase">{acc.name}</p>
                    <p className="text-[10px] text-zinc-600 font-mono font-bold">₡{(acc.priceCRC || 0).toLocaleString()}</p>
                    
                    {selectedAccessory.id === acc.id && (
                      <div className="absolute top-3 right-3 p-1 rounded-full bg-red-600 text-white shadow">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Col Right: Live Outfit Summary Card */}
          <div className="lg:col-span-4 sticky top-24 space-y-5">
            <div className="p-6 rounded-3xl bg-white border-2 border-zinc-950 shadow-2xl space-y-5 relative overflow-hidden">
              {/* Decorative top bar */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-zinc-950" />

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Resumen de tu Outfit
                  </span>
                  <h4 className="text-xl font-black text-zinc-950 uppercase">Combo Armado</h4>
                </div>

                <div className="px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs shadow uppercase">
                  -15% OFF
                </div>
              </div>

              {/* Visual mini previews stack */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-zinc-100 border border-zinc-300">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-zinc-200">
                  <img src={selectedTop.image} alt="Top" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-zinc-950 text-white text-[9px] font-black">
                    {topSize}
                  </span>
                </div>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-zinc-200">
                  <img src={selectedBottom.image} alt="Bottom" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-blue-950 text-blue-200 text-[9px] font-black">
                    {bottomSize}
                  </span>
                </div>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-zinc-200">
                  <img src={selectedAccessory.image} alt="Cap" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-black">
                    Gorra
                  </span>
                </div>
              </div>

              {/* Items Breakdown list */}
              <div className="space-y-2 text-xs text-zinc-600 divide-y divide-zinc-200">
                <div className="flex justify-between items-center pt-1.5">
                  <span className="line-clamp-1 font-bold text-zinc-900">1. {selectedTop?.name || 'Prenda'} ({topSize})</span>
                  <span className="font-mono text-zinc-950 font-black">₡{(selectedTop?.priceCRC || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5">
                  <span className="line-clamp-1 font-bold text-zinc-900">2. {selectedBottom?.name || 'Prenda'} ({bottomSize})</span>
                  <span className="font-mono text-zinc-950 font-black">₡{(selectedBottom?.priceCRC || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5">
                  <span className="line-clamp-1 font-bold text-zinc-900">3. {selectedAccessory?.name || 'Accesorio'}</span>
                  <span className="font-mono text-zinc-950 font-black">₡{(selectedAccessory?.priceCRC || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Pricing Totals */}
              <div className="p-4 rounded-2xl bg-zinc-100 border border-zinc-300 space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Precio Regular:</span>
                  <span className="line-through font-mono font-bold">₡{(rawSubtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-red-600 font-black uppercase">
                  <span>Descuento Paquete (-15%):</span>
                  <span>-₡{(discountAmount || 0).toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-zinc-300 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-black text-zinc-950 uppercase block">Total Outfit:</span>
                    <span className="text-[11px] text-zinc-500 font-mono">≈ ${finalPriceUSD} USD</span>
                  </div>
                  <span className="text-3xl font-black text-zinc-950 font-mono">
                    ₡{(finalPriceCRC || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5">
                <button
                  onClick={handleOrderWhatsApp}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                  <span>Pedir Outfit por WhatsApp</span>
                </button>

                <button
                  onClick={handleAddAllToCart}
                  className="w-full py-3 px-4 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all border border-zinc-800"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Agregar al Carrito (-15%)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

