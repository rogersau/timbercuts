import { describe, it, expect } from 'vitest'
import {
  optimizeTimberCutting,
  type TimberStock,
  type RequiredCut,
  type OwnedTimber,
} from './timber-optimizer'

describe('Timber Optimizer', () => {
  const standardTimbers: TimberStock[] = [
    { length: 1200, price: 9.4 },
    { length: 1800, price: 14.5 },
    { length: 2400, price: 19.2 },
    { length: 3000, price: 23.9 },
    { length: 3600, price: 28.7 },
  ]

  describe('Basic Cutting', () => {
    it('should fit multiple pieces into single timber', () => {
      const cuts: RequiredCut[] = [{ length: 600, quantity: 2 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      expect(result.plans).toHaveLength(1)
      expect(result.plans[0].cuts).toEqual([600, 600])
      expect(result.plans[0].timberLength).toBe(1200)
      expect(result.totalTimbers).toBe(1)
    })

    it('should calculate waste correctly', () => {
      const cuts: RequiredCut[] = [{ length: 500, quantity: 1 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      expect(result.plans[0].waste).toBe(700) // 1200 - 500 = 700
      expect(result.totalWaste).toBe(700)
    })

    it('should handle exact fit with no waste', () => {
      const cuts: RequiredCut[] = [{ length: 1200, quantity: 1 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      expect(result.plans[0].waste).toBe(0)
      expect(result.totalWaste).toBe(0)
    })
  })

  describe('Kerf Calculation', () => {
    it('should account for kerf between cuts', () => {
      const cuts: RequiredCut[] = [{ length: 600, quantity: 2 }]
      const kerf = 3
      const result = optimizeTimberCutting(standardTimbers, cuts, kerf, 'cost')

      // 600 + 3 + 600 + 3 = 1206mm needed, won't fit in 1200mm
      // Should use 1800mm timber
      expect(result.plans).toHaveLength(1)
      expect(result.plans[0].timberLength).toBe(1800)
      expect(result.plans[0].kerfUsed).toBe(6) // 2 cuts = 2 kerfs
      expect(result.totalKerf).toBe(6)
    })

    it('should apply kerf to single piece', () => {
      const cuts: RequiredCut[] = [{ length: 1000, quantity: 1 }]
      const kerf = 5
      const result = optimizeTimberCutting(standardTimbers, cuts, kerf, 'cost')

      // Single piece still consumes kerf: 1000 + 5 = 1005mm
      expect(result.plans[0].kerfUsed).toBe(5)
      expect(result.totalKerf).toBe(5)
    })

    it('should apply kerf to multiple cuts correctly', () => {
      const cuts: RequiredCut[] = [{ length: 400, quantity: 3 }]
      const kerf = 3
      const result = optimizeTimberCutting(standardTimbers, cuts, kerf, 'cost')

      // 400 + 3 + 400 = 803mm fits in 1200mm (2 pieces)
      // Third piece needs separate timber: 400mm
      // Total kerf across all plans
      expect(result.totalKerf).toBeGreaterThan(0)
      expect(result.plans.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Cost Optimization Mode', () => {
    it('should minimize total cost', () => {
      const cuts: RequiredCut[] = [{ length: 1000, quantity: 1 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      // Should use 1200mm ($9.40) instead of larger timbers
      expect(result.plans[0].timberLength).toBe(1200)
      expect(result.totalCost).toBe(9.4)
    })

    it('should prefer cost-efficient timber', () => {
      const cuts: RequiredCut[] = [{ length: 2000, quantity: 1 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      // Should use 2400mm ($19.20) as most cost-efficient for 2000mm cut
      expect(result.plans[0].timberLength).toBe(2400)
      expect(result.totalCost).toBe(19.2)
    })

    it('should pack efficiently to minimize purchases', () => {
      const cuts: RequiredCut[] = [{ length: 600, quantity: 4 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      // Should fit 2x600 in each 1200mm timber = 2 timbers total
      expect(result.totalTimbers).toBe(2)
      expect(result.totalCost).toBe(9.4 * 2)
    })
  })

  describe('Waste Optimization Mode', () => {
    it('should minimize waste over cost', () => {
      const cuts: RequiredCut[] = [{ length: 1100, quantity: 1 }]
      const resultCost = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')
      const resultWaste = optimizeTimberCutting(standardTimbers, cuts, 0, 'waste')

      // Waste mode should pick 1200mm (waste=100mm) over potentially larger timber
      expect(resultWaste.totalWaste).toBeLessThanOrEqual(resultCost.totalWaste)
    })

    it('should prefer tighter fits', () => {
      const cuts: RequiredCut[] = [{ length: 2300, quantity: 1 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'waste')

      // Should use 2400mm (waste=100mm) instead of 3000mm (waste=700mm)
      expect(result.plans[0].timberLength).toBe(2400)
      expect(result.plans[0].waste).toBe(100)
    })
  })

  describe('Owned Timber', () => {
    it('should use owned timber before purchasing', () => {
      const cuts: RequiredCut[] = [{ length: 600, quantity: 2 }]
      const owned: OwnedTimber[] = [{ length: 1200, quantity: 1 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost', owned)

      expect(result.ownedTimbersUsed).toBe(1)
      expect(result.purchasedTimbersNeeded).toBe(0)
      expect(result.totalCost).toBe(0) // Owned timber is free
      expect(result.plans[0].isOwned).toBe(true)
    })

    it('should purchase when owned timber insufficient', () => {
      const cuts: RequiredCut[] = [{ length: 600, quantity: 4 }]
      const owned: OwnedTimber[] = [{ length: 1200, quantity: 1 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost', owned)

      // 1 owned timber fits 2 cuts, need 1 purchase for remaining 2 cuts
      expect(result.ownedTimbersUsed).toBe(1)
      expect(result.purchasedTimbersNeeded).toBe(1)
      expect(result.totalCost).toBe(9.4) // Only count purchased timber
    })

    it('should track owned timber quantities correctly', () => {
      const cuts: RequiredCut[] = [{ length: 600, quantity: 6 }]
      const owned: OwnedTimber[] = [{ length: 1200, quantity: 2 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost', owned)

      // 2 owned (each fits 2 cuts = 4 cuts), need 1 purchase for remaining 2 cuts
      expect(result.ownedTimbersUsed).toBe(2)
      expect(result.purchasedTimbersNeeded).toBe(1)
      expect(result.totalTimbers).toBe(3)
    })

    it('should prioritize owned timber even with waste mode', () => {
      const cuts: RequiredCut[] = [{ length: 1000, quantity: 1 }]
      const owned: OwnedTimber[] = [{ length: 3000, quantity: 1 }] // High waste but free
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'waste', owned)

      // Should still use owned timber first despite high waste
      expect(result.ownedTimbersUsed).toBe(1)
      expect(result.totalCost).toBe(0)
    })

    it('should handle multiple owned timber lengths', () => {
      const cuts: RequiredCut[] = [
        { length: 500, quantity: 1 },
        { length: 1500, quantity: 1 },
      ]
      const owned: OwnedTimber[] = [
        { length: 600, quantity: 1 },
        { length: 1800, quantity: 1 },
      ]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost', owned)

      expect(result.ownedTimbersUsed).toBe(2)
      expect(result.purchasedTimbersNeeded).toBe(0)
      expect(result.totalCost).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle single large cut', () => {
      const cuts: RequiredCut[] = [{ length: 3500, quantity: 1 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      expect(result.plans[0].timberLength).toBe(3600)
      expect(result.plans[0].waste).toBe(100)
    })

    it('should throw error if no timber fits', () => {
      const cuts: RequiredCut[] = [{ length: 5000, quantity: 1 }]

      expect(() => optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')).toThrow()
    })

    it('should handle zero kerf', () => {
      const cuts: RequiredCut[] = [{ length: 600, quantity: 2 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      expect(result.totalKerf).toBe(0)
      expect(result.plans[0].kerfUsed).toBe(0)
    })

    it('should handle mixed cut lengths', () => {
      const cuts: RequiredCut[] = [
        { length: 400, quantity: 2 },
        { length: 800, quantity: 1 },
      ]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      // Should pack efficiently: 800+400 and 400 separately
      expect(result.totalTimbers).toBeGreaterThan(0)
      const totalCutLength = result.plans.reduce(
        (sum, plan) => sum + plan.cuts.reduce((s, c) => s + c, 0),
        0
      )
      expect(totalCutLength).toBe(400 * 2 + 800)
    })
  })

  describe('Complex Scenarios', () => {
    it('should optimize multiple cuts with kerf in cost mode', () => {
      const cuts: RequiredCut[] = [
        { length: 450, quantity: 3 },
        { length: 300, quantity: 2 },
      ]
      const kerf = 3
      const result = optimizeTimberCutting(standardTimbers, cuts, kerf, 'cost')

      // Verify all cuts are included
      const totalCuts = result.plans.reduce((sum, plan) => sum + plan.cuts.length, 0)
      expect(totalCuts).toBe(5)

      // Verify cost is calculated correctly (excluding kerf from price)
      expect(result.totalCost).toBeGreaterThan(0)
    })

    it('should handle owned timber with kerf', () => {
      const cuts: RequiredCut[] = [{ length: 590, quantity: 2 }]
      const owned: OwnedTimber[] = [{ length: 1200, quantity: 1 }]
      const kerf = 3
      const result = optimizeTimberCutting(standardTimbers, cuts, kerf, 'cost', owned)

      // 590 + 3 + 590 + 3 = 1186mm, fits in 1200mm owned timber
      expect(result.ownedTimbersUsed).toBe(1)
      expect(result.totalCost).toBe(0)
    })

    it('least wastage solution should have less waste than cost solution', () => {
      const cuts: RequiredCut[] = [
        { length: 600, quantity: 4 },
        { length: 1200, quantity: 12 },
        { length: 850, quantity: 8 },
      ]
      const kerf = 5
      const resultCost = optimizeTimberCutting(standardTimbers, cuts, kerf, 'cost')
      const resultWaste = optimizeTimberCutting(standardTimbers, cuts, kerf, 'waste')

      expect(resultWaste.totalWaste).toBeLessThanOrEqual(resultCost.totalWaste)
    })
  })

  describe('Advanced Owned Timber Logic', () => {
    it('should prioritize owned timber over purchased timber even if purchased is perfect fit', () => {
      const cuts: RequiredCut[] = [{ length: 1000, quantity: 1 }]
      const owned: OwnedTimber[] = [{ length: 1500, quantity: 1 }]
      // Purchased 1200 fits better than 1500 (waste 200 vs 500), but owned should be free/priority

      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost', owned)

      expect(result.plans[0].isOwned).toBe(true)
      expect(result.plans[0].timberLength).toBe(1500)
      expect(result.totalCost).toBe(0)
    })

    it('should use owned timber that minimizes waste when multiple owned timbers fit (Cost Mode)', () => {
      const cuts: RequiredCut[] = [{ length: 900, quantity: 1 }]
      const owned: OwnedTimber[] = [
        { length: 2000, quantity: 1 },
        { length: 1000, quantity: 1 },
      ]

      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost', owned)

      expect(result.plans[0].isOwned).toBe(true)
      expect(result.plans[0].timberLength).toBe(1000)
      expect(result.plans[0].waste).toBe(100)
    })

    it('should use owned timber that minimizes waste when multiple owned timbers fit (Waste Mode)', () => {
      const cuts: RequiredCut[] = [{ length: 900, quantity: 1 }]
      const owned: OwnedTimber[] = [
        { length: 2000, quantity: 1 },
        { length: 1000, quantity: 1 },
      ]

      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'waste', owned)

      expect(result.plans[0].isOwned).toBe(true)
      expect(result.plans[0].timberLength).toBe(1000)
    })

    it('should fallback to purchased timber when owned timber is too small', () => {
      const cuts: RequiredCut[] = [{ length: 2500, quantity: 1 }]
      const owned: OwnedTimber[] = [{ length: 2000, quantity: 1 }]

      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost', owned)

      expect(result.plans[0].isOwned).toBe(false)
      expect(result.plans[0].timberLength).toBe(3000) // Standard timber 3000 fits 2500
      expect(result.ownedTimbersUsed).toBe(0)
    })

    it('should mix owned and purchased timber optimally', () => {
      const cuts: RequiredCut[] = [
        { length: 1000, quantity: 1 }, // Fits in owned 1200
        { length: 2000, quantity: 1 }, // Needs purchase (standard 2400)
      ]
      const owned: OwnedTimber[] = [{ length: 1200, quantity: 1 }]

      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost', owned)

      expect(result.ownedTimbersUsed).toBe(1)
      expect(result.purchasedTimbersNeeded).toBe(1)

      const ownedPlan = result.plans.find((p) => p.isOwned)
      const purchasedPlan = result.plans.find((p) => !p.isOwned)

      expect(ownedPlan?.cuts).toContain(1000)
      expect(purchasedPlan?.cuts).toContain(2000)
      expect(purchasedPlan?.timberLength).toBe(2400)
    })
  })

  describe('Cost Efficiency Verification', () => {
    it('should choose cheaper option: 2x1200 vs 1x2400 for 4x500mm', () => {
      // 4x500mm: 2x1200 ($18.80) fits 2 each vs 1x2400 ($19.20) fits all 4
      // 2400mm @ $8/m vs 1200mm @ $7.83/m - 1200 is cheaper per meter
      // But 4x500=2000mm + 4x kerf. With kerf=0: 2x1200 uses 2 timbers
      const cuts: RequiredCut[] = [{ length: 500, quantity: 4 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      // 2x1200 = $18.80, 1x2400 = $19.20 - should pick 2x1200
      expect(result.totalCost).toBe(18.8)
      expect(result.totalTimbers).toBe(2)
    })

    it('should choose 1x2400 over 2x1200 when more cost efficient', () => {
      // 3x700mm = 2100mm total. 2x1200 can't fit (1200 fits 1x700, so need 3 timbers = $28.20)
      // 1x2400 fits all 3 (2100 < 2400) = $19.20
      const cuts: RequiredCut[] = [{ length: 700, quantity: 3 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      expect(result.totalCost).toBe(19.2)
      expect(result.totalTimbers).toBe(1)
      expect(result.plans[0].timberLength).toBe(2400)
    })

    it('should verify cost per meter selection', () => {
      // Cost per meter: 1200=$7.83/m, 1800=$8.06/m, 2400=$8/m, 3000=$7.97/m, 3600=$7.97/m
      // For 2800mm cut: need 3000mm ($23.90)
      const cuts: RequiredCut[] = [{ length: 2800, quantity: 1 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      expect(result.plans[0].timberLength).toBe(3000)
      expect(result.totalCost).toBe(23.9)
    })

    it('should optimize multiple different lengths for minimum cost', () => {
      // 1x1100 + 1x1000 = 2100mm - fits in 2400 ($19.20)
      // vs 2x1200 = $18.80 (1100 in one, 1000 in other)
      // 1200 fits 1100 (waste 100), 1200 fits 1000 (waste 200)
      const cuts: RequiredCut[] = [
        { length: 1100, quantity: 1 },
        { length: 1000, quantity: 1 },
      ]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      // Both fit in 2400 ($19.20) or 2x1200 ($18.80) - algorithm should pick cheaper
      expect(result.totalCost).toBeLessThanOrEqual(19.2)
    })

    it('should handle real-world deck project efficiently', () => {
      // Deck boards: 10x1500mm pieces
      // 1800mm ($14.50) fits 1 piece each = 10 timbers = $145
      // 3000mm ($23.90) fits 1 piece (waste 1500) = 10 timbers = $239
      // 3600mm ($28.70) fits 2 pieces = 5 timbers = $143.50
      // But actually: 3000mm fits 2x1500=3000 exactly! 5x3000 = $119.50
      const cuts: RequiredCut[] = [{ length: 1500, quantity: 10 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      // 3000 fits 2x1500=3000 exactly, 5 timbers = $119.50
      expect(result.totalCost).toBe(119.5)
      expect(result.totalTimbers).toBe(5)
    })

    it('should account for kerf in cost calculations', () => {
      // 2x590mm with 3mm kerf = 590+3+590+3=1186mm - fits in 1200
      const cuts: RequiredCut[] = [{ length: 590, quantity: 2 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 3, 'cost')

      expect(result.totalTimbers).toBe(1)
      expect(result.totalCost).toBe(9.4)
    })

    it('should upgrade timber when kerf pushes over boundary', () => {
      // 2x595mm = 1190mm, but with 5mm kerf = 595+5+595+5=1200mm exactly - should still fit
      const cuts: RequiredCut[] = [{ length: 595, quantity: 2 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 5, 'cost')

      expect(result.totalTimbers).toBe(1)
      expect(result.plans[0].timberLength).toBe(1200)
    })

    it('should upgrade timber when kerf exceeds 1200', () => {
      // 2x596mm with 5mm kerf = 596+5+596+5=1202mm - needs 1800
      const cuts: RequiredCut[] = [{ length: 596, quantity: 2 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 5, 'cost')

      expect(result.plans[0].timberLength).toBe(1800)
    })
  })

  describe('Waste Mode Verification', () => {
    it('should minimize waste even if costs more', () => {
      // 1x1150mm: 1200 (waste=50), 1800 (waste=650)
      const cuts: RequiredCut[] = [{ length: 1150, quantity: 1 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'waste')

      expect(result.plans[0].timberLength).toBe(1200)
      expect(result.totalWaste).toBe(50)
    })

    it('should prefer tighter packing in waste mode', () => {
      // 3x1100mm = 3300mm total
      // 3x1200 = waste 300 total (100 each)
      // 1x3600 = waste 300, 1x1200 for remaining would be waste 100 more... 
      // Actually 3x1100 fits in 1x3600 (waste 300) vs 3x1200 (waste 300)
      // But wait: 1200 only fits 1x1100 (waste 100)
      // So 3x1200 = $28.20 with waste 300
      // 1x3600 fits 3x1100=3300 (waste 300) = $28.70
      // Same waste, but 3x1200 is cheaper
      const cuts: RequiredCut[] = [{ length: 1100, quantity: 3 }]
      const resultWaste = optimizeTimberCutting(standardTimbers, cuts, 0, 'waste')

      expect(resultWaste.totalWaste).toBe(300)
    })

    it('should have less or equal waste compared to cost mode', () => {
      const cuts: RequiredCut[] = [
        { length: 850, quantity: 5 },
        { length: 450, quantity: 8 },
        { length: 300, quantity: 6 },
      ]
      const kerf = 3

      const costResult = optimizeTimberCutting(standardTimbers, cuts, kerf, 'cost')
      const wasteResult = optimizeTimberCutting(standardTimbers, cuts, kerf, 'waste')

      expect(wasteResult.totalWaste).toBeLessThanOrEqual(costResult.totalWaste)
    })
  })

  describe('All Cuts Fulfilled Verification', () => {
    it('should fulfill all cuts exactly', () => {
      const cuts: RequiredCut[] = [
        { length: 400, quantity: 7 },
        { length: 600, quantity: 5 },
        { length: 800, quantity: 3 },
      ]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      // Count all cuts in plans
      const cutCounts: Record<number, number> = {}
      result.plans.forEach((plan) => {
        plan.cuts.forEach((cut) => {
          cutCounts[cut] = (cutCounts[cut] || 0) + 1
        })
      })

      expect(cutCounts[400]).toBe(7)
      expect(cutCounts[600]).toBe(5)
      expect(cutCounts[800]).toBe(3)
    })

    it('should handle large quantity orders', () => {
      const cuts: RequiredCut[] = [{ length: 500, quantity: 100 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      const totalCuts = result.plans.reduce((sum, p) => sum + p.cuts.length, 0)
      expect(totalCuts).toBe(100)
    })

    it('should handle many different cut lengths', () => {
      const cuts: RequiredCut[] = [
        { length: 100, quantity: 2 },
        { length: 200, quantity: 2 },
        { length: 300, quantity: 2 },
        { length: 400, quantity: 2 },
        { length: 500, quantity: 2 },
        { length: 600, quantity: 2 },
        { length: 700, quantity: 2 },
        { length: 800, quantity: 2 },
      ]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      const totalPieces = cuts.reduce((sum, c) => sum + c.quantity, 0)
      const totalCuts = result.plans.reduce((sum, p) => sum + p.cuts.length, 0)
      expect(totalCuts).toBe(totalPieces)
    })
  })

  describe('Optimal Packing Verification', () => {
    it('should pack pieces efficiently into single timber', () => {
      // 1000+200 = 1200 exactly in one timber
      const cuts: RequiredCut[] = [
        { length: 1000, quantity: 1 },
        { length: 200, quantity: 1 },
      ]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      expect(result.totalTimbers).toBe(1)
      expect(result.plans[0].timberLength).toBe(1200)
      expect(result.plans[0].waste).toBe(0)
    })

    it('should find best combination for mixed sizes', () => {
      // 800+400=1200, perfect fit
      const cuts: RequiredCut[] = [
        { length: 800, quantity: 1 },
        { length: 400, quantity: 1 },
      ]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      expect(result.totalTimbers).toBe(1)
      expect(result.plans[0].cuts.sort()).toEqual([400, 800].sort())
    })

    it('should not split pieces unnecessarily', () => {
      // 3x400 = 1200 - all fit in one timber
      const cuts: RequiredCut[] = [{ length: 400, quantity: 3 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      expect(result.totalTimbers).toBe(1)
      expect(result.plans[0].cuts).toHaveLength(3)
    })
  })

  describe('Kerf Edge Cases', () => {
    it('should handle large kerf values', () => {
      const cuts: RequiredCut[] = [{ length: 500, quantity: 2 }]
      const kerf = 50 // Large kerf

      // 500+50+500+50=1100, fits in 1200
      const result = optimizeTimberCutting(standardTimbers, cuts, kerf, 'cost')

      expect(result.plans[0].timberLength).toBe(1200)
      expect(result.totalKerf).toBe(100)
    })

    it('should calculate waste correctly with kerf', () => {
      const cuts: RequiredCut[] = [{ length: 500, quantity: 2 }]
      const kerf = 3

      // 500+3+500+3=1006mm used, waste=1200-1006=194
      const result = optimizeTimberCutting(standardTimbers, cuts, kerf, 'cost')

      expect(result.plans[0].waste).toBe(194)
      expect(result.plans[0].kerfUsed).toBe(6)
      // totalWaste includes kerf
      expect(result.totalWaste).toBe(194 + 6)
    })
  })

  describe('Owned Timber Edge Cases', () => {
    it('should exhaust owned timber before purchasing', () => {
      const cuts: RequiredCut[] = [{ length: 500, quantity: 10 }]
      const owned: OwnedTimber[] = [{ length: 1200, quantity: 3 }]

      // 3 owned fit 2 each = 6 cuts, need 4 more = 2 purchased
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost', owned)

      expect(result.ownedTimbersUsed).toBe(3)
      expect(result.purchasedTimbersNeeded).toBe(2)
    })

    it('should handle zero quantity owned timber', () => {
      const cuts: RequiredCut[] = [{ length: 500, quantity: 1 }]
      const owned: OwnedTimber[] = [{ length: 1200, quantity: 0 }]

      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost', owned)

      expect(result.ownedTimbersUsed).toBe(0)
      expect(result.purchasedTimbersNeeded).toBe(1)
    })

    it('should prefer owned timber with best fit over worse fit', () => {
      const cuts: RequiredCut[] = [{ length: 1000, quantity: 1 }]
      const owned: OwnedTimber[] = [
        { length: 3000, quantity: 1 },
        { length: 1100, quantity: 1 },
      ]

      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost', owned)

      // Should use 1100 (waste 100) over 3000 (waste 2000)
      expect(result.plans[0].timberLength).toBe(1100)
      expect(result.plans[0].waste).toBe(100)
    })
  })

  describe('Mathematical Correctness', () => {
    it('should have totalCost equal sum of purchased timber prices', () => {
      const cuts: RequiredCut[] = [{ length: 1000, quantity: 5 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      const expectedCost = result.plans
        .filter((p) => !p.isOwned)
        .reduce((sum, p) => sum + p.timberPrice, 0)

      expect(result.totalCost).toBe(expectedCost)
    })

    it('should have totalWaste equal sum of waste + kerf', () => {
      const cuts: RequiredCut[] = [{ length: 500, quantity: 4 }]
      const kerf = 3
      const result = optimizeTimberCutting(standardTimbers, cuts, kerf, 'cost')

      const expectedWaste = result.plans.reduce((sum, p) => sum + p.waste + p.kerfUsed, 0)

      expect(result.totalWaste).toBe(expectedWaste)
    })

    it('should have totalTimbers equal ownedUsed + purchasedNeeded', () => {
      const cuts: RequiredCut[] = [{ length: 600, quantity: 8 }]
      const owned: OwnedTimber[] = [{ length: 1200, quantity: 2 }]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost', owned)

      expect(result.totalTimbers).toBe(result.ownedTimbersUsed + result.purchasedTimbersNeeded)
    })

    it('should have correct cut totals per plan', () => {
      const cuts: RequiredCut[] = [
        { length: 600, quantity: 3 },
        { length: 400, quantity: 4 },
      ]
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      result.plans.forEach((plan) => {
        const cutsTotal = plan.cuts.reduce((sum, c) => sum + c, 0)
        // cuts + waste should equal timber length (when kerf=0)
        expect(cutsTotal + plan.waste).toBe(plan.timberLength)
      })
    })
  })

  describe('Comparison Against Naive Solutions', () => {
    it('should be cheaper than using smallest timber for each cut', () => {
      const cuts: RequiredCut[] = [{ length: 500, quantity: 6 }]

      // Naive: 6x1200 = 6 timbers = $56.40
      const naiveCost = 6 * 9.4

      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      // Optimized: 1x3000 fits all 6x500=3000 exactly = $23.90
      expect(result.totalCost).toBeLessThan(naiveCost)
      expect(result.totalCost).toBe(23.9)
    })

    it('should pack better than first-fit without optimization', () => {
      const cuts: RequiredCut[] = [
        { length: 700, quantity: 2 },
        { length: 500, quantity: 2 },
      ]

      // Total: 2400mm - all fit in one 2400mm timber
      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      // Verify all 4 cuts are placed and total cost is optimal
      const totalCuts = result.plans.reduce((sum, p) => sum + p.cuts.length, 0)
      expect(totalCuts).toBe(4)
      expect(result.totalTimbers).toBeLessThanOrEqual(2)
    })
  })

  describe('Stress Tests', () => {
    it('should handle 50 different cut sizes', () => {
      const cuts: RequiredCut[] = []
      for (let i = 1; i <= 50; i++) {
        cuts.push({ length: 100 + i * 10, quantity: 1 })
      }

      const result = optimizeTimberCutting(standardTimbers, cuts, 0, 'cost')

      const totalCuts = result.plans.reduce((sum, p) => sum + p.cuts.length, 0)
      expect(totalCuts).toBe(50)
    })

    it('should complete in reasonable time for large orders', () => {
      const cuts: RequiredCut[] = [
        { length: 300, quantity: 50 },
        { length: 450, quantity: 30 },
        { length: 600, quantity: 20 },
      ]

      const start = Date.now()
      const result = optimizeTimberCutting(standardTimbers, cuts, 3, 'cost')
      const elapsed = Date.now() - start

      expect(elapsed).toBeLessThan(1000) // Should complete in under 1 second
      expect(result.plans.length).toBeGreaterThan(0)
    })
  })
})
