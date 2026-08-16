import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { STORE_INFO } from '../data/storeData';

export const FloatingWhatsApp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [quickMsg, setQuickMsg] = useState('¡Hola! Me gustaría consultar por la disponibilidad de prendas en Leslie Store.');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const encoded = encodeURIComponent(quickMsg);
    window.open(`https://wa.me/50671949843?text=${encoded}`, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 28, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.7, 
        ease: [0.16, 1, 0.3, 1],
        delay: 0.35 
      }}
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end"
    >
      {/* Quick Chat Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="mb-3 w-80 sm:w-96 rounded-3xl bg-white border-2 border-zinc-950 shadow-2xl p-4 text-zinc-900"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-zinc-950 flex items-center justify-center text-white text-base shadow border border-zinc-800">
                  🐺
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-zinc-950 tracking-wider">Leslie Store Oficial</h4>
                  <p className="text-[10px] text-emerald-600 font-black uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    En línea • Puntarenas
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 text-xs text-zinc-600 space-y-2.5">
              <div className="p-3 rounded-2xl bg-zinc-100 border border-zinc-200 text-[11px] leading-relaxed text-zinc-900 font-medium">
                👋 ¡Hola! ¿Buscas alguna prenda o talla específica? Escríbenos directamente a nuestro WhatsApp oficial: <strong>7194 9843</strong>.
              </div>

              <form onSubmit={handleSend} className="space-y-2.5 pt-1">
                <textarea
                  rows={2}
                  value={quickMsg}
                  onChange={(e) => setQuickMsg(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl p-3 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white font-medium transition-colors"
                />

                <button
                  type="submit"
                  className="w-full py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Abrir Chat de WhatsApp</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button with Ping */}
      <motion.button
        id="floating-whatsapp-btn"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Contactar por WhatsApp"
        className="relative group p-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl shadow-emerald-700/40 transition-shadow duration-200 border-2 border-zinc-950 cursor-pointer"
      >
        <MessageCircle className="w-6 h-6 fill-white text-emerald-600" />
        
        {/* Pulsing ring */}
        <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-30 pointer-events-none" />

        {/* Hover Tooltip */}
        {!isOpen && (
          <span className="hidden sm:block absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-black uppercase text-white whitespace-nowrap shadow-xl">
            💬 Pedidos al 7194 9843
          </span>
        )}
      </motion.button>
    </motion.div>
  );
};

