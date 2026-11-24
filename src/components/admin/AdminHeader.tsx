'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Menu,
  Search,
  Bell,
  Globe,
  ChevronRight,
  LogOut,
  Shield,
  Layers,
} from 'lucide-react';

interface AdminHeaderProps {
  setMobileOpen: (v: boolean) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export function AdminHeader({
  setMobileOpen,
  collapsed,
  setCollapsed,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Breadcrumb mapping
  const getBreadcrumbs = () => {
    const parts = [{ label: 'Admin', href: '/admin/dashboard' }];
    if (pathname.includes('/properties')) {
      parts.push({ label: 'Moderation', href: '/admin/properties' });
      parts.push({ label: 'Listing Review', href: '/admin/properties' });
    } else if (pathname.includes('/agents')) {
      parts.push({ label: 'Verification', href: '/admin/agents' });
      parts.push({ label: 'Broker KYC', href: '/admin/agents' });
    } else if (pathname.includes('/users')) {
      parts.push({ label: 'Management', href: '/admin/users' });
      parts.push({ label: 'User Directory', href: '/admin/users' });
    } else if (pathname.includes('/master-data')) {
      parts.push({ label: 'Taxonomy', href: '/admin/master-data' });
      parts.push({ label: 'Master Data', href: '/admin/master-data' });
    } else {
      parts.push({ label: 'Overview', href: '/admin/dashboard' });
      parts.push({ label: 'Analytics Dashboard', href: '/admin/dashboard' });
    }
    return parts;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8 dark:border-slate-700/60 dark:bg-[#1C2536]/95">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex min-h-[42px] min-w-[42px] items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop Sidebar Toggle icon */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:block dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <Layers className="h-4 w-4" />
        </button>

        {/* Breadcrumb Path */}
        <nav className="hidden items-center gap-1.5 text-xs font-medium sm:flex">
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={bc.label}>
              {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-400 dark:text-slate-600" />}
              <span
                className={
                  idx === breadcrumbs.length - 1
                    ? 'font-bold text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }
              >
                {bc.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center: Global Search Input */}
      <div className="mx-4 hidden max-w-xs flex-1 md:block lg:max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search listings, brokers, users (Ctrl+K)..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-1.5 pr-3 pl-9 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-zinc-900 focus:bg-white dark:border-slate-700/60 dark:bg-slate-900/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-white dark:focus:bg-[#0E1626]"
          />
        </div>
      </div>

      {/* Right: Actions, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* View Live Consumer Portal */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:flex dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
          title="Open live public portal in new tab"
        >
          <Globe className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
          <span>Live Site</span>
        </Link>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Moderation Alerts"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500" />
          </button>
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdown(!profileDropdown)}
            className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-xs font-bold text-white shadow-sm dark:bg-white dark:text-zinc-950">
              {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="hidden text-left sm:block">
              <p className="max-w-[100px] truncate text-xs font-bold text-slate-900 dark:text-white">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Super Admin</p>
            </div>
          </button>

          {profileDropdown && (
            <div
              className="absolute top-full right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700/60 dark:bg-[#1C2536]"
              onMouseLeave={() => setProfileDropdown(false)}
            >
              <div className="border-b border-slate-100 p-2.5 dark:border-slate-700/60">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">{user?.email}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                  <Shield className="h-3 w-3" />
                  Administrator
                </div>
              </div>

              <div className="p-1">
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60"
                >
                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                  View Consumer Website
                </Link>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
