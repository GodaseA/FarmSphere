import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  Sparkles, 
  ShoppingBag, 
  ShieldCheck, 
  ArrowRight, 
  Search, 
  TrendingUp, 
  MapPin, 
  Star,
  Leaf,
  CheckCircle2,
  Users
} from 'lucide-react';
import { listingsAPI } from '../../api/endpoints';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Home() {
  const [featuredListings, setFeaturedListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isEmerald } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const res = await listingsAPI.getListings({ page: 1, page_size: 8 });
        setFeaturedListings(res.data.items);
      } catch (err) {
        console.error("Error loading listings", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-brand-50/70 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs font-bold shadow-sm">
              <Sprout className="w-4 h-4 text-brand-600" />
              <span>Direct Agriculture Exchange & ML Diagnostics</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              {t('heroTitle')}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              {t('heroSubtitle')}
            </p>

            {/* Live Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex items-center gap-2 p-2 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200">
              <div className="flex-1 flex items-center gap-3 pl-3">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 flex items-center gap-1.5"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 pt-2">
              <span className="font-semibold text-slate-700">Popular:</span>
              {['Tomatoes', 'Nashik Onions', 'Sharbati Wheat', 'Apples', 'Sweet Corn'].map((c) => (
                <button
                  key={c}
                  onClick={() => navigate(`/browse?crop=${c}`)}
                  className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-colors shadow-2xs font-medium"
                >
                  {c}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-200/30 blur-[120px] rounded-full pointer-events-none -z-0"></div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Plant Leaf Disease AI</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Diagnose crop leaf diseases instantly across 38 PlantVillage classes with organic and chemical remedies, dosage guides, and uncertainty warnings.
            </p>
            <Link to="/disease" className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
              Test leaf scanner →
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Verified Farmer Network</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Every farmer is manually vetted by administrators with government ID and land proofs before produce can be listed on the live market.
            </p>
            <Link to="/browse" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
              Browse verified produce →
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Mandi Price Forecasting</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Access 3-month seasonal price trend forecasting by crop and district to plan harvest sales intelligently without getting shortchanged.
            </p>
            <Link to="/prices" className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1">
              View mandi price trends →
            </Link>
          </div>

        </div>
      </section>

      {/* Featured Produce Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Fresh Harvest Available Today
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Directly harvested and packed by verified local farmers
            </p>
          </div>
          <Link
            to="/browse"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View all produce</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-200 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
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

                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.farmer_district || 'Nashik'}, {item.farmer_state || 'Maharashtra'}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                      <Users className="w-3.5 h-3.5 text-brand-600" />
                      <span className="truncate">{item.farmer_name}</span>
                      {item.farmer_rating > 0 && (
                        <span className="ml-auto flex items-center gap-0.5 text-amber-500 font-bold">
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
                      {item.quantity_available_kg} kg in stock
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(item, item.min_order_kg || 1)}
                    className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow shadow-brand-500/20"
                    title="Add to cart"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Two Theme Banner Indicator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl bg-brand-50 border border-brand-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">
                Dual Theme Architecture Enabled
              </div>
              <div className="text-xs text-slate-600">
                Currently running in <strong className="text-brand-700">{isEmerald ? 'Emerald Harvest' : 'Golden Sunset'}</strong> theme. Toggle anytime via the top bar switch.
              </div>
            </div>
          </div>
          <Link
            to="/browse"
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors shadow-sm"
          >
            Explore Market Now
          </Link>
        </div>
      </section>

    </div>
  );
}
