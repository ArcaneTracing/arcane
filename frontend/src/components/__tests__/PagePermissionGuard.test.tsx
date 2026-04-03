import React from 'react'
import { render, screen } from '@testing-library/react'
import { PagePermissionGuard } from '../PagePermissionGuard'
import { PERMISSIONS } from '@/lib/permissions'

const mockUseParams = jest.fn()
const mockUseLocation = jest.fn()
const mockOutlet = () => React.createElement('div', { 'data-testid': 'outlet' }, 'Outlet')

jest.mock('@tanstack/react-router', () => ({
  useParams: (opts: unknown) => mockUseParams(opts),
  useLocation: () => mockUseLocation(),
  Outlet: () => mockOutlet(),
}))

jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: jest.fn(),
}))

jest.mock('@/pages/forbidden/page', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'forbidden-page' }, 'Access Forbidden'),
}))

const mockUsePermissions = require('@/hooks/usePermissions').usePermissions as jest.Mock

describe('PagePermissionGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({ organisationId: 'org-1', projectId: 'proj-1' })
    mockUseLocation.mockReturnValue({ pathname: '/org-1/proj-1' })
    mockUsePermissions.mockReturnValue({
      hasPermission: jest.fn(() => true),
      isLoading: false,
    })
  })

  it('renders children when user has permission', () => {
    render(
      <PagePermissionGuard permission={PERMISSIONS.TRACE.READ}>
        <span>Page content</span>
      </PagePermissionGuard>
    )
    expect(screen.getByText('Page content')).toBeInTheDocument()
    expect(screen.queryByTestId('forbidden-page')).not.toBeInTheDocument()
  })

  it('renders Outlet when user has permission and no children', () => {
    render(<PagePermissionGuard permission={PERMISSIONS.TRACE.READ} />)
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
    expect(screen.getByText('Outlet')).toBeInTheDocument()
  })

  it('renders fallback when user lacks permission', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: jest.fn(() => false),
      isLoading: false,
    })
    render(
      <PagePermissionGuard
        permission={PERMISSIONS.TRACE.READ}
        fallback={<span data-testid="custom-fallback">Custom denied</span>}
      >
        <span>Page content</span>
      </PagePermissionGuard>
    )
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
    expect(screen.getByText('Custom denied')).toBeInTheDocument()
    expect(screen.queryByText('Page content')).not.toBeInTheDocument()
  })

  it('renders ForbiddenPage when user lacks permission and no fallback prop', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: jest.fn(() => false),
      isLoading: false,
    })
    render(
      <PagePermissionGuard permission={PERMISSIONS.TRACE.READ}>
        <span>Page content</span>
      </PagePermissionGuard>
    )
    expect(screen.getByTestId('forbidden-page')).toBeInTheDocument()
    expect(screen.getByText('Access Forbidden')).toBeInTheDocument()
    expect(screen.queryByText('Page content')).not.toBeInTheDocument()
  })

  it('shows loading state when isLoading and showLoading is true', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: jest.fn(() => true),
      isLoading: true,
    })
    render(
      <PagePermissionGuard permission={PERMISSIONS.TRACE.READ} showLoading>
        <span>Page content</span>
      </PagePermissionGuard>
    )
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Page content')).not.toBeInTheDocument()
  })

  it('returns null when isLoading and showLoading is false', () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: jest.fn(() => true),
      isLoading: true,
    })
    const { container } = render(
      <PagePermissionGuard permission={PERMISSIONS.TRACE.READ} showLoading={false}>
        <span>Page content</span>
      </PagePermissionGuard>
    )
    expect(container.firstChild).toBeNull()
  })

  it('calls usePermissions with organisationId and projectId from props when provided', () => {
    render(
      <PagePermissionGuard
        permission={PERMISSIONS.CONVERSATION.READ}
        organisationId="org-prop"
        projectId="proj-prop"
      >
        <span>Content</span>
      </PagePermissionGuard>
    )
    expect(mockUsePermissions).toHaveBeenCalledWith({
      organisationId: 'org-prop',
      projectId: 'proj-prop',
    })
  })

  it('calls usePermissions with organisationId and projectId from params when not provided as props', () => {
    mockUseParams.mockReturnValue({ organisationId: 'org-params', projectId: 'proj-params' })
    render(
      <PagePermissionGuard permission={PERMISSIONS.CONVERSATION.READ}>
        <span>Content</span>
      </PagePermissionGuard>
    )
    expect(mockUsePermissions).toHaveBeenCalledWith({
      organisationId: 'org-params',
      projectId: 'proj-params',
    })
  })

  it('calls hasPermission with the given permission', () => {
    const hasPermission = jest.fn(() => true)
    mockUsePermissions.mockReturnValue({ hasPermission, isLoading: false })
    render(
      <PagePermissionGuard permission={PERMISSIONS.EVALUATION.READ}>
        <span>Content</span>
      </PagePermissionGuard>
    )
    expect(hasPermission).toHaveBeenCalledWith(PERMISSIONS.EVALUATION.READ)
  })

  it('calls usePermissions with undefined scope when params are empty (e.g. admin route)', () => {
    mockUseParams.mockReturnValue({})
    render(
      <PagePermissionGuard permission={PERMISSIONS.INSTANCE.ALL}>
        <span>Admin content</span>
      </PagePermissionGuard>
    )
    expect(mockUsePermissions).toHaveBeenCalledWith({
      organisationId: undefined,
      projectId: undefined,
    })
  })
})
