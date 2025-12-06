import type { TimberStock, RequiredCut, OwnedTimber } from './timber-optimizer'
import type { SheetStock, RequiredPanel, OwnedSheet } from './sheet-optimizer'
import type { RectangularArea, PaverType, LayingPattern } from './paver-calculator'

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
  grainEnabled?: boolean
  createdAt: number
  updatedAt: number
}

export interface PaverProject {
  id: string
  name: string
  areas: RectangularArea[]
  paver: PaverType
  pattern: LayingPattern
  gap: number
  customWastePercentage: number | null
  unit: 'mm' | 'in'
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = 'timber-cut-projects'
const DRAFT_KEY = 'timber-cut-draft'
const SHEET_STORAGE_KEY = 'sheet-cut-projects'
const SHEET_DRAFT_KEY = 'sheet-cut-draft'
const PAVER_STORAGE_KEY = 'paver-projects'
const PAVER_DRAFT_KEY = 'paver-draft'

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

// ============ Paver Project Functions ============

export function getAllPaverProjects(): PaverProject[] {
  try {
    const data = localStorage.getItem(PAVER_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error loading paver projects:', error)
    return []
  }
}

export function getPaverProject(id: string): PaverProject | null {
  const projects = getAllPaverProjects()
  return projects.find((p) => p.id === id) || null
}

export function savePaverProject(
  project: Omit<PaverProject, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): PaverProject {
  const projects = getAllPaverProjects()
  const now = Date.now()

  if (project.id) {
    const index = projects.findIndex((p) => p.id === project.id)
    if (index !== -1) {
      projects[index] = {
        ...project,
        id: project.id,
        createdAt: projects[index].createdAt,
        updatedAt: now,
      } as PaverProject
    } else {
      const newProject: PaverProject = {
        ...project,
        id: project.id,
        createdAt: now,
        updatedAt: now,
      } as PaverProject
      projects.push(newProject)
    }
  } else {
    const newProject: PaverProject = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as PaverProject
    projects.push(newProject)
  }

  localStorage.setItem(PAVER_STORAGE_KEY, JSON.stringify(projects))
  return projects.find((p) => p.id === project.id) || projects[projects.length - 1]
}

export function deletePaverProject(id: string): boolean {
  const projects = getAllPaverProjects()
  const filtered = projects.filter((p) => p.id !== id)

  if (filtered.length === projects.length) {
    return false
  }

  localStorage.setItem(PAVER_STORAGE_KEY, JSON.stringify(filtered))
  return true
}

export function savePaverDraft(data: Partial<PaverProject>) {
  try {
    localStorage.setItem(PAVER_DRAFT_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving paver draft:', error)
  }
}

export function getPaverDraft(): Partial<PaverProject> | null {
  try {
    const data = localStorage.getItem(PAVER_DRAFT_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error loading paver draft:', error)
    return null
  }
}

// ============ URL Share Functions ============

export type ShareableTimberData = {
  t: 'linear'
  n: string // name
  ti: TimberStock[] // timbers
  c: RequiredCut[] // cuts
  o: OwnedTimber[] // owned
  k: number // kerf
  m: 'cost' | 'waste' // mode
  u: 'mm' | 'in' // unit
}

export type ShareableSheetData = {
  t: 'sheet'
  n: string
  s: SheetStock[] // sheets
  p: RequiredPanel[] // panels
  o: OwnedSheet[] // owned
  k: number
  m: 'cost' | 'waste'
  u: 'mm' | 'in'
  g?: boolean // grainEnabled
}

export type ShareablePaverData = {
  t: 'paver'
  n: string
  a: RectangularArea[] // areas
  pv: PaverType // paver
  pt: LayingPattern // pattern
  gp: number // gap
  cw: number | null // customWastePercentage
  u: 'mm' | 'in'
}

export type ShareableData = ShareableTimberData | ShareableSheetData | ShareablePaverData

/**
 * Encodes project data to a shareable URL hash string.
 * Uses base64 encoding of compressed JSON.
 */
export function encodeShareData(data: ShareableData): string {
  try {
    const json = JSON.stringify(data)
    // Use TextEncoder for proper UTF-8 handling
    const bytes = new TextEncoder().encode(json)
    // Convert to base64
    const base64 = btoa(String.fromCharCode(...bytes))
    // URL-safe base64
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  } catch (error) {
    console.error('Error encoding share data:', error)
    return ''
  }
}

/**
 * Decodes a shareable URL hash string back to project data.
 */
export function decodeShareData(hash: string): ShareableData | null {
  try {
    // Restore standard base64 from URL-safe version
    let base64 = hash.replace(/-/g, '+').replace(/_/g, '/')
    // Add padding if needed
    while (base64.length % 4) base64 += '='
    
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    return JSON.parse(json) as ShareableData
  } catch (error) {
    console.error('Error decoding share data:', error)
    return null
  }
}

/**
 * Creates a shareable URL for a timber project.
 */
export function createTimberShareUrl(
  name: string,
  timbers: TimberStock[],
  cuts: RequiredCut[],
  ownedTimbers: OwnedTimber[],
  kerf: number,
  mode: 'cost' | 'waste',
  unit: 'mm' | 'in'
): string {
  const data: ShareableTimberData = {
    t: 'linear',
    n: name || 'Shared Project',
    ti: timbers,
    c: cuts,
    o: ownedTimbers,
    k: kerf,
    m: mode,
    u: unit,
  }
  const encoded = encodeShareData(data)
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}#/linear?share=${encoded}`
}

/**
 * Creates a shareable URL for a sheet project.
 */
export function createSheetShareUrl(
  name: string,
  sheets: SheetStock[],
  panels: RequiredPanel[],
  ownedSheets: OwnedSheet[],
  kerf: number,
  mode: 'cost' | 'waste',
  unit: 'mm' | 'in',
  grainEnabled?: boolean
): string {
  const data: ShareableSheetData = {
    t: 'sheet',
    n: name || 'Shared Project',
    s: sheets,
    p: panels,
    o: ownedSheets,
    k: kerf,
    m: mode,
    u: unit,
    g: grainEnabled,
  }
  const encoded = encodeShareData(data)
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}#/sheet?share=${encoded}`
}

/**
 * Gets share data from current URL if present.
 */
export function getShareDataFromUrl(): ShareableData | null {
  const hash = window.location.hash
  const match = hash.match(/[?&]share=([^&]+)/)
  if (!match) return null
  return decodeShareData(match[1])
}

/**
 * Validates and parses imported timber project JSON.
 */
export function validateTimberImport(json: unknown): Project | null {
  const data = json as Record<string, unknown>
  if (!Array.isArray(data.timbers) || !Array.isArray(data.cuts)) {
    return null
  }
  return {
    id: 'imported-' + Date.now(),
    name: (data.name as string) || 'Imported Project',
    timbers: data.timbers,
    cuts: data.cuts,
    ownedTimbers: (data.ownedTimbers as []) || [],
    kerf: (data.kerf as number) || 3,
    mode: (data.mode as 'cost' | 'waste') || 'cost',
    unit: (data.unit as 'mm' | 'in') || 'mm',
    createdAt: (data.createdAt as number) || Date.now(),
    updatedAt: (data.updatedAt as number) || Date.now(),
  }
}

/**
 * Validates and parses imported sheet project JSON.
 */
export function validateSheetImport(json: unknown): SheetProject | null {
  const data = json as Record<string, unknown>
  if (!Array.isArray(data.sheets) || !Array.isArray(data.panels)) {
    return null
  }
  return {
    id: 'imported-' + Date.now(),
    name: (data.name as string) || 'Imported Sheet Project',
    sheets: data.sheets,
    panels: data.panels,
    ownedSheets: (data.ownedSheets as []) || [],
    kerf: (data.kerf as number) || 3,
    mode: (data.mode as 'cost' | 'waste') || 'cost',
    unit: (data.unit as 'mm' | 'in') || 'mm',
    grainEnabled: (data.grainEnabled as boolean) || false,
    createdAt: (data.createdAt as number) || Date.now(),
    updatedAt: (data.updatedAt as number) || Date.now(),
  }
}

/**
 * Creates export data object for timber project.
 */
export function createTimberExportData(
  projectName: string,
  timbers: TimberStock[],
  cuts: RequiredCut[],
  ownedTimbers: OwnedTimber[],
  kerf: number,
  mode: 'cost' | 'waste',
  unit: 'mm' | 'in'
) {
  return {
    name: projectName || 'Untitled Project',
    timbers,
    cuts,
    ownedTimbers,
    kerf,
    mode,
    unit,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

/**
 * Creates export data object for sheet project.
 */
export function createSheetExportData(
  projectName: string,
  sheets: SheetStock[],
  panels: RequiredPanel[],
  ownedSheets: OwnedSheet[],
  kerf: number,
  mode: 'cost' | 'waste',
  unit: 'mm' | 'in',
  grainEnabled: boolean
) {
  return {
    name: projectName || 'Untitled Sheet Project',
    sheets,
    panels,
    ownedSheets,
    kerf,
    mode,
    unit,
    grainEnabled,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

/**
 * Creates a shareable URL for a paver project.
 */
export function createPaverShareUrl(
  name: string,
  areas: RectangularArea[],
  paver: PaverType,
  pattern: LayingPattern,
  gap: number,
  customWastePercentage: number | null,
  unit: 'mm' | 'in'
): string {
  const data: ShareablePaverData = {
    t: 'paver',
    n: name || 'Shared Paver Project',
    a: areas,
    pv: paver,
    pt: pattern,
    gp: gap,
    cw: customWastePercentage,
    u: unit,
  }
  const encoded = encodeShareData(data)
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}#/paver?share=${encoded}`
}

/**
 * Validates and parses imported paver project JSON.
 */
export function validatePaverImport(json: unknown): PaverProject | null {
  const data = json as Record<string, unknown>
  if (!Array.isArray(data.areas) || !data.paver) {
    return null
  }
  return {
    id: 'imported-' + Date.now(),
    name: (data.name as string) || 'Imported Paver Project',
    areas: data.areas,
    paver: data.paver as PaverType,
    pattern: (data.pattern as LayingPattern) || 'stack',
    gap: (data.gap as number) || 3,
    customWastePercentage: (data.customWastePercentage as number) || null,
    unit: (data.unit as 'mm' | 'in') || 'mm',
    createdAt: (data.createdAt as number) || Date.now(),
    updatedAt: (data.updatedAt as number) || Date.now(),
  }
}

/**
 * Creates export data object for paver project.
 */
export function createPaverExportData(
  projectName: string,
  areas: RectangularArea[],
  paver: PaverType,
  pattern: LayingPattern,
  gap: number,
  customWastePercentage: number | null,
  unit: 'mm' | 'in'
) {
  return {
    name: projectName || 'Untitled Paver Project',
    areas,
    paver,
    pattern,
    gap,
    customWastePercentage,
    unit,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}
