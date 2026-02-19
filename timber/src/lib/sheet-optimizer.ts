export type GrainDirection = 'horizontal' | 'vertical' | 'none'

export interface SheetStock {
  width: number
  height: number
  price: number
  grain?: GrainDirection
}

export interface RequiredPanel {
  width: number
  height: number
  quantity: number
  label?: string
  canRotate?: boolean
  grain?: GrainDirection
}

export interface Placement {
  panelIndex: number
  width: number
  height: number
  x: number
  y: number
  rotated: boolean
  label?: string
  grain?: GrainDirection
}

export interface SheetPlan {
  sheetWidth: number
  sheetHeight: number
  sheetPrice: number
  placements: Placement[]
  wasteArea: number
  usedArea: number
  isOwned: boolean
}

export interface SheetSolution {
  plans: SheetPlan[]
  totalCost: number
  totalWaste: number
  totalSheets: number
  ownedSheetsUsed: number
  purchasedSheetsNeeded: number
  efficiency: number // percentage of sheet area used
}

export type OptimizeMode = 'cost' | 'waste'

export interface OwnedSheet {
  width: number
  height: number
  quantity: number
  grain?: GrainDirection
}

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

interface PanelToPlace {
  originalIndex: number
  width: number
  height: number
  label?: string
  canRotate: boolean
  grain: GrainDirection
}

/**
 * Guillotine bin packing algorithm using Best Area Fit
 * Only allows cuts that go edge-to-edge (like a saw would)
 * Respects grain direction when specified
 */
function guillotinePack(
  sheetWidth: number,
  sheetHeight: number,
  panels: PanelToPlace[],
  kerf: number,
  sheetGrain: GrainDirection = 'none'
): { placements: Placement[]; remainingPanels: PanelToPlace[] } {
  const placements: Placement[] = []
  const remainingPanels = [...panels]
  
  // Free rectangles (areas where panels can be placed)
  let freeRects: Rect[] = [{ x: 0, y: 0, width: sheetWidth, height: sheetHeight }]

  // Sort panels by area (largest first) for better packing
  remainingPanels.sort((a, b) => (b.width * b.height) - (a.width * a.height))

  // Helper function to check if rotation is allowed based on grain
  const canRotateWithGrain = (panelGrain: GrainDirection, rotated: boolean): boolean => {
    // If either sheet or panel has no grain direction, rotation is allowed (if canRotate is true)
    if (sheetGrain === 'none' || panelGrain === 'none') return true
    
    // If both have grain, they must match after potential rotation
    // Panel grain after rotation: horizontal <-> vertical
    const effectivePanelGrain = rotated 
      ? (panelGrain === 'horizontal' ? 'vertical' : 'horizontal')
      : panelGrain
    
    return effectivePanelGrain === sheetGrain
  }

  let i = 0
  while (i < remainingPanels.length) {
    const panel = remainingPanels[i]
    
    let bestRect: Rect | null = null
    let bestRectIndex = -1
    let bestRotated = false
    let bestScore = Infinity

    // Find best free rectangle for this panel
    for (let j = 0; j < freeRects.length; j++) {
      const rect = freeRects[j]
      const widthUsed = panel.width + (rect.width > panel.width ? kerf : 0)
      const heightUsed = panel.height + (rect.height > panel.height ? kerf : 0)
      
      // Try normal orientation (check grain compatibility)
      if (widthUsed <= rect.width && heightUsed <= rect.height) {
        if (canRotateWithGrain(panel.grain, false)) {
          const score = rect.width * rect.height - panel.width * panel.height
          if (score < bestScore) {
            bestScore = score
            bestRect = rect
            bestRectIndex = j
            bestRotated = false
          }
        }
      }
      
      // Try rotated if allowed and grain-compatible
      const rotatedWidthUsed = panel.height + (rect.width > panel.height ? kerf : 0)
      const rotatedHeightUsed = panel.width + (rect.height > panel.width ? kerf : 0)
      if (panel.canRotate && rotatedWidthUsed <= rect.width && rotatedHeightUsed <= rect.height) {
        if (canRotateWithGrain(panel.grain, true)) {
          const score = rect.width * rect.height - panel.width * panel.height
          if (score < bestScore) {
            bestScore = score
            bestRect = rect
            bestRectIndex = j
            bestRotated = true
          }
        }
      }
    }

    if (bestRect && bestRectIndex >= 0) {
      const placedWidth = bestRotated ? panel.height : panel.width
      const placedHeight = bestRotated ? panel.width : panel.height
      
      // Calculate effective grain after rotation
      let effectiveGrain = panel.grain
      if (bestRotated && panel.grain !== 'none') {
        effectiveGrain = panel.grain === 'horizontal' ? 'vertical' : 'horizontal'
      }
      
      placements.push({
        panelIndex: panel.originalIndex,
        width: placedWidth,
        height: placedHeight,
        x: bestRect.x,
        y: bestRect.y,
        rotated: bestRotated,
        label: panel.label,
        grain: effectiveGrain,
      })
      
      // Split the free rectangle (guillotine cut)
      const usedWidth = placedWidth + (bestRect.width > placedWidth ? kerf : 0)
      const usedHeight = placedHeight + (bestRect.height > placedHeight ? kerf : 0)
      
      freeRects.splice(bestRectIndex, 1)
      
      // Add remaining rectangles after guillotine split
      // Horizontal split first, then vertical
      const rightRect: Rect = {
        x: bestRect.x + usedWidth,
        y: bestRect.y,
        width: bestRect.width - usedWidth,
        height: usedHeight,
      }
      const bottomRect: Rect = {
        x: bestRect.x,
        y: bestRect.y + usedHeight,
        width: bestRect.width,
        height: bestRect.height - usedHeight,
      }
      
      if (rightRect.width > 0 && rightRect.height > 0) {
        freeRects.push(rightRect)
      }
      if (bottomRect.width > 0 && bottomRect.height > 0) {
        freeRects.push(bottomRect)
      }

      // Merge adjacent free rectangles where possible
      freeRects = mergeFreeRects(freeRects)
      
      remainingPanels.splice(i, 1)
      // Don't increment i, check same index again (new panel moved here)
    } else {
      i++ // Move to next panel if this one couldn't be placed
    }
  }

  return { placements, remainingPanels }
}

