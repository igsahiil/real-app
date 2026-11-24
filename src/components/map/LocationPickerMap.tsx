'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type {
  Map as LeafletMap,
  Marker as LeafletMarker,
  Polygon as LeafletPolygon,
  LeafletMouseEvent,
} from 'leaflet';
import {
  Crosshair,
  MapPin,
  Loader2,
  Search,
  X,
  Square,
  Undo2,
  Trash2,
  Layers,
  Check,
} from 'lucide-react';
import {
  searchPlaces,
  calculatePolygonArea,
  calculatePerimeter,
  createDefaultPlotRectangle,
  createGoogleMapsTileLayer,
  type PlaceSearchResult,
  type PolygonAreaResult,
} from '@/lib/geo';

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onChange: (coords: { lat: number; lng: number }) => void;
  boundary?: [number, number][]; // [[lat, lng], ...]
  onBoundaryChange?: (coords: [number, number][]) => void;
  onPlaceSelect?: (place: PlaceSearchResult) => void;
  className?: string;
  readOnly?: boolean;
  initialMode?: 'pin' | 'boundary';
  onApplyArea?: (area: PolygonAreaResult) => void;
}

export function LocationPickerMap({
  lat,
  lng,
  onChange,
  boundary = [],
  onBoundaryChange,
  onPlaceSelect,
  className = 'h-80 w-full',
  readOnly = false,
  initialMode = 'pin',
  onApplyArea,
}: LocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const polygonRef = useRef<LeafletPolygon | null>(null);
  const vertexMarkersRef = useRef<LeafletMarker[]>([]);
  const leafletModuleRef = useRef<typeof import('leaflet') | null>(null);

  const [mounted, setMounted] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mode, setMode] = useState<'pin' | 'boundary'>(
    boundary && boundary.length >= 3 ? 'boundary' : initialMode
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Active boundary state
  const [activeBoundary, setActiveBoundary] = useState<[number, number][]>(boundary || []);
  const [areaInfo, setAreaInfo] = useState<PolygonAreaResult | null>(null);
  const [perimeterMeters, setPerimeterMeters] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update area stats whenever activeBoundary changes
  useEffect(() => {
    if (activeBoundary && activeBoundary.length >= 3) {
      const area = calculatePolygonArea(activeBoundary);
      const perim = calculatePerimeter(activeBoundary);
      setAreaInfo(area);
      setPerimeterMeters(perim);
    } else {
      setAreaInfo(null);
      setPerimeterMeters(0);
    }
  }, [activeBoundary]);

  // Sync external boundary prop changes
  useEffect(() => {
    if (boundary && JSON.stringify(boundary) !== JSON.stringify(activeBoundary)) {
      setActiveBoundary(boundary);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boundary]);

  // Debounced search handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!val || val.trim().length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      setSearching(false);
      return;
    }

    setSearching(true);
    setSearchOpen(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchPlaces(val);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const handleSelectPlace = (place: PlaceSearchResult) => {
    setSearchQuery(place.displayName.split(',')[0]);
    setSearchOpen(false);
    onChange({ lat: place.lat, lng: place.lng });

    if (onPlaceSelect) {
      onPlaceSelect(place);
    }

    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([place.lat, place.lng]);
      mapInstanceRef.current.flyTo([place.lat, place.lng], 16, { duration: 1.2 });
    }
  };

  // Re-render boundary polygon and vertex handles
  const renderBoundaryLayer = useCallback(
    (coords: [number, number][]) => {
      const L = leafletModuleRef.current;
      const map = mapInstanceRef.current;
      if (!L || !map) return;

      // Remove existing polygon & vertex markers
      if (polygonRef.current) {
        polygonRef.current.remove();
        polygonRef.current = null;
      }
      vertexMarkersRef.current.forEach((m) => m.remove());
      vertexMarkersRef.current = [];

      if (!coords || coords.length === 0) return;

      // Draw polygon if 2 or more points
      if (coords.length >= 2) {
        const poly = L.polygon(coords, {
          color: '#18181B',
          weight: 2.5,
          fillColor: '#09090B',
          fillOpacity: 0.25,
          dashArray: coords.length < 3 ? '6, 6' : undefined,
        }).addTo(map);
        polygonRef.current = poly;
      }

      // If not read-only, create draggable vertex handles
      if (!readOnly) {
        coords.forEach((vertex, idx) => {
          const vertexIcon = L.divIcon({
            className: 'custom-vertex-handle',
            html: `
              <div style="
                width: 16px;
                height: 16px;
                border-radius: 9999px;
                background: #09090B;
                border: 2.5px solid #ffffff;
                box-shadow: 0 2px 5px rgba(0,0,0,0.35);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                font-size: 9px;
                font-weight: bold;
                cursor: grab;
              ">
                ${idx + 1}
              </div>
            `,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });

          const vMarker = L.marker(vertex, {
            icon: vertexIcon,
            draggable: true,
            zIndexOffset: 1000,
          }).addTo(map);

          vMarker.on('drag', (e) => {
            const newPos = (e.target as LeafletMarker).getLatLng();
            const updated = [...coords];
            updated[idx] = [Number(newPos.lat.toFixed(6)), Number(newPos.lng.toFixed(6))];
            if (polygonRef.current) {
              polygonRef.current.setLatLngs(updated);
            }
          });

          vMarker.on('dragend', (e) => {
            const newPos = (e.target as LeafletMarker).getLatLng();
            const updated = [...coords];
            updated[idx] = [Number(newPos.lat.toFixed(6)), Number(newPos.lng.toFixed(6))];
            setActiveBoundary(updated);
            if (onBoundaryChange) {
              onBoundaryChange(updated);
            }
          });

          vMarker.on('click', (e) => {
            L.DomEvent.stopPropagation(e as unknown as Event);
          });

          vertexMarkersRef.current.push(vMarker);
        });
      }
    },
    [readOnly, onBoundaryChange]
  );

  // Initialize Map
  useEffect(() => {
    if (!mounted || !mapContainerRef.current) return;

    let isCancelled = false;

    import('leaflet').then((L) => {
      if (isCancelled || !mapContainerRef.current) return;
      leafletModuleRef.current = L;

      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Custom styled pin icon
      const customPinIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
            <div style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; background: rgba(0, 0, 0, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 30px; height: 30px; border-radius: 9999px; background: #09090B; border: 2.5px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; color: #ffffff;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const currentLat = lat || 23.0298;
      const currentLng = lng || 72.5293;

      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 15,
        maxZoom: 18,
        minZoom: 4,
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
        { position: 'bottomright' }
      ).addTo(map);

      // Add zoom control to top-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add center draggable pin
      const marker = L.marker([currentLat, currentLng], {
        icon: customPinIcon,
        draggable: !readOnly,
      }).addTo(map);

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        onChange({
          lat: Number(position.lat.toFixed(6)),
          lng: Number(position.lng.toFixed(6)),
        });
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Render initial boundary if provided
      if (activeBoundary && activeBoundary.length > 0) {
        renderBoundaryLayer(activeBoundary);
        if (activeBoundary.length >= 3) {
          const bounds = L.latLngBounds(activeBoundary);
          map.fitBounds(bounds, { padding: [30, 30], maxZoom: 18 });
        }
      }
    });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Click handler on map according to current mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || readOnly) return;

    const handleClick = (e: LeafletMouseEvent) => {
      if (mode === 'pin') {
        const newLat = Number(e.latlng.lat.toFixed(6));
        const newLng = Number(e.latlng.lng.toFixed(6));
        if (markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng]);
        }
        onChange({ lat: newLat, lng: newLng });
      } else if (mode === 'boundary') {
        // Add vertex to active boundary
        const newCoord: [number, number] = [
          Number(e.latlng.lat.toFixed(6)),
          Number(e.latlng.lng.toFixed(6)),
        ];
        const updated = [...activeBoundary, newCoord];
        setActiveBoundary(updated);
        renderBoundaryLayer(updated);
        if (onBoundaryChange) {
          onBoundaryChange(updated);
        }
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [mode, activeBoundary, readOnly, onChange, onBoundaryChange, renderBoundaryLayer]);

  // Re-sync boundary layer when activeBoundary state updates
  useEffect(() => {
    renderBoundaryLayer(activeBoundary);
  }, [activeBoundary, renderBoundaryLayer]);

  // Ensure map tiles recompute properly when switching mode
  useEffect(() => {
    if (mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  // Sync if parent changes initialMode prop
  const prevInitialModeRef = useRef(initialMode);
  useEffect(() => {
    if (initialMode !== prevInitialModeRef.current) {
      prevInitialModeRef.current = initialMode;
      setMode(initialMode);
    }
  }, [initialMode]);

  // Sync external lat/lng changes
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current && lat && lng) {
      const cur = markerRef.current.getLatLng();
      if (Math.abs(cur.lat - lat) > 0.0001 || Math.abs(cur.lng - lng) > 0.0001) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.panTo([lat, lng]);
      }
    }
  }, [lat, lng]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const newLat = Number(pos.coords.latitude.toFixed(6));
        const newLng = Number(pos.coords.longitude.toFixed(6));
        onChange({ lat: newLat, lng: newLng });
        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng]);
          mapInstanceRef.current.flyTo([newLat, newLng], 16);
        }
      },
      () => {
        setLocating(false);
        alert('Could not retrieve your location. Please check browser GPS permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Preset Rectangle plot action
  const handleCreatePresetRectangle = () => {
    const currentLat = lat || 23.0298;
    const currentLng = lng || 72.5293;
    const rect = createDefaultPlotRectangle(currentLat, currentLng, 32, 25);
    setActiveBoundary(rect);
    renderBoundaryLayer(rect);
    if (onBoundaryChange) {
      onBoundaryChange(rect);
    }
    if (mapInstanceRef.current && leafletModuleRef.current) {
      const bounds = leafletModuleRef.current.latLngBounds(rect);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 18 });
    }
  };

  // Undo last boundary vertex
  const handleUndoVertex = () => {
    if (activeBoundary.length === 0) return;
    const updated = activeBoundary.slice(0, -1);
    setActiveBoundary(updated);
    renderBoundaryLayer(updated);
    if (onBoundaryChange) {
      onBoundaryChange(updated);
    }
  };

  // Clear all boundary vertices
  const handleClearBoundary = () => {
    setActiveBoundary([]);
    renderBoundaryLayer([]);
    if (onBoundaryChange) {
      onBoundaryChange([]);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 ${className} ${mode === 'boundary' && !readOnly ? '[&_.leaflet-container]:!cursor-crosshair' : ''
        }`}
    >
      {/* Map DOM Container - static class so React never wipes Leaflet internal classes */}
      <div ref={mapContainerRef} className="h-full w-full" style={{ minHeight: '100%' }} />

      {/* TOP BAR: Search Box & Tools */}
      {!readOnly && (
        <div className="absolute top-3 left-3 right-14 z-[1001] flex flex-wrap items-center gap-2">
          {/* Autocomplete Search Bar */}
          <div className="relative min-w-[200px] flex-1 max-w-md">
            <div className="flex items-center rounded-xl border border-slate-200/90 bg-white/95 px-3 py-1.5 shadow-md backdrop-blur transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-slate-700/80 dark:bg-[#1C2536]/95">
              <Search className="mr-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (searchResults.length > 0) setSearchOpen(true);
                }}
                placeholder="Search place, society, road, or city..."
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none dark:text-white"
              />
              {searching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setSearchOpen(false);
                  }}
                  className="rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            {/* Search Results Dropdown */}
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-[#1C2536]">
                {searchResults.map((res, i) => (
                  <button
                    key={`${res.lat}-${res.lng}-${i}`}
                    type="button"
                    onClick={() => handleSelectPlace(res)}
                    className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition hover:bg-indigo-50 dark:hover:bg-slate-800/70"
                  >
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-800 dark:text-white">
                        {res.displayName.split(',')[0]}
                      </p>
                      <p className="truncate text-[10.5px] text-slate-400">
                        {res.locality ? `${res.locality}, ` : ''}
                        {res.city ? `${res.city}, ` : ''}
                        {res.pincode}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GPS Quick Detect */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={locating}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-md backdrop-blur transition hover:bg-white disabled:opacity-60 dark:border-slate-700 dark:bg-[#1C2536]/95 dark:text-white dark:hover:bg-[#1C2536]"
            title="Detect Current GPS Location"
          >
            {locating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Crosshair className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            )}
            <span className="hidden sm:inline">{locating ? 'Locating...' : 'GPS'}</span>
          </button>

          {/* Mode Switch: Pin vs Boundary */}
          <div className="flex items-center rounded-xl border border-slate-200/90 bg-white/95 p-0.5 shadow-md backdrop-blur dark:border-slate-700/80 dark:bg-[#1C2536]/95">
            <button
              type="button"
              onClick={() => setMode('pin')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${mode === 'pin'
                ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-950'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
            >
              <MapPin className="h-3 w-3" />
              <span>Point Pin</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('boundary')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${mode === 'boundary'
                ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-950'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
            >
              <Square className="h-3 w-3" />
              <span>Plot Boundary</span>
            </button>
          </div>
        </div>
      )}

      {/* BOUNDARY TOOLS TOOLBAR (Shown when in boundary mode) */}
      {!readOnly && mode === 'boundary' && (
        <div className="absolute top-16 right-3 z-[1000] flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleCreatePresetRectangle}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-md backdrop-blur transition hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-[#1C2536]/95 dark:text-slate-200 dark:hover:bg-slate-800"
            title="Create standard 30x25m rectangular plot boundary"
          >
            <Square className="h-3.5 w-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Preset Rectangle</span>
          </button>

          {activeBoundary.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleUndoVertex}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-md backdrop-blur transition hover:bg-slate-100 dark:border-slate-700 dark:bg-[#1C2536]/95 dark:text-slate-200 dark:hover:bg-slate-800"
                title="Undo last corner"
              >
                <Undo2 className="h-3.5 w-3.5 text-amber-500" />
                <span className="hidden sm:inline">Undo Corner</span>
              </button>

              <button
                type="button"
                onClick={handleClearBoundary}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-rose-600 shadow-md backdrop-blur transition hover:bg-rose-50 dark:border-slate-700 dark:bg-[#1C2536]/95 dark:text-rose-400 dark:hover:bg-rose-950/40"
                title="Clear entire plot boundary"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* LIVE AREA HUD CARD (When boundary has >= 3 vertices) */}
      {areaInfo && areaInfo.sqYards > 0 && (
        <div className="absolute bottom-3 left-3 z-[1000] max-w-xs rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-slate-700/80 dark:bg-[#1C2536]/95">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 dark:border-slate-700/60">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-white">
                Plot Boundary Area
              </span>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              {activeBoundary.length} Corners
            </span>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-slate-50 p-2 dark:bg-[#0E1626]/60">
              <span className="block text-[10px] text-slate-400">Square Yards (Gaj)</span>
              <span className="text-sm font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
                {areaInfo.sqYards.toLocaleString()}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-2 dark:bg-[#0E1626]/60">
              <span className="block text-[10px] text-slate-400">Square Feet</span>
              <span className="text-sm font-bold tabular-nums text-slate-800 dark:text-white">
                {areaInfo.sqFt.toLocaleString()}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-2 dark:bg-[#0E1626]/60">
              <span className="block text-[10px] text-slate-400">Acres / Bigha</span>
              <span className="text-xs font-bold tabular-nums text-slate-700 dark:text-slate-300">
                {areaInfo.acres} Ac / {areaInfo.bigha} Bg
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-2 dark:bg-[#0E1626]/60">
              <span className="block text-[10px] text-slate-400">Perimeter</span>
              <span className="text-xs font-bold tabular-nums text-slate-700 dark:text-slate-300">
                {perimeterMeters.toLocaleString()} m
              </span>
            </div>
          </div>

          {onApplyArea && !readOnly && (
            <button
              type="button"
              onClick={() => onApplyArea(areaInfo)}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Check className="h-3 w-3" />
              <span>Use {areaInfo.sqYards.toLocaleString()} Sq Yards in Details</span>
            </button>
          )}
        </div>
      )}

      {/* Coordinates Pill (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-[1000] flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-md backdrop-blur dark:border-slate-700 dark:bg-[#1C2536]/95 dark:text-slate-300">
        <MapPin className="h-3 w-3 text-emerald-500" />
        <span className="tabular-nums">
          {lat?.toFixed(5) || '0.00000'}, {lng?.toFixed(5) || '0.00000'}
        </span>
      </div>

      {/* Instructions pill bottom center */}
      {!readOnly && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-[1000] -translate-x-1/2 hidden rounded-full bg-slate-900/80 px-3 py-1 text-[10.5px] font-medium text-white shadow backdrop-blur sm:block">
          {mode === 'pin'
            ? 'Drag pin or click map to set location'
            : 'Click map to add boundary corners or drag corners to adjust shape'}
        </div>
      )}
    </div>
  );
}
