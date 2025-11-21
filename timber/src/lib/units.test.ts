import { describe, it, expect } from 'vitest'
import { inchesToMM, mmToInches, mmToDisplayStr, mmToDisplayNumber, displayToMM } from './units'

describe('units conversion helpers', () => {
  it('converts inches to mm and back', () => {
    expect(inchesToMM(1)).toBeCloseTo(25.4)
    expect(mmToInches(25.4)).toBeCloseTo(1)
  })

  it('converts mm to display string for mm and inches', () => {
    expect(mmToDisplayStr(600, 'mm')).toBe('600mm')
    expect(mmToDisplayStr(600, 'in')).toBe('23.62in') // 600/25.4 = 23.622...
  })

  it('provides correct display numbers and round-tripping', () => {
    expect(mmToDisplayNumber(600, 'mm')).toBeCloseTo(600)
    expect(mmToDisplayNumber(600, 'in')).toBeCloseTo(23.62)

    // Round trip display to mm
    // Round trip display to mm (exact conversion from 23.62in -> 599.948mm)
    expect(displayToMM(23.62, 'in')).toBeCloseTo(599.948, 3)
    expect(displayToMM(600, 'mm')).toBe(600)
  })

  it('handles small kerf values correctly', () => {
    expect(mmToDisplayNumber(3, 'mm')).toBeCloseTo(3.0)
    expect(mmToDisplayNumber(3, 'in')).toBeCloseTo(0.12)
    expect(displayToMM(0.12, 'in')).toBeCloseTo(3.048)
  })
})
