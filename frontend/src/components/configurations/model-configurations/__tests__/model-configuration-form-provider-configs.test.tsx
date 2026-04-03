import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModelConfigurationFormProviderConfigs } from '../model-configuration-form-provider-configs';
import { AdapterType } from '@/types/model-configuration';
import { ModelConfigurationFormState } from '@/hooks/model-configurations/use-model-configuration-form';
import { render as customRender } from '@/__tests__/test-utils';

describe('ModelConfigurationFormProviderConfigs', () => {
  const mockOnFieldChange = jest.fn();

  const createFormState = (overrides: Partial<ModelConfigurationFormState> = {}): ModelConfigurationFormState => ({
    name: '',
    adapter: 'openai',
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
    error: null,
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render Azure configuration when adapter is azure', () => {
    const formState = createFormState();
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="azure"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    expect(screen.getByText('Azure OpenAI Configuration')).toBeInTheDocument();
    expect(screen.getByLabelText(/^endpoint \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/api version/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/deployment name/i)).toBeInTheDocument();
  });

  it('should call onFieldChange when Azure endpoint changes', () => {
    const formState = createFormState();
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="azure"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    const endpointInput = screen.getByLabelText(/^endpoint \*$/i) as HTMLInputElement;
    fireEvent.change(endpointInput, { target: { value: 'https://test.openai.azure.com' } });

    expect(mockOnFieldChange).toHaveBeenCalledWith('azureEndpoint', 'https://test.openai.azure.com');
  });

  it('should display Azure form state values', () => {
    const formState = createFormState({
      azureEndpoint: 'https://test.openai.azure.com',
      azureApiVersion: '2024-02-15-preview',
      azureDeploymentName: 'gpt-4-deployment'
    });
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="azure"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    const endpointInput = screen.getByLabelText(/^endpoint \*$/i) as HTMLInputElement;
    const apiVersionInput = screen.getByLabelText(/api version/i) as HTMLInputElement;
    const deploymentInput = screen.getByLabelText(/deployment name/i) as HTMLInputElement;

    expect(endpointInput.value).toBe('https://test.openai.azure.com');
    expect(apiVersionInput.value).toBe('2024-02-15-preview');
    expect(deploymentInput.value).toBe('gpt-4-deployment');
  });

  it('should render Anthropic configuration when adapter is anthropic', () => {
    const formState = createFormState();
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="anthropic"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    expect(screen.getByText('Anthropic Configuration')).toBeInTheDocument();
    expect(screen.getByLabelText(/base url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/timeout/i)).toBeInTheDocument();
  });

  it('should call onFieldChange when Anthropic baseUrl changes', () => {
    const formState = createFormState();
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="anthropic"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    const baseUrlInput = screen.getByLabelText(/base url/i) as HTMLInputElement;
    fireEvent.change(baseUrlInput, { target: { value: 'https://api.anthropic.com' } });

    expect(mockOnFieldChange).toHaveBeenCalledWith('anthropicBaseUrl', 'https://api.anthropic.com');
  });

  it('should display Anthropic form state values', () => {
    const formState = createFormState({
      anthropicBaseUrl: 'https://api.anthropic.com',
      anthropicTimeout: '240'
    });
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="anthropic"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    const baseUrlInput = screen.getByLabelText(/base url/i) as HTMLInputElement;
    const timeoutInput = screen.getByLabelText(/timeout/i) as HTMLInputElement;

    expect(baseUrlInput.value).toBe('https://api.anthropic.com');
    expect(timeoutInput.value).toBe('240');
  });

  it('should render Bedrock configuration when adapter is bedrock', () => {
    const formState = createFormState();
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="bedrock"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    expect(screen.getByText('AWS Bedrock Configuration')).toBeInTheDocument();
    expect(screen.getByLabelText(/^region \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/endpoint url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/aws access key id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/aws secret access key/i)).toBeInTheDocument();
  });

  it('should call onFieldChange when Bedrock region changes', () => {
    const formState = createFormState();
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="bedrock"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    const regionInput = screen.getByLabelText(/^region \*$/i) as HTMLInputElement;
    fireEvent.change(regionInput, { target: { value: 'us-east-1' } });

    expect(mockOnFieldChange).toHaveBeenCalledWith('bedrockRegion', 'us-east-1');
  });

  it('should display Bedrock form state values', () => {
    const formState = createFormState({
      bedrockRegion: 'us-east-1',
      bedrockEndpointUrl: 'https://bedrock-runtime.us-east-1.amazonaws.com',
      bedrockAwsAccessKeyId: 'AKIAIOSFODNN7EXAMPLE',
      bedrockAwsSecretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
    });
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="bedrock"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    const regionInput = screen.getByLabelText(/^region \*$/i) as HTMLInputElement;
    const endpointInput = screen.getByLabelText(/endpoint url/i) as HTMLInputElement;
    const accessKeyInput = screen.getByLabelText(/aws access key id/i) as HTMLInputElement;
    const secretKeyInput = screen.getByLabelText(/aws secret access key/i) as HTMLInputElement;

    expect(regionInput.value).toBe('us-east-1');
    expect(endpointInput.value).toBe('https://bedrock-runtime.us-east-1.amazonaws.com');
    expect(accessKeyInput.value).toBe('AKIAIOSFODNN7EXAMPLE');
    expect(secretKeyInput.value).toBe('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
  });

  it('should render Vertex AI configuration when adapter is google-vertex-ai', () => {
    const formState = createFormState();
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="google-vertex-ai"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    expect(screen.getByText('Google Vertex AI Configuration')).toBeInTheDocument();
    expect(screen.getByLabelText(/project/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
  });

  it('should call onFieldChange when Vertex AI project changes', () => {
    const formState = createFormState();
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="google-vertex-ai"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    const projectInput = screen.getByLabelText(/project/i) as HTMLInputElement;
    fireEvent.change(projectInput, { target: { value: 'my-gcp-project' } });

    expect(mockOnFieldChange).toHaveBeenCalledWith('vertexProject', 'my-gcp-project');
  });

  it('should display Vertex AI form state values', () => {
    const formState = createFormState({
      vertexProject: 'my-gcp-project',
      vertexLocation: 'us-central1'
    });
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="google-vertex-ai"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    const projectInput = screen.getByLabelText(/project/i) as HTMLInputElement;
    const locationInput = screen.getByLabelText(/location/i) as HTMLInputElement;

    expect(projectInput.value).toBe('my-gcp-project');
    expect(locationInput.value).toBe('us-central1');
  });

  it('should render Google AI Studio configuration when adapter is google-ai-studio', () => {
    const formState = createFormState();
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="google-ai-studio"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    expect(screen.getByText('Google AI Studio Configuration')).toBeInTheDocument();
    expect(screen.getByLabelText(/project/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/base url/i)).toBeInTheDocument();
  });

  it('should call onFieldChange when Google AI Studio project changes', () => {
    const formState = createFormState();
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="google-ai-studio"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    const projectInput = screen.getByLabelText(/project/i) as HTMLInputElement;
    fireEvent.change(projectInput, { target: { value: 'my-gcp-project' } });

    expect(mockOnFieldChange).toHaveBeenCalledWith('studioProject', 'my-gcp-project');
  });

  it('should display Google AI Studio form state values', () => {
    const formState = createFormState({
      studioProject: 'my-gcp-project',
      studioBaseUrl: 'https://generativelanguage.googleapis.com'
    });
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="google-ai-studio"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    const projectInput = screen.getByLabelText(/project/i) as HTMLInputElement;
    const baseUrlInput = screen.getByLabelText(/base url/i) as HTMLInputElement;

    expect(projectInput.value).toBe('my-gcp-project');
    expect(baseUrlInput.value).toBe('https://generativelanguage.googleapis.com');
  });

  it('should return null when adapter is openai', () => {
    const formState = createFormState();
    const { container } = customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="openai"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );


    expect(screen.queryByText(/Configuration/i)).not.toBeInTheDocument();
  });

  it('should disable all inputs when isLoading is true', () => {
    const formState = createFormState();
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="azure"
        formState={formState}
        isLoading={true}
        onFieldChange={mockOnFieldChange} />

    );

    const endpointInput = screen.getByLabelText(/^endpoint \*$/i);
    const apiVersionInput = screen.getByLabelText(/api version/i);
    const deploymentInput = screen.getByLabelText(/deployment name/i);

    expect(endpointInput).toHaveAttribute('disabled');
    expect(apiVersionInput).toHaveAttribute('disabled');
    expect(deploymentInput).toHaveAttribute('disabled');
  });


  it('should handle empty form state values', () => {
    const formState = createFormState();
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="azure"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    const endpointInput = screen.getByLabelText(/^endpoint \*$/i) as HTMLInputElement;
    expect(endpointInput.value).toBe('');
  });

  it('should handle special characters in input values', () => {
    const formState = createFormState({
      azureEndpoint: 'https://test.openai.azure.com/path?param=value&other=123'
    });
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="azure"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    const endpointInput = screen.getByLabelText(/^endpoint \*$/i) as HTMLInputElement;
    expect(endpointInput.value).toBe('https://test.openai.azure.com/path?param=value&other=123');
  });

  it('should handle numeric timeout value', () => {
    const formState = createFormState({
      anthropicTimeout: '300'
    });
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="anthropic"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    const timeoutInput = screen.getByLabelText(/timeout/i) as HTMLInputElement;
    expect(timeoutInput.value).toBe('300');
    expect(timeoutInput).toHaveAttribute('type', 'number');
  });

  it('should call onFieldChange when Azure API version changes', () => {
    const formState = createFormState();
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="azure"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    const apiVersionInput = screen.getByLabelText(/api version/i) as HTMLInputElement;
    fireEvent.change(apiVersionInput, { target: { value: '2024-02-15-preview' } });

    expect(mockOnFieldChange).toHaveBeenCalledWith('azureApiVersion', '2024-02-15-preview');
  });

  it('should call onFieldChange when Azure deployment name changes', () => {
    const formState = createFormState();
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="azure"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    const deploymentInput = screen.getByLabelText(/deployment name/i) as HTMLInputElement;
    fireEvent.change(deploymentInput, { target: { value: 'gpt-4-deployment' } });

    expect(mockOnFieldChange).toHaveBeenCalledWith('azureDeploymentName', 'gpt-4-deployment');
  });

  it('should call onFieldChange when Anthropic timeout changes', () => {
    const formState = createFormState();
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="anthropic"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    const timeoutInput = screen.getByLabelText(/timeout/i) as HTMLInputElement;
    fireEvent.change(timeoutInput, { target: { value: '300' } });

    expect(mockOnFieldChange).toHaveBeenCalledWith('anthropicTimeout', '300');
  });

  it('should call onFieldChange when Bedrock endpoint URL changes', () => {
    const formState = createFormState();
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="bedrock"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    const endpointInput = screen.getByLabelText(/endpoint url/i) as HTMLInputElement;
    fireEvent.change(endpointInput, { target: { value: 'https://bedrock-runtime.us-east-1.amazonaws.com' } });

    expect(mockOnFieldChange).toHaveBeenCalledWith('bedrockEndpointUrl', 'https://bedrock-runtime.us-east-1.amazonaws.com');
  });

  it('should call onFieldChange when Bedrock AWS access key ID changes', () => {
    const formState = createFormState();
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="bedrock"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    const accessKeyInput = screen.getByLabelText(/aws access key id/i) as HTMLInputElement;
    fireEvent.change(accessKeyInput, { target: { value: 'AKIAIOSFODNN7EXAMPLE' } });

    expect(mockOnFieldChange).toHaveBeenCalledWith('bedrockAwsAccessKeyId', 'AKIAIOSFODNN7EXAMPLE');
  });

  it('should call onFieldChange when Bedrock AWS secret access key changes', () => {
    const formState = createFormState();
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="bedrock"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    const secretKeyInput = screen.getByLabelText(/aws secret access key/i) as HTMLInputElement;
    fireEvent.change(secretKeyInput, { target: { value: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' } });

    expect(mockOnFieldChange).toHaveBeenCalledWith('bedrockAwsSecretAccessKey', 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
  });

  it('should call onFieldChange when Vertex AI location changes', () => {
    const formState = createFormState();
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="google-vertex-ai"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    const locationInput = screen.getByLabelText(/location/i) as HTMLInputElement;
    fireEvent.change(locationInput, { target: { value: 'us-west1' } });

    expect(mockOnFieldChange).toHaveBeenCalledWith('vertexLocation', 'us-west1');
  });

  it('should call onFieldChange when Google AI Studio base URL changes', () => {
    const formState = createFormState();
    customRender(
      <ModelConfigurationFormProviderConfigs
        adapter="google-ai-studio"
        formState={formState}
        isLoading={false}
        isEditMode={false}
        onFieldChange={mockOnFieldChange} />

    );

    const baseUrlInput = screen.getByLabelText(/base url/i) as HTMLInputElement;
    fireEvent.change(baseUrlInput, { target: { value: 'https://generativelanguage.googleapis.com' } });

    expect(mockOnFieldChange).toHaveBeenCalledWith('studioBaseUrl', 'https://generativelanguage.googleapis.com');
  });
});