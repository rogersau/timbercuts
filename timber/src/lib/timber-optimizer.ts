export interface TimberStock {
  length: number;
  price: number;
}

export interface RequiredCut {
  length: number;
  quantity: number;
}

export interface CutPlan {
  timberLength: number;
  timberPrice: number;
  cuts: number[];
  waste: number; // leftover from the timber after cuts
  kerfUsed: number; // total kerf consumed on this timber
  isOwned: boolean; // true if using owned timber, false if purchased
}

export interface Solution {
  plans: CutPlan[];
  totalCost: number;
  totalWaste: number; // includes leftover + kerf used
  totalKerf: number; // total kerf across all timbers
  totalTimbers: number;
  ownedTimbersUsed: number; // count of owned timbers used
  purchasedTimbersNeeded: number; // count of timbers to purchase
}

/**
 * Optimizes timber cutting to minimize cost and waste
 */
export type OptimizeMode = 'cost' | 'waste'

export interface OwnedTimber {
  length: number;
  quantity: number; // how many of this length the user owns
}

export function optimizeTimberCutting(
  availableTimbers: TimberStock[],
  requiredCuts: RequiredCut[],
  kerf: number = 0,
  mode: OptimizeMode = 'cost',
  ownedTimbers: OwnedTimber[] = []
): Solution {
  // Flatten required cuts into individual pieces
  const pieces: number[] = [];
  requiredCuts.forEach(cut => {
    for (let i = 0; i < cut.quantity; i++) {
      pieces.push(cut.length);
    }
  });

  // Sort pieces in descending order (largest first) for better packing
  pieces.sort((a, b) => b - a);

  // Track remaining quantities of owned timber
  const ownedInventory = ownedTimbers.map(o => ({ length: o.length, remaining: o.quantity }));

  // Sort timbers by cost efficiency (price per unit length)
  const sortedTimbers = [...availableTimbers].sort(
    (a, b) => a.price / a.length - b.price / b.length
  );

  const plans: CutPlan[] = [];
  const remainingPieces = [...pieces];

  // Try to fit pieces into timbers using First Fit Decreasing
  while (remainingPieces.length > 0) {
    let bestFit: { timber: TimberStock; cuts: number[]; waste: number; kerfUsed: number; usedLength: number; isOwned: boolean } | null = null;

    // First, try owned timber
    for (const owned of ownedInventory) {
      if (owned.remaining <= 0) continue;
      
      const result = fitPiecesToTimber(owned.length, [...remainingPieces], kerf);
      const usedLength = owned.length - result.waste;
      
      if (result.cuts.length > 0) {
        const waste = result.waste;
        
        if (!bestFit) {
          bestFit = { timber: { length: owned.length, price: 0 }, cuts: result.cuts, waste, kerfUsed: result.kerfUsed ?? 0, usedLength, isOwned: true };
          continue;
        }

        if (mode === 'waste') {
          if (
            waste < bestFit.waste ||
            (waste === bestFit.waste && result.cuts.length > bestFit.cuts.length)
          ) {
            bestFit = { timber: { length: owned.length, price: 0 }, cuts: result.cuts, waste, kerfUsed: result.kerfUsed ?? 0, usedLength, isOwned: true };
          }
        } else {
          // Cost mode: owned timber is free, always prefer it
          if (!bestFit.isOwned || result.cuts.length > bestFit.cuts.length) {
            bestFit = { timber: { length: owned.length, price: 0 }, cuts: result.cuts, waste, kerfUsed: result.kerfUsed ?? 0, usedLength, isOwned: true };
          }
        }
      }
    }

    // If no owned timber worked, try purchasable timber
    if (!bestFit || !bestFit.isOwned) {
      for (const timber of sortedTimbers) {
        const result = fitPiecesToTimber(timber.length, [...remainingPieces], kerf);
        const usedLength = timber.length - result.waste;
        
        if (result.cuts.length > 0) {
          const waste = result.waste;
          
          if (!bestFit) {
            bestFit = { timber, cuts: result.cuts, waste, kerfUsed: result.kerfUsed ?? 0, usedLength, isOwned: false };
            continue;
          }

          if (mode === 'waste') {
            if (
              waste < bestFit.waste ||
              (waste === bestFit.waste && result.cuts.length > bestFit.cuts.length) ||
              (waste === bestFit.waste && result.cuts.length === bestFit.cuts.length && timber.price < bestFit.timber.price)
            ) {
              bestFit = { timber, cuts: result.cuts, waste, kerfUsed: result.kerfUsed ?? 0, usedLength, isOwned: false };
            }
          } else {
            const bestUsed = bestFit.usedLength > 0 ? bestFit.usedLength : 1;
            const bestCostPerUsed = bestFit.timber.price / bestUsed;
            const currUsed = usedLength > 0 ? usedLength : 1;
            const currCostPerUsed = timber.price / currUsed;

            if (
              currCostPerUsed < bestCostPerUsed ||
              (currCostPerUsed === bestCostPerUsed && timber.price < bestFit.timber.price) ||
              (currCostPerUsed === bestCostPerUsed && timber.price === bestFit.timber.price && result.cuts.length > bestFit.cuts.length)
            ) {
              bestFit = { timber, cuts: result.cuts, waste, kerfUsed: result.kerfUsed ?? 0, usedLength, isOwned: false };
            }
          }
        }
      }
    }

    if (!bestFit) {
      // No timber can fit remaining pieces - use smallest timber that fits largest piece
      const largestPiece = remainingPieces[0];
      const suitableTimber = sortedTimbers.find(t => t.length >= largestPiece);
      
      if (!suitableTimber) {
        throw new Error(`No timber available can fit piece of length ${largestPiece}`);
      }

      bestFit = {
        timber: suitableTimber,
        cuts: [largestPiece],
        waste: suitableTimber.length - largestPiece,
        kerfUsed: 0,
        usedLength: largestPiece,
        isOwned: false,
      };
    }

    if (!bestFit) {
      throw new Error('Internal optimizer error: best fit missing')
    }

    // Decrement owned inventory if used
    if (bestFit.isOwned) {
      const ownedEntry = ownedInventory.find(o => o.length === bestFit!.timber.length && o.remaining > 0);
      if (ownedEntry) ownedEntry.remaining--;
    }

    // Add plan
    plans.push({
      timberLength: bestFit.timber.length,
      timberPrice: bestFit.timber.price,
      cuts: bestFit.cuts,
      waste: bestFit.waste,
      kerfUsed: bestFit.kerfUsed ?? 0,
      isOwned: bestFit.isOwned,
    });

    // Remove fitted pieces
    bestFit.cuts.forEach(cut => {
      const idx = remainingPieces.indexOf(cut);
      if (idx > -1) remainingPieces.splice(idx, 1);
    });
  }

  const totalCost = plans.reduce((sum, plan) => sum + (plan.isOwned ? 0 : plan.timberPrice), 0);
  const totalWaste = plans.reduce((sum, plan) => sum + plan.waste + plan.kerfUsed, 0);
  const totalKerf = plans.reduce((sum, plan) => sum + plan.kerfUsed, 0);
  const totalTimbers = plans.length;
  const ownedTimbersUsed = plans.filter(p => p.isOwned).length;
  const purchasedTimbersNeeded = plans.filter(p => !p.isOwned).length;

  return { plans, totalCost, totalWaste, totalKerf, totalTimbers, ownedTimbersUsed, purchasedTimbersNeeded };
}

/**
 * Fits pieces into a timber using First Fit Decreasing
 */
function fitPiecesToTimber(
  timberLength: number,
  pieces: number[],
  kerf: number
): { cuts: number[]; waste: number; kerfUsed: number } {
  const cuts: number[] = [];
  let used = 0; // length used including kerf
  let kerfUsed = 0;

  for (const piece of pieces) {
    const potentialUsed = used + piece + kerf;
    if (potentialUsed <= timberLength) {
      // Add piece and kerf for this cut
      used = potentialUsed;
      kerfUsed += kerf;
      cuts.push(piece);
    }
  }

  return { cuts, waste: timberLength - used, kerfUsed };
}
