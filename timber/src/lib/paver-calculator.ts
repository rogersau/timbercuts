/**
 * Paver Calculator
 *
 * Calculates the number of pavers/bricks needed to cover a given area.
 * Supports multiple rectangular areas, different paver types, laying patterns,
 * and configurable gap/joint spacing.
 */

export interface RectangularArea {
  length: number // in mm
  width: number // in mm
  label?: string
}

export interface PaverType {
  name: string
  length: number // in mm
  width: number // in mm
  thickness?: number // in mm (optional)
}

/**
 * Laying patterns affect the waste percentage:
 * - stack: Simple grid pattern, minimal waste (~5%)
 * - stretcher: Offset rows like brickwork (~5-10%)
 * - herringbone: 45° or 90° zigzag pattern (~10-15%)
 * - basketweave: Alternating pairs (~5-10%)
 */
export type LayingPattern = 'stack' | 'stretcher' | 'herringbone' | 'basketweave'

export interface PaverCalculatorResult {
  totalAreaMm2: number
  totalAreaM2: number
  paverAreaMm2: number
  effectivePaverAreaMm2: number // including gap
  paversNeeded: number // exact count without waste
  paversWithWaste: number // recommended count with waste buffer
  wastePercentage: number
  coveragePerM2: number // pavers per square meter
}

/**
 * Returns the recommended waste percentage for a laying pattern.
 * This accounts for cuts at edges and pattern-specific waste.
 *
 * @param pattern - The laying pattern
 * @returns Waste percentage as a decimal (e.g., 0.1 for 10%)
 */
export function getPatternWastePercentage(pattern: LayingPattern): number {
  switch (pattern) {
    case 'stack':
      return 0.05 // 5% waste
    case 'stretcher':
      return 0.08 // 8% waste
    case 'herringbone':
      return 0.12 // 12% waste - more cuts needed
    case 'basketweave':
      return 0.08 // 8% waste
    default:
      return 0.1 // 10% default
  }
}

/**
 * Returns a human-readable name for a laying pattern.
 *
 * @param pattern - The laying pattern
 * @returns Display name for the pattern
 */
export function getPatternDisplayName(pattern: LayingPattern): string {
  switch (pattern) {
    case 'stack':
      return 'Stack Bond'
    case 'stretcher':
      return 'Stretcher Bond'
    case 'herringbone':
      return 'Herringbone'
    case 'basketweave':
      return 'Basket Weave'
    default:
      return pattern
  }
}

/**
 * Calculates the number of pavers needed to cover a collection of rectangular areas.
 *
 * @param areas - List of rectangular areas to cover
 * @param paver - The paver type to use
 * @param pattern - The laying pattern (affects waste %)
 * @param gap - Gap/joint width between pavers in mm (default: 3mm)
 * @param customWastePercentage - Optional custom waste percentage override (0-1)
 * @returns Calculation result with paver counts and area details
 */
export function calculatePaversNeeded(
  areas: RectangularArea[],
  paver: PaverType,
  pattern: LayingPattern = 'stack',
  gap: number = 3,
  customWastePercentage?: number
): PaverCalculatorResult {
  // Validate inputs
  if (!areas.length) {
    return {
      totalAreaMm2: 0,
      totalAreaM2: 0,
      paverAreaMm2: 0,
      effectivePaverAreaMm2: 0,
      paversNeeded: 0,
      paversWithWaste: 0,
      wastePercentage: 0,
      coveragePerM2: 0,
    }
  }

  if (paver.length <= 0 || paver.width <= 0) {
    throw new Error('Paver dimensions must be greater than zero')
  }

  if (gap < 0) {
    throw new Error('Gap cannot be negative')
  }

  // Calculate total area
  const totalAreaMm2 = areas.reduce((sum, area) => {
    if (area.length <= 0 || area.width <= 0) {
      return sum // Skip invalid areas
    }
    return sum + area.length * area.width
  }, 0)

  const totalAreaM2 = totalAreaMm2 / 1_000_000 // Convert mm² to m²

  // Calculate paver area (without gap)
  const paverAreaMm2 = paver.length * paver.width

  // Calculate effective paver area (including gap on two sides)
  // Each paver occupies its own area plus half the gap on each side
  // For simplicity, we add the full gap to the paver dimensions
  const effectivePaverAreaMm2 = (paver.length + gap) * (paver.width + gap)

  // Calculate exact number of pavers needed
  const paversNeeded = effectivePaverAreaMm2 > 0 ? Math.ceil(totalAreaMm2 / effectivePaverAreaMm2) : 0

  // Get waste percentage
  const wastePercentage = customWastePercentage ?? getPatternWastePercentage(pattern)

  // Calculate pavers with waste buffer
  const paversWithWaste = Math.ceil(paversNeeded * (1 + wastePercentage))

  // Calculate coverage (pavers per m²)
  const coveragePerM2 = effectivePaverAreaMm2 > 0 ? 1_000_000 / effectivePaverAreaMm2 : 0

  return {
    totalAreaMm2,
    totalAreaM2,
    paverAreaMm2,
    effectivePaverAreaMm2,
    paversNeeded,
    paversWithWaste,
    wastePercentage,
    coveragePerM2,
  }
}

/**
 * Common paver types/presets for convenience.
 */
export const COMMON_PAVER_TYPES: PaverType[] = [
  { name: 'Standard Brick', length: 230, width: 110, thickness: 50 },
  { name: 'Holland Stone', length: 200, width: 100, thickness: 60 },
  { name: 'Square 200', length: 200, width: 200, thickness: 50 },
  { name: 'Square 300', length: 300, width: 300, thickness: 50 },
  { name: 'Square 400', length: 400, width: 400, thickness: 50 },
  { name: 'Rectangle 400x200', length: 400, width: 200, thickness: 50 },
  { name: 'Large Format 600x300', length: 600, width: 300, thickness: 50 },
  { name: 'Custom', length: 0, width: 0, thickness: 0 },
]

/**
 * All available laying patterns.
 */
export const LAYING_PATTERNS: LayingPattern[] = ['stack', 'stretcher', 'herringbone', 'basketweave']
