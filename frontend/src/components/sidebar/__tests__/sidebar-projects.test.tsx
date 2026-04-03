import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarProjects } from '../sidebar-projects';
import { ProjectResponse } from '@/types/projects';

describe('SidebarProjects', () => {
  const mockProjects: ProjectResponse[] = [
  { id: '1', name: 'Project 1', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
  { id: '2', name: 'Project 2', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') }];


  const mockOnProjectChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render projects link when expanded', () => {
    render(
      <SidebarProjects
        isCollapsed={false}
        projects={mockProjects}
        selectedProjectId="1"
        onProjectChange={mockOnProjectChange} />

    );

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Configurations')).toBeInTheDocument();
  });

  it('should hide text when collapsed', () => {
    render(
      <SidebarProjects
        isCollapsed={true}
        projects={mockProjects}
        selectedProjectId="1"
        onProjectChange={mockOnProjectChange} />

    );

    expect(screen.queryByText('Projects')).not.toBeInTheDocument();
  });

  it('should render project selector when expanded and project is selected', () => {
    render(
      <SidebarProjects
        isCollapsed={false}
        projects={mockProjects}
        selectedProjectId="1"
        onProjectChange={mockOnProjectChange} />

    );

    expect(screen.getByText('PROJECT 1')).toBeInTheDocument();
  });

  it('should not render project selector when collapsed', () => {
    render(
      <SidebarProjects
        isCollapsed={true}
        projects={mockProjects}
        selectedProjectId="1"
        onProjectChange={mockOnProjectChange} />

    );

    expect(screen.queryByText('PROJECT 1')).not.toBeInTheDocument();
  });

  it('should not render project selector when no projects', () => {
    render(
      <SidebarProjects
        isCollapsed={false}
        projects={[]}
        selectedProjectId={null}
        onProjectChange={mockOnProjectChange} />

    );

    expect(screen.queryByText('PROJECT')).not.toBeInTheDocument();
  });

  it('should call onProjectChange when project is selected', () => {
    render(
      <SidebarProjects
        isCollapsed={false}
        projects={mockProjects}
        selectedProjectId="1"
        onProjectChange={mockOnProjectChange} />

    );


    const selectTrigger = screen.getByText('PROJECT 1');
    fireEvent.click(selectTrigger);
    expect(selectTrigger).toBeInTheDocument();
  });
});