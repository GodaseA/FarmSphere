import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Search, 
  MapPin, 
  AlertCircle, 
  Info,
  Calendar,
  Sparkles 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { priceAPI } from '../../api/endpoints';

const COMMODITIES = ['Tomato', 'Potato', 'Onion', 'Wheat', 'Rice', 'Maize', 'Grape', 'Chilli', 'Apple'];
const DISTRICTS = ['Nashik', 'Pune', 'Solapur', 'Nagpur', 'Kolhapur', 'Indore', 'Shimla'];

export default function PricePredictor() {
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedDistrict, setSelectedDistrict] = useState('Nashik');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchForecast = async (crop, dist) => {
    setLoading(true);
    try {
      const res = await priceAPI.predictPrice(crop, dist);
      setPrediction(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast(selectedCrop, selectedDistrict);
  }, []);

  const handleApply = (e) => {
    e.preventDefault();
    fetchForecast(selectedCrop, selectedDistrict);
  };

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-brand-600" />
          Mandi Wholesale Price Forecasting (Guidance)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical mandi seasonal regression models providing 3-month forward guidance intervals to help farmers time sales.
        </p>
      </div>

      {/* Selector Box */}
      <form onSubmit={handleApply} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-wrap items-end gap-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Target Crop / Commodity</label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 min-w-[160px]"
          >
            {COMMODITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Market District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 min-w-[160px]"
          >
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          <span>Update Forecast</span>
        </button>
      </form>

      {/* Mandatory Regulatory Guidance Notice (FR-27 / Section 7.3) */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Official Platform Policy:</strong> Mandi price predictions are statistical estimates based on government Agmarknet historical trading data and regional crop cycles. They are presented for farmer guidance only; they never auto-fill your marketplace prices.
        </div>
      </div>

      {prediction && (
        <div className="space-y-6">
          
          {/* Chart Display */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Forward Price Projection Band for {prediction.crop} ({prediction.district})
                </h3>
                <span className="text-[11px] text-slate-400">Values in INR (₹) per kilogram</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Agmarknet Seasonality
              </span>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={prediction.forecast}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="expected_price_per_kg" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#priceGradient)" name="Expected (₹/kg)" />
                  <Area type="monotone" dataKey="max_price_per_kg" stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" fill="none" name="High Band (₹/kg)" />
                  <Area type="monotone" dataKey="min_price_per_kg" stroke="#3b82f6" strokeWidth={1} strokeDasharray="3 3" fill="none" name="Low Band (₹/kg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Forecast Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {prediction.forecast.map((fc, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold text-slate-700">{fc.month} {fc.year}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    fc.trend === 'rising' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {fc.trend}
                  </span>
                </div>

                <div className="text-2xl font-black text-slate-900">
                  ₹{fc.expected_price_per_kg} <span className="text-xs font-normal text-slate-400">/kg</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Low: ₹{fc.min_price_per_kg}</span>
                  <span>High: ₹{fc.max_price_per_kg}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
