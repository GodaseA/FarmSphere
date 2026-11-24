import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Banknote, MapPin, Truck, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { orderAPI, cartAPI } from '../../api/endpoints';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fulfilment, setFulfilment] = useState('delivery'); // 'delivery' or 'pickup'
  const [address, setAddress] = useState(
    user?.customer_profile ? `${user.customer_profile.address_line}, ${user.customer_profile.city}, ${user.customer_profile.state} - ${user.customer_profile.pincode}` : 'Flat 402, Green Meadows, Baner, Pune'
  );
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'cod'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        fulfilment,
        delivery_address: address,
        payment_method: paymentMethod
      };

      const res = await orderAPI.createOrder(payload);
      await clearCart();

      // Show mock Razorpay success modal or redirect
      setShowPaymentSuccessModal(true);
      setTimeout(() => {
        navigate('/customer/orders');
      }, 1800);

    } catch (err) {
      setError(err.response?.data?.detail?.detail || 'Failed to place order. Check stock availability.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Checkout & Order Confirmation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review fulfillment address and select payment method (Razorpay test / COD)
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left: Options */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Fulfilment Choice */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <span className="text-xs font-bold text-slate-900 block">
              1. Fulfillment Method
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setFulfilment('delivery')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  fulfilment === 'delivery'
                    ? 'border-brand-600 bg-brand-50/50 text-brand-900 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Truck className="w-5 h-5 mb-2 text-brand-600" />
                <div className="font-bold">Home Delivery</div>
                <div className="text-[10px] text-slate-500">Delivered directly by farmer</div>
              </button>

              <button
                type="button"
                onClick={() => setFulfilment('pickup')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  fulfilment === 'pickup'
                    ? 'border-brand-600 bg-brand-50/50 text-brand-900 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <MapPin className="w-5 h-5 mb-2 text-brand-600" />
                <div className="font-bold">Farm / Mandi Pickup</div>
                <div className="text-[10px] text-slate-500">Collect directly at grower farm</div>
              </button>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <span className="text-xs font-bold text-slate-900 block">
              2. Delivery Address
            </span>

            <textarea
              rows={3}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <span className="text-xs font-bold text-slate-900 block">
              3. Payment Options
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'online'
                    ? 'border-brand-600 bg-brand-50/50 text-brand-900 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-2 text-brand-600" />
                <div className="font-bold">Razorpay Online (Test)</div>
                <div className="text-[10px] text-slate-500">UPI, Cards, Netbanking</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-brand-600 bg-brand-50/50 text-brand-900 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Banknote className="w-5 h-5 mb-2 text-brand-600" />
                <div className="font-bold">Cash on Delivery (COD)</div>
                <div className="text-[10px] text-slate-500">Pay when receiving items</div>
              </button>
            </div>
          </div>

        </div>

        {/* Right: Checkout Sidebar */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-black text-slate-900 text-sm pb-2 border-b border-slate-100">
              Checkout Summary
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items ({cart.items.length})</span>
                <span className="font-bold text-slate-900">₹{cart.total_amount}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-base font-black text-slate-900">
                <span>Total Due</span>
                <span>₹{cart.total_amount}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || cart.items.length === 0}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Confirming Order...' : 'Place Secure Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </form>

      {/* Payment Success Modal */}
      {showPaymentSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="font-black text-slate-900 text-lg">Order Placed Successfully!</h3>
            <p className="text-xs text-slate-500">
              Your order has been transmitted directly to the farmer. Redirecting to order tracking...
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
