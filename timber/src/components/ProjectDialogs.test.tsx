import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ProjectToolbar from './ProjectToolbar'
import { type Project, createTimberShareUrl, validateTimberImport, createTimberExportData } from '@/lib/storage'

// Mock SettingsDialog since it's complex and tested separately (or should be)
vi.mock('@/components/SettingsDialog', () => ({
  SettingsDialog: () => <button>Mock Settings</button>,
}))

describe('ProjectToolbar', () => {
  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'Project 1',
      updatedAt: Date.now(),
      createdAt: Date.now(),
      timbers: [],
      cuts: [],
      ownedTimbers: [],
      kerf: 3,
      mode: 'cost',
      unit: 'mm',
    },
  ]

  const mockProps = {
    projectType: 'linear' as const,
    createShareUrl: () => createTimberShareUrl('', [], [], [], 3, 'cost', 'mm'),
    projectName: '',
    setProjectName: vi.fn(),
    projects: mockProjects,
    showSaveDialog: false,
    showLoadDialog: false,
    setShowSaveDialog: vi.fn(),
    setShowLoadDialog: vi.fn(),
    handleSaveProject: vi.fn(),
    handleLoadProject: vi.fn(),
    handleDeleteProject: vi.fn(),
    handleNewProject: vi.fn(),
    kerf: 3,
    setKerf: vi.fn(),
    unit: 'mm' as const,
    setUnit: vi.fn(),
    mode: 'cost' as const,
    setMode: vi.fn(),
    exportData: () => createTimberExportData('', [], [], [], 3, 'cost', 'mm'),
    validateImport: validateTimberImport,
  }

  it('renders all main buttons', () => {
    render(<ProjectToolbar {...mockProps} />)
    expect(screen.getByText(/New Project/i)).toBeInTheDocument()
    expect(screen.getByText(/Save Project/i)).toBeInTheDocument()
    expect(screen.getByText(/Load Project/i)).toBeInTheDocument()
    expect(screen.getByText(/Mock Settings/i)).toBeInTheDocument()
  })

  it('calls handleNewProject when New Project is clicked', () => {
    render(<ProjectToolbar {...mockProps} />)
    fireEvent.click(screen.getByText(/New Project/i))
    expect(mockProps.handleNewProject).toHaveBeenCalled()
  })

  it('opens save dialog when Save Project is clicked', () => {
    render(<ProjectToolbar {...mockProps} />)
    const saveButton = screen.getByText(/Save Project/i).closest('button')
    fireEvent.click(saveButton!)
  })

  it('renders save dialog content when open', () => {
    render(<ProjectToolbar {...mockProps} showSaveDialog={true} />)
    expect(screen.getByPlaceholderText('Enter project name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('calls handleSaveProject when Save button in dialog is clicked', () => {
    render(<ProjectToolbar {...mockProps} showSaveDialog={true} />)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(mockProps.handleSaveProject).toHaveBeenCalled()
  })

  it('renders load dialog content when open', () => {
    render(<ProjectToolbar {...mockProps} showLoadDialog={true} />)
    expect(screen.getByText('Project 1')).toBeInTheDocument()
  })

  it('calls handleLoadProject when Load button is clicked', () => {
    render(<ProjectToolbar {...mockProps} showLoadDialog={true} />)
    const loadButtons = screen.getAllByText('Load')
    fireEvent.click(loadButtons[0])
    expect(mockProps.handleLoadProject).toHaveBeenCalledWith(mockProjects[0])
  })
})
