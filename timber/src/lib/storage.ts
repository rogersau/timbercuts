import type { TimberStock, RequiredCut, OwnedTimber } from './timber-optimizer'

export interface Project {
  id: string
  name: string
  timbers: TimberStock[]
  cuts: RequiredCut[]
  ownedTimbers: OwnedTimber[]
  kerf: number
  mode: 'cost' | 'waste'
  unit: 'mm' | 'in'
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = 'timber-cut-projects'

export function getAllProjects(): Project[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error loading projects:', error)
    return []
  }
}

export function getProject(id: string): Project | null {
  const projects = getAllProjects()
  return projects.find(p => p.id === id) || null
}

export function saveProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Project {
  const projects = getAllProjects()
  const now = Date.now()
  
  if (project.id) {
    // Update existing project
    const index = projects.findIndex(p => p.id === project.id)
    if (index !== -1) {
      projects[index] = {
        ...project,
        id: project.id,
        createdAt: projects[index].createdAt,
        updatedAt: now
      } as Project
    } else {
      // ID provided but not found, create new
      const newProject: Project = {
        ...project,
        id: project.id,
        createdAt: now,
        updatedAt: now
      } as Project
      projects.push(newProject)
    }
  } else {
    // Create new project
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    } as Project
    projects.push(newProject)
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  return projects.find(p => p.id === project.id) || projects[projects.length - 1]
}

export function deleteProject(id: string): boolean {
  const projects = getAllProjects()
  const filtered = projects.filter(p => p.id !== id)
  
  if (filtered.length === projects.length) {
    return false // Project not found
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

export function exportProjects(): string {
  return JSON.stringify(getAllProjects(), null, 2)
}

export function importProjects(jsonData: string): boolean {
  try {
    const projects = JSON.parse(jsonData) as Project[]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    return true
  } catch (error) {
    console.error('Error importing projects:', error)
    return false
  }
}
