import React, { useState } from 'react';
import { 
  Trash2, 
  RotateCcw, 
  Search, 
  Package, 
  Layers, 
  ClipboardList,
  Video,
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Calendar,
  DollarSign,
  Boxes,
  Sparkles,
  ArchiveRestore,
  RefreshCw,
  EyeOff,
  User,
  MapPin,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { Product, Category, Order, TikTokVideo } from '../../types';
import { 
  restoreProduct, 
  permanentlyDeleteProduct, 
  restoreAllTrashed, 
  emptyTrash,
  restoreCategory,
  permanentlyDeleteCategory,
  restoreAllTrashedCategories,
  emptyTrashedCategories,
  restoreOrder,
  permanentlyDeleteOrder,
  restoreAllTrashedOrders,
  emptyTrashedOrders,
  restoreTikTokVideo,
  permanentlyDeleteTikTokVideo,
  restoreAllTrashedTikToks,
  emptyTrashedTikToks
} from '../../lib/storeService';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export type TrashFilterType = 'all' | 'products' | 'categories' | 'orders' | 'tiktoks';

interface AdminTrashProps {
  trashedProducts: Product[];
  trashedCategories: Category[];
  trashedOrders: Order[];
  trashedTikToks: TikTokVideo[];
  categories: Category[];
  // Product callbacks
  onProductRestored: (restoredProduct: Product, updatedProducts: Product[], updatedTrash: Product[]) => void;
  onProductDeletedPermanently: (updatedTrash: Product[]) => void;
  // Category callbacks
  onCategoryRestored: (restoredCategory: Category, updatedCategories: Category[], updatedTrash: Category[]) => void;
  onCategoryDeletedPermanently: (updatedTrash: Category[]) => void;
  // Order callbacks
  onOrderRestored: (restoredOrder: Order, updatedOrders: Order[], updatedTrash: Order[]) => void;
  onOrderDeletedPermanently: (updatedTrash: Order[]) => void;
  // TikTok callbacks
  onTikTokRestored: (restoredTikTok: TikTokVideo, updatedTikToks: TikTokVideo[], updatedTrash: TikTokVideo[]) => void;
  onTikTokDeletedPermanently: (updatedTrash: TikTokVideo[]) => void;
  // Bulk callbacks
  onAllRestored: () => void;
  onTrashEmptied: () => void;
  onShowToast: (msg: string) => void;
}

export const AdminTrash: React.FC<AdminTrashProps> = ({
  trashedProducts,
  trashedCategories,
  trashedOrders,
  trashedTikToks,
  categories,
  onProductRestored,
  onProductDeletedPermanently,
  onCategoryRestored,
  onCategoryDeletedPermanently,
  onOrderRestored,
  onOrderDeletedPermanently,
  onTikTokRestored,
  onTikTokDeletedPermanently,
  onAllRestored,
  onTrashEmptied,
  onShowToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<TrashFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);
  
  // Modals state for permanent deletion confirmation
  const [itemToDeletePermanently, setItemToDeletePermanently] = useState<{
    id: string;
    type: 'product' | 'category' | 'order' | 'tiktok';
    name: string;
    description?: string;
  } | null>(null);

  const [showEmptyTrashModal, setShowEmptyTrashModal] = useState(false);
  const [showRestoreAllModal, setShowRestoreAllModal] = useState(false);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  // Filtered lists
  const filteredProducts = trashedProducts.filter(p => {
    if (activeSubTab !== 'all' && activeSubTab !== 'products') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) || 
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredCategories = trashedCategories.filter(c => {
    if (activeSubTab !== 'all' && activeSubTab !== 'categories') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) || 
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredOrders = trashedOrders.filter(o => {
    if (activeSubTab !== 'all' && activeSubTab !== 'orders') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(q)) ||
        o.province.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredTikToks = trashedTikToks.filter(t => {
    if (activeSubTab !== 'all' && activeSubTab !== 'tiktoks') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
    }
    return true;
  });

  const totalItemsCount = trashedProducts.length + trashedCategories.length + trashedOrders.length + trashedTikToks.length;
  const currentFilteredCount = filteredProducts.length + filteredCategories.length + filteredOrders.length + filteredTikToks.length;

  // Single Item Handlers
  const handleRestoreProduct = async (product: Product) => {
    setIsProcessingId(product.id);
    try {
      const result = await restoreProduct(product.id);
      onProductRestored(result.restoredProduct, result.updatedProducts, result.updatedTrash);
      onShowToast(`✓ Producto "${product.name}" restablecido al catálogo.`);
    } catch (err: any) {
      onShowToast(`Error al restablecer: ${err.message}`);
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleRestoreCategory = async (category: Category) => {
    setIsProcessingId(category.id);
    try {
      const result = await restoreCategory(category.id);
      onCategoryRestored(result.restoredCategory, result.updatedCategories, result.updatedTrash);
      onShowToast(`✓ Categoría "${category.name}" restablecida.`);
    } catch (err: any) {
      onShowToast(`Error al restablecer categoría: ${err.message}`);
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleRestoreOrder = async (order: Order) => {
    setIsProcessingId(order.id);
    try {
      const result = await restoreOrder(order.id);
      onOrderRestored(result.restoredOrder, result.updatedOrders, result.updatedTrash);
      onShowToast(`✓ Pedido #${order.id} restablecido.`);
    } catch (err: any) {
      onShowToast(`Error al restablecer pedido: ${err.message}`);
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleRestoreTikTok = async (tiktok: TikTokVideo) => {
    setIsProcessingId(tiktok.id);
    try {
      const result = await restoreTikTokVideo(tiktok.id);
      onTikTokRestored(result.restoredTikTok, result.updatedTikToks, result.updatedTrash);
      onShowToast(`✓ Video de TikTok "${tiktok.title}" restablecido.`);
    } catch (err: any) {
      onShowToast(`Error al restablecer video: ${err.message}`);
    } finally {
      setIsProcessingId(null);
    }
  };

  // Permanent Deletion Execution
  const handleConfirmPermanentDelete = async () => {
    if (!itemToDeletePermanently) return;
    const { id, type, name } = itemToDeletePermanently;
    setIsProcessingId(id);
    try {
      if (type === 'product') {
        const updated = await permanentlyDeleteProduct(id);
        onProductDeletedPermanently(updated);
      } else if (type === 'category') {
        const updated = await permanentlyDeleteCategory(id);
        onCategoryDeletedPermanently(updated);
      } else if (type === 'order') {
        const updated = await permanentlyDeleteOrder(id);
        onOrderDeletedPermanently(updated);
      } else if (type === 'tiktok') {
        const updated = await permanentlyDeleteTikTokVideo(id);
        onTikTokDeletedPermanently(updated);
      }
      onShowToast(`✓ "${name}" fue eliminado por completo de la base de datos.`);
      setItemToDeletePermanently(null);
    } catch (err: any) {
      onShowToast(`Error al eliminar: ${err.message}`);
    } finally {
      setIsProcessingId(null);
    }
  };

  // Bulk Handlers
  const handleConfirmRestoreAll = async () => {
    setIsBulkActionLoading(true);
    try {
      await Promise.all([
        trashedProducts.length > 0 ? restoreAllTrashed() : Promise.resolve(null),
        trashedCategories.length > 0 ? restoreAllTrashedCategories() : Promise.resolve(null),
        trashedOrders.length > 0 ? restoreAllTrashedOrders() : Promise.resolve(null),
        trashedTikToks.length > 0 ? restoreAllTrashedTikToks() : Promise.resolve(null)
      ]);
      onAllRestored();
      onShowToast('✓ Todos los elementos de la papelera han sido restablecidos.');
      setShowRestoreAllModal(false);
    } catch (err: any) {
      onShowToast(`Error al restablecer todo: ${err.message}`);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleConfirmEmptyTrash = async () => {
    setIsBulkActionLoading(true);
    try {
      await Promise.all([
        emptyTrash(),
        emptyTrashedCategories(),
        emptyTrashedOrders(),
        emptyTrashedTikToks()
      ]);
      onTrashEmptied();
      onShowToast('✓ La papelera ha sido vaciada por completo.');
      setShowEmptyTrashModal(false);
    } catch (err: any) {
      onShowToast(`Error al vaciar papelera: ${err.message}`);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const formatDeletedDate = (dateStr?: string) => {
    if (!dateStr) return 'Recientemente';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-CR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Header Card */}
      <div className="bg-zinc-950 text-white p-5 sm:p-6 rounded-3xl border-2 border-zinc-900 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center text-red-500 shadow-md shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight font-heading">
                Papelera de Reciclaje
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-red-600/90 text-white text-[11px] font-black uppercase tracking-wider">
                {totalItemsCount} {totalItemsCount === 1 ? 'Elemento' : 'Elementos'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Cualquier producto, categoría, pedido o video eliminado se resguarda aquí. Puedes <strong>restablecerlo</strong> con un clic a su lugar correspondiente o <strong>eliminarlo por completo</strong> si ya no lo necesitas.
            </p>
          </div>
        </div>

        {/* Global Bulk Actions */}
        {totalItemsCount > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end md:self-center">
            <button
              onClick={() => setShowRestoreAllModal(true)}
              className="py-2.5 px-4 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 hover:text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              title="Restablecer todo lo que está en la papelera"
            >
              <ArchiveRestore className="w-4 h-4 text-emerald-400" />
              <span>Restablecer Todo</span>
            </button>
            <button
              onClick={() => setShowEmptyTrashModal(true)}
              className="py-2.5 px-4 rounded-xl bg-red-950 hover:bg-red-900 border border-red-700 text-red-300 hover:text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              title="Eliminar permanentemente todos los elementos de la papelera"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Vaciar Papelera</span>
            </button>
          </div>
        )}
      </div>

      {/* Sub-Tabs Selector & Search Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border-2 border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`py-2 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'all'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <span>Todos ({totalItemsCount})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('products')}
            className={`py-2 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'products'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Productos ({trashedProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('categories')}
            className={`py-2 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'categories'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Categorías ({trashedCategories.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('orders')}
            className={`py-2 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'orders'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Pedidos ({trashedOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tiktoks')}
            className={`py-2 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'tiktoks'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>TikToks ({trashedTikToks.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, ID o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-950"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {totalItemsCount === 0 ? (
        <div className="bg-white border-2 border-dashed border-zinc-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-zinc-50 text-zinc-300 flex items-center justify-center border border-zinc-200 shadow-inner">
            <Trash2 className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-950 font-heading">
            La papelera está vacía
          </h3>
          <p className="text-xs text-zinc-500 max-w-md">
            No hay ningún elemento en la papelera de reciclaje. Cuando elimines un producto, categoría, pedido o video, se resguardará aquí para que puedas recuperarlo en cualquier momento.
          </p>
        </div>
      ) : currentFilteredCount === 0 ? (
        <div className="bg-white border-2 border-dashed border-zinc-200 rounded-3xl p-10 text-center text-zinc-500 text-xs">
          No se encontraron elementos que coincidan con la búsqueda "{searchQuery}".
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* 1. SECCIÓN PRODUCTOS / PRENDAS */}
          {filteredProducts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-zinc-700" />
                  <span>Productos en Papelera ({filteredProducts.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map(product => {
                  const isProcessing = isProcessingId === product.id;
                  const categoryName = categories.find(c => c.id === product.category)?.name || product.category;

                  return (
                    <div 
                      key={product.id}
                      className="bg-white rounded-2xl border-2 border-zinc-200 p-4 flex flex-col justify-between hover:border-zinc-400 transition-all shadow-xs"
                    >
                      <div>
                        {/* Top Badge & Thumbnail */}
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 relative group">
                            <img
                              src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300'}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover grayscale-50 group-hover:grayscale-0 transition-all"
                            />
                            <div className="absolute inset-0 bg-red-950/20 pointer-events-none" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-bold text-[10px] uppercase truncate">
                                {categoryName}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-medium">
                                #{product.id.slice(-5)}
                              </span>
                            </div>
                            <h4 className="font-bold text-xs text-zinc-950 line-clamp-1">
                              {product.name}
                            </h4>
                            <p className="text-[11px] text-zinc-500 font-medium">
                              {product.brand}
                            </p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="mt-3 pt-3 border-t border-zinc-100 grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-zinc-400 block text-[10px]">Precio</span>
                            <span className="font-black text-zinc-950">₡{product.priceCRC.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block text-[10px]">Stock</span>
                            <span className="font-black text-zinc-700">{product.stockCount || 0} unidades</span>
                          </div>
                        </div>

                        {/* Deletion details */}
                        <div className="mt-2.5 p-2 rounded-xl bg-red-50/70 border border-red-100 text-[10px] text-red-900">
                          <div className="flex items-center gap-1 font-bold">
                            <Calendar className="w-3 h-3 text-red-600" />
                            <span>Eliminado: {formatDeletedDate(product.deletedAt)}</span>
                          </div>
                          {product.trashReason && (
                            <p className="mt-0.5 text-zinc-600 truncate">
                              Motivo: {product.trashReason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2">
                        <button
                          onClick={() => handleRestoreProduct(product)}
                          disabled={isProcessing}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                          title="Restablecer este producto al catálogo activo"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restablecer</span>
                        </button>
                        <button
                          onClick={() => setItemToDeletePermanently({
                            id: product.id,
                            type: 'product',
                            name: product.name,
                            description: `Producto de la marca ${product.brand} (₡${product.priceCRC.toLocaleString()})`
                          })}
                          disabled={isProcessing}
                          className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                          title="Eliminar permanentemente de la base de datos"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          <span className="hidden sm:inline">Eliminar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. SECCIÓN CATEGORÍAS */}
          {filteredCategories.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-zinc-700" />
                  <span>Categorías en Papelera ({filteredCategories.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map(cat => {
                  const isProcessing = isProcessingId === cat.id;

                  return (
                    <div 
                      key={cat.id}
                      className="bg-white rounded-2xl border-2 border-zinc-200 p-4 flex flex-col justify-between hover:border-zinc-400 transition-all shadow-xs"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-2xl shrink-0">
                            {cat.icon || '🏷️'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 font-black text-[9px] uppercase tracking-wider">
                              Categoría
                            </span>
                            <h4 className="font-bold text-sm text-zinc-950 truncate mt-1">
                              {cat.name}
                            </h4>
                            <p className="text-[11px] text-zinc-400 font-mono">
                              /{cat.slug}
                            </p>
                          </div>
                        </div>

                        {cat.description && (
                          <p className="mt-2 text-xs text-zinc-600 line-clamp-2">
                            {cat.description}
                          </p>
                        )}

                        {/* Deletion details */}
                        <div className="mt-3 p-2 rounded-xl bg-red-50/70 border border-red-100 text-[10px] text-red-900">
                          <div className="flex items-center gap-1 font-bold">
                            <Calendar className="w-3 h-3 text-red-600" />
                            <span>Eliminado: {formatDeletedDate(cat.deletedAt)}</span>
                          </div>
                          {cat.trashReason && (
                            <p className="mt-0.5 text-zinc-600 truncate">
                              Motivo: {cat.trashReason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2">
                        <button
                          onClick={() => handleRestoreCategory(cat)}
                          disabled={isProcessing}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                          title="Restablecer esta categoría"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restablecer</span>
                        </button>
                        <button
                          onClick={() => setItemToDeletePermanently({
                            id: cat.id,
                            type: 'category',
                            name: cat.name,
                            description: `Categoría con ruta /${cat.slug}`
                          })}
                          disabled={isProcessing}
                          className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                          title="Eliminar permanentemente"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          <span className="hidden sm:inline">Eliminar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. SECCIÓN PEDIDOS */}
          {filteredOrders.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-zinc-700" />
                  <span>Pedidos en Papelera ({filteredOrders.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map(order => {
                  const isProcessing = isProcessingId === order.id;

                  return (
                    <div 
                      key={order.id}
                      className="bg-white rounded-2xl border-2 border-zinc-200 p-4 flex flex-col justify-between hover:border-zinc-400 transition-all shadow-xs"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-black text-[10px] uppercase tracking-wider">
                            Pedido #{order.id}
                          </span>
                          <span className="text-[11px] font-black text-emerald-700">
                            ₡{(order.totalCRC || 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                            <User className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{order.customerName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{order.province || 'Costa Rica'}, {order.canton || ''}</span>
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            Tel: <span className="font-mono text-zinc-800">{order.customerPhone}</span>
                          </div>
                        </div>

                        {/* Items count summary */}
                        <div className="mt-2 text-[11px] text-zinc-600 bg-zinc-50 p-2 rounded-xl border border-zinc-100">
                          <strong>{order.items?.length || 0} producto(s) en orden:</strong>
                          <ul className="mt-1 space-y-0.5">
                            {order.items?.slice(0, 2).map((it, idx) => (
                              <li key={idx} className="truncate text-zinc-700">
                                • {it.quantity}x {it.productName} ({it.size || it.selectedSize || 'Única'})
                              </li>
                            ))}
                            {(order.items?.length || 0) > 2 && (
                              <li className="text-zinc-400 text-[10px]">
                                +{(order.items?.length || 0) - 2} artículo(s) más
                              </li>
                            )}
                          </ul>
                        </div>

                        {/* Deletion details */}
                        <div className="mt-2.5 p-2 rounded-xl bg-red-50/70 border border-red-100 text-[10px] text-red-900">
                          <div className="flex items-center gap-1 font-bold">
                            <Calendar className="w-3 h-3 text-red-600" />
                            <span>Eliminado: {formatDeletedDate(order.deletedAt)}</span>
                          </div>
                          {order.trashReason && (
                            <p className="mt-0.5 text-zinc-600 truncate">
                              Motivo: {order.trashReason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2">
                        <button
                          onClick={() => handleRestoreOrder(order)}
                          disabled={isProcessing}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                          title="Restablecer este pedido"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restablecer</span>
                        </button>
                        <button
                          onClick={() => setItemToDeletePermanently({
                            id: order.id,
                            type: 'order',
                            name: `Pedido #${order.id}`,
                            description: `Cliente ${order.customerName} (₡${(order.totalCRC || 0).toLocaleString()})`
                          })}
                          disabled={isProcessing}
                          className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                          title="Eliminar permanentemente"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          <span className="hidden sm:inline">Eliminar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. SECCIÓN TIKTOKS */}
          {filteredTikToks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                  <Video className="w-4 h-4 text-zinc-700" />
                  <span>Videos de TikTok en Papelera ({filteredTikToks.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTikToks.map(tiktok => {
                  const isProcessing = isProcessingId === tiktok.id;

                  return (
                    <div 
                      key={tiktok.id}
                      className="bg-white rounded-2xl border-2 border-zinc-200 p-4 flex flex-col justify-between hover:border-zinc-400 transition-all shadow-xs"
                    >
                      <div>
                        {/* Thumbnail & Title */}
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-20 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 relative">
                            <img
                              src={tiktok.thumbnail}
                              alt={tiktok.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-red-950/20 pointer-events-none" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 border border-pink-200 font-bold text-[10px] uppercase">
                              TikTok Video
                            </span>
                            <h4 className="font-bold text-xs text-zinc-950 line-clamp-2 mt-1">
                              {tiktok.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-1 font-medium">
                              <span>👁️ {tiktok.views}</span>
                              <span>❤️ {tiktok.likes}</span>
                            </div>
                          </div>
                        </div>

                        {/* Deletion details */}
                        <div className="mt-2.5 p-2 rounded-xl bg-red-50/70 border border-red-100 text-[10px] text-red-900">
                          <div className="flex items-center gap-1 font-bold">
                            <Calendar className="w-3 h-3 text-red-600" />
                            <span>Eliminado: {formatDeletedDate(tiktok.deletedAt)}</span>
                          </div>
                          {tiktok.trashReason && (
                            <p className="mt-0.5 text-zinc-600 truncate">
                              Motivo: {tiktok.trashReason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2">
                        <button
                          onClick={() => handleRestoreTikTok(tiktok)}
                          disabled={isProcessing}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                          title="Restablecer este video de TikTok"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restablecer</span>
                        </button>
                        <button
                          onClick={() => setItemToDeletePermanently({
                            id: tiktok.id,
                            type: 'tiktok',
                            name: tiktok.title,
                            description: `Video de TikTok (${tiktok.views} vistas)`
                          })}
                          disabled={isProcessing}
                          className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                          title="Eliminar permanentemente"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          <span className="hidden sm:inline">Eliminar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* CONFIRMATION MODAL FOR PERMANENT DELETION OF A SINGLE ITEM */}
      <ConfirmDeleteModal
        isOpen={!!itemToDeletePermanently}
        title="Eliminar por Completo"
        message="¿Estás seguro de que deseas eliminar esto por completo? Esta acción borrará el registro definitivamente de la base de datos y no se podrá volver a restablecer."
        itemName={itemToDeletePermanently ? `${itemToDeletePermanently.name}${itemToDeletePermanently.description ? ` — ${itemToDeletePermanently.description}` : ''}` : undefined}
        confirmButtonText="Sí, Eliminar por Completo"
        isLoading={!!isProcessingId}
        onConfirm={handleConfirmPermanentDelete}
        onClose={() => setItemToDeletePermanently(null)}
      />

      {/* CONFIRMATION MODAL FOR RESTORE ALL */}
      <ConfirmDeleteModal
        isOpen={showRestoreAllModal}
        title="Restablecer Todos los Elementos"
        message="¿Deseas restablecer todos los productos, categorías, pedidos y videos que están en la papelera a sus secciones activas?"
        itemName={`${totalItemsCount} elemento(s) en total`}
        confirmButtonText="Restablecer Todo"
        isLoading={isBulkActionLoading}
        onConfirm={handleConfirmRestoreAll}
        onClose={() => setShowRestoreAllModal(false)}
      />

      {/* CONFIRMATION MODAL FOR EMPTY TRASH */}
      <ConfirmDeleteModal
        isOpen={showEmptyTrashModal}
        title="Vaciar Papelera por Completo"
        message="⚠️ ¿Estás completamente seguro de que deseas vaciar toda la papelera? Todos los elementos serán destruidos de manera irreversible en Firestore."
        itemName={`${totalItemsCount} elemento(s) a eliminar definitivamente`}
        confirmButtonText="Sí, Vaciar Todo"
        isLoading={isBulkActionLoading}
        onConfirm={handleConfirmEmptyTrash}
        onClose={() => setShowEmptyTrashModal(false)}
      />

    </div>
  );
};
