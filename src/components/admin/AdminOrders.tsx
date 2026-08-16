import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  MessageCircle, 
  Truck, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { updateOrderStatus, trashOrder, exportOrdersToExcel, downloadCSV } from '../../lib/storeService';
import { STORE_INFO } from '../../data/storeData';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface AdminOrdersProps {
  orders: Order[];
  onOrdersUpdated: (orders: Order[]) => void;
  onShowToast: (msg: string) => void;
}

const ORDER_STATUSES: OrderStatus[] = ['Pendiente', 'Confirmado', 'Preparando', 'Enviado', 'Completado', 'Cancelado'];

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  onOrdersUpdated,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredOrders = orders.filter(order => {
    if (selectedStatus !== 'all' && order.status !== selectedStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.toLowerCase().includes(q);
      const matchId = order.id.toLowerCase().includes(q);
      const matchProv = order.province.toLowerCase().includes(q);
      return matchName || matchPhone || matchId || matchProv;
    }
    return true;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      if (updated) {
        const next = orders.map(o => o.id === orderId ? updated : o);
        onOrdersUpdated(next);
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(updated);
        }
        onShowToast(`✓ Estado del pedido #${orderId} actualizado a "${newStatus}"`);
      }
    } catch (err: any) {
      alert('Error al actualizar estado: ' + err.message);
    }
  };

  const handleSaveTracking = async (order: Order) => {
    try {
      const updated = await updateOrderStatus(order.id, order.status, trackingInput);
      if (updated) {
        const next = orders.map(o => o.id === order.id ? updated : o);
        onOrdersUpdated(next);
        setSelectedOrder(updated);
        onShowToast('✓ Número de guía guardado');
      }
    } catch (err: any) {
      alert('Error al guardar guía: ' + err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      const { updatedOrders } = await trashOrder(orderToDelete.id);
      onOrdersUpdated(updatedOrders);
      if (selectedOrder?.id === orderToDelete.id) setSelectedOrder(null);
      onShowToast(`✓ Pedido #${orderToDelete.id} enviado a la Papelera`);
      setOrderToDelete(null);
    } catch (err: any) {
      onShowToast('Error al enviar pedido a la papelera: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNotifyWhatsApp = (order: Order) => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    let msg = `🐺 *HOLA ${order.customerName.toUpperCase()} - LESLIE STORE*\n\n`;
    msg += `Te escribimos respecto a tu pedido *#${order.id}*:\n`;
    msg += `📌 *Estado Actual:* ${order.status.toUpperCase()}\n\n`;

    if (order.status === 'Confirmado') {
      msg += `✓ Hemos recibido tu pago y comprobante satisfactoriamente. Tu pedido está en cola de empaque.\n`;
    } else if (order.status === 'Preparando') {
      msg += `📦 Tus prendas están siendo empacadas con sus etiquetas originales y stickers de regalo.\n`;
    } else if (order.status === 'Enviado') {
      msg += `🚚 ¡Tu pedido ya va en camino!\n`;
      if (order.trackingNumber) {
        msg += `• Guía de seguimiento: *${order.trackingNumber}*\n`;
      }
    } else if (order.status === 'Completado') {
      msg += `🎉 Tu pedido ha sido entregado exitosamente. ¡Muchas gracias por elegir Leslie Store!\n`;
    }

    msg += `\n💰 *Total:* ₡${(order.totalCRC || 0).toLocaleString()}\n`;
    msg += `¿Tienes alguna duda adicional? ¡Estamos a tu orden!`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const handleExportExcel = () => {
    const csvData = exportOrdersToExcel(orders);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCSV(csvData, `pedidos_leslie_store_${dateStr}.csv`);
    onShowToast('✓ Lista de pedidos descargada para Excel con éxito');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
        <div>
          <h3 className="text-sm font-black uppercase text-zinc-950 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-zinc-700" />
            Control y Gestión de Pedidos
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Administra órdenes recibidas por WhatsApp y web. Actualiza su estado y notifica al cliente con 1 clic.
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Descargar Pedidos en Excel</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, teléfono, # de pedido o cantón..."
            className="w-full bg-white border-2 border-zinc-200 focus:border-zinc-950 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-zinc-900 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-zinc-100 p-1 rounded-xl">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedStatus === 'all' ? 'bg-white text-zinc-950 shadow-2xs' : 'text-zinc-600'
            }`}
          >
            Todos ({orders.length})
          </button>
          {ORDER_STATUSES.map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedStatus === st ? 'bg-zinc-950 text-white shadow-2xs' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {st} ({orders.filter(o => o.status === st).length})
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Orders Cards List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border-2 border-dashed border-zinc-200 text-zinc-500 text-xs">
              No hay pedidos que coincidan con la búsqueda.
            </div>
          ) : (
            filteredOrders.map(order => {
              const isSelected = selectedOrder?.id === order.id;

              return (
                <div
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(order);
                    setTrackingInput(order.trackingNumber || '');
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white ${
                    isSelected ? 'border-zinc-950 shadow-md ring-2 ring-zinc-950/10' : 'border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-zinc-950 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
                          #{order.id}
                        </span>
                        <span className="text-xs text-zinc-400">
                          {new Date(order.createdAt).toLocaleDateString('es-CR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-zinc-950">{order.customerName}</h4>
                      <div className="text-xs text-zinc-500">
                        {order.customerPhone} • {order.province}, {order.canton}
                      </div>
                    </div>

                    <div className="text-right space-y-1.5">
                      <div className="font-black text-sm text-zinc-950 font-heading">
                        ₡{(order.totalCRC || 0).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOrderToDelete(order);
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Eliminar pedido"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <select
                          value={order.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className={`text-[11px] font-black uppercase rounded-lg px-2 py-1 border focus:outline-none cursor-pointer ${
                            order.status === 'Pendiente' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                            order.status === 'Confirmado' ? 'bg-blue-100 text-blue-900 border-blue-300' :
                            order.status === 'Preparando' ? 'bg-purple-100 text-purple-900 border-purple-300' :
                            order.status === 'Enviado' ? 'bg-sky-100 text-sky-900 border-sky-300' :
                            order.status === 'Completado' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                            'bg-red-100 text-red-900 border-red-300'
                          }`}
                        >
                          {ORDER_STATUSES.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-600">
                    <div className="truncate max-w-[80%]">
                      {order.items.map(i => `${i.productName} (Talla ${i.size})`).join(', ')}
                    </div>
                    <span className="font-bold text-zinc-900 shrink-0">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} prenda(s)
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Order Inspector */}
        <div className="space-y-4">
          {selectedOrder ? (
            <div className="bg-white border-2 border-zinc-950 p-5 rounded-3xl space-y-4 shadow-lg sticky top-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div>
                  <span className="text-[10px] font-black uppercase text-zinc-400">Detalle de Orden</span>
                  <h3 className="text-base font-black text-zinc-950">#{selectedOrder.id}</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleNotifyWhatsApp(selectedOrder)}
                    className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                    title="Notificar por WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => setOrderToDelete(selectedOrder)}
                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                    title="Eliminar pedido"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-3 bg-zinc-50 rounded-xl space-y-1 text-xs">
                <div className="font-bold text-zinc-950">{selectedOrder.customerName}</div>
                <div className="text-zinc-600">{selectedOrder.customerPhone}</div>
                {selectedOrder.customerEmail && <div className="text-zinc-500">{selectedOrder.customerEmail}</div>}
                <div className="text-zinc-700 pt-1 font-medium">
                  📍 {selectedOrder.province}, {selectedOrder.canton} — {selectedOrder.exactAddress || 'Retiro en tienda'}
                </div>
                <div className="text-[11px] text-zinc-500 pt-1">
                  Método de pago: <strong className="uppercase">{selectedOrder.paymentMethod}</strong>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="text-xs font-black uppercase text-zinc-700">Prendas Ordenadas:</div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 bg-zinc-50 rounded-lg border border-zinc-200">
                      <div className="flex items-center gap-2">
                        {item.image && (
                          <img src={item.image} alt={item.productName} className="w-8 h-8 rounded object-cover" />
                        )}
                        <div>
                          <div className="font-bold text-zinc-900 line-clamp-1">{item.productName}</div>
                          <div className="text-[11px] text-zinc-500">Talla: {item.size} • Cant: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="font-black text-zinc-950 shrink-0">
                        ₡{((item.priceCRC || 0) * (item.quantity || 1)).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping & Total Breakdown */}
              <div className="p-3 bg-zinc-100 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal prendas:</span>
                  <span>₡{(selectedOrder.subtotalCRC || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Envío ({selectedOrder.shippingType}):</span>
                  <span>₡{(selectedOrder.shippingCostCRC || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-zinc-950 pt-1 border-t border-zinc-200">
                  <span>TOTAL:</span>
                  <span>₡{(selectedOrder.totalCRC || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Tracking Guide Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase text-zinc-700">
                  Guía de Rastreo (Correos de CR / Encomienda)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="Ej: CR-PTAS-893240"
                    className="flex-1 bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-950 rounded-xl px-2.5 py-1.5 text-xs font-bold text-zinc-900 focus:outline-none"
                  />
                  <button
                    onClick={() => handleSaveTracking(selectedOrder)}
                    className="py-1.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase"
                  >
                    Guardar
                  </button>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="text-xs p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <strong>Notas del cliente:</strong> {selectedOrder.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 p-8 rounded-3xl text-center text-zinc-400 text-xs">
              Selecciona un pedido para ver el desglose completo, gestionar su envío o notificar al cliente.
            </div>
          )}
        </div>

      </div>

      {/* Confirmation Modal for Order Deletion */}
      <ConfirmDeleteModal
        isOpen={!!orderToDelete}
        title="Mover Pedido a la Papelera"
        message="¿Deseas mover este pedido a la Papelera? Podrás restablecerlo en cualquier momento o eliminarlo por completo luego."
        itemName={orderToDelete ? `Pedido #${orderToDelete.id} — ${orderToDelete.customerName} (₡${(orderToDelete.totalCRC || 0).toLocaleString()})` : undefined}
        confirmButtonText="Mover a la Papelera"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setOrderToDelete(null)}
      />

    </div>
  );
};
