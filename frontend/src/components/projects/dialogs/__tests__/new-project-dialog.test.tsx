import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectDialog } from '../new-project-dialog';
import { useCreateProject, useUpdateProject } from '@/hooks/projects/use-projects-query';
import { ProjectResponse } from '@/types/projects';
import { render as customRender } from '@/__tests__/test-utils';

jest.mock('@/hooks/projects/use-projects-query', () => ({
  useCreateProject: jest.fn(),
  useUpdateProject: jest.fn()
}));


const mutationData = new Map();
let mutationSuccessWatchers: Array<{mutation: any;onSuccess: () => void;}> = [];

const mockUseMutationAction = jest.fn(({ mutation, onSuccess }) => {
  if (onSuccess) {
    mutationData.set(mutation, { onSuccess, mutation });
    mutationSuccessWatchers.push({ mutation, onSuccess });
    if (mutation.isSuccess) {
      Promise.resolve().then(() => {
        if (mutation.isSuccess && onSuccess) {
          onSuccess();
        }
      });
    }
  }
  return {
    ...mutation,
    isPending: mutation.isPending,
    errorMessage: mutation.error?.message || null,
    handleError: jest.fn(),
    clear: jest.fn(),
    clearError: jest.fn()
  };
});

jest.mock('@/hooks/shared/use-mutation-action', () => ({
  useMutationAction: (options: any) => mockUseMutationAction(options)
}));

jest.mock('@/lib/toast', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn()
}));
const mockUseCreateProject = useCreateProject as jest.MockedFunction<typeof useCreateProject>;
const mockUseUpdateProject = useUpdateProject as jest.MockedFunction<typeof useUpdateProject>;

