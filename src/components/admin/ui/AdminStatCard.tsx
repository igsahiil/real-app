import React from 'react';
import { LucideIcon } from 'lucide-react';

export type StatTone = 'emerald' | 'amber' | 'indigo' | 'rose' | 'slate';

const TONES: Record<StatTone, { container: string; icon: string; badge: string }> = {
  emerald: {
    container: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    icon: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  amber: {
    container: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    icon: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  },
  indigo: {
    container: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
    icon: 'text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
  },
  rose: {
    container: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
    icon: 'text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  },
  slate: {
    container: 'bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-400',
    icon: 'text-slate-500 dark:text-slate-400',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300',
  },
};

interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  tone?: StatTone;
  badge?: {
    text: string;
    tone?: StatTone;
  };
}

export function AdminStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = 'indigo',
  badge,
}: AdminStatCardProps) {
  const toneClasses = TONES[tone];
  const badgeClasses = badge?.tone ? TONES[badge.tone].badge : toneClasses.badge;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700/60 dark:bg-[#1C2536]">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-semibold text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses.container}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">
          {value}
        </span>
        {badge && (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tabular-nums ${badgeClasses}`}>
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-[12px] text-slate-400 dark:text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}
