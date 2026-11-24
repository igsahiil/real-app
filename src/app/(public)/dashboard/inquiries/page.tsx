'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Clock, Building, ArrowUpRight, MessageSquare } from 'lucide-react';

interface InquiryItem {
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
    location: { city: string; locality: string };
  };
  agentId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
}

export default function UserInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/inquiries/my');
      setInquiries(res.data.data || []);
    } catch {
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          My Sent Inquiries
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track callback requests, inquiries, and communication with verified listing agents.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <span className="text-sm text-slate-500">Loading inquiries...</span>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white text-center dark:border-slate-800 dark:bg-slate-900">
            <MessageSquare className="h-10 w-10 text-slate-400" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
              No inquiries sent yet
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              When you inquire about a property, your communication history will appear here.
            </p>
          </div>
        ) : (
          inquiries.map((inq) => (
            <div
              key={inq._id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
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
                    Status: {inq.status}
                  </span>

                  {inq.propertyId && (
                    <Link
                      href={`/properties/${inq.propertyId.slug}`}
                      className="mt-2 flex items-center gap-1.5 text-base font-bold text-slate-900 hover:text-indigo-600 dark:text-white"
                    >
                      <span>{inq.propertyId.title}</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>

                <div className="text-xs text-slate-400">
                  Sent on {new Date(inq.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                <p><strong>Your Message:</strong> &ldquo;{inq.message}&rdquo;</p>
                {inq.preferredTime && (
                  <p className="mt-1.5 text-slate-500">Preferred Contact Time: {inq.preferredTime}</p>
                )}
              </div>

              {inq.agentId && (
                <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
                  <Building className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Agent: <strong>{inq.agentId.name}</strong></span>
                  {inq.agentId.phone && <span>&bull; {inq.agentId.phone}</span>}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
