import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  Pause, 
  Play, 
  Leaf, 
  AlertCircle, 
  X,
  CheckCircle2
} from 'lucide-react';
import { farmerAPI } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

export default function MyListings() {
  const { user } = useAuth();
  const isApproved = user?.farmer_profile?.verification_status === 'approved';

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [cropName, setCropName] = useState('Fresh Tomatoes');
  const [description, setDescription] = useState('Organically grown, vine ripened tomatoes.');
  const [pricePerKg, setPricePerKg] = useState('35.0');
  const [quantityAvailableKg, setQuantityAvailableKg] = useState('500');
  const [minOrderKg, setMinOrderKg] = useState('2');
  const [qualityGrade, setQualityGrade] = useState('A');
  const [isOrganic, setIsOrganic] = useState(true);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600');
  const [error, setError] = useState('');

  const loadListings = async () => {
    setLoading(true);
    try {
      const res = await farmerAPI.getMyListings();
      setListings(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setCropName('Fresh Tomatoes');
    setDescription('Farm fresh, harvested this morning with zero chemical residues.');
    setPricePerKg('35.0');
    setQuantityAvailableKg('600');
    setMinOrderKg('2');
    setQualityGrade('A');
    setIsOrganic(true);
    setImageUrl('https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setCropName(item.crop_name);
    setDescription(item.description || '');
    setPricePerKg(String(item.price_per_kg));
    setQuantityAvailableKg(String(item.quantity_available_kg));
    setMinOrderKg(String(item.min_order_kg));
    setQualityGrade(item.quality_grade);
    setIsOrganic(item.is_organic);
    setImageUrl(item.image_urls?.[0] || '');
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        crop_name: cropName,
        description,
        price_per_kg: parseFloat(pricePerKg),
        quantity_available_kg: parseFloat(quantityAvailableKg),
        min_order_kg: parseFloat(minOrderKg),
        quality_grade: qualityGrade,
        is_organic: isOrganic,
        image_urls: [imageUrl]
      };

      if (editingId) {
        await farmerAPI.updateListing(editingId, payload);
      } else {
        await farmerAPI.createListing(payload);
      }

      setModalOpen(false);
      loadListings();
    } catch (err) {
      setError(err.response?.data?.detail?.detail || 'Error saving listing');
    }
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'active' ? 'paused' : 'active';
    try {
      await farmerAPI.updateListing(item.id, { status: nextStatus });
      loadListings();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this produce listing from the public market?')) return;
    try {
      await farmerAPI.deleteListing(id);
      loadListings();
    } catch (err) {
      alert('Failed to remove listing');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Produce Listings & Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your active harvest catalogue on the direct customer marketplace
          </p>
        </div>

        {isApproved ? (
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-brand-500/20 transition-all self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Produce Listing</span>
          </button>
        ) : (
          <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Listing locked until Admin verification</span>
          </div>
        )}
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Active Inventory Items</h3>
          <span className="text-xs text-slate-500 font-semibold">{listings.length} Listed Items</span>
        </div>

        {listings.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            No produce listings created yet. Click "Post New Produce Listing" above to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-4">Photo</th>
                  <th className="p-4">Produce Name</th>
                  <th className="p-4">Price / kg</th>
                  <th className="p-4">Stock Left</th>
                  <th className="p-4">Grade</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="p-4">
                      <img
                        src={item.image_urls?.[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600'}
                        alt={item.crop_name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{item.crop_name}</span>
                        {item.is_organic && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                            Organic
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-800">₹{item.price_per_kg}</td>
                    <td className="p-4 text-slate-600 font-semibold">{item.quantity_available_kg} kg</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                        {item.quality_grade}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'paused' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        title={item.status === 'active' ? 'Pause listing' : 'Activate listing'}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-slate-100"
                      >
                        {item.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
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
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingId ? 'Edit Produce Listing' : 'Post Produce for Sale'}
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
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Produce Name</label>
                <input
                  type="text"
                  required
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="e.g. Nashik Red Onions"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Harvest date, taste profile, storage instructions..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (₹/kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock (kg)</label>
                  <input
                    type="number"
                    required
                    value={quantityAvailableKg}
                    onChange={(e) => setQuantityAvailableKg(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Order (kg)</label>
                  <input
                    type="number"
                    required
                    value={minOrderKg}
                    onChange={(e) => setMinOrderKg(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quality Grade</label>
                  <select
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="A">Grade A (Premium Export Quality)</option>
                    <option value="B">Grade B (Standard Market Quality)</option>
                    <option value="C">Grade C (Processing Quality)</option>
                  </select>
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOrganic}
                      onChange={(e) => setIsOrganic(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-600"
                    />
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Leaf className="w-3.5 h-3.5 text-emerald-600" /> 100% Organic
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none text-slate-600 font-mono text-[11px]"
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
                  {editingId ? 'Update Listing' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
