import React from 'react'
import { render, screen } from '@testing-library/react'
import { PermissionGuard } from '../PermissionGuard'
import { PERMISSIONS } from '@/lib/permissions'

jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: jest.fn(),
}))

const mockUsePermissions = require('@/hooks/usePermissions').usePermissions

describe('PermissionGuard', () => {
  beforeEach(() => {
    mockUsePermissions.mockReturnValue({
      hasPermission: jest.fn(() => true),
      hasAnyPermission: jest.fn(() => true),
      hasAllPermissions: jest.fn(() => true),
      isLoading: false,
    })
  })

  it('renders children when user has permission', () => {
    render(
      <PermissionGuard permission={PERMISSIONS.PROJECT.DELETE}>
        <span>Delete Button</span>
      </PermissionGuard>
    )
    expect(screen.getByText('Delete Button')).toBeInTheDocument()
  })

  it('renders fallback when user lacks permission', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: jest.fn(() => false),
      hasAnyPermission: jest.fn(() => false),
      hasAllPermissions: jest.fn(() => false),
      isLoading: false,
    })
    render(
      <PermissionGuard permission={PERMISSIONS.PROJECT.DELETE} fallback={<span>No access</span>}>
        <span>Delete Button</span>
      </PermissionGuard>
    )
    expect(screen.getByText('No access')).toBeInTheDocument()
    expect(screen.queryByText('Delete Button')).not.toBeInTheDocument()
  })

  it('returns null when loading and showLoading is false', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: jest.fn(() => true),
      hasAnyPermission: jest.fn(() => true),
      hasAllPermissions: jest.fn(() => true),
      isLoading: true,
    })
    const { container } = render(
      <PermissionGuard permission={PERMISSIONS.PROJECT.DELETE}>
        <span>Delete Button</span>
      </PermissionGuard>
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows loading state when showLoading is true', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: jest.fn(() => true),
      hasAnyPermission: jest.fn(() => true),
      hasAllPermissions: jest.fn(() => true),
      isLoading: true,
    })
    render(
      <PermissionGuard permission={PERMISSIONS.PROJECT.DELETE} showLoading>
        <span>Delete Button</span>
      </PermissionGuard>
    )
    expect(screen.getByText('Loading permissions...')).toBeInTheDocument()
  })

  it('checks anyPermission when provided', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: jest.fn(() => false),
      hasAnyPermission: jest.fn(() => true),
      hasAllPermissions: jest.fn(() => false),
      isLoading: false,
    })
    render(
      <PermissionGuard anyPermission={[PERMISSIONS.PROJECT.UPDATE, PERMISSIONS.PROJECT.DELETE]}>
        <span>Actions</span>
      </PermissionGuard>
    )
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('checks allPermissions when provided', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: jest.fn(() => false),
      hasAnyPermission: jest.fn(() => false),
      hasAllPermissions: jest.fn(() => true),
      isLoading: false,
    })
    render(
      <PermissionGuard allPermissions={[PERMISSIONS.PROJECT.UPDATE, PERMISSIONS.PROJECT.DELETE]}>
        <span>All Actions</span>
      </PermissionGuard>
    )
    expect(screen.getByText('All Actions')).toBeInTheDocument()
  })

  it('renders children when no permission check specified', () => {
    render(<PermissionGuard><span>Always visible</span></PermissionGuard>)
    expect(screen.getByText('Always visible')).toBeInTheDocument()
  })
})
