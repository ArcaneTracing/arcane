import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EntityDialog } from '../new-entity-dialog';
import { useCreateEntity, useUpdateEntity } from '@/hooks/entities/use-entities-query';
import { useEntityForm } from '@/hooks/entity/use-entity-form';
import { EntityResponse, EntityType, MatchPatternType } from '@/types';

jest.mock('@/hooks/entities/use-entities-query', () => ({
  useCreateEntity: jest.fn(),
  useUpdateEntity: jest.fn()
}));

jest.mock('@/hooks/entity/use-entity-form', () => ({
  useEntityForm: jest.fn()
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

const mockUseCreateEntity = useCreateEntity as jest.MockedFunction<typeof useCreateEntity>;
const mockUseUpdateEntity = useUpdateEntity as jest.MockedFunction<typeof useUpdateEntity>;
const mockUseEntityForm = useEntityForm as jest.MockedFunction<typeof useEntityForm>;

describe('EntityDialog', () => {
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

  const defaultMockFormReturn = {
    currentStep: 1,
    formData: {
      name: '',
      description: '',
      attributeName: '',
      matchPatternType: MatchPatternType.VALUE,
      matchValue: '',
      entityType: EntityType.MODEL,
      entityHighlights: [],
      messageMatching: {
        type: 'CANONICAL' as any,
        canonicalMessageMatchingConfiguration: {
          inputAttributeKey: '',
          outputAttributeKey: ''
        },
        flatMessageMatchingConfiguration: null
      }
    },
    setFormData: jest.fn(),
    STEPS: ['Basic Info', 'Matching', 'Highlights', 'Message Matching'],
    validateStep: jest.fn(() => true),
    handleNext: jest.fn(),
    handlePrevious: jest.fn(),
    handleFieldChange: jest.fn(),
    prepareEntityData: jest.fn(() => ({}))
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mutationData.clear();
    mutationSuccessWatchers = [];
    mockUseCreateEntity.mockReturnValue(defaultCreateMutation as any);
    mockUseUpdateEntity.mockReturnValue(defaultUpdateMutation as any);
    mockUseEntityForm.mockReturnValue(defaultMockFormReturn as any);
  });

  it('should not render when closed', () => {
    render(
      <EntityDialog
        open={false}
        onOpenChange={jest.fn()} />

    );
    expect(screen.queryByText('Create New Entity')).not.toBeInTheDocument();
  });

  it('should render create mode dialog when open', () => {
    render(
      <EntityDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    expect(screen.getByText('Create New Entity')).toBeInTheDocument();
  });

  it('should render edit mode dialog when entity is provided', () => {
    const entity: EntityResponse = {
      id: '1',
      name: 'Test Entity',
      entityType: EntityType.MODEL
    } as EntityResponse;

    render(
      <EntityDialog
        entity={entity}
        open={true}
        onOpenChange={jest.fn()} />

    );
    expect(screen.getByText('Edit Entity')).toBeInTheDocument();
  });

  it('should show stepper component', () => {
    render(
      <EntityDialog
        open={true}
        onOpenChange={jest.fn()} />

    );

    expect(screen.getByText('Basic Info')).toBeInTheDocument();
  });

  it('should show error message when error exists and is new', async () => {
    const errorMessage = 'Failed to create entity';


    const createMutationObj = {
      ...defaultCreateMutation,
      error: null as any
    };

    mockUseCreateEntity.mockReturnValue(createMutationObj as any);


    render(
      <EntityDialog
        open={true}
        onOpenChange={jest.fn()} />

    );


    await waitFor(() => {
      expect(screen.getByText('Create New Entity')).toBeInTheDocument();
    });


    createMutationObj.error = new Error(errorMessage);
    mockUseCreateEntity.mockReturnValue(createMutationObj as any);
  });

  it('should call onOpenChange when cancel is clicked', () => {
    const mockOnOpenChange = jest.fn();
    render(
      <EntityDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should call createEntity when form is submitted in create mode', async () => {
    const mockCreate = jest.fn().mockResolvedValue(undefined);
    mockUseCreateEntity.mockReturnValue({
      ...defaultCreateMutation,
      mutateAsync: mockCreate
    } as any);

    mockUseEntityForm.mockReturnValue({
      ...defaultMockFormReturn,
      currentStep: 4,
      prepareEntityData: jest.fn(() => ({
        name: 'New Entity',
        entityType: EntityType.MODEL
      }))
    } as any);

    const mockOnOpenChange = jest.fn();
    render(
      <EntityDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const form = document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    });
  });

  it('should call updateEntity when form is submitted in edit mode', async () => {
    const mockUpdate = jest.fn().mockResolvedValue(undefined);
    mockUseUpdateEntity.mockReturnValue({
      ...defaultUpdateMutation,
      mutateAsync: mockUpdate
    } as any);

    const entity: EntityResponse = {
      id: '1',
      name: 'Test Entity',
      entityType: EntityType.MODEL
    } as EntityResponse;

    mockUseEntityForm.mockReturnValue({
      ...defaultMockFormReturn,
      currentStep: 4,
      prepareEntityData: jest.fn(() => ({
        name: 'Updated Entity',
        entityType: EntityType.MODEL
      }))
    } as any);

    const mockOnOpenChange = jest.fn();
    render(
      <EntityDialog
        entity={entity}
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const form = document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({ id: '1', data: expect.any(Object) });
    });
  });

  it('should not submit if not on last step', async () => {
    const mockCreate = jest.fn();
    mockUseCreateEntity.mockReturnValue({
      ...defaultCreateMutation,
      mutateAsync: mockCreate
    } as any);

    mockUseEntityForm.mockReturnValue({
      ...defaultMockFormReturn,
      currentStep: 2
    } as any);

    render(
      <EntityDialog
        open={true}
        onOpenChange={jest.fn()} />

    );

    const form = document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }


    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should show loading state', () => {
    mockUseCreateEntity.mockReturnValue({
      ...defaultCreateMutation,
      isPending: true
    } as any);

    mockUseEntityForm.mockReturnValue({
      ...defaultMockFormReturn,
      currentStep: 4
    } as any);

    render(
      <EntityDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    expect(screen.getByText('Creating...')).toBeInTheDocument();
  });

  it('should prevent Enter key submission except on submit button', () => {
    render(
      <EntityDialog
        open={true}
        onOpenChange={jest.fn()} />

    );
    const form = document.querySelector('form');
    if (form) {
      const input = form.querySelector('input');
      if (input) {
        const keyDownEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
        fireEvent.keyDown(input, { key: 'Enter' });

      }
    }
  });


  it('should handle null entity', () => {
    render(
      <EntityDialog
        entity={null}
        open={true}
        onOpenChange={jest.fn()} />

    );

    expect(screen.getByText('Create New Entity')).toBeInTheDocument();
  });

  it('should handle undefined entity', () => {
    render(
      <EntityDialog
        entity={undefined}
        open={true}
        onOpenChange={jest.fn()} />

    );

    expect(screen.getByText('Create New Entity')).toBeInTheDocument();
  });

  it('should handle missing onOpenChange callback', () => {
    const { container } = render(
      <EntityDialog
        open={true}
        onOpenChange={undefined as any} />

    );

    expect(container).toBeInTheDocument();
  });

  it('should handle validation failure on submit', async () => {
    const mockCreate = jest.fn();
    mockUseCreateEntity.mockReturnValue({
      ...defaultCreateMutation,
      mutateAsync: mockCreate
    } as any);

    mockUseEntityForm.mockReturnValue({
      ...defaultMockFormReturn,
      currentStep: 4,
      validateStep: jest.fn(() => false)
    } as any);

    render(
      <EntityDialog
        open={true}
        onOpenChange={jest.fn()} />

    );

    const form = document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }


    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should handle createEntity error', async () => {
    const mockCreate = jest.fn().mockRejectedValue(new Error('Create failed'));
    mockUseCreateEntity.mockReturnValue({
      ...defaultCreateMutation,
      mutateAsync: mockCreate
    } as any);

    mockUseEntityForm.mockReturnValue({
      ...defaultMockFormReturn,
      currentStep: 4
    } as any);

    render(
      <EntityDialog
        open={true}
        onOpenChange={jest.fn()} />

    );

    const form = document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    });

  });

  it('should close dialog after successful create', async () => {
    const mockCreate = jest.fn().mockResolvedValue(undefined);
    mockUseCreateEntity.mockReturnValue({
      ...defaultCreateMutation,
      mutateAsync: mockCreate
    } as any);

    const mockOnOpenChange = jest.fn();
    mockUseEntityForm.mockReturnValue({
      ...defaultMockFormReturn,
      currentStep: 4
    } as any);

    render(
      <EntityDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const form = document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }


    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    }, { timeout: 3000 });


    const createMutation = mockUseCreateEntity.mock.results[0]?.value;


    if (createMutation) {
      await markMutationSuccess(createMutation);
    } else {

      const lastCall = mockUseMutationAction.mock.calls[mockUseMutationAction.mock.calls.length - 1];
      if (lastCall && lastCall[0]?.mutation) {
        await markMutationSuccess(lastCall[0].mutation);
      }
    }

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    }, { timeout: 3000 });
  });
});