import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Star, ShoppingBag, Leaf, Tractor, ArrowLeft } from 'lucide-react';
import { listingsAPI } from '../../api/endpoints';
import { useCart } from '../../context/CartContext';

export default function FarmerPublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await listingsAPI.getFarmerProfile(id);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-64 bg-slate-200 animate-pulse rounded-3xl"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <h2 className="text-lg font-bold text-slate-800">Farmer not found</h2>
        <Link to="/browse" className="text-xs font-bold text-brand-600 hover:underline mt-2 inline-block">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <Link to="/browse" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600">
        <ArrowLeft className="w-4 h-4" /> Back to browse
      </Link>

      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-brand-500/20">
            {profile.full_name?.charAt(0) || 'F'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{profile.farm_name || profile.full_name}</h1>
              {profile.verification_status === 'approved' && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Grower
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-600">{profile.full_name}</p>
            <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {profile.village || 'Village'}, {profile.district}, {profile.state}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Tractor className="w-3.5 h-3.5 text-slate-400" /> {profile.land_size_acres} Acres Cultivated</span>
            </div>
          </div>
        </div>

        {/* Rating summary */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-black text-amber-900 flex items-center justify-center gap-1">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              {profile.avg_rating || '5.0'}
            </div>
            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
              {profile.rating_count} Reviews
            </div>
          </div>
        </div>
      </div>

      {/* Produce Listings */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Current Harvest Catalog
        </h2>

        {profile.active_listings?.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No active produce listed at this moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {profile.active_listings?.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    <img
                      src={item.image_urls?.[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600'}
                      alt={item.crop_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {item.is_organic && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                        Organic
                      </span>
                    )}
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm">{item.crop_name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
                  <div>
                    <span className="text-base font-black text-slate-900">₹{item.price_per_kg}</span>
                    <span className="text-[11px] text-slate-400">/kg</span>
                  </div>
                  <button
                    onClick={() => addToCart(item, item.min_order_kg || 1)}
                    className="p-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
