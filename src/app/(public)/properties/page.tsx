'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import { CatalogMapView } from '@/components/map/CatalogMapView';
import {
  Search,
  MapPin,
  Building,
  SlidersHorizontal,
  ArrowUpDown,
  Bed,
  Bath,
  Maximize,
  Sparkles,
  Crosshair,
  LayoutGrid,
  Map as MapIcon,
  Loader2,
  X,
} from 'lucide-react';

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [locating, setLocating] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filters State synced from URL search params
  const city = searchParams.get('city') || '';
  const listingType = searchParams.get('listingType') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const bedrooms = searchParams.get('bedrooms') || '';
  const sort = searchParams.get('sort') || 'newest';
  const q = searchParams.get('q') || '';
  const lat = searchParams.get('lat') || '';
  const lng = searchParams.get('lng') || '';
  const radiusKm = searchParams.get('radiusKm') || '10';

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const params = new URLSearchParams(searchParams.toString());
        params.set('lat', pos.coords.latitude.toFixed(6));
        params.set('lng', pos.coords.longitude.toFixed(6));
        params.set('radiusKm', radiusKm || '10');
        params.set('page', '1');
        router.push(`/properties?${params.toString()}`);
      },
      () => {
        setLocating(false);
        alert('Could not retrieve your GPS location. Please check browser permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const clearLocationFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('lat');
    params.delete('lng');
    params.delete('radiusKm');
    router.push(`/properties?${params.toString()}`);
  };

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/properties?${params.toString()}`);
  };

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const queryStr = searchParams.toString();
      const res = await api.get(`/api/v1/properties?${queryStr}`);
      setProperties(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
    } catch {
      setProperties([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const activeFiltersCount = [
    listingType,
    category,
    city,
    bedrooms,
    minPrice,
    maxPrice,
    lat,
  ].filter(Boolean).length;

  const renderFilterContent = () => (
    <div className="space-y-6">
      {/* Listing Type */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Listing Type
        </label>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {[
            { id: '', label: 'All' },
            { id: 'sale', label: 'Buy' },
            { id: 'rent', label: 'Rent' },
            { id: 'lease', label: 'Lease' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => updateFilters('listingType', t.id)}
              className={`min-h-[38px] rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                listingType === t.id
                  ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-950'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Category
        </label>
        <div className="mt-2.5 flex flex-col gap-1.5">
          {[
            { id: '', label: 'All Categories' },
            { id: 'residential', label: 'Residential' },
            { id: 'commercial', label: 'Commercial' },
            { id: 'plot_land', label: 'Plots & Land' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => updateFilters('category', c.id)}
              className={`min-h-[40px] rounded-xl px-3.5 py-2 text-left text-xs font-medium transition ${
                category === c.id
                  ? 'bg-zinc-100 font-bold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          City
        </label>
        <div className="mt-2 flex min-h-[42px] items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
          <MapPin className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            defaultValue={city}
            onBlur={(e) => updateFilters('city', e.target.value)}
            placeholder="e.g. Ahmedabad"
            className="ml-2 w-full bg-transparent text-xs text-slate-900 outline-none dark:text-white"
          />
        </div>
      </div>

      {/* Bedrooms (BHK) */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Bedrooms (BHK)
        </label>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {['1', '2', '3', '4', '5'].map((bhk) => (
            <button
              key={bhk}
              onClick={() => updateFilters('bedrooms', bedrooms === bhk ? '' : bhk)}
              className={`min-h-[38px] min-w-[42px] rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                bedrooms === bhk
                  ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-950'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {bhk} BHK
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Budget (INR)
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            type="number"
            defaultValue={minPrice}
            onBlur={(e) => updateFilters('minPrice', e.target.value)}
            placeholder="Min"
            className="min-h-[42px] rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <input
            type="number"
            defaultValue={maxPrice}
            onBlur={(e) => updateFilters('maxPrice', e.target.value)}
            placeholder="Max"
            className="min-h-[42px] rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-50 px-4 py-2.5 dark:bg-slate-800/60">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            defaultValue={q}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateFilters('q', (e.target as HTMLInputElement).value);
              }
            }}
            placeholder="Search by locality, society, or keyword (Press Enter)..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Mobile Filter Sheet Trigger */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex min-h-[42px] items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-900 dark:text-white" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-950">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Near Me Geo-Filter */}
          <button
            type="button"
            onClick={handleNearMe}
            disabled={locating}
            className={`flex min-h-[42px] items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-bold transition shadow-sm ${
              lat && lng
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-950'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
            title="Find properties near your current GPS location"
          >
            {locating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-900 dark:text-white" />
            ) : (
              <Crosshair className="h-3.5 w-3.5 text-zinc-900 dark:text-white" />
            )}
            <span>{locating ? 'Locating...' : lat ? `Near Me (${radiusKm}km)` : 'Near Me'}</span>
          </button>

          {/* Sort Selector */}
          <div className="flex min-h-[42px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => updateFilters('sort', e.target.value)}
              className="bg-transparent outline-none dark:bg-slate-800 dark:text-white dark:[color-scheme:dark]"
            >
              <option value="newest" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Newest First</option>
              <option value="price_asc" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Price: Low to High</option>
              <option value="price_desc" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Price: High to Low</option>
              <option value="views" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Most Viewed</option>
            </select>
          </div>

          {/* Grid vs Map Toggle */}
          <div className="flex min-h-[42px] items-center rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex min-h-[34px] min-w-[34px] items-center justify-center rounded-xl p-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex min-h-[34px] min-w-[34px] items-center justify-center rounded-xl p-1.5 transition ${
                viewMode === 'map'
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Interactive Map View"
            >
              <MapIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Off-Canvas Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileFiltersOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white shadow-2xl dark:bg-[#1C2536]">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-zinc-900 dark:text-white" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                    {activeFiltersCount} active
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex min-h-[42px] min-w-[42px] items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Filters */}
            <div className="flex-1 overflow-y-auto p-5">
              {renderFilterContent()}
            </div>

            {/* Sticky Bottom Actions */}
            <div className="sticky bottom-0 z-10 flex gap-2.5 border-t border-slate-100 bg-white/95 p-4 backdrop-blur dark:border-slate-800 dark:bg-[#1C2536]/95">
              <button
                type="button"
                onClick={() => {
                  router.push('/properties');
                  setMobileFiltersOpen(false);
                }}
                className="flex-1 min-h-[42px] rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-[2] min-h-[42px] rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-black dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
              >
                View {total} {total === 1 ? 'Property' : 'Properties'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Desktop Left Filter Sidebar - Hidden on mobile to prevent occluding listings */}
        <aside className="hidden h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:block dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <SlidersHorizontal className="h-4 w-4 text-zinc-900 dark:text-white" />
              <span>Filters</span>
            </div>
            <button
              onClick={() => router.push('/properties')}
              className="text-xs font-semibold text-zinc-700 hover:underline dark:text-zinc-300"
            >
              Reset
            </button>
          </div>

          <div className="mt-5">
            {renderFilterContent()}
          </div>
        </aside>

        {/* Right Properties Grid */}
        <main>
          {/* Active Near Me Geo-Radius Filter Banner */}
          {lat && lng && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                <Crosshair className="h-4 w-4 text-zinc-900 dark:text-white" />
                <span>Showing verified properties within</span>
                <div className="flex items-center gap-1">
                  {['2', '5', '10', '25'].map((r) => (
                    <button
                      key={r}
                      onClick={() => updateFilters('radiusKm', r)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                        radiusKm === r
                          ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-950'
                          : 'bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-slate-800 dark:text-zinc-300'
                      }`}
                    >
                      {r} km
                    </button>
                  ))}
                </div>
                <span>of your GPS location</span>
              </div>

              <button
                onClick={clearLocationFilter}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline dark:text-rose-400"
              >
                <X className="h-3.5 w-3.5" />
                <span>Clear Radius</span>
              </button>
            </div>
          )}

          <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {properties.length} of {total} verified properties</span>
            <span className="text-[11px] font-medium text-slate-400">
              {viewMode === 'map' ? 'Interactive Map Active' : 'Grid Catalog Active'}
            </span>
          </div>

          {viewMode === 'map' ? (
            <div className="space-y-4">
              <CatalogMapView properties={properties} className="h-[600px] w-full" />
            </div>
          ) : loading ? (
            <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <span className="text-sm text-slate-500">Loading catalog...</span>
            </div>
          ) : properties.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white text-center dark:border-slate-800 dark:bg-slate-900">
              <Building className="h-10 w-10 text-slate-400" />
              <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                No matching properties found
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Try widening your budget or clearing filters to see more listings.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {properties.map((prop) => (
                <Link
                  key={prop._id}
                  href={`/properties/${prop.slug}`}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="relative h-52 w-full bg-slate-100 dark:bg-slate-800">
                    {prop.images?.[0]?.url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={prop.images[0].url}
                        alt={prop.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <Building className="h-8 w-8" />
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="rounded-full bg-slate-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                        For {prop.listingType}
                      </span>
                      {prop.isFeatured && (
                        <span className="flex items-center gap-1 rounded-full bg-zinc-900/90 px-2.5 py-1 text-[10px] font-bold uppercase text-white backdrop-blur dark:bg-white/90 dark:text-zinc-950">
                          <Sparkles className="h-3 w-3" /> Featured
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {formatPrice(prop.price)}
                      {prop.listingType === 'rent' && (
                        <span className="text-xs font-normal text-slate-400"> / mo</span>
                      )}
                    </div>

                    <h3 className="mt-1 text-base font-semibold text-slate-800 line-clamp-1 group-hover:text-black dark:text-slate-100 dark:group-hover:text-white">
                      {prop.title}
                    </h3>

                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                      <span className="line-clamp-1">
                        {prop.location.locality}, {prop.location.city}
                      </span>
                    </div>

                    {/* Specs Row */}
                    <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
                      {Boolean(prop.details?.bedrooms) && (
                        <div className="flex items-center gap-1">
                          <Bed className="h-3.5 w-3.5 text-slate-400" />
                          <span>{String(prop.details.bedrooms)} BHK</span>
                        </div>
                      )}
                      {Boolean(prop.details?.bathrooms) && (
                        <div className="flex items-center gap-1">
                          <Bath className="h-3.5 w-3.5 text-slate-400" />
                          <span>{String(prop.details.bathrooms)} Bath</span>
                        </div>
                      )}
                      {Boolean(prop.details?.carpetArea) && (
                        <div className="flex items-center gap-1">
                          <Maximize className="h-3.5 w-3.5 text-slate-400" />
                          <span>{String(prop.details.carpetArea)} sq ft</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm">Loading properties...</div>}>
      <PropertiesContent />
    </Suspense>
  );
}
