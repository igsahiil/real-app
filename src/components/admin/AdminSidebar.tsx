'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Users,
  Database,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  X,
} from 'lucide-react';

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export function AdminSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [pendingCounts, setPendingCounts] = useState<{ agents: number; properties: number }>({
    agents: 0,
    properties: 0,
  });

  // Track counts for badges
  useEffect(() => {
    let isMounted = true;
    const fetchCounts = async () => {
      try {
        const res = await api.get('/api/v1/admin/stats');
        if (isMounted && res.data?.data?.metrics) {
          setPendingCounts({
            agents: res.data.data.metrics.pendingAgents || 0,
            properties: res.data.data.metrics.pendingProperties || 0,
          });
        }
      } catch {
        // Silently continue
      }
    };
    fetchCounts();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // Sync theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.remove('dark');
        setTheme('light');
      } else {
        root.classList.add('dark');
        setTheme('dark');
      }
    }
  };

  const navGroups = [
    {
      label: 'Core',
      items: [
        {
          name: 'Dashboard',
          href: '/admin/dashboard',
          icon: LayoutDashboard,
          badge: null,
        },
      ],
    },
    {
      label: 'Moderation & Queues',
      items: [
        {
          name: 'Property Queue',
          href: '/admin/properties',
          icon: Building2,
          badge: pendingCounts.properties > 0 ? pendingCounts.properties : null,
          badgeTone: 'amber',
        },
        {
          name: 'Agent Verification',
          href: '/admin/agents',
          icon: ShieldCheck,
          badge: pendingCounts.agents > 0 ? pendingCounts.agents : null,
          badgeTone: 'amber',
        },
      ],
    },
    {
      label: 'Management',
      items: [
        {
          name: 'User Directory',
          href: '/admin/users',
          icon: Users,
          badge: null,
        },
        {
          name: 'Master Data',
          href: '/admin/master-data',
          icon: Database,
          badge: null,
        },
      ],
    },
    {
      label: 'Live Portal',
      items: [
        {
          name: 'View Consumer Site',
          href: '/',
          icon: ExternalLink,
          external: true,
          badge: null,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between">
      {/* Brand & Collapse Header */}
      <div>
        <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-4 dark:border-slate-700/60">
          <Link href="/admin/dashboard" className="flex items-center overflow-hidden">
            {collapsed ? (
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-light.png" alt="RV Group Ltd" className="h-full w-full object-cover dark:hidden" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-dark.png" alt="RV Group Ltd" className="hidden h-full w-full object-cover dark:block" />
              </div>
            ) : (
              <div className="relative h-9 w-auto max-w-[170px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/header-logo-light.png" alt="RV Group Property & Justice" className="h-9 w-auto max-w-full object-contain dark:hidden" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/header-logo-dark.png" alt="RV Group Property & Justice" className="hidden h-9 w-auto max-w-full object-contain dark:block" />
              </div>
            )}
          </Link>

          {/* Desktop Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:block dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 space-y-6 px-3">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.label}
                </p>
              )}
              <div className="mt-1 space-y-1">
                {group.items.map((item) => {
                  const isExternal = 'external' in item && Boolean(item.external);
                  const isActive = !isExternal && pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                        isActive
                          ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-950'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
                      }`}
                      title={collapsed ? item.name : undefined}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white dark:text-zinc-950' : 'text-slate-400 group-hover:text-black dark:text-slate-400 dark:group-hover:text-white'}`} />
                      {!collapsed && <span className="flex-1 truncate">{item.name}</span>}
                      {!collapsed && item.badge !== null && (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold tabular-nums text-amber-600 dark:text-amber-400">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Profile & Actions Card */}
      <div className="border-t border-slate-200/80 p-3 dark:border-slate-700/60">
        {!collapsed ? (
          <div className="rounded-xl border border-slate-200/60 bg-slate-50/80 p-3 dark:border-slate-700/40 dark:bg-[#0E1626]/50">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-xs font-bold text-white shadow-sm dark:bg-zinc-800">
                {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                  {user?.name || 'Administrator'}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10.5px] font-medium text-emerald-600 dark:text-emerald-400">
                    Super Admin
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2.5 dark:border-slate-700/40">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-white hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white shadow-sm dark:bg-zinc-800"
              title={user?.name || 'Administrator'}
            >
              {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={logout}
              className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden shrink-0 border-r border-slate-200/80 bg-white transition-all duration-200 lg:block dark:border-slate-700/60 dark:bg-[#1C2536] ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex w-72 flex-col border-r border-slate-200/80 bg-white shadow-2xl dark:border-slate-700/60 dark:bg-[#1C2536]">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
