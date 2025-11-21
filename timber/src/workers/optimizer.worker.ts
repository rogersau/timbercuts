import { optimizeTimberCutting } from '../lib/timber-optimizer'

self.onmessage = (e: MessageEvent) => {
  const { availableTimbers, requiredCuts, kerf, mode, ownedTimbers } = e.data

  try {
    const solution = optimizeTimberCutting(availableTimbers, requiredCuts, kerf, mode, ownedTimbers)
    self.postMessage({ type: 'SUCCESS', solution })
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
