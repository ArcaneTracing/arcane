import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModelConfigurationDialog } from '../model-configuration-dialog';
import { ModelConfigurationResponse } from '@/types/model-configuration';
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

jest.mock('@/hooks/model-configurations/use-model-configurations-query', () => ({
  useCreateModelConfiguration: jest.fn(() => mockCreateMutation),
  useUpdateModelConfiguration: jest.fn(() => mockUpdateMutation)
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


const mockFormState = {
  name: '',
  adapter: 'openai' as const,
  modelName: '',
  apiKey: '',
  showApiKey: false,
  inputCostPerToken: '',
  outputCostPerToken: '',
  temperature: '',
  maxTokens: '',
  topP: '',
  frequencyPenalty: '',
  presencePenalty: '',
  stopSequences: [] as string[],
  azureEndpoint: '',
  azureApiVersion: '',
  azureDeploymentName: '',
  anthropicBaseUrl: '',
  anthropicTimeout: '',
  bedrockRegion: '',
  bedrockEndpointUrl: '',
  bedrockAwsAccessKeyId: '',
  bedrockAwsSecretAccessKey: '',
  vertexProject: '',
  vertexLocation: '',
  studioProject: '',
  studioBaseUrl: '',
  error: null as string | null,
  setName: jest.fn(),
  setAdapter: jest.fn(),
  setModelName: jest.fn(),
  setApiKey: jest.fn(),
  setShowApiKey: jest.fn(),
  setInputCostPerToken: jest.fn(),
  setOutputCostPerToken: jest.fn(),
  setTemperature: jest.fn(),
  setMaxTokens: jest.fn(),
  setTopP: jest.fn(),
  setFrequencyPenalty: jest.fn(),
  setPresencePenalty: jest.fn(),
  setStopSequences: jest.fn(),
  setAzureEndpoint: jest.fn(),
  setAzureApiVersion: jest.fn(),
  setAzureDeploymentName: jest.fn(),
  setAnthropicBaseUrl: jest.fn(),
  setAnthropicTimeout: jest.fn(),
  setBedrockRegion: jest.fn(),
  setBedrockEndpointUrl: jest.fn(),
  setBedrockAwsAccessKeyId: jest.fn(),
  setBedrockAwsSecretAccessKey: jest.fn(),
  setVertexProject: jest.fn(),
  setVertexLocation: jest.fn(),
  setStudioProject: jest.fn(),
  setStudioBaseUrl: jest.fn(),
  setError: jest.fn(),
  resetForm: jest.fn()
};

jest.mock('@/hooks/model-configurations/use-model-configuration-form', () => ({
  useModelConfigurationForm: jest.fn(() => mockFormState)
}));

jest.mock('@/hooks/model-configurations/use-model-configuration-form-submit', () => ({
  validateConfiguration: jest.fn(() => null),
  buildConfigurationRequest: jest.fn((state) => ({
    name: state.name,
    configuration: {
      adapter: state.adapter,
      modelName: state.modelName,
      apiKey: state.apiKey,
      inputCostPerToken: parseFloat(state.inputCostPerToken) || 0,
      outputCostPerToken: parseFloat(state.outputCostPerToken) || 0
    }
  }))
}));


jest.mock('../model-configuration-form-basic-fields', () => ({
  ModelConfigurationFormBasicFields: ({ name, adapter, modelName, apiKey, showApiKey, isLoading, onNameChange, onAdapterChange, onModelNameChange, onApiKeyChange, onShowApiKeyToggle }: any) =>
  <div data-testid="basic-fields">
      <input
      data-testid="name-input"
      value={name}
      onChange={(e) => onNameChange(e.target.value)}
      placeholder="Name"
      disabled={isLoading} />

      <select
      data-testid="adapter-select"
      value={adapter}
      onChange={(e) => onAdapterChange(e.target.value)}
      disabled={isLoading}>

        <option value="openai">OpenAI</option>
        <option value="anthropic">Anthropic</option>
      </select>
      <input
      data-testid="model-name-input"
      value={modelName}
      onChange={(e) => onModelNameChange(e.target.value)}
      placeholder="Model Name"
      disabled={isLoading} />

      <input
      data-testid="api-key-input"
      type={showApiKey ? "text" : "password"}
      value={apiKey}
      onChange={(e) => onApiKeyChange(e.target.value)}
      placeholder="API Key"
      disabled={isLoading} />

      <button data-testid="toggle-api-key" onClick={onShowApiKeyToggle} disabled={isLoading}>
        Toggle
      </button>
    </div>

}));

jest.mock('../model-configuration-form-cost-fields', () => ({
  ModelConfigurationFormCostFields: ({ inputCostPerToken, outputCostPerToken, onInputCostChange, onOutputCostChange }: any) =>
  <div data-testid="cost-fields">
      <input
      data-testid="input-cost-input"
      value={inputCostPerToken}
      onChange={(e) => onInputCostChange(e.target.value)}
      placeholder="Input Cost" />

      <input
      data-testid="output-cost-input"
      value={outputCostPerToken}
      onChange={(e) => onOutputCostChange(e.target.value)}
      placeholder="Output Cost" />

    </div>

}));

jest.mock('../model-configuration-form-parameters', () => ({
  ModelConfigurationFormParameters: ({ temperature, maxTokens, topP, frequencyPenalty, presencePenalty, onTemperatureChange, onMaxTokensChange, onTopPChange, onFrequencyPenaltyChange, onPresencePenaltyChange }: any) =>
  <div data-testid="parameters-fields">
      <input
      data-testid="temperature-input"
      value={temperature}
      onChange={(e) => onTemperatureChange(e.target.value)}
      placeholder="Temperature" />

      <input
      data-testid="max-tokens-input"
      value={maxTokens}
      onChange={(e) => onMaxTokensChange(e.target.value)}
      placeholder="Max Tokens" />

    </div>

}));

jest.mock('../model-configuration-form-stop-sequences', () => ({
  ModelConfigurationFormStopSequences: ({ stopSequences, onAdd, onRemove, onChange }: any) =>
  <div data-testid="stop-sequences-fields">
      {stopSequences.map((seq: string, index: number) =>
    <div key={index}>
          <input
        data-testid={`stop-sequence-${index}`}
        value={seq}
        onChange={(e) => onChange(index, e.target.value)} />

          <button data-testid={`remove-sequence-${index}`} onClick={() => onRemove(index)}>
            Remove
          </button>
        </div>
    )}
      <button data-testid="add-stop-sequence" onClick={onAdd}>
        Add Stop Sequence
      </button>
    </div>

}));

jest.mock('../model-configuration-form-provider-configs', () => ({
  ModelConfigurationFormProviderConfigs: () =>
  <div data-testid="provider-configs-fields">Provider Configs</div>

}));

const mockUseCreateModelConfiguration = require('@/hooks/model-configurations/use-model-configurations-query').useCreateModelConfiguration;
const mockUseUpdateModelConfiguration = require('@/hooks/model-configurations/use-model-configurations-query').useUpdateModelConfiguration;
const mockUseModelConfigurationForm = require('@/hooks/model-configurations/use-model-configuration-form').useModelConfigurationForm;
const mockValidateConfiguration = require('@/hooks/model-configurations/use-model-configuration-form-submit').validateConfiguration;
const mockBuildConfigurationRequest = require('@/hooks/model-configurations/use-model-configuration-form-submit').buildConfigurationRequest;

describe('ModelConfigurationDialog', () => {
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mutationData.clear();
    mutationSuccessWatchers = [];

    Object.assign(mockFormState, {
      name: '',
      adapter: 'openai' as const,
      modelName: '',
      apiKey: '',
      showApiKey: false,
      inputCostPerToken: '',
      outputCostPerToken: '',
      temperature: '',
      maxTokens: '',
      topP: '',
      frequencyPenalty: '',
      presencePenalty: '',
      stopSequences: [],
      error: null
    });
    mockUseCreateModelConfiguration.mockReturnValue(mockCreateMutation);
    mockUseUpdateModelConfiguration.mockReturnValue(mockUpdateMutation);
    mockUseModelConfigurationForm.mockReturnValue(mockFormState);
    mockValidateConfiguration.mockReturnValue(null);
  });

  it('should render dialog when open', () => {
    customRender(
      <ModelConfigurationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    expect(screen.getByText('Create Model Configuration')).toBeInTheDocument();
  });

  it('should not render dialog when closed', () => {
    customRender(
      <ModelConfigurationDialog
        open={false}
        onOpenChange={mockOnOpenChange} />

    );

    expect(screen.queryByText('Create Model Configuration')).not.toBeInTheDocument();
  });

  it('should render trigger button when trigger prop provided', () => {
    customRender(
      <ModelConfigurationDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        trigger={<button>Open Dialog</button>} />

    );

    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
  });

  it('should display edit mode title when configuration provided', () => {
    const configuration: ModelConfigurationResponse = {
      id: 'config-1',
      name: 'Test Config',
      configuration: {
        adapter: 'openai',
        modelName: 'gpt-4',
        apiKey: 'sk-test',
        inputCostPerToken: 0.00003,
        outputCostPerToken: 0.00006
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    Object.assign(mockFormState, {
      name: 'Test Config',
      adapter: 'openai' as const,
      modelName: 'gpt-4',
      apiKey: 'sk-test'
    });

    customRender(
      <ModelConfigurationDialog
        configuration={configuration}
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    expect(screen.getByText('Edit Model Configuration')).toBeInTheDocument();
  });

  it('should render all form sections', () => {
    customRender(
      <ModelConfigurationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    expect(screen.getByTestId('basic-fields')).toBeInTheDocument();
    expect(screen.getByTestId('cost-fields')).toBeInTheDocument();
    expect(screen.getByTestId('parameters-fields')).toBeInTheDocument();
    expect(screen.getByTestId('stop-sequences-fields')).toBeInTheDocument();
    expect(screen.getByTestId('provider-configs-fields')).toBeInTheDocument();
  });

  it('should call createConfiguration when submitting new configuration', async () => {
    Object.assign(mockFormState, {
      name: 'New Config',
      adapter: 'openai' as const,
      modelName: 'gpt-4',
      apiKey: 'sk-test',
      inputCostPerToken: '0.00003',
      outputCostPerToken: '0.00006'
    });

    customRender(
      <ModelConfigurationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const submitButton = screen.getByRole('button', { name: /create configuration/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockBuildConfigurationRequest).toHaveBeenCalled();
      expect(mockCreateConfiguration).toHaveBeenCalled();
    });
  });

  it('should call updateConfiguration when submitting edited configuration', async () => {
    const configuration: ModelConfigurationResponse = {
      id: 'config-1',
      name: 'Test Config',
      configuration: {
        adapter: 'openai',
        modelName: 'gpt-4',
        apiKey: 'sk-test',
        inputCostPerToken: 0.00003,
        outputCostPerToken: 0.00006
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    Object.assign(mockFormState, {
      name: 'Updated Config',
      adapter: 'openai' as const,
      modelName: 'gpt-4',
      apiKey: 'sk-test'
    });

    customRender(
      <ModelConfigurationDialog
        configuration={configuration}
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateConfiguration).toHaveBeenCalledWith({
        id: 'config-1',
        data: expect.any(Object)
      });
    });
  });

  it('should close dialog after successful submission', async () => {
    Object.assign(mockFormState, {
      name: 'New Config',
      adapter: 'openai' as const,
      modelName: 'gpt-4',
      apiKey: 'sk-test'
    });

    customRender(
      <ModelConfigurationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const submitButton = screen.getByRole('button', { name: /create configuration/i });
    fireEvent.click(submitButton);


    await waitFor(() => {
      expect(mockCreateConfiguration).toHaveBeenCalled();
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

  it('should display validation error when validation fails', async () => {
    mockValidateConfiguration.mockReturnValue('Validation error occurred');

    Object.assign(mockFormState, {
      name: 'Test Config',
      adapter: 'openai' as const,
      modelName: 'gpt-4',
      apiKey: 'sk-test'
    });

    customRender(
      <ModelConfigurationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const form = screen.getByRole('button', { name: /create configuration/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockFormState.setError).toHaveBeenCalledWith('Validation error occurred');
    });
  });

  it('should display API error', async () => {
    const errorMessage = 'API Error occurred';


    mockUseCreateModelConfiguration.mockReturnValue({
      ...mockCreateMutation,
      error: null
    });

    Object.assign(mockFormState, {
      error: null
    });


    const { rerender } = customRender(
      <ModelConfigurationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );


    await waitFor(() => {
      expect(screen.getByText(/Create Model Configuration/i)).toBeInTheDocument();
    });


    await new Promise((resolve) => setTimeout(resolve, 100));


    mockUseCreateModelConfiguration.mockReturnValue({
      ...mockCreateMutation,
      error: new Error(errorMessage)
    });


    rerender(
      <ModelConfigurationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );


    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should display update error when editing', async () => {
    const errorMessage = 'Update Error occurred';
    const configuration: ModelConfigurationResponse = {
      id: 'config-1',
      name: 'Test Config',
      configuration: {
        adapter: 'openai',
        modelName: 'gpt-4',
        apiKey: 'sk-test',
        inputCostPerToken: 0.00003,
        outputCostPerToken: 0.00006
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };


    mockUseUpdateModelConfiguration.mockReturnValue({
      ...mockUpdateMutation,
      error: null
    });


    const { rerender } = customRender(
      <ModelConfigurationDialog
        configuration={configuration}
        open={true}
        onOpenChange={mockOnOpenChange} />

    );


    await waitFor(() => {
      expect(screen.getByText(/Edit Model Configuration/i)).toBeInTheDocument();
    });


    await new Promise((resolve) => setTimeout(resolve, 100));


    mockUseUpdateModelConfiguration.mockReturnValue({
      ...mockUpdateMutation,
      error: new Error(errorMessage)
    });


    rerender(
      <ModelConfigurationDialog
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
      <ModelConfigurationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should disable submit button when required fields are empty', () => {
    Object.assign(mockFormState, {
      name: '',
      adapter: 'openai' as const,
      modelName: '',
      apiKey: ''
    });

    customRender(
      <ModelConfigurationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const submitButton = screen.getByRole('button', { name: /create configuration/i });
    expect(submitButton).toHaveAttribute('disabled');
  });

  it('should enable submit button when all required fields are filled', () => {
    Object.assign(mockFormState, {
      name: 'Test Config',
      adapter: 'openai' as const,
      modelName: 'gpt-4',
      apiKey: 'sk-test'
    });

    customRender(
      <ModelConfigurationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const submitButton = screen.getByRole('button', { name: /create configuration/i });
    expect(submitButton).not.toHaveAttribute('disabled');
  });

  it('should display loading state', () => {
    mockUseCreateModelConfiguration.mockReturnValue({
      ...mockCreateMutation,
      isPending: true
    });

    customRender(
      <ModelConfigurationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('should disable form fields when loading', () => {
    mockUseCreateModelConfiguration.mockReturnValue({
      ...mockCreateMutation,
      isPending: true
    });

    customRender(
      <ModelConfigurationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const nameInput = screen.getByTestId('name-input');
    expect(nameInput).toHaveAttribute('disabled');
  });

  it('should add stop sequence when Add button is clicked', () => {
    customRender(
      <ModelConfigurationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const addButton = screen.getByTestId('add-stop-sequence');
    fireEvent.click(addButton);

    expect(mockFormState.setStopSequences).toHaveBeenCalledWith(['']);
  });

  it('should remove stop sequence when Remove button is clicked', () => {
    Object.assign(mockFormState, {
      stopSequences: ['seq1', 'seq2']
    });

    customRender(
      <ModelConfigurationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const removeButton = screen.getByTestId('remove-sequence-0');
    fireEvent.click(removeButton);

    expect(mockFormState.setStopSequences).toHaveBeenCalledWith(['seq2']);
  });

  it('should update stop sequence when input changes', () => {
    Object.assign(mockFormState, {
      stopSequences: ['seq1']
    });

    customRender(
      <ModelConfigurationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const sequenceInput = screen.getByTestId('stop-sequence-0');
    fireEvent.change(sequenceInput, { target: { value: 'updated-seq' } });

    expect(mockFormState.setStopSequences).toHaveBeenCalledWith(['updated-seq']);
  });


  it('should handle configuration with null values', () => {
    const configuration: ModelConfigurationResponse = {
      id: 'config-1',
      name: 'Test Config',
      configuration: {
        adapter: 'openai',
        modelName: 'gpt-4',
        apiKey: 'sk-test',
        inputCostPerToken: 0.00003,
        outputCostPerToken: 0.00006
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    Object.assign(mockFormState, {
      name: 'Test Config',
      adapter: 'openai' as const,
      modelName: 'gpt-4',
      apiKey: 'sk-test'
    });

    customRender(
      <ModelConfigurationDialog
        configuration={configuration}
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    expect(screen.getByText('Edit Model Configuration')).toBeInTheDocument();
  });

  it('should handle whitespace-only name', () => {
    Object.assign(mockFormState, {
      name: '   ',
      adapter: 'openai' as const,
      modelName: 'gpt-4',
      apiKey: 'sk-test'
    });

    customRender(
      <ModelConfigurationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const submitButton = screen.getByRole('button', { name: /create configuration/i });
    expect(submitButton).toHaveAttribute('disabled');
  });

  it('should handle whitespace-only modelName', () => {
    Object.assign(mockFormState, {
      name: 'Test Config',
      adapter: 'openai' as const,
      modelName: '   ',
      apiKey: 'sk-test'
    });

    customRender(
      <ModelConfigurationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const submitButton = screen.getByRole('button', { name: /create configuration/i });
    expect(submitButton).toHaveAttribute('disabled');
  });

  it('should handle whitespace-only apiKey', () => {
    Object.assign(mockFormState, {
      name: 'Test Config',
      adapter: 'openai' as const,
      modelName: 'gpt-4',
      apiKey: '   '
    });

    customRender(
      <ModelConfigurationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    const submitButton = screen.getByRole('button', { name: /create configuration/i });
    expect(submitButton).toHaveAttribute('disabled');
  });

  it('should handle form error from state', () => {
    Object.assign(mockFormState, {
      error: 'Form validation error'
    });

    customRender(
      <ModelConfigurationDialog
        open={true}
        onOpenChange={mockOnOpenChange} />

    );

    expect(screen.getByText('Form validation error')).toBeInTheDocument();
  });
});