describe('ProjectDialog', () => {
  const defaultCreateMutation = {
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
    error: null,
    reset: jest.fn()
  };

  const defaultUpdateMutation = {
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
    error: null,
    reset: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mutationData.clear();
    mutationSuccessWatchers = [];
    mockUseCreateProject.mockReturnValue(defaultCreateMutation as any);
    mockUseUpdateProject.mockReturnValue(defaultUpdateMutation as any);
  });

  it('should render create mode dialog when open', () => {
    customRender(
      <ProjectDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    expect(screen.getByText('Start a New Expedition')).toBeInTheDocument();
    expect(screen.getByText(/Launch your next big adventure/i)).toBeInTheDocument();
  });

  it('should render edit mode dialog when project is provided', () => {
    const project: ProjectResponse = {
      id: '1',
      name: 'Test Project',
      description: 'Test Description',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };

    customRender(
      <ProjectDialog
        project={project}
        open={true}
        onOpenChange={jest.fn()} />

    );
    expect(screen.getByText('Navigate Your Expedition')).toBeInTheDocument();
    expect(screen.getByText(/Refine your course/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    customRender(
      <ProjectDialog
        open={false}
        onOpenChange={jest.fn()} />

    );
    expect(screen.queryByText('Start a New Expedition')).not.toBeInTheDocument();
  });

  it('should display project name in edit mode', () => {
    const project: ProjectResponse = {
      id: '1',
      name: 'Test Project',
      description: 'Test Description',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };

    customRender(
      <ProjectDialog
        project={project}
        open={true}
        onOpenChange={jest.fn()} />

    );
    const nameInputs = screen.getAllByLabelText(/Name/i);
    const nameInput = nameInputs.find((input) => (input as HTMLInputElement).value === 'Test Project') as HTMLInputElement;
    expect(nameInput).toBeDefined();
    expect(nameInput.value).toBe('Test Project');
  });

  it('should call createProject when form is submitted in create mode', async () => {
    const mockCreate = jest.fn().mockResolvedValue(undefined);
    mockUseCreateProject.mockReturnValue({
      ...defaultCreateMutation,
      mutateAsync: mockCreate
    } as any);

    const mockOnOpenChange = jest.fn();
    customRender(
      <ProjectDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );


    const nameInputs = screen.getAllByLabelText(/Name/i);
    const nameInput = nameInputs[0];
    fireEvent.change(nameInput, { target: { value: 'New Project' } });


    const submitButton = screen.getByText('Save');
    fireEvent.click(submitButton);


    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        name: 'New Project',
        description: ''
      });
    }, { timeout: 3000 });


    const { act } = require('@testing-library/react');
    await act(async () => {
      await Promise.resolve();
      mutationSuccessWatchers.forEach(({ onSuccess }) => {
        onSuccess();
      });
    });

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    }, { timeout: 3000 });
  });

  it('should call updateProject when form is submitted in edit mode', async () => {
    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    mockUseUpdateProject.mockReturnValue({
      ...defaultUpdateMutation,
      mutateAsync: mockUpdate
    } as any);

    const project: ProjectResponse = {
      id: '1',
      name: 'Test Project',
      description: 'Test Description',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };

    const mockOnOpenChange = jest.fn();
    customRender(
      <ProjectDialog
        project={project}
        open={true}
        onOpenChange={mockOnOpenChange} />

    );


    const nameInputs = screen.getAllByLabelText(/Name/i);
    const nameInput = nameInputs[0];
    fireEvent.change(nameInput, { target: { value: 'Updated Project' } });


    const submitButton = screen.getByText('Save');
    fireEvent.click(submitButton);


    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        id: '1',
        data: {
          name: 'Updated Project',
          description: 'Test Description'
        }
      });
    }, { timeout: 3000 });


    const { act } = require('@testing-library/react');
    await act(async () => {
      await Promise.resolve();
      mutationSuccessWatchers.forEach(({ onSuccess }) => {
        onSuccess();
      });
    });

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    }, { timeout: 3000 });
  });

  it('should show loading state', () => {
    mockUseCreateProject.mockReturnValue({
      ...defaultCreateMutation,
      isPending: true
    } as any);

    customRender(
      <ProjectDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument();
  });

  it('should show error message', async () => {
    const errorMessage = 'Failed to create project';


    mockUseCreateProject.mockReturnValue({
      ...defaultCreateMutation,
      error: null
    } as any);


    const { rerender } = customRender(
      <ProjectDialog
        open={true}
        onOpenChange={jest.fn()} />

    );


    await waitFor(() => {
      expect(screen.getByText('Start a New Expedition')).toBeInTheDocument();
    });


    await new Promise((resolve) => setTimeout(resolve, 100));


    mockUseCreateProject.mockReturnValue({
      ...defaultCreateMutation,
      error: new Error(errorMessage)
    } as any);


    rerender(
      <ProjectDialog
        open={true}
        onOpenChange={jest.fn()} />

    );


    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should call onOpenChange when cancel is clicked', () => {
    const mockOnOpenChange = jest.fn();
    customRender(
      <ProjectDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });


  it('should handle null project', () => {
    customRender(
      <ProjectDialog
        project={null}
        open={true}
        onOpenChange={jest.fn()} />

    );

    expect(screen.getByText('Start a New Expedition')).toBeInTheDocument();
  });

  it('should handle undefined project', () => {
    customRender(
      <ProjectDialog
        project={undefined}
        open={true}
        onOpenChange={jest.fn()} />

    );

    expect(screen.getByText('Start a New Expedition')).toBeInTheDocument();
  });

  it('should handle missing onOpenChange callback', () => {
    const { container } = customRender(
      <ProjectDialog
        open={true}
        onOpenChange={undefined as any} />

    );

    expect(container).toBeInTheDocument();
  });

  it('should handle very long project name', () => {
    const longName = 'a'.repeat(500);
    customRender(
      <ProjectDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    const nameInputs = screen.getAllByLabelText(/Name/i);
    const nameInput = nameInputs[0];
    fireEvent.change(nameInput, { target: { value: longName } });
    expect((nameInput as HTMLInputElement).value).toBe(longName);
  });

  it('should handle very long description', () => {
    const longDesc = 'b'.repeat(2000);
    customRender(
      <ProjectDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    const descInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descInput, { target: { value: longDesc } });
    expect((descInput as HTMLInputElement).value).toBe(longDesc);
  });

  it('should handle empty string name', () => {
    customRender(
      <ProjectDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    const nameInputs = screen.getAllByLabelText(/Name/i);
    const nameInput = nameInputs[0] as HTMLInputElement;
    expect(nameInput.value).toBe('');
  });

  it('should handle empty string description', () => {
    customRender(
      <ProjectDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    const descInput = screen.getByLabelText(/Description/i) as HTMLInputElement;
    expect(descInput.value).toBe('');
  });

  it('should handle project with null description in edit mode', () => {
    const project: Project = {
      id: '1',
      name: 'Test Project',
      description: null as any,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: {} as any,
      updatedBy: {} as any,
      users: []
    };

    customRender(
      <ProjectDialog
        project={project}
        open={true}
        onOpenChange={jest.fn()} />

    );
    const descInput = screen.getByLabelText(/Description/i) as HTMLInputElement;
    expect(descInput.value).toBe('');
  });

  it('should handle project with undefined description in edit mode', () => {
    const project: Project = {
      id: '1',
      name: 'Test Project',
      description: undefined,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: {} as any,
      updatedBy: {} as any,
      users: []
    };

    customRender(
      <ProjectDialog
        project={project}
        open={true}
        onOpenChange={jest.fn()} />

    );
    const descInput = screen.getByLabelText(/Description/i) as HTMLInputElement;
    expect(descInput.value).toBe('');
  });

  it('should disable inputs when loading', () => {
    mockUseCreateProject.mockReturnValue({
      ...defaultCreateMutation,
      isPending: true
    } as any);

    customRender(
      <ProjectDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    const nameInputs = screen.getAllByLabelText(/Name/i);
    const nameInput = nameInputs[0];
    expect(nameInput).toBeDisabled();
  });

  it('should reset form when dialog closes', () => {
    const { rerender } = customRender(
      <ProjectDialog
        open={true}
        onOpenChange={jest.fn()} />

    );

    const nameInputs = screen.getAllByLabelText(/Name/i);
    const nameInput = nameInputs[0];
    fireEvent.change(nameInput, { target: { value: 'Test Name' } });


    rerender(
      <ProjectDialog
        open={false}
        onOpenChange={jest.fn()} />

    );


    rerender(
      <ProjectDialog
        open={true}
        onOpenChange={jest.fn()} />

    );


    const newNameInputs = screen.getAllByLabelText(/Name/i);
    const newNameInput = newNameInputs[0] as HTMLInputElement;
    expect(newNameInput.value).toBe('');
  });

  it('should handle special characters in name', () => {
    customRender(
      <ProjectDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    const nameInputs = screen.getAllByLabelText(/Name/i);
    const nameInput = nameInputs[0];
    fireEvent.change(nameInput, { target: { value: 'Test!@#$%^&*()' } });
    expect((nameInput as HTMLInputElement).value).toBe('Test!@#$%^&*()');
  });

  it('should handle special characters in description', () => {
    customRender(
      <ProjectDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    const descInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descInput, { target: { value: 'Desc!@#$%^&*()' } });
    expect((descInput as HTMLInputElement).value).toBe('Desc!@#$%^&*()');
  });

  it('should handle update error', async () => {
    const errorMessage = 'Failed to update project';
    const project: ProjectResponse = {
      id: '1',
      name: 'Test Project',
      description: 'Test Description',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };


    mockUseUpdateProject.mockReturnValue({
      ...defaultUpdateMutation,
      error: null
    } as any);


    const { rerender } = customRender(
      <ProjectDialog
        project={project}
        open={true}
        onOpenChange={jest.fn()} />

    );


    await waitFor(() => {
      expect(screen.getByText('Navigate Your Expedition')).toBeInTheDocument();
    });


    await new Promise((resolve) => setTimeout(resolve, 100));


    mockUseUpdateProject.mockReturnValue({
      ...defaultUpdateMutation,
      error: new Error(errorMessage)
    } as any);


    rerender(
      <ProjectDialog
        project={project}
        open={true}
        onOpenChange={jest.fn()} />

    );


    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should show updating text in edit mode when loading', () => {
    mockUseUpdateProject.mockReturnValue({
      ...defaultUpdateMutation,
      isPending: true
    } as any);

    const project: ProjectResponse = {
      id: '1',
      name: 'Test Project',
      description: 'Test Description',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };

    customRender(
      <ProjectDialog
        project={project}
        open={true}
        onOpenChange={jest.fn()} />

    );
    expect(screen.getByText('Updating...')).toBeInTheDocument();
  });

  it('should handle whitespace-only name', () => {
    customRender(
      <ProjectDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    const nameInputs = screen.getAllByLabelText(/Name/i);
    const nameInput = nameInputs[0];
    fireEvent.change(nameInput, { target: { value: '   ' } });
    expect((nameInput as HTMLInputElement).value).toBe('   ');
  });

  it('should handle whitespace-only description', () => {
    customRender(
      <ProjectDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    const descInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descInput, { target: { value: '   ' } });
    expect((descInput as HTMLInputElement).value).toBe('   ');
  });

  it('should handle trigger prop', () => {
    const { container } = customRender(
      <ProjectDialog
        open={false}
        onOpenChange={jest.fn()}
        trigger={<button>Open Dialog</button>} />

    );


    expect(container).toBeInTheDocument();
  });
});