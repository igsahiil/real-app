'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // If viewing the dedicated admin login page, bypass sidebar/header layout
  if (pathname === '/admin/login') {
    return (
      <AdminGuard>
        {children}
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-900 dark:bg-[#0E1626] dark:text-slate-100">
        {/* Left Sidebar */}
        <AdminSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Right Shell: Header + Scrollable Workspace */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AdminHeader
            setMobileOpen={setMobileOpen}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
