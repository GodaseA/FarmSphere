import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Check, 
  X, 
  Eye, 
  ExternalLink, 
  AlertCircle, 
  MapPin, 
  Tractor,
  FileText 
} from 'lucide-react';
import { adminAPI } from '../../api/endpoints';

export default function Verification() {
  const [pendingFarmers, setPendingFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState(null);
  const [rejectingFarmer, setRejectingFarmer] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPendingFarmers();
      setPendingFarmers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (farmerId) => {
    try {
      await adminAPI.verifyFarmer(farmerId, 'approve');
      setActionMessage('Farmer verified and approved! Produce listing privileges enabled.');
      setTimeout(() => setActionMessage(''), 3000);
      loadPending();
    } catch (err) {
      alert('Failed to approve farmer');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.verifyFarmer(rejectingFarmer.id, 'reject', rejectionReason);
      setRejectingFarmer(null);
      setRejectionReason('');
      setActionMessage('Farmer verification rejected with stated reason.');
      setTimeout(() => setActionMessage(''), 3000);
      loadPending();
    } catch (err) {
      alert('Failed to submit rejection');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-brand-600" />
          Farmer Identity & Land Verification Queue
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Inspect farmer identity credentials and land documents before authorizing produce sales on the platform (FR-20)
        </p>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {pendingFarmers.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400 space-y-2">
          <Check className="w-10 h-10 mx-auto text-emerald-500 bg-emerald-50 rounded-full p-2" />
          <h3 className="font-bold text-slate-800 text-sm">All Farmer Verifications Clear!</h3>
          <p className="text-slate-500">There are currently no new farmer applications awaiting review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingFarmers.map((farmer) => {
            const prof = farmer.farmer_profile;
            return (
              <div
                key={farmer.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-black text-slate-900 text-base">{farmer.full_name}</h3>
                      <div className="text-xs font-semibold text-brand-700">{prof?.farm_name || 'Agro Farm'}</div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                      Pending
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{prof?.village || 'Village'}, {prof?.district}, {prof?.state} ({prof?.pincode})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Tractor className="w-3.5 h-3.5 text-slate-400" />
                      <span>{prof?.land_size_acres} Acres Cultivated Land</span>
                    </div>
                    <div className="text-[11px] text-slate-500 pt-1">
                      Phone: <strong className="text-slate-800">{farmer.phone}</strong> • Email: {farmer.email || 'N/A'}
                    </div>
                  </div>

                  {/* ID Proof Preview */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Submitted ID Proof Document
                    </span>
                    <div className="flex items-center gap-3">
                      <img
                        src={prof?.id_proof_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600'}
                        alt="ID Proof"
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                      />
                      <button
                        onClick={() => setSelectedProof(prof?.id_proof_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600')}
                        className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Full Document
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setRejectingFarmer(farmer)}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Reject with Reason
                  </button>
                  <button
                    onClick={() => handleApprove(farmer.id)}
                    className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve Farmer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ID Proof Full Viewer Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">Farmer Verification Proof Viewer</h3>
              <button onClick={() => setSelectedProof(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-2xl bg-slate-100 p-2 flex items-center justify-center">
              <img src={selectedProof} alt="ID Document" className="max-w-full max-h-[60vh] object-contain rounded-xl" />
            </div>
            <div className="text-right">
              <button
                onClick={() => setSelectedProof(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject with Reason Modal (FR-20) */}
      {rejectingFarmer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">Reject Application</h3>
              <button onClick={() => setRejectingFarmer(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Rejecting application for <strong>{rejectingFarmer.full_name}</strong>. Please enter the reason for rejection (this will be sent to the farmer):
              </p>

              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Land registration proof blurry, identity mismatch with government record..."
                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingFarmer(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-500/20"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
