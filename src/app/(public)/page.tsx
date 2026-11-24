import Link from 'next/link';
import { HeroMapSection } from '@/components/home/HeroMapSection';
import { Building, Home, LandPlot, ShieldCheck, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const categories = [
    { title: 'Residential Flats', icon: Building, count: '1,420+ Listings', href: '/properties?category=residential&propertyType=Apartment' },
    { title: 'Villas & Bungalows', icon: Home, count: '380+ Listings', href: '/properties?category=residential&propertyType=Villa' },
    { title: 'Commercial Offices', icon: Building, count: '560+ Listings', href: '/properties?category=commercial' },
    { title: 'Plots & Land', icon: LandPlot, count: '290+ Listings', href: '/properties?category=plot_land' },
  ];

  const featuredCities = [
    { name: 'Ahmedabad', count: '1,240 properties', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format&fit=crop&q=80' },
    { name: 'Gandhinagar', count: '410 properties', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80' },
    { name: 'Vadodara', count: '320 properties', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80' },
    { name: 'Surat', count: '580 properties', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Interactive Hero Map Section with Real-Time Filtering */}
      <HeroMapSection />

      {/* Category Grid */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Explore by Category
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Browse residential apartments, luxury villas, offices, and plots
            </p>
          </div>
          <Link
            href="/properties"
            className="flex items-center gap-1 text-sm font-semibold text-zinc-900 transition hover:underline dark:text-white"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.title}
                href={cat.href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-zinc-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-zinc-600"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 transition group-hover:bg-zinc-900 group-hover:text-white dark:bg-zinc-800 dark:text-zinc-100 dark:group-hover:bg-white dark:group-hover:text-zinc-950">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                  {cat.title}
                </h3>
                <p className="mt-1 text-xs text-slate-400">{cat.count}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular Cities */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Popular Growth Hubs
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Find verified listings across top investment and living destinations
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCities.map((city) => (
            <Link
              key={city.name}
              href={`/properties?city=${encodeURIComponent(city.name)}`}
              className="group relative h-64 overflow-hidden rounded-2xl shadow-sm transition hover:shadow-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={city.image}
                alt={city.name}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="text-xl font-bold">{city.name}</h4>
                <p className="text-xs text-slate-300">{city.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust & Moderation Banner */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-zinc-800 bg-gradient-to-r from-slate-950 via-zinc-950 to-black px-6 py-12 text-white shadow-xl sm:px-12 lg:flex lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-zinc-300">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Multi-Tier Verification</span>
            </div>
            <h3 className="mt-3 text-3xl font-black tracking-tight">
              Are you a licensed broker or agency?
            </h3>
            <p className="mt-2 text-sm text-zinc-300">
              Join the RV Group Ltd verified agent network. Gain access to genuine leads, priority listing indexing, and a modern lead management pipeline.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-4 lg:mt-0">
            <Link
              href="/register-agent"
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-zinc-950 shadow-md transition hover:bg-zinc-200"
            >
              Apply as Verified Agent
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
