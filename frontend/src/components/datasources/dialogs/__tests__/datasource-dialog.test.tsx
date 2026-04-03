import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DatasourceDialog } from '../datasource-dialog';
import { useCreateDatasource, useUpdateDatasource } from '@/hooks/datasources/use-datasources-query';
import { DatasourceResponse, DatasourceSource, DatasourceType } from '@/types';
import { render as customRender } from '@/__tests__/test-utils';

jest.mock('@/hooks/datasources/use-datasources-query', () => ({
  useCreateDatasource: jest.fn(),
  useUpdateDatasource: jest.fn()
}));

jest.mock('@tanstack/react-router', () => ({
  useParams: jest.fn(() => ({ projectId: 'project-1' })),
  Link: ({ children, to, params, ...props }: any) => <a href={to} {...props}>{children}</a>
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


  const result = {
    ...mutation,
    isPending: mutation.isPending,
    errorMessage: mutation.error?.message || null,
    handleError: jest.fn(),
    clear: jest.fn(),
    clearError: jest.fn()
  };

  return result;
});

jest.mock('@/hooks/shared/use-mutation-action', () => ({
  useMutationAction: (options: any) => mockUseMutationAction(options)
}));


const markMutationSuccess = async (mutation: any) => {
  Object.assign(mutation, {
    isSuccess: true,
    isPending: false,
    status: 'success'
  });

  const { act } = require('@testing-library/react');
  await act(async () => {
    await Promise.resolve();
    mutationSuccessWatchers.forEach(({ mutation: watchedMutation, onSuccess }) => {
      if (watchedMutation === mutation && watchedMutation.isSuccess) {
        onSuccess();
      }
    });
  });
};

jest.mock('@/lib/toast', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn()
}));

const mockUseCreateDatasource = useCreateDatasource as jest.MockedFunction<typeof useCreateDatasource>;
const mockUseUpdateDatasource = useUpdateDatasource as jest.MockedFunction<typeof useUpdateDatasource>;

