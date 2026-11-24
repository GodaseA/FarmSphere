import React from 'react';
import { Sprout, ShieldCheck, Cpu, Leaf, Heart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { isEmerald } = useTheme();

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-lg">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span>AgriConnect</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Transparent farm-to-doorstep direct commerce platform with deep learning leaf disease diagnostics and mandi pricing forecasting.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-brand-400 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping"></span>
              Active Theme: {isEmerald ? 'Emerald Harvest' : 'Golden Sunset'}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-2">
              <li><a href="/browse" className="hover:text-white transition-colors">Direct Marketplace</a></li>
              <li><a href="/disease" className="hover:text-white transition-colors">PlantVillage Disease AI</a></li>
              <li><a href="/prices" className="hover:text-white transition-colors">Mandi Price Regressor</a></li>
              <li><a href="/docs" className="hover:text-white transition-colors">Architecture Documentation</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Portals & Roles</h4>
            <ul className="space-y-2">
              <li><a href="/farmer" className="hover:text-white transition-colors">Farmer Yield & Orders Portal</a></li>
              <li><a href="/customer/orders" className="hover:text-white transition-colors">Customer Order History</a></li>
              <li><a href="/admin" className="hover:text-white transition-colors">Administrator Console</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">One-Click Demo Logins</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Architecture Spec</h4>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-brand-400" /> FastAPI + Async SQLAlchemy</li>
              <li className="flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5 text-brand-400" /> MobileNetV2 38-Class Transfer Learning</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-brand-400" /> 16-Table Relational Schema & RBAC</li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© 2026 AgriConnect. Production Grade Full-Stack Academic Project Pack.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Built with React 18, Vite, Tailwind CSS & FastAPI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
