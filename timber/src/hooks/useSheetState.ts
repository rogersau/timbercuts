import { useReducer, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  type SheetStock,
  type RequiredPanel,
  type SheetSolution,
  type OwnedSheet,
  type GrainDirection,
} from '@/lib/sheet-optimizer'
import { getAllSheetProjects, saveSheetProject, deleteSheetProject, saveSheetDraft, getSheetDraft, type SheetProject } from '@/lib/storage'
import SheetOptimizerWorker from '@/workers/sheet-optimizer.worker?worker'
import { sheetReducer, defaultSheets, defaultPanels } from '@/reducers/sheetReducer'

export function useSheetState() {
  const [state, dispatch] = useReducer(sheetReducer, {
    sheets: defaultSheets,
    panels: defaultPanels,
    ownedSheets: [],
    solution: null,
    kerf: 3,
    mode: 'cost',
    unit: 'mm',
    grainEnabled: false,
    currentProjectId: null,
    projectName: '',
    projects: getAllSheetProjects(),
    showSaveDialog: false,
    showLoadDialog: false,
    showErrorDialog: false,
    errorMessage: null,
    isCalculating: false,
  })

  const workerRef = useRef<Worker | null>(null)

  // Load draft on mount
  useEffect(() => {
    const draft = getSheetDraft()
    if (draft && !state.currentProjectId) {
      if (draft.sheets) dispatch({ type: 'SET_SHEETS', sheets: draft.sheets })
      if (draft.panels) dispatch({ type: 'SET_PANELS', panels: draft.panels })
      if (draft.ownedSheets) dispatch({ type: 'SET_OWNED_SHEETS', ownedSheets: draft.ownedSheets })
      if (draft.kerf) dispatch({ type: 'SET_KERF', kerf: draft.kerf })
      if (draft.mode) dispatch({ type: 'SET_MODE', mode: draft.mode })
      if (draft.unit) dispatch({ type: 'SET_UNIT', unit: draft.unit })
      if (draft.grainEnabled !== undefined) dispatch({ type: 'SET_GRAIN_ENABLED', grainEnabled: draft.grainEnabled })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save draft on change
  useEffect(() => {
    if (!state.currentProjectId) {
      saveSheetDraft({
        sheets: state.sheets,
        panels: state.panels,
        ownedSheets: state.ownedSheets,
        kerf: state.kerf,
        mode: state.mode,
        unit: state.unit,
        grainEnabled: state.grainEnabled,
      })
    }
  }, [state.sheets, state.panels, state.ownedSheets, state.kerf, state.mode, state.unit, state.grainEnabled, state.currentProjectId])

  useEffect(() => {
    workerRef.current = new SheetOptimizerWorker()
    workerRef.current.onmessage = (e) => {
      const { type, solution, error } = e.data
      if (type === 'SUCCESS') {
        dispatch({ type: 'SET_SOLUTION', solution })
      } else if (type === 'ERROR') {
        dispatch({ type: 'SET_ERROR_MESSAGE', error: error ?? 'Unknown error from worker' })
        dispatch({ type: 'SET_SHOW_ERROR_DIALOG', show: true })
      }
      dispatch({ type: 'SET_IS_CALCULATING', isCalculating: false })
    }

    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  // Action helpers
  const addSheet = useCallback(() => dispatch({ type: 'ADD_SHEET' }), [])
  const removeSheet = useCallback(
    (index: number) => dispatch({ type: 'REMOVE_SHEET', index }),
    []
  )
  const updateSheet = useCallback(
    (index: number, field: keyof SheetStock, value: number | GrainDirection) =>
      dispatch({ type: 'UPDATE_SHEET', index, field, value }),
    []
  )

  const addPanel = useCallback(() => dispatch({ type: 'ADD_PANEL' }), [])
  const removePanel = useCallback((index: number) => dispatch({ type: 'REMOVE_PANEL', index }), [])
  const updatePanel = useCallback(
    (index: number, field: keyof RequiredPanel, value: number | string | boolean | GrainDirection) =>
      dispatch({ type: 'UPDATE_PANEL', index, field, value }),
    []
  )

  const addOwnedSheet = useCallback(() => dispatch({ type: 'ADD_OWNED' }), [])
  const removeOwnedSheet = useCallback(
    (index: number) => dispatch({ type: 'REMOVE_OWNED', index }),
    []
  )
  const updateOwnedSheet = useCallback(
    (index: number, field: keyof OwnedSheet, value: number | GrainDirection) =>
      dispatch({ type: 'UPDATE_OWNED', index, field, value }),
    []
  )

  const setSolution = useCallback(
    (solution: SheetSolution | null) => dispatch({ type: 'SET_SOLUTION', solution }),
    []
  )
  const setKerf = useCallback((kerf: number) => dispatch({ type: 'SET_KERF', kerf }), [])
  const setMode = useCallback((mode: 'cost' | 'waste') => dispatch({ type: 'SET_MODE', mode }), [])
  const setUnit = useCallback((unit: 'mm' | 'in') => dispatch({ type: 'SET_UNIT', unit }), [])
  const setGrainEnabled = useCallback((grainEnabled: boolean) => dispatch({ type: 'SET_GRAIN_ENABLED', grainEnabled }), [])
  const setProjectName = useCallback(
    (name: string) => dispatch({ type: 'SET_PROJECT_NAME', name }),
    []
  )
  const setProjectId = useCallback(
    (id: string | null) => dispatch({ type: 'SET_PROJECT_ID', id }),
    []
  )
  const setProjects = useCallback(
    (projects: SheetProject[]) => dispatch({ type: 'SET_PROJECTS', projects }),
    []
  )
  const setShowSaveDialog = useCallback(
    (show: boolean) => dispatch({ type: 'SET_SHOW_SAVE_DIALOG', show }),
    []
  )
  const setShowLoadDialog = useCallback(
    (show: boolean) => dispatch({ type: 'SET_SHOW_LOAD_DIALOG', show }),
    []
  )
  const setShowErrorDialog = useCallback((show: boolean) => dispatch({ type: 'SET_SHOW_ERROR_DIALOG', show }), [])
  const setErrorMessage = useCallback((error: string | null) => dispatch({ type: 'SET_ERROR_MESSAGE', error }), [])
  const setSheets = useCallback(
    (sheets: SheetStock[]) => dispatch({ type: 'SET_SHEETS', sheets }),
    []
  )
  const setPanels = useCallback((panels: RequiredPanel[]) => dispatch({ type: 'SET_PANELS', panels }), [])
  const setOwnedSheets = useCallback(
    (ownedSheets: OwnedSheet[]) => dispatch({ type: 'SET_OWNED_SHEETS', ownedSheets }),
    []
  )
  const resetToNewProject = useCallback(() => dispatch({ type: 'RESET_TO_NEW_PROJECT' }), [])

  const calculate = useCallback(() => {
    dispatch({ type: 'SET_IS_CALCULATING', isCalculating: true })
    workerRef.current?.postMessage({
      availableSheets: state.sheets,
      requiredPanels: state.panels,
      kerf: state.kerf,
      mode: state.mode,
      ownedSheets: state.ownedSheets,
      grainEnabled: state.grainEnabled,
    })
  }, [state.sheets, state.panels, state.kerf, state.mode, state.ownedSheets, state.grainEnabled])

  const handleSaveProject = useCallback(() => {
    if (!state.projectName.trim()) {
      alert('Please enter a project name')
      return
    }

    const project = saveSheetProject({
      id: state.currentProjectId || undefined,
      name: state.projectName,
      sheets: state.sheets,
      panels: state.panels,
      ownedSheets: state.ownedSheets,
      kerf: state.kerf,
      mode: state.mode,
      unit: state.unit,
      grainEnabled: state.grainEnabled,
    })

    setProjectId(project.id)
    setProjects(getAllSheetProjects())
    setShowSaveDialog(false)
    alert('Project saved successfully!')
  }, [
    state.projectName,
    state.currentProjectId,
    state.sheets,
    state.panels,
    state.ownedSheets,
    state.kerf,
    state.mode,
    state.unit,
    state.grainEnabled,
    setProjectId,
    setProjects,
    setShowSaveDialog,
  ])

  const setSheetValuesForLoad = useCallback(
    (project: SheetProject) => {
      setSheets(project.sheets)
      setPanels(project.panels)
      setOwnedSheets(project.ownedSheets)
      setKerf(project.kerf)
      setMode(project.mode)
      setUnit(project.unit)
      setGrainEnabled(project.grainEnabled ?? false)
      setProjectId(project.id)
      setProjectName(project.name)
    },
    [setSheets, setPanels, setOwnedSheets, setKerf, setMode, setUnit, setGrainEnabled, setProjectId, setProjectName]
  )

  const handleLoadProject = useCallback(
    (project: SheetProject) => {
      setSheetValuesForLoad(project)
      setShowLoadDialog(false)
      setSolution(null)
    },
    [setSheetValuesForLoad, setShowLoadDialog, setSolution]
  )

  const handleDeleteProject = useCallback(
    (id: string) => {
      if (confirm('Are you sure you want to delete this project?')) {
        deleteSheetProject(id)
        setProjects(getAllSheetProjects())
        if (state.currentProjectId === id) {
          setProjectId(null)
          setProjectName('')
        }
      }
    },
    [state.currentProjectId, setProjectId, setProjectName, setProjects]
  )

  const handleNewProject = useCallback(() => {
    resetToNewProject()
  }, [resetToNewProject])

  const store = useMemo(
    () => ({
      ...state,
      setProjectName,
      setSheets,
      setPanels,
      setOwnedSheets,
      setShowSaveDialog,
      setShowLoadDialog,
      setUnit,
      setKerf,
      setMode,
      setGrainEnabled,
      setShowErrorDialog,
      setErrorMessage,
      addSheet,
      removeSheet,
      updateSheet,
      addPanel,
      removePanel,
      updatePanel,
      addOwnedSheet,
      removeOwnedSheet,
      updateOwnedSheet,
      calculate,
      handleSaveProject,
      handleLoadProject,
      handleDeleteProject,
      handleNewProject,
    }),
    [
      state,
      setProjectName,
      setSheets,
      setPanels,
      setOwnedSheets,
      setShowSaveDialog,
      setShowLoadDialog,
      setUnit,
      setKerf,
      setMode,
      setGrainEnabled,
      setShowErrorDialog,
      setErrorMessage,
      addSheet,
      removeSheet,
      updateSheet,
      addPanel,
      removePanel,
      updatePanel,
      addOwnedSheet,
      removeOwnedSheet,
      updateOwnedSheet,
      calculate,
      handleSaveProject,
      handleLoadProject,
      handleDeleteProject,
      handleNewProject,
    ]
  )

  return store
}

export type SheetStore = ReturnType<typeof useSheetState>
