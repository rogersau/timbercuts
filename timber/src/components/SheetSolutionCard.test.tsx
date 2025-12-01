import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SheetSolutionCard from './SheetSolutionCard'
import { type SheetSolution } from '@/lib/sheet-optimizer'

// Mock URL methods for CSV export
const mockCreateObjectURL = vi.fn(() => 'blob:test')
const mockRevokeObjectURL = vi.fn()
Object.defineProperty(URL, 'createObjectURL', { value: mockCreateObjectURL })
Object.defineProperty(URL, 'revokeObjectURL', { value: mockRevokeObjectURL })

describe('SheetSolutionCard', () => {
  const mockSolution: SheetSolution = {
    totalCost: 150.0,
    totalSheets: 2,
    totalWaste: 1360000,
    ownedSheetsUsed: 1,
    purchasedSheetsNeeded: 1,
    efficiency: 85.5,
    plans: [
      {
        sheetWidth: 2400,
        sheetHeight: 1200,
        sheetPrice: 0,
        isOwned: true,
        usedArea: 2400000,
        wasteArea: 480000,
        placements: [
          { x: 0, y: 0, width: 600, height: 400, rotated: false, panelIndex: 0 },
          { x: 600, y: 0, width: 600, height: 400, rotated: false, panelIndex: 0 },
        ],
      },
      {
        sheetWidth: 2400,
        sheetHeight: 1200,
        sheetPrice: 150.0,
        isOwned: false,
        usedArea: 2000000,
        wasteArea: 880000,
        placements: [
          { x: 0, y: 0, width: 1000, height: 500, rotated: true, panelIndex: 1 },
        ],
      },
    ],
  }

  it('renders summary statistics', () => {
    render(<SheetSolutionCard solution={mockSolution} unit="mm" />)
    expect(screen.getByText('$150.00')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // Total sheets
    expect(screen.getByText('1')).toBeInTheDocument() // Owned used
    expect(screen.getByText('85.5%')).toBeInTheDocument()
  })

  it('renders cutting plans', () => {
    render(<SheetSolutionCard solution={mockSolution} unit="mm" />)
    expect(screen.getByText('Sheet #1')).toBeInTheDocument()
    expect(screen.getByText('(Owned)')).toBeInTheDocument()
    expect(screen.getByText('Sheet #2')).toBeInTheDocument()
  })

  it('renders print and CSV buttons', () => {
    render(<SheetSolutionCard solution={mockSolution} unit="mm" />)
    expect(screen.getByText('Print')).toBeInTheDocument()
    expect(screen.getByText('CSV')).toBeInTheDocument()
  })

  it('displays sheet dimensions', () => {
    render(<SheetSolutionCard solution={mockSolution} unit="mm" />)
    expect(screen.getAllByText(/2400mm × 1200mm/)).toHaveLength(3) // 2 cutting plans + 1 shopping list
  })

  it('shows price for purchased sheets', () => {
    render(<SheetSolutionCard solution={mockSolution} unit="mm" />)
    expect(screen.getAllByText(/@ \$150\.00/)).toHaveLength(2) // shopping list + cutting plan
  })

  it('renders shopping list', () => {
    render(<SheetSolutionCard solution={mockSolution} unit="mm" />)
    expect(screen.getByText('🛒 Shopping List')).toBeInTheDocument()
    expect(screen.getByText(/1× 2400mm × 1200mm/)).toBeInTheDocument()
  })
})
