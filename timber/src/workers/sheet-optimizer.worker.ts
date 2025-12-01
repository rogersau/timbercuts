import { optimizeSheetCutting } from '../lib/sheet-optimizer'

self.onmessage = (e: MessageEvent) => {
  const { availableSheets, requiredPanels, kerf, mode, ownedSheets, grainEnabled } = e.data

  try {
    const solution = optimizeSheetCutting(availableSheets, requiredPanels, kerf, mode, ownedSheets, grainEnabled)
    self.postMessage({ type: 'SUCCESS', solution })
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
