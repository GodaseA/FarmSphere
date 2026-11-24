import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  CheckCircle, 
  Truck, 
  CheckCheck, 
  XCircle, 
  Clock, 
  MapPin, 
  User, 
  Filter 
} from 'lucide-react';
import { farmerAPI } from '../../api/endpoints';

export default function FarmerOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await farmerAPI.getOrders({ status: statusFilter || undefined });
      setOrders(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, nextStatus) => {
    try {
      await farmerAPI.updateOrderStatus(orderId, nextStatus);
      loadOrders();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Incoming Orders & Status Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Accept orders, pack items, mark as shipped, and track final customer delivery
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400 space-y-2">
          <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
          <p className="font-bold text-slate-700">No customer orders matching this status filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-5"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-slate-900">
                      {order.order_no}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                      order.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Placed on: {new Date(order.placed_at).toLocaleString()}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-black text-slate-900">₹{order.total_amount}</div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Payment: <strong className="uppercase text-slate-800">{order.payment_method}</strong> ({order.payment_status})
                  </div>
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" /> Buyer Name
                  </div>
                  <p className="text-slate-600">{order.customer_name}</p>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> Delivery Address ({order.fulfilment})
                  </div>
                  <p className="text-slate-600 line-clamp-2">{order.delivery_address || 'Standard Address'}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Line Items
                </span>
                <div className="divide-y divide-slate-100">
                  {order.items.map((it) => (
                    <div key={it.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{it.crop_name}</span>
                        <span className="text-slate-500 ml-2">₹{it.unit_price}/kg × {it.quantity_kg} kg</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">₹{it.line_total}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Action Buttons (Pipeline: pending -> confirmed -> shipped -> delivered) */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400">
                  Update customer delivery state:
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Accept & Confirm
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'rejected')}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject Order
                      </button>
                    </>
                  )}

                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'shipped')}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Truck className="w-3.5 h-3.5" /> Mark Shipped / Dispatched
                    </button>
                  )}

                  {order.status === 'shipped' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'delivered')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Confirm Delivered
                    </button>
                  )}

                  {order.status === 'delivered' && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCheck className="w-4 h-4" /> Successfully Completed & Delivered
                    </span>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
