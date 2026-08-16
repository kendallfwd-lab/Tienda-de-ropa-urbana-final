import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  Instagram, 
  Phone, 
  Truck, 
  CreditCard, 
  MapPin, 
  Check, 
  Save, 
  Sparkles,
  Share2,
  Clock,
  Mail
} from 'lucide-react';
import { StoreSettings } from '../../types';
import { saveStoreSettings } from '../../lib/storeService';

interface AdminStoreSettingsProps {
  settings: StoreSettings;
  onSettingsUpdated: (settings: StoreSettings) => void;
  onShowToast: (msg: string) => void;
}

export const AdminStoreSettings: React.FC<AdminStoreSettingsProps> = ({
  settings,
  onSettingsUpdated,
  onShowToast
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const saved = await saveStoreSettings(formData);
      onSettingsUpdated(saved);
      onShowToast('✓ Configuración de la tienda guardada con éxito');
    } catch (err: any) {
      alert('Error al guardar configuración: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
        <div>
          <h3 className="text-sm font-black uppercase text-zinc-950 flex items-center gap-2">
            <Settings className="w-4 h-4 text-zinc-700" />
            Configuración General de Leslie Store
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Actualiza redes sociales (Instagram, TikTok), información de envíos, datos de SINPE y horarios.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="py-2.5 px-5 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Identity & Branding */}
        <div className="bg-white border-2 border-zinc-200 p-5 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
            <Store className="w-4 h-4 text-zinc-900" />
            <h4 className="font-black text-xs uppercase text-zinc-950">Identidad de la Tienda</h4>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
              Nombre de la Tienda
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 px-3 text-xs font-bold text-zinc-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
              Eslogan / Tagline
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
              className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 px-3 text-xs font-bold text-zinc-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
              URL del Logo Oficial
            </label>
            <input
              type="text"
              value={formData.logoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
              className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 px-3 text-xs font-bold text-zinc-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
              Barra de Anuncios Superior
            </label>
            <input
              type="text"
              value={formData.announcementBarText || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, announcementBarText: e.target.value }))}
              placeholder="Ej: 🔥 ENVIOS A TODO COSTA RICA • PAGA CON SINPE MÓVIL"
              className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 px-3 text-xs font-bold text-zinc-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Social Media & Contact */}
        <div className="bg-white border-2 border-zinc-200 p-5 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
            <Share2 className="w-4 h-4 text-zinc-900" />
            <h4 className="font-black text-xs uppercase text-zinc-950">Redes Sociales &amp; WhatsApp</h4>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
              WhatsApp Oficial (con código 506)
            </label>
            <input
              type="text"
              required
              value={formData.whatsappNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
              placeholder="50671949843"
              className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 px-3 text-xs font-bold font-mono text-zinc-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
              Usuario de Instagram
            </label>
            <div className="flex gap-2">
              <span className="py-2 px-3 bg-zinc-100 rounded-xl font-bold text-xs text-zinc-600 border border-zinc-200">@</span>
              <input
                type="text"
                value={formData.instagramHandle || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  instagramHandle: e.target.value,
                  instagramUrl: `https://instagram.com/${e.target.value.replace('@', '')}`
                }))}
                placeholder="leslie_store"
                className="flex-1 bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 px-3 text-xs font-bold text-zinc-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
              Usuario de TikTok
            </label>
            <div className="flex gap-2">
              <span className="py-2 px-3 bg-zinc-100 rounded-xl font-bold text-xs text-zinc-600 border border-zinc-200">@</span>
              <input
                type="text"
                value={formData.tiktokHandle || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  tiktokHandle: e.target.value,
                  tiktokUrl: `https://tiktok.com/@${e.target.value.replace('@', '')}`
                }))}
                placeholder="lesliestore.cr"
                className="flex-1 bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 px-3 text-xs font-bold text-zinc-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
              Correo Electrónico de Contacto
            </label>
            <input
              type="email"
              value={formData.contactEmail || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
              placeholder="ventas@lesliestore.com"
              className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 px-3 text-xs font-bold text-zinc-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Shipping Rates & Policy */}
        <div className="bg-white border-2 border-zinc-200 p-5 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
            <Truck className="w-4 h-4 text-zinc-900" />
            <h4 className="font-black text-xs uppercase text-zinc-950">Tarifas e Información de Envío</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase text-zinc-700 mb-1">
                Correos de Costa Rica (GAM / Fuera de GAM)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-zinc-500">₡</span>
                <input
                  type="number"
                  value={formData.shippingRateCorreos}
                  onChange={(e) => setFormData(prev => ({ ...prev, shippingRateCorreos: Number(e.target.value) || 0 }))}
                  className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 pl-7 pr-3 text-xs font-bold text-zinc-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-zinc-700 mb-1">
                Mensajería Express Puntarenas
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-zinc-500">₡</span>
                <input
                  type="number"
                  value={formData.shippingRateExpress}
                  onChange={(e) => setFormData(prev => ({ ...prev, shippingRateExpress: Number(e.target.value) || 0 }))}
                  className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 pl-7 pr-3 text-xs font-bold text-zinc-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase text-zinc-700 mb-1">
              Monto Mínimo para Envío Gratis (CRC)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-zinc-500">₡</span>
              <input
                type="number"
                value={formData.freeShippingThreshold}
                onChange={(e) => setFormData(prev => ({ ...prev, freeShippingThreshold: Number(e.target.value) || 0 }))}
                className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 pl-7 pr-3 text-xs font-bold text-zinc-900 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Compras iguales o superiores a ₡{(formData.freeShippingThreshold || 0).toLocaleString()} tendrán envío gratis automático.
            </p>
          </div>
        </div>

        {/* Location & SINPE Data */}
        <div className="bg-white border-2 border-zinc-200 p-5 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
            <CreditCard className="w-4 h-4 text-zinc-900" />
            <h4 className="font-black text-xs uppercase text-zinc-950">SINPE Móvil &amp; Ubicación Física</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase text-zinc-700 mb-1">
                Número SINPE Móvil
              </label>
              <input
                type="text"
                value={formData.sinpePhone}
                onChange={(e) => setFormData(prev => ({ ...prev, sinpePhone: e.target.value }))}
                className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 px-3 text-xs font-bold font-mono text-zinc-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-zinc-700 mb-1">
                Titular de la Cuenta
              </label>
              <input
                type="text"
                value={formData.sinpeHolder}
                onChange={(e) => setFormData(prev => ({ ...prev, sinpeHolder: e.target.value }))}
                className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 px-3 text-xs font-bold text-zinc-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase text-zinc-700 mb-1">
              Dirección de la Boutique
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 px-3 text-xs font-bold text-zinc-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase text-zinc-700 mb-1">
              Horario de Atención
            </label>
            <input
              type="text"
              value={formData.schedule}
              onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
              className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 px-3 text-xs font-bold text-zinc-900 focus:outline-none"
            />
          </div>
        </div>

      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="py-3 px-8 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{isSaving ? 'Guardando Cambios...' : 'Guardar Toda la Configuración'}</span>
        </button>
      </div>

    </form>
  );
};
