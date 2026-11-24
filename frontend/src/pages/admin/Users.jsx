import React, { useState, useEffect } from 'react';
import { Users, Search, Ban, CheckCircle, ShieldAlert, Filter } from 'lucide-react';
import { adminAPI } from '../../api/endpoints';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({
        role: roleFilter || undefined,
        q: searchQuery || undefined
      });
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'blocked' : 'active';
    const actionName = nextStatus === 'blocked' ? 'block' : 'unblock';
    if (!window.confirm(`Are you sure you want to ${actionName} ${user.full_name}?`)) return;

    try {
      await adminAPI.updateUserStatus(user.id, nextStatus);
      loadUsers();
    } catch (err) {
      alert(`Failed to ${actionName} user`);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-600" />
          User Directory & Account Governance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Search, audit activity, and enforce security policies (block/unblock accounts per FR-21)
        </p>
      </div>

      {/* Search and Filters */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, or email..."
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="farmer">Farmers</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
          </select>

          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-sm"
          >
            Search
          </button>
        </div>
      </form>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Registered Accounts</h3>
          <span className="text-xs text-slate-500 font-semibold">{users.length} Users</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Phone / Email</th>
                <th className="p-4">Status</th>
                <th className="p-4">Registered On</th>
                <th className="p-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{u.full_name}</div>
                    {u.farmer_profile?.farm_name && (
                      <div className="text-[10px] text-brand-600">{u.farmer_profile.farm_name}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">
                    <div>{u.phone}</div>
                    <div className="text-[10px] text-slate-400">{u.email || '—'}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors flex items-center gap-1 ml-auto ${
                          u.status === 'active'
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {u.status === 'active' ? (
                          <>
                            <Ban className="w-3.5 h-3.5" /> Block
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" /> Unblock
                          </>
                        )}
                      </button>
                    )}
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
