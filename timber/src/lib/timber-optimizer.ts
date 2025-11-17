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
}

export interface Solution {
  plans: CutPlan[];
  totalCost: number;
  totalWaste: number; // includes leftover + kerf used
  totalKerf: number; // total kerf across all timbers
  totalTimbers: number;
}

/**
 * Optimizes timber cutting to minimize cost and waste
 */
export type OptimizeMode = 'cost' | 'waste'

export function optimizeTimberCutting(
  availableTimbers: TimberStock[],
  requiredCuts: RequiredCut[],
  kerf: number = 0,
  mode: OptimizeMode = 'cost'
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

  // Sort timbers by cost efficiency (price per unit length)
  const sortedTimbers = [...availableTimbers].sort(
    (a, b) => a.price / a.length - b.price / b.length
  );

  const plans: CutPlan[] = [];
  const remainingPieces = [...pieces];

  // Try to fit pieces into timbers using First Fit Decreasing
  while (remainingPieces.length > 0) {
    let bestFit: { timber: TimberStock; cuts: number[]; waste: number; kerfUsed: number; usedLength: number } | null = null;

    // Try each timber type
    for (const timber of sortedTimbers) {
      const result = fitPiecesToTimber(timber.length, [...remainingPieces], kerf);
      const usedLength = timber.length - result.waste;
      
      if (result.cuts.length > 0) {
        const waste = result.waste;
        
        // Prefer timber with less waste, or if same waste, more pieces fitted
        if (!bestFit) {
          bestFit = { timber, cuts: result.cuts, waste, kerfUsed: result.kerfUsed ?? 0, usedLength };
          continue;
        }

        if (mode === 'waste') {
          // minimize waste, tie-breaker max pieces, then lower price
          if (
            waste < bestFit.waste ||
            (waste === bestFit.waste && result.cuts.length > bestFit.cuts.length) ||
            (waste === bestFit.waste && result.cuts.length === bestFit.cuts.length && timber.price < bestFit.timber.price)
          ) {
            bestFit = { timber, cuts: result.cuts, waste, kerfUsed: result.kerfUsed ?? 0, usedLength };
          }
        } else {
          // mode === 'cost' -> minimize effective cost per used length, then lowest timber price, then less waste
          const bestUsed = bestFit.usedLength > 0 ? bestFit.usedLength : 1; // avoid div by zero
          const bestCostPerUsed = bestFit.timber.price / bestUsed;
          const currUsed = usedLength > 0 ? usedLength : 1;
          const currCostPerUsed = timber.price / currUsed;

          if (
            currCostPerUsed < bestCostPerUsed ||
            (currCostPerUsed === bestCostPerUsed && timber.price < bestFit.timber.price) ||
            (currCostPerUsed === bestCostPerUsed && timber.price === bestFit.timber.price && result.cuts.length > bestFit.cuts.length)
          ) {
            bestFit = { timber, cuts: result.cuts, waste, kerfUsed: result.kerfUsed ?? 0, usedLength };
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
      };
    }

    if (!bestFit) {
      throw new Error('Internal optimizer error: best fit missing')
    }

    // Add plan
    plans.push({
      timberLength: bestFit.timber.length,
      timberPrice: bestFit.timber.price,
      cuts: bestFit.cuts,
      waste: bestFit.waste,
      kerfUsed: bestFit.kerfUsed ?? 0,
    });

    // Remove fitted pieces
    bestFit.cuts.forEach(cut => {
      const idx = remainingPieces.indexOf(cut);
      if (idx > -1) remainingPieces.splice(idx, 1);
    });
  }

  const totalCost = plans.reduce((sum, plan) => sum + plan.timberPrice, 0);
  const totalWaste = plans.reduce((sum, plan) => sum + plan.waste + plan.kerfUsed, 0);
  const totalKerf = plans.reduce((sum, plan) => sum + plan.kerfUsed, 0);
  const totalTimbers = plans.length;

  return { plans, totalCost, totalWaste, totalKerf, totalTimbers };
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
    const needKerf = cuts.length > 0 ? kerf : 0;
    const potentialUsed = used + needKerf + piece;
    if (potentialUsed <= timberLength) {
      // We'll add piece and kerf (if needed)
      used = potentialUsed;
      if (needKerf > 0) kerfUsed += needKerf;
      cuts.push(piece);
    }
  }

  return { cuts, waste: timberLength - used, kerfUsed };
}
