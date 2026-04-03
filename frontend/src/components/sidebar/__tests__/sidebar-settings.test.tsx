import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { SidebarSettings } from '../sidebar-settings'
import { useTheme } from 'next-themes'
import { useLocation } from '@tanstack/react-router'

jest.mock('next-themes')
jest.mock('@tanstack/react-router', () => ({
  useLocation: jest.fn(),
  useParams: jest.fn(() => ({ organisationId: 'org-1', projectId: 'project-1' })),
  Link: ({ children, to, params, ...props }: any) => <a href={to} {...props}>{children}</a>,
}))

const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>

describe('SidebarSettings', () => {
  const mockSetTheme = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      themes: ['light', 'dark'],
      systemTheme: 'light',
    } as any)
    mockUseLocation.mockReturnValue({ pathname: '/' } as any)
  })

  it('should render documentation link', () => {
    render(<SidebarSettings isCollapsed={false} />)
    expect(screen.getByText('Documentation')).toBeInTheDocument()
  })

  it('should render theme toggle button', () => {
    render(<SidebarSettings isCollapsed={false} />)
    expect(screen.getByText('Dark mode')).toBeInTheDocument()
  })

  it('should hide text when collapsed', () => {
    render(<SidebarSettings isCollapsed={true} />)
    expect(screen.queryByText('Documentation')).not.toBeInTheDocument()
    expect(screen.queryByText('Dark mode')).not.toBeInTheDocument()
  })

  it('should show "Light mode" when theme is dark', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      themes: ['light', 'dark'],
      systemTheme: 'dark',
    } as any)

    render(<SidebarSettings isCollapsed={false} />)
    expect(screen.getByText('Light mode')).toBeInTheDocument()
  })

  it('should call setTheme when theme toggle is clicked', () => {
    render(<SidebarSettings isCollapsed={false} />)
    const themeButton = screen.getByText('Dark mode')
    fireEvent.click(themeButton)
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('should toggle to light when dark theme is active', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      themes: ['light', 'dark'],
      systemTheme: 'dark',
    } as any)

    render(<SidebarSettings isCollapsed={false} />)
    const themeButton = screen.getByText('Light mode')
    fireEvent.click(themeButton)
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })
})
