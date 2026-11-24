'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Map as LeafletMap, TileLayer as LeafletTileLayer } from 'leaflet';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import { createGoogleMapsTileLayer } from '@/lib/geo';
import {
  Building2,
  ArrowRight,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Heart,
  Navigation,
  Plus,
  Minus,
} from 'lucide-react';

interface CatalogMapViewProps {
  properties: Property[];
  className?: string;
  selectedProperty?: Property | null;
  onSelectProperty?: (property: Property | null) => void;
}

export function CatalogMapView({
  properties,
  className = 'h-full w-full',
  selectedProperty,
  onSelectProperty,
}: CatalogMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const roadmapLayerRef = useRef<LeafletTileLayer | null>(null);
  const hybridLayerRef = useRef<LeafletTileLayer | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);
  const [activeLayer, setActiveLayer] = useState<'roadmap' | 'satellite'>('roadmap');
  const [isFavorited, setIsFavorited] = useState<Record<string, boolean>>({});
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeProp = hoveredProperty || selectedProperty || null;

  useEffect(() => {
    setMounted(true);
    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Toggle map layer between Roadmap and Satellite
  const switchMapLayer = (mode: 'roadmap' | 'satellite') => {
    if (!mapInstanceRef.current || !roadmapLayerRef.current || !hybridLayerRef.current) return;
    setActiveLayer(mode);
    if (mode === 'roadmap') {
      if (mapInstanceRef.current.hasLayer(hybridLayerRef.current)) {
        mapInstanceRef.current.removeLayer(hybridLayerRef.current);
      }
      if (!mapInstanceRef.current.hasLayer(roadmapLayerRef.current)) {
        mapInstanceRef.current.addLayer(roadmapLayerRef.current);
      }
    } else {
      if (mapInstanceRef.current.hasLayer(roadmapLayerRef.current)) {
        mapInstanceRef.current.removeLayer(roadmapLayerRef.current);
      }
      if (!mapInstanceRef.current.hasLayer(hybridLayerRef.current)) {
        mapInstanceRef.current.addLayer(hybridLayerRef.current);
      }
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    const elem = mapContainerRef.current.parentElement || mapContainerRef.current;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // GPS Locate me
  const locateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([pos.coords.latitude, pos.coords.longitude], 14, { animate: true });
      }
    });
  };

  // Zoom helpers
  const zoomIn = () => mapInstanceRef.current?.zoomIn();
  const zoomOut = () => mapInstanceRef.current?.zoomOut();

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

      // Default center fallback (Ahmedabad / Gandhinagar)
      const defaultCenter: [number, number] = [23.1028, 72.5853];

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 12,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
      });

      // Google Maps high-resolution tile layers with user API Key
      const googleRoadmap = createGoogleMapsTileLayer(L, 'roadmap');
      const googleHybrid = createGoogleMapsTileLayer(L, 'hybrid');

      roadmapLayerRef.current = googleRoadmap;
      hybridLayerRef.current = googleHybrid;

      // Default active layer
      googleRoadmap.addTo(map);

      const markersGroup = L.featureGroup();

      properties.forEach((prop) => {
        const coords = prop.location?.geo?.coordinates;
        if (!coords || coords.length < 2) return;

        const lng = coords[0];
        const lat = coords[1];
        const isSelected = activeProp?._id === prop._id;

        // Draw boundary polygon if present (e.g. plot/land)
        if (prop.location?.boundary?.coordinates?.[0] && prop.location.boundary.coordinates[0].length >= 3) {
          const rawRing = prop.location.boundary.coordinates[0];
          const leafletRing: [number, number][] = rawRing.map((c) => [c[1], c[0]]);
          const poly = L.polygon(leafletRing, {
            color: '#4F46E5',
            weight: 2.5,
            fillColor: '#6366F1',
            fillOpacity: 0.25,
          });

          poly.on('mouseover', () => {
            if (leaveTimeoutRef.current) {
              clearTimeout(leaveTimeoutRef.current);
              leaveTimeoutRef.current = null;
            }
            setHoveredProperty(prop);
            onSelectProperty?.(prop);
          });

          poly.on('mouseout', () => {
            leaveTimeoutRef.current = setTimeout(() => {
              setHoveredProperty((cur) => (cur?._id === prop._id ? null : cur));
            }, 400);
          });

          poly.on('click', () => {
            setHoveredProperty(prop);
            onSelectProperty?.(prop);
          });

          markersGroup.addLayer(poly);
        }

        // Custom price tag marker matching the reference UI
        const priceIcon = L.divIcon({
          className: 'realtime-price-pin',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              ${isSelected ? '<div class="radar-pulse-ring"></div>' : ''}
              <div style="
                background: ${isSelected ? '#4338CA' : '#4F46E5'};
                color: #FFFFFF;
                font-weight: 800;
                font-size: 11px;
                padding: 4px 10px;
                border-radius: 9999px;
                display: flex;
                align-items: center;
                gap: 5px;
                box-shadow: 0 4px 14px rgba(79, 70, 229, 0.45);
                border: 2px solid #FFFFFF;
                white-space: nowrap;
                cursor: pointer;
                transition: transform 0.15s ease, background 0.15s ease;
                z-index: 10;
              ">
                <span style="font-size: 11px;">🏠</span>
                <span>${formatPrice(prop.price)}</span>
              </div>
            </div>
          `,
          iconSize: [80, 28],
          iconAnchor: [40, 14],
        });

        const marker = L.marker([lat, lng], { icon: priceIcon });

        marker.on('mouseover', () => {
          if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
            leaveTimeoutRef.current = null;
          }
          marker.setZIndexOffset(1000);
          setHoveredProperty(prop);
          onSelectProperty?.(prop);
        });

        marker.on('mouseout', () => {
          marker.setZIndexOffset(0);
          leaveTimeoutRef.current = setTimeout(() => {
            setHoveredProperty((cur) => (cur?._id === prop._id ? null : cur));
          }, 400);
        });

        marker.on('click', () => {
          if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
            leaveTimeoutRef.current = null;
          }
          marker.setZIndexOffset(1000);
          setHoveredProperty(prop);
          onSelectProperty?.(prop);
        });

        markersGroup.addLayer(marker);
      });

      markersGroup.addTo(map);

      // Fit map to visible markers
      if (properties.length > 0 && markersGroup.getLayers().length > 0) {
        map.fitBounds(markersGroup.getBounds().pad(0.18), { maxZoom: 16 });
      }

      mapInstanceRef.current = map;
      map.invalidateSize();
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
    });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, properties]);

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {/* Map DOM Container */}
      <div
        ref={mapContainerRef}
        className="h-full w-full"
        style={{ minHeight: '520px', height: '100%', width: '100%' }}
      />

      {/* Top Right: Layer Switcher Pill [Map] [Satellite] matching reference image */}
      <div className="absolute top-4 right-4 z-[999] flex items-center rounded-2xl border border-white/20 bg-slate-900/85 p-1 shadow-xl backdrop-blur-md">
        <button
          type="button"
          onClick={() => switchMapLayer('roadmap')}
          className={`min-h-[34px] rounded-xl px-3.5 py-1 text-xs font-bold transition ${
            activeLayer === 'roadmap'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Map
        </button>
        <button
          type="button"
          onClick={() => switchMapLayer('satellite')}
          className={`min-h-[34px] rounded-xl px-3.5 py-1 text-xs font-bold transition ${
            activeLayer === 'satellite'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Bottom Right: Map Controls (Fullscreen, Locate Me, Zoom In/Out) */}
      <div className="absolute right-4 bottom-24 z-[999] flex flex-col items-center gap-1.5 rounded-2xl border border-white/20 bg-slate-900/85 p-1.5 shadow-xl backdrop-blur-md">
        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={locateMe}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white"
          title="Locate My Position"
        >
          <Navigation className="h-4 w-4" />
        </button>
        <div className="h-px w-6 bg-white/15" />
        <button
          type="button"
          onClick={zoomIn}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white"
          title="Zoom In"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={zoomOut}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white"
          title="Zoom Out"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      {/* Floating Property Card displayed when hovering on a pin (matches reference image layout 1:1) */}
      {activeProp && (
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
          className="absolute z-[1000] overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-3.5 shadow-2xl backdrop-blur transition-all duration-200 inset-x-3 bottom-24 sm:inset-auto sm:top-20 sm:left-1/2 sm:-translate-x-1/2 sm:w-[390px] dark:border-slate-700/80 dark:bg-[#1C2536]/95"
        >
          <div className="flex gap-3.5">
            {/* Thumbnail */}
            <div className="relative h-22 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
              {activeProp.images?.[0]?.url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={activeProp.images[0].url}
                  alt={activeProp.title}
                  className="h-full w-full object-cover transition duration-300 hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  <Building2 className="h-6 w-6" />
                </div>
              )}
              <span className="absolute top-1 left-1 rounded-md bg-slate-950/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur">
                For {activeProp.listingType}
              </span>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-1">
                <h4 className="truncate text-xs font-bold text-slate-900 dark:text-white">
                  {activeProp.title}
                </h4>
                <button
                  type="button"
                  onClick={(e) => toggleFavorite(activeProp._id, e)}
                  className="text-slate-400 hover:text-rose-500 transition"
                  aria-label="Favorite"
                >
                  <Heart
                    className={`h-4 w-4 ${isFavorited[activeProp._id] ? 'fill-rose-500 text-rose-500' : ''}`}
                  />
                </button>
              </div>

              <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-slate-500 dark:text-slate-400">
                <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                <span className="truncate">
                  {activeProp.location?.locality ? `${activeProp.location.locality}, ` : ''}
                  {activeProp.location?.city}
                </span>
              </p>

              {/* Price */}
              <div className="mt-1">
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  {formatPrice(activeProp.price)}
                </span>
              </div>

              {/* Specs Pills: BHK • Bath • Sq.Ft */}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                {Boolean(activeProp.features?.bedrooms || activeProp.details?.bedrooms) && (
                  <span className="flex items-center gap-0.5">
                    <Bed className="h-3 w-3 text-slate-400" />
                    <span>{String(activeProp.features?.bedrooms || activeProp.details?.bedrooms)} BHK</span>
                  </span>
                )}
                {Boolean(activeProp.features?.bathrooms || activeProp.details?.bathrooms) && (
                  <span className="flex items-center gap-0.5">
                    <Bath className="h-3 w-3 text-slate-400" />
                    <span>{String(activeProp.features?.bathrooms || activeProp.details?.bathrooms)} Bath</span>
                  </span>
                )}
                {Boolean(activeProp.features?.superBuiltUpArea || activeProp.features?.carpetArea) && (
                  <span className="flex items-center gap-0.5">
                    <Maximize2 className="h-3 w-3 text-slate-400" />
                    <span>
                      {String(activeProp.features?.superBuiltUpArea || activeProp.features?.carpetArea)} sq.ft
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-700/60">
            <span className="text-[10px] text-slate-400">
              Hover off to dismiss
            </span>
            <Link
              href={`/properties/${activeProp.slug}`}
              className="flex min-h-[30px] items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <span>View Property</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
