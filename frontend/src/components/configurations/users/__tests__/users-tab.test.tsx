import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { UsersTab } from '../users-tab';
import { render as customRender } from '@/__tests__/test-utils';
import { OrganisationUser } from '@/api/organisations';
import { RoleResponse } from '@/types/rbac';

const mockUsers: OrganisationUser[] = [
{
  id: 'user-1',
  email: 'user1@example.com',
  name: 'User One',
  role: {
    id: 'role-1',
    name: 'Organisation Member',
    description: 'Default member role',
    permissions: ['organisations:read'],
    isSystemRole: true,
    isInstanceLevel: false,
    organisationId: 'org-1',
    projectId: null,
    canDelete: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
},
{
  id: 'user-2',
  email: 'user2@example.com',
  name: 'User Two',
  role: {
    id: 'role-2',
    name: 'Organisation Admin',
    description: 'Admin role',
    permissions: ['*'],
    isSystemRole: true,
    isInstanceLevel: false,
    organisationId: 'org-1',
    projectId: null,
    canDelete: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}];


const mockRoles: RoleResponse[] = [
{
  id: 'role-1',
  name: 'Organisation Member',
  description: 'Default member role',
  permissions: ['organisations:read'],
  isSystemRole: true,
  isInstanceLevel: false,
  organisationId: 'org-1',
  projectId: null,
  canDelete: false,
  createdAt: new Date(),
  updatedAt: new Date()
},
{
  id: 'role-2',
  name: 'Organisation Admin',
  description: 'Admin role',
  permissions: ['*'],
  isSystemRole: true,
  isInstanceLevel: false,
  organisationId: 'org-1',
  projectId: null,
  canDelete: false,
  createdAt: new Date(),
  updatedAt: new Date()
}];


const mockInviteMutation = {
  mutateAsync: jest.fn().mockResolvedValue({ message: 'User added successfully' }),
  isPending: false,
  error: null
};

const mockChangeRoleMutation = {
  mutateAsync: jest.fn().mockResolvedValue({ message: 'Role updated successfully' }),
  isPending: false,
  error: null
};

const mockRemoveMutation = {
  mutateAsync: jest.fn().mockResolvedValue(undefined),
  isPending: false,
  error: null
};

jest.mock('@/hooks/organisations/use-organisation-config-query', () => ({
  useOrganisationUsers: jest.fn(),
  useInviteOrganisationUser: jest.fn(() => mockInviteMutation),
  useChangeOrganisationUserRole: jest.fn(() => mockChangeRoleMutation),
  useRemoveOrganisationUser: jest.fn(() => mockRemoveMutation),
  useOrganisationRoles: jest.fn()
}));

jest.mock('@/hooks/useOrganisation', () => ({
  useOrganisationIdOrNull: jest.fn(() => 'org-1')
}));

jest.mock('@/lib/toast', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn()
}));

jest.mock('@/components/PermissionGuard', () => ({
  PermissionGuard: ({ children }: {children: React.ReactNode;}) => <>{children}</>
}));

const mockUseOrganisationUsers = require('@/hooks/organisations/use-organisation-config-query').useOrganisationUsers;
const mockUseOrganisationRoles = require('@/hooks/organisations/use-organisation-config-query').useOrganisationRoles;

describe('UsersTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOrganisationUsers.mockReturnValue({
      data: mockUsers,
      isLoading: false
    });
    mockUseOrganisationRoles.mockReturnValue({
      data: mockRoles,
      isLoading: false
    });
  });

  it('should render users list', () => {
    customRender(<UsersTab />);
    expect(screen.getByText('Users (2)')).toBeInTheDocument();
    expect(screen.getByText('User One')).toBeInTheDocument();
    expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    expect(screen.getByText('User Two')).toBeInTheDocument();
    expect(screen.getByText('user2@example.com')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseOrganisationUsers.mockReturnValue({
      data: [],
      isLoading: true
    });
    customRender(<UsersTab />);
    const loader = screen.getByTestId('icon-loader2');
    expect(loader).toBeInTheDocument();
  });

  it('should show empty state', () => {
    mockUseOrganisationUsers.mockReturnValue({
      data: [],
      isLoading: false
    });
    customRender(<UsersTab />);
    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('should open invite dialog when invite button is clicked', () => {
    customRender(<UsersTab />);
    const inviteButton = screen.getByText('Invite User');
    fireEvent.click(inviteButton);
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('user@example.com')).toBeInTheDocument();
  });

  it('should invite user successfully', async () => {
    customRender(<UsersTab />);
    const inviteButton = screen.getByText('Invite User');
    fireEvent.click(inviteButton);

    const dialog = screen.getByTestId('dialog');
    const emailInput = within(dialog).getByPlaceholderText('user@example.com');
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });

    const submitButton = within(dialog).getByRole('button', { name: /invite/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockInviteMutation.mutateAsync).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        roleId: 'role-1'
      });
    });
  });

  it('should disable Invite button when email is empty', () => {
    customRender(<UsersTab />);
    const inviteButton = screen.getByText('Invite User');
    fireEvent.click(inviteButton);
    const dialog = screen.getByTestId('dialog');
    const submitButton = within(dialog).getByRole('button', { name: /invite/i });
    expect(submitButton).toBeDisabled();
  });

  it('should open remove confirmation dialog', () => {
    customRender(<UsersTab />);
    const removeButtons = screen.getAllByTestId('icon-trash2');
    fireEvent.click(removeButtons[0]);

    expect(screen.getByText('Remove User')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to remove this user/i)).toBeInTheDocument();
  });

  it('should remove user successfully', async () => {
    customRender(<UsersTab />);
    const removeButtons = screen.getAllByTestId('icon-trash2');
    fireEvent.click(removeButtons[0]);

    const confirmButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockRemoveMutation.mutateAsync).toHaveBeenCalledWith('user1@example.com');
    });
  });

  it('should allow changing user role', async () => {
    customRender(<UsersTab />);
    const editButtons = screen.getAllByTestId('icon-usercog');
    fireEvent.click(editButtons[0]);


    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });
    expect(screen.getByTestId('select')).toBeInTheDocument();
  });

  it('should discard role change when X button is clicked', async () => {
    customRender(<UsersTab />);
    const editButtons = screen.getAllByTestId('icon-usercog');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    const discardButton = screen.getByRole('button', { name: /discard change/i });
    fireEvent.click(discardButton);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
    });
    expect(mockChangeRoleMutation.mutateAsync).not.toHaveBeenCalled();
  });
});