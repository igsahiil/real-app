'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable } from '@/components/admin/ui/AdminDataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import {
  Users,
  Lock,
  Unlock,
  RefreshCw,
  Mail,
  Phone,
} from 'lucide-react';

interface UserRow {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'agent' | 'user';
  isBlocked: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (search) params.set('search', search);

      const res = await api.get(`/api/v1/admin/users?${params.toString()}`);
      setUsers(res.data.data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleBlock = async (user: UserRow) => {
    setActionLoading(user._id);
    try {
      await api.patch(`/api/v1/admin/users/${user._id}/block`, {
        isBlocked: !user.isBlocked,
      });
      fetchUsers();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Action failed';
      alert(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="User & Agent Directory"
        subtitle="Manage user accounts, roles, access permissions, and account suspensions."
        icon={Users}
        actions={
          <button
            onClick={fetchUsers}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        }
      />

      <AdminDataTable
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search by name, email, phone...',
        }}
        tabs={{
          items: [
            { id: 'all', label: 'All Accounts' },
            { id: 'user', label: 'Buyers & Users' },
            { id: 'agent', label: 'Brokers' },
            { id: 'admin', label: 'Administrators' },
          ],
          activeId: roleFilter,
          onChange: setRoleFilter,
        }}
        loading={loading}
        empty={
          filteredUsers.length === 0
            ? {
                icon: Users,
                title: 'No user accounts found',
                description: `There are currently no users matching the "${roleFilter}" role filter.`,
              }
            : undefined
        }
      >
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200/80 bg-slate-50/50 text-slate-500 uppercase tracking-wider dark:border-slate-700/60 dark:bg-[#0E1626]/40 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3.5 font-semibold">User</th>
              <th className="px-5 py-3.5 font-semibold">Role</th>
              <th className="px-5 py-3.5 font-semibold">Contact Info</th>
              <th className="px-5 py-3.5 font-semibold">Account Status</th>
              <th className="px-5 py-3.5 font-semibold">Joined Date</th>
              <th className="px-5 py-3.5 text-right font-semibold">Access Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
            {filteredUsers.map((u) => (
              <tr key={u._id} className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge
                    status={u.role}
                    tone={u.role === 'admin' ? 'indigo' : u.role === 'agent' ? 'amber' : 'slate'}
                  />
                </td>
                <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                  <div className="space-y-0.5">
                    {u.phone && (
                      <p className="flex items-center gap-1.5 tabular-nums">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{u.phone}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-slate-400" />
                      <span>{u.email}</span>
                    </p>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      u.isBlocked
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${u.isBlocked ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    />
                    {u.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-400 tabular-nums">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-4 text-right">
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleToggleBlock(u)}
                      disabled={actionLoading === u._id}
                      className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                        u.isBlocked
                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-400'
                      }`}
                      title={u.isBlocked ? 'Unblock user' : 'Block user'}
                    >
                      {u.isBlocked ? (
                        <>
                          <Unlock className="h-3.5 w-3.5" />
                          <span>Unblock</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" />
                          <span>Block</span>
                        </>
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminDataTable>
    </div>
  );
}
