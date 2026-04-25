/**
 * Maps internal classification values to user-facing display labels.
 * Internal value "Trash" is displayed as "Landfill" in the UI.
 */
export const DISPLAY_LABELS: Record<string, string> = {
  Trash: 'Landfill',
  Recycling: 'Recycling',
  Compost: 'Compost',
};

export function displayLabel(classification: string): string {
  return DISPLAY_LABELS[classification] ?? classification;
}
