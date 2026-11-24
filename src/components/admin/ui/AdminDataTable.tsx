import React from 'react';
import { Search, LucideIcon, Inbox } from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface AdminDataTableProps {
  search?: {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
  };
  tabs?: {
    items: TabItem[];
    activeId: string;
    onChange: (id: string) => void;
  };
  actions?: React.ReactNode;
  loading?: boolean;
  empty?: {
    icon?: LucideIcon;
    title: string;
    description: string;
  };
  children: React.ReactNode;
}

export function AdminDataTable({
  search,
  tabs,
  actions,
  loading,
  empty,
  children,
}: AdminDataTableProps) {
  const EmptyIcon = empty?.icon || Inbox;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/60 dark:bg-[#1C2536]">
      {/* Controls Bar: Tabs, Search, Actions */}
      {(tabs || search || actions) && (
        <div className="flex flex-col gap-3 border-b border-slate-200/80 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/60">
          {/* Tabs */}
          {tabs && (
            <div className="flex flex-wrap items-center gap-1.5">
              {tabs.items.map((tab) => {
                const isActive = tab.id === tabs.activeId;
                return (
                  <button
                    key={tab.id}
                    onClick={() => tabs.onChange(tab.id)}
                    className={`flex min-h-[38px] items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Right: Search + Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {search && (
              <div className="relative min-w-[200px] flex-1 sm:w-64 sm:flex-initial">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search.value}
                  onChange={(e) => search.onChange(e.target.value)}
                  placeholder={search.placeholder || 'Filter records...'}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-1.5 pr-3 pl-9 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-[#0E1626]"
                />
              </div>
            )}
            {actions}
          </div>
        </div>
      )}

      {/* Table Body / Loading / Empty */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <span className="text-xs font-semibold text-slate-400">Loading records...</span>
        </div>
      ) : empty ? (
        <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            <EmptyIcon className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
            {empty.title}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
            {empty.description}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto [webkit-overflow-scrolling:touch]">
          {children}
        </div>
      )}
    </div>
  );
}
