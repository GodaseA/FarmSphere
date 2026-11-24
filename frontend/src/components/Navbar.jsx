import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  ShoppingBag, 
  User, 
  LogOut, 
  Sun, 
  Sparkles, 
  Languages, 
  ChevronDown, 
  LayoutDashboard,
  ShieldAlert,
  Tractor,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEMES } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, role, logout, quickDemoLogin } = useAuth();
  const { theme, toggleTheme, isEmerald } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleDemoSelect = async (selectedRole) => {
    setDemoMenuOpen(false);
    await quickDemoLogin(selectedRole);
    if (selectedRole === 'admin') navigate('/admin');
    else if (selectedRole === 'farmer') navigate('/farmer');
    else if (selectedRole === 'farmer_pending') navigate('/farmer');
    else navigate('/browse');
  };

  const getDashboardRoute = () => {
    if (role === 'admin') return '/admin';
    if (role === 'farmer') return '/farmer';
    return '/customer/orders';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
              Agri<span className="text-brand-600">Connect</span>
            </span>
            <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-1">
              Farm Direct & AI
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-3 text-sm font-medium text-slate-600">
          <Link to="/" className="px-3 py-1.5 rounded-lg hover:text-brand-600 hover:bg-slate-100 transition-colors">
            {t('home')}
          </Link>
          <Link to="/browse" className="px-3 py-1.5 rounded-lg hover:text-brand-600 hover:bg-slate-100 transition-colors">
            {t('browse')}
          </Link>
          <Link to="/disease" className="px-3 py-1.5 rounded-lg hover:text-brand-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-500" />
            {t('diseaseScanner')}
          </Link>
          <Link to="/prices" className="px-3 py-1.5 rounded-lg hover:text-brand-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Mandi Trends
          </Link>
        </nav>

        {/* Right Tools: Theme Toggle, Language, Cart, Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* DUAL THEME TOGGLE (User Requirement: Give Two Theme) */}
          <button
            onClick={toggleTheme}
            title={`Switch Theme (Current: ${isEmerald ? 'Emerald Harvest' : 'Golden Sunset'})`}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm ${
              isEmerald 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100' 
                : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
            }`}
          >
            {isEmerald ? (
              <>
                <Sprout className="w-4 h-4 text-emerald-600" />
                <span className="hidden xl:inline">Emerald Harvest</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-600" />
                <span className="hidden xl:inline">Golden Sunset</span>
              </>
            )}
          </button>

          {/* Language Selector */}
          <div className="relative group">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="text-xs bg-slate-100 border border-slate-200 text-slate-700 font-medium py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिंदी (HI)</option>
              <option value="mr">मराठी (MR)</option>
            </select>
          </div>

          {/* Cart Icon */}
          <Link 
            to="/cart" 
            className="relative p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white rounded-full text-[11px] font-bold flex items-center justify-center animate-pulse shadow">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Quick Demo Login Switcher */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="px-2.5 py-1.5 text-xs font-semibold bg-brand-50 border border-brand-200 text-brand-700 rounded-lg hover:bg-brand-100 transition-colors flex items-center gap-1"
            >
              <span>Demo Logins</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  One-Click Demo Roles
                </div>
                <button
                  onClick={() => handleDemoSelect('farmer')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Tractor className="w-4 h-4 text-brand-600" />
                  <div>
                    <div className="font-semibold">Farmer (Approved)</div>
                    <div className="text-[10px] text-slate-400">Patil Organic Agro Farms</div>
                  </div>
                </button>
                <button
                  onClick={() => handleDemoSelect('farmer_pending')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-semibold">Farmer (Pending Queue)</div>
                    <div className="text-[10px] text-slate-400">Yadav Kisan (Awaits verify)</div>
                  </div>
                </button>
                <button
                  onClick={() => handleDemoSelect('customer')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-semibold">Customer (Buyer)</div>
                    <div className="text-[10px] text-slate-400">Priya Sharma (Pune)</div>
                  </div>
                </button>
                <button
                  onClick={() => handleDemoSelect('admin')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="font-semibold">Administrator</div>
                    <div className="text-[10px] text-slate-400">Audits, verification & analytics</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* User Account / Auth Buttons */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                <div className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center text-xs">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <span className="max-w-[90px] truncate hidden sm:inline">{user.full_name}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-600">
                  {role}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <Link
                    to={getDashboardRoute()}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-500" />
                    <span>My Portal</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>Profile Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all shadow-brand-500/20"
              >
                {t('register')}
              </Link>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
