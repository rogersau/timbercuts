import {
  type RectangularArea,
  type PaverType,
  type LayingPattern,
  type PaverCalculatorResult,
  COMMON_PAVER_TYPES,
} from '@/lib/paver-calculator'
import { type PaverProject } from '@/lib/storage'

export type PaverState = {
  areas: RectangularArea[]
  paver: PaverType
  pattern: LayingPattern
  gap: number
  customWastePercentage: number | null
  result: PaverCalculatorResult | null
  unit: 'mm' | 'in'
  currentProjectId: string | null
  projectName: string
  projects: PaverProject[]
  showSaveDialog: boolean
  showLoadDialog: boolean
  showErrorDialog: boolean
  errorMessage: string | null
  isCalculating: boolean
}

export type PaverAction =
  | { type: 'ADD_AREA' }
  | { type: 'REMOVE_AREA'; index: number }
  | { type: 'UPDATE_AREA'; index: number; field: keyof RectangularArea; value: number | string }
  | { type: 'SET_PAVER'; paver: PaverType }
  | { type: 'UPDATE_PAVER'; field: keyof PaverType; value: number | string }
  | { type: 'SET_PATTERN'; pattern: LayingPattern }
  | { type: 'SET_GAP'; gap: number }
  | { type: 'SET_CUSTOM_WASTE_PERCENTAGE'; percentage: number | null }
  | { type: 'SET_RESULT'; result: PaverCalculatorResult | null }
  | { type: 'SET_UNIT'; unit: 'mm' | 'in' }
  | { type: 'SET_PROJECT_NAME'; name: string }
  | { type: 'SET_PROJECT_ID'; id: string | null }
  | { type: 'SET_PROJECTS'; projects: PaverProject[] }
  | { type: 'SET_AREAS'; areas: RectangularArea[] }
  | { type: 'SET_SHOW_SAVE_DIALOG'; show: boolean }
  | { type: 'SET_SHOW_LOAD_DIALOG'; show: boolean }
  | { type: 'SET_SHOW_ERROR_DIALOG'; show: boolean }
  | { type: 'SET_ERROR_MESSAGE'; error: string | null }
  | { type: 'RESET_TO_NEW_PROJECT' }
  | { type: 'SET_IS_CALCULATING'; isCalculating: boolean }

export const defaultAreas: RectangularArea[] = [{ length: 3000, width: 3000, label: 'Area 1' }]

export const defaultPaver: PaverType =
  COMMON_PAVER_TYPES.find((p) => p.name === 'Standard Brick') || COMMON_PAVER_TYPES[0]

export function paverReducer(state: PaverState, action: PaverAction): PaverState {
  switch (action.type) {
    case 'ADD_AREA':
      return {
        ...state,
        areas: [
          ...state.areas,
          { length: 0, width: 0, label: `Area ${state.areas.length + 1}` },
        ],
      }
    case 'REMOVE_AREA':
      return { ...state, areas: state.areas.filter((_, i) => i !== action.index) }
    case 'UPDATE_AREA': {
      const updated = [...state.areas]
      updated[action.index] = { ...updated[action.index], [action.field]: action.value }
      return { ...state, areas: updated }
    }

    case 'SET_PAVER':
      return { ...state, paver: action.paver }
    case 'UPDATE_PAVER':
      return { ...state, paver: { ...state.paver, [action.field]: action.value } }

    case 'SET_PATTERN':
      return { ...state, pattern: action.pattern }
    case 'SET_GAP':
      return { ...state, gap: action.gap }
    case 'SET_CUSTOM_WASTE_PERCENTAGE':
      return { ...state, customWastePercentage: action.percentage }

    case 'SET_RESULT':
      return { ...state, result: action.result }
    case 'SET_UNIT':
      return { ...state, unit: action.unit }

    case 'SET_PROJECT_NAME':
      return { ...state, projectName: action.name }
    case 'SET_PROJECT_ID':
      return { ...state, currentProjectId: action.id }
    case 'SET_PROJECTS':
      return { ...state, projects: action.projects }
    case 'SET_SHOW_SAVE_DIALOG':
      return { ...state, showSaveDialog: action.show }
    case 'SET_SHOW_LOAD_DIALOG':
      return { ...state, showLoadDialog: action.show }
    case 'SET_SHOW_ERROR_DIALOG':
      return { ...state, showErrorDialog: action.show }
    case 'SET_ERROR_MESSAGE':
      return { ...state, errorMessage: action.error }

    case 'SET_AREAS':
      return { ...state, areas: action.areas }

    case 'RESET_TO_NEW_PROJECT':
      return {
        ...state,
        currentProjectId: null,
        projectName: '',
        areas: defaultAreas,
        paver: defaultPaver,
        pattern: 'stack',
        gap: 3,
        customWastePercentage: null,
        result: null,
      }

    case 'SET_IS_CALCULATING':
      return { ...state, isCalculating: action.isCalculating }

    default:
      return state
  }
}
