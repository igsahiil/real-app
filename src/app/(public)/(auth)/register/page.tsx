'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { User, Mail, Lock, Phone, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerUser(formData);
      router.push('/');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center">
          <div className="mx-auto relative h-14 w-14 overflow-hidden rounded-full border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-light.png" alt="RV Group Ltd" className="h-full w-full object-cover dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-dark.png" alt="RV Group Ltd" className="hidden h-full w-full object-cover dark:block" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-1.5 text-xs text-slate-500">
            Save favorite listings, send verified inquiries, and track properties
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
              Full Name
            </label>
            <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800/60">
              <User className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Rohan Patel"
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
                placeholder="rohan@example.com"
                className="ml-2.5 w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-white"
              />
            </div>
          </div>

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
                placeholder="+91 9876543210"
                className="ml-2.5 w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Password (min 6 characters)
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

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-black disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="border-t border-slate-100 pt-5 text-center text-xs text-slate-500 dark:border-slate-800">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-zinc-900 hover:underline dark:text-white">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
