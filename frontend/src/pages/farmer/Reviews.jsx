import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, Calendar } from 'lucide-react';
import { farmerAPI } from '../../api/endpoints';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await farmerAPI.getReviews();
        setReviews(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-500 fill-amber-400" />
          Customer Ratings & Feedback
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Reviews submitted by customers after successful delivery confirmation
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400 space-y-2">
          <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
          <p className="font-bold text-slate-700">No customer reviews yet.</p>
          <p className="text-[11px] text-slate-400">Reviews appear here once buyers receive their shipments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                    {rev.customer_name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{rev.customer_name}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500 font-black text-xs">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{rev.rating}.0 / 5.0</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{rev.comment || 'Verified purchase. Excellent farm quality!'}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
