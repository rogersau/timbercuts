import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CutsList from './CutsList'
import { type RequiredCut } from '@/lib/timber-optimizer'

describe('CutsList', () => {
  const mockCuts: RequiredCut[] = [
    { length: 1000, quantity: 2 },
    { length: 500, quantity: 1 },
  ]

  const mockProps = {
    cuts: mockCuts,
    unit: 'mm' as const,
    addCut: vi.fn(),
    removeCut: vi.fn(),
    updateCut: vi.fn(),
  }

  it('renders all cuts', () => {
    render(<CutsList {...mockProps} />)
    const lengthInputs = screen.getAllByPlaceholderText(/Length/i)
    expect(lengthInputs).toHaveLength(2)
  })

  it('displays cut lengths correctly', () => {
    render(<CutsList {...mockProps} />)
    const lengthInputs = screen.getAllByPlaceholderText(/Length/i)
    expect(lengthInputs[0]).toHaveValue(1000)
    expect(lengthInputs[1]).toHaveValue(500)
  })

  it('displays quantities correctly', () => {
    render(<CutsList {...mockProps} />)
    const qtyInputs = screen.getAllByPlaceholderText('Qty')
    expect(qtyInputs[0]).toHaveValue(2)
    expect(qtyInputs[1]).toHaveValue(1)
  })

  it('calls addCut when add button is clicked', () => {
    render(<CutsList {...mockProps} />)
    const addButton = screen.getByText(/Add Cut/i)
    fireEvent.click(addButton)
    expect(mockProps.addCut).toHaveBeenCalled()
  })

  it('calls removeCut when delete button is clicked', () => {
    render(<CutsList {...mockProps} />)
    const deleteButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg.lucide-trash-2'))
    fireEvent.click(deleteButtons[0])
    expect(mockProps.removeCut).toHaveBeenCalledWith(0)
  })

  it('calls updateCut when length input changes', () => {
    render(<CutsList {...mockProps} />)
    const inputs = screen.getAllByPlaceholderText(/Length/i)
    fireEvent.change(inputs[0], { target: { value: '1500' } })
    expect(mockProps.updateCut).toHaveBeenCalledWith(0, 'length', 1500)
  })

  it('calls updateCut when quantity input changes', () => {
    render(<CutsList {...mockProps} />)
    const inputs = screen.getAllByPlaceholderText('Qty')
    fireEvent.change(inputs[0], { target: { value: '5' } })
    expect(mockProps.updateCut).toHaveBeenCalledWith(0, 'quantity', 5)
  })

  it('disables delete button when only one cut exists', () => {
    render(<CutsList {...mockProps} cuts={[{ length: 1000, quantity: 1 }]} />)
    const deleteButton = screen
      .getAllByRole('button')
      .find((btn) => btn.querySelector('svg.lucide-trash-2'))
    expect(deleteButton).toBeDisabled()
  })
})
