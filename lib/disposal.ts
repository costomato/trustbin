export function computeIsCorrect(
  aiClassification: 'Trash' | 'Recycling' | 'Compost',
  selectedBin: 'Trash' | 'Recycling' | 'Compost'
): boolean {
  return aiClassification === selectedBin;
}
