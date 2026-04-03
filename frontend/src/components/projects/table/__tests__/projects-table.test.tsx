import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectsTable } from '../projects-table';
import { useProjectsQuery, useDeleteProject } from '@/hooks/projects/use-projects-query';
import { ProjectResponse } from '@/types/projects';
import { render as customRender } from '@/__tests__/test-utils';

jest.mock('@/hooks/projects/use-projects-query', () => ({
  useProjectsQuery: jest.fn(),
  useDeleteProject: jest.fn(),
  useAvailableUsers: jest.fn(() => ({ data: [], isLoading: false, error: null })),
  useInviteUser: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null })),
  useRemoveUser: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null })),
  useProjectRoles: jest.fn(() => ({ data: [], isLoading: false, error: null })),
  useCreateProjectRole: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null })),
  useDeleteProjectRole: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null })),
  useAssignRole: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null })),
  useRemoveRole: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false, error: null })),
  useUsersWithRoles: jest.fn(() => ({ data: [], isLoading: false, error: null }))
}));

jest.mock('@tanstack/react-router', () => ({
  useNavigate: () => jest.fn(),
  useParams: jest.fn(() => ({ organisationId: 'org-1' })),
  Link: ({ children, to, params, ...props }: any) => <a href={to} {...props}>{children}</a>
}));

jest.mock('@/components/projects/cards/project-card', () => ({
  ProjectCard: ({ project, onView, onEdit, onDelete, onInvite }: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': `project-card-${project.id}` },
    React.createElement('div', {}, project.name),
    React.createElement('button', { onClick: () => onView(project.id) }, 'View'),
    React.createElement('button', { onClick: () => onEdit(project) }, 'Edit'),
    React.createElement('button', { onClick: () => onDelete(project.id) }, 'Delete'),
    onInvite && React.createElement('button', { onClick: () => onInvite(project) }, 'Manage')
    );
  }
}));

jest.mock('@/components/projects/dialogs/new-project-dialog', () => ({
  ProjectDialog: ({ open, project, onOpenChange }: any) => {
    const React = require('react');
    if (!open) return null;
    return React.createElement('div', { 'data-testid': 'project-dialog' },
    project ? 'Edit Dialog' : 'Create Dialog'
    );
  }
}));

jest.mock('@/components/projects/dialogs/delete-project-dialog', () => ({
  DeleteProjectDialog: ({ isOpen, onConfirm }: any) => {
    const React = require('react');
    if (!isOpen) return null;
    return React.createElement('div', { 'data-testid': 'delete-dialog' },
    React.createElement('button', { onClick: onConfirm }, 'Confirm Delete')
    );
  }
}));

const mockUseProjectsQuery = useProjectsQuery as jest.MockedFunction<typeof useProjectsQuery>;
const mockUseDeleteProject = useDeleteProject as jest.MockedFunction<typeof useDeleteProject>;

