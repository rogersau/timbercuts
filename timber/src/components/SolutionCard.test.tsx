import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SolutionCard from './SolutionCard'
import { type Solution } from '@/lib/timber-optimizer'

describe('SolutionCard', () => {
  const mockSolution: Solution = {
    totalCost: 100.50,
    totalWaste: 50,
    totalKerf: 10,
    totalTimbers: 2,
    ownedTimbersUsed: 1,
    purchasedTimbersNeeded: 1,
    plans: [
      {
        timberLength: 2400,
        timberPrice: 0,
        cuts: [1000, 1000],
        waste: 390,
        kerfUsed: 10,
        isOwned: true
      },
      {
        timberLength: 2400,
        timberPrice: 100.50,
        cuts: [2000],
        waste: 400,
        kerfUsed: 0,
        isOwned: false
      }
    ]
  }

  it('renders summary statistics', () => {
    render(<SolutionCard solution={mockSolution} unit="mm" />)
    expect(screen.getByText('$100.50')).toBeInTheDocument()
    expect(screen.getByText('50mm')).toBeInTheDocument()
    expect(screen.getByText('10mm')).toBeInTheDocument()
  })

  it('renders cutting plans', () => {
    render(<SolutionCard solution={mockSolution} unit="mm" />)
    expect(screen.getByText('Timber #1')).toBeInTheDocument()
    expect(screen.getByText('(Owned)')).toBeInTheDocument()
    expect(screen.getByText('Timber #2')).toBeInTheDocument()
    
    // Check for cuts
    const cuts = screen.getAllByText('1000mm')
    expect(cuts).toHaveLength(2)
    expect(screen.getByText('2000mm')).toBeInTheDocument()
  })

  it('renders correct styles for owned vs purchased', () => {
    render(<SolutionCard solution={mockSolution} unit="mm" />)
    // Owned timber cuts are green (bg-green-500)
    // Purchased timber cuts are primary color
    // This is hard to test with just class names in jsdom without computing styles, 
    // but we can check if the classes are present in the HTML
    
    const ownedCut = screen.getAllByText('1000mm')[0]
    expect(ownedCut.className).toContain('bg-green-500')
    
    const purchasedCut = screen.getByText('2000mm')
    expect(purchasedCut.className).toContain('bg-primary')
  })
})
