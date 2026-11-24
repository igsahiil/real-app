'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable } from '@/components/admin/ui/AdminDataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { LocationPickerMap } from '@/components/map/LocationPickerMap';
import {
  Building2,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  X,
  AlertCircle,
  MapPin,
} from 'lucide-react';

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modals
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; propertyId: string | null; reason: string }>({
    open: false,
    propertyId: null,
    reason: '',
  });

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        statusFilter === 'all'
          ? '/api/v1/admin/properties'
          : `/api/v1/admin/properties?status=${statusFilter}`;
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

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.patch(`/api/v1/admin/properties/${id}/verify`, { status: 'approved' });
      fetchProperties();
      if (selectedProperty?._id === id) setSelectedProperty(null);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Approval failed';
      alert(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModal.propertyId || !rejectModal.reason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    setActionLoading(rejectModal.propertyId);
    try {
      await api.patch(`/api/v1/admin/properties/${rejectModal.propertyId}/verify`, {
        status: 'rejected',
        rejectionReason: rejectModal.reason,
      });
      setRejectModal({ open: false, propertyId: null, reason: '' });
      fetchProperties();
      if (selectedProperty?._id === rejectModal.propertyId) setSelectedProperty(null);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Rejection failed';
      alert(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProperties = properties.filter((p) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(query) ||
      p.location?.city?.toLowerCase().includes(query) ||
      p.location?.locality?.toLowerCase().includes(query) ||
      p.propertyType?.toLowerCase().includes(query)
    );
  });

  const pendingCount = properties.filter((p) => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Property Moderation Queue"
        subtitle="Review, approve, or reject real estate listings submitted by verified platform brokers."
        icon={Building2}
        actions={
          <button
            onClick={fetchProperties}
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
          placeholder: 'Search by title, locality, city...',
        }}
        tabs={{
          items: [
            { id: 'pending', label: 'Pending Review', count: pendingCount },
            { id: 'approved', label: 'Approved Live' },
            { id: 'rejected', label: 'Rejected' },
            { id: 'all', label: 'All Records' },
          ],
          activeId: statusFilter,
          onChange: setStatusFilter,
        }}
        loading={loading}
        empty={
          filteredProperties.length === 0
            ? {
                icon: Building2,
                title: 'No properties found',
                description: `There are currently no listings matching the "${statusFilter}" filter criteria.`,
              }
            : undefined
        }
      >
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200/80 bg-slate-50/50 text-slate-500 uppercase tracking-wider dark:border-slate-700/60 dark:bg-[#0E1626]/40 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Listing</th>
              <th className="px-5 py-3.5 font-semibold">Location</th>
              <th className="px-5 py-3.5 font-semibold">Price</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Submitted</th>
              <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
            {filteredProperties.map((prop) => (
              <tr key={prop._id} className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                      {prop.images?.[0]?.url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={prop.images[0].url}
                          alt={prop.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          <Building2 className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 max-w-xs">
                      <p className="truncate font-bold text-slate-900 dark:text-white">
                        {prop.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span className="capitalize">{prop.category}</span>
                        <span>&bull;</span>
                        <span>{prop.propertyType}</span>
                        <span>&bull;</span>
                        <span className="uppercase">{prop.listingType}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>
                      {prop.location?.locality}, {prop.location?.city}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 font-bold tabular-nums text-slate-900 dark:text-white">
                  {formatPrice(prop.price)}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={prop.status} />
                </td>
                <td className="px-5 py-4 text-slate-400 tabular-nums">
                  {new Date(prop.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setSelectedProperty(prop)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {prop.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(prop._id)}
                        disabled={actionLoading === prop._id}
                        className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-500/15 dark:text-emerald-400"
                        title="Approve Listing"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {prop.status !== 'rejected' && (
                      <button
                        onClick={() =>
                          setRejectModal({
                            open: true,
                            propertyId: prop._id,
                            reason: '',
                          })
                        }
                        disabled={actionLoading === prop._id}
                        className="flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-500/15 dark:text-rose-400"
                        title="Reject Listing"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminDataTable>

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedProperty(null)}
          />
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl dark:border-slate-700/60 dark:bg-[#1C2536]">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-700/60">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedProperty.title}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  ID: {selectedProperty._id} &bull; Submitted{' '}
                  {new Date(selectedProperty.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="flex min-h-[42px] min-w-[42px] items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Image Gallery */}
            {selectedProperty.images && selectedProperty.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {selectedProperty.images.map((img, i) => (
                  <div key={i} className="h-28 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={`img-${i}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Metadata Grid */}
            <div className="mt-5 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-4 dark:bg-[#0E1626]/60">
              <div>
                <span className="text-[11px] text-slate-400">Price</span>
                <p className="font-bold tabular-nums text-slate-900 dark:text-white">
                  {formatPrice(selectedProperty.price)}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Category</span>
                <p className="font-semibold capitalize text-slate-900 dark:text-white">
                  {selectedProperty.category}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Property Type</span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {selectedProperty.propertyType}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Listing Status</span>
                <div className="mt-0.5">
                  <StatusBadge status={selectedProperty.status} />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                {selectedProperty.description || 'No description provided.'}
              </p>
            </div>

            {/* Amenities */}
            {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Amenities</h4>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedProperty.amenities.map((a, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Location & Coordinate Verification Map */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Geospatial Location Verification
              </h4>
              <div className="mt-2 rounded-2xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-700/60 dark:bg-[#0E1626]/60">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                    <span>
                      {selectedProperty.location?.address ? `${selectedProperty.location.address}, ` : ''}
                      {selectedProperty.location?.locality}, {selectedProperty.location?.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedProperty.location?.boundary && (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                        Demarcated Plot Boundary
                      </span>
                    )}
                    <span className="font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                      {selectedProperty.location?.geo?.coordinates?.[1]?.toFixed(5) || '0.00000'}, {selectedProperty.location?.geo?.coordinates?.[0]?.toFixed(5) || '0.00000'}
                    </span>
                  </div>
                </div>
                <LocationPickerMap
                  lat={selectedProperty.location?.geo?.coordinates?.[1] || 23.0298}
                  lng={selectedProperty.location?.geo?.coordinates?.[0] || 72.5293}
                  boundary={
                    selectedProperty.location?.boundary?.coordinates?.[0]?.map(
                      ([lng, lat]) => [lat, lng] as [number, number]
                    ) || []
                  }
                  onChange={() => {}}
                  readOnly={true}
                  className="h-52 w-full"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-700/60">
              {selectedProperty.status !== 'approved' && (
                <button
                  onClick={() => handleApprove(selectedProperty._id)}
                  disabled={actionLoading === selectedProperty._id}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  Approve Listing
                </button>
              )}
              {selectedProperty.status !== 'rejected' && (
                <button
                  onClick={() =>
                    setRejectModal({
                      open: true,
                      propertyId: selectedProperty._id,
                      reason: '',
                    })
                  }
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
                >
                  Reject Listing
                </button>
              )}
              <button
                onClick={() => setSelectedProperty(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setRejectModal({ open: false, propertyId: null, reason: '' })}
          />
          <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl dark:border-slate-700/60 dark:bg-[#1C2536]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Reject Listing Submission
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Specify feedback for the broker so they can correct the listing.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Rejection Reason
              </label>
              <textarea
                rows={3}
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                placeholder="e.g. Incomplete floor plan, inaccurate pricing, or blurry images..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-none focus:border-rose-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-white"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRejectModal({ open: false, propertyId: null, reason: '' })}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                disabled={actionLoading !== null}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-60"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
