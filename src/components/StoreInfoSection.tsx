import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Compass, 
  Navigation, 
  Truck, 
  CreditCard, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Check,
  Building2
} from 'lucide-react';
import { STORE_INFO, FAQ_ITEMS } from '../data/storeData';

export const StoreInfoSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section id="ubicacion" className="py-16 bg-zinc-100 relative border-t-2 border-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-950 text-white text-xs font-black uppercase tracking-widest border border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            Información &amp; Ubicación
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tighter uppercase font-heading">
            Visítanos en Nuestra Tienda Física
          </h2>
          
          <p className="text-zinc-600 text-sm sm:text-base font-medium">
            Ubicados estratégicamente en <strong>El Roble de Puntarenas, frente al CTP</strong>. Fácil acceso en vehículo, autobús o a pie.
          </p>
        </div>

        {/* Info Grid: Map + Store Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-14">
          
          {/* Left Col: Store Details, Schedule & Contacts */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Address Card */}
            <div className="p-6 rounded-3xl bg-white border-2 border-zinc-950 shadow-sm space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-zinc-950 text-white shrink-0 border border-zinc-800">
                  <Building2 className="w-6 h-6 text-red-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-zinc-950 uppercase">Dirección Exacta</h3>
                  <p className="text-sm text-zinc-700 leading-relaxed font-medium">
                    {STORE_INFO.address}
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 text-xs font-mono font-bold border border-zinc-300">
                      Plus Code: <strong>{STORE_INFO.plusCode}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-900 text-white text-xs font-black uppercase border border-blue-950">
                      📍 Frente al CTP de Puntarenas
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href={STORE_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all border border-zinc-800"
                >
                  <Navigation className="w-4 h-4 text-red-500" />
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>

                <a
                  href={STORE_INFO.wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-2xl bg-blue-900 hover:bg-blue-950 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all border border-blue-950"
                >
                  <Compass className="w-4 h-4 text-white" />
                  <span>Abrir en Waze</span>
                  <ExternalLink className="w-3 h-3 text-blue-300" />
                </a>
              </div>
            </div>

            {/* Schedule & Live Status */}
            <div className="p-6 rounded-3xl bg-white border-2 border-zinc-950 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-zinc-950 text-white shrink-0">
                    <Clock className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-black text-zinc-950 text-base uppercase">Horarios de Atención</h3>
                    <p className="text-xs text-zinc-500 font-medium">Atención en tienda y pedidos por WhatsApp</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  <span>Abierto hoy</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs font-bold">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
                  <span className="text-zinc-700 uppercase">Lunes a Sábado:</span>
                  <span className="font-mono text-zinc-950 font-black">9:00 AM – 7:00 PM</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
                  <span className="text-zinc-700 uppercase">Domingo:</span>
                  <span className="font-mono text-zinc-950 font-black">10:00 AM – 5:00 PM</span>
                </div>
              </div>
            </div>

            {/* Direct Contact Card */}
            <div className="p-6 rounded-3xl bg-white border-2 border-zinc-950 shadow-sm space-y-3">
              <h3 className="font-black text-zinc-950 text-base uppercase flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-600" />
                Líneas de Atención
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <a
                  href={`tel:+506${STORE_INFO.phone.replace(/\s/g, '')}`}
                  className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-300 hover:border-zinc-950 transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-400">Teléfono Local</p>
                    <p className="text-sm font-black font-mono text-zinc-950">{STORE_INFO.phone}</p>
                  </div>
                  <Phone className="w-4 h-4 text-blue-900" />
                </a>

                <a
                  href={STORE_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 hover:border-emerald-500 transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="text-[10px] uppercase font-bold text-emerald-800">WhatsApp Oficial</p>
                    <p className="text-sm font-black font-mono text-emerald-950">{STORE_INFO.phone}</p>
                  </div>
                  <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-50" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Col: Styled Map Visual & FAQ */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Styled Map Container */}
            <div className="rounded-3xl overflow-hidden bg-white border-2 border-zinc-950 shadow-sm relative">
              {/* Map Header */}
              <div className="p-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Leslie Store - El Roble, Puntarenas
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono font-bold">Puntarenas 60108</span>
              </div>

              {/* Map View Frame */}
              <div className="relative aspect-[16/10] w-full bg-zinc-950 overflow-hidden flex items-center justify-center">
                {/* Simulated Street View & Map Grid */}
                <div className="absolute inset-0 bg-zinc-950 opacity-95">
                  <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid-pattern-street" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#71717a" strokeWidth="0.8"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-pattern-street)" />
                    <path d="M 0 120 Q 200 110 500 130" stroke="#dc2626" strokeWidth="8" fill="none" opacity="0.8"/>
                    <path d="M 180 0 L 190 300" stroke="#1e3a8a" strokeWidth="6" fill="none" opacity="0.8"/>
                    <path d="M 320 0 L 330 300" stroke="#ffffff" strokeWidth="4" fill="none" opacity="0.4"/>
                  </svg>
                </div>

                {/* Point of Interest Markers */}
                <div className="absolute top-1/4 left-1/4 p-2 rounded-xl bg-zinc-900 border border-zinc-700 text-[10px] text-zinc-200 font-black uppercase shadow">
                  🏫 CTP de Puntarenas
                </div>

                {/* Main Store Pin with black and red theme */}
                <div className="relative z-10 flex flex-col items-center animate-bounce">
                  <div className="p-3.5 rounded-2xl bg-zinc-950 text-white shadow-2xl border-2 border-red-600 flex items-center gap-2">
                    <span className="text-base">🐺</span>
                    <div className="text-left">
                      <span className="text-xs font-black block leading-tight uppercase">Leslie Store</span>
                      <span className="text-[9px] uppercase font-bold text-red-500 block">Frente al CTP</span>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-red-600 rotate-45 -mt-1.5 shadow-lg" />
                </div>

                {/* Road label */}
                <div className="absolute bottom-4 left-4 z-10 px-3 py-1 rounded-xl bg-zinc-900/90 backdrop-blur-md text-[11px] text-zinc-200 border border-zinc-700 font-bold uppercase">
                  Ruta El Roble ↔ Puntarenas Centro
                </div>

                {/* Google Maps link overlay */}
                <a
                  href={STORE_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 z-10 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105"
                >
                  <span>Cómo llegar</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <div className="p-6 rounded-3xl bg-white border-2 border-zinc-950 shadow-sm space-y-4">
              <h3 className="font-black text-zinc-950 text-base uppercase flex items-center gap-2 pb-2 border-b border-zinc-200">
                <HelpCircle className="w-4 h-4 text-red-600" />
                Preguntas Frecuentes (FAQ)
              </h3>

              <div className="space-y-2.5">
                {FAQ_ITEMS.map((item, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div
                      key={index}
                      className="rounded-2xl bg-zinc-50 border border-zinc-300 overflow-hidden transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(index)}
                        className="w-full p-3.5 text-left flex items-center justify-between text-xs font-black uppercase text-zinc-900 hover:text-red-600"
                      >
                        <span>{item.q}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-red-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />}
                      </button>

                      {isOpen && (
                        <div className="px-3.5 pb-3.5 pt-1 text-xs text-zinc-700 font-medium leading-relaxed border-t border-zinc-200">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

