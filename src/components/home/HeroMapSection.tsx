'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Property } from '@/types';
import { CatalogMapView } from '@/components/map/CatalogMapView';
import {
  Search,
  MapPin,
  ShieldCheck,
  Zap,
  Users,
  SlidersHorizontal,
  ArrowRight,
  RotateCcw,
  Building2,
  CheckCircle2,
  BarChart3,
  Compass,
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

  const cityOptions = [
    { name: 'Ahmedabad', label: 'Ahmedabad' },
    { name: 'Gandhinagar', label: 'Gandhinagar' },
    { name: 'Surat', label: 'Surat' },
    { name: 'Vadodara', label: 'Vadodara' },
  ];

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

  const handleResetFilters = () => {
    setListingType('sale');
    setCategory('');
    setCity('Ahmedabad');
    setSearchQuery('');
    setBedrooms('');
    setPriceRange('');
  };

  const hasActiveFilters = Boolean(
    category || bedrooms || priceRange || searchQuery || city !== 'Ahmedabad'
  );

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
    <section className="relative w-full overflow-hidden bg-[#080E23]">
      {/* Subtle Ambient Indigo/Violet Glow on Left & Bottom */}
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-indigo-600/25 blur-[120px] z-10" />
      <div className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-96 rounded-full bg-violet-600/20 blur-[120px] z-10" />

      {/* Main Responsive Layout Wrapper */}
      <div className="relative flex flex-col lg:block lg:min-h-[670px]">
        {/* Interactive Map Layer: Full-bleed background on Desktop; dedicated visible section on Mobile */}
        <div className="order-2 relative h-[390px] sm:h-[440px] w-full lg:order-none lg:absolute lg:inset-0 lg:h-full">
          <CatalogMapView
            properties={properties}
            className="h-full w-full"
            selectedProperty={selectedProperty}
            onSelectProperty={setSelectedProperty}
          />

          {/* Desktop Left-to-Right Smooth Dark Royal Navy Mask (Pointer-events-none so map stays interactive) */}
          <div
            className="pointer-events-none hidden lg:block absolute inset-0 z-[400]"
            style={{
              background:
                'linear-gradient(90deg, #080E23 0%, rgba(8,14,35,0.96) 32%, rgba(8,14,35,0.68) 50%, rgba(8,14,35,0.12) 72%, transparent 100%)',
            }}
          />
          {/* Subtle Bottom Vignette on Desktop */}
          <div
            className="pointer-events-none hidden lg:block absolute inset-x-0 bottom-0 h-36 z-[400]"
            style={{
              background: 'linear-gradient(to top, rgba(8,14,35,0.92) 0%, transparent 100%)',
            }}
          />
        </div>

        {/* Foreground Content Overlay (Desktop) / Top Hero Content (Mobile) */}
        <div className="order-1 relative z-[900] lg:pointer-events-none lg:flex lg:min-h-[670px] lg:flex-col lg:justify-between">
          <div className="container mx-auto max-w-7xl px-4 pt-8 pb-6 sm:px-6 lg:px-8 lg:pt-12 lg:pb-8">
            {/* Left Hero Copy & 4 Feature Cards */}
            <div className="lg:pointer-events-auto max-w-xl">
              {/* Brand Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-950/70 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-200 backdrop-blur-md shadow-sm">
                <Compass className="h-3.5 w-3.5 text-indigo-400" />
                <span>RV GROUP LTD</span>
                {loading && (
                  <span className="ml-1 h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
                )}
              </div>

              {/* Main Display Headline */}
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[50px] lg:leading-[1.12]">
                Find. Buy. Rent. Invest.
                <br />
                <span className="text-white">Property in {city}</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-3.5 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-[15px]">
                Discover verified residential, commercial and land properties in {city} with an
                easy, map-based experience.
              </p>

              {/* 4 Feature Icon Cards */}
              <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                {[
                  { icon: ShieldCheck, label: 'Verified Listings' },
                  { icon: MapPin, label: 'Map Search' },
                  { icon: Zap, label: 'Instant Alerts' },
                  { icon: Users, label: 'Trusted Agents' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-2.5 py-3 text-center backdrop-blur-md transition hover:border-indigo-400/40 hover:bg-white/[0.1]"
                    >
                      <Icon className="h-5 w-5 text-indigo-300" strokeWidth={1.75} />
                      <span className="text-[11px] font-medium text-slate-200">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Centered Floating White Search Capsule */}
            <div className="lg:pointer-events-auto mx-auto mt-7 w-full max-w-4xl lg:mt-10">
              <div className="rounded-2xl sm:rounded-full border border-slate-200/80 bg-white p-2 shadow-[0_20px_50px_rgba(0,0,0,0.45)] text-slate-900">
                {/* DESKTOP HORIZONTAL CAPSULE */}
                <div className="hidden sm:flex items-center gap-2">
                  {/* Listing Type Tabs: Buy, Rent, Lease */}
                  <div className="flex items-center gap-1 rounded-full bg-slate-100/80 p-1 shrink-0">
                    {[
                      { id: 'sale', label: 'Buy' },
                      { id: 'rent', label: 'Rent' },
                      { id: 'lease', label: 'Lease' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setListingType(t.id)}
                        className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                          listingType === t.id
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="h-6 w-px bg-slate-200 shrink-0" />

                  {/* City Selector */}
                  <div className="flex items-center gap-1.5 px-2.5 py-2 shrink-0">
                    <MapPin className="h-4 w-4 text-indigo-600 shrink-0" />
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                    >
                      {cityOptions.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Locality / Keyword Search Input */}
                  <div className="flex flex-1 items-center gap-2 rounded-full bg-slate-100/90 px-4 py-2.5">
                    <Search className="h-4 w-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search locality, project, or society..."
                      className="w-full bg-transparent text-xs font-medium text-slate-800 placeholder-slate-400 outline-none"
                    />
                  </div>

                  {/* Filters Button */}
                  <button
                    type="button"
                    onClick={() => setShowFiltersModal(!showFiltersModal)}
                    className={`flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-bold transition shrink-0 ${
                      showFiltersModal || bedrooms || priceRange || category
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span>Filters</span>
                    {(bedrooms || priceRange || category) && (
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                    )}
                  </button>

                  {/* Search CTA Button */}
                  <Link
                    href={getCatalogLink()}
                    className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition hover:opacity-95 shrink-0"
                  >
                    <span>Search</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* MOBILE COMPACT CAPSULE (42px+ touch targets, does not hide map below) */}
                <div className="flex sm:hidden flex-col gap-2">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                      {[
                        { id: 'sale', label: 'Buy' },
                        { id: 'rent', label: 'Rent' },
                        { id: 'lease', label: 'Lease' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setListingType(t.id)}
                          className={`min-h-[34px] rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                            listingType === t.id
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-600'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 min-h-[42px]">
                      <MapPin className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="bg-transparent text-xs font-bold text-slate-800 outline-none"
                      >
                        {cityOptions.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="flex flex-1 items-center gap-2 rounded-xl bg-slate-100 px-3 min-h-[42px]">
                      <Search className="h-4 w-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search locality, project..."
                        className="w-full bg-transparent text-xs font-medium text-slate-800 placeholder-slate-400 outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowFiltersModal(!showFiltersModal)}
                      className={`flex min-h-[42px] min-w-[42px] items-center justify-center rounded-xl border transition shrink-0 ${
                        showFiltersModal || bedrooms || priceRange || category
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                      aria-label="Filter properties"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                    </button>

                    <Link
                      href={getCatalogLink()}
                      className="flex min-h-[42px] items-center gap-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 text-xs font-bold text-white shadow-sm shrink-0"
                      aria-label="Search"
                    >
                      <span>Go</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Expandable Advanced Filters Drawer */}
                {showFiltersModal && (
                  <div className="mt-2.5 border-t border-slate-100 pt-3 px-3 pb-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Category */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Category
                        </span>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {[
                            { id: '', label: 'All' },
                            { id: 'residential', label: 'Residential' },
                            { id: 'commercial', label: 'Commercial' },
                            { id: 'plot_land', label: 'Plots' },
                          ].map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setCategory(cat.id)}
                              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                                category === cat.id
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* BHK Filter */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Configuration (BHK)
                        </span>
                        <div className="mt-1.5 flex gap-1">
                          {['', '1', '2', '3', '4'].map((bhk) => (
                            <button
                              key={bhk}
                              type="button"
                              onClick={() => setBedrooms(bhk)}
                              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                                bedrooms === bhk
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {bhk ? `${bhk} BHK` : 'All'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Budget Range */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Budget Range
                        </span>
                        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
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
                              className={`rounded-lg py-1.5 px-2 text-center text-[11px] font-semibold transition ${
                                priceRange === b.id
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {hasActiveFilters && (
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                        <span className="text-[11px] text-slate-500">
                          Showing {properties.length} live matches in {city}
                        </span>
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reset Filters
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar (Matches Screenshot Bottom Dock) */}
        <div className="order-3 relative z-[900] lg:pointer-events-none px-4 pb-6 pt-4 sm:px-6 lg:px-8 lg:pt-0">
          <div className="lg:pointer-events-auto relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#0D142B]/85 px-5 py-4 backdrop-blur-xl shadow-2xl">
            <div className="relative z-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-white/10">
              {[
                {
                  icon: Building2,
                  value: '10,000+',
                  label: 'Properties Listed',
                },
                {
                  icon: CheckCircle2,
                  value: '100%',
                  label: 'Verified Properties',
                },
                {
                  icon: Users,
                  value: '5,000+',
                  label: 'Happy Customers',
                },
                {
                  icon: BarChart3,
                  value: '15+',
                  label: 'Areas Covered',
                },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={`flex items-center gap-3 ${idx > 0 ? 'lg:pl-6' : ''} ${
                      idx < 3 ? 'lg:pr-6' : ''
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-indigo-300 border border-white/10">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <div className="text-base font-extrabold text-white tabular-nums sm:text-lg">
                        {stat.value}
                      </div>
                      <div className="text-[11px] font-medium text-slate-400">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subtle City Skyline SVG Silhouette on Bottom Right */}
            <svg
              className="pointer-events-none hidden lg:block absolute right-3 bottom-0 h-14 w-48 text-indigo-400/20"
              viewBox="0 0 220 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10 60V38H22V60M28 60V26H44V60M50 60V42H64V60M70 60V16H92V60M98 60V32H114V60M120 60V10H142V60M148 60V28H166V60M172 60V20H192V60M198 60V36H214V60"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
