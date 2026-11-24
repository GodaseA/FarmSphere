import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Truck, 
  CheckCheck, 
  Star, 
  AlertTriangle, 
  X,
  MessageSquare,
  ShieldAlert 
} from 'lucide-react';
import { orderAPI } from '../../api/endpoints';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Dispute Modal State
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeMessage, setDisputeMessage] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getMyOrders();
      setOrders(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openReviewModal = (ord) => {
    setSelectedOrder(ord);
    setRating(5);
    setComment('');
    setReviewError('');
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    try {
      await orderAPI.submitReview(selectedOrder.id, { rating, comment });
      setReviewModalOpen(false);
      loadOrders();
    } catch (err) {
      setReviewError(err.response?.data?.detail?.detail || 'Could not submit review');
    }
  };

  const openDisputeModal = (ord) => {
    setSelectedOrder(ord);
    setDisputeReason('');
    setDisputeMessage('');
    setDisputeModalOpen(true);
  };

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    try {
      await orderAPI.raiseDispute(selectedOrder.id, { reason: disputeReason });
      setDisputeMessage('Complaint filed with platform administrators. We will resolve it shortly.');
      setTimeout(() => {
        setDisputeModalOpen(false);
      }, 1500);
    } catch (err) {
      setDisputeMessage(err.response?.data?.detail?.detail || 'Could not lodge dispute');
    }
  };

  const getStepActive = (currentStatus, step) => {
    const order = ['pending', 'confirmed', 'shipped', 'delivered'];
    const currentIdx = order.indexOf(currentStatus);
    const stepIdx = order.indexOf(step);
    return stepIdx <= currentIdx;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-brand-600" />
          My Orders & Direct Delivery Tracking
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Track progress from farmer confirmation to doorstep delivery, post verified reviews, or report disputes
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400 space-y-3">
          <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-800 text-sm">No purchase history found</h3>
          <p className="text-slate-500">Visit our marketplace to place your first direct harvest order.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-6"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-slate-900">{ord.order_no}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                      ord.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      ord.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                      ord.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Farmer: <strong className="text-slate-700">{ord.farmer_name}</strong> • Placed on: {new Date(ord.placed_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-black text-slate-900">₹{ord.total_amount}</div>
                  <div className="text-[10px] text-slate-400">Paid via {ord.payment_method?.toUpperCase()}</div>
                </div>
              </div>

              {/* Status Timeline Stepper (FR-15) */}
              <div className="py-2">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {[
                    { label: 'Pending', step: 'pending', icon: Clock },
                    { label: 'Confirmed', step: 'confirmed', icon: CheckCircle2 },
                    { label: 'Shipped', step: 'shipped', icon: Truck },
                    { label: 'Delivered', step: 'delivered', icon: CheckCheck },
                  ].map((s, idx) => {
                    const active = getStepActive(ord.status, s.step);
                    const Icon = s.icon;
                    return (
                      <div key={idx} className="space-y-2">
                        <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center transition-all ${
                          active ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className={`font-bold text-[11px] ${active ? 'text-brand-700' : 'text-slate-400'}`}>
                          {s.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Purchased Items
                </span>
                <div className="divide-y divide-slate-200">
                  {ord.items.map((i) => (
                    <div key={i.id} className="py-1.5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">
                        {i.crop_name} × {i.quantity_kg} kg
                      </span>
                      <span className="font-mono font-bold text-slate-900">₹{i.line_total}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => openDisputeModal(ord)}
                  className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Report an Issue / Dispute</span>
                </button>

                {ord.status === 'delivered' && (
                  <div>
                    {ord.has_review ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                        Review Submitted
                      </span>
                    ) : (
                      <button
                        onClick={() => openReviewModal(ord)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        <span>Rate & Review Farmer</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Review Modal Dialog (FR-17) */}
      {reviewModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                Review Order #{selectedOrder.order_no}
              </h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {reviewError}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-2">Overall Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      type="button"
                      key={starVal}
                      onClick={() => setRating(starVal)}
                      className={`p-2 rounded-xl border transition-all ${
                        rating >= starVal
                          ? 'bg-amber-50 border-amber-300 text-amber-500'
                          : 'bg-white border-slate-200 text-slate-300'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${rating >= starVal ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  ))}
                  <span className="font-bold text-slate-700 ml-2">{rating}.0 / 5.0</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Comments</label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Produce freshness, packing condition, delivery speed..."
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md shadow-brand-500/20"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Modal Dialog (FR-23) */}
      {disputeModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                Report Dispute on Order #{selectedOrder.order_no}
              </h3>
              <button onClick={() => setDisputeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {disputeMessage ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                {disputeMessage}
              </div>
            ) : (
              <form onSubmit={handleDisputeSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason for Complaint</label>
                  <textarea
                    rows={3}
                    required
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="e.g. Delivery damaged, quantity mismatch, quality issues..."
                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDisputeModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-500/20"
                  >
                    File Dispute
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
