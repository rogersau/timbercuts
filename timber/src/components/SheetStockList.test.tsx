import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SheetStockList from './SheetStockList'
import { type SheetStock } from '@/lib/sheet-optimizer'

describe('SheetStockList', () => {
  const mockSheets: SheetStock[] = [
    { width: 2400, height: 1200, price: 50 },
    { width: 1200, height: 600, price: 25 },
  ]

  const mockProps = {
    sheets: mockSheets,
    unit: 'mm' as const,
    addSheet: vi.fn(),
    removeSheet: vi.fn(),
    updateSheet: vi.fn(),
  }

  it('renders all sheets', () => {
    render(<SheetStockList {...mockProps} />)
    const widthInputs = screen.getAllByPlaceholderText('Width')
    expect(widthInputs).toHaveLength(2)
  })

  it('displays dimensions correctly', () => {
    render(<SheetStockList {...mockProps} />)
    const widthInputs = screen.getAllByPlaceholderText('Width')
    const heightInputs = screen.getAllByPlaceholderText('Height')
    expect(widthInputs[0]).toHaveValue(2400)
    expect(heightInputs[0]).toHaveValue(1200)
  })

  it('displays prices correctly', () => {
    render(<SheetStockList {...mockProps} />)
    const priceInputs = screen.getAllByPlaceholderText('Price')
    expect(priceInputs[0]).toHaveDisplayValue('50.00')
    expect(priceInputs[1]).toHaveDisplayValue('25.00')
  })

  it('calls addSheet when add button is clicked', () => {
    render(<SheetStockList {...mockProps} />)
    const addButton = screen.getByText(/Add Sheet Size/i)
    fireEvent.click(addButton)
    expect(mockProps.addSheet).toHaveBeenCalled()
  })

  it('calls removeSheet when delete button is clicked', () => {
    render(<SheetStockList {...mockProps} />)
    const deleteButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg.lucide-trash-2'))
    fireEvent.click(deleteButtons[0])
    expect(mockProps.removeSheet).toHaveBeenCalledWith(0)
  })

  it('calls updateSheet when width input changes', () => {
    render(<SheetStockList {...mockProps} />)
    const inputs = screen.getAllByPlaceholderText('Width')
    fireEvent.change(inputs[0], { target: { value: '3000' } })
    expect(mockProps.updateSheet).toHaveBeenCalledWith(0, 'width', 3000)
  })

  it('calls updateSheet when height input changes', () => {
    render(<SheetStockList {...mockProps} />)
    const inputs = screen.getAllByPlaceholderText('Height')
    fireEvent.change(inputs[0], { target: { value: '1500' } })
    expect(mockProps.updateSheet).toHaveBeenCalledWith(0, 'height', 1500)
  })

  it('calls updateSheet when price input changes', () => {
    render(<SheetStockList {...mockProps} />)
    const inputs = screen.getAllByPlaceholderText('Price')
    fireEvent.change(inputs[0], { target: { value: '75' } })
    expect(mockProps.updateSheet).toHaveBeenCalledWith(0, 'price', 75)
  })

  it('disables delete button when only one sheet exists', () => {
    render(<SheetStockList {...mockProps} sheets={[{ width: 2400, height: 1200, price: 50 }]} />)
    const deleteButton = screen
      .getAllByRole('button')
      .find((btn) => btn.querySelector('svg.lucide-trash-2'))
    expect(deleteButton).toBeDisabled()
  })
})
