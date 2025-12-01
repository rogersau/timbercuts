import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ErrorDialog from './ErrorDialog'

describe('ErrorDialog', () => {
  const mockProps = {
    open: true,
    setOpen: vi.fn(),
    message: 'Something went wrong',
  }

  it('renders error title', () => {
    render(<ErrorDialog {...mockProps} />)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('renders error message', () => {
    render(<ErrorDialog {...mockProps} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders default message when message is null', () => {
    render(<ErrorDialog {...mockProps} message={null} />)
    expect(screen.getByText('Unknown error')).toBeInTheDocument()
  })

  it('calls setOpen(false) when close button is clicked', () => {
    render(<ErrorDialog {...mockProps} />)
    const closeButtons = screen.getAllByRole('button', { name: 'Close' })
    fireEvent.click(closeButtons[0])
    expect(mockProps.setOpen).toHaveBeenCalledWith(false)
  })

  it('does not render content when closed', () => {
    render(<ErrorDialog {...mockProps} open={false} />)
    expect(screen.queryByText('Error')).not.toBeInTheDocument()
  })
})
