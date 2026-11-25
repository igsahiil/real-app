'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  PlusCircle,
  User as UserIcon,
  Shield,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Home,
  Tag,
  Key,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[1500] w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/85">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link href="/" className="flex items-center">
            <div className="relative h-11 w-auto max-w-[210px] sm:max-w-[250px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/header-logo-light.png"
                alt="RV Group Property & Justice"
                className="h-11 w-auto max-w-full object-contain dark:hidden"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/header-logo-dark.png"
                alt="RV Group Property & Justice"
                className="hidden h-11 w-auto max-w-full object-contain dark:block"
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/properties?listingType=sale"
              className="text-sm font-medium text-slate-600 transition hover:text-black dark:text-slate-300 dark:hover:text-white"
            >
              Buy
            </Link>
            <Link
              href="/properties?listingType=rent"
              className="text-sm font-medium text-slate-600 transition hover:text-black dark:text-slate-300 dark:hover:text-white"
            >
              Rent
            </Link>
            <Link
              href="/properties?category=commercial"
              className="text-sm font-medium text-slate-600 transition hover:text-black dark:text-slate-300 dark:hover:text-white"
            >
              Commercial
            </Link>
            <Link
              href="/properties?category=plot_land"
              className="text-sm font-medium text-slate-600 transition hover:text-black dark:text-slate-300 dark:hover:text-white"
            >
              Plots &amp; Land
            </Link>
            {!user && (
              <Link
                href="/register-agent"
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 transition hover:text-black dark:text-slate-200 dark:hover:text-white"
              >
                <Shield className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                Agent Onboarding
              </Link>
            )}
            {user?.role === 'admin' && (
              <>
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 transition hover:text-black dark:text-slate-200 dark:hover:text-white"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/admin/agents"
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 transition hover:text-black dark:text-slate-300 dark:hover:text-white"
                >
                  <Shield className="h-4 w-4" />
                  Moderation
                </Link>
              </>
            )}
          </nav>

          {/* Right Controls: Desktop Auth & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Auth */}
            <div className="hidden md:flex md:items-center md:gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800">
                    <UserIcon className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-white">
                      {user.name}
                    </span>
                    <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white dark:bg-white dark:text-zinc-950">
                      {user.role}
                    </span>
                  </div>

                  {user.role === 'agent' && (
                    <Link
                      href="/agent/properties"
                      className="flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      Dashboard
                    </Link>
                  )}

                  <button
                    onClick={() => logout()}
                    className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800"
                    title="Log out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex min-h-[38px] items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <UserIcon className="h-4 w-4 text-slate-500" />
                    Sign In
                  </Link>

                  <Link
                    href="/agent/properties/new"
                    className="flex min-h-[38px] items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-black dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Post Property
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Post Property Shortcut */}
            <Link
              href="/agent/properties/new"
              className="flex min-h-[42px] items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-bold text-white shadow-sm md:hidden dark:bg-white dark:text-zinc-950"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Post</span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex min-h-[42px] min-w-[42px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 md:hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              aria-label="Open mobile navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sliding Navigation Drawer */}
      <div
        className={`fixed inset-0 z-[2000] transition-opacity md:hidden ${
          mobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {/* Darkened Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Slide-over Drawer Panel */}
        <div
          className={`fixed inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-[#1C2536] ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4 dark:border-slate-700/60">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
              <div className="relative h-9 w-auto max-w-[170px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/header-logo-light.png"
                  alt="RV Group Property & Justice"
                  className="h-9 w-auto max-w-full object-contain dark:hidden"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/header-logo-dark.png"
                  alt="RV Group Property & Justice"
                  className="hidden h-9 w-auto max-w-full object-contain dark:block"
                />
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Profile Summary (if logged in) */}
          {user && (
            <div className="border-b border-slate-100 bg-slate-50/70 p-4 dark:border-slate-700/60 dark:bg-[#0E1626]/50">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              <span className="mt-1.5 inline-block rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase text-white dark:bg-white dark:text-zinc-950">
                {user.role}
              </span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[42px] items-center gap-3 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-black dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Home className="h-4 w-4 text-slate-400" />
              <span>Home</span>
            </Link>

            <Link
              href="/properties?listingType=sale"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[42px] items-center gap-3 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-black dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Tag className="h-4 w-4 text-slate-400" />
              <span>Buy Properties</span>
            </Link>

            <Link
              href="/properties?listingType=rent"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[42px] items-center gap-3 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-black dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Key className="h-4 w-4 text-slate-400" />
              <span>Rent Properties</span>
            </Link>

            <Link
              href="/properties?category=commercial"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[42px] items-center gap-3 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-black dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Building2 className="h-4 w-4 text-slate-400" />
              <span>Commercial Real Estate</span>
            </Link>

            <Link
              href="/properties?category=plot_land"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[42px] items-center gap-3 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100 hover:text-black dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Layers className="h-4 w-4 text-slate-400" />
              <span>Plots, Land &amp; Farms</span>
            </Link>

            {!user && (
              <Link
                href="/register-agent"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[42px] items-center gap-3 rounded-xl px-3 py-2 text-slate-900 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Shield className="h-4 w-4 text-slate-500" />
                <span>Agent Onboarding</span>
              </Link>
            )}

            {user?.role === 'agent' && (
              <Link
                href="/agent/properties"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[42px] items-center gap-3 rounded-xl px-3 py-2 text-slate-900 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <LayoutDashboard className="h-4 w-4 text-slate-500" />
                <span>Agent Dashboard</span>
              </Link>
            )}

            {user?.role === 'admin' && (
              <>
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[42px] items-center gap-3 rounded-xl px-3 py-2 text-slate-900 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <LayoutDashboard className="h-4 w-4 text-slate-500" />
                  <span>Admin Dashboard</span>
                </Link>
                <Link
                  href="/admin/properties"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[42px] items-center gap-3 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Shield className="h-4 w-4 text-slate-400" />
                  <span>Property Moderation</span>
                </Link>
              </>
            )}
          </nav>

          {/* Drawer Bottom Actions */}
          <div className="border-t border-slate-100 p-4 dark:border-slate-700/60 space-y-2">
            <Link
              href="/agent/properties/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-2.5 text-xs font-bold text-white shadow-md hover:bg-black transition dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post Free Property Listing</span>
            </Link>

            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <UserIcon className="h-4 w-4" />
                <span>Account Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
      {pathname !== '/' && <div className="h-16 shrink-0" aria-hidden="true" />}
    </>
  );
}
