import React from 'react';

export type BadgeTone = 'emerald' | 'amber' | 'indigo' | 'rose' | 'slate';

const BADGE_STYLES: Record<BadgeTone, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20',
  amber: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/20',
  rose: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/20',
  slate: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/40 dark:text-slate-300 dark:border-slate-700/50',
};

interface StatusBadgeProps {
  status: string;
  tone?: BadgeTone;
  icon?: React.ReactNode;
}

export function StatusBadge({ status, tone, icon }: StatusBadgeProps) {
  // Auto-detect tone if not provided
  let detectedTone: BadgeTone = tone || 'slate';
  if (!tone) {
    const s = status.toLowerCase();
    if (s.includes('approv') || s.includes('active') || s.includes('verif') || s.includes('closed')) {
      detectedTone = 'emerald';
    } else if (s.includes('pend') || s.includes('wait') || s.includes('in review') || s.includes('contacted')) {
      detectedTone = 'amber';
    } else if (s.includes('reject') || s.includes('block') || s.includes('suspend') || s.includes('danger')) {
      detectedTone = 'rose';
    } else if (s.includes('new') || s.includes('sale') || s.includes('admin') || s.includes('info')) {
      detectedTone = 'indigo';
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${BADGE_STYLES[detectedTone]}`}
    >
      {icon}
      {status}
    </span>
  );
}
