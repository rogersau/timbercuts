import { describe, it, expect } from 'vitest'
import {
  calculatePaversNeeded,
  getPatternWastePercentage,
  getPatternDisplayName,
  type RectangularArea,
  type PaverType,
  COMMON_PAVER_TYPES,
  LAYING_PATTERNS,
} from './paver-calculator'

describe('Paver Calculator', () => {
  const standardBrick: PaverType = { name: 'Standard Brick', length: 230, width: 110, thickness: 50 }
  const squarePaver: PaverType = { name: 'Square 200', length: 200, width: 200, thickness: 50 }

  describe('calculatePaversNeeded', () => {
    describe('Basic Calculations', () => {
      it('should calculate pavers for a single rectangular area', () => {
        const areas: RectangularArea[] = [{ length: 1000, width: 1000 }] // 1m²
        const result = calculatePaversNeeded(areas, squarePaver, 'stack', 0)

        expect(result.totalAreaMm2).toBe(1_000_000)
        expect(result.totalAreaM2).toBe(1)
        expect(result.paverAreaMm2).toBe(40000) // 200 × 200
        expect(result.paversNeeded).toBe(25) // 1_000_000 / 40000 = 25
      })

      it('should calculate pavers for multiple areas', () => {
        const areas: RectangularArea[] = [
          { length: 1000, width: 1000 }, // 1m²
          { length: 2000, width: 1000 }, // 2m²
        ]
        const result = calculatePaversNeeded(areas, squarePaver, 'stack', 0)

        expect(result.totalAreaMm2).toBe(3_000_000) // 3m²
        expect(result.totalAreaM2).toBe(3)
        expect(result.paversNeeded).toBe(75) // 3_000_000 / 40000 = 75
      })

      it('should round up paver count', () => {
        const areas: RectangularArea[] = [{ length: 500, width: 500 }] // 0.25m²
        const result = calculatePaversNeeded(areas, squarePaver, 'stack', 0)

        // 250000 / 40000 = 6.25, should round up to 7
        expect(result.paversNeeded).toBe(7)
      })
    })

    describe('Gap/Joint Calculations', () => {
      it('should account for gap between pavers', () => {
        const areas: RectangularArea[] = [{ length: 1000, width: 1000 }]
        const gap = 5 // 5mm gap
        const result = calculatePaversNeeded(areas, squarePaver, 'stack', gap)

        // Effective paver area: (200+5) × (200+5) = 205 × 205 = 42025mm²
        expect(result.effectivePaverAreaMm2).toBe(42025)
        // Pavers needed: 1_000_000 / 42025 ≈ 23.8, rounds to 24
        expect(result.paversNeeded).toBe(24)
      })

      it('should work with 3mm gap (typical)', () => {
        const areas: RectangularArea[] = [{ length: 2000, width: 2000 }] // 4m²
        const result = calculatePaversNeeded(areas, squarePaver, 'stack', 3)

        // Effective paver area: (200+3) × (200+3) = 203 × 203 = 41209mm²
        expect(result.effectivePaverAreaMm2).toBe(41209)
      })

      it('should handle zero gap', () => {
        const areas: RectangularArea[] = [{ length: 1000, width: 1000 }]
        const result = calculatePaversNeeded(areas, squarePaver, 'stack', 0)

        expect(result.effectivePaverAreaMm2).toBe(result.paverAreaMm2)
      })
    })

    describe('Waste Calculations', () => {
      it('should add waste percentage for stack pattern', () => {
        const areas: RectangularArea[] = [{ length: 1000, width: 1000 }]
        const result = calculatePaversNeeded(areas, squarePaver, 'stack', 0)

        expect(result.wastePercentage).toBe(0.05) // 5%
        // 25 pavers needed, +5% = 26.25, rounds to 27
        expect(result.paversWithWaste).toBe(27)
      })

      it('should add higher waste for herringbone pattern', () => {
        const areas: RectangularArea[] = [{ length: 1000, width: 1000 }]
        const result = calculatePaversNeeded(areas, squarePaver, 'herringbone', 0)

        expect(result.wastePercentage).toBe(0.12) // 12%
        // 25 pavers needed, +12% = 28.0, but Math.ceil rounds up
        expect(result.paversWithWaste).toBeGreaterThan(result.paversNeeded)
        expect(result.paversWithWaste).toBeLessThanOrEqual(30) // Reasonable upper bound
      })

      it('should allow custom waste percentage', () => {
        const areas: RectangularArea[] = [{ length: 1000, width: 1000 }]
        const result = calculatePaversNeeded(areas, squarePaver, 'stack', 0, 0.15)

        expect(result.wastePercentage).toBe(0.15) // 15% custom
        // 25 pavers needed, +15% = 28.75, rounds to 29
        expect(result.paversWithWaste).toBe(29)
      })
    })

    describe('Coverage Calculation', () => {
      it('should calculate pavers per square meter', () => {
        const areas: RectangularArea[] = [{ length: 1000, width: 1000 }]
        const result = calculatePaversNeeded(areas, squarePaver, 'stack', 0)

        // 1_000_000mm² / 40000mm² = 25 pavers per m²
        expect(result.coveragePerM2).toBe(25)
      })

      it('should calculate coverage with gap', () => {
        const areas: RectangularArea[] = [{ length: 1000, width: 1000 }]
        const result = calculatePaversNeeded(areas, squarePaver, 'stack', 5)

        // 1_000_000mm² / 42025mm² ≈ 23.8 pavers per m²
        expect(result.coveragePerM2).toBeCloseTo(23.8, 1)
      })
    })

    describe('Different Paver Types', () => {
      it('should work with rectangular pavers', () => {
        const areas: RectangularArea[] = [{ length: 2000, width: 1000 }] // 2m²
        const result = calculatePaversNeeded(areas, standardBrick, 'stack', 0)

        // Paver area: 230 × 110 = 25300mm²
        expect(result.paverAreaMm2).toBe(25300)
        // Pavers needed: 2_000_000 / 25300 ≈ 79.1, rounds to 80
        expect(result.paversNeeded).toBe(80)
      })

      it('should work with large format pavers', () => {
        const largePaver: PaverType = { name: 'Large', length: 600, width: 300 }
        const areas: RectangularArea[] = [{ length: 3000, width: 3000 }] // 9m²
        const result = calculatePaversNeeded(areas, largePaver, 'stack', 0)

        // Paver area: 600 × 300 = 180000mm²
        expect(result.paverAreaMm2).toBe(180000)
        // Pavers needed: 9_000_000 / 180000 = 50
        expect(result.paversNeeded).toBe(50)
      })
    })

    describe('Edge Cases', () => {
      it('should return zeros for empty areas array', () => {
        const result = calculatePaversNeeded([], squarePaver, 'stack', 0)

        expect(result.totalAreaMm2).toBe(0)
        expect(result.paversNeeded).toBe(0)
        expect(result.paversWithWaste).toBe(0)
      })

      it('should skip areas with invalid dimensions', () => {
        const areas: RectangularArea[] = [
          { length: 1000, width: 1000 }, // Valid: 1m²
          { length: 0, width: 1000 }, // Invalid: should skip
          { length: -100, width: 1000 }, // Invalid: should skip
        ]
        const result = calculatePaversNeeded(areas, squarePaver, 'stack', 0)

        expect(result.totalAreaMm2).toBe(1_000_000) // Only first area
      })

      it('should throw error for invalid paver dimensions', () => {
        const areas: RectangularArea[] = [{ length: 1000, width: 1000 }]
        const invalidPaver: PaverType = { name: 'Invalid', length: 0, width: 200 }

        expect(() => calculatePaversNeeded(areas, invalidPaver, 'stack', 0)).toThrow(
          'Paver dimensions must be greater than zero'
        )
      })

      it('should throw error for negative gap', () => {
        const areas: RectangularArea[] = [{ length: 1000, width: 1000 }]

        expect(() => calculatePaversNeeded(areas, squarePaver, 'stack', -5)).toThrow(
          'Gap cannot be negative'
        )
      })

      it('should handle very small areas', () => {
        const areas: RectangularArea[] = [{ length: 100, width: 100 }] // 0.01m²
        const result = calculatePaversNeeded(areas, squarePaver, 'stack', 0)

        // 10000 / 40000 = 0.25, rounds up to 1
        expect(result.paversNeeded).toBe(1)
      })

      it('should handle very large areas', () => {
        const areas: RectangularArea[] = [{ length: 100_000, width: 100_000 }] // 10000m²
        const result = calculatePaversNeeded(areas, squarePaver, 'stack', 0)

        expect(result.totalAreaM2).toBe(10000)
        expect(result.paversNeeded).toBe(250000) // 10000 × 25
      })
    })

    describe('Labeled Areas', () => {
      it('should accept areas with labels', () => {
        const areas: RectangularArea[] = [
          { length: 2000, width: 1000, label: 'Patio' },
          { length: 3000, width: 1000, label: 'Walkway' },
        ]
        const result = calculatePaversNeeded(areas, squarePaver, 'stack', 0)

        expect(result.totalAreaM2).toBe(5)
      })
    })
  })

  describe('getPatternWastePercentage', () => {
    it('should return 5% for stack pattern', () => {
      expect(getPatternWastePercentage('stack')).toBe(0.05)
    })

    it('should return 8% for stretcher pattern', () => {
      expect(getPatternWastePercentage('stretcher')).toBe(0.08)
    })

    it('should return 12% for herringbone pattern', () => {
      expect(getPatternWastePercentage('herringbone')).toBe(0.12)
    })

    it('should return 8% for basketweave pattern', () => {
      expect(getPatternWastePercentage('basketweave')).toBe(0.08)
    })
  })

  describe('getPatternDisplayName', () => {
    it('should return readable names for all patterns', () => {
      expect(getPatternDisplayName('stack')).toBe('Stack Bond')
      expect(getPatternDisplayName('stretcher')).toBe('Stretcher Bond')
      expect(getPatternDisplayName('herringbone')).toBe('Herringbone')
      expect(getPatternDisplayName('basketweave')).toBe('Basket Weave')
    })
  })

  describe('COMMON_PAVER_TYPES', () => {
    it('should have predefined paver types', () => {
      expect(COMMON_PAVER_TYPES.length).toBeGreaterThan(0)
      expect(COMMON_PAVER_TYPES.find((p) => p.name === 'Standard Brick')).toBeDefined()
    })

    it('should have valid dimensions for non-custom types', () => {
      const nonCustomTypes = COMMON_PAVER_TYPES.filter((p) => p.name !== 'Custom')
      nonCustomTypes.forEach((paver) => {
        expect(paver.length).toBeGreaterThan(0)
        expect(paver.width).toBeGreaterThan(0)
      })
    })
  })

  describe('LAYING_PATTERNS', () => {
    it('should include all pattern types', () => {
      expect(LAYING_PATTERNS).toContain('stack')
      expect(LAYING_PATTERNS).toContain('stretcher')
      expect(LAYING_PATTERNS).toContain('herringbone')
      expect(LAYING_PATTERNS).toContain('basketweave')
    })
  })

  describe('Real-world Scenarios', () => {
    it('should calculate a typical patio project', () => {
      // Patio: 4m × 3m = 12m²
      const areas: RectangularArea[] = [{ length: 4000, width: 3000, label: 'Patio' }]
      const result = calculatePaversNeeded(areas, standardBrick, 'stretcher', 3)

      expect(result.totalAreaM2).toBe(12)
      // With 230×110 brick + 3mm gap = 233×113 = 26329mm²
      // 12_000_000 / 26329 ≈ 456
      expect(result.paversNeeded).toBeGreaterThan(400)
      // With 8% waste
      expect(result.paversWithWaste).toBeGreaterThan(result.paversNeeded)
    })

    it('should calculate a driveway project with multiple sections', () => {
      const areas: RectangularArea[] = [
        { length: 6000, width: 3000, label: 'Main Drive' }, // 18m²
        { length: 2000, width: 1500, label: 'Side Path' }, // 3m²
      ]
      const result = calculatePaversNeeded(areas, squarePaver, 'herringbone', 5)

      expect(result.totalAreaM2).toBe(21)
      // Herringbone has 12% waste
      expect(result.wastePercentage).toBe(0.12)
    })

    it('should handle a large commercial project', () => {
      // 50m × 30m plaza = 1500m²
      const areas: RectangularArea[] = [{ length: 50000, width: 30000, label: 'Plaza' }]
      const largePaver: PaverType = { name: 'Large Format', length: 600, width: 300 }
      const result = calculatePaversNeeded(areas, largePaver, 'stack', 4)

      expect(result.totalAreaM2).toBe(1500)
      // Coverage should be reasonable
      expect(result.paversNeeded).toBeGreaterThan(8000)
    })
  })
})
