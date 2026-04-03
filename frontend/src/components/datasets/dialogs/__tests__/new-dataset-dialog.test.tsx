import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DatasetDialog } from '../new-dataset-dialog';
import { DatasetListItemResponse } from '@/types/datasets';

const mockCreateMutation = {
  mutateAsync: jest.fn().mockResolvedValue(undefined),
  isPending: false,
  error: null,
  reset: jest.fn()
};
const mockUpdateMutation = {
  mutateAsync: jest.fn().mockResolvedValue(undefined),
  isPending: false,
  error: null,
  reset: jest.fn()
};

jest.mock('@/hooks/datasets/use-datasets-query', () => ({
  useCreateDataset: jest.fn(() => mockCreateMutation),
  useUpdateDataset: jest.fn(() => mockUpdateMutation)
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

const mockUseCreateDataset = require('@/hooks/datasets/use-datasets-query').useCreateDataset;
const mockUseUpdateDataset = require('@/hooks/datasets/use-datasets-query').useUpdateDataset;

describe('DatasetDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mutationData.clear();
    mutationSuccessWatchers = [];
    mockUseCreateDataset.mockReturnValue(mockCreateMutation);
    mockUseUpdateDataset.mockReturnValue(mockUpdateMutation);
  });

  it('should render create mode dialog when open', () => {
    render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.getByText('Create New Dataset')).toBeInTheDocument();
    expect(screen.getByText(/Create a new dataset for your project/i)).toBeInTheDocument();
  });

  it('should render edit mode dialog when dataset is provided', () => {
    const dataset: DatasetListItemResponse = {
      id: '1',
      name: 'Test Dataset',
      description: 'Test Description',
      createdAt: '2024-01-01'
    } as unknown as DatasetListItemDto;

    render(
      <DatasetDialog
        dataset={dataset}
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.getByText('Edit Dataset')).toBeInTheDocument();
    expect(screen.getByText(/Update your dataset details/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <DatasetDialog
        open={false}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.queryByText('Create New Dataset')).not.toBeInTheDocument();
  });

  it('should display dataset name in edit mode', () => {
    const dataset: DatasetListItemResponse = {
      id: '1',
      name: 'Test Dataset',
      description: 'Test Description',
      createdAt: '2024-01-01'
    } as unknown as DatasetListItemDto;

    render(
      <DatasetDialog
        dataset={dataset}
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    expect(nameInput.value).toBe('Test Dataset');
  });

  it('should allow adding columns in create mode', () => {
    render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    const addButton = screen.getByText('Add Column');
    fireEvent.click(addButton);


    const columnInputs = screen.getAllByPlaceholderText(/Column \d+ name/i);
    expect(columnInputs.length).toBeGreaterThan(1);
  });

  it('should allow removing columns in create mode', () => {
    render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );

    const addButton = screen.getByText('Add Column');
    fireEvent.click(addButton);


    const removeButtons = screen.getAllByRole('button');
    const removeButton = removeButtons.find((btn) => {
      const icon = btn.querySelector('svg[data-testid*="icon-x"]');
      return icon !== null;
    });
    if (removeButton) {
      fireEvent.click(removeButton);
    }
  });

  it('should not show columns section in edit mode', () => {
    const dataset: DatasetListItemResponse = {
      id: '1',
      name: 'Test Dataset',
      description: 'Test Description',
      createdAt: '2024-01-01'
    } as unknown as DatasetListItemDto;

    render(
      <DatasetDialog
        dataset={dataset}
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.queryByText('Add Column')).not.toBeInTheDocument();
  });

  it('should show validation message when no columns are filled', () => {
    render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.getByText(/At least one column is required/i)).toBeInTheDocument();
  });

  it('should disable submit button when no valid columns in create mode', () => {
    render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    const submitButton = screen.getByText('Save');
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when column is filled', () => {
    render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    const columnInput = screen.getByPlaceholderText('Column 1 name');
    fireEvent.change(columnInput, { target: { value: 'Column Name' } });

    const submitButton = screen.getByText('Save');
    expect(submitButton).not.toBeDisabled();
  });

  it('should call createDataset when form is submitted in create mode', async () => {
    const mockCreateDataset = jest.fn().mockResolvedValue(undefined);
    mockUseCreateDataset.mockReturnValue({
      ...mockCreateMutation,
      mutateAsync: mockCreateDataset
    } as any);

    const mockOnOpenChange = jest.fn();
    render(
      <DatasetDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );


    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'New Dataset' } });

    const columnInput = screen.getByPlaceholderText('Column 1 name');
    fireEvent.change(columnInput, { target: { value: 'Column 1' } });


    const submitButton = screen.getByText('Save');
    fireEvent.click(submitButton);


    await waitFor(() => {
      expect(mockCreateDataset).toHaveBeenCalledWith({
        name: 'New Dataset',
        description: '',
        header: ['Column 1']
      });
    }, { timeout: 3000 });


    const { act } = require('@testing-library/react');
    await act(async () => {
      await Promise.resolve();
      mutationSuccessWatchers.forEach(({ onSuccess }) => {
        onSuccess();
      });
    });
  });

  it('should call updateDataset when form is submitted in edit mode', async () => {
    const mockUpdateDataset = jest.fn().mockResolvedValue(undefined);
    mockUseUpdateDataset.mockReturnValue({
      ...mockUpdateMutation,
      mutateAsync: mockUpdateDataset
    } as any);

    const dataset: DatasetListItemResponse = {
      id: '1',
      name: 'Test Dataset',
      description: 'Test Description',
      createdAt: '2024-01-01'
    } as unknown as DatasetListItemDto;

    const mockOnOpenChange = jest.fn();
    render(
      <DatasetDialog
        dataset={dataset}
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );


    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Dataset' } });


    const submitButton = screen.getByText('Save');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateDataset).toHaveBeenCalledWith({
        id: '1',
        data: {
          name: 'Updated Dataset',
          description: 'Test Description'
        }
      });
    });
  });

  it('should show loading state', () => {
    mockUseCreateDataset.mockReturnValue({
      ...mockCreateMutation,
      isPending: true
    } as any);

    render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument();
  });

  it('should show error message', async () => {
    const errorMessage = 'Failed to create dataset';


    mockUseCreateDataset.mockReturnValue({
      ...mockCreateMutation,
      error: null
    } as any);


    const { rerender } = render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );


    await waitFor(() => {
      expect(screen.getByText('Create New Dataset')).toBeInTheDocument();
    });


    await new Promise((resolve) => setTimeout(resolve, 100));


    mockUseCreateDataset.mockReturnValue({
      ...mockCreateMutation,
      error: new Error(errorMessage)
    } as any);


    rerender(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );


    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should call onOpenChange when cancel is clicked', () => {
    const mockOnOpenChange = jest.fn();
    render(
      <DatasetDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });


  it('should handle empty dataset name', () => {
    render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    expect(nameInput.value).toBe('');
  });

  it('should handle very long dataset name', () => {
    const longName = 'a'.repeat(500);
    render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: longName } });
    expect((nameInput as HTMLInputElement).value).toBe(longName);
  });

  it('should handle many columns', () => {
    render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    const addButton = screen.getByText('Add Column');

    for (let i = 0; i < 5; i++) {
      fireEvent.click(addButton);
    }

    const columnInputs = screen.getAllByPlaceholderText(/Column \d+ name/i);
    expect(columnInputs.length).toBeGreaterThan(5);
  });

  it('should filter out empty columns on submit', async () => {
    const mockCreateDataset = jest.fn().mockResolvedValue(undefined);
    mockUseCreateDataset.mockReturnValue({
      ...mockCreateMutation,
      mutateAsync: mockCreateDataset
    } as any);

    render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );


    const addButton = screen.getByText('Add Column');
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    const columnInputs = screen.getAllByPlaceholderText(/Column \d+ name/i);
    fireEvent.change(columnInputs[0], { target: { value: 'Column 1' } });
    fireEvent.change(columnInputs[2], { target: { value: 'Column 3' } });


    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Dataset' } });

    const submitButton = screen.getByText('Save');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateDataset).toHaveBeenCalledWith(
        expect.objectContaining({
          header: ['Column 1', 'Column 3']
        })
      );
    });
  });

  it('should handle missing projectId gracefully', () => {
    render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="" />

    );

    expect(screen.getByText('Create New Dataset')).toBeInTheDocument();
  });

  it('should handle null dataset in edit mode', () => {
    render(
      <DatasetDialog
        dataset={null}
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );

    expect(screen.getByText('Create New Dataset')).toBeInTheDocument();
  });

  it('should disable inputs when loading', () => {
    mockUseCreateDataset.mockReturnValue({
      ...mockCreateMutation,
      isPending: true
    } as any);

    render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    const nameInput = screen.getByLabelText(/Name/i);
    expect(nameInput).toBeDisabled();
  });


  it('should handle whitespace-only column names', () => {
    render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    const columnInput = screen.getByPlaceholderText('Column 1 name');
    fireEvent.change(columnInput, { target: { value: '   ' } });


    expect(screen.getByText(/At least one column is required/i)).toBeInTheDocument();
  });

  it('should handle special characters in column names', () => {
    render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    const columnInput = screen.getByPlaceholderText('Column 1 name');
    fireEvent.change(columnInput, { target: { value: 'Column!@#$%' } });

    const submitButton = screen.getByText('Save');
    expect(submitButton).not.toBeDisabled();
  });

  it('should handle very long column names', () => {
    render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    const longColumnName = 'a'.repeat(500);
    const columnInput = screen.getByPlaceholderText('Column 1 name');
    fireEvent.change(columnInput, { target: { value: longColumnName } });

    expect((columnInput as HTMLInputElement).value).toBe(longColumnName);
  });

  it('should handle newline characters in dataset name', () => {
    render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Line 1\nLine 2' } });

    expect((nameInput as HTMLInputElement).value).toContain('Line 1');
  });

  it('should handle undefined projectId', () => {
    render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId={undefined as any} />

    );

    expect(screen.getByText('Create New Dataset')).toBeInTheDocument();
  });

  it('should handle missing onOpenChange callback', () => {
    const { container } = render(
      <DatasetDialog
        open={true}
        onOpenChange={undefined as any}
        projectId="project-1" />

    );

    expect(container).toBeInTheDocument();
  });

  it('should reset form when dialog closes', () => {
    const { rerender } = render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Name' } });


    rerender(
      <DatasetDialog
        open={false}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );


    rerender(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );


    const newNameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    expect(newNameInput.value).toBe('');
  });

  it('should handle column removal when only one column exists', () => {
    render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );


    const removeButtons = screen.queryAllByRole('button');
    const removeButton = removeButtons.find((btn) => {
      const icon = btn.querySelector('svg[data-testid*="icon-x"]');
      return icon !== null;
    });


    expect(screen.getByPlaceholderText(/Column \d+ name/i)).toBeInTheDocument();
  });

  it('should handle column names with unicode characters', () => {
    render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    const columnInput = screen.getByPlaceholderText('Column 1 name');
    fireEvent.change(columnInput, { target: { value: '列名🚀测试' } });

    expect((columnInput as HTMLInputElement).value).toBe('列名🚀测试');
  });

  it('should handle empty string projectId', () => {
    render(
      <DatasetDialog
        open={true}
        onOpenChange={jest.fn()}
        projectId="" />

    );

    expect(screen.getByText('Create New Dataset')).toBeInTheDocument();
  });

  it('should handle dataset with null description in edit mode', () => {
    const dataset: DatasetListItemResponse = {
      id: '1',
      name: 'Test Dataset',
      description: null as any,
      createdAt: '2024-01-01'
    } as unknown as DatasetListItemDto;

    render(
      <DatasetDialog
        dataset={dataset}
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    const descInput = screen.getByLabelText(/Description/i) as HTMLInputElement;
    expect(descInput.value).toBe('');
  });
});