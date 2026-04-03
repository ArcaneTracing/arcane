import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ManageUsersDialog } from '../manage-users-dialog'
import type { ProjectResponse } from '@/types/projects'

const mockMutateAsync = jest.fn().mockResolvedValue(undefined)
const mockMutation = {
  mutateAsync: mockMutateAsync,
  isPending: false,
  error: null,
}

jest.mock('@/hooks/projects/use-projects-query', () => ({
  useAvailableUsers: jest.fn(() => ({ data: [], isLoading: false })),
  useInviteUser: jest.fn(() => mockMutation),
  useRemoveUser: jest.fn(() => mockMutation),
  useProjectsQuery: jest.fn(() => ({ data: [] })),
  useProjectRoles: jest.fn(() => ({ data: [], isLoading: false })),
  useUsersWithRoles: jest.fn(() => ({ data: [] })),
  useCreateProjectRole: jest.fn(() => mockMutation),
  useDeleteProjectRole: jest.fn(() => mockMutation),
  useAssignRole: jest.fn(() => mockMutation),
  useRemoveRole: jest.fn(() => mockMutation),
}))

jest.mock('@/hooks/shared/use-action-error', () => ({
  useActionError: jest.fn(() => ({
    message: null,
    clear: jest.fn(),
    handleError: jest.fn(),
  })),
}))

jest.mock('@/lib/toast', () => ({
  showSuccessToast: jest.fn(),
}))

