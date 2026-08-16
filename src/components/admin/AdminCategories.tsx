import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Layers, Check, X, Tag } from 'lucide-react';
import { Category, Product } from '../../types';
import { saveCategory, trashCategory } from '../../lib/storeService';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface AdminCategoriesProps {
  categories: Category[];
  products: Product[];
  onCategoriesUpdated: (categories: Category[]) => void;
  onShowToast: (msg: string) => void;
}

const COMMON_EMOJIS = ['👕', '🩳', '👖', '🧢', '👟', '🏷️', '👗', '⛓️', '🔥', '🎒', '🕶️', '🧥', '⭐', '💀', '💎'];

export const AdminCategories: React.FC<AdminCategoriesProps> = ({
  categories,
  products,
  onCategoriesUpdated,
  onShowToast
}) => {
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getProductCount = (catId: string) => {
    return products.filter(p => p.category === catId).length;
  };

  const handleStartNew = () => {
    setEditingCategory({
      id: 'cat-' + Date.now().toString(36),
      name: '',
      slug: '',
      icon: '👕',
      description: '',
      isActive: true
    });
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCategory({ ...cat });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name?.trim()) {
      onShowToast('Por favor escribe un nombre para la categoría.');
      return;
    }

    const slug = editingCategory.slug?.trim() || editingCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const categoryToSave: Category = {
      id: editingCategory.id || ('cat-' + Date.now().toString(36)),
      name: editingCategory.name.trim(),
      slug: slug,
      icon: editingCategory.icon || '🏷️',
      description: editingCategory.description || '',
      isActive: editingCategory.isActive !== undefined ? editingCategory.isActive : true
    };

    setIsSaving(true);
    try {
      await saveCategory(categoryToSave);
      const existsIndex = categories.findIndex(c => c.id === categoryToSave.id);
      let updated: Category[];
      if (existsIndex >= 0) {
        updated = [...categories];
        updated[existsIndex] = categoryToSave;
      } else {
        updated = [...categories, categoryToSave];
      }
      onCategoriesUpdated(updated);
      onShowToast(`✓ Categoría "${categoryToSave.name}" guardada con éxito`);
      setEditingCategory(null);
    } catch (err: any) {
      onShowToast(err.message || 'Error al guardar categoría');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      const { updatedCategories } = await trashCategory(categoryToDelete.id);
      onCategoriesUpdated(updatedCategories);
      if (editingCategory?.id === categoryToDelete.id) {
        setEditingCategory(null);
      }
      onShowToast(`✓ Categoría "${categoryToDelete.name}" enviada a la Papelera`);
      setCategoryToDelete(null);
    } catch (err: any) {
      onShowToast(err.message || 'Error al enviar categoría a la papelera');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
        <div>
          <h3 className="text-sm font-black uppercase text-zinc-950 flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-700" />
            Gestión de Categorías de la Tienda
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Crea, edita o desactiva secciones del catálogo (Camisetas, Tenis, Pantalones, etc.).
          </p>
        </div>

        <button
          onClick={handleStartNew}
          className="py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map(cat => {
          const pCount = getProductCount(cat.id);
          return (
            <div
              key={cat.id}
              className={`p-4 rounded-2xl border-2 transition-all bg-white flex flex-col justify-between ${
                cat.isActive ? 'border-zinc-200 hover:border-zinc-950' : 'border-zinc-200 opacity-60 bg-zinc-50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-2 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                      {cat.icon}
                    </span>
                    <div>
                      <h4 className="font-black text-sm text-zinc-950 uppercase">{cat.name}</h4>
                      <div className="text-[11px] font-mono text-zinc-400">/{cat.slug}</div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    cat.isActive ? 'bg-emerald-100 text-emerald-900' : 'bg-zinc-200 text-zinc-700'
                  }`}>
                    {cat.isActive ? 'Activa' : 'Oculta'}
                  </span>
                </div>

                {cat.description && (
                  <p className="text-xs text-zinc-600 mt-2.5 line-clamp-2">
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500">
                  {pCount} {pCount === 1 ? 'producto' : 'productos'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStartEdit(cat)}
                    className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors cursor-pointer"
                    title="Editar categoría"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCategoryToDelete(cat)}
                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                    title="Eliminar categoría"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-zinc-950 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-black text-sm uppercase text-zinc-950 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                {editingCategory.id && categories.some(c => c.id === editingCategory.id) ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <div className="flex items-center gap-2">
                {editingCategory.id && categories.some(c => c.id === editingCategory.id) && (
                  <button
                    type="button"
                    onClick={() => {
                      const found = categories.find(c => c.id === editingCategory.id);
                      if (found) setCategoryToDelete(found);
                    }}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                    title="Eliminar esta categoría"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setEditingCategory(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory(prev => ({ 
                    ...prev, 
                    name: e.target.value,
                    slug: prev?.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                  }))}
                  placeholder="Ej: Tenis & Calzado, Camisetas, Vestidos..."
                  className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2.5 px-3 text-xs font-bold text-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
                  Emoji / Ícono Representativo
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={editingCategory.icon || '👕'}
                    onChange={(e) => setEditingCategory(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-16 text-center text-xl bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-1.5 px-2 focus:outline-none"
                  />
                  <span className="text-xs text-zinc-500">Selecciona o escribe cualquier emoji:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-100 rounded-xl">
                  {COMMON_EMOJIS.map(emoji => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setEditingCategory(prev => ({ ...prev, icon: emoji }))}
                      className="p-1.5 hover:bg-white rounded-lg text-base transition-colors cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
                  Descripción (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Breve descripción de las prendas de esta sección..."
                  className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl p-2.5 text-xs text-zinc-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-xs font-bold text-zinc-800">Categoría Visible en la Tienda</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCategory.isActive !== false}
                    onChange={(e) => setEditingCategory(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-950"></div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs uppercase cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2.5 px-5 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{isSaving ? 'Guardando...' : 'Guardar Categoría'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Deletion Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!categoryToDelete}
        title="Mover Categoría a la Papelera"
        message={
          categoryToDelete && getProductCount(categoryToDelete.id) > 0
            ? `⚠️ Esta categoría tiene ${getProductCount(categoryToDelete.id)} producto(s) asignados. Se enviará a la Papelera administrativa (podrás restablecerla o eliminarla por completo luego).`
            : '¿Deseas mover esta categoría a la Papelera? Dejará de mostrarse en los menús y filtros de la tienda, pero podrás restablecerla en cualquier momento.'
        }
        itemName={categoryToDelete ? `${categoryToDelete.icon} ${categoryToDelete.name} (/${categoryToDelete.slug})` : undefined}
        confirmButtonText="Mover a la Papelera"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setCategoryToDelete(null)}
      />

    </div>
  );
};
