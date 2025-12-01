import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SettingsDialog from './SettingsDialog'
import { TooltipProvider } from '@/components/ui/tooltip'

// Wrap component with TooltipProvider for tests
const renderWithProvider = (props: Parameters<typeof SettingsDialog>[0]) => {
  return render(
    <TooltipProvider>
      <SettingsDialog {...props} />
    </TooltipProvider>
  )
}

describe('SettingsDialog', () => {
  const mockProps = {
    kerf: 3,
    setKerf: vi.fn(),
    unit: 'mm' as const,
    setUnit: vi.fn(),
    mode: 'cost' as const,
    setMode: vi.fn(),
  }

  it('renders settings button', () => {
    renderWithProvider(mockProps)
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('opens dialog when settings button is clicked', () => {
    renderWithProvider(mockProps)
    fireEvent.click(screen.getByText('Settings'))
    expect(screen.getByText('Optimization Settings')).toBeInTheDocument()
  })

  it('displays current kerf value', () => {
    renderWithProvider(mockProps)
    fireEvent.click(screen.getByText('Settings'))
    const kerfInput = screen.getByDisplayValue('3')
    expect(kerfInput).toBeInTheDocument()
  })

  it('calls setKerf when kerf input changes', () => {
    renderWithProvider(mockProps)
    fireEvent.click(screen.getByText('Settings'))
    const kerfInput = screen.getByDisplayValue('3')
    fireEvent.change(kerfInput, { target: { value: '5' } })
    expect(mockProps.setKerf).toHaveBeenCalledWith(5)
  })

  it('displays current unit selection', () => {
    renderWithProvider(mockProps)
    fireEvent.click(screen.getByText('Settings'))
    expect(screen.getByText('mm')).toBeInTheDocument()
  })

  it('calls setUnit when unit selection changes', () => {
    renderWithProvider(mockProps)
    fireEvent.click(screen.getByText('Settings'))
    const unitSelect = screen.getByDisplayValue('Metric (mm)')
    fireEvent.change(unitSelect, { target: { value: 'in' } })
    expect(mockProps.setUnit).toHaveBeenCalledWith('in')
  })

  it('displays current mode selection', () => {
    renderWithProvider(mockProps)
    fireEvent.click(screen.getByText('Settings'))
    expect(screen.getByDisplayValue('Lowest total cost')).toBeInTheDocument()
  })

  it('calls setMode when mode selection changes', () => {
    renderWithProvider(mockProps)
    fireEvent.click(screen.getByText('Settings'))
    const modeSelect = screen.getByDisplayValue('Lowest total cost')
    fireEvent.change(modeSelect, { target: { value: 'waste' } })
    expect(mockProps.setMode).toHaveBeenCalledWith('waste')
  })
})
