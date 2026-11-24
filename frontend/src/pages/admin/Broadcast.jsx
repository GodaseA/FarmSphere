import React, { useState } from 'react';
import { Radio, Send, Check, AlertCircle } from 'lucide-react';
import { adminAPI } from '../../api/endpoints';

export default function Broadcast() {
  const [audience, setAudience] = useState('all'); // 'all', 'farmers', 'customers'
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await adminAPI.broadcast({ audience, title, body });
      setSuccess(`Announcement broadcast successfully to: ${audience.toUpperCase()}`);
      setTitle('');
      setBody('');
    } catch (err) {
      setError('Failed to broadcast announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Radio className="w-6 h-6 text-brand-600" />
          Broadcast Global Advisory & Announcements
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Publish immediate alerts, monsoon advisories, and policy changes to platform participants (FR-26)
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Target Audience</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'all', label: 'All Users' },
              { id: 'farmers', label: 'Farmers Only' },
              { id: 'customers', label: 'Customers Only' }
            ].map(aud => (
              <button
                type="button"
                key={aud.id}
                onClick={() => setAudience(aud.id)}
                className={`py-2.5 rounded-xl border font-bold transition-all ${
                  audience === aud.id
                    ? 'border-brand-600 bg-brand-50 text-brand-800'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                {aud.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Notification Title</label>
          <input
            type="text"
            required
            maxLength={160}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Weather Alert: Heavy rainfall predicted across Nashik & Pune"
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Announcement Content</label>
          <textarea
            rows={4}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Provide complete guidelines or details for recipients..."
            className="w-full p-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? 'Transmitting Broadcast...' : 'Broadcast to Selected Audience'}</span>
        </button>
      </form>

    </div>
  );
}
