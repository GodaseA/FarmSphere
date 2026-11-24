import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Cart() {
  const { cart, updateQuantity, removeItem, clearCart, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-brand-600" />
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Produce sourced directly from verified regional farms
          </p>
        </div>

        {itemCount > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-rose-600 hover:underline"
          >
            Empty Cart
          </button>
        )}
      </div>

      {itemCount === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Your cart is currently empty</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our verified growers and add fresh produce straight to your harvest box.
          </p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20"
          >
            <span>Explore Marketplace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.listing?.image_urls?.[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600'}
                    alt={item.listing?.crop_name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{item.listing?.crop_name}</h3>
                    <p className="text-[11px] text-slate-500">
                      Sold by: <span className="font-semibold text-slate-700">{item.listing?.farmer_name}</span>
                    </p>
                    <div className="text-xs font-black text-brand-600 mt-1">
                      ₹{item.listing?.price_per_kg} / kg
                    </div>
                  </div>
                </div>

                {/* Quantity and Line Total */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity_kg - 1)}
                      className="p-1.5 hover:bg-slate-200 rounded-l-xl transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-800">
                      {item.quantity_kg} kg
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity_kg + 1)}
                      className="p-1.5 hover:bg-slate-200 rounded-r-xl transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900">
                      ₹{Math.round(item.listing?.price_per_kg * item.quantity_kg * 100) / 100}
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5 h-fit">
            <h3 className="font-black text-slate-900 text-base pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">₹{cart.total_amount}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Commission</span>
                <span className="font-bold text-emerald-600">₹0 (Zero Middlemen)</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Delivery</span>
                <span className="font-bold text-slate-900">Direct Farmer Delivery</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between text-sm font-black text-slate-900">
                <span>Total Amount</span>
                <span>₹{cart.total_amount}</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (!isAuthenticated) navigate('/login');
                else navigate('/checkout');
              }}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>{isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
