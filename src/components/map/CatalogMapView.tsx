'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Map as LeafletMap } from 'leaflet';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import { createGoogleMapsTileLayer } from '@/lib/geo';
import { Building2, ArrowRight, MapPin, Sparkles, X, Bed } from 'lucide-react';

interface CatalogMapViewProps {
  properties: Property[];
  className?: string;
}

export function CatalogMapView({
  properties,
  className = 'h-full w-full',
}: CatalogMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
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

      if (mapContainerRef.current && (mapContainerRef.current as unknown as { _leaflet_id?: number })._leaflet_id) {
        delete (mapContainerRef.current as unknown as { _leaflet_id?: number })._leaflet_id;
      }

      // Default center fallback (Gujarat)
      const defaultCenter: [number, number] = [23.0298, 72.5293];

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 12,
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

      // Layer switcher control for Google Maps Roadmap, Satellite Hybrid, and OSM
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

      const markersGroup = L.featureGroup();

      properties.forEach((prop) => {
        const coords = prop.location?.geo?.coordinates;
        if (!coords || coords.length < 2) return;

        const lng = coords[0];
        const lat = coords[1];

        // Draw boundary polygon if present (e.g. plot/land)
        if (prop.location?.boundary?.coordinates?.[0] && prop.location.boundary.coordinates[0].length >= 3) {
          const rawRing = prop.location.boundary.coordinates[0];
          const leafletRing: [number, number][] = rawRing.map((c) => [c[1], c[0]]);
          const poly = L.polygon(leafletRing, {
            color: '#18181B',
            weight: 2.5,
            fillColor: '#09090B',
            fillOpacity: 0.25,
          });

          poly.on('mouseover', () => {
            if (leaveTimeoutRef.current) {
              clearTimeout(leaveTimeoutRef.current);
              leaveTimeoutRef.current = null;
            }
            setHoveredProperty(prop);
          });

          poly.on('mouseout', () => {
            leaveTimeoutRef.current = setTimeout(() => {
              setHoveredProperty((cur) => (cur?._id === prop._id ? null : cur));
            }, 350);
          });

          poly.on('click', () => {
            if (leaveTimeoutRef.current) {
              clearTimeout(leaveTimeoutRef.current);
              leaveTimeoutRef.current = null;
            }
            setHoveredProperty(prop);
          });

          markersGroup.addLayer(poly);
        }

        // Custom price tag marker
        const priceIcon = L.divIcon({
          className: 'catalog-price-pin',
          html: `
            <div style="background: #09090B; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45); white-space: nowrap; border: 2px solid #FFFFFF; cursor: pointer; transition: transform 0.15s ease;">
              ${formatPrice(prop.price)}
            </div>
          `,
          iconSize: [60, 28],
          iconAnchor: [30, 14],
        });

        const marker = L.marker([lat, lng], { icon: priceIcon });

        marker.on('mouseover', () => {
          if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
            leaveTimeoutRef.current = null;
          }
          marker.setZIndexOffset(1000);
          setHoveredProperty(prop);
        });

        marker.on('mouseout', () => {
          marker.setZIndexOffset(0);
          leaveTimeoutRef.current = setTimeout(() => {
            setHoveredProperty((cur) => (cur?._id === prop._id ? null : cur));
          }, 350);
        });

        marker.on('click', () => {
          if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
            leaveTimeoutRef.current = null;
          }
          marker.setZIndexOffset(1000);
          setHoveredProperty(prop);
        });

        markersGroup.addLayer(marker);
      });

      markersGroup.addTo(map);

      // Fit map to visible markers
      if (properties.length > 0 && markersGroup.getLayers().length > 0) {
        map.fitBounds(markersGroup.getBounds().pad(0.15), { maxZoom: 17 });
      }

      mapInstanceRef.current = map;
      map.invalidateSize();
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 500);
    });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mounted, properties]);

  return (
    <div className={`relative h-full w-full min-h-[420px] overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      {/* Map DOM Container */}
      <div
        ref={mapContainerRef}
        className="h-full w-full"
        style={{ minHeight: '420px', height: '100%', width: '100%' }}
      />

      {/* Floating Property Card displayed ONLY when hovering on a property marker */}
      {hoveredProperty && (
        <div
          onMouseEnter={() => {
            if (leaveTimeoutRef.current) {
              clearTimeout(leaveTimeoutRef.current);
              leaveTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => {
            setHoveredProperty(null);
          }}
          className="absolute inset-x-3 bottom-3 z-[1000] overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-3.5 shadow-2xl backdrop-blur transition-all duration-200 sm:inset-auto sm:bottom-4 sm:left-4 sm:w-88 dark:border-slate-700/80 dark:bg-[#1C2536]/95"
        >
          <div className="flex gap-3">
            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
              {hoveredProperty.images?.[0]?.url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={hoveredProperty.images[0].url}
                  alt={hoveredProperty.title}
                  className="h-full w-full object-cover transition duration-300 hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  <Building2 className="h-6 w-6" />
                </div>
              )}
              <span className="absolute top-1 left-1 rounded-md bg-slate-950/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur">
                For {hoveredProperty.listingType}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {formatPrice(hoveredProperty.price)}
                </span>
                {hoveredProperty.isFeatured && (
                  <span className="flex items-center gap-0.5 rounded-full border border-zinc-200 bg-zinc-100 px-1.5 py-0.2 text-[9px] font-bold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                    <Sparkles className="h-2.5 w-2.5" /> Featured
                  </span>
                )}
              </div>

              <h4 className="mt-0.5 truncate text-xs font-bold text-slate-900 dark:text-white">
                {hoveredProperty.title}
              </h4>

              <p className="flex items-center gap-1 truncate text-[11px] text-slate-400">
                <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                <span className="truncate">
                  {hoveredProperty.location?.locality}, {hoveredProperty.location?.city}
                </span>
              </p>

              <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                {hoveredProperty.category === 'plot_land' ? (
                  <span>{String(hoveredProperty.details?.plotArea || '-')} Sq Yards</span>
                ) : (
                  <span className="flex items-center gap-0.5">
                    <Bed className="h-3 w-3 text-slate-400" />
                    <span>{String(hoveredProperty.details?.bedrooms || '-')} BHK</span>
                  </span>
                )}
                {hoveredProperty.location?.boundary && (
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    • Demarcated Plot
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setHoveredProperty(null)}
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Close preview"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-700/60">
            <span className="text-[10px] font-medium text-slate-400">
              Hover off to dismiss
            </span>
            <Link
              href={`/properties/${hoveredProperty.slug}`}
              className="flex min-h-[32px] items-center gap-1 rounded-xl bg-zinc-900 px-3.5 py-1 text-xs font-bold text-white shadow-sm transition hover:bg-black dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
            >
              <span>View Details</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
