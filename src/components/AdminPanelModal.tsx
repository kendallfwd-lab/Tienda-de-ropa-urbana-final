import React, { useState, useEffect } from 'react';
import { 
  X, 
  LayoutDashboard, 
  Package, 
  Layers, 
  ClipboardList, 
  Users, 
  Settings, 
  Video, 
  Trash2,
  LogOut, 
  FileSpreadsheet, 
  Plus, 
  ShieldCheck,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { Product, TikTokVideo, Category, Order, StoreSettings } from '../types';
import { AdminUser, logoutAdminUser } from '../lib/authService';
import { 
  fetchCategories, 
  fetchOrders, 
  fetchStoreSettings, 
  fetchTrashedProducts,
  getLocalTrashedProducts,
  fetchTrashedCategories,
  getLocalTrashedCategories,
  fetchTrashedOrders,
  getLocalTrashedOrders,
  fetchTrashedTikToks,
  getLocalTrashedTikToks,
  exportInventoryToExcel, 
  exportOrdersToExcel, 
  exportCustomersToExcel, 
  downloadCSV,
  saveTikTokVideo,
  trashTikTokVideo,
  removeTikTokVideo,
  fetchProducts,
  fetchTikTokVideos
} from '../lib/storeService';
import { STORE_SETTINGS_DEFAULT, INITIAL_CATEGORIES, INITIAL_ORDERS } from '../data/storeData';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminProducts } from './admin/AdminProducts';
import { AdminCategories } from './admin/AdminCategories';
import { AdminInventory } from './admin/AdminInventory';
import { AdminOrders } from './admin/AdminOrders';
import { AdminCustomers } from './admin/AdminCustomers';
import { AdminStoreSettings } from './admin/AdminStoreSettings';
import { AdminTrash } from './admin/AdminTrash';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onProductsUpdated: (products: Product[]) => void;
  tiktokVideos: TikTokVideo[];
  onTikTokVideosUpdated: (videos: TikTokVideo[]) => void;
  adminUser: AdminUser | null;
  onLogout: () => void;
}

