/**
 * Contextual education tips for the loading screen and scan flow.
 * Req 9.1: Surface tips relevant to recently scanned items.
 * Req 9.4: Generate tips from classification and material type.
 */

const TIPS_BY_MATERIAL: Record<string, string[]> = {
  aluminum_can: [
    'Recycling one aluminum can saves enough energy to run a TV for 3 hours.',
    'Aluminum can be recycled indefinitely without losing quality.',
  ],
  plastic_bottle: [
    'Plastic bottles take up to 450 years to decompose in a landfill.',
    'Rinsing bottles before recycling prevents contamination of entire batches.',
  ],
  cardboard: [
    'Recycling cardboard uses 75% less energy than making it from raw materials.',
    'Flatten boxes to save space and make collection more efficient.',
  ],
  food_waste: [
    'Food waste in landfills produces methane, a potent greenhouse gas.',
    'Composting food scraps returns nutrients to the soil naturally.',
  ],
  electronics: [
    'E-waste contains valuable metals like gold and copper that can be recovered.',
    'Never put batteries or electronics in regular trash — they can cause fires.',
  ],
  glass_bottle: [
    'Glass is 100% recyclable and can be recycled endlessly without quality loss.',
    'Recycling glass reduces CO₂ emissions by about 315 kg per tonne.',
  ],
  paper: [
    'Recycling one ton of paper saves 17 trees and 7,000 gallons of water.',
    'Paper can be recycled 5–7 times before fibers become too short.',
  ],
};

const GENERIC_TIPS = [
  'Small actions add up — every correct disposal makes a difference.',
  'ASU diverts over 40% of campus waste from landfills each year.',
  'When in doubt, check the label — most packaging has recycling symbols.',
  'Contamination is the #1 reason recyclables end up in landfills.',
  'Composting reduces the need for chemical fertilizers on campus gardens.',
];

/**
 * Returns a contextual tip based on material type.
 * Falls back to a generic tip if material type is unknown.
 */
export function getContextualTip(materialType: string | null | undefined): string {
  if (materialType) {
    const tips = TIPS_BY_MATERIAL[materialType];
    if (tips && tips.length > 0) {
      return tips[Math.floor(Math.random() * tips.length)];
    }
  }
  return GENERIC_TIPS[Math.floor(Math.random() * GENERIC_TIPS.length)];
}
