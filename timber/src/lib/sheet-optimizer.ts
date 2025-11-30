export interface SheetStock {
  width: number
  height: number
  price: number
}

export interface RequiredPanel {
  width: number
  height: number
  quantity: number
  label?: string
  canRotate?: boolean
}

export interface Placement {
  panelIndex: number
  width: number
  height: number
  x: number
  y: number
  rotated: boolean
  label?: string
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
}

/**
 * Guillotine bin packing algorithm using Best Area Fit
 * Only allows cuts that go edge-to-edge (like a saw would)
 */
function guillotinePack(
  sheetWidth: number,
  sheetHeight: number,
  panels: PanelToPlace[],
  kerf: number
): { placements: Placement[]; remainingPanels: PanelToPlace[] } {
  const placements: Placement[] = []
  const remainingPanels = [...panels]
  
  // Free rectangles (areas where panels can be placed)
  let freeRects: Rect[] = [{ x: 0, y: 0, width: sheetWidth, height: sheetHeight }]

  // Sort panels by area (largest first) for better packing
  remainingPanels.sort((a, b) => (b.width * b.height) - (a.width * a.height))

  let i = 0
  while (i < remainingPanels.length) {
    const panel = remainingPanels[i]
    const panelWithKerf = { 
      width: panel.width + kerf, 
      height: panel.height + kerf 
    }
    
    let bestRect: Rect | null = null
    let bestRectIndex = -1
    let bestRotated = false
    let bestScore = Infinity

    // Find best free rectangle for this panel
    for (let j = 0; j < freeRects.length; j++) {
      const rect = freeRects[j]
      
      // Try normal orientation
      if (panelWithKerf.width <= rect.width && panelWithKerf.height <= rect.height) {
        const score = rect.width * rect.height - panel.width * panel.height
        if (score < bestScore) {
          bestScore = score
          bestRect = rect
          bestRectIndex = j
          bestRotated = false
        }
      }
      
      // Try rotated if allowed
      if (panel.canRotate && panelWithKerf.height <= rect.width && panelWithKerf.width <= rect.height) {
        const score = rect.width * rect.height - panel.width * panel.height
        if (score < bestScore) {
          bestScore = score
          bestRect = rect
          bestRectIndex = j
          bestRotated = true
        }
      }
    }

    if (bestRect && bestRectIndex >= 0) {
      const placedWidth = bestRotated ? panel.height : panel.width
      const placedHeight = bestRotated ? panel.width : panel.height
      
      placements.push({
        panelIndex: panel.originalIndex,
        width: placedWidth,
        height: placedHeight,
        x: bestRect.x,
        y: bestRect.y,
        rotated: bestRotated,
        label: panel.label,
      })

      // Split the free rectangle (guillotine cut)
      const usedWidth = placedWidth + kerf
      const usedHeight = placedHeight + kerf
      
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
 */
export function optimizeSheetCutting(
  availableSheets: SheetStock[],
  requiredPanels: RequiredPanel[],
  kerf: number = 0,
  mode: OptimizeMode = 'cost',
  ownedSheets: OwnedSheet[] = []
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
      })
    }
  })

  // Sort panels by area (largest first)
  panels.sort((a, b) => (b.width * b.height) - (a.width * a.height))

  // Track owned sheet inventory
  const ownedInventory = ownedSheets.map(s => ({ 
    width: s.width, 
    height: s.height, 
    remaining: s.quantity 
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
    } | null = null

    // First try owned sheets
    for (const owned of ownedInventory) {
      if (owned.remaining <= 0) continue

      const result = guillotinePack(owned.width, owned.height, [...remainingPanels], kerf)
      
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
            sheet: { width: owned.width, height: owned.height, price: 0 },
            placements: result.placements,
            remaining: result.remainingPanels,
            usedArea,
            wasteArea,
            isOwned: true,
          }
        }
      }
    }

    // Then try purchasable sheets if no good owned fit
    if (!bestFit || !bestFit.isOwned) {
      for (const sheet of sortedSheets) {
        const result = guillotinePack(sheet.width, sheet.height, [...remainingPanels], kerf)
        
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
             (s.width >= largestPanel.height && s.height >= largestPanel.width)
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
      }

      bestFit = {
        sheet: suitableSheet,
        placements: [placement],
        remaining: remainingPanels.slice(1),
        usedArea: largestPanel.width * largestPanel.height,
        wasteArea: suitableSheet.width * suitableSheet.height - largestPanel.width * largestPanel.height,
        isOwned: false,
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
