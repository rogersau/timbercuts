import { useReducer, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  type TimberStock,
  type RequiredCut,
  type Solution,
  type OwnedTimber,
} from '@/lib/timber-optimizer'
import { getAllProjects, saveProject, deleteProject, saveDraft, getDraft, type Project } from '@/lib/storage'
import OptimizerWorker from '@/workers/optimizer.worker?worker'
import { reducer, defaultTimbers, defaultCuts } from '@/reducers/timberReducer'

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
    isCalculating: false,
  })

  const workerRef = useRef<Worker | null>(null)

  // Load draft on mount
  useEffect(() => {
    const draft = getDraft()
    if (draft && !state.currentProjectId) {
      if (draft.timbers) dispatch({ type: 'SET_TIMBERS', timbers: draft.timbers })
      if (draft.cuts) dispatch({ type: 'SET_CUTS', cuts: draft.cuts })
      if (draft.ownedTimbers) dispatch({ type: 'SET_OWNED_TIMBERS', ownedTimbers: draft.ownedTimbers })
      if (draft.kerf) dispatch({ type: 'SET_KERF', kerf: draft.kerf })
      if (draft.mode) dispatch({ type: 'SET_MODE', mode: draft.mode })
      if (draft.unit) dispatch({ type: 'SET_UNIT', unit: draft.unit })
    }
  }, [])

  // Save draft on change
  useEffect(() => {
    if (!state.currentProjectId) {
      saveDraft({
        timbers: state.timbers,
        cuts: state.cuts,
        ownedTimbers: state.ownedTimbers,
        kerf: state.kerf,
        mode: state.mode,
        unit: state.unit,
      })
    }
  }, [state.timbers, state.cuts, state.ownedTimbers, state.kerf, state.mode, state.unit, state.currentProjectId])

  useEffect(() => {
    workerRef.current = new OptimizerWorker()
    workerRef.current.onmessage = (e) => {
      const { type, solution, error } = e.data
      if (type === 'SUCCESS') {
        dispatch({ type: 'SET_SOLUTION', solution })
      } else if (type === 'ERROR') {
        alert(error)
      }
      dispatch({ type: 'SET_IS_CALCULATING', isCalculating: false })
    }

    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  // Action helpers
  const addTimber = useCallback(() => dispatch({ type: 'ADD_TIMBER' }), [])
  const removeTimber = useCallback(
    (index: number) => dispatch({ type: 'REMOVE_TIMBER', index }),
    []
  )
  const updateTimber = useCallback(
    (index: number, field: keyof TimberStock, value: number) =>
      dispatch({ type: 'UPDATE_TIMBER', index, field, value }),
    []
  )

  const addCut = useCallback(() => dispatch({ type: 'ADD_CUT' }), [])
  const removeCut = useCallback((index: number) => dispatch({ type: 'REMOVE_CUT', index }), [])
  const updateCut = useCallback(
    (index: number, field: keyof RequiredCut, value: number) =>
      dispatch({ type: 'UPDATE_CUT', index, field, value }),
    []
  )

  const addOwnedTimber = useCallback(() => dispatch({ type: 'ADD_OWNED' }), [])
  const removeOwnedTimber = useCallback(
    (index: number) => dispatch({ type: 'REMOVE_OWNED', index }),
    []
  )
  const updateOwnedTimber = useCallback(
    (index: number, field: keyof OwnedTimber, value: number) =>
      dispatch({ type: 'UPDATE_OWNED', index, field, value }),
    []
  )

  const setSolution = useCallback(
    (solution: Solution | null) => dispatch({ type: 'SET_SOLUTION', solution }),
    []
  )
  const setKerf = useCallback((kerf: number) => dispatch({ type: 'SET_KERF', kerf }), [])
  const setMode = useCallback((mode: 'cost' | 'waste') => dispatch({ type: 'SET_MODE', mode }), [])
  const setUnit = useCallback((unit: 'mm' | 'in') => dispatch({ type: 'SET_UNIT', unit }), [])
  const setProjectName = useCallback(
    (name: string) => dispatch({ type: 'SET_PROJECT_NAME', name }),
    []
  )
  const setProjectId = useCallback(
    (id: string | null) => dispatch({ type: 'SET_PROJECT_ID', id }),
    []
  )
  const setProjects = useCallback(
    (projects: Project[]) => dispatch({ type: 'SET_PROJECTS', projects }),
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
  const setTimbers = useCallback(
    (timbers: TimberStock[]) => dispatch({ type: 'SET_TIMBERS', timbers }),
    []
  )
  const setCuts = useCallback((cuts: RequiredCut[]) => dispatch({ type: 'SET_CUTS', cuts }), [])
  const setOwnedTimbers = useCallback(
    (ownedTimbers: OwnedTimber[]) => dispatch({ type: 'SET_OWNED_TIMBERS', ownedTimbers }),
    []
  )
  const resetToNewProject = useCallback(() => dispatch({ type: 'RESET_TO_NEW_PROJECT' }), [])

  const calculate = useCallback(() => {
    dispatch({ type: 'SET_IS_CALCULATING', isCalculating: true })
    workerRef.current?.postMessage({
      availableTimbers: state.timbers,
      requiredCuts: state.cuts,
      kerf: state.kerf,
      mode: state.mode,
      ownedTimbers: state.ownedTimbers,
    })
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
  }, [
    state.projectName,
    state.currentProjectId,
    state.timbers,
    state.cuts,
    state.ownedTimbers,
    state.kerf,
    state.mode,
    state.unit,
    setProjectId,
    setProjects,
    setShowSaveDialog,
  ])

  const setTimberValuesForLoad = useCallback(
    (project: Project) => {
      setTimbers(project.timbers)
      setCuts(project.cuts)
      setOwnedTimbers(project.ownedTimbers)
      setKerf(project.kerf)
      setMode(project.mode)
      setUnit(project.unit)
      setProjectId(project.id)
      setProjectName(project.name)
    },
    [setTimbers, setCuts, setOwnedTimbers, setKerf, setMode, setUnit, setProjectId, setProjectName]
  )

  const handleLoadProject = useCallback(
    (project: Project) => {
      // NOTE: dispatching multiple times intentionally for clarity; can be batched if needed
      setTimberValuesForLoad(project)
      setShowLoadDialog(false)
      setSolution(null)
    },
    [setTimberValuesForLoad, setShowLoadDialog, setSolution]
  )

  const handleDeleteProject = useCallback(
    (id: string) => {
      if (confirm('Are you sure you want to delete this project?')) {
        deleteProject(id)
        setProjects(getAllProjects())
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
    }),
    [
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
    ]
  )

  return store
}

export type TimberStore = ReturnType<typeof useTimberState>
