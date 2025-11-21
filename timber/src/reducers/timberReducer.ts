import {
  type TimberStock,
  type RequiredCut,
  type Solution,
  type OwnedTimber,
} from '@/lib/timber-optimizer'
import { type Project } from '@/lib/storage'

export type State = {
  timbers: TimberStock[]
  cuts: RequiredCut[]
  ownedTimbers: OwnedTimber[]
  solution: Solution | null
  kerf: number
  mode: 'cost' | 'waste'
  unit: 'mm' | 'in'
  currentProjectId: string | null
  projectName: string
  projects: Project[]
  showSaveDialog: boolean
  showLoadDialog: boolean
  isCalculating: boolean
}

export type Action =
  | { type: 'ADD_TIMBER' }
  | { type: 'REMOVE_TIMBER'; index: number }
  | { type: 'UPDATE_TIMBER'; index: number; field: keyof TimberStock; value: number }
  | { type: 'ADD_CUT' }
  | { type: 'REMOVE_CUT'; index: number }
  | { type: 'UPDATE_CUT'; index: number; field: keyof RequiredCut; value: number }
  | { type: 'ADD_OWNED' }
  | { type: 'REMOVE_OWNED'; index: number }
  | { type: 'UPDATE_OWNED'; index: number; field: keyof OwnedTimber; value: number }
  | { type: 'SET_SOLUTION'; solution: Solution | null }
  | { type: 'SET_KERF'; kerf: number }
  | { type: 'SET_MODE'; mode: 'cost' | 'waste' }
  | { type: 'SET_UNIT'; unit: 'mm' | 'in' }
  | { type: 'SET_PROJECT_NAME'; name: string }
  | { type: 'SET_PROJECT_ID'; id: string | null }
  | { type: 'SET_PROJECTS'; projects: Project[] }
  | { type: 'SET_TIMBERS'; timbers: TimberStock[] }
  | { type: 'SET_CUTS'; cuts: RequiredCut[] }
  | { type: 'SET_OWNED_TIMBERS'; ownedTimbers: OwnedTimber[] }
  | { type: 'SET_SHOW_SAVE_DIALOG'; show: boolean }
  | { type: 'SET_SHOW_LOAD_DIALOG'; show: boolean }
  | { type: 'RESET_TO_NEW_PROJECT' }
  | { type: 'SET_IS_CALCULATING'; isCalculating: boolean }

export const defaultTimbers: TimberStock[] = [
  { length: 1200, price: 9.4 },
  { length: 1800, price: 14.5 },
  { length: 2400, price: 19.2 },
  { length: 3000, price: 23.9 },
  { length: 3600, price: 28.7 },
]

export const defaultCuts: RequiredCut[] = [{ length: 600, quantity: 4 }]

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    // --- Timber Stock Management ---
    case 'ADD_TIMBER':
      return { ...state, timbers: [...state.timbers, { length: 0, price: 0 }] }
    case 'REMOVE_TIMBER':
      return { ...state, timbers: state.timbers.filter((_, i) => i !== action.index) }
    case 'UPDATE_TIMBER': {
      const updated = [...state.timbers]
      updated[action.index] = { ...updated[action.index], [action.field]: action.value }
      return { ...state, timbers: updated }
    }

    // --- Required Cuts Management ---
    case 'ADD_CUT':
      return { ...state, cuts: [...state.cuts, { length: 0, quantity: 1 }] }
    case 'REMOVE_CUT':
      return { ...state, cuts: state.cuts.filter((_, i) => i !== action.index) }
    case 'UPDATE_CUT': {
      const updated = [...state.cuts]
      updated[action.index] = { ...updated[action.index], [action.field]: action.value }
      return { ...state, cuts: updated }
    }

    // --- Owned Timber Management ---
    case 'ADD_OWNED':
      return { ...state, ownedTimbers: [...state.ownedTimbers, { length: 0, quantity: 1 }] }
    case 'REMOVE_OWNED':
      return { ...state, ownedTimbers: state.ownedTimbers.filter((_, i) => i !== action.index) }
    case 'UPDATE_OWNED': {
      const updated = [...state.ownedTimbers]
      updated[action.index] = { ...updated[action.index], [action.field]: action.value }
      return { ...state, ownedTimbers: updated }
    }

    // --- Settings & Solution ---
    case 'SET_SOLUTION':
      return { ...state, solution: action.solution }
    case 'SET_KERF':
      return { ...state, kerf: action.kerf }
    case 'SET_MODE':
      return { ...state, mode: action.mode }
    case 'SET_UNIT':
      return { ...state, unit: action.unit }

    // --- Project Management ---
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

    // --- Bulk Updates (Loading Projects) ---
    case 'SET_TIMBERS':
      return { ...state, timbers: action.timbers }
    case 'SET_CUTS':
      return { ...state, cuts: action.cuts }
    case 'SET_OWNED_TIMBERS':
      return { ...state, ownedTimbers: action.ownedTimbers }

    // --- Reset ---
    case 'RESET_TO_NEW_PROJECT':
      return {
        ...state,
        currentProjectId: null,
        projectName: '',
        timbers: defaultTimbers,
        cuts: defaultCuts,
        ownedTimbers: [],
        kerf: 3,
        mode: 'cost',
        solution: null,
      }

    case 'SET_IS_CALCULATING':
      return { ...state, isCalculating: action.isCalculating }

    default:
      return state
  }
}
