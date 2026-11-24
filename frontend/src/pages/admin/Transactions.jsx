import React, { useState, useEffect } from 'react';
import { Receipt, Filter, Calendar, User, ShoppingBag } from 'lucide-react';
import { adminAPI } from '../../api/endpoints';

export default function Transactions() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await adminAPI.getTransactions({ status: statusFilter || undefined });
        setOrders(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [statusFilter]);

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-brand-600" />
            Platform Financial Transactions & Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete farmer-customer audit ledger with payment verification and status history (FR-22)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All Transactions</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Ledger Records</h3>
          <span className="text-xs text-slate-500 font-semibold">{orders.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Farmer</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/70">
                  <td className="p-4 font-mono font-bold text-slate-800">{o.order_no}</td>
                  <td className="p-4 font-semibold text-slate-700">{o.customer_name}</td>
                  <td className="p-4 font-semibold text-slate-700">{o.farmer_name}</td>
                  <td className="p-4 font-bold text-slate-900">₹{o.total_amount}</td>
                  <td className="p-4">
                    <span className="capitalize font-semibold text-slate-700">{o.payment_method}</span>{' '}
                    <span className="text-[10px] text-emerald-600 font-bold">({o.payment_status})</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                      o.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      o.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">
                    {new Date(o.placed_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
