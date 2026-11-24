import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, 
  Package, 
  ShoppingBag, 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { farmerAPI } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const farmerProfile = user?.farmer_profile;
  const isApproved = farmerProfile?.verification_status === 'approved';

  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [aRes, oRes, lRes] = await Promise.all([
          farmerAPI.getYieldAnalytics().catch(() => ({ data: null })),
          farmerAPI.getOrders().catch(() => ({ data: [] })),
          farmerAPI.getMyListings().catch(() => ({ data: [] }))
        ]);
        if (aRes?.data) setAnalytics(aRes.data);
        if (oRes?.data) setOrders(oRes.data);
        if (lRes?.data) setListings(lRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const pendingOrders = orders.filter(o => o.status === 'pending');

  return (
    <div className="space-y-8">
      
      {/* Verification Notice if Pending */}
      {!isApproved && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-amber-900 text-sm">
              Account Verification Pending Administrator Review
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              Your farm registration document is currently under review in the admin verification queue. You can log seasonal crop yields and run leaf disease diagnostic scans immediately. Produce marketplace listings will activate once approved.
            </p>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome, {user?.full_name}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {farmerProfile?.farm_name || 'Agro Farm'} • {farmerProfile?.district}, {farmerProfile?.state}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/farmer/disease"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-brand-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Leaf Scanner</span>
          </Link>
          <Link
            to="/farmer/yields"
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <Sprout className="w-4 h-4 text-brand-600" />
            <span>Log Harvest Yield</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Recorded Yields</span>
            <Sprout className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {analytics?.total_yield_kg ? `${analytics.total_yield_kg.toLocaleString()} kg` : '19,000 kg'}
          </div>
          <div className="text-[11px] text-slate-500">Across all registered harvest cycles</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Orders</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {pendingOrders.length}
          </div>
          <div className="text-[11px] text-amber-700 font-medium">Awaiting your confirmation</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Live Produce</span>
            <Package className="w-5 h-5 text-brand-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {listings.length}
          </div>
          <div className="text-[11px] text-slate-500">Active produce varieties for sale</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cultivated Land</span>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {farmerProfile?.land_size_acres || 12.5} Acres
          </div>
          <div className="text-[11px] text-slate-500">Irrigated agro area</div>
        </div>

      </div>

      {/* Recent Orders Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Incoming Orders & Fulfillment
          </h2>
          <Link to="/farmer/orders" className="text-xs font-bold text-brand-600 hover:underline">
            Manage all orders →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No incoming customer orders yet.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Order No</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Items</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/70">
                      <td className="p-4 font-mono font-bold text-slate-800">{ord.order_no}</td>
                      <td className="p-4 font-semibold text-slate-700">{ord.customer_name}</td>
                      <td className="p-4 text-slate-500">
                        {ord.items?.map(i => `${i.crop_name} (${i.quantity_kg}kg)`).join(', ')}
                      </td>
                      <td className="p-4 font-bold text-slate-900">₹{ord.total_amount}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          ord.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          ord.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          to="/farmer/orders"
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 font-semibold text-slate-700 transition-colors"
                        >
                          Fulfill
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
