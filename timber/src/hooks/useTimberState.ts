import { useReducer, useMemo, useCallback } from 'react'
import { type TimberStock, type RequiredCut, type Solution, type OwnedTimber, optimizeTimberCutting } from '@/lib/timber-optimizer'
import { getAllProjects, saveProject, deleteProject, type Project } from '@/lib/storage'

type State = {
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
}


const defaultTimbers: TimberStock[] = [
  { length: 1200, price: 9.4 },
  { length: 1800, price: 14.5 },
  { length: 2400, price: 19.2 },
  { length: 3000, price: 23.9 },
  { length: 3600, price: 28.7 },
]

const defaultCuts: RequiredCut[] = [ { length: 600, quantity: 4 } ]

type Action =
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

/**
 * Reducer function to handle state updates for the timber optimizer.
 * Manages stock, cuts, owned timber, settings, and project state.
 */
function reducer(state: State, action: Action): State {
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
        timbers: [{ length: 1200, price: 9.4 }],
        cuts: [{ length: 600, quantity: 4 }],
        ownedTimbers: [],
        kerf: 3,
        mode: 'cost',
        solution: null,
      }
    default:
      return state
  }
}

export function useTimberState() {
  const [state, dispatch] = useReducer(reducer, {
    timbers: defaultTimbers,
    cuts: defaultCuts,
    ownedTimbers: [],
    solution: null,
    kerf: 3,
    mode: 'cost',
    unit: 'mm',
    currentProjectId: null,
    projectName: '',
    projects: getAllProjects(),
    showSaveDialog: false,
    showLoadDialog: false,
  })

  // Action helpers
  const addTimber = useCallback(() => dispatch({ type: 'ADD_TIMBER' }), [])
  const removeTimber = useCallback((index: number) => dispatch({ type: 'REMOVE_TIMBER', index }), [])
  const updateTimber = useCallback((index: number, field: keyof TimberStock, value: number) => dispatch({ type: 'UPDATE_TIMBER', index, field, value }), [])

  const addCut = useCallback(() => dispatch({ type: 'ADD_CUT' }), [])
  const removeCut = useCallback((index: number) => dispatch({ type: 'REMOVE_CUT', index }), [])
  const updateCut = useCallback((index: number, field: keyof RequiredCut, value: number) => dispatch({ type: 'UPDATE_CUT', index, field, value }), [])

  const addOwnedTimber = useCallback(() => dispatch({ type: 'ADD_OWNED' }), [])
  const removeOwnedTimber = useCallback((index: number) => dispatch({ type: 'REMOVE_OWNED', index }), [])
  const updateOwnedTimber = useCallback((index: number, field: keyof OwnedTimber, value: number) => dispatch({ type: 'UPDATE_OWNED', index, field, value }), [])

  const setSolution = useCallback((solution: Solution | null) => dispatch({ type: 'SET_SOLUTION', solution }), [])
  const setKerf = useCallback((kerf: number) => dispatch({ type: 'SET_KERF', kerf }), [])
  const setMode = useCallback((mode: 'cost' | 'waste') => dispatch({ type: 'SET_MODE', mode }), [])
  const setUnit = useCallback((unit: 'mm' | 'in') => dispatch({ type: 'SET_UNIT', unit }), [])
  const setProjectName = useCallback((name: string) => dispatch({ type: 'SET_PROJECT_NAME', name }), [])
  const setProjectId = useCallback((id: string | null) => dispatch({ type: 'SET_PROJECT_ID', id }), [])
  const setProjects = useCallback((projects: Project[]) => dispatch({ type: 'SET_PROJECTS', projects }), [])
  const setShowSaveDialog = useCallback((show: boolean) => dispatch({ type: 'SET_SHOW_SAVE_DIALOG', show }), [])
  const setShowLoadDialog = useCallback((show: boolean) => dispatch({ type: 'SET_SHOW_LOAD_DIALOG', show }), [])
  const setTimbers = useCallback((timbers: TimberStock[]) => dispatch({ type: 'SET_TIMBERS', timbers }), [])
  const setCuts = useCallback((cuts: RequiredCut[]) => dispatch({ type: 'SET_CUTS', cuts }), [])
  const setOwnedTimbers = useCallback((ownedTimbers: OwnedTimber[]) => dispatch({ type: 'SET_OWNED_TIMBERS', ownedTimbers }), [])
  const resetToNewProject = useCallback(() => dispatch({ type: 'RESET_TO_NEW_PROJECT' }), [])

  const calculate = useCallback(() => {
    try {
      const result = optimizeTimberCutting(state.timbers, state.cuts, state.kerf, state.mode, state.ownedTimbers)
      dispatch({ type: 'SET_SOLUTION', solution: result })
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error calculating solution')
    }
    // note: state deps intentionally left out; we only rely on latest values when called
  }, [state.timbers, state.cuts, state.kerf, state.mode, state.ownedTimbers])

  const handleSaveProject = useCallback(() => {
    if (!state.projectName.trim()) {
      alert('Please enter a project name')
      return
    }

    const project = saveProject({
      id: state.currentProjectId || undefined,
      name: state.projectName,
      timbers: state.timbers,
      cuts: state.cuts,
      ownedTimbers: state.ownedTimbers,
      kerf: state.kerf,
      mode: state.mode,
      unit: state.unit,
    })

    setProjectId(project.id)
    setProjects(getAllProjects())
    setShowSaveDialog(false)
    alert('Project saved successfully!')
  }, [state.projectName, state.currentProjectId, state.timbers, state.cuts, state.ownedTimbers, state.kerf, state.mode, state.unit, setProjectId, setProjects, setShowSaveDialog])

  const setTimberValuesForLoad = useCallback((project: Project) => {
    setTimbers(project.timbers)
    setCuts(project.cuts)
    setOwnedTimbers(project.ownedTimbers)
    setKerf(project.kerf)
    setMode(project.mode)
    setUnit(project.unit)
    setProjectId(project.id)
    setProjectName(project.name)
  }, [setTimbers, setCuts, setOwnedTimbers, setKerf, setMode, setUnit, setProjectId, setProjectName])

  const handleLoadProject = useCallback((project: Project) => {
    // NOTE: dispatching multiple times intentionally for clarity; can be batched if needed
    setTimberValuesForLoad(project)
    setShowLoadDialog(false)
    setSolution(null)
  }, [setTimberValuesForLoad, setShowLoadDialog, setSolution])

  const handleDeleteProject = useCallback((id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id)
      setProjects(getAllProjects())
      if (state.currentProjectId === id) {
        setProjectId(null)
        setProjectName('')
      }
    }
  }, [state.currentProjectId, setProjectId, setProjectName, setProjects])

  const handleNewProject = useCallback(() => {
    resetToNewProject()
  }, [resetToNewProject])

  const store = useMemo(() => ({
    ...state,
    // set* functions for UI needs
    setProjectName,
    setTimbers,
    setCuts,
    setOwnedTimbers,
    setShowSaveDialog,
    setShowLoadDialog,
    setUnit,
    setKerf,
    setMode,
    // actions
    addTimber,
    removeTimber,
    updateTimber,
    addCut,
    removeCut,
    updateCut,
    addOwnedTimber,
    removeOwnedTimber,
    updateOwnedTimber,
    calculate,
    handleSaveProject,
    handleLoadProject,
    handleDeleteProject,
    handleNewProject,
  }), [
    state,
    setProjectName,
    setTimbers,
    setCuts,
    setOwnedTimbers,
    setShowSaveDialog,
    setShowLoadDialog,
    setUnit,
    setKerf,
    setMode,
    addTimber,
    removeTimber,
    updateTimber,
    addCut,
    removeCut,
    updateCut,
    addOwnedTimber,
    removeOwnedTimber,
    updateOwnedTimber,
    calculate,
    handleSaveProject,
    handleLoadProject,
    handleDeleteProject,
    handleNewProject,
  ])

  return store
}

export type TimberStore = ReturnType<typeof useTimberState>
