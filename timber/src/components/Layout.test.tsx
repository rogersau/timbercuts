import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Layout from './Layout'

describe('Layout', () => {
  it('renders title', () => {
    render(<Layout title="Test Title">Content</Layout>)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(<Layout title="Test">Child Content</Layout>)
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<Layout title="Test" description="Test description">Content</Layout>)
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('renders project name when currentProjectId is set', () => {
    render(
      <Layout title="Test" projectName="My Project" currentProjectId="123">
        Content
      </Layout>
    )
    expect(screen.getByText('Project: My Project')).toBeInTheDocument()
  })

  it('does not render project name when currentProjectId is null', () => {
    render(
      <Layout title="Test" projectName="My Project" currentProjectId={null}>
        Content
      </Layout>
    )
    expect(screen.queryByText('Project: My Project')).not.toBeInTheDocument()
  })
})
