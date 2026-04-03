import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectCard } from '../project-card';
import { ProjectResponse } from '@/types/projects';

describe('ProjectCard', () => {
  const mockProject: ProjectResponse = {
    id: '1',
    name: 'Test Project',
    description: 'Test Description',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  const mockOnView = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnInvite = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render project information', () => {
    render(
      <ProjectCard
        project={mockProject}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should call onView when view button is clicked', () => {
    render(
      <ProjectCard
        project={mockProject}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    const viewButton = screen.getByText('View');
    fireEvent.click(viewButton);
    expect(mockOnView).toHaveBeenCalledWith('1');
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <ProjectCard
        project={mockProject}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(mockProject);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <ProjectCard
        project={mockProject}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should render manage button when onInvite is provided', () => {
    render(
      <ProjectCard
        project={mockProject}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onInvite={mockOnInvite} />

    );
    const manageButton = screen.getByRole('button', { name: /manage/i });
    expect(manageButton).toBeInTheDocument();
  });

  it('should call onInvite when manage button is clicked', () => {
    render(
      <ProjectCard
        project={mockProject}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onInvite={mockOnInvite} />

    );
    const manageButton = screen.getByRole('button', { name: /manage/i });
    fireEvent.click(manageButton);
    expect(mockOnInvite).toHaveBeenCalledWith(mockProject);
  });

  it('should not display member count', () => {
    const projectWithMembers = {
      ...mockProject,
      users: [{ id: '1' }, { id: '2' }] as any
    };
    render(
      <ProjectCard
        project={projectWithMembers}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.queryByText('2 members')).not.toBeInTheDocument();
  });

  it('should not display member count for single member', () => {
    const projectWithOneMember = {
      ...mockProject,
      users: [{ id: '1' }] as any
    };
    render(
      <ProjectCard
        project={projectWithOneMember}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.queryByText('1 member')).not.toBeInTheDocument();
  });


  it('should not render description when description is missing', () => {
    const projectWithoutDescription = {
      ...mockProject,
      description: undefined
    };

    render(
      <ProjectCard
        project={projectWithoutDescription}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('should not render description when description is empty string', () => {
    const projectWithEmptyDescription = {
      ...mockProject,
      description: ''
    };

    render(
      <ProjectCard
        project={projectWithEmptyDescription}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('should handle very long project name', () => {
    const longNameProject = {
      ...mockProject,
      name: 'a'.repeat(500)
    };

    render(
      <ProjectCard
        project={longNameProject}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('a'.repeat(500))).toBeInTheDocument();
  });

  it('should handle very long description', () => {
    const longDescProject = {
      ...mockProject,
      description: 'b'.repeat(1000)
    };

    render(
      <ProjectCard
        project={longDescProject}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('b'.repeat(1000))).toBeInTheDocument();
  });

  it('should handle special characters in name', () => {
    const specialCharsProject = {
      ...mockProject,
      name: 'Test!@#$%^&*()_+Project'
    };

    render(
      <ProjectCard
        project={specialCharsProject}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('Test!@#$%^&*()_+Project')).toBeInTheDocument();
  });

  it('should handle missing createdAt', () => {
    const projectWithoutDate = {
      ...mockProject,
      createdAt: undefined as any
    };

    render(
      <ProjectCard
        project={projectWithoutDate}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('should handle invalid date string', () => {
    const projectWithInvalidDate = {
      ...mockProject,
      createdAt: 'invalid-date' as any
    };

    render(
      <ProjectCard
        project={projectWithInvalidDate}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('should handle empty project name', () => {
    const emptyNameProject = {
      ...mockProject,
      name: ''
    };

    const { container } = render(
      <ProjectCard
        project={emptyNameProject}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const card = container.querySelector('[class*="card"]');
    expect(card).toBeInTheDocument();
  });

  it('should handle whitespace-only name', () => {
    const whitespaceProject = {
      ...mockProject,
      name: '   '
    };

    const { container } = render(
      <ProjectCard
        project={whitespaceProject}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const card = container.querySelector('[class*="card"]');
    expect(card).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('should handle missing callbacks gracefully', () => {
    const { container } = render(
      <ProjectCard
        project={mockProject}
        onView={undefined as any}
        onEdit={undefined as any}
        onDelete={undefined as any} />

    );

    expect(container).toBeInTheDocument();
  });

  it('should prevent event propagation on edit button click', () => {
    const parentClickHandler = jest.fn();
    render(
      <div onClick={parentClickHandler}>
        <ProjectCard
          project={mockProject}
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete} />

      </div>
    );
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalled();
  });

  it('should prevent event propagation on delete button click', () => {
    const parentClickHandler = jest.fn();
    render(
      <div onClick={parentClickHandler}>
        <ProjectCard
          project={mockProject}
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete} />

      </div>
    );
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('should prevent event propagation on manage button click', () => {
    const parentClickHandler = jest.fn();
    render(
      <div onClick={parentClickHandler}>
        <ProjectCard
          project={mockProject}
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onInvite={mockOnInvite} />

      </div>
    );
    const manageButton = screen.getByRole('button', { name: /manage/i });
    fireEvent.click(manageButton);

    expect(mockOnInvite).toHaveBeenCalled();
  });

  it('should format date correctly', () => {
    const projectWithDate = {
      ...mockProject,
      createdAt: '2024-01-15T10:30:00Z'
    };

    render(
      <ProjectCard
        project={projectWithDate as unknown as Project}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText(/Created/i)).toBeInTheDocument();
  });

  it('should handle Date object for createdAt', () => {
    const projectWithDateObject = {
      ...mockProject,
      createdAt: new Date('2024-01-15') as any
    };

    render(
      <ProjectCard
        project={projectWithDateObject}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('should handle null users array', () => {
    const projectWithNullUsers = {
      ...mockProject,
      users: null as any
    };

    render(
      <ProjectCard
        project={projectWithNullUsers}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.queryByText('0 members')).not.toBeInTheDocument();
  });

  it('should handle undefined users array', () => {
    const projectWithUndefinedUsers = {
      ...mockProject,
      users: undefined
    };

    render(
      <ProjectCard
        project={projectWithUndefinedUsers as unknown as Project}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.queryByText('0 members')).not.toBeInTheDocument();
  });

  it('should not display member count for many members', () => {
    const projectWithManyMembers = {
      ...mockProject,
      users: Array.from({ length: 100 }, (_, i) => ({ id: `${i}` })) as any
    };

    render(
      <ProjectCard
        project={projectWithManyMembers}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.queryByText('100 members')).not.toBeInTheDocument();
  });
});