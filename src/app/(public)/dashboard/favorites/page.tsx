'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Heart, Building, MapPin, Trash2, Bed, Maximize } from 'lucide-react';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/favorites');
      setFavorites(res.data.data || []);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await api.delete(`/api/v1/favorites/${id}`);
      setFavorites((prev) => prev.filter((p) => p._id !== id));
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Removal failed';
      alert(msg);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          My Saved Properties
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track saved residential homes, commercial offices, and investment land.
        </p>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <span className="text-sm text-slate-500">Loading favorites...</span>
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white text-center dark:border-slate-800 dark:bg-slate-900">
            <Heart className="h-10 w-10 text-slate-400" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
              No saved properties yet
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Browse our catalog and tap the heart icon to save listings.
            </p>
            <Link
              href="/properties"
              className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((prop) => (
              <div
                key={prop._id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800">
                  {prop.images?.[0]?.url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={prop.images[0].url} alt={prop.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <Building className="h-8 w-8" />
                    </div>
                  )}

                  <button
                    onClick={() => handleRemove(prop._id)}
                    className="absolute top-3 right-3 rounded-full bg-white/90 p-2 text-rose-600 shadow-sm transition hover:bg-white dark:bg-slate-900/90"
                    title="Remove from favorites"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5">
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {formatPrice(prop.price)}
                  </div>

                  <Link href={`/properties/${prop.slug}`}>
                    <h3 className="mt-1 text-base font-semibold text-slate-800 line-clamp-1 hover:text-indigo-600 dark:text-slate-100">
                      {prop.title}
                    </h3>
                  </Link>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                    <span className="line-clamp-1">{prop.location.locality}, {prop.location.city}</span>
                  </div>

                  <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
                    {Boolean(prop.details?.bedrooms) && (
                      <div className="flex items-center gap-1">
                        <Bed className="h-3.5 w-3.5 text-slate-400" />
                        <span>{String(prop.details.bedrooms)} BHK</span>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
