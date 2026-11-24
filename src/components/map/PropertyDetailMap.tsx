'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import {
  getGoogleMapsDirectionsUrl,
  getNearbyHubs,
  calculatePolygonArea,
  calculatePerimeter,
  createGoogleMapsTileLayer,
} from '@/lib/geo';
import { formatPrice } from '@/lib/utils';
import {
  MapPin,
  Navigation,
  ExternalLink,
  ShieldCheck,
  Building,
  Plane,
  Train,
  Hospital,
  ShoppingBag,
  Layers,
} from 'lucide-react';

interface PropertyDetailMapProps {
  lat: number;
  lng: number;
  title: string;
  price: number;
  address: string;
  city: string;
  locality: string;
  boundary?: {
    type: 'Polygon';
    coordinates: [number, number][][];
  } | [number, number][];
}

export function PropertyDetailMap({
  lat,
  lng,
  title,
  price,
  address,
  city,
  locality,
  boundary,
}: PropertyDetailMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const [mounted, setMounted] = useState(false);

  // Parse boundary coordinates into [lat, lng][]
  const leafletBoundary = useMemo<[number, number][]>(() => {
    if (!boundary) return [];
    if (Array.isArray(boundary) && boundary.length > 0) {
      if (Array.isArray(boundary[0]) && typeof boundary[0][0] === 'number') {
        return boundary as [number, number][];
      }
    } else if (
      typeof boundary === 'object' &&
      'coordinates' in boundary &&
      Array.isArray(boundary.coordinates?.[0])
    ) {
      // GeoJSON [[lng, lat], ...] -> [[lat, lng], ...]
      return boundary.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
    }
    return [];
  }, [boundary]);

  const boundaryArea = useMemo(
    () => (leafletBoundary.length >= 3 ? calculatePolygonArea(leafletBoundary) : null),
    [leafletBoundary]
  );
  const boundaryPerimeter = useMemo(
    () => (leafletBoundary.length >= 3 ? calculatePerimeter(leafletBoundary) : 0),
    [leafletBoundary]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapContainerRef.current) return;

    let isCancelled = false;

    import('leaflet').then((L) => {
      if (isCancelled || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const mapLat = lat || 23.0298;
      const mapLng = lng || 72.5293;

      const map = L.map(mapContainerRef.current, {
        center: [mapLat, mapLng],
        zoom: 15,
        maxZoom: 18,
        zoomControl: false,
      });

      // Google Maps high-resolution tile layers with user API Key
      const googleRoadmap = createGoogleMapsTileLayer(L, 'roadmap');
      const googleHybrid = createGoogleMapsTileLayer(L, 'hybrid');
      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      });

      // Default active base layer is Google Maps Roadmap
      googleRoadmap.addTo(map);

      // Layer switcher control
      L.control.layers(
        {
          'Google Roadmap': googleRoadmap,
          'Google Satellite Hybrid': googleHybrid,
          'OpenStreetMap': osm,
        },
        undefined,
        { position: 'topright' }
      ).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Render polygon boundary if present
      if (leafletBoundary.length >= 3) {
        const poly = L.polygon(leafletBoundary, {
          color: '#18181B',
          weight: 2.5,
          fillColor: '#09090B',
          fillOpacity: 0.25,
        }).addTo(map);

        leafletBoundary.forEach((coord, idx) => {
          const cornerIcon = L.divIcon({
            className: 'custom-corner-icon',
            html: `
              <div style="width: 16px; height: 16px; border-radius: 9999px; background: #09090B; border: 2px solid #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 9px; font-weight: bold;">
                ${idx + 1}
              </div>
            `,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
          L.marker(coord, { icon: cornerIcon }).addTo(map);
        });

        const bounds = poly.getBounds();
        bounds.extend([mapLat, mapLng]);
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 18 });
      }

      // Custom Property Pin Marker with price bubble
      const propertyPinIcon = L.divIcon({
        className: 'custom-property-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="background: #09090B; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45); white-space: nowrap; border: 2px solid #ffffff;">
              ${formatPrice(price)}
            </div>
            <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #09090B; margin-top: -1px;"></div>
            <div style="width: 10px; height: 10px; border-radius: 9999px; background: #09090B; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.3); margin-top: 1px;"></div>
          </div>
        `,
        iconSize: [80, 42],
        iconAnchor: [40, 42],
      });

      L.marker([mapLat, mapLng], { icon: propertyPinIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: inherit; font-size: 12px; padding: 2px;">
            <strong style="color: #0f172a; display: block; margin-bottom: 2px;">${title}</strong>
            <span style="color: #64748b; font-size: 11px;">${locality}, ${city}</span>
          </div>
        `);

      mapInstanceRef.current = map;
    });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mounted, lat, lng, price, title, locality, city, leafletBoundary]);

  const nearbyHubs = getNearbyHubs(lat || 23.0298, lng || 72.5293);
  const directionsUrl = getGoogleMapsDirectionsUrl(lat || 23.0298, lng || 72.5293);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Airport':
        return Plane;
      case 'Railway':
      case 'Metro':
        return Train;
      case 'Hospital':
        return Hospital;
      case 'Mall':
        return ShoppingBag;
      default:
        return Building;
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Location &amp; Neighborhood
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <ShieldCheck className="h-3 w-3" />
              Verified Coordinates
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-indigo-500" />
            <span>
              {address ? `${address}, ` : ''}
              {locality}, {city}
            </span>
          </p>
        </div>

        {/* Directions Action */}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-black dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
        >
          <Navigation className="h-4 w-4" />
          <span>Get Directions</span>
          <ExternalLink className="h-3 w-3 opacity-70" />
        </a>
      </div>

      {/* Interactive Map */}
      <div className="relative h-72 w-full">
        <div ref={mapContainerRef} className="h-full w-full" />
      </div>

      {/* Demarcated Plot Boundary & Geometry HUD */}
      {boundaryArea && boundaryArea.sqYards > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-[#0E1626]/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Demarcated Plot Boundary &amp; Geometry
                </h4>
                <p className="text-[11px] text-slate-400">
                  Survey boundary mapped with {leafletBoundary.length} perimeter corner vertices
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-xl border border-indigo-200 bg-indigo-50/90 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
                {boundaryArea.sqYards.toLocaleString()} Sq Yards (Gaj)
              </span>
              <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                {boundaryArea.sqFt.toLocaleString()} sq ft
              </span>
              <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {boundaryArea.acres} Acres ({boundaryArea.bigha} Bigha)
              </span>
              <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                Perimeter: {boundaryPerimeter.toLocaleString()} m
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nearby Key Infrastructure & Transit Distances */}
      <div className="border-t border-slate-100 p-6 dark:border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Proximity to Regional Hubs
        </h4>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {nearbyHubs.map((hub) => {
            const Icon = getCategoryIcon(hub.category);
            return (
              <div
                key={hub.name}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                    {hub.name}
                  </p>
                  <p className="text-[11px] font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
                    {hub.distance}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
