import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useOrganisationUsers,
  useInviteOrganisationUser,
  useChangeOrganisationUserRole,
  useRemoveOrganisationUser,
  useOrganisationRoles,
  useCreateOrganisationRole,
  useUpdateOrganisationRole,
  useDeleteOrganisationRole,
  useOrganisationAuditLogs } from
'../use-organisation-config-query';
import { organisationsApi } from '@/api/organisations';

jest.mock('@/api/organisations');
jest.mock('@/hooks/useOrganisation', () => ({
  useOrganisationIdOrNull: jest.fn(() => 'org-1')
}));

const mockOrganisationsApi = organisationsApi as jest.Mocked<typeof organisationsApi>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  return ({ children }: {children: React.ReactNode;}) =>
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

};

describe('useOrganisationUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch organisation users', async () => {
    const mockUsers = [
    {
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
      role: {
        id: 'role-1',
        name: 'Member',
        permissions: [],
        isSystemRole: true,
        isInstanceLevel: false,
        organisationId: 'org-1',
        projectId: null,
        canDelete: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }];


    mockOrganisationsApi.getUsers.mockResolvedValue(mockUsers);

    const { result } = renderHook(() => useOrganisationUsers(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUsers);
    expect(mockOrganisationsApi.getUsers).toHaveBeenCalledWith('org-1');
  });
});

describe('useInviteOrganisationUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should invite user', async () => {
    mockOrganisationsApi.inviteUser.mockResolvedValue({
      message: 'User added successfully'
    });

    const { result } = renderHook(() => useInviteOrganisationUser(), {
      wrapper: createWrapper()
    });

    await act(async () => {
      await result.current.mutateAsync({
        email: 'newuser@example.com',
        roleId: 'role-1'
      });
    });

    expect(mockOrganisationsApi.inviteUser).toHaveBeenCalledWith('org-1', {
      email: 'newuser@example.com',
      roleId: 'role-1'
    });
  });
});

describe('useChangeOrganisationUserRole', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should change user role', async () => {
    mockOrganisationsApi.changeUserRole.mockResolvedValue({
      message: 'Role updated successfully'
    });

    const { result } = renderHook(() => useChangeOrganisationUserRole(), {
      wrapper: createWrapper()
    });

    await act(async () => {
      await result.current.mutateAsync({
        userId: 'user-1',
        roleId: 'role-2'
      });
    });

    expect(mockOrganisationsApi.changeUserRole).toHaveBeenCalledWith(
      'org-1',
      'user-1',
      'role-2'
    );
  });
});

describe('useRemoveOrganisationUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should remove user', async () => {
    mockOrganisationsApi.removeUser.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRemoveOrganisationUser(), {
      wrapper: createWrapper()
    });

    await act(async () => {
      await result.current.mutateAsync('user@example.com');
    });

    expect(mockOrganisationsApi.removeUser).toHaveBeenCalledWith('org-1', {
      email: 'user@example.com'
    });
  });
});

describe('useOrganisationRoles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch organisation roles', async () => {
    const mockRoles = [
    {
      id: 'role-1',
      name: 'Member',
      permissions: ['organisations:read'],
      isSystemRole: true,
      isInstanceLevel: false,
      organisationId: 'org-1',
      projectId: null,
      canDelete: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }];


    mockOrganisationsApi.getRoles.mockResolvedValue(mockRoles);

    const { result } = renderHook(() => useOrganisationRoles(), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockRoles);
    expect(mockOrganisationsApi.getRoles).toHaveBeenCalledWith('org-1');
  });
});

describe('useCreateOrganisationRole', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create role', async () => {
    const mockRole = {
      id: 'role-3',
      name: 'New Role',
      permissions: ['organisations:read'],
      isSystemRole: false,
      isInstanceLevel: false,
      organisationId: 'org-1',
      projectId: null,
      canDelete: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockOrganisationsApi.createRole.mockResolvedValue(mockRole);

    const { result } = renderHook(() => useCreateOrganisationRole(), {
      wrapper: createWrapper()
    });

    await act(async () => {
      await result.current.mutateAsync({
        name: 'New Role',
        permissions: ['organisations:read']
      });
    });

    expect(mockOrganisationsApi.createRole).toHaveBeenCalledWith('org-1', {
      name: 'New Role',
      permissions: ['organisations:read']
    });
  });
});

