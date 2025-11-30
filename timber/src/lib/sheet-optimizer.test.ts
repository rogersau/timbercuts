import { describe, it, expect } from 'vitest'
import { optimizeSheetCutting, type SheetStock, type RequiredPanel, type OwnedSheet } from './sheet-optimizer'

describe('optimizeSheetCutting', () => {
  const standardSheet: SheetStock = { width: 2440, height: 1220, price: 45 }

  describe('basic functionality', () => {
    it('should handle a single panel that fits', () => {
      const sheets: SheetStock[] = [standardSheet]
      const panels: RequiredPanel[] = [{ width: 600, height: 400, quantity: 1 }]

      const result = optimizeSheetCutting(sheets, panels, 0, 'cost')

      expect(result.plans.length).toBe(1)
      expect(result.plans[0].placements.length).toBe(1)
      expect(result.totalCost).toBe(45)
      expect(result.totalSheets).toBe(1)
    })

    it('should handle multiple panels on one sheet', () => {
      const sheets: SheetStock[] = [standardSheet]
      const panels: RequiredPanel[] = [{ width: 600, height: 400, quantity: 4 }]

      const result = optimizeSheetCutting(sheets, panels, 0, 'cost')

      expect(result.plans.length).toBe(1)
      expect(result.plans[0].placements.length).toBe(4)
      expect(result.totalCost).toBe(45)
    })

    it('should use multiple sheets when needed', () => {
      const sheets: SheetStock[] = [standardSheet]
      // Large panels that won't all fit on one sheet
      const panels: RequiredPanel[] = [{ width: 1200, height: 1000, quantity: 4 }]

      const result = optimizeSheetCutting(sheets, panels, 0, 'cost')

      expect(result.plans.length).toBeGreaterThan(1)
      expect(result.totalSheets).toBeGreaterThan(1)
    })
  })

  describe('with kerf', () => {
    it('should account for kerf when placing panels', () => {
      const sheets: SheetStock[] = [{ width: 100, height: 100, price: 10 }]
      // Two 45x45 panels should fit on 100x100 without kerf
      // With 5mm kerf, they might not fit as well
      const panels: RequiredPanel[] = [{ width: 45, height: 45, quantity: 2 }]

      const resultNoKerf = optimizeSheetCutting(sheets, panels, 0, 'cost')
      const resultWithKerf = optimizeSheetCutting(sheets, panels, 5, 'cost')

      expect(resultNoKerf.plans.length).toBe(1)
      expect(resultNoKerf.plans[0].placements.length).toBe(2)
      // With kerf, behavior may vary but should still produce valid result
      expect(resultWithKerf.plans[0].placements.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('with owned sheets', () => {
    it('should prefer owned sheets over purchased', () => {
      const sheets: SheetStock[] = [standardSheet]
      const panels: RequiredPanel[] = [{ width: 600, height: 400, quantity: 1 }]
      const ownedSheets: OwnedSheet[] = [{ width: 2440, height: 1220, quantity: 1 }]

      const result = optimizeSheetCutting(sheets, panels, 0, 'cost', ownedSheets)

      expect(result.plans.length).toBe(1)
      expect(result.plans[0].isOwned).toBe(true)
      expect(result.totalCost).toBe(0)
      expect(result.ownedSheetsUsed).toBe(1)
      expect(result.purchasedSheetsNeeded).toBe(0)
    })

    it('should use purchased sheets when owned are exhausted', () => {
      const sheets: SheetStock[] = [standardSheet]
      const panels: RequiredPanel[] = [{ width: 1200, height: 1000, quantity: 3 }]
      const ownedSheets: OwnedSheet[] = [{ width: 2440, height: 1220, quantity: 1 }]

      const result = optimizeSheetCutting(sheets, panels, 0, 'cost', ownedSheets)

      expect(result.ownedSheetsUsed).toBe(1)
      expect(result.purchasedSheetsNeeded).toBeGreaterThan(0)
    })
  })

  describe('rotation', () => {
    it('should rotate panels when beneficial', () => {
      // Sheet is 200x100, panel is 150x50
      // Panel fits normally (150<200, 50<100)
      // Rotated it would be 50x150 which also fits
      const sheets: SheetStock[] = [{ width: 200, height: 100, price: 10 }]
      const panels: RequiredPanel[] = [
        { width: 150, height: 50, quantity: 1, canRotate: true }
      ]

      const result = optimizeSheetCutting(sheets, panels, 0, 'cost')

      expect(result.plans[0].placements.length).toBe(1)
    })

    it('should fit panel by rotation when only rotated fits', () => {
      // Sheet is 100x200, panel is 150x50
      // Normal: 150>100 doesn't fit
      // Rotated: 50<100, 150<200 fits!
      const sheets: SheetStock[] = [{ width: 100, height: 200, price: 10 }]
      const panels: RequiredPanel[] = [
        { width: 150, height: 50, quantity: 1, canRotate: true }
      ]

      const result = optimizeSheetCutting(sheets, panels, 0, 'cost')

      expect(result.plans[0].placements.length).toBe(1)
      expect(result.plans[0].placements[0].rotated).toBe(true)
    })
  })

  describe('efficiency calculation', () => {
    it('should calculate efficiency correctly', () => {
      const sheets: SheetStock[] = [{ width: 1000, height: 1000, price: 100 }]
      const panels: RequiredPanel[] = [{ width: 500, height: 500, quantity: 1 }]

      const result = optimizeSheetCutting(sheets, panels, 0, 'cost')

      // 500x500 = 250000 area used, 1000x1000 = 1000000 total
      // Efficiency = 25%
      expect(result.efficiency).toBeCloseTo(25, 0)
    })
  })

  describe('error handling', () => {
    it('should throw when panel is too large for any sheet', () => {
      const sheets: SheetStock[] = [{ width: 100, height: 100, price: 10 }]
      const panels: RequiredPanel[] = [{ width: 200, height: 200, quantity: 1 }]

      expect(() => optimizeSheetCutting(sheets, panels, 0, 'cost')).toThrow()
    })
  })

  describe('mode comparison', () => {
    it('cost mode should prefer cheaper sheets', () => {
      const sheets: SheetStock[] = [
        { width: 2000, height: 1000, price: 100 }, // expensive
        { width: 1500, height: 1000, price: 30 },  // cheap, smaller
      ]
      const panels: RequiredPanel[] = [{ width: 500, height: 500, quantity: 1 }]

      const result = optimizeSheetCutting(sheets, panels, 0, 'cost')

      // Should pick the cheaper sheet
      expect(result.totalCost).toBeLessThanOrEqual(30)
    })

    it('waste mode should prefer more efficient packing', () => {
      const sheets: SheetStock[] = [
        { width: 2000, height: 1000, price: 100 },
        { width: 600, height: 600, price: 80 },
      ]
      const panels: RequiredPanel[] = [{ width: 500, height: 500, quantity: 1 }]

      const result = optimizeSheetCutting(sheets, panels, 0, 'waste')

      // Should pick the smaller sheet for less waste
      expect(result.plans[0].sheetWidth).toBe(600)
    })
  })
})
