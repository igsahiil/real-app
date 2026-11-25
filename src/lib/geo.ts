/**
 * Geospatial, Distance & Mapping Utilities for RV Group Ltd
 */

// Haversine formula to compute great-circle distance between two points in km
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

// Google Maps API key provided by user
export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBZWAtodU4XyRrCd4A6vVhvyZQPrSQ7QdY';

// Helper to instantiate official Google Maps tile layer in Leaflet
export function createGoogleMapsTileLayer(
  L: typeof import('leaflet'),
  layerType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain' = 'roadmap'
) {
  const typeCode =
    layerType === 'satellite'
      ? 's'
      : layerType === 'hybrid'
      ? 'y'
      : layerType === 'terrain'
      ? 'p'
      : 'm'; // default roadmap

  return L.tileLayer(
    `https://mt{s}.google.com/vt/lyrs=${typeCode}&x={x}&y={y}&z={z}&key=${GOOGLE_MAPS_API_KEY}`,
    {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Google Maps</a>',
    }
  );
}

// Generate universal Google Maps turn-by-turn navigation link
export function getGoogleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

// Reverse geocoding via OpenStreetMap Nominatim (free, open-source)
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{
  address?: string;
  city?: string;
  locality?: string;
  pincode?: string;
  society?: string;
}> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'RVGroupLtd/1.0',
        },
      }
    );
    if (!res.ok) return {};
    const data = await res.json();
    const addr = data.address || {};

    const city =
      addr.city || addr.town || addr.municipality || addr.state_district || '';
    const locality =
      addr.suburb ||
      addr.neighbourhood ||
      addr.quarter ||
      addr.village ||
      addr.county ||
      '';
    const society =
      addr.building ||
      addr.residential ||
      addr.commercial ||
      addr.amenity ||
      '';
    const pincode = addr.postcode || '';

    const shortParts = [
      addr.house_number,
      addr.road || addr.street,
      locality,
      city,
    ].filter(Boolean);
    const fullAddress =
      shortParts.length >= 2
        ? shortParts.join(', ')
        : data.display_name?.split(',').slice(0, 3).join(',').trim() || '';

    return {
      address: fullAddress,
      city,
      locality,
      pincode,
      society,
    };
  } catch {
    return {};
  }
}

// Common city landmarks reference hub
export interface LandmarkItem {
  name: string;
  category: 'Airport' | 'Railway' | 'Metro' | 'Hospital' | 'Tech Park' | 'Mall';
  distance: string;
}

export function getNearbyHubs(lat: number, lng: number): LandmarkItem[] {
  // Key regional benchmark coordinates (e.g. Ahmedabad / Gandhinagar / Gujarat hub)
  const referenceHubs = [
    { name: 'Sardar Vallabhbhai Patel Intl. Airport', category: 'Airport' as const, lat: 23.0772, lng: 72.6347 },
    { name: 'Ahmedabad Junction Railway Station (Kalupur)', category: 'Railway' as const, lat: 23.0238, lng: 72.6006 },
    { name: 'Gujarat High Court / Thaltej Metro Station', category: 'Metro' as const, lat: 23.0567, lng: 72.5152 },
    { name: 'SG Highway IT Corridor & Infocity', category: 'Tech Park' as const, lat: 23.1895, lng: 72.6288 },
    { name: 'Apollo Super-Specialty Hospital', category: 'Hospital' as const, lat: 23.1118, lng: 72.6083 },
    { name: 'Palladium Mall / SG Highway Commercial Hub', category: 'Mall' as const, lat: 23.0543, lng: 72.5188 },
  ];

  return referenceHubs
    .map((hub) => {
      const dist = haversineDistance(lat, lng, hub.lat, hub.lng);
      return {
        name: hub.name,
        category: hub.category,
        distance: formatDistance(dist),
        rawDist: dist,
      };
    })
    .sort((a, b) => a.rawDist - b.rawDist)
    .slice(0, 4)
    .map(({ name, category, distance }) => ({ name, category, distance }));
}

// In-map Place Search via OpenStreetMap Nominatim
export interface PlaceSearchResult {
  lat: number;
  lng: number;
  displayName: string;
  city?: string;
  locality?: string;
  pincode?: string;
}

export async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query.trim()
      )}&countrycodes=in&limit=5&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'RVGroupLtd/1.0',
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    interface NominatimItem {
      lat: string;
      lon: string;
      display_name: string;
      address?: Record<string, string>;
    }

    return (data as NominatimItem[]).map((item) => {
      const addr = item.address || {};
      const city =
        addr.city || addr.town || addr.municipality || addr.state_district || '';
      const locality =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.quarter ||
        addr.village ||
        '';
      const pincode = addr.postcode || '';

      return {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        displayName: item.display_name,
        city,
        locality,
        pincode,
      };
    });
  } catch {
    return [];
  }
}

export interface PolygonAreaResult {
  sqMeters: number;
  sqFt: number;
  sqYards: number; // Gaj
  acres: number;
  bigha: number; // Gujarat standard: ~1 Bigha = 1600 to 1742 sq yards (approx 1742.4 sq yards / 15680 sq ft)
}

// Calculate geodesic surface area of a polygon from its [lat, lng] vertices
export function calculatePolygonArea(coords: [number, number][]): PolygonAreaResult {
  if (!coords || coords.length < 3) {
    return { sqMeters: 0, sqFt: 0, sqYards: 0, acres: 0, bigha: 0 };
  }

  const R = 6378137; // WGS84 earth radius in meters
  let area = 0;
  const len = coords.length;

  for (let i = 0; i < len; i++) {
    const j = (i + 1) % len;
    const lat1 = (coords[i][0] * Math.PI) / 180;
    const lon1 = (coords[i][1] * Math.PI) / 180;
    const lat2 = (coords[j][0] * Math.PI) / 180;
    const lon2 = (coords[j][1] * Math.PI) / 180;
    area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs((area * R * R) / 2);
  const sqMeters = Math.round(area);
  const sqFt = Math.round(area * 10.7639104);
  const sqYards = Math.round(sqFt / 9); // Gaj
  const acres = Number((sqFt / 43560).toFixed(3));
  const bigha = Number((sqYards / 1742.4).toFixed(2));

  return { sqMeters, sqFt, sqYards, acres, bigha };
}

// Calculate perimeter of boundary in meters
export function calculatePerimeter(coords: [number, number][]): number {
  if (!coords || coords.length < 2) return 0;
  let totalKm = 0;
  const len = coords.length;
  for (let i = 0; i < len; i++) {
    const next = (i + 1) % len;
    totalKm += haversineDistance(coords[i][0], coords[i][1], coords[next][0], coords[next][1]);
  }
  return Math.round(totalKm * 1000);
}

// Create a standard rectangular plot boundary centered at [centerLat, centerLng]
export function createDefaultPlotRectangle(
  centerLat: number,
  centerLng: number,
  widthMeters = 30,
  heightMeters = 25
): [number, number][] {
  // Approximate meters to degrees conversion
  const dLat = (heightMeters / 2) / 111320;
  const dLng = (widthMeters / 2) / (111320 * Math.cos((centerLat * Math.PI) / 180));

  return [
    [centerLat + dLat, centerLng - dLng], // Top Left
    [centerLat + dLat, centerLng + dLng], // Top Right
    [centerLat - dLat, centerLng + dLng], // Bottom Right
    [centerLat - dLat, centerLng - dLng], // Bottom Left
  ];
}

