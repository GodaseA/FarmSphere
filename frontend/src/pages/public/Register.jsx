import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Tractor, ShoppingBag, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const [roleType, setRoleType] = useState('farmer'); // 'farmer' or 'customer'
  const [error, setError] = useState('');
  const { registerFarmer, registerCustomer, loading } = useAuth();
  const navigate = useNavigate();

  // Shared fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Farmer specific
  const [farmName, setFarmName] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('Nashik');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('422001');
  const [landSizeAcres, setLandSizeAcres] = useState('5.0');
  const [idProofUrl, setIdProofUrl] = useState('https://images.unsplash.com/photo-1544717305-2782549b5136?w=600');

  // Customer specific
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Pune');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (roleType === 'farmer') {
      const res = await registerFarmer({
        full_name: fullName,
        phone,
        email: email || undefined,
        password,
        farm_name: farmName || `${fullName}'s Farm`,
        village,
        district,
        state,
        pincode,
        land_size_acres: parseFloat(landSizeAcres),
        id_proof_url: idProofUrl
      });
      if (res.success) {
        navigate('/farmer');
      } else {
        setError(res.error);
      }
    } else {
      const res = await registerCustomer({
        full_name: fullName,
        phone,
        email: email || undefined,
        password,
        address_line: addressLine || 'Sample Delivery Address',
        city,
        state,
        pincode
      });
      if (res.success) {
        navigate('/browse');
      } else {
        setError(res.error);
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/20">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Create an Account
          </h2>
          <p className="text-xs text-slate-500">
            Choose your role to join the direct agriculture marketplace
          </p>
        </div>

        {/* Role Toggle Switch */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setRoleType('farmer')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              roleType === 'farmer'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tractor className="w-4 h-4" />
            <span>I am a Farmer</span>
          </button>
          <button
            type="button"
            onClick={() => setRoleType('customer')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              roleType === 'customer'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>I am a Customer</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Common info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ramesh Patil"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Farmer Specific Fields */}
          {roleType === 'farmer' ? (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Farm & Verification Details (FR-02)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Farm / Estate Name</label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. Green Meadows Agro"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Land Size (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={landSizeAcres}
                    onChange={(e) => setLandSizeAcres(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Village</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="Dindori"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Govt ID Proof Document URL / Photo</label>
                <input
                  type="text"
                  required
                  value={idProofUrl}
                  onChange={(e) => setIdProofUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none text-[11px] text-slate-600 font-mono"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] leading-relaxed">
                ℹ️ <strong>Verification policy:</strong> Per platform rules, farmer registration stays <em>pending</em> until verified by the platform admin. You can log yield records immediately, while listing produce requires admin approval.
              </div>
            </div>
          ) : (
            /* Customer Specific Fields */
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Delivery Location
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Street / House Address</label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="Flat 102, Shanti Vihar, Baner Road"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : `Register as ${roleType === 'farmer' ? 'Farmer' : 'Customer'}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
}
