'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Lock, Mail, ArrowRight, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const errorParam = searchParams.get('error');
  const redirectParam = searchParams.get('redirect') || '/admin/dashboard';

  const [email, setEmail] = useState('admin@rvgroupltd.com');
  const [password, setPassword] = useState('Admin@12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === 'forbidden'
      ? 'Access Denied (403 Forbidden): Administrator privileges required. Please sign in with an admin account.'
      : errorParam === 'unauthorized'
        ? 'Your session has expired (401 Unauthorized). Please sign in to continue.'
        : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.user.role !== 'admin') {
        setError('Access denied: your account does not hold administrator privileges.');
        return;
      }
      const destination = redirectParam.startsWith('/admin') ? redirectParam : '/admin/dashboard';
      router.push(destination);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Invalid administrator credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-[#0E1626]">
      <div className="w-full max-w-md">
        {/* Top Return Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-black dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to Public Portal
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl dark:border-slate-700/60 dark:bg-[#1C2536]">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-slate-300 bg-white shadow-lg dark:border-slate-700 dark:bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-light.png" alt="RV Group Ltd" className="h-full w-full object-cover dark:hidden" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-dark.png" alt="RV Group Ltd" className="hidden h-full w-full object-cover dark:block" />
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              RV GROUP <span className="text-sm font-bold text-slate-500 dark:text-slate-400">ADMIN</span>
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Property &amp; Justice Administration &amp; Moderation Suite
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-rose-500/20 bg-rose-50 p-3.5 text-xs font-medium text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Administrator Email
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rvgroupltd.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pr-4 pl-10 text-xs text-slate-900 outline-none transition focus:border-black focus:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:focus:border-white dark:focus:bg-[#0E1626]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Master Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pr-4 pl-10 text-xs text-slate-900 outline-none transition focus:border-black focus:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:focus:border-white dark:focus:bg-[#0E1626]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white shadow-md transition hover:bg-black disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Admin Suite</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>


        </div>

        {/* Security Footer Note */}
        <p className="mt-6 text-center text-[11px] text-slate-400">
          Protected by Argon2id cryptographic hashing &amp; fastify-rate-limit.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0E1626]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
