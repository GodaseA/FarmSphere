import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  ShoppingBag, 
  Package, 
  Receipt, 
  Sparkles, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { adminAPI } from '../../api/endpoints';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await adminAPI.getDashboard();
        setStats(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Administrator Platform Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time governance, verification backlog, market volume, and system metrics
          </p>
        </div>

        {stats?.pending_farmers > 0 && (
          <Link
            to="/admin/verification"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all self-start animate-bounce"
          >
            <UserCheck className="w-4 h-4" />
            <span>{stats.pending_farmers} Farmer(s) Awaiting Verification</span>
          </Link>
        )}
      </div>

      {/* KPI Stats Grid (FR-19) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Platform GMV</span>
            <Receipt className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{stats?.total_revenue?.toLocaleString() || '0'}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">Processed volume</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Registered Farmers</span>
            <Users className="w-5 h-5 text-brand-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.total_farmers || 0}
          </div>
          <div className="text-[11px] text-amber-700 font-medium">
            {stats?.pending_farmers || 0} in verification queue
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Customers</span>
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.total_customers || 0}
          </div>
          <div className="text-[11px] text-slate-500">Active retail accounts</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Produce</span>
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.active_listings || 0}
          </div>
          <div className="text-[11px] text-slate-500">Live marketplace listings</div>
        </div>

      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Total Orders Placed</div>
            <div className="text-xl font-black text-slate-900 mt-1">{stats?.total_orders || 0} Orders</div>
          </div>
          <ShoppingBag className="w-8 h-8 text-slate-200" />
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Plant AI Inferences</div>
            <div className="text-xl font-black text-slate-900 mt-1">{stats?.total_predictions || 0} Scans</div>
          </div>
          <Sparkles className="w-8 h-8 text-slate-200" />
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-400">Open Disputes</div>
            <div className="text-xl font-black text-rose-600 mt-1">{stats?.open_disputes || 0} Cases</div>
          </div>
          <AlertTriangle className="w-8 h-8 text-rose-200" />
        </div>

      </div>

      {/* Control Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <Link
          to="/admin/verification"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-500 shadow-2xs transition-all space-y-2 group"
        >
          <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>Farmer Verification Queue</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-slate-500">Inspect farmer land documents, ID proofs, and approve credentials.</p>
        </Link>

        <Link
          to="/admin/users"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-500 shadow-2xs transition-all space-y-2 group"
        >
          <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>Account Management</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-slate-500">Search, monitor, block or unblock user profiles and investigate history.</p>
        </Link>

        <Link
          to="/admin/analytics"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-500 shadow-2xs transition-all space-y-2 group"
        >
          <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>Regional Analytics</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-slate-500">Explore crop demand trends, disease hotspots by district, and sales maps.</p>
        </Link>
      </div>

    </div>
  );
}
