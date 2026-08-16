import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Save, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Product, Category } from '../../types';
import { updateProductSizeInventory, saveProduct, exportInventoryToExcel, downloadCSV } from '../../lib/storeService';

interface AdminInventoryProps {
  products: Product[];
  categories: Category[];
  onProductsUpdated: (products: Product[]) => void;
  onShowToast: (msg: string) => void;
}

export const AdminInventory: React.FC<AdminInventoryProps> = ({
  products,
  categories,
  onProductsUpdated,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (stockFilter === 'out' && (p.inStock && (p.stockCount === undefined || p.stockCount > 0))) return false;
    if (stockFilter === 'low' && (!p.inStock || p.stockCount === undefined || p.stockCount > 3 || p.stockCount === 0)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    }
    return true;
  });

  const handleStockChange = async (product: Product, size: string, newCount: number) => {
    const safeCount = Math.max(0, newCount);
    setIsUpdating(`${product.id}-${size}`);

    try {
      const updated = await updateProductSizeInventory(product.id, size, safeCount);
      if (updated) {
        const nextProducts = products.map(p => p.id === updated.id ? updated : p);
        onProductsUpdated(nextProducts);
        onShowToast(`Stock de ${product.name} (Talla ${size}) actualizado a ${safeCount}`);
      }
    } catch (err: any) {
      alert('Error al actualizar stock: ' + err.message);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleExportExcel = () => {
    const csvData = exportInventoryToExcel(products);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(csvData, `inventario_leslie_store_${dateStr}.csv`);
    onShowToast('✓ Inventario descargado para Excel con éxito');
  };

  const totalUnits = products.reduce((acc, p) => acc + (p.stockCount || 0), 0);
  const totalValue = products.reduce((acc, p) => acc + (p.priceCRC * (p.stockCount || 0)), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
        <div>
          <h3 className="text-sm font-black uppercase text-zinc-950 flex items-center gap-2">
            <Package className="w-4 h-4 text-zinc-700" />
            Control Detallado de Inventario por Talla
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Ajusta las existencias de ropa y calzado en tiempo real. Cuando una talla llega a 0 se alerta automáticamente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Descargar en Excel</span>
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white border-2 border-zinc-200 rounded-xl">
          <div className="text-[11px] font-bold uppercase text-zinc-500">Unidades en Tienda</div>
          <div className="text-xl font-black text-zinc-950 mt-1">{totalUnits} prendas/pares</div>
        </div>
        <div className="p-3.5 bg-white border-2 border-zinc-200 rounded-xl">
          <div className="text-[11px] font-bold uppercase text-zinc-500">Valor de Inventario</div>
          <div className="text-xl font-black text-zinc-950 mt-1">₡{(totalValue || 0).toLocaleString()}</div>
        </div>
        <div className="p-3.5 bg-white border-2 border-zinc-200 rounded-xl">
          <div className="text-[11px] font-bold uppercase text-zinc-500">Modelos con Stock Bajo</div>
          <div className="text-xl font-black text-amber-600 mt-1">
            {products.filter(p => p.inStock && (p.stockCount || 0) <= 3 && (p.stockCount || 0) > 0).length}
          </div>
        </div>
        <div className="p-3.5 bg-white border-2 border-zinc-200 rounded-xl">
          <div className="text-[11px] font-bold uppercase text-zinc-500">Modelos Agotados</div>
          <div className="text-xl font-black text-red-600 mt-1">
            {products.filter(p => !p.inStock || (p.stockCount || 0) === 0).length}
          </div>
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
            placeholder="Buscar por nombre, marca o ID..."
            className="w-full bg-white border-2 border-zinc-200 focus:border-zinc-950 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-zinc-900 focus:outline-none"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white border-2 border-zinc-200 focus:border-zinc-950 rounded-xl py-2 px-3 text-xs font-bold text-zinc-900 focus:outline-none"
        >
          <option value="all">Todas las Categorías</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>

        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              stockFilter === 'all' ? 'bg-white text-zinc-950 shadow-2xs' : 'text-zinc-600'
            }`}
          >
            Todos ({products.length})
          </button>
          <button
            onClick={() => setStockFilter('low')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              stockFilter === 'low' ? 'bg-amber-500 text-white shadow-2xs' : 'text-zinc-600'
            }`}
          >
            Bajo Stock
          </button>
          <button
            onClick={() => setStockFilter('out')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              stockFilter === 'out' ? 'bg-red-600 text-white shadow-2xs' : 'text-zinc-600'
            }`}
          >
            Agotados
          </button>
        </div>
      </div>

      {/* Inventory List */}
      <div className="space-y-3">
        {filteredProducts.map(product => {
          const totalProductStock = product.stockCount || 0;
          const isShoe = product.category === 'calzado' || product.sizes.some(s => !isNaN(Number(s)));
          const sizes = product.sizes.length > 0 ? product.sizes : ['Única'];

          return (
            <div 
              key={product.id}
              className="p-4 rounded-2xl bg-white border-2 border-zinc-200 hover:border-zinc-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={product.image || '/placeholder.png'}
                    alt={product.name}
                    className="w-14 h-14 rounded-xl object-cover border border-zinc-200 shrink-0 bg-zinc-100"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {product.brand}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        #{product.id}
                      </span>
                      {isShoe && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-900">
                          👟 Calzado Numérico
                        </span>
                      )}
                    </div>
                    <h4 className="font-black text-sm text-zinc-950 mt-0.5">{product.name}</h4>
                    <div className="text-xs font-bold text-zinc-600">
                      ₡{(product.priceCRC || 0).toLocaleString()} • Total: <strong className={totalProductStock === 0 ? 'text-red-600' : 'text-zinc-950'}>{totalProductStock} unidades</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    totalProductStock === 0 ? 'bg-red-100 text-red-900 border border-red-200' :
                    totalProductStock <= 3 ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                    'bg-emerald-100 text-emerald-900 border border-emerald-200'
                  }`}>
                    {totalProductStock === 0 ? 'Agotado' : totalProductStock <= 3 ? 'Stock Bajo' : 'En Stock'}
                  </span>
                </div>
              </div>

              {/* Granular Size Inventory Steppers */}
              <div className="pt-3 border-t border-zinc-100">
                <div className="text-[11px] font-black uppercase text-zinc-500 mb-2">
                  Existencias por Talla / Medida:
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {sizes.map(size => {
                    const currentQty = product.sizeInventory && product.sizeInventory[size] !== undefined
                      ? product.sizeInventory[size]
                      : Math.round(totalProductStock / sizes.length);
                    const isBusy = isUpdating === `${product.id}-${size}`;

                    return (
                      <div 
                        key={size}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                          currentQty === 0 ? 'bg-red-50/70 border-red-200' : 
                          currentQty <= 2 ? 'bg-amber-50/70 border-amber-200' : 
                          'bg-zinc-50 border-zinc-200'
                        }`}
                      >
                        <div className="font-black text-xs text-zinc-900 uppercase">
                          Talla {size}
                        </div>

                        <div className="my-1.5 flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            disabled={currentQty <= 0 || isBusy}
                            onClick={() => handleStockChange(product, size, currentQty - 1)}
                            className="w-6 h-6 rounded-md bg-white border border-zinc-300 hover:border-zinc-950 flex items-center justify-center text-zinc-800 disabled:opacity-40"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={currentQty}
                            onChange={(e) => handleStockChange(product, size, parseInt(e.target.value) || 0)}
                            className="w-10 text-center font-black text-xs bg-white border border-zinc-300 focus:border-zinc-950 rounded-md py-0.5 focus:outline-none"
                          />

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleStockChange(product, size, currentQty + 1)}
                            className="w-6 h-6 rounded-md bg-white border border-zinc-300 hover:border-zinc-950 flex items-center justify-center text-zinc-800"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className={`text-[10px] font-bold ${
                          currentQty === 0 ? 'text-red-700' : currentQty <= 2 ? 'text-amber-800' : 'text-zinc-500'
                        }`}>
                          {currentQty === 0 ? 'Agotada' : `${currentQty} un.`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
