'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import {
  PlusCircle,
  Building,
  MapPin,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  Globe,
  Share2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  X,
} from 'lucide-react';

export default function AgentPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Share Token Modal State
  const [shareModalProperty, setShareModalProperty] = useState<Property | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(30);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        statusFilter === 'all'
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
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Delete failed';
      alert(msg);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleToggleVisibility = async (property: Property) => {
    const nextVisibility = property.visibility === 'private' ? 'public' : 'private';
    try {
      await api.patch(`/api/v1/agent/properties/${property._id}/visibility`, {
        visibility: nextVisibility,
      });
      fetchProperties();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to update visibility';
      alert(msg);
    }
  };

  const handleGenerateShareToken = async (propertyId: string) => {
    setShareLoading(true);
    try {
      const res = await api.post(`/api/v1/agent/properties/${propertyId}/share-token`, {
        expiresInDays,
      });
      const updated = res.data.data;
      if (shareModalProperty) {
        setShareModalProperty({
          ...shareModalProperty,
          shareToken: updated.shareToken,
          shareTokenExpiresAt: updated.expiresAt,
          isShareTokenActive: true,
        });
      }
      fetchProperties();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to generate share link';
      alert(msg);
    } finally {
      setShareLoading(false);
    }
  };

  const handleRevokeShareToken = async (propertyId: string) => {
    if (!confirm('Revoking this link will immediately prevent anyone with the current URL from viewing this listing. Continue?')) {
      return;
    }
    setShareLoading(true);
    try {
      await api.delete(`/api/v1/agent/properties/${propertyId}/share-token`);
      if (shareModalProperty) {
        setShareModalProperty({
          ...shareModalProperty,
          shareToken: undefined,
          shareTokenExpiresAt: undefined,
          isShareTokenActive: false,
        });
      }
      fetchProperties();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to revoke share link';
      alert(msg);
    } finally {
      setShareLoading(false);
    }
  };

  const getFullShareUrl = (token: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/properties/private/${token}`;
    }
    return `/properties/private/${token}`;
  };

  const handleCopyLink = (token: string) => {
    const url = getFullShareUrl(token);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            Manage your active portfolio, generate private share links, and monitor reviews.
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

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
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

                    {/* Visibility Badge */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide backdrop-blur-md ${
                        property.visibility === 'private'
                          ? 'bg-purple-600/90 text-white'
                          : 'bg-slate-900/80 text-white'
                      }`}
                    >
                      {property.visibility === 'private' ? (
                        <>
                          <Lock className="h-2.5 w-2.5" /> Private
                        </>
                      ) : (
                        <>
                          <Globe className="h-2.5 w-2.5" /> Public
                        </>
                      )}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="rounded-full bg-slate-950/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                      For {property.listingType}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                      {formatPrice(property.price)}
                      {property.listingType === 'rent' && (
                        <span className="text-xs font-normal text-slate-400"> / mo</span>
                      )}
                    </div>

                    {/* Share Link Trigger Button */}
                    <button
                      onClick={() => setShareModalProperty(property)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 px-2.5 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
                      title="Generate and copy client share link"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share Link</span>
                    </button>
                  </div>

                  <h3 className="mt-2 text-base font-semibold text-slate-800 line-clamp-1 dark:text-slate-100">
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

                  {/* Actions Bar */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{property.views} views</span>
                      </div>

                      {/* Quick Visibility Toggle */}
                      <button
                        onClick={() => handleToggleVisibility(property)}
                        className="text-xs text-slate-500 underline decoration-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                        title="Click to toggle between Public and Private"
                      >
                        Make {property.visibility === 'private' ? 'Public' : 'Private'}
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* View Link */}
                      {property.visibility === 'private' && property.shareToken ? (
                        <Link
                          href={`/properties/private/${property.shareToken}`}
                          target="_blank"
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </Link>
                      ) : (
                        <Link
                          href={`/properties/${property.slug}`}
                          target="_blank"
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </Link>
                      )}

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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Link Modal */}
      {shareModalProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Client Shareable Link
                  </h3>
                  <p className="text-xs text-slate-500">
                    Generate an unlisted token link for direct client viewing
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShareModalProperty(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/50">
                <div className="text-xs font-medium text-slate-500">Property</div>
                <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                  {shareModalProperty.title}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {formatPrice(shareModalProperty.price)}
                  </span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-500">
                    {shareModalProperty.visibility === 'private' ? '🔒 Off-Market Listing' : '🌐 Public Listing'}
                  </span>
                </div>
              </div>

              {shareModalProperty.shareToken && shareModalProperty.isShareTokenActive ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Active Share URL
                    </label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={getFullShareUrl(shareModalProperty.shareToken)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs text-slate-700 select-all outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      />
                      <button
                        onClick={() => handleCopyLink(shareModalProperty.shareToken!)}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Status: <strong className="text-emerald-600 dark:text-emerald-400">Active</strong>
                    </span>
                    {shareModalProperty.shareTokenExpiresAt && (
                      <span>
                        Expires: {new Date(shareModalProperty.shareTokenExpiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                      href={`/properties/private/${shareModalProperty.shareToken}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Preview Client View
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleGenerateShareToken(shareModalProperty._id)}
                        disabled={shareLoading}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${shareLoading ? 'animate-spin' : ''}`} />
                        Regenerate
                      </button>

                      <button
                        onClick={() => handleRevokeShareToken(shareModalProperty._id)}
                        disabled={shareLoading}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 dark:border-slate-800">
                    <Lock className="mx-auto h-8 w-8 text-slate-400" />
                    <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                      No active share token
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">
                      Generate an exclusive unlisted URL to allow clients or investors to inspect this property without creating an account.
                    </p>

                    <div className="mt-4 flex items-center justify-center gap-2 text-xs">
                      <span className="text-slate-500">Validity:</span>
                      <select
                        value={expiresInDays}
                        onChange={(e) => setExpiresInDays(Number(e.target.value))}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        <option value={7}>7 Days</option>
                        <option value={14}>14 Days</option>
                        <option value={30}>30 Days</option>
                        <option value={90}>90 Days</option>
                        <option value={365}>1 Year</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleGenerateShareToken(shareModalProperty._id)}
                      disabled={shareLoading}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      {shareLoading ? 'Generating...' : 'Generate Secure Share Link'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
