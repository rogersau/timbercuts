import { useState } from 'react'
import { type TimberStock, type RequiredCut, type Solution, type OwnedTimber } from '@/lib/timber-optimizer'
import { getAllProjects, type Project } from '@/lib/storage'

export function useTimberState() {
  const [timbers, setTimbers] = useState<TimberStock[]>([
    { length: 1200, price: 9.40 },
    { length: 1800, price: 14.50 },
    { length: 2400, price: 19.20 },
    { length: 3000, price: 23.90 },
    { length: 3600, price: 28.70 },
  ])
  const [cuts, setCuts] = useState<RequiredCut[]>([
    { length: 600, quantity: 4 },
  ])
  const [ownedTimbers, setOwnedTimbers] = useState<OwnedTimber[]>([])
  const [solution, setSolution] = useState<Solution | null>(null)
  const [kerf, setKerf] = useState<number>(3)
  const [mode, setMode] = useState<'cost' | 'waste'>('cost')
  const [unit, setUnit] = useState<'mm' | 'in'>('mm')
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [projectName, setProjectName] = useState<string>('')
  const [projects, setProjects] = useState<Project[]>(() => getAllProjects())
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)

  return {
    timbers,
    setTimbers,
    cuts,
    setCuts,
    ownedTimbers,
    setOwnedTimbers,
    solution,
    setSolution,
    kerf,
    setKerf,
    mode,
    setMode,
    unit,
    setUnit,
    currentProjectId,
    setCurrentProjectId,
    projectName,
    setProjectName,
    projects,
    setProjects,
    showSaveDialog,
    setShowSaveDialog,
    showLoadDialog,
    setShowLoadDialog,
  }
}

export type TimberStore = ReturnType<typeof useTimberState>
