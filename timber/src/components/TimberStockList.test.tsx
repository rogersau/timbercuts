import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TimberStockList from './TimberStockList'
import { type TimberStock } from '@/lib/timber-optimizer'

describe('TimberStockList', () => {
  const mockTimbers: TimberStock[] = [
    { length: 2400, price: 10 },
    { length: 1200, price: 5 }
  ]

  const mockProps = {
    timbers: mockTimbers,
    unit: 'mm' as const,
    addTimber: vi.fn(),
    removeTimber: vi.fn(),
    updateTimber: vi.fn()
  }

  it('renders all timbers', () => {
    render(<TimberStockList {...mockProps} />)
    const inputs = screen.getAllByPlaceholderText(/Length/i)
    expect(inputs).toHaveLength(2)
    expect(inputs[0]).toHaveValue('2400')
    expect(inputs[1]).toHaveValue('1200')
  })

  it('calls addTimber when add button is clicked', () => {
    render(<TimberStockList {...mockProps} />)
    const addButton = screen.getByText(/Add Timber/i)
    fireEvent.click(addButton)
    expect(mockProps.addTimber).toHaveBeenCalled()
  })

  it('calls removeTimber when delete button is clicked', () => {
    render(<TimberStockList {...mockProps} />)
    const deleteButtons = screen.getAllByRole('button').filter(btn => btn.querySelector('svg.lucide-trash-2'))
    fireEvent.click(deleteButtons[0])
    expect(mockProps.removeTimber).toHaveBeenCalledWith(0)
  })

  it('calls updateTimber when length input changes', () => {
    render(<TimberStockList {...mockProps} />)
    const inputs = screen.getAllByPlaceholderText(/Length/i)
    fireEvent.change(inputs[0], { target: { value: '3000' } })
    expect(mockProps.updateTimber).toHaveBeenCalledWith(0, 'length', 3000)
  })

  it('calls updateTimber when price input changes', () => {
    render(<TimberStockList {...mockProps} />)
    const inputs = screen.getAllByPlaceholderText('Price')
    fireEvent.change(inputs[0], { target: { value: '15' } })
    expect(mockProps.updateTimber).toHaveBeenCalledWith(0, 'price', 15)
  })
})
