import React from 'react';
import { MapPin, Phone, MessageCircle, Clock, ShieldCheck, Heart, Sparkles, Instagram, Facebook } from 'lucide-react';
import { WolfLogo } from './WolfLogo';
import { STORE_INFO } from '../data/storeData';

interface FooterProps {
  onNavigateTo: (sectionId: string) => void;
  onOpenAdminPanel?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTo, onOpenAdminPanel }) => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <WolfLogo size={42} showText={true} theme="dark" />
            <p className="text-slate-400 text-xs leading-relaxed">
              La boutique de streetwear más exclusiva de Puntarenas. Camisetas oversize de 240g, combos Clemont, jeans con bandana y gorras importadas.
            </p>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[11px] font-semibold">Ubicados frente al CTP de El Roble</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Navegación
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => onNavigateTo('catalogo')} 
                  className="hover:text-indigo-400 transition-colors"
                >
                  Catálogo Oficial (Prendas &amp; Tallas)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateTo('armador-outfits')} 
                  className="hover:text-purple-400 transition-colors font-bold text-purple-300"
                >
                  Armador de Outfits (-15% OFF)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateTo('combos')} 
                  className="hover:text-indigo-400 transition-colors"
                >
                  Packs &amp; Combos Clemont
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateTo('pedidos')} 
                  className="hover:text-indigo-400 transition-colors font-bold text-indigo-300"
                >
                  Apartar Pedido por WhatsApp
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateTo('ubicacion')} 
                  className="hover:text-indigo-400 transition-colors"
                >
                  Ubicación &amp; Horarios
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Payments */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Atención y Pagos
            </h4>
            <div className="space-y-2 text-xs">
              <p className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Teléfono / WhatsApp: <strong>{STORE_INFO.phone}</strong></span>
              </p>
              <p className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>SINPE Móvil: <strong>7194-9843</strong></span>
              </p>
              <p className="flex items-center gap-2 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Lun a Sáb: 9am - 7pm • Dom: 10am - 5pm</span>
              </p>
            </div>

            <div className="pt-2">
              <a
                href={STORE_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" />
                Chat Directo WhatsApp
              </a>
            </div>
          </div>

          {/* Col 4: Socials & Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Redes Sociales &amp; Chat
            </h4>
            <div className="space-y-2">
              <a
                href={STORE_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-pink-500 text-slate-300 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  <span>Instagram: {STORE_INFO.instagramHandle}</span>
                </span>
                <span className="text-[10px] text-pink-400 font-bold uppercase">Ver</span>
              </a>

              <a
                href={STORE_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  <span>WhatsApp: {STORE_INFO.phone}</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase">Chat</span>
              </a>

              <a
                href={STORE_INFO.facebookUrl || "https://www.facebook.com/people/Leslie-store/100075463196852/"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <Facebook className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                  <span>Facebook: Leslie store</span>
                </span>
                <span className="text-[10px] text-blue-400 font-bold uppercase">Ver</span>
              </a>

              <a
                href={STORE_INFO.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-colors"
              >
                <span className="font-bold">TikTok: {STORE_INFO.tiktokHandle}</span>
                <span className="text-[10px] text-cyan-400 font-mono">{STORE_INFO.followersTikTok}</span>
              </a>

              <a
                href={STORE_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-indigo-400 text-slate-300 hover:text-white transition-colors"
              >
                <span className="font-bold">Google Maps (5.0 ⭐)</span>
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Leslie&apos;s Store Puntarenas. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            <span>Streetwear exclusivo para Puntarenas, Costa Rica 🇨🇷</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
