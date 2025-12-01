import {
  type SheetStock,
  type RequiredPanel,
  type SheetSolution,
  type OwnedSheet,
  type GrainDirection,
} from '@/lib/sheet-optimizer'
import { type SheetProject } from '@/lib/storage'

export type SheetState = {
  sheets: SheetStock[]
  panels: RequiredPanel[]
  ownedSheets: OwnedSheet[]
  solution: SheetSolution | null
  kerf: number
  mode: 'cost' | 'waste'
  unit: 'mm' | 'in'
  grainEnabled: boolean
  currentProjectId: string | null
  projectName: string
  projects: SheetProject[]
  showSaveDialog: boolean
  showLoadDialog: boolean
  showErrorDialog: boolean
  errorMessage: string | null
  isCalculating: boolean
}

export type SheetAction =
  | { type: 'ADD_SHEET' }
  | { type: 'REMOVE_SHEET'; index: number }
  | { type: 'UPDATE_SHEET'; index: number; field: keyof SheetStock; value: number | GrainDirection }
  | { type: 'ADD_PANEL' }
  | { type: 'REMOVE_PANEL'; index: number }
  | { type: 'UPDATE_PANEL'; index: number; field: keyof RequiredPanel; value: number | string | boolean | GrainDirection }
  | { type: 'ADD_OWNED' }
  | { type: 'REMOVE_OWNED'; index: number }
  | { type: 'UPDATE_OWNED'; index: number; field: keyof OwnedSheet; value: number | GrainDirection }
  | { type: 'SET_SOLUTION'; solution: SheetSolution | null }
  | { type: 'SET_KERF'; kerf: number }
  | { type: 'SET_MODE'; mode: 'cost' | 'waste' }
  | { type: 'SET_UNIT'; unit: 'mm' | 'in' }
  | { type: 'SET_GRAIN_ENABLED'; grainEnabled: boolean }
  | { type: 'SET_PROJECT_NAME'; name: string }
  | { type: 'SET_PROJECT_ID'; id: string | null }
  | { type: 'SET_PROJECTS'; projects: SheetProject[] }
  | { type: 'SET_SHEETS'; sheets: SheetStock[] }
  | { type: 'SET_PANELS'; panels: RequiredPanel[] }
  | { type: 'SET_OWNED_SHEETS'; ownedSheets: OwnedSheet[] }
  | { type: 'SET_SHOW_SAVE_DIALOG'; show: boolean }
  | { type: 'SET_SHOW_LOAD_DIALOG'; show: boolean }
  | { type: 'SET_SHOW_ERROR_DIALOG'; show: boolean }
  | { type: 'SET_ERROR_MESSAGE'; error: string | null }
  | { type: 'RESET_TO_NEW_PROJECT' }
  | { type: 'SET_IS_CALCULATING'; isCalculating: boolean }

export const defaultSheets: SheetStock[] = [
  { width: 2440, height: 1220, price: 45.0 },  // Standard 8x4 sheet
  { width: 2440, height: 610, price: 25.0 },   // Half sheet
]

export const defaultPanels: RequiredPanel[] = [
  { width: 600, height: 400, quantity: 4, canRotate: true }
]

export function sheetReducer(state: SheetState, action: SheetAction): SheetState {
  switch (action.type) {
    case 'ADD_SHEET':
      return { ...state, sheets: [...state.sheets, { width: 0, height: 0, price: 0 }] }
    case 'REMOVE_SHEET':
      return { ...state, sheets: state.sheets.filter((_, i) => i !== action.index) }
    case 'UPDATE_SHEET': {
      const updated = [...state.sheets]
      updated[action.index] = { ...updated[action.index], [action.field]: action.value }
      return { ...state, sheets: updated }
    }

    case 'ADD_PANEL':
      return { ...state, panels: [...state.panels, { width: 0, height: 0, quantity: 1, canRotate: true }] }
    case 'REMOVE_PANEL':
      return { ...state, panels: state.panels.filter((_, i) => i !== action.index) }
    case 'UPDATE_PANEL': {
      const updated = [...state.panels]
      updated[action.index] = { ...updated[action.index], [action.field]: action.value }
      return { ...state, panels: updated }
    }

    case 'ADD_OWNED':
      return { ...state, ownedSheets: [...state.ownedSheets, { width: 0, height: 0, quantity: 1 }] }
    case 'REMOVE_OWNED':
      return { ...state, ownedSheets: state.ownedSheets.filter((_, i) => i !== action.index) }
    case 'UPDATE_OWNED': {
      const updated = [...state.ownedSheets]
      updated[action.index] = { ...updated[action.index], [action.field]: action.value }
      return { ...state, ownedSheets: updated }
    }

    case 'SET_SOLUTION':
      return { ...state, solution: action.solution }
    case 'SET_KERF':
      return { ...state, kerf: action.kerf }
    case 'SET_MODE':
      return { ...state, mode: action.mode }
    case 'SET_UNIT':
      return { ...state, unit: action.unit }
    case 'SET_GRAIN_ENABLED':
      return { ...state, grainEnabled: action.grainEnabled }

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

    case 'SET_SHEETS':
      return { ...state, sheets: action.sheets }
    case 'SET_PANELS':
      return { ...state, panels: action.panels }
    case 'SET_OWNED_SHEETS':
      return { ...state, ownedSheets: action.ownedSheets }

    case 'RESET_TO_NEW_PROJECT':
      return {
        ...state,
        currentProjectId: null,
        projectName: '',
        sheets: defaultSheets,
        panels: defaultPanels,
        ownedSheets: [],
        kerf: 3,
        mode: 'cost',
        grainEnabled: false,
        solution: null,
      }

    case 'SET_IS_CALCULATING':
      return { ...state, isCalculating: action.isCalculating }

    default:
      return state
  }
}