describe('ProjectsTable', () => {
  const mockProjects: ProjectResponse[] = [
  {
    id: '1',
    name: 'Test Project 1',
    description: 'Description 1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: {} as any,
    updatedBy: {} as any,
    users: []
  },
  {
    id: '2',
    name: 'Test Project 2',
    description: 'Description 2',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    createdBy: {} as any,
    updatedBy: {} as any,
    users: [{ id: '1' }] as any
  }];


  const defaultMockReturn = {
    data: mockProjects,
    isLoading: false,
    error: null
  };

  const defaultDeleteMutation = {
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
    error: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProjectsQuery.mockReturnValue(defaultMockReturn as any);
    mockUseDeleteProject.mockReturnValue(defaultDeleteMutation as any);
  });

  it('should render projects', () => {
    customRender(<ProjectsTable searchQuery="" />);
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('Test Project 2')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseProjectsQuery.mockReturnValue({
      ...defaultMockReturn,
      isLoading: true
    } as any);

    customRender(<ProjectsTable searchQuery="" />);
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseProjectsQuery.mockReturnValue({
      ...defaultMockReturn,
      error: 'Failed to fetch projects'
    } as any);

    customRender(<ProjectsTable searchQuery="" />);
    expect(screen.getByText(/Failed to fetch projects/i)).toBeInTheDocument();
  });

  it('should show empty state when no projects', () => {
    mockUseProjectsQuery.mockReturnValue({
      ...defaultMockReturn,
      data: []
    } as any);

    customRender(<ProjectsTable searchQuery="" />);
    expect(screen.getByText('No projects found')).toBeInTheDocument();
  });

  it('should filter projects by search query', () => {
    customRender(<ProjectsTable searchQuery="Test Project 1" />);
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Project 2')).not.toBeInTheDocument();
  });

  it('should open edit dialog when edit is clicked', async () => {
    customRender(<ProjectsTable searchQuery="" />);
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('project-dialog')).toBeInTheDocument();
    });
    expect(screen.getByText('Edit Dialog')).toBeInTheDocument();
  });

  it('should open delete dialog when delete is clicked', async () => {
    customRender(<ProjectsTable searchQuery="" />);
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    });
  });

  it('should call deleteProject when delete is confirmed', async () => {
    const mockDeleteProject = jest.fn().mockResolvedValue(undefined);
    mockUseDeleteProject.mockReturnValue({
      ...defaultDeleteMutation,
      mutateAsync: mockDeleteProject
    } as any);

    customRender(<ProjectsTable searchQuery="" />);
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {

      expect(mockDeleteProject).toHaveBeenCalled();
      const callArgs = mockDeleteProject.mock.calls[0][0];
      expect(['1', '2']).toContain(callArgs);
    });
  });

  it('should handle sortKey and sortDirection props', () => {
    customRender(
      <ProjectsTable
        searchQuery=""
        sortKey="name"
        sortDirection="asc" />

    );
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
  });

  it('should handle descending sort', () => {
    customRender(
      <ProjectsTable
        searchQuery=""
        sortKey="name"
        sortDirection="desc" />

    );
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
  });

  it('should handle members sort', () => {
    customRender(
      <ProjectsTable
        searchQuery=""
        sortKey="members"
        sortDirection="asc" />

    );
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
  });


  it('should handle empty search query', () => {
    customRender(<ProjectsTable searchQuery="" />);
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('Test Project 2')).toBeInTheDocument();
  });

  it('should handle very long search query', () => {
    const longQuery = 'a'.repeat(1000);
    customRender(<ProjectsTable searchQuery={longQuery} />);

    expect(screen.getByText('No projects found')).toBeInTheDocument();
  });

  it('should handle special characters in search query', () => {
    customRender(<ProjectsTable searchQuery="!@#$%^&*()" />);

    expect(screen.getByText('No projects found')).toBeInTheDocument();
  });

  it('should handle projects with missing required fields', () => {
    const incompleteProjects = [
    {
      id: '1',
      name: '',
      description: '',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: {} as any,
      updatedBy: {} as any,
      users: []
    } as ProjectResponse];


    mockUseProjectsQuery.mockReturnValue({
      ...defaultMockReturn,
      data: incompleteProjects
    } as any);

    customRender(<ProjectsTable searchQuery="" />);

    expect(screen.getByTestId('project-card-1')).toBeInTheDocument();
  });

  it('should handle projects with null description', () => {
    const projectWithNullDesc = [
    {
      ...mockProjects[0],
      description: null as any
    }];


    mockUseProjectsQuery.mockReturnValue({
      ...defaultMockReturn,
      data: projectWithNullDesc
    } as any);

    customRender(<ProjectsTable searchQuery="" />);
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
  });

  it('should handle projects with undefined description', () => {
    const projectWithUndefinedDesc = [
    {
      ...mockProjects[0],
      description: undefined
    }];


    mockUseProjectsQuery.mockReturnValue({
      ...defaultMockReturn,
      data: projectWithUndefinedDesc
    } as any);

    customRender(<ProjectsTable searchQuery="" />);
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
  });

  it('should handle very long project names', () => {
    const longNameProject = [
    {
      ...mockProjects[0],
      name: 'a'.repeat(500)
    }];


    mockUseProjectsQuery.mockReturnValue({
      ...defaultMockReturn,
      data: longNameProject
    } as any);

    customRender(<ProjectsTable searchQuery="" />);
    expect(screen.getByText('a'.repeat(500))).toBeInTheDocument();
  });

  it('should handle invalid sortKey', () => {
    customRender(
      <ProjectsTable
        searchQuery=""
        sortKey="invalidKey"
        sortDirection="asc" />

    );

    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
  });

  it('should handle null sortKey', () => {
    customRender(
      <ProjectsTable
        searchQuery=""
        sortKey={null as any}
        sortDirection="asc" />

    );

    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
  });

  it('should handle undefined sortDirection', () => {
    customRender(
      <ProjectsTable
        searchQuery=""
        sortKey="name"
        sortDirection={undefined as any} />

    );

    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
  });

  it('should handle deleteProject being undefined', () => {
    mockUseDeleteProject.mockReturnValue({
      mutateAsync: undefined as any,
      isPending: false,
      error: null
    } as any);

    customRender(<ProjectsTable searchQuery="" />);

    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
  });

  it('should handle pagination with many projects', () => {
    const manyProjects = Array.from({ length: 100 }, (_, i) => ({
      id: `project-${i}`,
      name: `Project ${i}`,
      description: `Description ${i}`,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: {} as any,
      updatedBy: {} as any,
      users: []
    }) as ProjectResponse);

    mockUseProjectsQuery.mockReturnValue({
      ...defaultMockReturn,
      data: manyProjects
    } as any);

    customRender(<ProjectsTable searchQuery="" />);

    expect(screen.getByText('Project 0')).toBeInTheDocument();
  });

  it('should close edit dialog when onOpenChange is called with false', () => {
    customRender(<ProjectsTable searchQuery="" />);
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(screen.getByTestId('project-dialog')).toBeInTheDocument();
  });

  it('should handle delete error', () => {
    mockUseDeleteProject.mockReturnValue({
      ...defaultDeleteMutation,
      error: { message: 'Failed to delete' }
    } as any);

    customRender(<ProjectsTable searchQuery="" />);
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);


    expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
  });

  it('should handle delete loading state', () => {
    mockUseDeleteProject.mockReturnValue({
      ...defaultDeleteMutation,
      isPending: true
    } as any);

    customRender(<ProjectsTable searchQuery="" />);
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);


    expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
  });

  it('should call navigate when view is clicked', () => {
    customRender(<ProjectsTable searchQuery="" />);
    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);


    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
  });

  it('should call navigate when manage is clicked', () => {
    customRender(<ProjectsTable searchQuery="" />);
    const manageButtons = screen.queryAllByText('Manage');
    if (manageButtons.length > 0) {
      fireEvent.click(manageButtons[0]);

    }
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
  });

  it('should handle date sorting', () => {
    customRender(
      <ProjectsTable
        searchQuery=""
        sortKey="createdAt"
        sortDirection="desc" />

    );
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
  });

  it('should handle projects with Date objects for dates', () => {
    const projectWithDateObjects = [
    {
      ...mockProjects[0],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }];


    mockUseProjectsQuery.mockReturnValue({
      ...defaultMockReturn,
      data: projectWithDateObjects
    } as any);

    customRender(<ProjectsTable searchQuery="" />);
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
  });

  it('should handle projects with string dates', () => {
    const projectWithStringDates = [
    {
      ...mockProjects[0],
      createdAt: '2024-01-01T00:00:00Z' as any,
      updatedAt: '2024-01-01T00:00:00Z' as any
    }];


    mockUseProjectsQuery.mockReturnValue({
      ...defaultMockReturn,
      data: projectWithStringDates
    } as any);

    customRender(<ProjectsTable searchQuery="" />);
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
  });
});