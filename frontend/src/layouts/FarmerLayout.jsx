import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sprout, 
  Sparkles, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  Star, 
  LogOut,
  Sun,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function FarmerLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isEmerald } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const farmerProfile = user?.farmer_profile;
  const isApproved = farmerProfile?.verification_status === 'approved';

  const navItems = [
    { name: 'Dashboard', path: '/farmer', icon: LayoutDashboard },
    { name: 'Crop Yields', path: '/farmer/yields', icon: Sprout },
    { name: 'Disease AI Scanner', path: '/farmer/disease', icon: Sparkles },
    { name: 'Produce Listings', path: '/farmer/listings', icon: Package },
    { name: 'Incoming Orders', path: '/farmer/orders', icon: ShoppingBag },
    { name: 'Mandi Price Forecast', path: '/farmer/prices', icon: TrendingUp },
    { name: 'Customer Reviews', path: '/farmer/reviews', icon: Star },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 leading-tight">AgriConnect</div>
                <div className="text-[11px] font-medium text-brand-600">Farmer Console</div>
              </div>
            </Link>
          </div>

          {/* Farmer Status Badge */}
          <div className="p-4 mx-3 my-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-800 truncate">{farmerProfile?.farm_name || user?.full_name}</span>
              {isApproved ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  <AlertCircle className="w-3 h-3" /> Pending
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500">
              {farmerProfile?.district}, {farmerProfile?.state}
            </div>
          </div>

          {/* Nav Items */}
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
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
        <div className="p-4 border-t border-slate-100 space-y-2">
          {/* Dual Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all ${
              isEmerald 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {isEmerald ? <Sprout className="w-4 h-4 text-emerald-600" /> : <Sun className="w-4 h-4 text-amber-600" />}
              <span>{isEmerald ? 'Emerald Harvest' : 'Golden Sunset'}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Theme</span>
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-brand-600">
              ← Back to Marketplace
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-bold text-slate-800">
              Farmer Workspace
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
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold">
                {user?.full_name?.charAt(0) || 'F'}
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
