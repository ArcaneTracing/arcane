import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConversationDialog } from '../conversation-dialog';
import { ConversationConfigurationResponse } from '@/types/conversation-configuration';
import { render as customRender } from '@/__tests__/test-utils';

const mockCreateConfiguration = jest.fn().mockResolvedValue(undefined);
const mockUpdateConfiguration = jest.fn().mockResolvedValue(undefined);

const mockCreateMutation = {
  mutateAsync: mockCreateConfiguration,
  isPending: false,
  error: null,
  reset: jest.fn()
};
const mockUpdateMutation = {
  mutateAsync: mockUpdateConfiguration,
  isPending: false,
  error: null,
  reset: jest.fn()
};

jest.mock('@/hooks/conversation/use-conversation-query', () => ({
  useCreateConversationConfiguration: jest.fn(() => mockCreateMutation),
  useUpdateConversationConfiguration: jest.fn(() => mockUpdateMutation)
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

jest.mock('@/lib/toast', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn()
}));

const mockUseCreateConversationConfiguration = require('@/hooks/conversation/use-conversation-query').useCreateConversationConfiguration;
const mockUseUpdateConversationConfiguration = require('@/hooks/conversation/use-conversation-query').useUpdateConversationConfiguration;

describe('ConversationDialog', () => {
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mutationData.clear();
    mutationSuccessWatchers = [];
    mockUseCreateConversationConfiguration.mockReturnValue(mockCreateMutation);
    mockUseUpdateConversationConfiguration.mockReturnValue(mockUpdateMutation);
  });

  it('should render dialog when open', () => {
    customRender(
      <ConversationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    expect(screen.getByText('Create Conversation Configuration')).toBeInTheDocument();
  });

  it('should not render dialog when closed', () => {
    customRender(
      <ConversationDialog
        open={false}
        onOpenChange={mockOnOpenChange} />

    );

    expect(screen.queryByText('Create Conversation Configuration')).not.toBeInTheDocument();
  });

  it('should render trigger button when trigger prop provided', () => {
    customRender(
      <ConversationDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        trigger={<button>Open Dialog</button>} />

    );

    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
  });

  it('should display edit mode title when configuration provided', () => {
    const configuration: ConversationConfigurationResponse = {
      id: 'config-1',
      name: 'Test Config',
      description: 'Test Description',
      stitchingAttributesName: ['attr1'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    customRender(
      <ConversationDialog
        configuration={configuration}
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    expect(screen.getByText('Edit Conversation Configuration')).toBeInTheDocument();
  });

  it('should populate form fields when editing', () => {
    const configuration: ConversationConfigurationResponse = {
      id: 'config-1',
      name: 'Test Config',
      description: 'Test Description',
      stitchingAttributesName: ['attr1', 'attr2'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    customRender(
      <ConversationDialog
        configuration={configuration}
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    const descInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;

    expect(nameInput.value).toBe('Test Config');
    expect(descInput.value).toBe('Test Description');
    expect(screen.getByDisplayValue('attr1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('attr2')).toBeInTheDocument();
  });

  it('should call createConfiguration when submitting new configuration', async () => {
    customRender(
      <ConversationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Config' } });


    const addButton = screen.getByText(/add attribute name/i);
    fireEvent.click(addButton);

    const attrInput = screen.getByPlaceholderText(/conversation.id/i) as HTMLInputElement;
    fireEvent.change(attrInput, { target: { value: 'attr1' } });

    const submitButton = screen.getByRole('button', { name: /create configuration/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateConfiguration).toHaveBeenCalledWith({
        name: 'New Config',
        description: undefined,
        stitchingAttributesName: ['attr1']
      });
    });
  });

  it('should call updateConfiguration when submitting edited configuration', async () => {
    const configuration: ConversationConfigurationResponse = {
      id: 'config-1',
      name: 'Test Config',
      description: 'Test Description',
      stitchingAttributesName: ['attr1'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    customRender(
      <ConversationDialog
        configuration={configuration}
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Updated Config' } });

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateConfiguration).toHaveBeenCalledWith({
        id: 'config-1',
        data: {
          name: 'Updated Config',
          description: 'Test Description',
          stitchingAttributesName: ['attr1']
        }
      });
    });
  });

  it('should close dialog after successful submission', async () => {
    customRender(
      <ConversationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Config' } });

    const addButton = screen.getByText(/add attribute name/i);
    fireEvent.click(addButton);

    const attrInput = screen.getByPlaceholderText(/conversation.id/i) as HTMLInputElement;
    fireEvent.change(attrInput, { target: { value: 'attr1' } });

    const submitButton = screen.getByRole('button', { name: /create configuration/i });
    fireEvent.click(submitButton);


    await waitFor(() => {
      expect(mockCreateConfiguration).toHaveBeenCalled();
    }, { timeout: 3000 });


    const createMutation = mockUseCreateConversationConfiguration.mock.results[0]?.value;
    if (createMutation) {
      const { act } = require('@testing-library/react');
      await act(async () => {
        await Promise.resolve();

        mutationSuccessWatchers.forEach(({ onSuccess }) => {
          onSuccess();
        });
      });
    }

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    }, { timeout: 3000 });
  });

  it('should display error when name is empty', async () => {
    customRender(
      <ConversationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const addButton = screen.getByText(/add attribute name/i);
    fireEvent.click(addButton);

    const attrInput = screen.getByPlaceholderText(/conversation.id/i) as HTMLInputElement;
    fireEvent.change(attrInput, { target: { value: 'attr1' } });


    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: '' } });


    const form = screen.getByRole('button', { name: /create configuration/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(screen.getByText('Name cannot be empty')).toBeInTheDocument();
    });
  });

  it('should display error when no attributes provided', async () => {
    customRender(
      <ConversationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Config' } });


    const form = screen.getByRole('button', { name: /create configuration/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(screen.getByText(/at least one stitching attribute name is required/i)).toBeInTheDocument();
    });
  });

  it('should display error when duplicate attributes provided', async () => {
    customRender(
      <ConversationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Config' } });


    const addButton = screen.getByText(/add attribute name/i);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/conversation.id/i)).toBeInTheDocument();
    });


    const addAnotherButton = screen.getByText(/add another attribute name/i);
    fireEvent.click(addAnotherButton);


    await waitFor(() => {
      const attrInputs = screen.getAllByPlaceholderText(/conversation.id/i);
      expect(attrInputs.length).toBe(2);
    });

    const attrInputs = screen.getAllByPlaceholderText(/conversation.id/i);


    fireEvent.change(attrInputs[0] as HTMLInputElement, { target: { value: 'attr1' } });
    fireEvent.change(attrInputs[1] as HTMLInputElement, { target: { value: 'attr1' } });


    await waitFor(() => {
      expect((attrInputs[0] as HTMLInputElement).value).toBe('attr1');
      expect((attrInputs[1] as HTMLInputElement).value).toBe('attr1');
    });


    const submitButton = screen.getByRole('button', { name: /create configuration/i });
    expect(submitButton).not.toHaveAttribute('disabled');

    const form = submitButton.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(screen.getByText(/duplicate attribute names are not allowed/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should add attribute when Add Attribute Name button is clicked', () => {
    customRender(
      <ConversationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const addButton = screen.getByText(/add attribute name/i);
    fireEvent.click(addButton);

    expect(screen.getByPlaceholderText(/conversation.id/i)).toBeInTheDocument();
  });

  it('should remove attribute when remove button is clicked', () => {
    customRender(
      <ConversationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const addButton = screen.getByText(/add attribute name/i);
    fireEvent.click(addButton);

    const removeButton = screen.getByRole('button', { name: /remove attribute/i });
    fireEvent.click(removeButton);

    expect(screen.queryByPlaceholderText(/conversation.id/i)).not.toBeInTheDocument();
  });

  it('should display loading state', () => {
    mockUseCreateConversationConfiguration.mockReturnValue({
      ...mockCreateMutation,
      isPending: true
    });

    customRender(
      <ConversationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('should disable form fields when loading', () => {
    mockUseCreateConversationConfiguration.mockReturnValue({
      ...mockCreateMutation,
      isPending: true
    });

    customRender(
      <ConversationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    expect(nameInput).toHaveAttribute('disabled');
  });

  it('should display API error', async () => {
    const errorMessage = 'API Error occurred';


    mockUseCreateConversationConfiguration.mockReturnValue({
      ...mockCreateMutation,
      error: null
    });


    const { rerender } = customRender(
      <ConversationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );


    await waitFor(() => {
      expect(screen.getByText('Create Conversation Configuration')).toBeInTheDocument();
    });


    await new Promise((resolve) => setTimeout(resolve, 100));


    mockUseCreateConversationConfiguration.mockReturnValue({
      ...mockCreateMutation,
      error: new Error(errorMessage)
    });


    rerender(
      <ConversationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );


    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should display update error when editing', async () => {
    const errorMessage = 'Update Error occurred';
    const configuration: ConversationConfigurationResponse = {
      id: 'config-1',
      name: 'Test Config',
      description: 'Test Description',
      stitchingAttributesName: ['attr1'],
      createdAt: new Date(),
      updatedAt: new Date()
    };


    mockUseUpdateConversationConfiguration.mockReturnValue({
      ...mockUpdateMutation,
      error: null
    });


    const { rerender } = customRender(
      <ConversationDialog
        configuration={configuration}
        open={true}
        onOpenChange={mockOnOpenChange} />

    );


    await waitFor(() => {
      expect(screen.getByText('Edit Conversation Configuration')).toBeInTheDocument();
    });


    await new Promise((resolve) => setTimeout(resolve, 100));


    mockUseUpdateConversationConfiguration.mockReturnValue({
      ...mockUpdateMutation,
      error: new Error(errorMessage)
    });


    rerender(
      <ConversationDialog
        configuration={configuration}
        open={true}
        onOpenChange={mockOnOpenChange} />

    );


    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should call onOpenChange when Cancel button is clicked', () => {
    customRender(
      <ConversationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should filter out empty attributes before submission', async () => {
    customRender(
      <ConversationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Config' } });

    const addButton = screen.getByText(/add attribute name/i);
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    const attrInputs = screen.getAllByPlaceholderText(/conversation.id/i) as HTMLInputElement[];
    fireEvent.change(attrInputs[0], { target: { value: 'attr1' } });


    const submitButton = screen.getByRole('button', { name: /create configuration/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateConfiguration).toHaveBeenCalledWith({
        name: 'New Config',
        description: undefined,
        stitchingAttributesName: ['attr1']
      });
    });
  });


  it('should handle configuration with null description', () => {
    const configuration: ConversationConfigurationResponse = {
      id: 'config-1',
      name: 'Test Config',
      description: null as any,
      stitchingAttributesName: ['attr1'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    customRender(
      <ConversationDialog
        configuration={configuration}
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const descInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
    expect(descInput.value).toBe('');
  });

  it('should handle configuration with empty stitchingAttributesName', () => {
    const configuration: ConversationConfigurationResponse = {
      id: 'config-1',
      name: 'Test Config',
      description: 'Test Description',
      stitchingAttributesName: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    customRender(
      <ConversationDialog
        configuration={configuration}
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    expect(screen.getByText(/no attribute names configured/i)).toBeInTheDocument();
  });

  it('should handle very long name', () => {
    const longName = 'a'.repeat(1000);
    customRender(
      <ConversationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: longName } });

    expect(nameInput.value).toBe(longName);
  });

  it('should handle whitespace-only name', async () => {
    customRender(
      <ConversationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: '   ' } });

    const addButton = screen.getByText(/add attribute name/i);
    fireEvent.click(addButton);

    const attrInput = screen.getByPlaceholderText(/conversation.id/i) as HTMLInputElement;
    fireEvent.change(attrInput, { target: { value: 'attr1' } });


    const form = screen.getByRole('button', { name: /create configuration/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(screen.getByText('Name cannot be empty')).toBeInTheDocument();
    });
  });

  it('should trim description before submission', async () => {
    customRender(
      <ConversationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Config' } });

    const descInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
    fireEvent.change(descInput, { target: { value: '  Description  ' } });

    const addButton = screen.getByText(/add attribute name/i);
    fireEvent.click(addButton);

    const attrInput = screen.getByPlaceholderText(/conversation.id/i) as HTMLInputElement;
    fireEvent.change(attrInput, { target: { value: 'attr1' } });

    const submitButton = screen.getByRole('button', { name: /create configuration/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateConfiguration).toHaveBeenCalledWith({
        name: 'New Config',
        description: 'Description',
        stitchingAttributesName: ['attr1']
      });
    });
  });
});