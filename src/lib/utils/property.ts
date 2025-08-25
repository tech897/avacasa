/**
 * Property-related utility functions
 */

/**
 * Format plot size with appropriate units
 */
export function formatPlotSize(plotSize: string | null | undefined): string {
  if (!plotSize) {
    return 'Contact for details';
  }

  // If it already contains 'acre' or 'acres', return as is
  if (plotSize.toLowerCase().includes('acre')) {
    return plotSize;
  }

  // If it's a number, add sqft unit
  const numericValue = parseFloat(plotSize.replace(/,/g, ''));
  if (!isNaN(numericValue)) {
    // For very large areas, convert to acres (1 acre = 43,560 sqft)
    if (numericValue >= 43560) {
      const acres = (numericValue / 43560).toFixed(2);
      return `${acres} acres`;
    }
    
    // Format with commas and add sqft
    return `${numericValue.toLocaleString()} sqft`;
  }

  // If it's not numeric and doesn't contain 'acre', return as is
  return plotSize;
}

/**
 * Format property area with units
 */
export function formatArea(area: number): string {
  if (area >= 43560) {
    const acres = (area / 43560).toFixed(2);
    return `${area.toLocaleString()} sqft (${acres} acres)`;
  }
  
  return `${area.toLocaleString()} sqft`;
}
