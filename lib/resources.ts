import resourcesData from '../data/asu-resources.json';

export interface AsuResource {
  id: string;
  type: 'water_fountain' | 'ewaste_dropoff';
  name: string;
  building: string;
  zone: string;
  coordinates?: { lat: number; lng: number };
  notes?: string;
}

export function loadResources(): AsuResource[] {
  return resourcesData as AsuResource[];
}

/** Haversine distance in kilometers between two lat/lng points */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestResource(
  type: 'water_fountain' | 'ewaste_dropoff',
  userLat: number,
  userLng: number
): AsuResource | null {
  const candidates = loadResources().filter(
    (r) => r.type === type && r.coordinates != null
  );

  if (candidates.length === 0) return null;

  let nearest: AsuResource | null = null;
  let minDist = Infinity;

  for (const resource of candidates) {
    const { lat, lng } = resource.coordinates!;
    const dist = haversineDistance(userLat, userLng, lat, lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = resource;
    }
  }

  return nearest;
}

export function getResourceForClassification(
  classification: string,
  materialType: string
): 'water_fountain' | 'ewaste_dropoff' | null {
  const lower = materialType.toLowerCase();

  if (lower.includes('bottle') || lower.includes('beverage') || lower.includes('cup')) {
    return 'water_fountain';
  }

  if (
    lower.includes('electronics') ||
    lower.includes('battery') ||
    lower.includes('phone') ||
    lower.includes('computer')
  ) {
    return 'ewaste_dropoff';
  }

  return null;
}