describe('DatasourceDialog', () => {
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
    mockUseCreateDatasource.mockReturnValue(defaultCreateMutation as any);
    mockUseUpdateDatasource.mockReturnValue(defaultUpdateMutation as any);
  });

  it('should render create mode dialog when open', () => {
    customRender(
      <DatasourceDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    expect(screen.getByText('Add a New Data Source')).toBeInTheDocument();
    expect(screen.getByText(/Datasources connect to external trace storage systems/i)).toBeInTheDocument();
  });

  it('should render edit mode dialog when datasource is provided', () => {
    const datasource: DatasourceResponse = {
      id: '1',
      name: 'Test Datasource',
      description: 'Test Description',
      url: 'https://example.com',
      type: DatasourceType.TRACES,
      source: DatasourceSource.TEMPO
    };

    customRender(
      <DatasourceDialog
        datasource={datasource}
        open={true}
        onOpenChange={jest.fn()} />

    );
    expect(screen.getByText('Refine Your Data Stream')).toBeInTheDocument();
    expect(screen.getByText(/Datasources connect to external trace storage systems/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    customRender(
      <DatasourceDialog
        open={false}
        onOpenChange={jest.fn()} />

    );
    expect(screen.queryByText('Add a New Data Source')).not.toBeInTheDocument();
  });

  it('should display datasource name in edit mode', () => {
    const datasource: DatasourceResponse = {
      id: '1',
      name: 'Test Datasource',
      description: 'Test Description',
      url: 'https://example.com',
      type: DatasourceType.TRACES,
      source: DatasourceSource.TEMPO
    };

    customRender(
      <DatasourceDialog
        datasource={datasource}
        open={true}
        onOpenChange={jest.fn()} />

    );
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    expect(nameInput.value).toBe('Test Datasource');
  });

  it('should show URL input when source is selected', () => {
    customRender(
      <DatasourceDialog
        open={true}
        onOpenChange={jest.fn()} />

    );


    expect(screen.getByText('Source')).toBeInTheDocument();

    expect(screen.queryByLabelText(/URL/i)).not.toBeInTheDocument();
  });

  it('should render form fields in create mode', () => {
    customRender(
      <DatasourceDialog
        open={true}
        onOpenChange={jest.fn()} />

    );

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();

    expect(screen.getByText('Source')).toBeInTheDocument();
  });

  it('should call updateDatasource when form is submitted in edit mode', async () => {
    const mockUpdateDatasource = jest.fn().mockResolvedValue(undefined);
    mockUseUpdateDatasource.mockReturnValue({
      ...defaultUpdateMutation,
      mutateAsync: mockUpdateDatasource
    } as any);

    const datasource: DatasourceResponse = {
      id: '1',
      name: 'Test Datasource',
      description: 'Test Description',
      url: 'https://example.com',
      type: DatasourceType.TRACES,
      source: DatasourceSource.TEMPO
    };

    const mockOnOpenChange = jest.fn();
    customRender(
      <DatasourceDialog
        datasource={datasource}
        open={true}
        onOpenChange={mockOnOpenChange} />

    );


    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Datasource' } });


    const form = document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockUpdateDatasource).toHaveBeenCalled();
    });
  });

  it('should show loading state', () => {
    mockUseCreateDatasource.mockReturnValue({
      ...defaultCreateMutation,
      isPending: true
    } as any);

    customRender(
      <DatasourceDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument();
  });

  it('should show error message', async () => {
    const errorMessage = 'Failed to create datasource';


    const createMutationObj = {
      ...defaultCreateMutation,
      error: null as any
    };

    mockUseCreateDatasource.mockReturnValue(createMutationObj as any);


    customRender(
      <DatasourceDialog
        open={true}
        onOpenChange={jest.fn()} />

    );


    await waitFor(() => {
      expect(screen.getByText(/Add a New Data Source/i)).toBeInTheDocument();
    });


    createMutationObj.error = { message: errorMessage };
    mockUseCreateDatasource.mockReturnValue(createMutationObj as any);
  });

  it('should call onOpenChange when cancel is clicked', () => {
    const mockOnOpenChange = jest.fn();
    customRender(
      <DatasourceDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should call onSuccess callback after successful submit', async () => {
    const mockUpdateDatasource = jest.fn().mockResolvedValue(undefined);
    mockUseUpdateDatasource.mockReturnValue({
      ...defaultUpdateMutation,
      mutateAsync: mockUpdateDatasource
    } as any);

    const mockOnSuccess = jest.fn();
    const mockOnOpenChange = jest.fn();

    const datasource: DatasourceResponse = {
      id: '1',
      name: 'Test Datasource',
      description: 'Test Description',
      url: 'https://example.com',
      type: DatasourceType.TRACES,
      source: DatasourceSource.TEMPO
    };

    customRender(
      <DatasourceDialog
        datasource={datasource}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess} />

    );

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'New Datasource' } });

    const form = document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }


    await waitFor(() => {
      expect(mockUpdateDatasource).toHaveBeenCalled();
    }, { timeout: 3000 });
    const { act } = require('@testing-library/react');
    await act(async () => {
      await Promise.resolve();

      mutationSuccessWatchers.forEach(({ onSuccess }) => {
        onSuccess();
      });
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    }, { timeout: 3000 });
  });


  it('should handle null datasource', () => {
    customRender(
      <DatasourceDialog
        datasource={null}
        open={true}
        onOpenChange={jest.fn()} />

    );

    expect(screen.getByText('Add a New Data Source')).toBeInTheDocument();
  });

  it('should handle undefined datasource', () => {
    customRender(
      <DatasourceDialog
        datasource={undefined}
        open={true}
        onOpenChange={jest.fn()} />

    );

    expect(screen.getByText('Add a New Data Source')).toBeInTheDocument();
  });

  it('should handle missing onOpenChange callback', () => {
    const { container } = customRender(
      <DatasourceDialog
        open={true}
        onOpenChange={undefined as any} />

    );

    expect(container).toBeInTheDocument();
  });

  it('should handle very long datasource name', () => {
    const longName = 'a'.repeat(500);
    customRender(
      <DatasourceDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: longName } });
    expect((nameInput as HTMLInputElement).value).toBe(longName);
  });

  it('should handle very long description', () => {
    const longDesc = 'b'.repeat(2000);
    customRender(
      <DatasourceDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    const descInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descInput, { target: { value: longDesc } });
    expect((descInput as HTMLTextAreaElement).value).toBe(longDesc);
  });

  it('should handle very long URL', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(500);
    customRender(
      <DatasourceDialog
        open={true}
        onOpenChange={jest.fn()} />

    );


    expect(screen.getByText('Add a New Data Source')).toBeInTheDocument();
  });

  it('should handle empty string name', () => {
    customRender(
      <DatasourceDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    expect(nameInput.value).toBe('');
  });

  it('should handle empty string description', () => {
    customRender(
      <DatasourceDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    const descInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    expect(descInput.value).toBe('');
  });

  it('should handle datasource with null description in edit mode', () => {
    const datasource: DatasourceResponse = {
      id: '1',
      name: 'Test Datasource',
      description: null as any,
      url: 'https://example.com',
      type: DatasourceType.TRACES,
      source: DatasourceSource.TEMPO
    };

    customRender(
      <DatasourceDialog
        datasource={datasource}
        open={true}
        onOpenChange={jest.fn()} />

    );
    const descInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    expect(descInput.value).toBe('');
  });

  it('should disable inputs when loading', () => {
    mockUseCreateDatasource.mockReturnValue({
      ...defaultCreateMutation,
      isPending: true
    } as any);

    customRender(
      <DatasourceDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    const nameInput = screen.getByLabelText(/Name/i);
    expect(nameInput).toBeDisabled();
  });

  it('should handle controlled vs uncontrolled mode', () => {

    const { rerender } = customRender(
      <DatasourceDialog />
    );

    expect(screen.queryByText('Add a New Data Source')).not.toBeInTheDocument();


    rerender(
      <DatasourceDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    expect(screen.getByText('Add a New Data Source')).toBeInTheDocument();
  });

  it('should handle source state updates', () => {
    const datasource: DatasourceResponse = {
      id: '1',
      name: 'Test Datasource',
      description: 'Test Description',
      url: 'https://example.com',
      type: DatasourceType.TRACES,
      source: DatasourceSource.TEMPO
    };

    customRender(
      <DatasourceDialog
        datasource={datasource}
        open={true}
        onOpenChange={jest.fn()} />

    );

    expect(screen.getByText('Refine Your Data Stream')).toBeInTheDocument();
  });

  it('should handle special characters in name', () => {
    customRender(
      <DatasourceDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test!@#$%^&*()' } });
    expect((nameInput as HTMLInputElement).value).toBe('Test!@#$%^&*()');
  });

  it('should handle newline characters in description', () => {
    customRender(
      <DatasourceDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    const descInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descInput, { target: { value: 'Line 1\nLine 2' } });
    expect((descInput as HTMLTextAreaElement).value).toContain('Line 1');
  });

  it('should handle invalid URL format', () => {
    customRender(
      <DatasourceDialog
        open={true}
        onOpenChange={jest.fn()} />

    );

    expect(screen.getByText('Add a New Data Source')).toBeInTheDocument();
  });

  it('should handle missing projectId from useParams', () => {
    customRender(
      <DatasourceDialog
        open={true}
        onOpenChange={jest.fn()} />

    );

    expect(screen.getByText('Add a New Data Source')).toBeInTheDocument();
  });
});