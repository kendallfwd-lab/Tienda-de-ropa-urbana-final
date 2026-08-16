import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  Image as ImageIcon, 
  Star, 
  Flame, 
  Sparkles, 
  Check, 
  X, 
  Layers, 
  FileSpreadsheet,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { Product, Category } from '../../types';
import { saveProduct, trashProduct, exportProductsToShopifyCSV, downloadCSV } from '../../lib/storeService';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface AdminProductsProps {
  products: Product[];
  categories: Category[];
  onProductsUpdated: (products: Product[]) => void;
  onProductTrashed?: (trashed: Product, updatedProducts: Product[], updatedTrash: Product[]) => void;
  onShowToast: (msg: string) => void;
}

const CLOTHING_SIZES_PRESET = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
const SHOE_SIZES_PRESET = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
const ACCESSORY_SIZES_PRESET = ['Ajustable (Snapback)', 'Talla Única'];

const DEFAULT_NEW_PRODUCT: Product = {
  id: '',
  name: '',
  brand: 'Leslie Store',
  category: 'camisetas',
  priceCRC: 18500,
  priceUSD: 36,
  originalPriceCRC: 0,
  image: '/images/neon-face.webp',
  galleryImages: ['/images/neon-face.webp'],
  sizes: ['S', 'M', 'L', 'XL'],
  sizeInventory: { 'S': 4, 'M': 6, 'L': 4, 'XL': 2 },
  colors: ['Negro'],
  description: 'Prenda streetwear de alta calidad confeccionada con materiales pesados y corte moderno.',
  features: ['Corte Oversize / Boxy', 'Algodón pesado 240g', 'Estampado de alta durabilidad'],
  tag: 'Nuevo Drop 🔥',
  inStock: true,
  stockCount: 16,
  rating: 5.0,
  reviewsCount: 1,
  isFeatured: true,
  isViral: false,
  isNew: true
};

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  categories,
  onProductsUpdated,
  onProductTrashed,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newColorInput, setNewColorInput] = useState('');
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    }
    return true;
  });

  const handleStartCreate = () => {
    setEditingProduct({
      ...DEFAULT_NEW_PRODUCT,
      id: 'prod-' + Date.now().toString(36)
    });
  };

  const handleStartEdit = (product: Product) => {
    setEditingProduct({
      ...product,
      galleryImages: product.galleryImages && product.galleryImages.length > 0 ? product.galleryImages : [product.image],
      sizeInventory: product.sizeInventory || {}
    });
  };

  const handleApplySizePreset = (preset: 'clothing' | 'shoes' | 'accessory') => {
    if (!editingProduct) return;
    let newSizes: string[] = [];
    if (preset === 'clothing') newSizes = [...CLOTHING_SIZES_PRESET];
    if (preset === 'shoes') newSizes = [...SHOE_SIZES_PRESET];
    if (preset === 'accessory') newSizes = [...ACCESSORY_SIZES_PRESET];

    const newInventory: Record<string, number> = {};
    newSizes.forEach(s => {
      newInventory[s] = editingProduct.sizeInventory?.[s] !== undefined ? editingProduct.sizeInventory[s] : 4;
    });

    setEditingProduct({
      ...editingProduct,
      sizes: newSizes,
      sizeInventory: newInventory
    });
  };

  const handleToggleSize = (size: string) => {
    if (!editingProduct) return;
    const exists = editingProduct.sizes.includes(size);
    let updatedSizes: string[];
    const updatedInventory = { ...(editingProduct.sizeInventory || {}) };

    if (exists) {
      updatedSizes = editingProduct.sizes.filter(s => s !== size);
      delete updatedInventory[size];
    } else {
      updatedSizes = [...editingProduct.sizes, size];
      updatedInventory[size] = 4;
    }

    setEditingProduct({
      ...editingProduct,
      sizes: updatedSizes,
      sizeInventory: updatedInventory
    });
  };

  const handleAddCustomSize = () => {
    if (!customSizeInput.trim() || !editingProduct) return;
    const size = customSizeInput.trim().toUpperCase();
    if (!editingProduct.sizes.includes(size)) {
      setEditingProduct({
        ...editingProduct,
        sizes: [...editingProduct.sizes, size],
        sizeInventory: { ...(editingProduct.sizeInventory || {}), [size]: 4 }
      });
    }
    setCustomSizeInput('');
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim() || !editingProduct) return;
    const url = newImageUrl.trim();
    const gallery = editingProduct.galleryImages || [editingProduct.image];
    if (!gallery.includes(url)) {
      setEditingProduct({
        ...editingProduct,
        galleryImages: [...gallery, url],
        image: editingProduct.image || url
      });
    }
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    if (!editingProduct) return;
    const gallery = [...(editingProduct.galleryImages || [])];
    gallery.splice(index, 1);
    const newCover = gallery[0] || '/images/neon-face.webp';
    setEditingProduct({
      ...editingProduct,
      galleryImages: gallery,
      image: newCover
    });
  };

  const handleSetCoverImage = (url: string) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      image: url
    });
  };

  const handleAddColor = () => {
    if (!newColorInput.trim() || !editingProduct) return;
    const color = newColorInput.trim();
    if (!editingProduct.colors.includes(color)) {
      setEditingProduct({
        ...editingProduct,
        colors: [...editingProduct.colors, color]
      });
    }
    setNewColorInput('');
  };

  const handleRemoveColor = (color: string) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      colors: editingProduct.colors.filter(c => c !== color)
    });
  };

  const handleAddFeature = () => {
    if (!newFeatureInput.trim() || !editingProduct) return;
    const feat = newFeatureInput.trim();
    setEditingProduct({
      ...editingProduct,
      features: [...(editingProduct.features || []), feat]
    });
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (idx: number) => {
    if (!editingProduct) return;
    const feats = [...(editingProduct.features || [])];
    feats.splice(idx, 1);
    setEditingProduct({
      ...editingProduct,
      features: feats
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name?.trim()) {
      alert('El producto necesita un nombre.');
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveProduct(editingProduct);
      const existsIndex = products.findIndex(p => p.id === saved.id);
      let updated: Product[];
      if (existsIndex >= 0) {
        updated = [...products];
        updated[existsIndex] = saved;
      } else {
        updated = [saved, ...products];
      }
      onProductsUpdated(updated);
      onShowToast(`✓ Producto "${saved.name}" guardado exitosamente`);
      setEditingProduct(null);
    } catch (err: any) {
      alert('Error al guardar producto: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const result = await trashProduct(productToDelete.id, 'Ocultado por falta de disponibilidad');
      onProductsUpdated(result.updatedProducts);
      if (onProductTrashed) {
        onProductTrashed(result.trashedProduct, result.updatedProducts, result.updatedTrash);
      }
      if (editingProduct?.id === productToDelete.id) {
        setEditingProduct(null);
      }
      onShowToast(`✓ "${productToDelete.name}" movido a la Papelera. Puedes restablecerlo cuando vuelvas a tener disponibilidad.`);
      setProductToDelete(null);
    } catch (err: any) {
      onShowToast('Error al mover a papelera: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportShopify = () => {
    const csvData = exportProductsToShopifyCSV(products);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(csvData, `catalogo_shopify_leslie_store_${dateStr}.csv`);
    onShowToast('✓ Catálogo exportado para Shopify en CSV');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
        <div>
          <h3 className="text-sm font-black uppercase text-zinc-950 flex items-center gap-2">
            <Package className="w-4 h-4 text-zinc-700" />
            Catálogo de Productos &amp; Drops
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Agrega ropa, calzado en tallas numéricas (37-45), sube múltiples fotos y controla precios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportShopify}
            className="py-2.5 px-3 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer"
            title="Exportar formato estándar para tiendas"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Shopify CSV</span>
          </button>

          <button
            onClick={handleStartCreate}
            className="py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Agregar Producto</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, marca o código..."
            className="w-full bg-white border-2 border-zinc-200 focus:border-zinc-950 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-zinc-900 focus:outline-none"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 px-3 text-xs font-bold text-zinc-900 focus:outline-none"
        >
          <option value="all">Todas las Categorías ({products.length})</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(product => {
          const isShoe = product.category === 'calzado' || product.sizes.some(s => !isNaN(Number(s)));
          const totalStock = product.stockCount || 0;

          return (
            <div
              key={product.id}
              className="bg-white border-2 border-zinc-200 hover:border-zinc-950 rounded-2xl p-4 transition-all flex flex-col justify-between space-y-3 group shadow-xs"
            >
              <div>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 mb-3">
                  <img
                    src={product.image || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.isFeatured && (
                      <span className="px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-xs text-white text-[10px] font-black uppercase flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        Destacado
                      </span>
                    )}
                    {product.isViral && (
                      <span className="px-2 py-0.5 rounded-md bg-red-600/90 backdrop-blur-xs text-white text-[10px] font-black uppercase flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5 text-white fill-white" />
                        Viral TikTok
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                      totalStock > 0 && product.inStock ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {totalStock > 0 && product.inStock ? `${totalStock} en stock` : 'Agotado'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-800">
                    {product.brand}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">
                    {categories.find(c => c.id === product.category)?.name || product.category}
                  </span>
                </div>

                <h4 className="font-black text-sm text-zinc-950 mt-1 line-clamp-1">
                  {product.name}
                </h4>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-base font-black text-zinc-950 font-heading">
                    ₡{(product.priceCRC || 0).toLocaleString()}
                  </span>
                  {product.originalPriceCRC ? (
                    <span className="text-xs text-zinc-400 line-through">
                      ₡{(product.originalPriceCRC || 0).toLocaleString()}
                    </span>
                  ) : null}
                </div>

                {/* Sizes Chips */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {product.sizes.map(size => (
                    <span
                      key={size}
                      className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[10px] font-bold text-zinc-700"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400">
                  #{product.id}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStartEdit(product)}
                    className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => setProductToDelete(product)}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-2 border-zinc-950 rounded-3xl w-full max-w-3xl my-8 p-6 shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <span className="text-[10px] font-black uppercase text-zinc-400">Editor de Catálogo</span>
                <h3 className="font-black text-lg uppercase text-zinc-950">
                  {editingProduct.id.startsWith('prod-') && !products.some(p => p.id === editingProduct.id) ? 'Agregar Nueva Prenda' : `Editar: ${editingProduct.name || 'Prenda'}`}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {products.some(p => p.id === editingProduct.id) && (
                  <button
                    type="button"
                    onClick={() => setProductToDelete(editingProduct)}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                    title="Eliminar este producto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Row 1: Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                    placeholder="Ej: Camiseta Oversize 'Neon Face' Red Trim"
                    className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 px-3 text-xs font-bold text-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
                    Marca / Fabricante
                  </label>
                  <input
                    type="text"
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, brand: e.target.value } : null)}
                    placeholder="Leslie Store, Rough Play, Majestik..."
                    className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 px-3 text-xs font-bold text-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Category & Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, category: e.target.value } : null)}
                    className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 px-3 text-xs font-bold text-zinc-900 focus:outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
                    Precio de Venta (₡ CRC) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-zinc-500">₡</span>
                    <input
                      type="number"
                      required
                      value={editingProduct.priceCRC}
                      onChange={(e) => {
                        const crc = Number(e.target.value) || 0;
                        setEditingProduct(prev => prev ? { 
                          ...prev, 
                          priceCRC: crc,
                          priceUSD: Math.round(crc / 515)
                        } : null);
                      }}
                      className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 pl-7 pr-3 text-xs font-bold text-zinc-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
                    Precio Anterior (Descuento ₡)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-zinc-500">₡</span>
                    <input
                      type="number"
                      value={editingProduct.originalPriceCRC || 0}
                      onChange={(e) => setEditingProduct(prev => prev ? { ...prev, originalPriceCRC: Number(e.target.value) || 0 } : null)}
                      placeholder="Opcional"
                      className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 pl-7 pr-3 text-xs font-bold text-zinc-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Multi-Image Gallery */}
              <div className="p-4 bg-zinc-50 rounded-2xl border-2 border-zinc-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase text-zinc-800 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Galería de Imágenes &amp; Foto Principal
                  </label>
                  <span className="text-[11px] text-zinc-500">
                    Haz clic en una imagen para hacerla portada
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="URL de la imagen (ej: /images/sneaker.webp o https://...)"
                    className="flex-1 bg-white border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-1.5 px-3 text-xs font-bold text-zinc-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="py-1.5 px-4 rounded-xl bg-zinc-950 text-white font-bold text-xs uppercase"
                  >
                    Agregar Foto
                  </button>
                </div>

                {/* Images Preview list */}
                <div className="flex flex-wrap gap-3">
                  {(editingProduct.galleryImages || [editingProduct.image]).map((imgUrl, idx) => {
                    const isCover = editingProduct.image === imgUrl;
                    return (
                      <div 
                        key={idx} 
                        className={`relative w-20 h-20 rounded-xl border-2 overflow-hidden bg-white cursor-pointer group ${
                          isCover ? 'border-zinc-950 ring-2 ring-zinc-950/20' : 'border-zinc-200'
                        }`}
                        onClick={() => handleSetCoverImage(imgUrl)}
                      >
                        <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                        {isCover && (
                          <span className="absolute bottom-0 inset-x-0 bg-zinc-950 text-white text-[8px] font-black uppercase text-center py-0.5">
                            Portada
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(idx);
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: Sizes and Size Presets */}
              <div className="p-4 bg-zinc-50 rounded-2xl border-2 border-zinc-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-black uppercase text-zinc-800">
                      Tallas Disponibles &amp; Stock por Talla
                    </label>
                    <p className="text-[11px] text-zinc-500">
                      Selecciona las tallas activas o usa una plantilla rápida (Ropa o Calzado numérico):
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplySizePreset('clothing')}
                      className="px-2.5 py-1 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold text-[11px]"
                    >
                      👕 Ropa (S-2XL)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplySizePreset('shoes')}
                      className="px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold text-[11px]"
                    >
                      👟 Calzado (36-45)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplySizePreset('accessory')}
                      className="px-2.5 py-1 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold text-[11px]"
                    >
                      🧢 Gorras
                    </button>
                  </div>
                </div>

                {/* Active Sizes Buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[...CLOTHING_SIZES_PRESET, ...SHOE_SIZES_PRESET, 'Ajustable (Snapback)'].map(sz => {
                    const isSelected = editingProduct.sizes.includes(sz);
                    return (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => handleToggleSize(sz)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                          isSelected 
                            ? 'bg-zinc-950 text-white shadow-xs' 
                            : 'bg-white border border-zinc-300 text-zinc-700 hover:border-zinc-950'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Size Addition */}
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-200">
                  <input
                    type="text"
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    placeholder="Otra talla personalizada (ej: 46, US 11.5, Única)..."
                    className="flex-1 bg-white border border-zinc-300 focus:border-zinc-950 rounded-xl py-1.5 px-3 text-xs font-bold text-zinc-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSize}
                    className="py-1.5 px-3 rounded-xl bg-zinc-800 text-white font-bold text-xs uppercase"
                  >
                    + Agregar
                  </button>
                </div>
              </div>

              {/* Row 5: Description & Features */}
              <div>
                <label className="block text-xs font-black uppercase text-zinc-700 mb-1">
                  Descripción Detallada
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl p-3 text-xs text-zinc-900 focus:outline-none"
                />
              </div>

              {/* Switches */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-zinc-50 rounded-2xl border-2 border-zinc-200">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.inStock}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, inStock: e.target.checked } : null)}
                    className="w-4 h-4 rounded text-zinc-950"
                  />
                  <span>Producto Activo / En Stock</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isFeatured}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, isFeatured: e.target.checked } : null)}
                    className="w-4 h-4 rounded text-zinc-950"
                  />
                  <span>⭐ Destacado en Inicio</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isViral}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, isViral: e.target.checked } : null)}
                    className="w-4 h-4 rounded text-zinc-950"
                  />
                  <span>🔥 Viral TikTok</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isNew}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, isNew: e.target.checked } : null)}
                    className="w-4 h-4 rounded text-zinc-950"
                  />
                  <span>✨ Nuevo Lanzamiento</span>
                </label>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="py-2.5 px-5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs uppercase"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2.5 px-6 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{isSaving ? 'Guardando...' : 'Guardar Producto'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Product Deletion / Trash Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!productToDelete}
        title="Mover a la Papelera"
        message="¿Deseas enviar esta prenda a la Papelera? Se ocultará del catálogo y de la tienda para los clientes, pero podrás restablecerla y volverla a poner en venta cuando tengas disponibilidad desde la pestaña Papelera."
        itemName={productToDelete ? `${productToDelete.name} (${productToDelete.brand}) — ₡${(productToDelete.priceCRC || 0).toLocaleString()}` : undefined}
        confirmButtonText="Mover a la Papelera"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setProductToDelete(null)}
      />

    </div>
  );
};
