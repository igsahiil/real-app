'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import { PlusCircle, Building, MapPin, Eye, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function AgentPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'all'
        ? '/api/v1/agent/properties'
        : `/api/v1/agent/properties?status=${statusFilter}`;
      const res = await api.get(url);
      setProperties(res.data.data || []);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    setDeleteLoading(id);
    try {
      await api.delete(`/api/v1/agent/properties/${id}`);
      fetchProperties();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Delete failed';
      alert(msg);
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Property Listings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your active portfolio, monitor moderation reviews, and create new property posts.
          </p>
        </div>

        <Link
          href="/agent/properties/new"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <PlusCircle className="h-4 w-4" />
          Add New Property
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {(['all', 'approved', 'pending', 'rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold capitalize transition ${
              statusFilter === tab
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Properties Grid */}
      <div className="mt-8">
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <span className="text-sm text-slate-500">Loading your listings...</span>
          </div>
        ) : properties.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-center dark:border-slate-800 dark:bg-slate-900">
            <Building className="h-10 w-10 text-slate-400" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
              No listings found
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Get started by listing your first residential or commercial property.
            </p>
            <Link
              href="/agent/properties/new"
              className="mt-4 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Create Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <div
                key={property._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800">
                  {property.images?.[0]?.url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={property.images[0].url}
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <Building className="h-8 w-8" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase backdrop-blur-md ${
                        property.status === 'approved'
                          ? 'bg-emerald-500/90 text-white'
                          : property.status === 'rejected'
                          ? 'bg-rose-500/90 text-white'
                          : 'bg-amber-500/90 text-white'
                      }`}
                    >
                      {property.status === 'approved' && <CheckCircle className="h-3 w-3" />}
                      {property.status === 'rejected' && <XCircle className="h-3 w-3" />}
                      {property.status === 'pending' && <Clock className="h-3 w-3" />}
                      {property.status}
                    </span>
                    <span className="rounded-full bg-slate-950/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                      For {property.listingType}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {formatPrice(property.price)}
                    {property.listingType === 'rent' && (
                      <span className="text-xs font-normal text-slate-400"> / mo</span>
                    )}
                  </div>

                  <h3 className="mt-1.5 text-base font-semibold text-slate-800 line-clamp-1 dark:text-slate-100">
                    {property.title}
                  </h3>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                    <span className="line-clamp-1">
                      {property.location.locality}, {property.location.city}
                    </span>
                  </div>

                  {property.rejectionReason && (
                    <div className="mt-3 rounded-lg bg-rose-50 p-2 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                      <strong>Moderation Feedback:</strong> {property.rejectionReason}
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-800">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{property.views} views</span>
                    </div>

                    <button
                      onClick={() => handleDelete(property._id)}
                      disabled={deleteLoading === property._id}
                      className="flex items-center gap-1 text-rose-500 transition hover:text-rose-700 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
