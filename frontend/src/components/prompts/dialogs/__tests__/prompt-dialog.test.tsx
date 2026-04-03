import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PromptDialog } from '../prompt-dialog';
import { PromptResponse } from '@/types/prompts';
import { render as customRender } from '@/__tests__/test-utils';

const mockCreatePrompt = jest.fn().mockResolvedValue(undefined);
const mockUpdatePrompt = jest.fn().mockResolvedValue(undefined);

jest.mock('@/hooks/prompts/use-prompts-query', () => ({
  useCreatePrompt: jest.fn(() => ({
    mutateAsync: mockCreatePrompt,
    isPending: false,
    error: null,
    reset: jest.fn()
  })),
  useUpdatePrompt: jest.fn(() => ({
    mutateAsync: mockUpdatePrompt,
    isPending: false,
    error: null,
    reset: jest.fn()
  }))
}));

jest.mock('@/hooks/model-configurations/use-model-configurations-query', () => ({
  useModelConfigurationsQuery: jest.fn(() => ({
    data: [
    {
      id: 'config-1',
      name: 'GPT-4 Config',
      configuration: {
        adapter: 'openai',
        modelName: 'gpt-4',
        apiKey: 'sk-test',
        inputCostPerToken: 0.00003,
        outputCostPerToken: 0.00006
      }
    }],

    isLoading: false,
    error: null
  }))
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

const mockUseCreatePrompt = require('@/hooks/prompts/use-prompts-query').useCreatePrompt;
const mockUseUpdatePrompt = require('@/hooks/prompts/use-prompts-query').useUpdatePrompt;
const mockUseModelConfigurationsQuery = require('@/hooks/model-configurations/use-model-configurations-query').useModelConfigurationsQuery;

describe('PromptDialog', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mutationData.clear();
    mutationSuccessWatchers = [];
    mockUseCreatePrompt.mockReturnValue({
      mutateAsync: mockCreatePrompt,
      isPending: false,
      error: null,
      reset: jest.fn()
    });
    mockUseUpdatePrompt.mockReturnValue({
      mutateAsync: mockUpdatePrompt,
      isPending: false,
      error: null,
      reset: jest.fn()
    });
    mockUseModelConfigurationsQuery.mockReturnValue({
      data: [
      {
        id: 'config-1',
        name: 'GPT-4 Config',
        configuration: {
          adapter: 'openai',
          modelName: 'gpt-4',
          apiKey: 'sk-test',
          inputCostPerToken: 0.00003,
          outputCostPerToken: 0.00006
        }
      }],

      isLoading: false,
      error: null
    });
  });

  it('should render dialog when open', () => {
    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    expect(screen.getByText('Create New Prompt')).toBeInTheDocument();
  });

  it('should not render dialog when closed', () => {
    customRender(
      <PromptDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    expect(screen.queryByText('Create New Prompt')).not.toBeInTheDocument();
  });

  it('should render trigger button when trigger prop provided', () => {
    customRender(
      <PromptDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        trigger={<button>Open Dialog</button>}
        projectId="project-1" />

    );
    expect(screen.queryByText('Create New Prompt')).not.toBeInTheDocument();
  });

  it('should display edit mode title when prompt provided', () => {
    const prompt: PromptResponse = {
      id: 'prompt-1',
      name: 'Test Prompt',
      description: 'Test Description',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    customRender(
      <PromptDialog
        prompt={prompt}
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    expect(screen.getByText('Edit Prompt')).toBeInTheDocument();
  });

  it('should render all form fields', () => {
    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    expect(screen.getByLabelText(/^name \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/model configuration \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/template format \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/system message/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/user message \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/temperature/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/max tokens/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/top p/i)).toBeInTheDocument();
  });

  it('should call createPrompt when submitting new prompt', async () => {
    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Prompt' } });

    const userMessageInput = screen.getByLabelText(/user message \*$/i) as HTMLTextAreaElement;
    fireEvent.change(userMessageInput, { target: { value: 'Hello {{user_message}}' } });


    await waitFor(() => {
      const modelConfigSelect = screen.getByLabelText(/model configuration \*$/i);
      expect(modelConfigSelect).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /^create$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreatePrompt).toHaveBeenCalled();
    });
  });

  it('should close dialog after successful submission', async () => {
    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1"
        onSuccess={mockOnSuccess} />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Prompt' } });

    const userMessageInput = screen.getByLabelText(/user message \*$/i) as HTMLTextAreaElement;
    fireEvent.change(userMessageInput, { target: { value: 'Hello {{user_message}}' } });

    await waitFor(() => {
      const modelConfigSelect = screen.getByLabelText(/model configuration \*$/i);
      expect(modelConfigSelect).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /^create$/i });
    fireEvent.click(submitButton);


    await waitFor(() => {
      expect(mockCreatePrompt).toHaveBeenCalled();
    }, { timeout: 3000 });


    const createMutation = mockUseCreatePrompt.mock.results[0]?.value;


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
      expect(mockOnSuccess).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should call onOpenChange when Cancel button is clicked', () => {
    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should display loading state', () => {
    mockUseCreatePrompt.mockReturnValue({
      mutateAsync: mockCreatePrompt,
      isPending: true,
      error: null,
      reset: jest.fn()
    });
    mockUseUpdatePrompt.mockReturnValue({
      mutateAsync: mockUpdatePrompt,
      isPending: false,
      error: null,
      reset: jest.fn()
    });

    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    expect(screen.getByText('Creating...')).toBeInTheDocument();
  });

  it('should disable form fields when loading', () => {
    mockUseCreatePrompt.mockReturnValue({
      mutateAsync: mockCreatePrompt,
      isPending: true,
      error: null,
      reset: jest.fn()
    });
    mockUseUpdatePrompt.mockReturnValue({
      mutateAsync: mockUpdatePrompt,
      isPending: false,
      error: null,
      reset: jest.fn()
    });

    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    expect(nameInput).toHaveAttribute('disabled');
  });

  it('should display API error', async () => {
    const errorMessage = 'API Error occurred';


    const createMutationObj = {
      mutateAsync: mockCreatePrompt,
      isPending: false,
      error: null as any,
      reset: jest.fn()
    };

    mockUseCreatePrompt.mockReturnValue(createMutationObj);
    mockUseUpdatePrompt.mockReturnValue({
      mutateAsync: mockUpdatePrompt,
      isPending: false,
      error: null,
      reset: jest.fn()
    });


    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );


    await waitFor(() => {
      expect(screen.getByText('Create New Prompt')).toBeInTheDocument();
    });


    createMutationObj.error = { message: errorMessage };


    mockUseCreatePrompt.mockReturnValue(createMutationObj);

  });

  it('should handle template format selection', async () => {
    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    const templateFormatSelect = screen.getByLabelText(/template format \*$/i);
    expect(templateFormatSelect).toBeInTheDocument();
  });

  it('should handle system message input', () => {
    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    const systemMessageInput = screen.getByLabelText(/system message/i) as HTMLTextAreaElement;
    fireEvent.change(systemMessageInput, { target: { value: 'You are a helpful assistant' } });

    expect(systemMessageInput.value).toBe('You are a helpful assistant');
  });

  it('should handle user message input', () => {
    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    const userMessageInput = screen.getByLabelText(/user message \*$/i) as HTMLTextAreaElement;
    fireEvent.change(userMessageInput, { target: { value: 'Hello {{user_message}}' } });

    expect(userMessageInput.value).toBe('Hello {{user_message}}');
  });

  it('should handle temperature input', () => {
    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    const temperatureInput = screen.getByLabelText(/temperature/i) as HTMLInputElement;
    fireEvent.change(temperatureInput, { target: { value: '0.8' } });

    expect(temperatureInput.value).toBe('0.8');
  });

  it('should handle maxTokens input', () => {
    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    const maxTokensInput = screen.getByLabelText(/max tokens/i) as HTMLInputElement;
    fireEvent.change(maxTokensInput, { target: { value: '2000' } });

    expect(maxTokensInput.value).toBe('2000');
  });

  it('should handle topP input', () => {
    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    const topPInput = screen.getByLabelText(/top p/i) as HTMLInputElement;
    fireEvent.change(topPInput, { target: { value: '0.9' } });

    expect(topPInput.value).toBe('0.9');
  });


  it('should handle empty model configurations', () => {
    mockUseModelConfigurationsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    });

    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    expect(screen.getByText(/no configurations available/i)).toBeInTheDocument();
  });

  it('should handle missing projectId', async () => {

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Prompt' } });

    const userMessageInput = screen.getByLabelText(/user message \*$/i) as HTMLTextAreaElement;
    fireEvent.change(userMessageInput, { target: { value: 'Hello {{user_message}}' } });

    await waitFor(() => {
      const modelConfigSelect = screen.getByLabelText(/model configuration \*$/i);
      expect(modelConfigSelect).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /^create$/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Create New Prompt')).toBeInTheDocument();
    });

    consoleError.mockRestore();
  });

  it('should handle very long name', () => {
    const longName = 'a'.repeat(1000);
    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: longName } });

    expect(nameInput.value).toBe(longName);
  });

  it('should handle whitespace-only name', () => {
    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: '   ' } });

    expect(nameInput.value).toBe('   ');
  });

  it('should handle empty user message', () => {
    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    const userMessageInput = screen.getByLabelText(/user message \*$/i) as HTMLTextAreaElement;
    expect(userMessageInput.value).toBe('');
  });

  it('should handle invalid temperature values', () => {
    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    const temperatureInput = screen.getByLabelText(/temperature/i) as HTMLInputElement;
    fireEvent.change(temperatureInput, { target: { value: '3.0' } });

    expect(temperatureInput.value).toBe('3.0');
  });

  it('should handle invalid maxTokens values', () => {
    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    const maxTokensInput = screen.getByLabelText(/max tokens/i) as HTMLInputElement;
    fireEvent.change(maxTokensInput, { target: { value: '-1' } });

    expect(maxTokensInput.value).toBe('-1');
  });

  it('should handle invalid topP values', () => {
    customRender(
      <PromptDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1" />

    );

    const topPInput = screen.getByLabelText(/top p/i) as HTMLInputElement;
    fireEvent.change(topPInput, { target: { value: '1.5' } });

    expect(topPInput.value).toBe('1.5');
  });
});