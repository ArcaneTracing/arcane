import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { RolesTab } from '../roles-tab';
import { render as customRender } from '@/__tests__/test-utils';
import { RoleResponse } from '@/types/rbac';

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
  name: 'Custom Role',
  description: 'Custom role description',
  permissions: ['organisations:read', 'organisations:update'],
  isSystemRole: false,
  isInstanceLevel: false,
  organisationId: 'org-1',
  projectId: null,
  canDelete: true,
  createdAt: new Date(),
  updatedAt: new Date()
}];


const mockCreateMutation = {
  mutateAsync: jest.fn().mockResolvedValue({
    id: 'role-3',
    name: 'New Role',
    permissions: ['organisations:read']
  }),
  isPending: false,
  error: null
};

const mockUpdateMutation = {
  mutateAsync: jest.fn().mockResolvedValue({
    id: 'role-2',
    name: 'Updated Role',
    permissions: ['organisations:read']
  }),
  isPending: false,
  error: null
};

const mockDeleteMutation = {
  mutateAsync: jest.fn().mockResolvedValue(undefined),
  isPending: false,
  error: null
};

jest.mock('@/hooks/organisations/use-organisation-config-query', () => ({
  useOrganisationRoles: jest.fn(),
  useCreateOrganisationRole: jest.fn(() => mockCreateMutation),
  useUpdateOrganisationRole: jest.fn(() => mockUpdateMutation),
  useDeleteOrganisationRole: jest.fn(() => mockDeleteMutation)
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

const mockUseOrganisationRoles = require('@/hooks/organisations/use-organisation-config-query').useOrganisationRoles;

describe('RolesTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOrganisationRoles.mockReturnValue({
      data: mockRoles,
      isLoading: false
    });
  });

  it('should render roles list', () => {
    customRender(<RolesTab />);
    expect(screen.getByText('Roles (2)')).toBeInTheDocument();
    expect(screen.getByText('Organisation Member')).toBeInTheDocument();
    expect(screen.getByText('Custom Role')).toBeInTheDocument();
  });

  it('should separate system and custom roles', () => {
    customRender(<RolesTab />);
    expect(screen.getByText('System Roles')).toBeInTheDocument();
    expect(screen.getByText('Custom Roles')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseOrganisationRoles.mockReturnValue({
      data: [],
      isLoading: true
    });
    customRender(<RolesTab />);
    const loader = screen.getByTestId('icon-loader2');
    expect(loader).toBeInTheDocument();
  });

  it('should show empty state', () => {
    mockUseOrganisationRoles.mockReturnValue({
      data: [],
      isLoading: false
    });
    customRender(<RolesTab />);
    expect(screen.getByText('No roles found')).toBeInTheDocument();
  });

  it('should open create dialog when create button is clicked', () => {
    customRender(<RolesTab />);
    const createButton = screen.getByText('Create Role');
    fireEvent.click(createButton);
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter role name')).toBeInTheDocument();
  });

  it('should create role successfully', async () => {
    customRender(<RolesTab />);
    const createButton = screen.getByText('Create Role');
    fireEvent.click(createButton);

    const dialog = screen.getByTestId('dialog');
    const nameInput = within(dialog).getByPlaceholderText('Enter role name');
    fireEvent.change(nameInput, { target: { value: 'New Role' } });


    const permissionCheckbox = within(dialog).getByLabelText('organisations:read');
    fireEvent.click(permissionCheckbox);

    const submitButton = within(dialog).getByRole('button', { name: /^create$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateMutation.mutateAsync).toHaveBeenCalledWith({
        name: 'New Role',
        description: undefined,
        permissions: ['organisations:read']
      });
    });
  });

  it('should disable Create button when role name is empty', () => {
    customRender(<RolesTab />);
    const createButton = screen.getByText('Create Role');
    fireEvent.click(createButton);
    const dialog = screen.getByTestId('dialog');
    const submitButton = within(dialog).getByRole('button', { name: /^create$/i });
    expect(submitButton).toBeDisabled();
  });

  it('should disable Create button when no permissions selected', async () => {
    customRender(<RolesTab />);
    const createButton = screen.getByText('Create Role');
    fireEvent.click(createButton);

    const dialog = screen.getByTestId('dialog');
    const nameInput = within(dialog).getByPlaceholderText('Enter role name');
    fireEvent.change(nameInput, { target: { value: 'New Role' } });

    const submitButton = within(dialog).getByRole('button', { name: /^create$/i });
    expect(submitButton).toBeDisabled();
  });

  it('should open edit dialog for custom role', () => {
    customRender(<RolesTab />);
    const editButtons = screen.getAllByTestId('icon-edit');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Edit Role')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Custom Role')).toBeInTheDocument();
  });

  it('should not allow editing system roles', () => {
    const { showErrorToast } = require('@/lib/toast');
    customRender(<RolesTab />);
    const systemRoleRow = screen.getByText('Organisation Member').closest('tr');
    expect(systemRoleRow).toBeInTheDocument();
  });

  it('should open delete confirmation dialog', () => {
    customRender(<RolesTab />);
    const deleteButtons = screen.getAllByTestId('icon-trash2');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Delete Role')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this role/i)).toBeInTheDocument();
  });

  it('should delete role successfully', async () => {
    customRender(<RolesTab />);
    const deleteButtons = screen.getAllByTestId('icon-trash2');
    fireEvent.click(deleteButtons[0]);

    const confirmButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteMutation.mutateAsync).toHaveBeenCalledWith('role-2');
    });
  });
});