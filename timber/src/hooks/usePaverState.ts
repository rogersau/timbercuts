import { useReducer, useMemo, useCallback, useEffect } from 'react'
import {
  type RectangularArea,
  type PaverType,
  type LayingPattern,
  type PaverCalculatorResult,
  calculatePaversNeeded,
  COMMON_PAVER_TYPES,
} from '@/lib/paver-calculator'
import {
  getAllPaverProjects,
  savePaverProject,
  deletePaverProject,
  savePaverDraft,
  getPaverDraft,
  decodeShareData,
  type PaverProject,
  type ShareablePaverData,
} from '@/lib/storage'
import { paverReducer, defaultAreas, defaultPaver } from '@/reducers/paverReducer'

export function usePaverState(searchString: string = '') {
  const [state, dispatch] = useReducer(paverReducer, {
    areas: defaultAreas,
    paver: defaultPaver,
    pattern: 'stack' as LayingPattern,
    gap: 3,
    customWastePercentage: null,
    result: null,
    unit: 'mm',
    currentProjectId: null,
    projectName: '',
    projects: getAllPaverProjects(),
    showSaveDialog: false,
    showLoadDialog: false,
    showErrorDialog: false,
    errorMessage: null,
    isCalculating: false,
  })

  // Load from share URL or draft on mount
  useEffect(() => {
    // Parse share param from search string (e.g., "?share=...")
    const params = new URLSearchParams(searchString)
    const shareParam = params.get('share')

    if (shareParam) {
      const shareData = decodeShareData(shareParam)
      if (shareData && shareData.t === 'paver') {
        const data = shareData as ShareablePaverData
        dispatch({ type: 'SET_AREAS', areas: data.a })
        dispatch({ type: 'SET_PAVER', paver: data.pv })
        dispatch({ type: 'SET_PATTERN', pattern: data.pt })
        dispatch({ type: 'SET_GAP', gap: data.gp })
        dispatch({ type: 'SET_CUSTOM_WASTE_PERCENTAGE', percentage: data.cw })
        dispatch({ type: 'SET_UNIT', unit: data.u })
        dispatch({ type: 'SET_PROJECT_NAME', name: data.n + ' (Shared)' })
        // Clear share param from URL
        const newHash = window.location.hash
          .replace(/\?share=[^&]+/, '')
          .replace(/&share=[^&]+/, '')
        window.history.replaceState({}, '', window.location.pathname + newHash)
        return
      }
    }

    const draft = getPaverDraft()
    if (draft && !state.currentProjectId) {
      if (draft.areas) dispatch({ type: 'SET_AREAS', areas: draft.areas })
      if (draft.paver) dispatch({ type: 'SET_PAVER', paver: draft.paver })
      if (draft.pattern) dispatch({ type: 'SET_PATTERN', pattern: draft.pattern })
      if (draft.gap !== undefined) dispatch({ type: 'SET_GAP', gap: draft.gap })
      if (draft.customWastePercentage !== undefined)
        dispatch({
          type: 'SET_CUSTOM_WASTE_PERCENTAGE',
          percentage: draft.customWastePercentage,
        })
      if (draft.unit) dispatch({ type: 'SET_UNIT', unit: draft.unit })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save draft on change
  useEffect(() => {
    if (!state.currentProjectId) {
      savePaverDraft({
        areas: state.areas,
        paver: state.paver,
        pattern: state.pattern,
        gap: state.gap,
        customWastePercentage: state.customWastePercentage,
        unit: state.unit,
      })
    }
  }, [
    state.areas,
    state.paver,
    state.pattern,
    state.gap,
    state.customWastePercentage,
    state.unit,
    state.currentProjectId,
  ])

  // Action helpers
  const addArea = useCallback(() => dispatch({ type: 'ADD_AREA' }), [])
  const removeArea = useCallback(
    (index: number) => dispatch({ type: 'REMOVE_AREA', index }),
    []
  )
  const updateArea = useCallback(
    (index: number, field: keyof RectangularArea, value: number | string) =>
      dispatch({ type: 'UPDATE_AREA', index, field, value }),
    []
  )

  const setPaver = useCallback(
    (paver: PaverType) => dispatch({ type: 'SET_PAVER', paver }),
    []
  )
  const updatePaver = useCallback(
    (field: keyof PaverType, value: number | string) =>
      dispatch({ type: 'UPDATE_PAVER', field, value }),
    []
  )
  const selectPaverPreset = useCallback((name: string) => {
    const preset = COMMON_PAVER_TYPES.find((p) => p.name === name)
    if (preset) {
      dispatch({ type: 'SET_PAVER', paver: preset })
    }
  }, [])

  const setPattern = useCallback(
    (pattern: LayingPattern) => dispatch({ type: 'SET_PATTERN', pattern }),
    []
  )
  const setGap = useCallback(
    (gap: number) => dispatch({ type: 'SET_GAP', gap }),
    []
  )
  const setCustomWastePercentage = useCallback(
    (percentage: number | null) =>
      dispatch({ type: 'SET_CUSTOM_WASTE_PERCENTAGE', percentage }),
    []
  )

  const setResult = useCallback(
    (result: PaverCalculatorResult | null) =>
      dispatch({ type: 'SET_RESULT', result }),
    []
  )
  const setUnit = useCallback(
    (unit: 'mm' | 'in') => dispatch({ type: 'SET_UNIT', unit }),
    []
  )
  const setProjectName = useCallback(
    (name: string) => dispatch({ type: 'SET_PROJECT_NAME', name }),
    []
  )
  const setProjectId = useCallback(
    (id: string | null) => dispatch({ type: 'SET_PROJECT_ID', id }),
    []
  )
  const setProjects = useCallback(
    (projects: PaverProject[]) => dispatch({ type: 'SET_PROJECTS', projects }),
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
  const setShowErrorDialog = useCallback(
    (show: boolean) => dispatch({ type: 'SET_SHOW_ERROR_DIALOG', show }),
    []
  )
  const setErrorMessage = useCallback(
    (error: string | null) => dispatch({ type: 'SET_ERROR_MESSAGE', error }),
    []
  )
  const setAreas = useCallback(
    (areas: RectangularArea[]) => dispatch({ type: 'SET_AREAS', areas }),
    []
  )
  const resetToNewProject = useCallback(
    () => dispatch({ type: 'RESET_TO_NEW_PROJECT' }),
    []
  )

  const calculate = useCallback(() => {
    dispatch({ type: 'SET_IS_CALCULATING', isCalculating: true })
    try {
      const result = calculatePaversNeeded(
        state.areas,
        state.paver,
        state.pattern,
        state.gap,
        state.customWastePercentage ?? undefined
      )
      dispatch({ type: 'SET_RESULT', result })
    } catch (error) {
      dispatch({
        type: 'SET_ERROR_MESSAGE',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      dispatch({ type: 'SET_SHOW_ERROR_DIALOG', show: true })
    }
    dispatch({ type: 'SET_IS_CALCULATING', isCalculating: false })
  }, [state.areas, state.paver, state.pattern, state.gap, state.customWastePercentage])

  const handleSaveProject = useCallback(() => {
    if (!state.projectName.trim()) {
      alert('Please enter a project name')
      return
    }

    const project = savePaverProject({
      id: state.currentProjectId || undefined,
      name: state.projectName,
      areas: state.areas,
      paver: state.paver,
      pattern: state.pattern,
      gap: state.gap,
      customWastePercentage: state.customWastePercentage,
      unit: state.unit,
    })

    setProjectId(project.id)
    setProjects(getAllPaverProjects())
    setShowSaveDialog(false)
    alert('Project saved successfully!')
  }, [
    state.projectName,
    state.currentProjectId,
    state.areas,
    state.paver,
    state.pattern,
    state.gap,
    state.customWastePercentage,
    state.unit,
    setProjectId,
    setProjects,
    setShowSaveDialog,
  ])

  const setPaverValuesForLoad = useCallback(
    (project: PaverProject) => {
      setAreas(project.areas)
      setPaver(project.paver)
      setPattern(project.pattern)
      setGap(project.gap)
      setCustomWastePercentage(project.customWastePercentage)
      setUnit(project.unit)
      setProjectId(project.id)
      setProjectName(project.name)
    },
    [
      setAreas,
      setPaver,
      setPattern,
      setGap,
      setCustomWastePercentage,
      setUnit,
      setProjectId,
      setProjectName,
    ]
  )

  const handleLoadProject = useCallback(
    (project: PaverProject) => {
      setPaverValuesForLoad(project)
      setShowLoadDialog(false)
      setResult(null)
    },
    [setPaverValuesForLoad, setShowLoadDialog, setResult]
  )

  const handleDeleteProject = useCallback(
    (id: string) => {
      if (confirm('Are you sure you want to delete this project?')) {
        deletePaverProject(id)
        setProjects(getAllPaverProjects())
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
      setAreas,
      setPaver,
      setShowSaveDialog,
      setShowLoadDialog,
      setUnit,
      setGap,
      setPattern,
      setCustomWastePercentage,
      setShowErrorDialog,
      setErrorMessage,
      addArea,
      removeArea,
      updateArea,
      updatePaver,
      selectPaverPreset,
      calculate,
      handleSaveProject,
      handleLoadProject,
      handleDeleteProject,
      handleNewProject,
    }),
    [
      state,
      setProjectName,
      setAreas,
      setPaver,
      setShowSaveDialog,
      setShowLoadDialog,
      setUnit,
      setGap,
      setPattern,
      setCustomWastePercentage,
      setShowErrorDialog,
      setErrorMessage,
      addArea,
      removeArea,
      updateArea,
      updatePaver,
      selectPaverPreset,
      calculate,
      handleSaveProject,
      handleLoadProject,
      handleDeleteProject,
      handleNewProject,
    ]
  )

  return store
}

export type PaverStore = ReturnType<typeof usePaverState>
