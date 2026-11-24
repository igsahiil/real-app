import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-light.png" alt="RV Group Ltd" className="h-full w-full object-cover dark:hidden" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-dark.png" alt="RV Group Ltd" className="hidden h-full w-full object-cover dark:block" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                  RV GROUP <span className="text-xs font-bold text-slate-500 dark:text-slate-400">LTD</span>
                </span>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  Your Partner in Property &amp; Justice
                </p>
              </div>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Verified, high-yield residential, commercial, and land properties backed by licensed agents, comprehensive legal governance, and multi-tier moderation.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              Ahmedabad &bull; Gandhinagar &bull; Vadodara &bull; Mumbai
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Discover
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/properties?listingType=sale" className="transition hover:text-black dark:hover:text-white">
                  Properties for Sale
                </Link>
              </li>
              <li>
                <Link href="/properties?listingType=rent" className="transition hover:text-black dark:hover:text-white">
                  Rental Properties
                </Link>
              </li>
              <li>
                <Link href="/properties?category=commercial" className="transition hover:text-black dark:hover:text-white">
                  Commercial Hubs
                </Link>
              </li>
              <li>
                <Link href="/properties?category=plot_land" className="transition hover:text-black dark:hover:text-white">
                  Investment Land
                </Link>
              </li>
            </ul>
          </div>

          {/* Agent & Partner */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              For Professionals
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/register-agent" className="transition hover:text-black dark:hover:text-white">
                  Join as Verified Agent
                </Link>
              </li>
              <li>
                <Link href="/agent/properties/new" className="transition hover:text-black dark:hover:text-white">
                  Submit Listing
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition hover:text-black dark:hover:text-white">
                  Agent Portal Login
                </Link>
              </li>
              <li>
                <Link href="/admin" className="transition hover:text-black dark:hover:text-white">
                  Admin Moderation
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Support & Inquiries
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span>support@rvgroupltd.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span>+91 98765 43210</span>
              </li>
              <li className="text-xs text-slate-400 pt-2">
                Mon - Sat: 9:00 AM - 7:00 PM IST
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row dark:border-slate-800">
          <p>© {new Date().getFullYear()} RV Group Ltd. All rights reserved.</p>
          <p className="mt-2 flex items-center gap-1 sm:mt-0">
            Your Partner in Property &amp; Justice &bull; Fastify 5 &amp; Next.js App Router
          </p>
        </div>
      </div>
    </footer>
  );
}
