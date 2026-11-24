'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ShieldAlert, Loader2 } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (pathname === '/admin/login') {
        if (user && user.role === 'admin') {
          router.replace('/admin/dashboard');
        }
        return;
      }

      if (!user) {
        router.replace('/admin/login?error=unauthorized');
      } else if (user.role !== 'admin') {
        router.replace('/admin/login?error=forbidden');
      }
    }
  }, [user, loading, router, pathname]);

  // Bypass guard on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-[#0E1626]">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Verifying Admin Session...
          </p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-[#0E1626]">
        <div className="flex flex-col items-center gap-3 text-center">
          <ShieldAlert className="h-10 w-10 text-rose-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Redirecting to Admin Login...</h2>
          <p className="max-w-xs text-xs text-slate-500">
            Administrator credentials required. Redirecting to admin authentication...
          </p>
          <a
            href="/admin/login?error=forbidden"
            className="mt-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700"
          >
            Go to Admin Login
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
