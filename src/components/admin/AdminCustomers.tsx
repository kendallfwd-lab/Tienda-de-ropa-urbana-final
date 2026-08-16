import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  FileSpreadsheet, 
  MessageCircle, 
  DollarSign, 
  ShoppingBag, 
  MapPin,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { Customer, Order } from '../../types';
import { extractCustomersFromOrders, exportCustomersToExcel, downloadCSV } from '../../lib/storeService';

interface AdminCustomersProps {
  orders: Order[];
  onShowToast: (msg: string) => void;
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({
  orders,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const customers = extractCustomersFromOrders(orders);

  const filteredCustomers = customers.filter(c => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.province && c.province.toLowerCase().includes(q)) ||
        (c.canton && c.canton.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalSpentAll = customers.reduce((acc, c) => acc + c.totalSpentCRC, 0);

  const handleExportExcel = () => {
    const csvData = exportCustomersToExcel(customers);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(csvData, `clientes_leslie_store_${dateStr}.csv`);
    onShowToast('✓ Lista de clientes descargada para Excel con éxito');
  };

  const handleDirectWhatsApp = (customer: Customer) => {
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const msg = `🐺 *HOLA ${customer.name.toUpperCase()} - LESLIE STORE*\n\n¡Esperamos que estés teniendo un excelente día! Te saludamos desde Leslie Store. Tenemos nuevos drops y promociones que te pueden interesar.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
        <div>
          <h3 className="text-sm font-black uppercase text-zinc-950 flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-700" />
            Directorio y Fidelización de Clientes
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Información consolidada de compradores, historial de compras y contacto directo por WhatsApp.
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Descargar Clientes en Excel</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border-2 border-zinc-200 rounded-2xl">
          <div className="text-xs font-bold uppercase text-zinc-500">Total Clientes Únicos</div>
          <div className="text-2xl font-black text-zinc-950 mt-1">{customers.length} clientes</div>
        </div>
        <div className="p-4 bg-white border-2 border-zinc-200 rounded-2xl">
          <div className="text-xs font-bold uppercase text-zinc-500">Ticket Promedio</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            ₡{customers.length > 0 ? Math.round((totalSpentAll || 0) / customers.length).toLocaleString() : '0'}
          </div>
        </div>
        <div className="p-4 bg-white border-2 border-zinc-200 rounded-2xl">
          <div className="text-xs font-bold uppercase text-zinc-500">Ventas Totales de Clientes</div>
          <div className="text-2xl font-black text-zinc-950 mt-1">₡{(totalSpentAll || 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar cliente por nombre, WhatsApp, email o cantón..."
          className="w-full bg-white border-2 border-zinc-200 focus:border-zinc-950 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-zinc-900 focus:outline-none"
        />
      </div>

      {/* Customers Table / Cards */}
      <div className="bg-white border-2 border-zinc-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-white font-black uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Cliente</th>
                <th className="p-3.5">Contacto</th>
                <th className="p-3.5">Ubicación</th>
                <th className="p-3.5 text-center">Pedidos</th>
                <th className="p-3.5 text-right">Total Comprado</th>
                <th className="p-3.5">Última Compra</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-400">
                    No se encontraron clientes con ese criterio de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-3.5 font-bold text-zinc-950">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-zinc-900 text-white font-black flex items-center justify-center text-[10px]">
                          {customer.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span>{customer.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono text-zinc-800">{customer.phone}</div>
                      {customer.email && <div className="text-[11px] text-zinc-400">{customer.email}</div>}
                    </td>
                    <td className="p-3.5 text-zinc-600">
                      {customer.province ? `${customer.province}, ${customer.canton || ''}` : 'No registrada'}
                    </td>
                    <td className="p-3.5 text-center font-bold text-zinc-900">
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200">
                        {customer.ordersCount}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-black text-zinc-950 font-heading">
                      ₡{(customer.totalSpentCRC || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-zinc-500 text-[11px]">
                      {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('es-CR') : '-'}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleDirectWhatsApp(customer)}
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs inline-flex items-center gap-1 font-bold text-[11px]"
                        title="Escribir por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
