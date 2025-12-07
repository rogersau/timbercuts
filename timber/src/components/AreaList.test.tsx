import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AreaList from './AreaList'
import { type RectangularArea } from '@/lib/paver-calculator'

describe('AreaList', () => {
  const mockAreas: RectangularArea[] = [
    { length: 3000, width: 2000, label: 'Patio' },
    { length: 5000, width: 1000, label: 'Walkway' },
  ]

  const mockProps = {
    areas: mockAreas,
    unit: 'mm' as const,
    addArea: vi.fn(),
    removeArea: vi.fn(),
    updateArea: vi.fn(),
  }

  it('renders all areas', () => {
    render(<AreaList {...mockProps} />)
    const lengthInputs = screen.getAllByPlaceholderText(/Length/i)
    expect(lengthInputs).toHaveLength(2)
  })

  it('displays area lengths correctly', () => {
    render(<AreaList {...mockProps} />)
    const lengthInputs = screen.getAllByPlaceholderText(/Length/i)
    expect(lengthInputs[0]).toHaveValue(3000)
    expect(lengthInputs[1]).toHaveValue(5000)
  })

  it('displays area widths correctly', () => {
    render(<AreaList {...mockProps} />)
    const widthInputs = screen.getAllByPlaceholderText(/Width/i)
    expect(widthInputs[0]).toHaveValue(2000)
    expect(widthInputs[1]).toHaveValue(1000)
  })

  it('displays area labels correctly', () => {
    render(<AreaList {...mockProps} />)
    const labelInputs = screen.getAllByPlaceholderText(/Label/i)
    expect(labelInputs[0]).toHaveValue('Patio')
    expect(labelInputs[1]).toHaveValue('Walkway')
  })

  it('calls addArea when add button is clicked', () => {
    render(<AreaList {...mockProps} />)
    const addButton = screen.getByText(/Add Area/i)
    fireEvent.click(addButton)
    expect(mockProps.addArea).toHaveBeenCalled()
  })

  it('calls removeArea when delete button is clicked', () => {
    render(<AreaList {...mockProps} />)
    const deleteButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg.lucide-trash-2'))
    fireEvent.click(deleteButtons[0])
    expect(mockProps.removeArea).toHaveBeenCalledWith(0)
  })

  it('calls updateArea when length input changes', () => {
    render(<AreaList {...mockProps} />)
    const inputs = screen.getAllByPlaceholderText(/Length/i)
    fireEvent.change(inputs[0], { target: { value: '4000' } })
    expect(mockProps.updateArea).toHaveBeenCalledWith(0, 'length', 4000)
  })

  it('calls updateArea when width input changes', () => {
    render(<AreaList {...mockProps} />)
    const inputs = screen.getAllByPlaceholderText(/Width/i)
    fireEvent.change(inputs[0], { target: { value: '2500' } })
    expect(mockProps.updateArea).toHaveBeenCalledWith(0, 'width', 2500)
  })

  it('calls updateArea when label input changes', () => {
    render(<AreaList {...mockProps} />)
    const inputs = screen.getAllByPlaceholderText(/Label/i)
    fireEvent.change(inputs[0], { target: { value: 'New Label' } })
    expect(mockProps.updateArea).toHaveBeenCalledWith(0, 'label', 'New Label')
  })

  it('disables delete button when only one area exists', () => {
    render(<AreaList {...mockProps} areas={[{ length: 3000, width: 2000, label: 'Single' }]} />)
    const deleteButton = screen
      .getAllByRole('button')
      .find((btn) => btn.querySelector('svg.lucide-trash-2'))
    expect(deleteButton).toBeDisabled()
  })
})
