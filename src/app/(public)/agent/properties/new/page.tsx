'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { LocationPickerMap } from '@/components/map/LocationPickerMap';
import { reverseGeocode, type PlaceSearchResult, type PolygonAreaResult } from '@/lib/geo';
import { Building, MapPin, ListChecks, Image as ImageIcon, CheckCircle, ArrowRight, ArrowLeft, Globe, Lock, UploadCloud, Video, FileText, Trash2, Star, Plus, Loader2 } from 'lucide-react';

export default function NewPropertyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boundaryCoords, setBoundaryCoords] = useState<[number, number][]>([]);
  const [areaNotice, setAreaNotice] = useState<string | null>(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState<'photos' | 'video' | 'pdf' | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const reverseGeoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const skipNextReverseGeoRef = useRef(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    listingType: 'sale' as 'sale' | 'rent' | 'lease',
    category: 'residential' as 'residential' | 'commercial' | 'plot_land',
    visibility: 'public' as 'public' | 'private',
    propertyType: 'Apartment',
    price: 9500000,
    priceNegotiable: true,
    maintenance: 3500,
    securityDeposit: 0,
    location: {
      city: 'Ahmedabad',
      locality: 'Satellite',
      society: 'Shivalik Edge',
      pincode: '380015',
      address: 'Near Jodhpur Cross Roads, Satellite',
      coordinates: [72.5293, 23.0298] as [number, number],
      boundary: undefined as { type: 'Polygon'; coordinates: [number, number][][] } | undefined,
    },
    details: {
      bedrooms: 3,
      bathrooms: 3,
      carpetArea: 1850,
      plotArea: undefined as number | undefined,
      furnishing: 'semi',
    },
    amenities: ['Swimming Pool', 'Gymnasium & Fitness', '24/7 Security & CCTV', 'Covered Car Parking'],
    images: [
      { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80', isCover: true },
      { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000&auto=format&fit=crop&q=80', isCover: false },
      { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&auto=format&fit=crop&q=80', isCover: false },
    ],
    videoUrl: '',
    floorPlanUrl: '',
    documents: [] as { name: string; url: string }[],
  });

  const availableAmenities = [
    'Swimming Pool',
    'Gymnasium & Fitness',
    '24/7 Security & CCTV',
    'Power Backup',
    'Clubhouse',
    'Landscaped Garden',
    'Children Play Area',
    'Covered Car Parking',
    'High-Speed Elevators',
    'Gated Community',
  ];

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleBoundaryChange = (coords: [number, number][]) => {
    setBoundaryCoords(coords);
    if (coords.length >= 3) {
      const ring = coords.map(([lat, lng]) => [lng, lat] as [number, number]);
      ring.push([coords[0][1], coords[0][0]]);
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          boundary: {
            type: 'Polygon',
            coordinates: [ring],
          },
        },
      }));
    } else {
      setFormData((prev) => {
        const nextLoc = { ...prev.location };
        delete nextLoc.boundary;
        return { ...prev, location: nextLoc };
      });
    }
  };

  const handleApplyArea = (area: PolygonAreaResult) => {
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        plotArea: area.sqYards,
        carpetArea: area.sqFt,
      },
    }));
    setAreaNotice(`Applied ${area.sqYards.toLocaleString()} Sq Yards (${area.sqFt.toLocaleString()} sq ft) to property details`);
    setTimeout(() => setAreaNotice(null), 4000);
  };

  const syncLocationDetailsFromCoords = (lat: number, lng: number) => {
    if (skipNextReverseGeoRef.current) {
      skipNextReverseGeoRef.current = false;
      return;
    }

    if (reverseGeoTimeoutRef.current) {
      clearTimeout(reverseGeoTimeoutRef.current);
    }

    reverseGeoTimeoutRef.current = setTimeout(async () => {
      setIsReverseGeocoding(true);
      try {
        const geo = await reverseGeocode(lat, lng);
        if (geo.city || geo.locality || geo.pincode || geo.address) {
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              city: geo.city || prev.location.city,
              locality: geo.locality || prev.location.locality,
              society: geo.society !== undefined ? geo.society : prev.location.society,
              pincode: geo.pincode || prev.location.pincode,
              address: geo.address || prev.location.address,
            },
          }));
        }
      } finally {
        setIsReverseGeocoding(false);
      }
    }, 450);
  };

  const handlePlaceSelect = (place: PlaceSearchResult) => {
    skipNextReverseGeoRef.current = true;
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: [place.lng, place.lat],
        city: place.city || prev.location.city,
        locality: place.locality || prev.location.locality,
        society: place.displayName.split(',')[0]?.trim() || '',
        pincode: place.pincode || prev.location.pincode,
        address: place.displayName.split(',').slice(0, 3).join(',').trim() || prev.location.address,
      },
    }));
  };

  const handleMediaUpload = async (
    fileList: FileList | null,
    target: 'photos' | 'video' | 'pdf'
  ) => {
    if (!fileList || fileList.length === 0) return;
    setUploadingMedia(target);
    setUploadError(null);

    try {
      const payload = new FormData();
      Array.from(fileList).forEach((file) => {
        payload.append('files', file);
      });

      const res = await api.post('/api/v1/uploads', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploaded: Array<{ url: string; originalName: string; kind: 'image' | 'video' | 'pdf' }> =
        res.data?.data?.files || [];

      if (target === 'photos') {
        const newImgs = uploaded.filter((f) => f.kind === 'image');
        setFormData((prev) => {
          const hasCover = prev.images.some((i) => i.isCover);
          const mapped = newImgs.map((img, i) => ({
            url: img.url,
            isCover: !hasCover && i === 0,
          }));
          return {
            ...prev,
            images: [...prev.images, ...mapped],
          };
        });
      } else if (target === 'video') {
        const vid = uploaded.find((f) => f.kind === 'video');
        if (vid) {
          setFormData((prev) => ({ ...prev, videoUrl: vid.url }));
        }
      } else if (target === 'pdf') {
        const pdfs = uploaded.filter((f) => f.kind === 'pdf');
        setFormData((prev) => ({
          ...prev,
          floorPlanUrl: prev.floorPlanUrl || pdfs[0]?.url || '',
          documents: [
            ...prev.documents,
            ...pdfs.map((p) => ({ name: p.originalName, url: p.url })),
          ],
        }));
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'File upload failed';
      setUploadError(msg);
    } finally {
      setUploadingMedia(null);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/api/v1/agent/properties', formData);
      router.push('/agent/properties');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Submission failed';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Wizard Header */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Post Property Listing
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Provide accurate details and photos. New submissions are submitted for administrator review.
        </p>

        {/* Steps Tracker */}
        <div className="mt-8 flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto pb-2 -mx-2 px-2">
          {[
            { id: 1, label: 'Basic Info', icon: Building },
            { id: 2, label: 'Location', icon: MapPin },
            { id: 3, label: 'Details', icon: ListChecks },
            { id: 4, label: 'Media', icon: ImageIcon },
            { id: 5, label: 'Review', icon: CheckCircle },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={`flex min-h-[40px] flex-shrink-0 items-center gap-1.5 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-semibold transition ${
                  step === s.id
                    ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-950'
                    : step > s.id
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="inline">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl bg-rose-50 p-4 text-xs font-medium text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Step Content Card */}
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Step 1: Basic Information</h2>
            
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Listing Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Spacious 3 BHK Designer Apartment in Satellite"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Listing Visibility Scope</label>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, visibility: 'public' })}
                  className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
                    formData.visibility === 'public'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 dark:border-indigo-500 dark:bg-indigo-950/40'
                      : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      formData.visibility === 'public' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}
                  >
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Public Listing</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      Published to live interactive map, public catalog, and searchable by all visitors.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, visibility: 'private' })}
                  className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
                    formData.visibility === 'private'
                      ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600 dark:border-purple-500 dark:bg-purple-950/40'
                      : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      formData.visibility === 'private' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}
                  >
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Private (Off-Market)</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      Hidden from public maps & search. Accessible only to clients with your secure token link.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Listing Type</label>
                <select
                  value={formData.listingType}
                  onChange={(e) => setFormData({ ...formData, listingType: e.target.value as 'sale' | 'rent' | 'lease' })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:[color-scheme:dark]"
                >
                  <option value="sale" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Buy / Sale</option>
                  <option value="rent" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Rent</option>
                  <option value="lease" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Lease</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as 'residential' | 'commercial' | 'plot_land' })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:[color-scheme:dark]"
                >
                  <option value="residential" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Residential</option>
                  <option value="commercial" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Commercial</option>
                  <option value="plot_land" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Plot / Land</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Property Type</label>
                <input
                  type="text"
                  value={formData.propertyType}
                  onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                  placeholder="Apartment, Villa, Office"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Price (INR)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Monthly Maintenance</label>
                <input
                  type="number"
                  value={formData.maintenance}
                  onChange={(e) => setFormData({ ...formData, maintenance: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe key highlights, floor position, sunlight, ventilation, society amenities..."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Step 2: Property Location &amp; Coordinates</h2>
              <p className="text-xs text-slate-500">
                Pinpoint the exact rooftop location on the interactive map or enter your property address.
              </p>
            </div>

            {/* Interactive Leaflet Location Map */}
            <div className="mt-2">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Interactive Map: Search, Pinpoint &amp; Plot Boundary
                </label>
                {formData.category === 'plot_land' && (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                    Plot Boundary Mode Recommended
                  </span>
                )}
              </div>
              <LocationPickerMap
                lat={formData.location.coordinates[1]}
                lng={formData.location.coordinates[0]}
                boundary={boundaryCoords}
                onBoundaryChange={handleBoundaryChange}
                onPlaceSelect={handlePlaceSelect}
                onApplyArea={handleApplyArea}
                initialMode={formData.category === 'plot_land' ? 'boundary' : 'pin'}
                onChange={({ lat, lng }) => {
                  const fixedLat = Number(lat.toFixed(6));
                  const fixedLng = Number(lng.toFixed(6));
                  setFormData((prev) => ({
                    ...prev,
                    location: {
                      ...prev.location,
                      coordinates: [fixedLng, fixedLat],
                    },
                  }));
                  syncLocationDetailsFromCoords(fixedLat, fixedLng);
                }}
                className="h-80 w-full"
              />

              {areaNotice && (
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>{areaNotice}</span>
                </div>
              )}
            </div>

            {/* Coordinates Display */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-3.5 dark:border-slate-700/60 dark:bg-[#0E1626]/60">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.location.coordinates[1]}
                    onChange={(e) => {
                      const lat = parseFloat(e.target.value) || 0;
                      const lng = formData.location.coordinates[0];
                      setFormData((prev) => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          coordinates: [lng, lat],
                        },
                      }));
                      if (lat !== 0 && lng !== 0) {
                        syncLocationDetailsFromCoords(lat, lng);
                      }
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold tabular-nums text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.location.coordinates[0]}
                    onChange={(e) => {
                      const lng = parseFloat(e.target.value) || 0;
                      const lat = formData.location.coordinates[1];
                      setFormData((prev) => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          coordinates: [lng, lat],
                        },
                      }));
                      if (lat !== 0 && lng !== 0) {
                        syncLocationDetailsFromCoords(lat, lng);
                      }
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold tabular-nums text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              {isReverseGeocoding && (
                <p className="mt-2 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                  Updating city, locality, pincode &amp; address from selected coordinates...
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">City</label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) =>
                    setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Locality / Area</label>
                <input
                  type="text"
                  value={formData.location.locality}
                  onChange={(e) =>
                    setFormData({ ...formData, location: { ...formData.location, locality: e.target.value } })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Society / Project Name</label>
                <input
                  type="text"
                  value={formData.location.society}
                  onChange={(e) =>
                    setFormData({ ...formData, location: { ...formData.location, society: e.target.value } })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Pincode</label>
                <input
                  type="text"
                  value={formData.location.pincode}
                  onChange={(e) =>
                    setFormData({ ...formData, location: { ...formData.location, pincode: e.target.value } })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Full Address</label>
              <input
                type="text"
                value={formData.location.address}
                onChange={(e) =>
                  setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Step 3: Specifications & Amenities</h2>

            {formData.category === 'plot_land' ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Plot Area (Square Yards / Gaj)
                  </label>
                  <input
                    type="number"
                    value={formData.details.plotArea || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        details: { ...formData.details, plotArea: Number(e.target.value) },
                      })
                    }
                    placeholder="e.g. 250"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <span className="mt-1 block text-[11px] text-slate-400">
                    1 Sq Yard = 9 Sq Ft (Gujarati Gaj)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Total Area (Square Feet)
                  </label>
                  <input
                    type="number"
                    value={
                      formData.details.carpetArea ||
                      (formData.details.plotArea ? formData.details.plotArea * 9 : '')
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        details: { ...formData.details, carpetArea: Number(e.target.value) },
                      })
                    }
                    placeholder="e.g. 2250"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Bedrooms (BHK)</label>
                  <input
                    type="number"
                    value={formData.details.bedrooms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        details: { ...formData.details, bedrooms: Number(e.target.value) },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Bathrooms</label>
                  <input
                    type="number"
                    value={formData.details.bathrooms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        details: { ...formData.details, bathrooms: Number(e.target.value) },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Carpet Area (sq ft)</label>
                  <input
                    type="number"
                    value={formData.details.carpetArea}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        details: { ...formData.details, carpetArea: Number(e.target.value) },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Society Amenities</label>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {availableAmenities.map((amenity) => {
                  const isChecked = formData.amenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs font-medium transition ${
                        isChecked
                          ? 'border-amber-600 bg-amber-50/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400'
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center ${
                          isChecked ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isChecked && '✓'}
                      </div>
                      <span>{amenity}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Step 4: Photos, Videos &amp; PDFs</h2>
              <p className="text-xs text-slate-500">
                Upload high-resolution photos, walkthrough videos, and PDF brochures/floor plans, or paste direct URLs.
              </p>
            </div>

            {uploadError && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                {uploadError}
              </div>
            )}

            {/* 1. Photos Section */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Property Photos</h3>
                  <p className="text-[11px] text-slate-500">JPG, PNG, WEBP up to 50MB</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700">
                    {uploadingMedia === 'photos' ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UploadCloud className="h-3.5 w-3.5" />
                    )}
                    <span>{uploadingMedia === 'photos' ? 'Uploading...' : 'Upload Photos'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      className="hidden"
                      disabled={uploadingMedia !== null}
                      onChange={(e) => {
                        handleMediaUpload(e.target.files, 'photos');
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        images: [...prev.images, { url: '', isCover: prev.images.length === 0 }],
                      }))
                    }
                    className="inline-flex min-h-[38px] items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add URL
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900">
                    {img.url && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={img.url}
                        alt={`Preview ${idx + 1}`}
                        className="h-12 w-16 shrink-0 rounded-lg object-cover bg-slate-100"
                      />
                    )}
                    <input
                      type="text"
                      value={img.url}
                      onChange={(e) => {
                        const newImages = [...formData.images];
                        newImages[idx].url = e.target.value;
                        setFormData({ ...formData, images: newImages });
                      }}
                      placeholder="https://..."
                      className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.images.map((item, i) => ({
                            ...item,
                            isCover: i === idx,
                          }));
                          setFormData({ ...formData, images: updated });
                        }}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                          img.isCover
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <Star className={`h-3 w-3 ${img.isCover ? 'fill-amber-500 text-amber-500' : ''}`} />
                        {img.isCover ? 'Cover' : 'Set Cover'}
                      </button>

                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = formData.images.filter((_, i) => i !== idx);
                            if (img.isCover && filtered.length > 0) {
                              filtered[0].isCover = true;
                            }
                            setFormData({ ...formData, images: filtered });
                          }}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Remove photo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Property Video Section */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                    <Video className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Property Walkthrough Video</h3>
                    <p className="text-[11px] text-slate-500">Upload MP4, WEBM, MOV (up to 50MB) or paste a video link</p>
                  </div>
                </div>

                <label className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-purple-700">
                  {uploadingMedia === 'video' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <UploadCloud className="h-3.5 w-3.5" />
                  )}
                  <span>{uploadingMedia === 'video' ? 'Uploading...' : 'Upload Video'}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    disabled={uploadingMedia !== null}
                    onChange={(e) => {
                      handleMediaUpload(e.target.files, 'video');
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="Or paste YouTube / direct MP4 video URL..."
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                {formData.videoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, videoUrl: '' })}
                    className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:bg-slate-900"
                  >
                    Clear
                  </button>
                )}
              </div>

              {formData.videoUrl && !formData.videoUrl.includes('youtube') && !formData.videoUrl.includes('youtu.be') && (
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-black dark:border-slate-700">
                  <video src={formData.videoUrl} controls className="max-h-52 w-full" />
                </div>
              )}
            </div>

            {/* 3. PDFs (Brochures, Floor Plans & Legal Docs) */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">PDF Brochures &amp; Floor Plans</h3>
                    <p className="text-[11px] text-slate-500">Attach PDF brochures, RERA certificates, or floor plan sheets</p>
                  </div>
                </div>

                <label className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700">
                  {uploadingMedia === 'pdf' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <UploadCloud className="h-3.5 w-3.5" />
                  )}
                  <span>{uploadingMedia === 'pdf' ? 'Uploading...' : 'Upload PDFs'}</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    multiple
                    className="hidden"
                    disabled={uploadingMedia !== null}
                    onChange={(e) => {
                      handleMediaUpload(e.target.files, 'pdf');
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>

              {formData.documents.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {formData.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                    >
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 font-semibold text-indigo-600 hover:underline dark:text-indigo-400 truncate"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-rose-500" />
                        <span className="truncate">{doc.name}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            documents: prev.documents.filter((_, i) => i !== idx),
                          }))
                        }
                        className="ml-2 rounded-lg p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Remove PDF"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-400">No PDF documents attached yet.</p>
              )}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Step 5: Review & Submit</h2>

            <div className="rounded-2xl bg-slate-50 p-4 text-xs space-y-2 dark:bg-slate-800/60">
              <p><strong>Title:</strong> {formData.title}</p>
              <p><strong>Price:</strong> ₹{formData.price.toLocaleString('en-IN')}</p>
              <p><strong>Location:</strong> {formData.location.society ? `${formData.location.society}, ` : ''}{formData.location.locality}, {formData.location.city}</p>
              <p>
                <strong>Specs:</strong>{' '}
                {formData.category === 'plot_land'
                  ? `${formData.details.plotArea || '-'} Sq Yards (Gaj) • ${formData.details.carpetArea || '-'} sq ft`
                  : `${formData.details.bedrooms} BHK • ${formData.details.carpetArea} sq ft`}
              </p>
              {formData.location.boundary && (
                <p className="text-amber-600 dark:text-amber-400 font-semibold">
                  ✓ Interactive Plot Boundary Demarcated ({formData.location.boundary.coordinates[0].length - 1} Corners)
                </p>
              )}
              <p><strong>Selected Amenities:</strong> {formData.amenities.join(', ')}</p>
              <p>
                <strong>Media Attached:</strong> {formData.images.filter((i) => i.url).length} Photos
                {formData.videoUrl ? ' • 1 Video' : ''}
                {formData.documents.length > 0 ? ` • ${formData.documents.length} PDF(s)` : ''}
              </p>
            </div>
          </div>
        )}

        {/* Wizard Navigation: Responsive Mobile Bottom Sticky Bar */}
        <div className="sticky bottom-0 z-20 -mx-8 -mb-8 mt-8 flex items-center justify-between border-t border-slate-200/80 bg-white/95 p-4 backdrop-blur dark:border-slate-700/60 dark:bg-[#1C2536]/95 sm:static sm:mx-0 sm:mb-0 sm:bg-transparent sm:p-0 sm:border-slate-100 sm:pt-5 sm:backdrop-blur-none dark:sm:border-slate-800 dark:sm:bg-transparent">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex min-h-[42px] items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 sm:border-0 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex min-h-[42px] items-center gap-1.5 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-black dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="flex min-h-[42px] items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Property for Moderation'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
