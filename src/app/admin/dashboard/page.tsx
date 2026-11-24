'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/ui/AdminStatCard';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import {
  LayoutDashboard,
  Users,
  Building2,
  ShieldCheck,
  MessageSquare,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
  FileText,
} from 'lucide-react';

interface DashboardStats {
  metrics: {
    totalUsers: number;
    totalAgents: number;
    pendingAgents: number;
    totalProperties: number;
    approvedProperties: number;
    pendingProperties: number;
    totalInquiries: number;
  };
  recentProperties: Array<{
    _id: string;
    title: string;
    price: number;
    status: string;
    category?: string;
    listingType?: string;
    location: { city: string; locality: string };
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/admin/stats');
      setStats(res.data.data);
    } catch (err: unknown) {
      setStats(null);
      const errorObj = err as { status?: number; code?: string };
      if (
        errorObj?.status === 403 ||
        errorObj?.code === 'FORBIDDEN' ||
        errorObj?.status === 401 ||
        errorObj?.code === 'UNAUTHORIZED'
      ) {
        router.replace('/admin/login?error=forbidden');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Demo Activity Log feed following GEMINI.md timeline specs
  const activities = [
    {
      id: '1',
      title: 'Agent KYC Submitted',
      subtext: 'RERA verification request for Patel Realty',
      time: '12m ago',
      tone: 'amber' as const,
      icon: ShieldCheck,
      highlight: 'Awaiting Document Review',
    },
    {
      id: '2',
      title: 'Listing Approved',
      subtext: '4 BHK Luxury Sky Villa, SG Highway',
      time: '1h ago',
      tone: 'emerald' as const,
      icon: CheckCircle,
      highlight: 'Published to Public Catalog',
    },
    {
      id: '3',
      title: 'Inquiry Volume Spike',
      subtext: '14 new callback inquiries on Commercial Offices',
      time: '3h ago',
      tone: 'indigo' as const,
      icon: MessageSquare,
      highlight: 'Pace: +22% vs yesterday',
    },
    {
      id: '4',
      title: 'Broker Rejection',
      subtext: 'Invalid GSTIN on Shree Properties onboarding',
      time: '5h ago',
      tone: 'rose' as const,
      icon: ShieldAlert,
      highlight: 'Notice Email Dispatched',
    },
  ];

  const TONE_CLASSES = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    indigo: 'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-400',
    rose: 'bg-rose-50 text-rose-500 dark:bg-rose-500/15 dark:text-rose-400',
    slate: 'bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400',
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <AdminPageHeader
        title="Platform Administration & Analytics"
        subtitle="Real-time pulse of broker verification, property moderation queues, and buyer inquiries."
        icon={LayoutDashboard}
        actions={
          <button
            onClick={fetchStats}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        }
      />

      {/* KPI Stat Cards Grid (4 columns) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          title="Total Users"
          value={stats?.metrics.totalUsers ?? '...'}
          subtitle="Registered buyers and sellers"
          icon={Users}
          tone="indigo"
          badge={{ text: 'Active Directory', tone: 'indigo' }}
        />
        <AdminStatCard
          title="Verified Brokers"
          value={stats?.metrics.totalAgents ?? '...'}
          subtitle={`${stats?.metrics.pendingAgents ?? 0} applications in queue`}
          icon={ShieldCheck}
          tone={stats && stats.metrics.pendingAgents > 0 ? 'amber' : 'emerald'}
          badge={
            stats && stats.metrics.pendingAgents > 0
              ? { text: `${stats.metrics.pendingAgents} Pending KYC`, tone: 'amber' }
              : { text: 'All Verified', tone: 'emerald' }
          }
        />
        <AdminStatCard
          title="Listed Properties"
          value={stats?.metrics.totalProperties ?? '...'}
          subtitle={`${stats?.metrics.approvedProperties ?? 0} active live listings`}
          icon={Building2}
          tone={stats && stats.metrics.pendingProperties > 0 ? 'amber' : 'emerald'}
          badge={
            stats && stats.metrics.pendingProperties > 0
              ? { text: `${stats.metrics.pendingProperties} Pending Review`, tone: 'amber' }
              : { text: 'Queue Clean', tone: 'emerald' }
          }
        />
        <AdminStatCard
          title="Buyer Inquiries"
          value={stats?.metrics.totalInquiries ?? '...'}
          subtitle="Direct broker connection leads"
          icon={MessageSquare}
          tone="emerald"
          badge={{ text: 'Healthy Lead Flow', tone: 'emerald' }}
        />
      </div>

      {/* 2-Column Dashboard Layout (Left: Moderation Queue, Right: 380px Activity Log) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Left Column: Moderation Priority Queue */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-[#1C2536]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-700/60">
              <div>
                <h3 className="text-[15px] font-semibold text-slate-800 dark:text-white">
                  Recent Submissions & Moderation
                </h3>
                <p className="text-[12.5px] text-slate-400 dark:text-slate-500">
                  Latest properties submitted by verified agents for platform review
                </p>
              </div>
              <Link
                href="/admin/properties"
                className="flex items-center gap-1 text-xs font-semibold text-amber-600 transition hover:text-amber-700 dark:text-amber-400"
              >
                <span>Full Queue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <span className="text-xs text-slate-400">Loading moderation records...</span>
              </div>
            ) : !stats || stats.recentProperties.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center p-6 text-center">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
                <p className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
                  Moderation queue is clean
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  All submitted properties have been reviewed and resolved.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50/60 text-slate-500 uppercase tracking-wider dark:border-slate-700/60 dark:bg-[#0E1626]/40 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Property Title</th>
                      <th className="px-5 py-3 font-semibold">Location</th>
                      <th className="px-5 py-3 font-semibold">Price</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                    {stats.recentProperties.slice(0, 6).map((prop) => (
                      <tr key={prop._id} className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {prop.title}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                          {prop.location?.locality}, {prop.location?.city}
                        </td>
                        <td className="px-5 py-3.5 font-bold tabular-nums text-slate-900 dark:text-white">
                          {formatPrice(prop.price)}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={prop.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href="/admin/properties"
                            className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-400"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Action Hub */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/admin/agents"
              className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-amber-300 hover:shadow-md dark:border-slate-700/60 dark:bg-[#1C2536] dark:hover:border-amber-500/50"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Broker KYC Verification
                  </h4>
                  <p className="text-[12px] text-slate-400 dark:text-slate-500">
                    Review RERA credentials &amp; ID proof
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
            </Link>

            <Link
              href="/admin/master-data"
              className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-amber-300 hover:shadow-md dark:border-slate-700/60 dark:bg-[#1C2536] dark:hover:border-amber-500/50"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Taxonomy &amp; Master Data
                  </h4>
                  <p className="text-[12px] text-slate-400 dark:text-slate-500">
                    Cities, localities, types &amp; amenities
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
            </Link>
          </div>
        </div>

        {/* Right Column: 380px Timeline List Card (GEMINI.md specs) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-[#1C2536]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-700/60">
              <div>
                <h3 className="text-[15px] font-semibold text-slate-800 dark:text-white">
                  Activity log
                </h3>
                <p className="text-[12.5px] text-slate-400 dark:text-slate-500">
                  Real-time platform audit trail
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                Live Feed
              </span>
            </div>

            {/* List Rows with circular icon pills & vertical connector line */}
            <div className="relative mt-4 space-y-4">
              {activities.map((act, index) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="relative flex items-start gap-3">
                    {/* Vertical Connector Line */}
                    {index < activities.length - 1 && (
                      <span
                        className="absolute top-9 left-4 -ml-px h-full w-px bg-slate-100 dark:bg-slate-700/70"
                        aria-hidden="true"
                      />
                    )}

                    {/* Circular Icon Pill */}
                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONE_CLASSES[act.tone]}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                          {act.title}
                        </p>
                        <span className="text-[11px] font-medium text-slate-400 tabular-nums dark:text-slate-500">
                          {act.time}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11.5px] text-slate-500 dark:text-slate-400">
                        {act.subtext}
                      </p>
                      <p
                        className={`mt-1 text-[11px] font-medium ${
                          act.tone === 'amber'
                            ? 'text-amber-600 dark:text-amber-400'
                            : act.tone === 'emerald'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : act.tone === 'rose'
                            ? 'text-rose-500 dark:text-rose-400'
                            : 'text-indigo-500 dark:text-indigo-400'
                        }`}
                      >
                        {act.highlight}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Health Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-[#1C2536]">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-semibold text-slate-700 dark:text-slate-300">
                Core Engine Status
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Operational
              </span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Fastify Backend API:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Port 5000 (v1)</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>MongoDB Cluster:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Connected (Replica)</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Geospatial Indexing:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">2dsphere Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
