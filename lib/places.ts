export type LatLng = { lat: number; lng: number };

export type RouteResult = {
  line: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
};

const geocodeCache = new Map<string, LatLng | null>();

const KNOWN_PLACES: { name: string; point: LatLng }[] = [
  { name: "dhaka", point: { lat: 23.8103, lng: 90.4125 } },
  { name: "cumilla", point: { lat: 23.4607, lng: 91.1809 } },
  { name: "comilla", point: { lat: 23.4607, lng: 91.1809 } },
  { name: "chittagong", point: { lat: 22.3569, lng: 91.7832 } },
  { name: "chattogram", point: { lat: 22.3569, lng: 91.7832 } },
  { name: "barisal", point: { lat: 22.701, lng: 90.3535 } },
  { name: "barishal", point: { lat: 22.701, lng: 90.3535 } },
  { name: "khulna", point: { lat: 22.8456, lng: 89.5403 } },
  { name: "sylhet", point: { lat: 24.8949, lng: 91.8687 } },
  { name: "rajshahi", point: { lat: 24.3745, lng: 88.6042 } },
  { name: "rangpur", point: { lat: 25.7439, lng: 89.2752 } },
  { name: "mymensingh", point: { lat: 24.7471, lng: 90.4203 } },
];

function knownPlace(query: string): LatLng | null {
  const key = query.trim().toLowerCase().replace(/,?\s*bangladesh$/, "");
  return KNOWN_PLACES.find((place) => place.name === key)?.point ?? null;
}

export async function geocodePlace(query: string): Promise<LatLng | null> {
  const q = query.trim();
  if (!q) return null;
  const key = q.toLowerCase();
  if (geocodeCache.has(key)) return geocodeCache.get(key) ?? null;

  const known = knownPlace(q);
  if (known) {
    geocodeCache.set(key, known);
    return known;
  }

  const search = /bangladesh/i.test(q) ? q : `${q}, Bangladesh`;
  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(search)}&limit=1&lat=23.7&lon=90.4&bbox=88.0,20.5,92.8,26.7`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      features?: { geometry?: { coordinates?: [number, number] } }[];
    };
    const coords = data.features?.[0]?.geometry?.coordinates;
    if (!coords) {
      geocodeCache.set(key, null);
      return null;
    }
    const point = { lng: coords[0], lat: coords[1] };
    geocodeCache.set(key, point);
    return point;
  } catch {
    return null;
  }
}

export async function drivingRoute(from: LatLng, to: LatLng): Promise<RouteResult | null> {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      routes?: {
        distance: number;
        duration: number;
        geometry?: { coordinates?: [number, number][] };
      }[];
    };
    const route = data.routes?.[0];
    const coordinates = route?.geometry?.coordinates;
    if (!route || !coordinates?.length) return null;
    return {
      line: coordinates.map(([lng, lat]) => [lat, lng]),
      distanceMeters: route.distance,
      durationSeconds: route.duration,
    };
  } catch {
    return null;
  }
}

export function formatTripSpan(distanceMeters: number, durationSeconds: number): string {
  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  const km = distanceMeters / 1000;
  const distance = km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
  return `${minutes} min · ${distance}`;
}

export function bearingDegrees(from: LatLng, to: LatLng): number {
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

export function pointAlongLine(
  line: [number, number][],
  fraction: number,
): (LatLng & { heading: number }) | null {
  if (line.length === 0) return null;
  const start = { lat: line[0][0], lng: line[0][1] };
  if (line.length === 1) return { ...start, heading: 0 };
  const t = Math.min(1, Math.max(0, fraction));
  const lengths: number[] = [];
  let total = 0;
  for (let i = 1; i < line.length; i += 1) {
    const segment = haversineMeters(
      { lat: line[i - 1][0], lng: line[i - 1][1] },
      { lat: line[i][0], lng: line[i][1] },
    );
    lengths.push(segment);
    total += segment;
  }
  let target = total * t;
  for (let i = 1; i < line.length; i += 1) {
    const segment = lengths[i - 1];
    const from = { lat: line[i - 1][0], lng: line[i - 1][1] };
    const to = { lat: line[i][0], lng: line[i][1] };
    if (target <= segment || i === line.length - 1) {
      const ratio = segment === 0 ? 0 : Math.min(1, target / segment);
      return {
        lat: from.lat + (to.lat - from.lat) * ratio,
        lng: from.lng + (to.lng - from.lng) * ratio,
        heading: bearingDegrees(from, to),
      };
    }
    target -= segment;
  }
  const end = line[line.length - 1];
  return { lat: end[0], lng: end[1], heading: 0 };
}

export function haversineMeters(a: LatLng, b: LatLng): number {
  const radius = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.asin(Math.min(1, Math.sqrt(h)));
}
