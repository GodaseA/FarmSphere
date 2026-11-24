import React, { useState, useEffect } from 'react';
import { AlertTriangle, Check, X, ShieldAlert } from 'lucide-react';
import { adminAPI } from '../../api/endpoints';

export default function Disputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingDispute, setResolvingDispute] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('resolved');
  const [resolutionNote, setResolutionNote] = useState('Refund processed to customer bank account.');

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDisputes();
      setDisputes(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.resolveDispute(resolvingDispute.id, {
        status: resolutionStatus,
        resolution_note: resolutionNote
      });
      setResolvingDispute(null);
      loadDisputes();
    } catch (err) {
      alert('Failed to resolve dispute');
    }
  };

  return (
    <div className="space-y-8">
      
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-rose-600" />
          Disputes, Complaints & Refund Settlement
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review customer order complaints, arbitrate fairly, and mark resolutions or refunds (FR-23)
        </p>
      </div>

      {disputes.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400 space-y-2">
          <ShieldAlert className="w-10 h-10 mx-auto text-emerald-500 bg-emerald-50 rounded-full p-2" />
          <h3 className="font-bold text-slate-800 text-sm">No Active Disputes</h3>
          <p className="text-slate-500">All customer orders have completed without unresolved complaints.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {disputes.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-800">
                    Order #{d.order_no}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    d.status === 'open' ? 'bg-rose-100 text-rose-800' :
                    d.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {d.status}
                  </span>
                </div>

                <div className="text-xs text-slate-500">
                  Raised by: <strong className="text-slate-800">{d.raised_by_name}</strong> • {new Date(d.created_at).toLocaleDateString()}
                </div>

                <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl text-xs text-rose-900 font-medium leading-relaxed">
                  "{d.reason}"
                </div>

                {d.resolution_note && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                    <strong>Resolution:</strong> {d.resolution_note}
                  </div>
                )}
              </div>

              {d.status === 'open' && (
                <div className="pt-3 border-t border-slate-100 text-right">
                  <button
                    onClick={() => setResolvingDispute(d)}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm"
                  >
                    Resolve Complaint
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      {resolvingDispute && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                Resolve Dispute #{resolvingDispute.order_no}
              </h3>
              <button onClick={() => setResolvingDispute(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resolution Outcome</label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="resolved">Mark Resolved / Issued Refund</option>
                  <option value="rejected">Reject Complaint (Invalid Issue)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resolution Note to User</label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingDispute(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md shadow-brand-500/20"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
