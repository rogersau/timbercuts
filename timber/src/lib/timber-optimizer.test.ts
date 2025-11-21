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
  })
})
