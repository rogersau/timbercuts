import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PanelList from './PanelList'
import { type RequiredPanel } from '@/lib/sheet-optimizer'

describe('PanelList', () => {
  const mockPanels: RequiredPanel[] = [
    { width: 600, height: 400, quantity: 2 },
    { width: 300, height: 200, quantity: 1 },
  ]

  const mockProps = {
    panels: mockPanels,
    unit: 'mm' as const,
    addPanel: vi.fn(),
    removePanel: vi.fn(),
    updatePanel: vi.fn(),
  }

  it('renders all panels', () => {
    render(<PanelList {...mockProps} />)
    const widthInputs = screen.getAllByPlaceholderText('Width')
    expect(widthInputs).toHaveLength(2)
  })

  it('displays dimensions correctly', () => {
    render(<PanelList {...mockProps} />)
    const widthInputs = screen.getAllByPlaceholderText('Width')
    const heightInputs = screen.getAllByPlaceholderText('Height')
    expect(widthInputs[0]).toHaveValue(600)
    expect(heightInputs[0]).toHaveValue(400)
  })

  it('calls addPanel when add button is clicked', () => {
    render(<PanelList {...mockProps} />)
    const addButton = screen.getByText(/Add Panel/i)
    fireEvent.click(addButton)
    expect(mockProps.addPanel).toHaveBeenCalled()
  })

  it('calls removePanel when delete button is clicked', () => {
    render(<PanelList {...mockProps} />)
    const deleteButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg.lucide-trash-2'))
    fireEvent.click(deleteButtons[0])
    expect(mockProps.removePanel).toHaveBeenCalledWith(0)
  })

  it('calls updatePanel when width input changes', () => {
    render(<PanelList {...mockProps} />)
    const inputs = screen.getAllByPlaceholderText('Width')
    fireEvent.change(inputs[0], { target: { value: '800' } })
    expect(mockProps.updatePanel).toHaveBeenCalledWith(0, 'width', 800)
  })

  it('calls updatePanel when height input changes', () => {
    render(<PanelList {...mockProps} />)
    const inputs = screen.getAllByPlaceholderText('Height')
    fireEvent.change(inputs[0], { target: { value: '500' } })
    expect(mockProps.updatePanel).toHaveBeenCalledWith(0, 'height', 500)
  })

  it('calls updatePanel when quantity input changes', () => {
    render(<PanelList {...mockProps} />)
    const qtyInputs = screen.getAllByPlaceholderText('1')
    fireEvent.change(qtyInputs[0], { target: { value: '5' } })
    expect(mockProps.updatePanel).toHaveBeenCalledWith(0, 'quantity', 5)
  })

  it('disables delete button when only one panel exists', () => {
    render(<PanelList {...mockProps} panels={[{ width: 600, height: 400, quantity: 1 }]} />)
    const deleteButton = screen
      .getAllByRole('button')
      .find((btn) => btn.querySelector('svg.lucide-trash-2'))
    expect(deleteButton).toBeDisabled()
  })
})
