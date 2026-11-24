import React, { useState, useEffect } from 'react';
import { ScrollText, Clock, User, ShieldCheck } from 'lucide-react';
import { adminAPI } from '../../api/endpoints';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await adminAPI.getLogs();
        setLogs(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8">
      
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-brand-600" />
          Immutable Governance Audit Trail (admin_logs)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Cryptographically recorded sequence of order transitions, verifications, blocks, and dispute arbitrations (NFR-07)
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">System Event Journal</h3>
          <span className="text-xs text-slate-500 font-semibold">{logs.length} Recent Logged Events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-4">Action Type</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Remarks / Details</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="p-4">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {log.action_type}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">
                    {log.actor_name || 'System Auto-Trigger'}
                  </td>
                  <td className="p-4 text-slate-500 uppercase font-mono text-[10px]">
                    {log.target_type || '—'}
                  </td>
                  <td className="p-4 text-slate-600 max-w-sm truncate font-medium">
                    {log.remarks || '—'}
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
