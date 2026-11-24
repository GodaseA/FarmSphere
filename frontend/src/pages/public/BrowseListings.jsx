import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Leaf, Star, MapPin, ShoppingBag, Check, X } from 'lucide-react';
import { listingsAPI } from '../../api/endpoints';
import { useCart } from '../../context/CartContext';

export default function BrowseListings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState(searchParams.get('q') || searchParams.get('crop') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [organicOnly, setOrganicOnly] = useState(searchParams.get('organic') === 'true');
  const [addedItem, setAddedItem] = useState(null);

  const { addToCart } = useCart();

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {
        q: query || undefined,
        min_price: minPrice ? parseFloat(minPrice) : undefined,
        max_price: maxPrice ? parseFloat(maxPrice) : undefined,
        organic: organicOnly ? true : undefined,
      };
      const res = await listingsAPI.getListings(params);
      setListings(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  const handleApplyFilters = (e) => {
    e?.preventDefault();
    const newParams = {};
    if (query) newParams.q = query;
    if (minPrice) newParams.min_price = minPrice;
    if (maxPrice) newParams.max_price = maxPrice;
    if (organicOnly) newParams.organic = 'true';
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setQuery('');
    setMinPrice('');
    setMaxPrice('');
    setOrganicOnly(false);
    setSearchParams({});
  };

  const handleAddToCart = async (item) => {
    await addToCart(item, item.min_order_kg || 1);
    setAddedItem(item.id);
    setTimeout(() => setAddedItem(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Direct Farm Produce Marketplace
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Buy farm-fresh vegetables, fruits, and grains directly from verified growers
          </p>
        </div>
        <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg self-start">
          Showing {listings.length} of {total} available listings
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-1 space-y-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs h-fit">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-600" /> Filters
            </span>
            <button
              onClick={handleClearFilters}
              className="text-[11px] font-semibold text-brand-600 hover:underline"
            >
              Reset
            </button>
          </div>

          <form onSubmit={handleApplyFilters} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Keyword / Crop</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Onion, Tomato..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Min ₹/kg</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Max ₹/kg</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="200"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={organicOnly}
                  onChange={(e) => setOrganicOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                />
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Only 100% Organic
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-sm shadow-brand-500/20"
            >
              Apply Filter
            </button>
          </form>
        </aside>

        {/* Listings Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
              <Leaf className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">No produce listings found</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Try clearing your search query or price filters.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      <img
                        src={item.image_urls?.[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600'}
                        alt={item.crop_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.is_organic && (
                        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow">
                          <Leaf className="w-3 h-3" /> Organic
                        </span>
                      )}
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold shadow">
                        Grade {item.quality_grade}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
                        {item.crop_name}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2">
                        {item.description || 'Freshly harvested produce with top-grade quality and authentic farm taste.'}
                      </p>

                      <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.farmer_district || 'Nashik'}, {item.farmer_state || 'Maharashtra'}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                        <span className="font-semibold text-slate-700 truncate">{item.farmer_name}</span>
                        {item.farmer_rating > 0 && (
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {item.farmer_rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
                    <div>
                      <span className="text-lg font-black text-slate-900">₹{item.price_per_kg}</span>
                      <span className="text-[11px] text-slate-400 font-normal"> / kg</span>
                      <div className="text-[10px] text-emerald-600 font-semibold">
                        {item.quantity_available_kg} kg left
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                        addedItem === item.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-brand-600 hover:bg-brand-700 text-white'
                      }`}
                    >
                      {addedItem === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Added
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" /> Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
