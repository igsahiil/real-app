'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ShieldCheck, User, Mail, Lock, Phone, Building, FileCheck, MapPin, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterAgentPage() {
  const router = useRouter();
  const { registerAgent } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    agencyName: '',
    licenseNo: '',
    idProofUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136',
    address: '',
    bio: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerAgent(formData);
      router.push('/agent/properties');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Agent registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Apply for Agent Onboarding
          </h2>
          <p className="mt-1.5 text-xs text-slate-500">
            Join the verified broker directory. Accounts are reviewed by platform administrators before listing privileges activate.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800/60">
                <User className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Vikram Desai"
                  className="ml-2.5 w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800/60">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="vikram@agency.com"
                  className="ml-2.5 w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Phone Number
              </label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800/60">
                <Phone className="h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98250 11223"
                  className="ml-2.5 w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800/60">
                <Lock className="h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="ml-2.5 w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Agency / Firm Name
              </label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800/60">
                <Building className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.agencyName}
                  onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                  placeholder="Desai Real Estate Advisors"
                  className="ml-2.5 w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                RERA / Broker License Number
              </label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800/60">
                <FileCheck className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.licenseNo}
                  onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                  placeholder="RERA-GJ-2026-08129"
                  className="ml-2.5 w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Office Address / Locality
            </label>
            <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800/60">
              <MapPin className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Suite 302, Titanium City Centre, Anandnagar, Ahmedabad"
                className="ml-2.5 w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Professional Bio & Experience
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell clients and moderation team about your focus areas, years in market, and portfolio..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 placeholder-slate-400 outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Submitting Application...' : 'Submit Agent Application'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="border-t border-slate-100 pt-5 text-center text-xs text-slate-500 dark:border-slate-800">
          Already registered?{' '}
          <Link href="/login" className="font-semibold text-zinc-900 hover:underline dark:text-white">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
