import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  Receipt, 
  AlertTriangle, 
  BarChart3, 
  Radio, 
  ScrollText, 
  LogOut,
  Sun,
  Sprout,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isEmerald } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Verification Queue', path: '/admin/verification', icon: UserCheck },
    { name: 'User Accounts', path: '/admin/users', icon: Users },
    { name: 'Transactions', path: '/admin/transactions', icon: Receipt },
    { name: 'Disputes & Refunds', path: '/admin/disputes', icon: AlertTriangle },
    { name: 'Regional Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Broadcast Alerts', path: '/admin/broadcast', icon: Radio },
    { name: 'Audit Trail', path: '/admin/logs', icon: ScrollText },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white leading-tight">AgriConnect</div>
                <div className="text-[11px] font-semibold text-brand-400">Admin Control Center</div>
              </div>
            </Link>
          </div>

          <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Platform Management
          </div>

          {/* Navigation */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 font-bold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Theme & Signout */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          {/* Dual Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all ${
              isEmerald 
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
                : 'bg-amber-950/40 border-amber-800 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {isEmerald ? <Sprout className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span>{isEmerald ? 'Emerald Harvest' : 'Golden Sunset'}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Theme</span>
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-brand-600">
              ← Main Storefront
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-bold text-slate-800">
              Platform Audit & Governance
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
            >
              {isEmerald ? <Sprout className="w-3.5 h-3.5 text-emerald-600" /> : <Sun className="w-3.5 h-3.5 text-amber-600" />}
              <span className="hidden sm:inline">{isEmerald ? 'Emerald' : 'Amber'}</span>
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-700">{user?.full_name}</span>
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 overflow-y-auto flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
