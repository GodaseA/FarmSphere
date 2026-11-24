import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, MapPin, Layers } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { adminAPI } from '../../api/endpoints';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Analytics() {
  const [demand, setDemand] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dRes, hRes, sRes] = await Promise.all([
          adminAPI.getDemandAnalytics(),
          adminAPI.getHotspotsAnalytics(),
          adminAPI.getSalesAnalytics(),
        ]);
        setDemand(dRes.data.crop_demand || []);
        setHotspots(hRes.data.hotspots || []);
        setSales(sRes.data.regional_sales || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-600" />
          Regional Macro Analytics & Disease Epidemiological Hotspots
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Market demand curves, regional sales volumes, and geographic plant pathology distribution (FR-25)
        </p>
      </div>

      {/* Grid 1: Crop Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Aggregate Crop Demand (Purchased kg)
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Live Sales</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demand}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="crop" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total_kg" fill="#10b981" radius={[6, 6, 0, 0]} name="Total kg Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Sales */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Regional Sales Volume by District (₹)
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Revenue</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="district" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Disease Hotspots Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Geographic Leaf Disease Hotspots (Krishi Sentinel)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified clusters based on farmer leaf diagnostic scans across districts
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
            Epidemiological Tracking
          </span>
        </div>

        {hotspots.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No disease hotspot incidents recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotspots.map((h, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {h.district}, {h.state}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                    {h.incidents} scans
                  </span>
                </div>

                <div className="text-sm font-black text-slate-900">
                  {h.disease.replace(/___/g, ' - ').replace(/_/g, ' ')}
                </div>

                <div className="text-[11px] text-slate-500">
                  Advisory notification recommended to agricultural extension officers in {h.district}.
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
