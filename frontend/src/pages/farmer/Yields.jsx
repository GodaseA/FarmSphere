import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Plus, 
  Trash2, 
  Edit3, 
  BarChart2, 
  Calendar, 
  Layers, 
  MapPin, 
  X,
  AlertCircle 
} from 'lucide-react';
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
import { farmerAPI } from '../../api/endpoints';

const SEASONS = ['kharif', 'rabi', 'zaid'];
const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function Yields() {
  const [yields, setYields] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [cropName, setCropName] = useState('Tomato');
  const [season, setSeason] = useState('kharif');
  const [year, setYear] = useState(2025);
  const [sowingDate, setSowingDate] = useState('2025-06-15');
  const [harvestDate, setHarvestDate] = useState('2025-09-20');
  const [quantityKg, setQuantityKg] = useState('4500');
  const [landAreaAcres, setLandAreaAcres] = useState('3.0');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [yRes, aRes] = await Promise.all([
        farmerAPI.getYields(),
        farmerAPI.getYieldAnalytics()
      ]);
      setYields(yRes.data);
      setAnalytics(aRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setCropName('Tomato');
    setSeason('kharif');
    setYear(2026);
    setSowingDate('2026-06-10');
    setHarvestDate('2026-09-25');
    setQuantityKg('5000');
    setLandAreaAcres('3.5');
    setNotes('');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setCropName(item.crop_name);
    setSeason(item.season);
    setYear(item.year);
    setSowingDate(item.sowing_date);
    setHarvestDate(item.harvest_date || '');
    setQuantityKg(String(item.quantity_kg || ''));
    setLandAreaAcres(String(item.land_area_acres));
    setNotes(item.notes || '');
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        crop_name: cropName,
        season,
        year: parseInt(year),
        sowing_date: sowingDate,
        harvest_date: harvestDate || null,
        quantity_kg: quantityKg ? parseFloat(quantityKg) : null,
        land_area_acres: parseFloat(landAreaAcres),
        notes: notes || null
      };

      if (editingId) {
        await farmerAPI.updateYield(editingId, payload);
      } else {
        await farmerAPI.createYield(payload);
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail?.detail || 'Error saving yield record');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this seasonal yield record?')) return;
    try {
      await farmerAPI.deleteYield(id);
      loadData();
    } catch (err) {
      alert('Failed to delete yield record');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Seasonal Crop Yield Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Log seasonal production volumes, track harvest dates, and evaluate yield trends
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-brand-500/20 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add Harvest Yield</span>
        </button>
      </div>

      {/* Analytics Charts (FR-05) */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Yield by Crop */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-brand-600" />
              Harvest Output by Crop (kg)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.by_crop}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="crop" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="yield_kg" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Yield by Season */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600" />
              Production by Agricultural Season
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.by_season}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="season" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="yield_kg" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Yield Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Harvest Records Log</h3>
          <span className="text-xs text-slate-500 font-semibold">{yields.length} Recorded Cycles</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-4">Crop</th>
                <th className="p-4">Season & Year</th>
                <th className="p-4">Sowing Date</th>
                <th className="p-4">Harvest Date</th>
                <th className="p-4">Total Output</th>
                <th className="p-4">Acreage</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {yields.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="p-4 font-bold text-slate-900">{item.crop_name}</td>
                  <td className="p-4">
                    <span className="capitalize font-semibold text-slate-700">{item.season}</span> {item.year}
                  </td>
                  <td className="p-4 text-slate-500">{item.sowing_date}</td>
                  <td className="p-4 text-slate-500">{item.harvest_date || 'In progress'}</td>
                  <td className="p-4 font-bold text-slate-800">
                    {item.quantity_kg ? `${item.quantity_kg.toLocaleString()} kg` : 'Pending'}
                  </td>
                  <td className="p-4 text-slate-600 font-medium">{item.land_area_acres} Acres</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-slate-100"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingId ? 'Edit Harvest Yield' : 'Log New Seasonal Yield'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Crop Name</label>
                  <input
                    type="text"
                    required
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    placeholder="e.g. Tomato, Wheat"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Season</label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 capitalize"
                  >
                    {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Output (kg)</label>
                  <input
                    type="number"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                    placeholder="4500"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Land (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={landAreaAcres}
                    onChange={(e) => setLandAreaAcres(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sowing Date</label>
                  <input
                    type="date"
                    required
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harvest Date</label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Field Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Fertilizer type, rainfall conditions..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md shadow-brand-500/20"
                >
                  {editingId ? 'Save Changes' : 'Record Harvest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
