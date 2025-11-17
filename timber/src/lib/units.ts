export const MM_PER_IN = 25.4

export function inchesToMM(inches: number): number {
  return inches * MM_PER_IN
}

export function mmToInches(mm: number): number {
  return mm / MM_PER_IN
}

export function mmToDisplayStr(mm: number, unit: 'mm' | 'in' = 'mm'): string {
  if (unit === 'mm') return `${mm}mm`
  return `${mmToInches(mm).toFixed(2)}in`
}

export function mmToDisplayNumber(mm: number, unit: 'mm' | 'in' = 'mm'): number {
  return unit === 'mm' ? +mm.toFixed(1) : +mmToInches(mm).toFixed(2)
}

export function displayToMM(value: number, unit: 'mm' | 'in' = 'mm'): number {
  return unit === 'mm' ? value : inchesToMM(value)
}
