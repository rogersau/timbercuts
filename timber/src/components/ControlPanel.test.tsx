import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ControlPanel from './ControlPanel'

describe('ControlPanel', () => {
  const mockProps = {
    isCalculating: false,
    calculate: vi.fn(),
  }

  it('renders calculate button', () => {
    render(<ControlPanel {...mockProps} />)
    expect(screen.getByText('Calculate Optimal Cuts')).toBeInTheDocument()
  })

  it('calls calculate when button is clicked', () => {
    render(<ControlPanel {...mockProps} />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockProps.calculate).toHaveBeenCalled()
  })

  it('shows calculating text when isCalculating is true', () => {
    render(<ControlPanel {...mockProps} isCalculating={true} />)
    expect(screen.getByText('Calculating...')).toBeInTheDocument()
  })

  it('disables button when calculating', () => {
    render(<ControlPanel {...mockProps} isCalculating={true} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
