'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { LocationPickerMap } from '@/components/map/LocationPickerMap';
import { type PlaceSearchResult, type PolygonAreaResult } from '@/lib/geo';
import { Building, MapPin, ListChecks, Image as ImageIcon, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function NewPropertyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boundaryCoords, setBoundaryCoords] = useState<[number, number][]>([]);
  const [areaNotice, setAreaNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    listingType: 'sale' as 'sale' | 'rent' | 'lease',
    category: 'residential' as 'residential' | 'commercial' | 'plot_land',
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

  const handlePlaceSelect = (place: PlaceSearchResult) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: [place.lng, place.lat],
        city: place.city || prev.location.city,
        locality: place.locality || prev.location.locality,
        pincode: place.pincode || prev.location.pincode,
        address: place.displayName.split(',').slice(0, 3).join(',').trim() || prev.location.address,
      },
    }));
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
                  setFormData((prev) => ({
                    ...prev,
                    location: {
                      ...prev.location,
                      coordinates: [Number(lng.toFixed(6)), Number(lat.toFixed(6))],
                    },
                  }));
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
            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200/80 bg-slate-50 p-3.5 dark:border-slate-700/60 dark:bg-[#0E1626]/60">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500">Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.location.coordinates[1]}
                  onChange={(e) => {
                    const lat = parseFloat(e.target.value) || 0;
                    setFormData((prev) => ({
                      ...prev,
                      location: {
                        ...prev.location,
                        coordinates: [prev.location.coordinates[0], lat],
                      },
                    }));
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
                    setFormData((prev) => ({
                      ...prev,
                      location: {
                        ...prev.location,
                        coordinates: [lng, prev.location.coordinates[1]],
                      },
                    }));
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold tabular-nums text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
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
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Step 4: Photos & Visuals</h2>
            <p className="text-xs text-slate-500">Provide direct image URLs for the property gallery.</p>

            <div className="space-y-3">
              {formData.images.map((img, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={img.url}
                    onChange={(e) => {
                      const newImages = [...formData.images];
                      newImages[idx].url = e.target.value;
                      setFormData({ ...formData, images: newImages });
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                      img.isCover ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {img.isCover ? 'Cover Photo' : `Photo ${idx + 1}`}
                  </span>
                </div>
              ))}
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
