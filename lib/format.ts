/**
 * Formats material type or item description from snake_case to Title Case
 * Examples:
 * - "plastic_bottle" -> "Plastic Bottle"
 * - "aluminum_can" -> "Aluminum Can"
 * - "food_waste" -> "Food Waste"
 */
export function formatItemName(name: string | null | undefined): string {
  if (!name) return 'Unknown Item';
  
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formats classification type to Title Case
 * Examples:
 * - "Trash" -> "Trash"
 * - "Recycling" -> "Recycling"
 * - "Compost" -> "Compost"
 */
export function formatClassification(classification: string): string {
  return classification.charAt(0).toUpperCase() + classification.slice(1).toLowerCase();
}
