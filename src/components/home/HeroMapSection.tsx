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
  Zap,
  Bell,
  TrendingUp,
  SlidersHorizontal,
  ArrowRight,
  Compass,
  RotateCcw,
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

  const handleResetFilters = () => {
    setListingType('sale');
    setCategory('');
    setCity('Ahmedabad');
    setSearchQuery('');
    setBedrooms('');
    setPriceRange('');
  };

  const hasActiveFilters = Boolean(category || bedrooms || priceRange || searchQuery || city !== 'Ahmedabad');

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
      {/* Top Minimal Category Bar (Compact & Responsive) */}
      <div className="relative z-30 border-b border-white/10 bg-slate-950/95 px-3 py-2 backdrop-blur-md">
        <div className="container mx-auto flex max-w-7xl items-center justify-between gap-3 overflow-x-auto">
          {/* Category Pill Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
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
                  className={`flex min-h-[34px] items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1 text-xs font-bold transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Live Map Counter Badge */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-300 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>{loading ? 'Updating live map...' : `${properties.length} Verified Properties`}</span>
          </div>
        </div>
      </div>

      {/* Main Map Container: Map is NOT hidden; full viewport visibility */}
      <div className="relative h-[78vh] sm:h-[84vh] min-h-[500px] sm:min-h-[640px] max-h-[860px] w-full">
        {/* Real-time Interactive Leaflet / Google Maps Layer */}
        <div className="absolute inset-0 h-full w-full">
          <CatalogMapView
            properties={properties}
            className="h-full w-full"
            selectedProperty={selectedProperty}
            onSelectProperty={setSelectedProperty}
          />
        </div>

        {/* MINIMAL & CENTERED FLOATING FILTER BAR (Desktop & Mobile-Optimized) */}
        <div className="pointer-events-none absolute top-3 sm:top-5 inset-x-0 z-[900] flex justify-center px-3 sm:px-6">
          <div className="pointer-events-auto w-full max-w-4xl">
            {/* Minimal Frosted Glass Capsule */}
            <div className="rounded-2xl sm:rounded-full border border-white/20 bg-slate-950/85 p-2 sm:p-2.5 shadow-2xl backdrop-blur-xl text-white">
              {/* DESKTOP MINIMAL HORIZONTAL LAYOUT */}
              <div className="hidden sm:flex items-center gap-2">
                {/* Segmented Tabs: Buy, Rent, Lease */}
                <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 shrink-0">
                  {[
                    { id: 'sale', label: 'Buy' },
                    { id: 'rent', label: 'Rent' },
                    { id: 'lease', label: 'Lease' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setListingType(t.id)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                        listingType === t.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="flex flex-1 items-center gap-2 rounded-full bg-white/10 px-3.5 py-2">
                  <Search className="h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search locality, project, or society..."
                    className="w-full bg-transparent text-xs text-white placeholder-slate-400 outline-none"
                  />
                </div>

                {/* City Selector */}
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
                  >
                    {cityOptions.map((c) => (
                      <option key={c.name} value={c.name} className="bg-slate-900 text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filters Toggle */}
                <button
                  type="button"
                  onClick={() => setShowFiltersModal(!showFiltersModal)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition shrink-0 ${
                    showFiltersModal || bedrooms || priceRange
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Filters</span>
                  {(bedrooms || priceRange) && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  )}
                </button>

                {/* Search Action CTA */}
                <Link
                  href={getCatalogLink()}
                  className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-2 text-xs font-extrabold text-white shadow-lg shadow-indigo-600/30 transition hover:opacity-95 shrink-0"
                >
                  <span>Search</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* MOBILE MINIMAL COMPACT BAR (Does NOT block or hide the map!) */}
              <div className="flex sm:hidden items-center gap-1.5">
                {/* Buy/Rent Toggle */}
                <div className="flex items-center rounded-xl bg-white/10 p-0.5 shrink-0">
                  {[
                    { id: 'sale', label: 'Buy' },
                    { id: 'rent', label: 'Rent' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setListingType(t.id)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                        listingType === t.id ? 'bg-indigo-600 text-white' : 'text-slate-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Locality Input */}
                <div className="flex flex-1 items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1.5">
                  <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search locality..."
                    className="w-full bg-transparent text-xs text-white placeholder-slate-400 outline-none"
                  />
                </div>

                {/* Filters icon button */}
                <button
                  type="button"
                  onClick={() => setShowFiltersModal(!showFiltersModal)}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 transition ${
                    showFiltersModal || bedrooms || priceRange
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/10 text-slate-300'
                  }`}
                  aria-label="Filter properties"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </button>

                {/* Search icon submit button */}
                <Link
                  href={getCatalogLink()}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shrink-0 shadow-md"
                  aria-label="Search"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Dropdown Drawer for Advanced Filters (BHK & Budget) */}
              {showFiltersModal && (
                <div className="mt-2.5 border-t border-white/10 pt-2.5 px-2 pb-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-white">
                    {/* BHK Filter */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Configuration (BHK)
                      </span>
                      <div className="mt-1 flex gap-1">
                        {['', '1', '2', '3', '4'].map((bhk) => (
                          <button
                            key={bhk}
                            type="button"
                            onClick={() => setBedrooms(bhk)}
                            className={`flex-1 rounded-lg py-1 text-xs font-bold transition ${
                              bedrooms === bhk
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white/10 text-slate-300 hover:bg-white/20'
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
                                : 'bg-white/10 text-slate-300 hover:bg-white/20'
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2">
                      <span className="text-[11px] text-slate-400">
                        Active: {city} {bedrooms ? `• ${bedrooms} BHK` : ''} {category ? `• ${category}` : ''}
                      </span>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:underline"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Minimal Bottom Feature Dock (Visible on tablet & desktop, hidden on tiny phones to keep map 100% visible) */}
        <div className="pointer-events-none absolute bottom-3 inset-x-3 z-[900] hidden md:block">
          <div className="pointer-events-auto mx-auto max-w-4xl rounded-2xl border border-white/15 bg-slate-950/85 p-2.5 shadow-2xl backdrop-blur-xl text-white">
            <div className="grid grid-cols-4 gap-2">
              {/* Feature 1 */}
              <div className="flex items-center gap-2.5 px-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-white truncate">Live Property Map</p>
                  <p className="text-[10px] text-slate-400 truncate">Real-time listings</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-2.5 px-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-white truncate">Exact Location</p>
                  <p className="text-[10px] text-slate-400 truncate">Area & locality</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-2.5 px-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Bell className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-white truncate">Instant Alerts</p>
                  <p className="text-[10px] text-slate-400 truncate">New notifications</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-center gap-2.5 px-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-white truncate">Better Decisions</p>
                  <p className="text-[10px] text-slate-400 truncate">Compare & invest</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
