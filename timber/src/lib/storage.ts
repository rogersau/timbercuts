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
