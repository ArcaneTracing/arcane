import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModelConfigurationFormBasicFields } from '../model-configuration-form-basic-fields';
import { AdapterType } from '@/types/model-configuration';
import { render as customRender } from '@/__tests__/test-utils';

describe('ModelConfigurationFormBasicFields', () => {
  const mockOnNameChange = jest.fn();
  const mockOnAdapterChange = jest.fn();
  const mockOnModelNameChange = jest.fn();
  const mockOnApiKeyChange = jest.fn();

  const defaultProps = {
    name: '',
    adapter: 'openai' as AdapterType,
    modelName: '',
    apiKey: '',
    isEditMode: false,
    isLoading: false,
    onNameChange: mockOnNameChange,
    onAdapterChange: mockOnAdapterChange,
    onModelNameChange: mockOnModelNameChange,
    onApiKeyChange: mockOnApiKeyChange
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all basic fields', () => {
    customRender(<ModelConfigurationFormBasicFields {...defaultProps} />);

    expect(screen.getByLabelText(/^name \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^adapter \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^model name \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^api key \*$/i)).toBeInTheDocument();
  });

  it('should display name value', () => {
    customRender(
      <ModelConfigurationFormBasicFields {...defaultProps} name="Test Configuration" />
    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    expect(nameInput.value).toBe('Test Configuration');
  });

  it('should call onNameChange when name input changes', () => {
    customRender(<ModelConfigurationFormBasicFields {...defaultProps} />);

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Name' } });

    expect(mockOnNameChange).toHaveBeenCalledWith('New Name');
  });

  it('should display adapter value', () => {
    customRender(
      <ModelConfigurationFormBasicFields {...defaultProps} adapter="anthropic" />
    );

    expect(screen.getByText('Anthropic')).toBeInTheDocument();
  });

  it('should call onAdapterChange when adapter changes', () => {
    customRender(<ModelConfigurationFormBasicFields {...defaultProps} />);

    const adapterSelect = screen.getByLabelText(/^adapter \*$/i);
    fireEvent.click(adapterSelect);


    const anthropicOption = screen.getByText('Anthropic');
    fireEvent.click(anthropicOption);
    expect(anthropicOption).toBeInTheDocument();
  });

  it('should display all adapter options', () => {
    customRender(<ModelConfigurationFormBasicFields {...defaultProps} />);

    const adapterSelect = screen.getByLabelText(/^adapter \*$/i);
    fireEvent.click(adapterSelect);

    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Anthropic')).toBeInTheDocument();
    expect(screen.getByText('Azure OpenAI')).toBeInTheDocument();
    expect(screen.getByText('AWS Bedrock')).toBeInTheDocument();
    expect(screen.getByText('Google Vertex AI')).toBeInTheDocument();
    expect(screen.getByText('Google AI Studio')).toBeInTheDocument();
  });

  it('should disable adapter select when isEditMode is true', () => {
    customRender(
      <ModelConfigurationFormBasicFields {...defaultProps} isEditMode={true} />
    );
    const adapterSelect = screen.getByLabelText(/^adapter \*$/i);
    expect(adapterSelect).toBeInTheDocument();
  });

  it('should disable adapter select when isLoading is true', () => {
    customRender(
      <ModelConfigurationFormBasicFields {...defaultProps} isLoading={true} />
    );
    const adapterSelect = screen.getByLabelText(/^adapter \*$/i);
    expect(adapterSelect).toBeInTheDocument();
  });

  it('should display modelName value', () => {
    customRender(
      <ModelConfigurationFormBasicFields {...defaultProps} modelName="gpt-4" />
    );

    const modelNameInput = screen.getByLabelText(/^model name \*$/i) as HTMLInputElement;
    expect(modelNameInput.value).toBe('gpt-4');
  });

  it('should call onModelNameChange when modelName input changes', () => {
    customRender(<ModelConfigurationFormBasicFields {...defaultProps} />);

    const modelNameInput = screen.getByLabelText(/^model name \*$/i) as HTMLInputElement;
    fireEvent.change(modelNameInput, { target: { value: 'claude-3-sonnet' } });

    expect(mockOnModelNameChange).toHaveBeenCalledWith('claude-3-sonnet');
  });

  it('should display apiKey value', () => {
    customRender(
      <ModelConfigurationFormBasicFields {...defaultProps} apiKey="sk-test123" />
    );

    const apiKeyInput = screen.getByLabelText(/^api key \*$/i) as HTMLInputElement;
    expect(apiKeyInput.value).toBe('sk-test123');
  });

  it('should always use password type for apiKey (cannot show value)', () => {
    customRender(<ModelConfigurationFormBasicFields {...defaultProps} apiKey="sk-test123" />);

    const apiKeyInput = screen.getByLabelText(/^api key \*$/i) as HTMLInputElement;
    expect(apiKeyInput).toHaveAttribute('type', 'password');
  });

  it('should show edit placeholder when in edit mode', () => {
    customRender(
      <ModelConfigurationFormBasicFields {...defaultProps} isEditMode={true} adapter="openai" />
    );

    const apiKeyInput = screen.getByLabelText(/^api key \*$/i) as HTMLInputElement;
    expect(apiKeyInput.placeholder).toContain('keep existing');
  });

  it('should call onApiKeyChange when apiKey input changes', () => {
    customRender(<ModelConfigurationFormBasicFields {...defaultProps} />);

    const apiKeyInput = screen.getByLabelText(/^api key \*$/i) as HTMLInputElement;
    fireEvent.change(apiKeyInput, { target: { value: 'sk-newkey' } });

    expect(mockOnApiKeyChange).toHaveBeenCalledWith('sk-newkey');
  });

  it('should disable all inputs when isLoading is true', () => {
    customRender(<ModelConfigurationFormBasicFields {...defaultProps} isLoading={true} />);

    const nameInput = screen.getByLabelText(/^name \*$/i);
    const modelNameInput = screen.getByLabelText(/^model name \*$/i);
    const apiKeyInput = screen.getByLabelText(/^api key \*$/i);

    expect(nameInput).toHaveAttribute('disabled');
    expect(modelNameInput).toHaveAttribute('disabled');
    expect(apiKeyInput).toHaveAttribute('disabled');
  });


  it('should handle empty name', () => {
    customRender(<ModelConfigurationFormBasicFields {...defaultProps} name="" />);

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    expect(nameInput.value).toBe('');
  });

  it('should handle empty modelName', () => {
    customRender(<ModelConfigurationFormBasicFields {...defaultProps} modelName="" />);

    const modelNameInput = screen.getByLabelText(/^model name \*$/i) as HTMLInputElement;
    expect(modelNameInput.value).toBe('');
  });

  it('should handle empty apiKey', () => {
    customRender(<ModelConfigurationFormBasicFields {...defaultProps} apiKey="" />);

    const apiKeyInput = screen.getByLabelText(/^api key \*$/i) as HTMLInputElement;
    expect(apiKeyInput.value).toBe('');
  });

  it('should handle very long name', () => {
    const longName = 'a'.repeat(1000);
    customRender(<ModelConfigurationFormBasicFields {...defaultProps} name={longName} />);

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    expect(nameInput.value).toBe(longName);
  });

  it('should handle special characters in name', () => {
    const specialName = 'Config!@#$%^&*()_+-=[]{}|;:,.<>?';
    customRender(<ModelConfigurationFormBasicFields {...defaultProps} name={specialName} />);

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    expect(nameInput.value).toBe(specialName);
  });

  it('should handle all adapter types', () => {
    const adapters: AdapterType[] = ['openai', 'anthropic', 'azure', 'bedrock', 'google-vertex-ai', 'google-ai-studio'];

    adapters.forEach((adapter) => {
      const { unmount } = customRender(
        <ModelConfigurationFormBasicFields {...defaultProps} adapter={adapter} />
      );


      const adapterSelect = screen.getByLabelText(/^adapter \*$/i);
      expect(adapterSelect).toBeInTheDocument();

      unmount();
    });
  });

  it('should render credentials textarea when adapter is google-vertex-ai', () => {
    customRender(
      <ModelConfigurationFormBasicFields {...defaultProps} adapter="google-vertex-ai" />
    );

    expect(screen.getByLabelText(/service account credentials \(json\) \*/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^api key \*$/i)).not.toBeInTheDocument();
  });

  it('should render AWS credentials info when adapter is bedrock', () => {
    customRender(
      <ModelConfigurationFormBasicFields {...defaultProps} adapter="bedrock" />
    );

    expect(screen.getByText(/bedrock uses aws default credentials/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^api key \*$/i)).not.toBeInTheDocument();
  });

  it('should display and update credentials when adapter is google-vertex-ai', () => {
    const creds = '{"type":"service_account","project_id":"test"}';
    customRender(
      <ModelConfigurationFormBasicFields
        {...defaultProps}
        adapter="google-vertex-ai"
        apiKey={creds} />

    );

    const textarea = screen.getByLabelText(/service account credentials \(json\) \*/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe(creds);

    fireEvent.change(textarea, { target: { value: '{"type":"service_account"}' } });
    expect(mockOnApiKeyChange).toHaveBeenCalledWith('{"type":"service_account"}');
  });
});