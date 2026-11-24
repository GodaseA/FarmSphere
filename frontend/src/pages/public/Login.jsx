import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Lock, User, AlertCircle, ArrowRight, Tractor, ShieldAlert, ShoppingBag, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, quickDemoLogin, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(username, password);
    if (res.success) {
      if (res.user.role === 'admin') navigate('/admin');
      else if (res.user.role === 'farmer') navigate('/farmer');
      else navigate('/browse');
    } else {
      setError(res.error);
    }
  };

  const handleDemo = async (roleType) => {
    setError('');
    const res = await quickDemoLogin(roleType);
    if (res.success) {
      if (roleType === 'admin') navigate('/admin');
      else if (roleType === 'farmer' || roleType === 'farmer_pending') navigate('/farmer');
      else navigate('/browse');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/20">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In to AgriConnect
          </h2>
          <p className="text-xs text-slate-500">
            Direct farmer commerce, plant health AI & transparent market
          </p>
        </div>

        {/* Demo Roles Quick Pick */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
            ⚡ One-Click Demo Logins
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemo('farmer')}
              className="p-2 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-slate-700 font-semibold text-left transition-colors flex items-center gap-2 shadow-2xs"
            >
              <Tractor className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-[11px]">Farmer (Active)</div>
                <div className="text-[10px] text-slate-400">Rameshwar</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemo('farmer_pending')}
              className="p-2 rounded-xl border border-amber-200 bg-white hover:bg-amber-50 text-slate-700 font-semibold text-left transition-colors flex items-center gap-2 shadow-2xs"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <div className="font-bold text-[11px]">Farmer (Pending)</div>
                <div className="text-[10px] text-slate-400">Suresh Yadav</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemo('customer')}
              className="p-2 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-slate-700 font-semibold text-left transition-colors flex items-center gap-2 shadow-2xs"
            >
              <ShoppingBag className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <div className="font-bold text-[11px]">Customer</div>
                <div className="text-[10px] text-slate-400">Priya Sharma</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemo('admin')}
              className="p-2 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-slate-700 font-semibold text-left transition-colors flex items-center gap-2 shadow-2xs"
            >
              <LayoutDashboard className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <div className="font-bold text-[11px]">Admin Staff</div>
                <div className="text-[10px] text-slate-400">Full Audits</div>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Email or Phone Number</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="farmer1@agriconnect.test"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In with Password'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:underline">
            Register as Farmer or Customer
          </Link>
        </div>

      </div>
    </div>
  );
}
