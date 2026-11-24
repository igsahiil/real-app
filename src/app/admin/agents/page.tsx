'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminDataTable } from '@/components/admin/ui/AdminDataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  X,
  AlertCircle,
  Mail,
  Phone,
} from 'lucide-react';

interface AgentRow {
  _id: string;
  agencyName?: string;
  licenseNo?: string;
  idProofUrl?: string;
  address?: string;
  bio?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectionReason?: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
}

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modals
  const [selectedAgent, setSelectedAgent] = useState<AgentRow | null>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; agentId: string | null; reason: string }>({
    open: false,
    agentId: null,
    reason: '',
  });

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        statusFilter === 'all'
          ? '/api/v1/admin/agents'
          : `/api/v1/admin/agents?status=${statusFilter}`;
      const res = await api.get(url);
      setAgents(res.data.data || []);
    } catch {
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleApprove = async (agentId: string) => {
    setActionLoading(agentId);
    try {
      await api.patch(`/api/v1/admin/agents/${agentId}/verify`, { status: 'approved' });
      fetchAgents();
      if (selectedAgent?._id === agentId) setSelectedAgent(null);
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
    if (!rejectModal.agentId || !rejectModal.reason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }
    setActionLoading(rejectModal.agentId);
    try {
      await api.patch(`/api/v1/admin/agents/${rejectModal.agentId}/verify`, {
        status: 'rejected',
        rejectionReason: rejectModal.reason,
      });
      setRejectModal({ open: false, agentId: null, reason: '' });
      fetchAgents();
      if (selectedAgent?._id === rejectModal.agentId) setSelectedAgent(null);
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

  const filteredAgents = agents.filter((ag) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      ag.userId?.name?.toLowerCase().includes(q) ||
      ag.userId?.email?.toLowerCase().includes(q) ||
      ag.agencyName?.toLowerCase().includes(q) ||
      ag.licenseNo?.toLowerCase().includes(q)
    );
  });

  const pendingCount = agents.filter((a) => a.verificationStatus === 'pending').length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Broker & Agent Verification Queue"
        subtitle="Validate agent identity proof, RERA registration numbers, and agency licenses."
        icon={ShieldCheck}
        actions={
          <button
            onClick={fetchAgents}
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
          placeholder: 'Search by broker name, agency, RERA...',
        }}
        tabs={{
          items: [
            { id: 'pending', label: 'Pending KYC', count: pendingCount },
            { id: 'approved', label: 'Verified Brokers' },
            { id: 'rejected', label: 'Rejected' },
            { id: 'all', label: 'All Records' },
          ],
          activeId: statusFilter,
          onChange: setStatusFilter,
        }}
        loading={loading}
        empty={
          filteredAgents.length === 0
            ? {
                icon: ShieldCheck,
                title: 'No broker applications found',
                description: `There are currently no agents matching the "${statusFilter}" filter criteria.`,
              }
            : undefined
        }
      >
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200/80 bg-slate-50/50 text-slate-500 uppercase tracking-wider dark:border-slate-700/60 dark:bg-[#0E1626]/40 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Broker Details</th>
              <th className="px-5 py-3.5 font-semibold">Agency &amp; RERA</th>
              <th className="px-5 py-3.5 font-semibold">Contact</th>
              <th className="px-5 py-3.5 font-semibold">KYC Status</th>
              <th className="px-5 py-3.5 font-semibold">Applied</th>
              <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
            {filteredAgents.map((ag) => (
              <tr key={ag._id} className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-xs font-bold text-white shadow-sm">
                      {ag.userId?.name?.slice(0, 2).toUpperCase() || 'AG'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {ag.userId?.name || 'Unnamed Agent'}
                      </p>
                      <p className="text-[11px] text-slate-400">{ag.userId?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {ag.agencyName || 'Independent Broker'}
                  </p>
                  <p className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                    {ag.licenseNo ? `RERA: ${ag.licenseNo}` : 'No RERA declared'}
                  </p>
                </td>
                <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                  <div className="space-y-0.5">
                    {ag.userId?.phone && (
                      <p className="flex items-center gap-1.5 tabular-nums">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{ag.userId.phone}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-slate-400" />
                      <span className="truncate max-w-[150px]">{ag.userId?.email}</span>
                    </p>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={ag.verificationStatus} />
                </td>
                <td className="px-5 py-4 text-slate-400 tabular-nums">
                  {new Date(ag.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setSelectedAgent(ag)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                      title="Inspect KYC Credentials"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {ag.verificationStatus !== 'approved' && (
                      <button
                        onClick={() => handleApprove(ag._id)}
                        disabled={actionLoading === ag._id}
                        className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-500/15 dark:text-emerald-400"
                        title="Approve Broker"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {ag.verificationStatus !== 'rejected' && (
                      <button
                        onClick={() =>
                          setRejectModal({
                            open: true,
                            agentId: ag._id,
                            reason: '',
                          })
                        }
                        disabled={actionLoading === ag._id}
                        className="flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-500/15 dark:text-rose-400"
                        title="Reject Broker"
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

      {/* KYC Document & Profile Inspection Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedAgent(null)}
          />
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl dark:border-slate-700/60 dark:bg-[#1C2536]">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-bold text-white shadow-sm">
                  {selectedAgent.userId?.name?.slice(0, 2).toUpperCase() || 'AG'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedAgent.userId?.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedAgent.agencyName || 'Independent Broker'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="flex min-h-[42px] min-w-[42px] items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* KYC Details Grid */}
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-[#0E1626]/60">
                <div>
                  <span className="text-[11px] text-slate-400">RERA License</span>
                  <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {selectedAgent.licenseNo || 'Not Provided'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">KYC Status</span>
                  <div className="mt-0.5">
                    <StatusBadge status={selectedAgent.verificationStatus} />
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Direct Phone</span>
                  <p className="text-xs font-semibold tabular-nums text-slate-900 dark:text-white">
                    {selectedAgent.userId?.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Email Address</span>
                  <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                    {selectedAgent.userId?.email}
                  </p>
                </div>
              </div>

              {/* ID Proof Document Section */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Government ID Proof / License Document
                </h4>
                {selectedAgent.idProofUrl ? (
                  <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedAgent.idProofUrl}
                      alt="Agent ID Proof"
                      className="max-h-64 w-full object-cover"
                    />
                    <div className="bg-slate-50 p-2.5 text-center dark:bg-slate-800">
                      <a
                        href={selectedAgent.idProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        Open Full Resolution Document &rarr;
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400 dark:border-slate-700">
                    No document attachment was uploaded with this application.
                  </div>
                )}
              </div>

              {/* Bio & Address */}
              {selectedAgent.bio && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Broker Bio</h4>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    {selectedAgent.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-700/60">
              {selectedAgent.verificationStatus !== 'approved' && (
                <button
                  onClick={() => handleApprove(selectedAgent._id)}
                  disabled={actionLoading === selectedAgent._id}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  Approve Verification
                </button>
              )}
              {selectedAgent.verificationStatus !== 'rejected' && (
                <button
                  onClick={() =>
                    setRejectModal({
                      open: true,
                      agentId: selectedAgent._id,
                      reason: '',
                    })
                  }
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
                >
                  Reject Application
                </button>
              )}
              <button
                onClick={() => setSelectedAgent(null)}
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
            onClick={() => setRejectModal({ open: false, agentId: null, reason: '' })}
          />
          <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl dark:border-slate-700/60 dark:bg-[#1C2536]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Reject Broker Application
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  State the reason for rejecting the broker&apos;s KYC.
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
                placeholder="e.g. Expired RERA registration, unreadable ID proof, or invalid agency credentials..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-none focus:border-rose-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-white"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRejectModal({ open: false, agentId: null, reason: '' })}
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
