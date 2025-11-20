export const MM_PER_IN = 25.4

/**
 * Converts inches to millimeters.
 * @param inches - Length in inches
 * @returns Length in millimeters
 */
export function inchesToMM(inches: number): number {
  return inches * MM_PER_IN
}

/**
 * Converts millimeters to inches.
 * @param mm - Length in millimeters
 * @returns Length in inches
 */
export function mmToInches(mm: number): number {
  return mm / MM_PER_IN
}

/**
 * Formats a length in millimeters to a display string based on the selected unit.
 * @param mm - Length in millimeters
 * @param unit - The unit to display ('mm' or 'in')
 * @returns Formatted string (e.g., "100mm" or "3.94in")
 */
export function mmToDisplayStr(mm: number, unit: 'mm' | 'in' = 'mm'): string {
  if (unit === 'mm') return `${mm}mm`
  return `${mmToInches(mm).toFixed(2)}in`
}

/**
 * Converts a length in millimeters to a number in the selected unit.
 * @param mm - Length in millimeters
 * @param unit - The unit to convert to ('mm' or 'in')
 * @returns Length in the selected unit
 */
export function mmToDisplayNumber(mm: number, unit: 'mm' | 'in' = 'mm'): number {
  return unit === 'mm' ? +mm.toFixed(1) : +mmToInches(mm).toFixed(2)
}

/**
 * Converts a display value in the selected unit to millimeters.
 * @param value - The value in the selected unit
 * @param unit - The unit of the input value ('mm' or 'in')
 * @returns Length in millimeters
 */
export function displayToMM(value: number, unit: 'mm' | 'in' = 'mm'): number {
  return unit === 'mm' ? value : inchesToMM(value)
}
