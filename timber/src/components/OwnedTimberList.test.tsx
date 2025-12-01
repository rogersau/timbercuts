import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import OwnedTimberList from './OwnedTimberList'
import { type OwnedTimber } from '@/lib/timber-optimizer'

describe('OwnedTimberList', () => {
  const mockOwnedTimbers: OwnedTimber[] = [
    { length: 2400, quantity: 2 },
    { length: 1800, quantity: 1 },
  ]

  const mockProps = {
    ownedTimbers: mockOwnedTimbers,
    unit: 'mm' as const,
    addOwnedTimber: vi.fn(),
    removeOwnedTimber: vi.fn(),
    updateOwnedTimber: vi.fn(),
  }

  it('renders all owned timbers', () => {
    render(<OwnedTimberList {...mockProps} />)
    const inputs = screen.getAllByPlaceholderText(/Length/i)
    expect(inputs).toHaveLength(2)
  })

  it('displays lengths correctly', () => {
    render(<OwnedTimberList {...mockProps} />)
    const inputs = screen.getAllByPlaceholderText(/Length/i)
    expect(inputs[0]).toHaveValue(2400)
    expect(inputs[1]).toHaveValue(1800)
  })

  it('displays quantities correctly', () => {
    render(<OwnedTimberList {...mockProps} />)
    const qtyInputs = screen.getAllByPlaceholderText('Qty')
    expect(qtyInputs[0]).toHaveValue(2)
    expect(qtyInputs[1]).toHaveValue(1)
  })

  it('shows empty message when no owned timbers', () => {
    render(<OwnedTimberList {...mockProps} ownedTimbers={[]} />)
    expect(screen.getByText(/No owned material/i)).toBeInTheDocument()
  })

  it('calls addOwnedTimber when add button is clicked', () => {
    render(<OwnedTimberList {...mockProps} />)
    const addButton = screen.getByText(/Add Owned Timber/i)
    fireEvent.click(addButton)
    expect(mockProps.addOwnedTimber).toHaveBeenCalled()
  })

  it('calls removeOwnedTimber when delete button is clicked', () => {
    render(<OwnedTimberList {...mockProps} />)
    const deleteButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg.lucide-trash-2'))
    fireEvent.click(deleteButtons[0])
    expect(mockProps.removeOwnedTimber).toHaveBeenCalledWith(0)
  })

  it('calls updateOwnedTimber when length input changes', () => {
    render(<OwnedTimberList {...mockProps} />)
    const inputs = screen.getAllByPlaceholderText(/Length/i)
    fireEvent.change(inputs[0], { target: { value: '3000' } })
    expect(mockProps.updateOwnedTimber).toHaveBeenCalledWith(0, 'length', 3000)
  })

  it('calls updateOwnedTimber when quantity input changes', () => {
    render(<OwnedTimberList {...mockProps} />)
    const inputs = screen.getAllByPlaceholderText('Qty')
    fireEvent.change(inputs[0], { target: { value: '5' } })
    expect(mockProps.updateOwnedTimber).toHaveBeenCalledWith(0, 'quantity', 5)
  })
})