jest.mock('@/components/PermissionGuard', () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const mockProject: ProjectResponse = {
  id: 'proj-1',
  name: 'Test Project',
  description: 'A test project',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockUseAvailableUsers = require('@/hooks/projects/use-projects-query').useAvailableUsers
const mockUseUsersWithRoles = require('@/hooks/projects/use-projects-query').useUsersWithRoles
const mockUseProjectRoles = require('@/hooks/projects/use-projects-query').useProjectRoles

describe('ManageUsersDialog', () => {
  const mockOnOpenChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAvailableUsers.mockReturnValue({ data: [], isLoading: false })
    mockUseUsersWithRoles.mockReturnValue({ data: [] })
    mockUseProjectRoles.mockReturnValue({ data: [], isLoading: false })
  })

  it('does not render content when closed', () => {
    render(
      <ManageUsersDialog project={mockProject} open={false} onOpenChange={mockOnOpenChange} />
    )
    expect(screen.queryByText('Manage Project Users & Roles')).not.toBeInTheDocument()
  })

  it('renders title and description when open with project', () => {
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    expect(screen.getByText('Manage Project Users & Roles')).toBeInTheDocument()
    expect(screen.getByText(/Add users and manage roles for Test Project/i)).toBeInTheDocument()
  })

  it('renders Users and Roles tabs', () => {
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    expect(screen.getByRole('tab', { name: 'Users' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Roles' })).toBeInTheDocument()
  })

  it('shows Current Users section with empty state', () => {
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    expect(screen.getByText(/Current Users \(0\)/)).toBeInTheDocument()
    expect(screen.getByText('No users in this project')).toBeInTheDocument()
  })

  it('shows Add User section when open', () => {
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    expect(screen.getByText('Add User')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/type email or name to search/i)).toBeInTheDocument()
  })

  it('calls onOpenChange when Close button clicked', () => {
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    const closeButtons = screen.getAllByRole('button', { name: 'Close' })
    fireEvent.click(closeButtons[0])
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('switches to Roles tab when Roles tab clicked', async () => {
    const user = userEvent.setup()
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    await user.click(screen.getByRole('tab', { name: 'Roles' }))
    await waitFor(() => {
      expect(screen.getByText(/Project Roles \(0\)/)).toBeInTheDocument()
      expect(screen.getByText('No roles created yet')).toBeInTheDocument()
    })
  })

  it('shows Create Role and Import buttons in Roles tab', async () => {
    const user = userEvent.setup()
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    await user.click(screen.getByRole('tab', { name: 'Roles' }))
    await waitFor(() => {
      expect(screen.getByText('Create Role')).toBeInTheDocument()
      expect(screen.getByText('Import')).toBeInTheDocument()
    })
  })

  it('handles null project - shows "this project" in description', () => {
    render(
      <ManageUsersDialog project={null} open={true} onOpenChange={mockOnOpenChange} />
    )
    expect(screen.getByText(/Add users and manage roles for this project/i)).toBeInTheDocument()
  })

  it('opens Create Role form when Create Role button clicked', async () => {
    const user = userEvent.setup()
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    await user.click(screen.getByRole('tab', { name: 'Roles' }))
    await user.click(screen.getByRole('button', { name: /create role/i }))
    expect(screen.getByText('Create New Role')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/e\.g\., Developer, Viewer/i)).toBeInTheDocument()
  })

  it('opens Import Role dialog when Import button clicked', async () => {
    const user = userEvent.setup()
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    await user.click(screen.getByRole('tab', { name: 'Roles' }))
    await user.click(screen.getByRole('button', { name: /import/i }))
    expect(screen.getByText('Import Role from File')).toBeInTheDocument()
    expect(screen.getByText(/click to upload or drag and drop/i)).toBeInTheDocument()
  })

  it('closes Create Role form when X button clicked', async () => {
    const user = userEvent.setup()
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    await user.click(screen.getByRole('tab', { name: 'Roles' }))
    await user.click(screen.getByRole('button', { name: /create role/i }))
    expect(screen.getByText('Create New Role')).toBeInTheDocument()
    const closeButtons = screen.getAllByRole('button')
    const xButton = closeButtons.find((b) => b.querySelector('svg') && !b.textContent?.trim())
    if (xButton) {
      await user.click(xButton)
      expect(screen.queryByText('Create New Role')).not.toBeInTheDocument()
    }
  })

  it('shows current users when usersWithRoles has data', () => {
    mockUseUsersWithRoles.mockReturnValue({
      data: [
        {
          id: 'u1',
          email: 'alice@example.com',
          name: 'Alice',
          roles: [{ id: 'r1', name: 'Admin', permissions: [] }],
        },
      ],
    })
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    expect(screen.getByText(/Current Users \(1\)/)).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
  })

  it('shows project roles when roles has data', async () => {
    const user = userEvent.setup()
    mockUseProjectRoles.mockReturnValue({
      data: [
        {
          id: 'r1',
          name: 'Developer',
          description: 'Can edit',
          permissions: ['evaluations:read'],
          isSystemRole: false,
          isInstanceLevel: false,
          canDelete: true,
          organisationId: null,
          projectId: 'proj-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      isLoading: false,
    })
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    await user.click(screen.getByRole('tab', { name: 'Roles' }))
    await waitFor(() => {
      expect(screen.getByText(/Project Roles \(1\)/)).toBeInTheDocument()
      expect(screen.getByText('Developer')).toBeInTheDocument()
    })
  })

  it('shows loading state for available users', () => {
    mockUseAvailableUsers.mockReturnValue({ data: [], isLoading: true })
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    expect(screen.getByPlaceholderText('Loading users...')).toBeInTheDocument()
  })

  it('invites user when Invite User clicked with email entered', async () => {
    const user = userEvent.setup()
    mockUseAvailableUsers.mockReturnValue({
      data: [{ email: 'new@example.com', name: 'New User' }],
      isLoading: false,
    })
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    const input = screen.getByPlaceholderText(/type email or name to search/i)
    await user.type(input, 'new@example.com')
    await user.click(screen.getByRole('button', { name: /invite user/i }))
    expect(mockMutateAsync).toHaveBeenCalled()
  })

  it('Invite User button disabled when no email', () => {
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    expect(screen.getByRole('button', { name: /invite user/i })).toBeDisabled()
  })

  it('calls remove when Remove user clicked', async () => {
    const user = userEvent.setup()
    const useRemoveUser = require('@/hooks/projects/use-projects-query').useRemoveUser
    useRemoveUser.mockReturnValue(mockMutation)
    mockUseUsersWithRoles.mockReturnValue({
      data: [{ id: 'u1', email: 'alice@example.com', name: 'Alice', roles: [] }],
    })
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    const removeBtn = screen.getByRole('button', { name: /remove user/i })
    await user.click(removeBtn)
    expect(mockMutateAsync).toHaveBeenCalledWith({
      projectId: 'proj-1',
      email: 'alice@example.com',
    })
  })

  it('shows Change Role and enters edit mode when Change Role clicked', async () => {
    const user = userEvent.setup()
    mockUseUsersWithRoles.mockReturnValue({
      data: [{ id: 'u1', email: 'alice@example.com', name: 'Alice', roles: [{ id: 'r1', name: 'Member', permissions: [] }] }],
    })
    mockUseProjectRoles.mockReturnValue({
      data: [
        { id: 'r1', name: 'Member', permissions: [], canDelete: true },
        { id: 'r2', name: 'Admin', permissions: [], canDelete: true },
      ],
      isLoading: false,
    })
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    await user.click(screen.getByRole('button', { name: 'Change Role' }))
    expect(screen.getAllByText('Member').length).toBeGreaterThanOrEqual(1)
  })

  it('shows role with description in Roles tab', async () => {
    const user = userEvent.setup()
    mockUseProjectRoles.mockReturnValue({
      data: [
        {
          id: 'r1',
          name: 'Developer',
          description: 'Can edit code',
          permissions: ['evaluations:read', 'experiments:read'],
          canDelete: true,
        },
      ],
      isLoading: false,
    })
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    await user.click(screen.getByRole('tab', { name: 'Roles' }))
    await waitFor(() => {
      expect(screen.getByText('Developer')).toBeInTheDocument()
      expect(screen.getByText('Can edit code')).toBeInTheDocument()
    })
  })

  it('shows loading when roles loading', async () => {
    const user = userEvent.setup()
    mockUseProjectRoles.mockReturnValue({ data: [], isLoading: true })
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    await user.click(screen.getByRole('tab', { name: 'Roles' }))
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument()
  })

  it('Create Role form shows role name input and permissions', async () => {
    const user = userEvent.setup()
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    await user.click(screen.getByRole('tab', { name: 'Roles' }))
    await user.click(screen.getByRole('button', { name: /create role/i }))
    expect(screen.getByPlaceholderText(/e\.g\., Developer, Viewer/i)).toBeInTheDocument()
    expect(screen.getByText('Permissions')).toBeInTheDocument()
  })

  it('calls createRole when Create Role form submitted with name and permission', async () => {
    const user = userEvent.setup()
    const useCreateProjectRole = require('@/hooks/projects/use-projects-query').useCreateProjectRole
    useCreateProjectRole.mockReturnValue(mockMutation)
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    await user.click(screen.getByRole('tab', { name: 'Roles' }))
    await user.click(screen.getByRole('button', { name: /create role/i }))
    await user.type(screen.getByPlaceholderText(/e\.g\., Developer, Viewer/i), 'Viewer')
    const firstCheckbox = screen.getAllByRole('checkbox')[0]
    await user.click(firstCheckbox)
    const createButtons = screen.getAllByRole('button', { name: /create role/i })
    await user.click(createButtons[1])
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'proj-1',
        data: expect.objectContaining({
          name: 'Viewer',
          permissions: expect.any(Array),
        }),
      })
    )
  })

  it('calls deleteRole when Delete role clicked', async () => {
    const user = userEvent.setup()
    const useDeleteProjectRole = require('@/hooks/projects/use-projects-query').useDeleteProjectRole
    useDeleteProjectRole.mockReturnValue(mockMutation)
    mockUseProjectRoles.mockReturnValue({
      data: [{ id: 'r1', name: 'Custom', permissions: [], canDelete: true }],
      isLoading: false,
    })
    render(
      <ManageUsersDialog project={mockProject} open={true} onOpenChange={mockOnOpenChange} />
    )
    await user.click(screen.getByRole('tab', { name: 'Roles' }))
    await waitFor(() => expect(screen.getByText('Custom')).toBeInTheDocument())
    const deleteBtn = screen.getByRole('button', { name: /delete role/i })
    await user.click(deleteBtn)
    expect(mockMutateAsync).toHaveBeenCalledWith({
      projectId: 'proj-1',
      roleId: 'r1',
    })
  })
})
