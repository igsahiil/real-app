'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { MasterDataItem } from '@/types';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable } from '@/components/admin/ui/AdminDataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import {
  Database,
  Plus,
  Trash2,
  RefreshCw,
  X,
} from 'lucide-react';

export default function AdminMasterDataPage() {
  const [items, setItems] = useState<MasterDataItem[]>([]);
  const [type, setType] = useState<string>('city');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Add Item Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('residential');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/master-data?type=${type}`);
      setItems(res.data.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setActionLoading(true);
    try {
      await api.post('/api/v1/master-data', {
        type,
        name: name.trim(),
        category: type === 'property_type' ? category : undefined,
      });
      setName('');
      setIsModalOpen(false);
      fetchItems();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Creation failed';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this taxonomy record?')) return;
    try {
      await api.delete(`/api/v1/master-data/${id}`);
      fetchItems();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Deletion failed';
      alert(msg);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Taxonomy & Master Data"
        subtitle="Manage standardized cities, localities, property types, and search filter amenities."
        icon={Database}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchItems}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add Entry</span>
            </button>
          </div>
        }
      />

      <AdminDataTable
        search={{
          value: search,
          onChange: setSearch,
          placeholder: `Search ${type.replace('_', ' ')}s...`,
        }}
        tabs={{
          items: [
            { id: 'city', label: 'Cities' },
            { id: 'locality', label: 'Localities' },
            { id: 'property_type', label: 'Property Types' },
            { id: 'amenity', label: 'Amenities' },
          ],
          activeId: type,
          onChange: setType,
        }}
        loading={loading}
        empty={
          filteredItems.length === 0
            ? {
                icon: Database,
                title: 'No taxonomy entries found',
                description: `No records exist for the "${type.replace('_', ' ')}" collection. Tap "Add Entry" to create one.`,
              }
            : undefined
        }
      >
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200/80 bg-slate-50/50 text-slate-500 uppercase tracking-wider dark:border-slate-700/60 dark:bg-[#0E1626]/40 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Entry Name</th>
              <th className="px-5 py-3.5 font-semibold">Taxonomy Type</th>
              <th className="px-5 py-3.5 font-semibold">Metadata</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
            {filteredItems.map((item) => (
              <tr key={item._id} className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                  {item.name}
                </td>
                <td className="px-5 py-4">
                  <span className="capitalize text-slate-500 dark:text-slate-400">
                    {item.type.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                  {item.category ? (
                    <span className="capitalize">{item.category}</span>
                  ) : (
                    <span>&mdash;</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status="Active" tone="emerald" />
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    title="Delete record"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminDataTable>

      {/* Add Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700/60 dark:bg-[#1C2536]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-700/60">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Add New {type.replace('_', ' ')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Name / Label
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`e.g. ${type === 'city' ? 'Ahmedabad' : type === 'property_type' ? 'Penthouse' : 'Clubhouse'}`}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-white"
                />
              </div>

              {type === 'property_type' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:[color-scheme:dark]"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="plot_land">Plot / Land</option>
                  </select>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
