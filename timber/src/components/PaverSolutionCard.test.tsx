import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PaverSolutionCard from './PaverSolutionCard'
import { type PaverCalculatorResult } from '@/lib/paver-calculator'

describe('PaverSolutionCard', () => {
  const mockResult: PaverCalculatorResult = {
    totalAreaMm2: 9_000_000, // 9m²
    totalAreaM2: 9,
    paverAreaMm2: 25300, // 230x110mm brick
    effectivePaverAreaMm2: 26329, // with 3mm gap
    paversNeeded: 342,
    paversWithWaste: 370,
    wastePercentage: 0.08,
    coveragePerM2: 38,
  }

  it('renders summary statistics', () => {
    render(<PaverSolutionCard result={mockResult} unit="mm" />)
    expect(screen.getByText('9.00 m²')).toBeInTheDocument()
    expect(screen.getByText('342')).toBeInTheDocument()
    expect(screen.getByText('370')).toBeInTheDocument()
  })

  it('renders order summary', () => {
    render(<PaverSolutionCard result={mockResult} unit="mm" />)
    expect(screen.getByText('🛒 Order Summary')).toBeInTheDocument()
    expect(screen.getByText(/342 pavers/)).toBeInTheDocument()
    expect(screen.getByText(/370 pavers/)).toBeInTheDocument()
  })

  it('renders paver type when provided', () => {
    render(
      <PaverSolutionCard
        result={mockResult}
        unit="mm"
        paverName="Standard Brick"
        patternName="Stretcher Bond"
      />
    )
    expect(screen.getByText('Standard Brick')).toBeInTheDocument()
    expect(screen.getByText('Stretcher Bond')).toBeInTheDocument()
  })

  it('renders coverage rate', () => {
    render(<PaverSolutionCard result={mockResult} unit="mm" />)
    expect(screen.getByText('Coverage Rate')).toBeInTheDocument()
    expect(screen.getByText('38.0 per m²')).toBeInTheDocument()
  })

  it('renders waste percentage', () => {
    render(<PaverSolutionCard result={mockResult} unit="mm" />)
    expect(screen.getByText('Waste allowance (8%):')).toBeInTheDocument()
    expect(screen.getByText('+28 pavers')).toBeInTheDocument()
  })

  it('renders tip section', () => {
    render(<PaverSolutionCard result={mockResult} unit="mm" />)
    expect(screen.getByText('💡 Tip:')).toBeInTheDocument()
  })
})
