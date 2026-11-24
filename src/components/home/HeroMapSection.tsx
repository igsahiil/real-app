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
  Home,
  LandPlot,
  Crosshair,
  SlidersHorizontal,
  Loader2,
  ArrowRight,
  RotateCcw,
  Compass,
} from 'lucide-react';

export function HeroMapSection() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Active filter state
  const [listingType, setListingType] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [radiusKm, setRadiusKm] = useState<string>('15');
  const [locating, setLocating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Parse price range
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

  // Fetch properties from backend
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '60');
      if (listingType) params.set('listingType', listingType);
      if (category) params.set('category', category);
      if (city) params.set('city', city);
      if (searchQuery) params.set('q', searchQuery);
      if (bedrooms) params.set('bedrooms', bedrooms);
      if (lat && lng) {
        params.set('lat', lat);
        params.set('lng', lng);
        params.set('radiusKm', radiusKm);
      }

      const { minPrice, maxPrice } = getPriceBounds(priceRange);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);

      const res = await api.get(`/api/v1/properties?${params.toString()}`);
      setProperties(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
    } catch {
      setProperties([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [listingType, category, city, searchQuery, priceRange, bedrooms, lat, lng, radiusKm, getPriceBounds]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Handle GPS near me
  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
      },
      () => {
        setLocating(false);
        alert('Could not retrieve your GPS location. Please check browser permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleResetFilters = () => {
    setListingType('');
    setCategory('');
    setCity('');
    setSearchQuery('');
    setPriceRange('');
    setBedrooms('');
    setLat('');
    setLng('');
  };

  const activeFiltersCount = [
    listingType,
    category,
    city,
    searchQuery,
    priceRange,
    bedrooms,
    lat,
  ].filter(Boolean).length;

  // Build target query string for catalog link
  const getCatalogLink = () => {
    const params = new URLSearchParams();
    if (listingType) params.set('listingType', listingType);
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    if (searchQuery) params.set('q', searchQuery);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (lat && lng) {
      params.set('lat', lat);
      params.set('lng', lng);
      params.set('radiusKm', radiusKm);
    }
    const { minPrice, maxPrice } = getPriceBounds(priceRange);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);

    const qStr = params.toString();
    return qStr ? `/properties?${qStr}` : '/properties';
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-200/50 via-slate-50 to-slate-50 pt-4 pb-12 sm:pt-6 dark:from-zinc-900/40 dark:via-[#0E1626] dark:to-[#0E1626]">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Interactive Filter Toolbar */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-3.5 shadow-lg sm:p-4.5 dark:border-slate-800 dark:bg-[#1C2536]">
          {/* Top Row: Listing Type Tabs + Category Filter Pills */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Listing Type: All, Buy, Rent, Lease */}
            <div className="flex items-center gap-1 overflow-x-auto rounded-2xl bg-slate-100 p-1 dark:bg-slate-800/80">
              {[
                { id: '', label: 'All Listings' },
                { id: 'sale', label: 'Buy' },
                { id: 'rent', label: 'Rent' },
                { id: 'lease', label: 'Lease' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setListingType(t.id)}
                  className={`min-h-[38px] whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    listingType === t.id
                      ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-950'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Category Pills: Residential, Commercial, Plots */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: '', label: 'All Categories', icon: Compass },
                { id: 'residential', label: 'Residential', icon: Home },
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
                    className={`flex min-h-[38px] items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-950'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Inputs Row */}
          <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_auto_auto]">
            {/* Search query input */}
            <div className="flex min-h-[42px] items-center gap-2.5 rounded-2xl bg-slate-50 px-3.5 py-2 dark:bg-[#0E1626]/70">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by locality, society, project..."
                className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none dark:text-white"
              />
            </div>

            {/* City input */}
            <div className="flex min-h-[42px] items-center gap-2.5 rounded-2xl bg-slate-50 px-3.5 py-2 dark:bg-[#0E1626]/70">
              <MapPin className="h-4 w-4 text-zinc-900 dark:text-zinc-300" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City (e.g. Ahmedabad, Surat)"
                className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none dark:text-white"
              />
            </div>

            {/* Near Me GPS button */}
            <button
              type="button"
              onClick={handleNearMe}
              disabled={locating}
              className={`flex min-h-[42px] items-center justify-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-bold transition shadow-sm ${
                lat && lng
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-950'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
              title="Filter properties near your GPS location"
            >
              {locating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-900 dark:text-white" />
              ) : (
                <Crosshair className="h-3.5 w-3.5 text-zinc-900 dark:text-white" />
              )}
              <span>{locating ? 'Locating...' : lat ? `Near Me (${radiusKm}km)` : 'Near Me'}</span>
            </button>

            {/* Advanced Filters Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex min-h-[42px] items-center justify-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-semibold transition ${
                showAdvanced || priceRange || bedrooms
                  ? 'border-zinc-900 bg-zinc-100 text-zinc-900 dark:border-zinc-400 dark:bg-zinc-800 dark:text-zinc-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>More Filters</span>
              {(priceRange || bedrooms) && (
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-900 dark:bg-white" />
              )}
            </button>
          </div>

          {/* Collapsible Advanced Filters (Budget & Bedrooms) */}
          {showAdvanced && (
            <div className="mt-3.5 border-t border-slate-100 pt-3.5 dark:border-slate-700/60">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Budget */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Budget Range
                  </label>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[
                      { id: '', label: 'Any Budget' },
                      { id: 'under_50l', label: '< ₹50 Lac' },
                      { id: '50l_1cr', label: '₹50L - ₹1 Cr' },
                      { id: '1cr_2cr', label: '₹1 Cr - ₹2 Cr' },
                      { id: 'above_2cr', label: '> ₹2 Cr' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setPriceRange(b.id)}
                        className={`min-h-[36px] rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                          priceRange === b.id
                            ? 'bg-zinc-900 font-bold text-white shadow-sm dark:bg-white dark:text-zinc-950'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bedrooms (BHK) */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Configuration (BHK)
                  </label>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[
                      { id: '', label: 'Any BHK' },
                      { id: '1', label: '1 BHK' },
                      { id: '2', label: '2 BHK' },
                      { id: '3', label: '3 BHK' },
                      { id: '4', label: '4+ BHK' },
                    ].map((bhk) => (
                      <button
                        key={bhk.id}
                        type="button"
                        onClick={() => setBedrooms(bhk.id)}
                        className={`min-h-[36px] rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                          bedrooms === bhk.id
                            ? 'bg-zinc-900 font-bold text-white shadow-sm dark:bg-white dark:text-zinc-950'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {bhk.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Filter Bar & Reset */}
          {activeFiltersCount > 0 && (
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-700/60">
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Active filters:</span>
                {listingType && (
                  <span className="rounded-lg border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                    {listingType.toUpperCase()}
                  </span>
                )}
                {category && (
                  <span className="rounded-lg border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                    {category}
                  </span>
                )}
                {city && (
                  <span className="rounded-lg border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                    City: {city}
                  </span>
                )}
                {bedrooms && (
                  <span className="rounded-lg border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                    {bedrooms} BHK
                  </span>
                )}
                {lat && lng && (
                  <button
                    type="button"
                    onClick={() => setRadiusKm(radiusKm === '15' ? '25' : radiusKm === '25' ? '50' : '15')}
                    className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-zinc-900 transition hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    title="Click to cycle GPS radius"
                  >
                    <span>GPS: {radiusKm}km radius</span>
                    <span className="text-[10px] text-zinc-600 underline dark:text-zinc-400">(change)</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs font-semibold text-zinc-700 hover:underline dark:text-zinc-300"
              >
                <RotateCcw className="h-3 w-3" />
                Reset all filters
              </button>
            </div>
          )}
        </div>

        {/* Live Interactive Map Display - Takes the primary Hero visual space */}
        <div className="relative mt-4 h-[540px] sm:h-[600px] lg:h-[660px] w-full overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#1C2536]">
          {/* Map Top Floating Header HUD */}
          <div className="pointer-events-none absolute top-4 inset-x-4 z-[999] flex flex-wrap items-center justify-between gap-2">
            <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/95 px-3.5 py-2 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-[#1C2536]/95">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-zinc-900 dark:text-white" />
              ) : (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
              )}
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {loading
                  ? 'Filtering map...'
                  : `${properties.length} ${properties.length === 1 ? 'Property' : 'Properties'} on Map`}
              </span>
            </div>

            <Link
              href={getCatalogLink()}
              className="pointer-events-auto flex min-h-[38px] items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-black dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
            >
              <span>View in Catalog ({total})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Interactive Map */}
          <CatalogMapView properties={properties} className="h-full w-full" />

          {/* Zero results overlay banner */}
          {!loading && properties.length === 0 && (
            <div className="absolute inset-x-4 top-20 z-[999] mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white/95 p-4 text-center shadow-xl backdrop-blur dark:border-zinc-700 dark:bg-[#1C2536]/95">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                No verified properties found matching the selected filters.
              </p>
              <p className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                Try selecting &ldquo;All Categories&rdquo; or clearing city/budget filters to view available listings.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2.5 inline-flex min-h-[34px] items-center gap-1 rounded-xl bg-zinc-900 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-black dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
