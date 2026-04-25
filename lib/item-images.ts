/**
 * Fallback images for common waste items
 * These are used when no actual photo is available
 */

export function getItemFallbackImage(description: string, materialType: string | null): string | null {
  const desc = description.toLowerCase();
  const mat = materialType?.toLowerCase() || '';
  
  // Return null to use emoji fallback for now
  // In production, you would return URLs to actual stock images
  // For example: return 'https://example.com/images/plastic-bottle.png'
  
  // Bottles
  if (desc.includes('bottle') || mat.includes('bottle')) {
    return 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=200&h=200&fit=crop';
  }
  
  // Cans
  if (desc.includes('can') || desc.includes('soda') || desc.includes('coke') || mat.includes('aluminum')) {
    return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&h=200&fit=crop';
  }
  
  // Cups - use disposable cup image, not coffee mug
  if (desc.includes('cup') || desc.includes('paper cup')) {
    return 'https://images.unsplash.com/photo-1530676449-22f3c8d1e8b8?w=200&h=200&fit=crop';
  }
  
  if (desc.includes('coffee')) {
    return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&h=200&fit=crop';
  }
  
  // Paper
  if (desc.includes('paper') || desc.includes('cardboard') || mat.includes('paper') || mat.includes('cardboard')) {
    return 'https://images.unsplash.com/photo-1594843310746-7e2b4f6f885e?w=200&h=200&fit=crop';
  }
  
  // Banana - use banana peel image
  if (desc.includes('banana') || desc.includes('peel')) {
    return 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=200&h=200&fit=crop';
  }
  
  // Apple
  if (desc.includes('apple')) {
    return 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&h=200&fit=crop';
  }
  
  // Orange
  if (desc.includes('orange')) {
    return 'https://images.unsplash.com/photo-1547514701-42782101795e?w=200&h=200&fit=crop';
  }
  
  // Plastic bag
  if (desc.includes('bag') || desc.includes('plastic')) {
    return 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=200&h=200&fit=crop';
  }
  
  // Glass
  if (desc.includes('glass') || mat.includes('glass')) {
    return 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&h=200&fit=crop';
  }
  
  return null;
}