describe('useUpdateOrganisationRole', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update role', async () => {
    const mockRole = {
      id: 'role-2',
      name: 'Updated Role',
      permissions: ['organisations:read'],
      isSystemRole: false,
      isInstanceLevel: false,
      organisationId: 'org-1',
      projectId: null,
      canDelete: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockOrganisationsApi.updateRole.mockResolvedValue(mockRole);

    const { result } = renderHook(() => useUpdateOrganisationRole(), {
      wrapper: createWrapper()
    });

    await act(async () => {
      await result.current.mutateAsync({
        roleId: 'role-2',
        data: {
          name: 'Updated Role',
          permissions: ['organisations:read']
        }
      });
    });

    expect(mockOrganisationsApi.updateRole).toHaveBeenCalledWith(
      'org-1',
      'role-2',
      {
        name: 'Updated Role',
        permissions: ['organisations:read']
      }
    );
  });
});

describe('useDeleteOrganisationRole', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete role', async () => {
    mockOrganisationsApi.deleteRole.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteOrganisationRole(), {
      wrapper: createWrapper()
    });

    await act(async () => {
      await result.current.mutateAsync('role-2');
    });

    expect(mockOrganisationsApi.deleteRole).toHaveBeenCalledWith('org-1', 'role-2');
  });
});

describe('useOrganisationAuditLogs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch audit logs with paginated response', async () => {
    const mockLogs = [
    {
      id: 'log-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      action: 'organisation.user.added',
      actorId: 'actor-1',
      actorType: 'user',
      resourceType: 'organisation_membership',
      resourceId: 'resource-1',
      organisationId: 'org-1',
      projectId: null,
      beforeState: null,
      afterState: {},
      metadata: {}
    }];


    const mockPaginatedResponse = {
      data: mockLogs,
      nextCursor: '2024-01-01T00:00:00.000Z',
      hasMore: true,
      limit: 50
    };

    mockOrganisationsApi.getAuditLogs.mockResolvedValue(mockPaginatedResponse);

    const { result } = renderHook(
      () => useOrganisationAuditLogs({ action: 'organisation.*' }),
      {
        wrapper: createWrapper()
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });


    expect(result.current.data).toEqual({
      data: mockLogs,
      nextCursor: '2024-01-01T00:00:00.000Z',
      hasMore: true,
      limit: 50
    });
    expect(mockOrganisationsApi.getAuditLogs).toHaveBeenCalledWith(
      'org-1',
      expect.objectContaining({ action: 'organisation.*' })
    );
  });

  it('should handle paginated response with no more results', async () => {
    const mockLogs = [
    {
      id: 'log-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      action: 'organisation.user.added',
      actorId: 'actor-1',
      actorType: 'user',
      resourceType: 'organisation_membership',
      resourceId: 'resource-1',
      organisationId: 'org-1',
      projectId: null,
      beforeState: null,
      afterState: {},
      metadata: {}
    }];


    const mockPaginatedResponse = {
      data: mockLogs,
      nextCursor: null,
      hasMore: false,
      limit: 50
    };

    mockOrganisationsApi.getAuditLogs.mockResolvedValue(mockPaginatedResponse);

    const { result } = renderHook(
      () => useOrganisationAuditLogs({ action: 'organisation.*', cursor: '2024-01-01T00:00:00.000Z' }),
      {
        wrapper: createWrapper()
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      data: mockLogs,
      nextCursor: null,
      hasMore: false,
      limit: 50
    });
    expect(mockOrganisationsApi.getAuditLogs).toHaveBeenCalledWith(
      'org-1',
      expect.objectContaining({
        action: 'organisation.*',
        cursor: '2024-01-01T00:00:00.000Z'
      })
    );
  });
});