type TabType = 'dashboard' | 'products' | 'categories' | 'inventory' | 'orders' | 'customers' | 'settings' | 'tiktoks' | 'trash';

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  products,
  onProductsUpdated,
  tiktokVideos,
  onTikTokVideosUpdated,
  adminUser,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [categories, setCategories] = useState<Category[]>(() => INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>(() => INITIAL_ORDERS);
  const [settings, setSettings] = useState<StoreSettings>(() => STORE_SETTINGS_DEFAULT);
  const [trashedProducts, setTrashedProducts] = useState<Product[]>(() => getLocalTrashedProducts());
  const [trashedCategories, setTrashedCategories] = useState<Category[]>(() => getLocalTrashedCategories());
  const [trashedOrders, setTrashedOrders] = useState<Order[]>(() => getLocalTrashedOrders());
  const [trashedTikToks, setTrashedTikToks] = useState<TikTokVideo[]>(() => getLocalTrashedTikToks());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // TikTok Modal editing state
  const [editingTikTok, setEditingTikTok] = useState<TikTokVideo | null>(null);

  // Load all initial admin datasets on mount / open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadAdminData() {
      try {
        const [cats, ords, setts, trashedProds, trashedCats, trashedOrds, trashedTiks] = await Promise.all([
          fetchCategories(),
          fetchOrders(),
          fetchStoreSettings(),
          fetchTrashedProducts(),
          fetchTrashedCategories(),
          fetchTrashedOrders(),
          fetchTrashedTikToks()
        ]);
        if (isMounted) {
          if (cats && cats.length > 0) setCategories(cats);
          if (ords && ords.length > 0) setOrders(ords);
          if (setts) setSettings(setts);
          if (trashedProds) setTrashedProducts(trashedProds);
          if (trashedCats) setTrashedCategories(trashedCats);
          if (trashedOrds) setTrashedOrders(trashedOrds);
          if (trashedTiks) setTrashedTikToks(trashedTiks);
        }
      } catch (e) {
        console.warn('Error loading admin collections:', e);
      }
    }
    loadAdminData();
    return () => { isMounted = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleExportInventory = () => {
    const csv = exportInventoryToExcel(products);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(csv, `inventario_leslie_store_${dateStr}.csv`);
    showToast('✓ Inventario descargado para Excel');
  };

  const handleExportOrders = () => {
    const csv = exportOrdersToExcel(orders);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(csv, `pedidos_leslie_store_${dateStr}.csv`);
    showToast('✓ Pedidos descargados para Excel');
  };

  const handleSaveTikTok = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTikTok) return;
    try {
      const saved = await saveTikTokVideo(editingTikTok);
      const existsIndex = tiktokVideos.findIndex(v => v.id === saved.id);
      let updated: TikTokVideo[];
      if (existsIndex >= 0) {
        updated = [...tiktokVideos];
        updated[existsIndex] = saved;
      } else {
        updated = [...tiktokVideos, saved];
      }
      onTikTokVideosUpdated(updated);
      showToast('✓ Video de TikTok guardado');
      setEditingTikTok(null);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteTikTok = async (videoId: string) => {
    try {
      const { updatedTikToks, updatedTrash } = await trashTikTokVideo(videoId);
      onTikTokVideosUpdated(updatedTikToks);
      setTrashedTikToks(updatedTrash);
      showToast('✓ Video de TikTok enviado a la Papelera');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-60 bg-zinc-950 text-white px-4 py-2.5 rounded-2xl shadow-2xl border-2 border-emerald-500 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-4 duration-150">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          {toastMessage}
        </div>
      )}

      {/* Main Admin Window */}
      <div className="bg-zinc-100 border-2 border-zinc-950 rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:px-6 border-b-2 border-zinc-950 bg-zinc-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-zinc-950 font-black flex items-center justify-center text-sm shadow-sm">
              🐺
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base uppercase tracking-wider font-heading">
                  Panel Administrativo
                </h1>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white">
                  Leslie Store PRO
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">
                Sesión activa: <strong className="text-zinc-200">{adminUser?.username || 'Administrador'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                logoutAdminUser();
                onLogout();
                onClose();
              }}
              className="py-1.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Cerrar sesión de administrador"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-white border-b-2 border-zinc-200 px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 py-2">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-3.5 rounded-xl font-black text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>1. Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-3.5 rounded-xl font-black text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'products'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>2. Productos ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-3.5 rounded-xl font-black text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'categories'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3. Categorías ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-2 px-3.5 rounded-xl font-black text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'inventory'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>4. Inventario</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-3.5 rounded-xl font-black text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'orders'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>5. Pedidos ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`py-2 px-3.5 rounded-xl font-black text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'customers'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clientes</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-3.5 rounded-xl font-black text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'settings'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configuración</span>
          </button>

          <button
            onClick={() => setActiveTab('tiktoks')}
            className={`py-2 px-3.5 rounded-xl font-black text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'tiktoks'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>TikTok Videos</span>
          </button>

          <button
            onClick={() => setActiveTab('trash')}
            className={`py-2 px-3.5 rounded-xl font-black text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'trash'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Papelera</span>
            {(trashedProducts.length + trashedCategories.length + trashedOrders.length + trashedTikToks.length) > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'trash' ? 'bg-white text-red-600' : 'bg-red-600 text-white'
              }`}>
                {trashedProducts.length + trashedCategories.length + trashedOrders.length + trashedTikToks.length}
              </span>
            )}
          </button>

        </div>

        {/* Tab Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          
          {activeTab === 'dashboard' && (
            <AdminDashboard
              products={products}
              orders={orders}
              categories={categories}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onNewProduct={() => setActiveTab('products')}
              onExportInventory={handleExportInventory}
              onExportOrders={handleExportOrders}
            />
          )}

          {activeTab === 'products' && (
            <AdminProducts
              products={products}
              categories={categories}
              onProductsUpdated={onProductsUpdated}
              onProductTrashed={(trashed, updatedProducts, updatedTrash) => {
                onProductsUpdated(updatedProducts);
                setTrashedProducts(updatedTrash);
              }}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'categories' && (
            <AdminCategories
              categories={categories}
              products={products}
              onCategoriesUpdated={setCategories}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'inventory' && (
            <AdminInventory
              products={products}
              categories={categories}
              onProductsUpdated={onProductsUpdated}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrders
              orders={orders}
              onOrdersUpdated={setOrders}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'customers' && (
            <AdminCustomers
              orders={orders}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <AdminStoreSettings
              settings={settings}
              onSettingsUpdated={setSettings}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'tiktoks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                <div>
                  <h3 className="text-sm font-black uppercase text-zinc-950">Videos Virales de TikTok</h3>
                  <p className="text-xs text-zinc-500">Muestra los videos con más views de la cuenta de Leslie Store en la página principal.</p>
                </div>
                <button
                  onClick={() => setEditingTikTok({
                    id: 'tt-' + Date.now().toString(36),
                    title: '',
                    views: '15.4K',
                    likes: '1.2K',
                    comments: '85',
                    thumbnail: '/images/neon-face.webp',
                    url: 'https://tiktok.com/@lesliestore.cr'
                  })}
                  className="py-2 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-black text-xs uppercase flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Video</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {tiktokVideos.map(vid => (
                  <div key={vid.id} className="bg-white border-2 border-zinc-200 rounded-2xl p-3 space-y-2">
                    <img src={vid.thumbnail} alt={vid.title} className="w-full aspect-9/16 rounded-xl object-cover" />
                    <h4 className="font-bold text-xs line-clamp-1">{vid.title}</h4>
                    <div className="text-[11px] text-zinc-500 flex justify-between">
                      <span>{vid.views} vistas</span>
                      <span>{vid.likes} likes</span>
                    </div>
                    <div className="pt-2 border-t flex justify-end">
                      <button
                        onClick={() => handleDeleteTikTok(vid.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-bold"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {editingTikTok && (
                <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
                  <div className="bg-white p-6 rounded-3xl w-full max-w-md space-y-4">
                    <h3 className="font-black text-sm uppercase">Nuevo Video TikTok</h3>
                    <form onSubmit={handleSaveTikTok} className="space-y-3">
                      <div>
                        <label className="text-xs font-bold">Título</label>
                        <input
                          required
                          value={editingTikTok.title}
                          onChange={(e) => setEditingTikTok({ ...editingTikTok, title: e.target.value })}
                          className="w-full border p-2 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold">Thumbnail / Foto</label>
                        <input
                          required
                          value={editingTikTok.thumbnail}
                          onChange={(e) => setEditingTikTok({ ...editingTikTok, thumbnail: e.target.value })}
                          className="w-full border p-2 rounded-xl text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-bold">Vistas</label>
                          <input
                            value={editingTikTok.views}
                            onChange={(e) => setEditingTikTok({ ...editingTikTok, views: e.target.value })}
                            className="w-full border p-2 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold">Likes</label>
                          <input
                            value={editingTikTok.likes}
                            onChange={(e) => setEditingTikTok({ ...editingTikTok, likes: e.target.value })}
                            className="w-full border p-2 rounded-xl text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingTikTok(null)}
                          className="px-4 py-2 text-xs font-bold"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-zinc-950 text-white rounded-xl text-xs font-bold"
                        >
                          Guardar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'trash' && (
            <AdminTrash
              trashedProducts={trashedProducts}
              trashedCategories={trashedCategories}
              trashedOrders={trashedOrders}
              trashedTikToks={trashedTikToks}
              categories={categories}
              onProductRestored={(_restoredProduct, updatedProducts, updatedTrash) => {
                onProductsUpdated(updatedProducts);
                setTrashedProducts(updatedTrash);
              }}
              onProductDeletedPermanently={(updatedTrash) => {
                setTrashedProducts(updatedTrash);
              }}
              onCategoryRestored={(_restoredCategory, updatedCategories, updatedTrash) => {
                setCategories(updatedCategories);
                setTrashedCategories(updatedTrash);
              }}
              onCategoryDeletedPermanently={(updatedTrash) => {
                setTrashedCategories(updatedTrash);
              }}
              onOrderRestored={(_restoredOrder, updatedOrders, updatedTrash) => {
                setOrders(updatedOrders);
                setTrashedOrders(updatedTrash);
              }}
              onOrderDeletedPermanently={(updatedTrash) => {
                setTrashedOrders(updatedTrash);
              }}
              onTikTokRestored={(_restoredTikTok, updatedTikToks, updatedTrash) => {
                onTikTokVideosUpdated(updatedTikToks);
                setTrashedTikToks(updatedTrash);
              }}
              onTikTokDeletedPermanently={(updatedTrash) => {
                setTrashedTikToks(updatedTrash);
              }}
              onAllRestored={async () => {
                const [prods, cats, ords, tiks] = await Promise.all([
                  fetchProducts(),
                  fetchCategories(),
                  fetchOrders(),
                  fetchTikTokVideos()
                ]);
                if (prods) onProductsUpdated(prods);
                if (cats) setCategories(cats);
                if (ords) setOrders(ords);
                if (tiks) onTikTokVideosUpdated(tiks);
                setTrashedProducts([]);
                setTrashedCategories([]);
                setTrashedOrders([]);
                setTrashedTikToks([]);
              }}
              onTrashEmptied={() => {
                setTrashedProducts([]);
                setTrashedCategories([]);
                setTrashedOrders([]);
                setTrashedTikToks([]);
              }}
              onShowToast={showToast}
            />
          )}

        </div>

      </div>

    </div>
  );
};
