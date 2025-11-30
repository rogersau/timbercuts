import type { TimberStock, RequiredCut, OwnedTimber } from './timber-optimizer'
import type { SheetStock, RequiredPanel, OwnedSheet } from './sheet-optimizer'

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

export interface SheetProject {
  id: string
  name: string
  sheets: SheetStock[]
  panels: RequiredPanel[]
  ownedSheets: OwnedSheet[]
  kerf: number
  mode: 'cost' | 'waste'
  unit: 'mm' | 'in'
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = 'timber-cut-projects'
const DRAFT_KEY = 'timber-cut-draft'
const SHEET_STORAGE_KEY = 'sheet-cut-projects'
const SHEET_DRAFT_KEY = 'sheet-cut-draft'

/**
 * Retrieves all projects from local storage.
 * @returns An array of Project objects.
 */
export function getAllProjects(): Project[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error loading projects:', error)
    return []
  }
}

/**
 * Retrieves a specific project by its ID.
 * @param id - The unique identifier of the project.
 * @returns The Project object if found, otherwise null.
 */
export function getProject(id: string): Project | null {
  const projects = getAllProjects()
  return projects.find((p) => p.id === id) || null
}

/**
 * Saves a project to local storage.
 * If the project has an ID, it updates the existing project.
 * If no ID is provided, it creates a new project with a generated ID.
 * @param project - The project data to save.
 * @returns The saved Project object.
 */
export function saveProject(
  project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Project {
  const projects = getAllProjects()
  const now = Date.now()

  if (project.id) {
    // Update existing project
    const index = projects.findIndex((p) => p.id === project.id)
    if (index !== -1) {
      projects[index] = {
        ...project,
        id: project.id,
        createdAt: projects[index].createdAt,
        updatedAt: now,
      } as Project
    } else {
      // ID provided but not found, create new
      const newProject: Project = {
        ...project,
        id: project.id,
        createdAt: now,
        updatedAt: now,
      } as Project
      projects.push(newProject)
    }
  } else {
    // Create new project
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as Project
    projects.push(newProject)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  return projects.find((p) => p.id === project.id) || projects[projects.length - 1]
}

/**
 * Deletes a project from local storage by its ID.
 * @param id - The unique identifier of the project to delete.
 * @returns True if the project was deleted, false if not found.
 */
export function deleteProject(id: string): boolean {
  const projects = getAllProjects()
  const filtered = projects.filter((p) => p.id !== id)

  if (filtered.length === projects.length) {
    return false // Project not found
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

/**
 * Exports all projects as a JSON string.
 * @returns A JSON string representation of all projects.
 */
export function exportProjects(): string {
  return JSON.stringify(getAllProjects(), null, 2)
}

/**
 * Imports projects from a JSON string, overwriting existing data.
 * @param jsonData - The JSON string containing project data.
 * @returns True if import was successful, false otherwise.
 */
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

export function saveDraft(data: Partial<Project>) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving draft:', error)
  }
}

export function getDraft(): Partial<Project> | null {
  try {
    const data = localStorage.getItem(DRAFT_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error loading draft:', error)
    return null
  }
}

// ============ Sheet Project Functions ============

export function getAllSheetProjects(): SheetProject[] {
  try {
    const data = localStorage.getItem(SHEET_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error loading sheet projects:', error)
    return []
  }
}

export function getSheetProject(id: string): SheetProject | null {
  const projects = getAllSheetProjects()
  return projects.find((p) => p.id === id) || null
}

export function saveSheetProject(
  project: Omit<SheetProject, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): SheetProject {
  const projects = getAllSheetProjects()
  const now = Date.now()

  if (project.id) {
    const index = projects.findIndex((p) => p.id === project.id)
    if (index !== -1) {
      projects[index] = {
        ...project,
        id: project.id,
        createdAt: projects[index].createdAt,
        updatedAt: now,
      } as SheetProject
    } else {
      const newProject: SheetProject = {
        ...project,
        id: project.id,
        createdAt: now,
        updatedAt: now,
      } as SheetProject
      projects.push(newProject)
    }
  } else {
    const newProject: SheetProject = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as SheetProject
    projects.push(newProject)
  }

  localStorage.setItem(SHEET_STORAGE_KEY, JSON.stringify(projects))
  return projects.find((p) => p.id === project.id) || projects[projects.length - 1]
}

export function deleteSheetProject(id: string): boolean {
  const projects = getAllSheetProjects()
  const filtered = projects.filter((p) => p.id !== id)

  if (filtered.length === projects.length) {
    return false
  }

  localStorage.setItem(SHEET_STORAGE_KEY, JSON.stringify(filtered))
  return true
}

export function saveSheetDraft(data: Partial<SheetProject>) {
  try {
    localStorage.setItem(SHEET_DRAFT_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving sheet draft:', error)
  }
}

export function getSheetDraft(): Partial<SheetProject> | null {
  try {
    const data = localStorage.getItem(SHEET_DRAFT_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error loading sheet draft:', error)
    return null
  }
}
