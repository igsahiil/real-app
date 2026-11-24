'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.user.role === 'admin') {
        router.push('/admin/agents');
      } else if (data.user.role === 'agent') {
        router.push('/agent/properties');
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center">
          <div className="mx-auto bg-white shadow-sm dark:border-slate-700 dark:bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/header-logo-light.png" alt="RV Group Ltd" className="h-full w-full  dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/header-logo-dark.png" alt="RV Group Ltd" className="hidden h-full w-full  dark:block" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-1.5 text-xs text-slate-500">
            Access listings, management tools, and inquiry inboxes
          </p>
        </div>
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800/60">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="ml-2.5 w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-black disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="flex flex-col gap-2 border-t border-slate-100 pt-5 text-center text-xs text-slate-500 dark:border-slate-800">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-zinc-900 hover:underline dark:text-white">
              Sign up as buyer/renter
            </Link>
          </p>
          <p>
            Are you a broker or agency?{' '}
            <Link href="/register-agent" className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400">
              Apply for Agent Onboarding
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
