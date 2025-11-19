import { type TimberStock, type RequiredCut, type OwnedTimber, optimizeTimberCutting } from '@/lib/timber-optimizer'
import { saveProject, getAllProjects, deleteProject, type Project } from '@/lib/storage'
import type { TimberStore } from '@/hooks/useTimberState'

export function createTimberHandlers(store: TimberStore) {
  const {
    timbers,
    setTimbers,
    cuts,
    setCuts,
    ownedTimbers,
    setOwnedTimbers,
    setSolution,
    kerf,
    mode,
    currentProjectId,
    setCurrentProjectId,
    projectName,
    setProjectName,
    setProjects,
    setShowSaveDialog,
    setShowLoadDialog,
    unit,
    setUnit,
    setKerf,
    setMode,
  } = store
  const addTimber = () => {
    setTimbers([...timbers, { length: 0, price: 0 }])
  }

  const removeTimber = (index: number) => {
    setTimbers(timbers.filter((_, i) => i !== index))
  }

  const updateTimber = (index: number, field: keyof TimberStock, value: number) => {
    const updated = [...timbers]
    updated[index][field] = value
    setTimbers(updated)
  }

  const addCut = () => {
    setCuts([...cuts, { length: 0, quantity: 1 }])
  }

  const removeCut = (index: number) => {
    setCuts(cuts.filter((_, i) => i !== index))
  }

  const updateCut = (index: number, field: keyof RequiredCut, value: number) => {
    const updated = [...cuts]
    updated[index][field] = value
    setCuts(updated)
  }

  const addOwnedTimber = () => {
    setOwnedTimbers([...ownedTimbers, { length: 0, quantity: 1 }])
  }

  const removeOwnedTimber = (index: number) => {
    setOwnedTimbers(ownedTimbers.filter((_, i) => i !== index))
  }

  const updateOwnedTimber = (index: number, field: keyof OwnedTimber, value: number) => {
    const updated = [...ownedTimbers]
    updated[index][field] = value
    setOwnedTimbers(updated)
  }

  const calculate = () => {
    try {
      const result = optimizeTimberCutting(timbers, cuts, kerf, mode, ownedTimbers)
      setSolution(result)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error calculating solution')
    }
  }

  const handleSaveProject = () => {
    if (!projectName.trim()) {
      alert('Please enter a project name')
      return
    }
    
    const project = saveProject({
      id: currentProjectId || undefined,
      name: projectName,
      timbers,
      cuts,
      ownedTimbers,
      kerf,
      mode,
      unit
    })
    
    setCurrentProjectId(project.id)
    setProjects(getAllProjects())
    setShowSaveDialog(false)
    alert('Project saved successfully!')
  }

  const handleLoadProject = (project: Project) => {
    setTimbers(project.timbers)
    setCuts(project.cuts)
    setOwnedTimbers(project.ownedTimbers)
    setKerf(project.kerf)
    setMode(project.mode)
    setUnit(project.unit)
    setCurrentProjectId(project.id)
    setProjectName(project.name)
    setShowLoadDialog(false)
    setSolution(null)
  }

  const handleDeleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id)
      setProjects(getAllProjects())
      if (currentProjectId === id) {
        setCurrentProjectId(null)
        setProjectName('')
      }
    }
  }

  const handleNewProject = () => {
    setCurrentProjectId(null)
    setProjectName('')
    setTimbers([{ length: 1200, price: 9.40 }])
    setCuts([{ length: 600, quantity: 4 }])
    setOwnedTimbers([])
    setKerf(3)
    setMode('cost')
    setSolution(null)
  }

  return {
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
  }
}
