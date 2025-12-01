import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import OwnedSheetList from './OwnedSheetList'
import { type OwnedSheet } from '@/lib/sheet-optimizer'

describe('OwnedSheetList', () => {
  const mockOwnedSheets: OwnedSheet[] = [
    { width: 2400, height: 1200, quantity: 2 },
    { width: 1200, height: 600, quantity: 1 },
  ]

  const mockProps = {
    ownedSheets: mockOwnedSheets,
    unit: 'mm' as const,
    addOwnedSheet: vi.fn(),
    removeOwnedSheet: vi.fn(),
    updateOwnedSheet: vi.fn(),
  }

  it('renders all owned sheets', () => {
    render(<OwnedSheetList {...mockProps} />)
    const widthInputs = screen.getAllByPlaceholderText('Width')
    expect(widthInputs).toHaveLength(2)
  })

  it('displays dimensions correctly', () => {
    render(<OwnedSheetList {...mockProps} />)
    const widthInputs = screen.getAllByPlaceholderText('Width')
    const heightInputs = screen.getAllByPlaceholderText('Height')
    expect(widthInputs[0]).toHaveValue(2400)
    expect(heightInputs[0]).toHaveValue(1200)
  })

  it('shows empty message when no owned sheets', () => {
    render(<OwnedSheetList {...mockProps} ownedSheets={[]} />)
    expect(screen.getByText(/No sheets on hand/i)).toBeInTheDocument()
  })

  it('calls addOwnedSheet when add button is clicked', () => {
    render(<OwnedSheetList {...mockProps} />)
    const addButton = screen.getByText(/Add Owned Sheet/i)
    fireEvent.click(addButton)
    expect(mockProps.addOwnedSheet).toHaveBeenCalled()
  })

  it('calls removeOwnedSheet when delete button is clicked', () => {
    render(<OwnedSheetList {...mockProps} />)
    const deleteButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg.lucide-trash-2'))
    fireEvent.click(deleteButtons[0])
    expect(mockProps.removeOwnedSheet).toHaveBeenCalledWith(0)
  })

  it('calls updateOwnedSheet when width input changes', () => {
    render(<OwnedSheetList {...mockProps} />)
    const inputs = screen.getAllByPlaceholderText('Width')
    fireEvent.change(inputs[0], { target: { value: '3000' } })
    expect(mockProps.updateOwnedSheet).toHaveBeenCalledWith(0, 'width', 3000)
  })

  it('calls updateOwnedSheet when height input changes', () => {
    render(<OwnedSheetList {...mockProps} />)
    const inputs = screen.getAllByPlaceholderText('Height')
    fireEvent.change(inputs[0], { target: { value: '1500' } })
    expect(mockProps.updateOwnedSheet).toHaveBeenCalledWith(0, 'height', 1500)
  })
})
