export type Classification = 'Trash' | 'Recycling' | 'Compost';

export interface DisposalItem {
  id: string;
  ai_classification: Classification;
  item_description: string;
  material_type: string | null;
  created_at: string;
  image_url: string | null;
}

/**
 * Groups items by classification.
 * Property 7.3: every item appears in exactly its classification bucket.
 */
export function groupByClassification(items: DisposalItem[]): Record<Classification, DisposalItem[]> {
  const result: Record<Classification, DisposalItem[]> = { Trash: [], Recycling: [], Compost: [] };
  for (const item of items) {
    result[item.ai_classification].push(item);
  }
  return result;
}

/**
 * Maps item count to a fill percentage (0–100).
 * Property 7.6: fill level is monotonically non-decreasing with item count.
 */
export function computeFillLevel(itemCount: number, maxItems = 20): number {
  if (itemCount <= 0) return 0;
  return Math.min(Math.round((itemCount / maxItems) * 100), 100);
}
