'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Mail, Phone, User, Clock, CheckCircle, AlertCircle, Send } from 'lucide-react';

interface InquiryFormProps {
  propertyId: string;
  propertyTitle: string;
}

export function InquiryForm({ propertyId, propertyTitle }: InquiryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredTime: 'Anytime',
    message: `Hi, I am interested in "${propertyTitle}". Please share further details, brochures, and floor plans.`,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/api/v1/inquiries', {
        propertyId,
        ...formData,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Failed to send inquiry.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl bg-emerald-50 p-6 text-center dark:bg-emerald-950/40">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
          <CheckCircle className="h-6 w-6" />
        </div>
        <h4 className="mt-3 text-base font-bold text-slate-900 dark:text-white">Inquiry Dispatched</h4>
        <p className="mt-1 text-xs text-slate-500">
          The listing broker has been notified and will contact you at {formData.phone || formData.email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
        Request Callback / Inquiry
      </h4>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800/60">
          <User className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your Full Name"
            className="ml-2.5 w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none dark:text-white"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800/60">
          <Mail className="h-4 w-4 text-slate-400" />
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Your Email Address"
            className="ml-2.5 w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none dark:text-white"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800/60">
          <Phone className="h-4 w-4 text-slate-400" />
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Mobile Phone (+91 ...)"
            className="ml-2.5 w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none dark:text-white"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800/60">
          <Clock className="h-4 w-4 text-slate-400" />
          <select
            value={formData.preferredTime}
            onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
            className="ml-2.5 w-full bg-transparent text-xs text-slate-900 outline-none dark:bg-slate-800 dark:text-white dark:[color-scheme:dark]"
          >
            <option value="Anytime" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Preferred Time: Anytime</option>
            <option value="Morning (9am - 12pm)" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Morning (9am - 12pm)</option>
            <option value="Afternoon (12pm - 4pm)" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Afternoon (12pm - 4pm)</option>
            <option value="Evening (4pm - 8pm)" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Evening (4pm - 8pm)</option>
            <option value="Weekend Only" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Weekend Only</option>
          </select>
        </div>
      </div>

      <div>
        <textarea
          rows={3}
          required
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder-slate-400 outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-black disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
      >
        <Send className="h-3.5 w-3.5" />
        {loading ? 'Sending Inquiry...' : 'Send Inquiry to Agent'}
      </button>
    </form>
  );
}
