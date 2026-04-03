import React from 'react'
import { render, screen } from '@testing-library/react'
import { SidebarLogo } from '../sidebar-logo'

describe('SidebarLogo', () => {
  it('should render logo image', () => {
    render(<SidebarLogo isCollapsed={false} />)
    expect(screen.getByAltText('Arcane Logo')).toBeInTheDocument()
  })

  it('should render logo text when not collapsed', () => {
    render(<SidebarLogo isCollapsed={false} />)
    expect(screen.getByText('Arcane')).toBeInTheDocument()
  })

  it('should hide logo text when collapsed', () => {
    render(<SidebarLogo isCollapsed={true} />)
    expect(screen.queryByText('Arcane')).not.toBeInTheDocument()
    expect(screen.getByAltText('Arcane Logo')).toBeInTheDocument()
  })

  it('should link to home page', () => {
    render(<SidebarLogo isCollapsed={false} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/')
  })
})

