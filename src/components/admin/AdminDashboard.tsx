import React from 'react';
import { 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  Truck, 
  ArrowUpRight,
  TrendingUp,
  Plus,
  FileSpreadsheet
} from 'lucide-react';
import { Product, Order, Category } from '../../types';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  categories: Category[];
  onNavigateTab: (tab: any) => void;
  onNewProduct: () => void;
  onExportInventory: () => void;
  onExportOrders: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  categories,
  onNavigateTab,
  onNewProduct,
  onExportInventory,
  onExportOrders
}) => {
  // Product calculations
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.inStock && (p.stockCount === undefined || p.stockCount > 0)).length;
  const outOfStockProducts = products.filter(p => !p.inStock || p.stockCount === 0).length;
  const lowStockProducts = products.filter(p => p.inStock && p.stockCount !== undefined && p.stockCount > 0 && p.stockCount <= 3).length;

  const totalInventoryUnits = products.reduce((sum, p) => sum + (p.stockCount || 0), 0);
  const totalInventoryValueCRC = products.reduce((sum, p) => sum + (p.priceCRC * (p.stockCount || 0)), 0);

  // Orders & Sales calculations
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pendiente').length;
  const confirmedOrders = orders.filter(o => o.status === 'Confirmado' || o.status === 'Preparando').length;
  const shippedOrders = orders.filter(o => o.status === 'Enviado').length;
  const completedOrders = orders.filter(o => o.status === 'Completado').length;

  const totalRevenueCRC = orders
    .filter(o => o.status !== 'Cancelado')
    .reduce((sum, o) => sum + o.totalCRC, 0);

  const activeCategoriesCount = categories.filter(c => c.isActive).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Welcome & Quick Actions Bar */}
      <div className="bg-zinc-950 text-white p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-zinc-800 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Panel de Control Central
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight font-heading">
            Resumen General de Leslie Store
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Monitorea el inventario por tallas, gestiona pedidos con comprobante SINPE y administra los drops de la tienda en tiempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onNewProduct}
            className="py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 text-zinc-950" />
            <span>Nuevo Producto</span>
          </button>
          <button
            onClick={onExportOrders}
            className="py-2.5 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase flex items-center gap-2 border border-zinc-700 transition-all cursor-pointer"
            title="Descargar pedidos en Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Excel Pedidos</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Products */}
        <div 
          onClick={() => onNavigateTab('products')}
          className="bg-white p-5 rounded-2xl border-2 border-zinc-200 hover:border-zinc-950 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-zinc-500 tracking-wider">Total Productos</span>
            <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 group-hover:bg-zinc-950 group-hover:text-white transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-950 font-heading">{totalProducts}</span>
            <span className="text-[11px] font-bold text-emerald-600">
              {activeProducts} activos
            </span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>{totalInventoryUnits} unidades totales</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-950" />
          </div>
        </div>

        {/* Total Sales / Revenue */}
        <div 
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-5 rounded-2xl border-2 border-zinc-200 hover:border-zinc-950 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-zinc-500 tracking-wider">Ventas Acumuladas</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-zinc-950 font-heading">
              ₡{(totalRevenueCRC || 0).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>{totalOrders} pedidos registrados</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-950" />
          </div>
        </div>

        {/* Pending Orders */}
        <div 
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-5 rounded-2xl border-2 border-zinc-200 hover:border-amber-500 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-zinc-500 tracking-wider">Por Procesar</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 font-heading">
              {pendingOrders + confirmedOrders}
            </span>
            <span className="text-[11px] font-bold text-zinc-600">
              ({pendingOrders} pendientes)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>{shippedOrders} en camino a cliente</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-600" />
          </div>
        </div>

        {/* Stock Status */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-white p-5 rounded-2xl border-2 border-zinc-200 hover:border-red-500 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-zinc-500 tracking-wider">Estado de Stock</span>
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-red-800 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-red-600 font-heading">
              {outOfStockProducts}
            </span>
            <span className="text-[11px] font-bold text-red-700">
              agotados
            </span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>{lowStockProducts} con stock bajo (≤3)</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-600" />
          </div>
        </div>

      </div>

      {/* Secondary Metrics & Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Inventory Value & Categories */}
        <div className="bg-zinc-50 border-2 border-zinc-200 p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950 flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-700" />
              Categorías &amp; Valor
            </h3>
            <button
              onClick={() => onNavigateTab('categories')}
              className="text-[11px] font-bold text-zinc-600 hover:text-zinc-950 underline"
            >
              Gestionar ({activeCategoriesCount})
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-2">
            <div className="text-xs text-zinc-500 font-bold uppercase">Valor Estimado en Tienda</div>
            <div className="text-2xl font-black text-zinc-950 font-heading">
              ₡{(totalInventoryValueCRC || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-zinc-600">
              Calculado sobre {totalInventoryUnits} prendas registradas en stock.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-zinc-700 uppercase">Categorías Populares:</div>
            <div className="flex flex-wrap gap-1.5">
              {categories.slice(0, 6).map(cat => (
                <span
                  key={cat.id}
                  className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-xs font-bold text-zinc-800 flex items-center gap-1.5 shadow-2xs"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Status Pipeline */}
        <div className="lg:col-span-2 bg-white border-2 border-zinc-200 p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-zinc-700" />
              Estado de Pedidos
            </h3>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-[11px] font-bold text-zinc-600 hover:text-zinc-950 underline"
            >
              Ver todos los pedidos ({orders.length})
            </button>
          </div>

          {/* Status Pipeline Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <div className="text-[11px] font-black uppercase text-amber-800">Pendientes</div>
              <div className="text-xl font-black text-amber-900 mt-1">{pendingOrders}</div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
              <div className="text-[11px] font-black uppercase text-blue-800">Confirmados</div>
              <div className="text-xl font-black text-blue-900 mt-1">{confirmedOrders}</div>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
              <div className="text-[11px] font-black uppercase text-purple-800">Preparando</div>
              <div className="text-xl font-black text-purple-900 mt-1">
                {orders.filter(o => o.status === 'Preparando').length}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
              <div className="text-[11px] font-black uppercase text-sky-800">Enviados</div>
              <div className="text-xl font-black text-sky-900 mt-1">{shippedOrders}</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 col-span-2 sm:col-span-1">
              <div className="text-[11px] font-black uppercase text-emerald-800">Completados</div>
              <div className="text-xl font-black text-emerald-900 mt-1">{completedOrders}</div>
            </div>
          </div>

          {/* Recent Orders Mini Table */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-zinc-700 uppercase">Últimos Pedidos Recibidos:</div>
            <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-2xl overflow-hidden bg-zinc-50/50">
              {orders.slice(0, 3).map(order => (
                <div key={order.id} className="p-3 flex items-center justify-between text-xs hover:bg-white transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-zinc-950 bg-white px-2 py-0.5 rounded-md border border-zinc-200">
                      #{order.id}
                    </span>
                    <div>
                      <div className="font-bold text-zinc-900">{order.customerName}</div>
                      <div className="text-[11px] text-zinc-500">{order.items.length} prenda(s) • {order.province}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-zinc-950">₡{(order.totalCRC || 0).toLocaleString()}</div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      order.status === 'Pendiente' ? 'bg-amber-100 text-amber-900' :
                      order.status === 'Confirmado' ? 'bg-blue-100 text-blue-900' :
                      order.status === 'Enviado' ? 'bg-sky-100 text-sky-900' :
                      order.status === 'Completado' ? 'bg-emerald-100 text-emerald-900' :
                      'bg-zinc-200 text-zinc-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
