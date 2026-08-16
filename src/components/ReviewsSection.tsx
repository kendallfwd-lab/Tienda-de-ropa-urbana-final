import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle, Plus, ThumbsUp, Sparkles, Award } from 'lucide-react';
import { STORE_REVIEWS, STORE_INFO } from '../data/storeData';
import { StoreReview } from '../types';

export const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<StoreReview[]>(STORE_REVIEWS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    const newRev: StoreReview = {
      id: `rev-${Date.now()}`,
      author: newAuthor.trim(),
      rating: newRating,
      date: 'Hace un momento',
      comment: newComment.trim(),
      verified: true,
      source: 'Google Maps'
    };

    setReviews([newRev, ...reviews]);
    setSubmittedMessage(true);
    setTimeout(() => {
      setSubmittedMessage(false);
      setShowAddModal(false);
      setNewAuthor('');
      setNewComment('');
    }, 1500);
  };

  return (
    <section id="resenas" className="py-16 bg-white relative border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-950 text-white text-xs font-black uppercase tracking-widest border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              Opiniones Reales de Clientes
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tighter uppercase font-heading">
              Calificación Perfecta de 5.0 ⭐ en Google Maps
            </h2>
            
            <p className="text-zinc-600 text-sm sm:text-base font-medium">
              La comunidad de Puntarenas y amantes del streetwear en todo Costa Rica nos respaldan por calidad y rapidez.
            </p>
          </div>

          {/* Quick Review Action */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-colors shrink-0 border border-zinc-800"
          >
            <Plus className="w-4 h-4 text-red-500" />
            <span>Escribir una Reseña</span>
          </button>
        </div>

        {/* Rating Overview Box */}
        <div className="p-6 rounded-3xl bg-zinc-50 border-2 border-zinc-950 shadow-sm mb-8 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          <div className="sm:col-span-4 text-center sm:text-left sm:border-r-2 sm:border-zinc-200 sm:pr-6">
            <div className="text-5xl font-black text-zinc-950 font-mono tracking-tight">5,0</div>
            <div className="flex items-center justify-center sm:justify-start gap-1 py-1.5 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-zinc-500 font-bold uppercase">Basado en opiniones en Google Maps y redes sociales</p>
          </div>

          <div className="sm:col-span-8 space-y-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-20 text-zinc-800 font-black uppercase">5 estrellas</span>
              <div className="flex-1 h-2.5 rounded-full bg-zinc-200 overflow-hidden">
                <div className="h-full bg-zinc-950 rounded-full w-full" />
              </div>
              <span className="w-8 text-right font-mono text-zinc-950 font-black">100%</span>
            </div>

            <div className="flex items-center gap-3 text-zinc-400">
              <span className="w-20 font-bold uppercase">4 estrellas</span>
              <div className="flex-1 h-2.5 rounded-full bg-zinc-200 overflow-hidden">
                <div className="h-full bg-zinc-400 rounded-full w-0" />
              </div>
              <span className="w-8 text-right font-mono">0%</span>
            </div>

            <div className="flex items-center gap-3 text-zinc-400">
              <span className="w-20 font-bold uppercase">3 estrellas</span>
              <div className="flex-1 h-2.5 rounded-full bg-zinc-200 overflow-hidden">
                <div className="h-full bg-zinc-400 rounded-full w-0" />
              </div>
              <span className="w-8 text-right font-mono">0%</span>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-3xl bg-white border-2 border-zinc-950 flex flex-col justify-between space-y-4 hover:shadow-lg transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 font-bold">{rev.date}</span>
                </div>

                <p className="text-xs text-zinc-700 leading-relaxed italic font-medium">
                  &quot;{rev.comment}&quot;
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-zinc-950 uppercase">{rev.author}</h4>
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-bold">
                    <CheckCircle className="w-2.5 h-2.5 text-red-600" />
                    {rev.source}
                  </span>
                </div>

                <div className="w-8 h-8 rounded-full bg-zinc-950 text-white flex items-center justify-center font-black text-xs uppercase border border-zinc-800">
                  {rev.author.charAt(0)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal to add review */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white border-2 border-zinc-950 rounded-3xl p-6 shadow-2xl text-zinc-900 space-y-4">
              <h3 className="text-lg font-black text-zinc-950 uppercase tracking-tight">Escribir reseña sobre Leslie Store</h3>
              
              {submittedMessage ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-600 text-emerald-900 text-center text-sm font-black uppercase">
                  ¡Gracias por tu reseña! Se ha publicado correctamente.
                </div>
              ) : (
                <form onSubmit={handleAddReview} className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-zinc-800 uppercase block mb-1">Tu Nombre</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Carlos M."
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-3.5 py-2 text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-zinc-800 uppercase block mb-1">Calificación</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewRating(star)}
                          className="p-1"
                        >
                          <Star className={`w-6 h-6 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-zinc-800 uppercase block mb-1">Comentario</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="¿Qué te pareció la ropa, la atención y el estilo de la tienda?"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-3.5 py-2 text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 text-xs font-black uppercase hover:bg-zinc-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-black uppercase tracking-wider shadow border border-zinc-800"
                    >
                      Publicar Reseña
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

