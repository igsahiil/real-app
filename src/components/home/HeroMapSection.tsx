'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Property } from '@/types';
import { CatalogMapView } from '@/components/map/CatalogMapView';
import {
  Search,
  MapPin,
  Building,
  Home as HomeIcon,
  LandPlot,
  ShieldCheck,
  Zap,
  Bell,
  TrendingUp,
  SlidersHorizontal,
  ArrowRight,
  Compass,
  Sparkles,
} from 'lucide-react';

export function HeroMapSection() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Active filter state
  const [listingType, setListingType] = useState<string>('sale');
  const [category, setCategory] = useState<string>('');
  const [city, setCity] = useState<string>('Ahmedabad');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [bedrooms, setBedrooms] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // City options
  const cityOptions = [
    { name: 'Ahmedabad', label: 'Ahmedabad, Gujarat' },
    { name: 'Gandhinagar', label: 'Gandhinagar, Gujarat' },
    { name: 'Surat', label: 'Surat, Gujarat' },
    { name: 'Vadodara', label: 'Vadodara, Gujarat' },
  ];

  // Price bounds parser
  const getPriceBounds = useCallback((range: string) => {
    switch (range) {
      case 'under_50l':
        return { minPrice: undefined, maxPrice: '5000000' };
      case '50l_1cr':
        return { minPrice: '5000000', maxPrice: '10000000' };
      case '1cr_2cr':
        return { minPrice: '10000000', maxPrice: '20000000' };
      case 'above_2cr':
        return { minPrice: '20000000', maxPrice: undefined };
      default:
        return { minPrice: undefined, maxPrice: undefined };
    }
  }, []);

  // Fetch real-time properties from backend
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '80');
      if (listingType) params.set('listingType', listingType);
      if (category) params.set('category', category);
      if (city) params.set('city', city);
      if (searchQuery) params.set('q', searchQuery);
      if (bedrooms) params.set('bedrooms', bedrooms);

      const { minPrice, maxPrice } = getPriceBounds(priceRange);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);

      const res = await api.get(`/api/v1/properties?${params.toString()}`);
      setProperties(res.data.data || []);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [listingType, category, city, searchQuery, priceRange, bedrooms, getPriceBounds]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Target query string for catalog redirect
  const getCatalogLink = () => {
    const params = new URLSearchParams();
    if (listingType) params.set('listingType', listingType);
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    if (searchQuery) params.set('q', searchQuery);
    if (bedrooms) params.set('bedrooms', bedrooms);
    const { minPrice, maxPrice } = getPriceBounds(priceRange);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);

    const qStr = params.toString();
    return qStr ? `/properties?${qStr}` : '/properties';
  };

  return (
    <section className="relative w-full overflow-hidden bg-slate-950">
      {/* Top Category Filter Pills Toolbar matching the header in reference image */}
      <div className="relative z-30 border-b border-white/10 bg-slate-950/90 px-4 py-2.5 backdrop-blur-md">
        <div className="container mx-auto flex max-w-7xl items-center justify-between gap-3 overflow-x-auto">
          {/* Category Pill Buttons */}
          <div className="flex items-center gap-2">
            {[
              { id: '', label: 'All Categories', icon: Compass },
              { id: 'residential', label: 'Residential', icon: HomeIcon },
              { id: 'commercial', label: 'Commercial', icon: Building },
              { id: 'plot_land', label: 'Plots & Land', icon: LandPlot },
            ].map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex min-h-[38px] items-center gap-2 whitespace-nowrap rounded-xl px-4 py-1.5 text-xs font-bold transition shadow-sm ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-indigo-500/25'
                      : 'bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Real-time Properties Counter */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>{loading ? 'Updating live map...' : `${properties.length} Verified Properties on Live Map`}</span>
          </div>
        </div>
      </div>

      {/* Main Hero Container: Full-Bleed Map + Floating Left Search & Discovery Overlay */}
      <div className="relative h-[86vh] min-h-[660px] max-h-[860px] w-full">
        {/* Real-time Interactive Leaflet / Google Maps Layer */}
        <div className="absolute inset-0 h-full w-full">
          <CatalogMapView
            properties={properties}
            className="h-full w-full"
            selectedProperty={selectedProperty}
            onSelectProperty={setSelectedProperty}
          />
        </div>

        {/* Floating Left Hero Card — Exact Match with Reference Image Layout & Typography */}
        <div className="pointer-events-none absolute inset-x-4 top-4 z-[900] lg:inset-auto lg:top-6 lg:left-6 lg:w-[470px]">
          <div className="pointer-events-auto rounded-3xl border border-white/15 bg-slate-950/85 p-5 shadow-2xl backdrop-blur-xl sm:p-6.5 text-white">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Find • Compare • Invest</span>
            </div>

            {/* Hero Heading with Accent City Name */}
            <h1 className="mt-3.5 text-2xl font-black tracking-tight sm:text-3xl text-white leading-tight">
              Discover Properties in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 font-black">
                {city || 'Ahmedabad'}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-2 text-xs text-slate-300 leading-relaxed sm:text-[13px]">
              Buy, Rent or Lease verified properties with ease. Search by location, category or project and explore on a live map.
            </p>

            {/* 3 Key Stats Counter Row */}
            <div className="mt-4 grid grid-cols-3 gap-2 border-y border-white/10 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-indigo-400">
                  <HomeIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">10K+</p>
                  <p className="text-[10px] text-slate-400 leading-none">Verified</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-indigo-400">
                  <Building className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">50+</p>
                  <p className="text-[10px] text-slate-400 leading-none">Cities</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">100%</p>
                  <p className="text-[10px] text-slate-400 leading-none">Verified</p>
                </div>
              </div>
            </div>

            {/* Interactive Search Card Box */}
            <div className="mt-4 rounded-2xl bg-white p-3.5 text-slate-900 shadow-xl dark:bg-[#1C2536] dark:text-white">
              {/* Segmented Tabs: Buy, Rent, Lease */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                {[
                  { id: 'sale', label: 'Buy' },
                  { id: 'rent', label: 'Rent' },
                  { id: 'lease', label: 'Lease' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setListingType(t.id)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                      listingType === t.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Locality Search Input */}
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-[#0E1626]">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by locality, project or keyword..."
                  className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none dark:text-white"
                />
              </div>

              {/* City Dropdown + Filters Button Row */}
              <div className="mt-2.5 flex items-center gap-2">
                {/* City select */}
                <div className="relative flex-1">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-[#0E1626] dark:text-slate-200">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-transparent text-xs font-semibold outline-none cursor-pointer"
                      >
                        {cityOptions.map((c) => (
                          <option key={c.name} value={c.name} className="dark:bg-slate-900">
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Filters toggle */}
                <button
                  type="button"
                  onClick={() => setShowFiltersModal(!showFiltersModal)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    showFiltersModal || bedrooms || priceRange
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-[#0E1626] dark:text-slate-300'
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Filters</span>
                </button>
              </div>

              {/* Collapsible Filter Expansion (BHK & Budget) */}
              {showFiltersModal && (
                <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-3 dark:border-slate-700">
                  {/* Bedrooms */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Configuration (BHK)
                    </label>
                    <div className="mt-1 flex gap-1.5">
                      {['', '1', '2', '3', '4'].map((bhk) => (
                        <button
                          key={bhk}
                          type="button"
                          onClick={() => setBedrooms(bhk)}
                          className={`flex-1 rounded-lg py-1 text-xs font-bold transition ${
                            bedrooms === bhk
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {bhk ? `${bhk} BHK` : 'All'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Budget
                    </label>
                    <div className="mt-1 grid grid-cols-2 gap-1.5 text-xs">
                      {[
                        { id: '', label: 'Any Budget' },
                        { id: 'under_50l', label: '< ₹50 Lac' },
                        { id: '50l_1cr', label: '₹50L - ₹1 Cr' },
                        { id: '1cr_2cr', label: '₹1 Cr - ₹2 Cr' },
                      ].map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setPriceRange(b.id)}
                          className={`rounded-lg py-1 px-2 text-center text-[11px] font-medium transition ${
                            priceRange === b.id
                              ? 'bg-indigo-600 font-bold text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Main Search Action Button */}
              <Link
                href={getCatalogLink()}
                className="mt-3 flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-indigo-600/30 transition hover:opacity-95"
              >
                <span>Search Properties</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Floating Feature Dock matching the reference image layout */}
        <div className="pointer-events-none absolute bottom-3 inset-x-3 z-[900] hidden sm:block">
          <div className="pointer-events-auto mx-auto max-w-5xl rounded-2xl border border-white/15 bg-slate-950/85 p-3.5 shadow-2xl backdrop-blur-xl text-white">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {/* Feature 1 */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Live Property Map</p>
                  <p className="text-[11px] text-slate-400">Real-time listings near you</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Exact Location</p>
                  <p className="text-[11px] text-slate-400">Explore by area & locality</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Instant Alerts</p>
                  <p className="text-[11px] text-slate-400">Get updates on new properties</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Better Decisions</p>
                  <p className="text-[11px] text-slate-400">Compare, short-list and invest</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
