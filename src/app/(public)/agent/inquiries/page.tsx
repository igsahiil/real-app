'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { MessageSquare, Phone, Mail, Clock, CheckCircle2, Building } from 'lucide-react';

interface AgentInquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredTime?: string;
  status: 'new' | 'contacted' | 'closed';
  notes?: string;
  propertyId?: {
    _id: string;
    title: string;
    slug: string;
  };
  createdAt: string;
}

export default function AgentInquiriesPage() {
  const [inquiries, setInquiries] = useState<AgentInquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'all'
        ? '/api/v1/agent/inquiries'
        : `/api/v1/agent/inquiries?status=${statusFilter}`;
      const res = await api.get(url);
      setInquiries(res.data.data || []);
    } catch {
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleUpdateStatus = async (id: string, newStatus: 'contacted' | 'closed') => {
    setActionLoading(id);
    try {
      await api.patch(`/api/v1/agent/inquiries/${id}/status`, { status: newStatus });
      fetchInquiries();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Update failed';
      alert(msg);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Lead Management Inbox
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor client inquiries, schedule site visits, and update lead conversion statuses.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {(['all', 'new', 'contacted', 'closed'] as const).map((tab) => (
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
      </div>

      {/* Leads List */}
      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <span className="text-sm text-slate-500">Loading leads...</span>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white text-center dark:border-slate-800 dark:bg-slate-900">
            <MessageSquare className="h-10 w-10 text-slate-400" />
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              No leads found in &ldquo;{statusFilter}&rdquo; status
            </p>
          </div>
        ) : (
          inquiries.map((inq) => (
            <div
              key={inq._id}
              className="flex flex-col justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {inq.name}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                      inq.status === 'contacted'
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : inq.status === 'closed'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    {inq.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-indigo-500" />
                    <span>{inq.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-indigo-500" />
                    <span>{inq.email}</span>
                  </div>
                  {inq.preferredTime && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{inq.preferredTime}</span>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                  &ldquo;{inq.message}&rdquo;
                </div>

                {inq.propertyId && (
                  <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400">
                    <Building className="h-3.5 w-3.5" />
                    <Link href={`/properties/${inq.propertyId.slug}`} className="hover:underline">
                      Inquired regarding: <strong>{inq.propertyId.title}</strong>
                    </Link>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {inq.status === 'new' && (
                  <button
                    onClick={() => handleUpdateStatus(inq._id, 'contacted')}
                    disabled={actionLoading === inq._id}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Contacted
                  </button>
                )}

                {inq.status !== 'closed' && (
                  <button
                    onClick={() => handleUpdateStatus(inq._id, 'closed')}
                    disabled={actionLoading === inq._id}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 disabled:opacity-50"
                  >
                    Close Lead
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
