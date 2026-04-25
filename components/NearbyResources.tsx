'use client';

import { findNearestResource, getResourceForClassification, AsuResource } from '@/lib/resources';

interface NearbyResourcesProps {
  classification: string;
  materialType: string;
  userLat: number;
  userLng: number;
}

export default function NearbyResources({
  classification,
  materialType,
  userLat,
  userLng,
}: NearbyResourcesProps) {
  const resourceType = getResourceForClassification(classification, materialType);
  if (!resourceType) return null;

  const resource: AsuResource | null = findNearestResource(resourceType, userLat, userLng);
  if (!resource) return null;

  const label = resourceType === 'water_fountain' ? '💧 Nearest Water Fountain' : '♻️ Nearest E-Waste Drop-Off';

  return (
    <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
      <p className="font-semibold text-blue-800">{label}</p>
      <p className="mt-1 text-blue-900">{resource.name}</p>
      <p className="text-blue-700">{resource.building} · {resource.zone}</p>
      {resource.notes && (
        <p className="mt-1 text-blue-600 italic">{resource.notes}</p>
      )}
    </div>
  );
}