/**
 * Merge adjacent free rectangles to reduce fragmentation
 */
function mergeFreeRects(rects: Rect[]): Rect[] {
  // Simple implementation - just remove fully contained rectangles
  const result: Rect[] = []
  
  for (const rect of rects) {
    let isContained = false
    for (const other of rects) {
      if (rect !== other &&
          rect.x >= other.x &&
          rect.y >= other.y &&
          rect.x + rect.width <= other.x + other.width &&
          rect.y + rect.height <= other.y + other.height) {
        isContained = true
        break
      }
    }
    if (!isContained) {
      result.push(rect)
    }
  }
  
  return result
}

/**
 * Optimizes sheet cutting to minimize cost and waste
 * Supports grain direction matching when grainEnabled is true
 */
export function optimizeSheetCutting(
  availableSheets: SheetStock[],
  requiredPanels: RequiredPanel[],
  kerf: number = 0,
  mode: OptimizeMode = 'cost',
  ownedSheets: OwnedSheet[] = [],
  grainEnabled: boolean = false
): SheetSolution {
  // Flatten required panels into individual pieces
  const panels: PanelToPlace[] = []
  requiredPanels.forEach((panel, idx) => {
    for (let i = 0; i < panel.quantity; i++) {
      panels.push({
        originalIndex: idx,
        width: panel.width,
        height: panel.height,
        label: panel.label,
        canRotate: panel.canRotate ?? true,
        grain: grainEnabled ? (panel.grain ?? 'none') : 'none',
      })
    }
  })

  // Sort panels by area (largest first)
  panels.sort((a, b) => (b.width * b.height) - (a.width * a.height))

  // Track owned sheet inventory with grain
  const ownedInventory = ownedSheets.map(s => ({ 
    width: s.width, 
    height: s.height, 
    remaining: s.quantity,
    grain: grainEnabled ? (s.grain ?? 'none') : 'none' as GrainDirection,
  }))

  // Sort sheets by price efficiency (area per dollar)
  const sortedSheets = [...availableSheets].sort(
    (a, b) => (a.price / (a.width * a.height)) - (b.price / (b.width * b.height))
  )

  const plans: SheetPlan[] = []
  let remainingPanels = [...panels]

  while (remainingPanels.length > 0) {
    let bestFit: {
      sheet: SheetStock
      placements: Placement[]
      remaining: PanelToPlace[]
      usedArea: number
      wasteArea: number
      isOwned: boolean
      sheetGrain: GrainDirection
    } | null = null

    // First try owned sheets
    for (const owned of ownedInventory) {
      if (owned.remaining <= 0) continue

      const result = guillotinePack(owned.width, owned.height, [...remainingPanels], kerf, owned.grain)
      
      if (result.placements.length > 0) {
        const usedArea = result.placements.reduce((sum, p) => sum + p.width * p.height, 0)
        const sheetArea = owned.width * owned.height
        const wasteArea = sheetArea - usedArea

        const shouldUpdate = !bestFit || 
          (mode === 'waste' && wasteArea < bestFit.wasteArea) ||
          (mode === 'cost' && result.placements.length > bestFit.placements.length) ||
          (!bestFit.isOwned)

        if (shouldUpdate) {
          bestFit = {
            sheet: { width: owned.width, height: owned.height, price: 0, grain: owned.grain },
            placements: result.placements,
            remaining: result.remainingPanels,
            usedArea,
            wasteArea,
            isOwned: true,
            sheetGrain: owned.grain,
          }
        }
      }
    }

    // Then try purchasable sheets if no good owned fit
    if (!bestFit || !bestFit.isOwned) {
      for (const sheet of sortedSheets) {
        const sheetGrain = grainEnabled ? (sheet.grain ?? 'none') : 'none' as GrainDirection
        const result = guillotinePack(sheet.width, sheet.height, [...remainingPanels], kerf, sheetGrain)
        
        if (result.placements.length > 0) {
          const usedArea = result.placements.reduce((sum, p) => sum + p.width * p.height, 0)
          const sheetArea = sheet.width * sheet.height
          const wasteArea = sheetArea - usedArea

          if (!bestFit) {
            bestFit = {
              sheet,
              placements: result.placements,
              remaining: result.remainingPanels,
              usedArea,
              wasteArea,
              isOwned: false,
              sheetGrain,
            }
            continue
          }

          if (mode === 'waste') {
            const currentEfficiency = usedArea / sheetArea
            const bestEfficiency = bestFit.usedArea / (bestFit.sheet.width * bestFit.sheet.height)
            if (currentEfficiency > bestEfficiency) {
              bestFit = {
                sheet,
                placements: result.placements,
                remaining: result.remainingPanels,
                usedArea,
                wasteArea,
                isOwned: false,
                sheetGrain,
              }
            }
          } else {
            // Cost mode: prefer cheaper per used area
            const currentCostPerArea = sheet.price / usedArea
            const bestCostPerArea = bestFit.sheet.price / bestFit.usedArea
            if (currentCostPerArea < bestCostPerArea || bestFit.isOwned) {
              bestFit = {
                sheet,
                placements: result.placements,
                remaining: result.remainingPanels,
                usedArea,
                wasteArea,
                isOwned: false,
                sheetGrain,
              }
            }
          }
        }
      }
    }

    if (!bestFit) {
      // No sheet can fit remaining panels
      const largestPanel = remainingPanels[0]
      const suitableSheet = sortedSheets.find(
        s => (s.width >= largestPanel.width && s.height >= largestPanel.height) ||
             (largestPanel.canRotate && s.width >= largestPanel.height && s.height >= largestPanel.width)
      )

      if (!suitableSheet) {
        throw new Error(
          `No sheet available can fit panel of size ${largestPanel.width}x${largestPanel.height}`
        )
      }

      // Place just the one panel
      const rotated = !(suitableSheet.width >= largestPanel.width && suitableSheet.height >= largestPanel.height)
      const placement: Placement = {
        panelIndex: largestPanel.originalIndex,
        width: rotated ? largestPanel.height : largestPanel.width,
        height: rotated ? largestPanel.width : largestPanel.height,
        x: 0,
        y: 0,
        rotated,
        label: largestPanel.label,
        grain: largestPanel.grain,
      }

      bestFit = {
        sheet: suitableSheet,
        placements: [placement],
        remaining: remainingPanels.slice(1),
        usedArea: largestPanel.width * largestPanel.height,
        wasteArea: suitableSheet.width * suitableSheet.height - largestPanel.width * largestPanel.height,
        isOwned: false,
        sheetGrain: grainEnabled ? (suitableSheet.grain ?? 'none') : 'none',
      }
    }

    // Decrement owned inventory if used
    if (bestFit.isOwned) {
      const ownedEntry = ownedInventory.find(
        o => o.width === bestFit!.sheet.width && 
             o.height === bestFit!.sheet.height && 
             o.remaining > 0
      )
      if (ownedEntry) ownedEntry.remaining--
    }

    // Add plan
    plans.push({
      sheetWidth: bestFit.sheet.width,
      sheetHeight: bestFit.sheet.height,
      sheetPrice: bestFit.sheet.price,
      placements: bestFit.placements,
      wasteArea: bestFit.wasteArea,
      usedArea: bestFit.usedArea,
      isOwned: bestFit.isOwned,
    })

    remainingPanels = bestFit.remaining
  }

  const totalCost = plans.reduce((sum, plan) => sum + (plan.isOwned ? 0 : plan.sheetPrice), 0)
  const totalWaste = plans.reduce((sum, plan) => sum + plan.wasteArea, 0)
  const totalUsed = plans.reduce((sum, plan) => sum + plan.usedArea, 0)
  const totalArea = plans.reduce((sum, plan) => sum + plan.sheetWidth * plan.sheetHeight, 0)
  const totalSheets = plans.length
  const ownedSheetsUsed = plans.filter(p => p.isOwned).length
  const purchasedSheetsNeeded = plans.filter(p => !p.isOwned).length

  return {
    plans,
    totalCost,
    totalWaste,
    totalSheets,
    ownedSheetsUsed,
    purchasedSheetsNeeded,
    efficiency: totalArea > 0 ? (totalUsed / totalArea) * 100 : 0,
  }
}
