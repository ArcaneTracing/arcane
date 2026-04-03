import {
  buildConfigurationRequest,
  validateConfiguration,
  parseCosts,
  addOptionalNumericParams,
  buildAzureConfig,
  buildAnthropicConfig,
  buildBedrockConfig,
  buildGoogleVertexAiConfig,
  buildGoogleAiStudioConfig,
  buildProviderConfig } from
'../use-model-configuration-form-submit';
import type { BuildConfigurationParams } from '../use-model-configuration-form-submit';
import type { ModelConfigurationData } from '@/types/model-configuration';

const baseParams: BuildConfigurationParams = {
  name: 'Test Config',
  adapter: 'openai',
  modelName: 'gpt-4',
  apiKey: 'sk-test',
  showApiKey: false,
  inputCostPerToken: '0',
  outputCostPerToken: '0',
  temperature: '0.7',
  maxTokens: '1000',
  topP: '1',
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
  error: null
};

describe('buildConfigurationRequest', () => {
  it('builds minimal openai config', () => {
    const result = buildConfigurationRequest(baseParams);
    expect(result.name).toBe('Test Config');
    expect(result.configuration.adapter).toBe('openai');
    expect(result.configuration.modelName).toBe('gpt-4');
    expect(result.configuration.apiKey).toBe('sk-test');
  });

  it('parses optional temperature, maxTokens, topP', () => {
    const result = buildConfigurationRequest({
      ...baseParams,
      temperature: '0.5',
      maxTokens: '500',
      topP: '0.9'
    });
    expect(result.configuration.temperature).toBe(0.5);
    expect(result.configuration.maxTokens).toBe(500);
    expect(result.configuration.topP).toBe(0.9);
  });

  it('builds azure config when adapter is azure', () => {
    const result = buildConfigurationRequest({
      ...baseParams,
      adapter: 'azure',
      azureEndpoint: 'https://azure.openai.azure.com',
      azureApiVersion: '2024-01-01',
      azureDeploymentName: 'gpt-4'
    });
    expect(result.configuration.config?.endpoint).toBe('https://azure.openai.azure.com');
    expect(result.configuration.config?.apiVersion).toBe('2024-01-01');
    expect(result.configuration.config?.deploymentName).toBe('gpt-4');
  });

  it('builds anthropic config with timeout', () => {
    const result = buildConfigurationRequest({
      ...baseParams,
      adapter: 'anthropic',
      anthropicBaseUrl: 'https://api.anthropic.com',
      anthropicTimeout: '60'
    });
    expect(result.configuration.config?.baseUrl).toBe('https://api.anthropic.com');
    expect(result.configuration.config?.timeout).toBe(60);
  });

  it('builds bedrock config', () => {
    const result = buildConfigurationRequest({
      ...baseParams,
      adapter: 'bedrock',
      bedrockRegion: 'us-east-1',
      bedrockEndpointUrl: 'https://bedrock.us-east-1.amazonaws.com'
    });
    expect(result.configuration.config?.region).toBe('us-east-1');
  });

  it('adds stop sequences when provided', () => {
    const result = buildConfigurationRequest({
      ...baseParams,
      stopSequences: ['end', 'stop']
    });
    expect(result.configuration.stopSequences).toEqual(['end', 'stop']);
  });

  it('sends null for empty apiKey in edit mode (keep existing)', () => {
    const result = buildConfigurationRequest({
      ...baseParams,
      apiKey: '',
      isEditMode: true
    });
    expect(result.configuration.apiKey).toBeNull();
  });
});

describe('validateConfiguration', () => {
  it('returns error when name is empty', () => {
    expect(validateConfiguration({ ...baseParams, name: '' })).toBe(
      'Name cannot be empty'
    );
  });

  it('returns error when modelName is empty', () => {
    expect(validateConfiguration({ ...baseParams, modelName: '' })).toBe(
      'Model name cannot be empty'
    );
  });

  it('returns error when apiKey is empty', () => {
    expect(validateConfiguration({ ...baseParams, apiKey: '' })).toBe(
      'API key cannot be empty'
    );
  });

  it('accepts empty apiKey for Bedrock (uses AWS default credentials)', () => {
    expect(
      validateConfiguration({
        ...baseParams,
        adapter: 'bedrock',
        apiKey: '',
        bedrockRegion: 'us-east-1'
      })
    ).toBeNull();
  });

  it('returns error when apiKey is empty for Vertex AI', () => {
    expect(
      validateConfiguration({ ...baseParams, adapter: 'google-vertex-ai', apiKey: '' })
    ).toBe('Service account credentials (JSON) cannot be empty');
  });

  it('returns error for Vertex AI with invalid JSON', () => {
    expect(
      validateConfiguration({
        ...baseParams,
        adapter: 'google-vertex-ai',
        apiKey: 'not valid json'
      })
    ).toBe('Invalid JSON. Paste the full service account credentials from GCP Console.');
  });

  it('returns error for Vertex AI with invalid service account JSON', () => {
    expect(
      validateConfiguration({
        ...baseParams,
        adapter: 'google-vertex-ai',
        apiKey: '{"type": "invalid_type"}'
      })
    ).toBe('Credentials must be a service account JSON (type: service_account)');
  });

  it('accepts valid Vertex AI credentials', () => {
    const validCreds = JSON.stringify({
      type: 'service_account',
      project_id: 'my-project',
      private_key_id: 'key',
      private_key: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n',
      client_email: 'test@project.iam.gserviceaccount.com',
      client_id: '123'
    });
    expect(
      validateConfiguration({
        ...baseParams,
        adapter: 'google-vertex-ai',
        apiKey: validCreds
      })
    ).toBeNull();
  });

  it('returns error for azure without endpoint', () => {
    expect(
      validateConfiguration({ ...baseParams, adapter: 'azure' })
    ).toBe('Azure endpoint is required');
  });

  it('returns error for bedrock without region', () => {
    expect(
      validateConfiguration({ ...baseParams, adapter: 'bedrock' })
    ).toBe('AWS region is required for Bedrock');
  });

  it('returns null when valid', () => {
    expect(validateConfiguration(baseParams)).toBeNull();
  });

  it('allows empty apiKey in edit mode (keep existing)', () => {
    expect(
      validateConfiguration({ ...baseParams, apiKey: '', isEditMode: true })
    ).toBeNull();
  });

  it('allows empty Vertex AI credentials in edit mode (keep existing)', () => {
    expect(
      validateConfiguration({
        ...baseParams,
        adapter: 'google-vertex-ai',
        apiKey: '',
        isEditMode: true
      })
    ).toBeNull();
  });
});

describe('parseCosts', () => {
  it('parses valid cost values', () => {
    const result = parseCosts({
      inputCostPerToken: '0.001',
      outputCostPerToken: '0.002'
    });
    expect(result.inputCost).toBe(0.001);
    expect(result.outputCost).toBe(0.002);
  });

  it('defaults to 0 when values are empty', () => {
    const result = parseCosts({
      inputCostPerToken: '',
      outputCostPerToken: ''
    });
    expect(result.inputCost).toBe(0);
    expect(result.outputCost).toBe(0);
  });

  it('defaults to 0 when values are whitespace only', () => {
    const result = parseCosts({
      inputCostPerToken: '   ',
      outputCostPerToken: '   '
    });
    expect(result.inputCost).toBe(0);
    expect(result.outputCost).toBe(0);
  });

  it('defaults to 0 when values are NaN', () => {
    const result = parseCosts({
      inputCostPerToken: 'invalid',
      outputCostPerToken: 'invalid'
    });
    expect(result.inputCost).toBe(0);
    expect(result.outputCost).toBe(0);
  });

  it('defaults to 0 when values are negative', () => {
    const result = parseCosts({
      inputCostPerToken: '-0.001',
      outputCostPerToken: '-0.002'
    });
    expect(result.inputCost).toBe(0);
    expect(result.outputCost).toBe(0);
  });

  it('accepts zero as valid value', () => {
    const result = parseCosts({
      inputCostPerToken: '0',
      outputCostPerToken: '0'
    });
    expect(result.inputCost).toBe(0);
    expect(result.outputCost).toBe(0);
  });
});

describe('addOptionalNumericParams', () => {
  it('adds temperature when provided', () => {
    const config: ModelConfigurationData = {
      adapter: 'openai',
      modelName: 'test',
      apiKey: 'key',
      inputCostPerToken: 0,
      outputCostPerToken: 0
    };
    addOptionalNumericParams(config, { temperature: '0.7' });
    expect(config.temperature).toBe(0.7);
  });

  it('adds maxTokens when provided', () => {
    const config: ModelConfigurationData = {
      adapter: 'openai',
      modelName: 'test',
      apiKey: 'key',
      inputCostPerToken: 0,
      outputCostPerToken: 0
    };
    addOptionalNumericParams(config, { maxTokens: '1000' });
    expect(config.maxTokens).toBe(1000);
  });

  it('adds topP when provided', () => {
    const config: ModelConfigurationData = {
      adapter: 'openai',
      modelName: 'test',
      apiKey: 'key',
      inputCostPerToken: 0,
      outputCostPerToken: 0
    };
    addOptionalNumericParams(config, { topP: '0.9' });
    expect(config.topP).toBe(0.9);
  });

  it('adds frequencyPenalty when provided', () => {
    const config: ModelConfigurationData = {
      adapter: 'openai',
      modelName: 'test',
      apiKey: 'key',
      inputCostPerToken: 0,
      outputCostPerToken: 0
    };
    addOptionalNumericParams(config, { frequencyPenalty: '0.5' });
    expect(config.frequencyPenalty).toBe(0.5);
  });

  it('adds presencePenalty when provided', () => {
    const config: ModelConfigurationData = {
      adapter: 'openai',
      modelName: 'test',
      apiKey: 'key',
      inputCostPerToken: 0,
      outputCostPerToken: 0
    };
    addOptionalNumericParams(config, { presencePenalty: '0.3' });
    expect(config.presencePenalty).toBe(0.3);
  });

  it('omits invalid numeric values', () => {
    const config: ModelConfigurationData = {
      adapter: 'openai',
      modelName: 'test',
      apiKey: 'key',
      inputCostPerToken: 0,
      outputCostPerToken: 0
    };
    addOptionalNumericParams(config, { temperature: 'invalid' });
    expect(config.temperature).toBeUndefined();
  });

  it('omits empty string values', () => {
    const config: ModelConfigurationData = {
      adapter: 'openai',
      modelName: 'test',
      apiKey: 'key',
      inputCostPerToken: 0,
      outputCostPerToken: 0
    };
    addOptionalNumericParams(config, { temperature: '' });
    expect(config.temperature).toBeUndefined();
  });

  it('adds multiple parameters at once', () => {
    const config: ModelConfigurationData = {
      adapter: 'openai',
      modelName: 'test',
      apiKey: 'key',
      inputCostPerToken: 0,
      outputCostPerToken: 0
    };
    addOptionalNumericParams(config, {
      temperature: '0.7',
      maxTokens: '1000',
      topP: '0.9'
    });
    expect(config.temperature).toBe(0.7);
    expect(config.maxTokens).toBe(1000);
    expect(config.topP).toBe(0.9);
  });
});

describe('buildAzureConfig', () => {
  it('builds config with all fields', () => {
    const result = buildAzureConfig({
      azureEndpoint: 'https://azure.openai.azure.com',
      azureApiVersion: '2024-01-01',
      azureDeploymentName: 'gpt-4'
    });
    expect(result.endpoint).toBe('https://azure.openai.azure.com');
    expect(result.apiVersion).toBe('2024-01-01');
    expect(result.deploymentName).toBe('gpt-4');
  });

  it('trims all string values', () => {
    const result = buildAzureConfig({
      azureEndpoint: '  https://azure.openai.azure.com  ',
      azureApiVersion: '  2024-01-01  ',
      azureDeploymentName: '  gpt-4  '
    });
    expect(result.endpoint).toBe('https://azure.openai.azure.com');
    expect(result.apiVersion).toBe('2024-01-01');
    expect(result.deploymentName).toBe('gpt-4');
  });

  it('omits optional fields when empty', () => {
    const result = buildAzureConfig({
      azureEndpoint: 'https://azure.openai.azure.com',
      azureApiVersion: '',
      azureDeploymentName: ''
    });
    expect(result.endpoint).toBe('https://azure.openai.azure.com');
    expect(result.apiVersion).toBeUndefined();
    expect(result.deploymentName).toBeUndefined();
  });
});

describe('buildAnthropicConfig', () => {
  it('builds config with baseUrl and timeout', () => {
    const result = buildAnthropicConfig({
      anthropicBaseUrl: 'https://api.anthropic.com',
      anthropicTimeout: '60'
    });
    expect(result.baseUrl).toBe('https://api.anthropic.com');
    expect(result.timeout).toBe(60);
  });

  it('trims baseUrl', () => {
    const result = buildAnthropicConfig({
      anthropicBaseUrl: '  https://api.anthropic.com  ',
      anthropicTimeout: '60'
    });
    expect(result.baseUrl).toBe('https://api.anthropic.com');
  });

  it('omits timeout when invalid', () => {
    const result = buildAnthropicConfig({
      anthropicBaseUrl: 'https://api.anthropic.com',
      anthropicTimeout: 'invalid'
    });
    expect(result.baseUrl).toBe('https://api.anthropic.com');
    expect(result.timeout).toBeUndefined();
  });

  it('omits timeout when empty', () => {
    const result = buildAnthropicConfig({
      anthropicBaseUrl: 'https://api.anthropic.com',
      anthropicTimeout: ''
    });
    expect(result.baseUrl).toBe('https://api.anthropic.com');
    expect(result.timeout).toBeUndefined();
  });
});

describe('buildBedrockConfig', () => {
  it('builds config with all fields', () => {
    const result = buildBedrockConfig({
      bedrockRegion: 'us-east-1',
      bedrockEndpointUrl: 'https://bedrock.us-east-1.amazonaws.com',
      bedrockAwsAccessKeyId: 'AKIAIOSFODNN7EXAMPLE',
      bedrockAwsSecretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
    });
    expect(result.region).toBe('us-east-1');
    expect(result.endpointUrl).toBe('https://bedrock.us-east-1.amazonaws.com');
    expect(result.awsAccessKeyId).toBe('AKIAIOSFODNN7EXAMPLE');
    expect(result.awsSecretAccessKey).toBe('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
  });

  it('trims all string values', () => {
    const result = buildBedrockConfig({
      bedrockRegion: '  us-east-1  ',
      bedrockEndpointUrl: '  https://bedrock.us-east-1.amazonaws.com  ',
      bedrockAwsAccessKeyId: '  AKIAIOSFODNN7EXAMPLE  ',
      bedrockAwsSecretAccessKey: '  wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY  '
    });
    expect(result.region).toBe('us-east-1');
    expect(result.endpointUrl).toBe('https://bedrock.us-east-1.amazonaws.com');
    expect(result.awsAccessKeyId).toBe('AKIAIOSFODNN7EXAMPLE');
    expect(result.awsSecretAccessKey).toBe('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
  });

  it('omits optional fields when empty or null', () => {
    const result = buildBedrockConfig({
      bedrockRegion: 'us-east-1',
      bedrockEndpointUrl: '',
      bedrockAwsAccessKeyId: null,
      bedrockAwsSecretAccessKey: null
    });
    expect(result.region).toBe('us-east-1');
    expect(result.endpointUrl).toBeUndefined();
    expect(result.awsAccessKeyId).toBeUndefined();
    expect(result.awsSecretAccessKey).toBeUndefined();
  });
});

describe('buildGoogleVertexAiConfig', () => {
  it('builds config with all fields', () => {
    const result = buildGoogleVertexAiConfig({
      vertexProject: 'my-project',
      vertexLocation: 'us-central1'
    });
    expect(result.project).toBe('my-project');
    expect(result.location).toBe('us-central1');
  });

  it('trims all string values', () => {
    const result = buildGoogleVertexAiConfig({
      vertexProject: '  my-project  ',
      vertexLocation: '  us-central1  '
    });
    expect(result.project).toBe('my-project');
    expect(result.location).toBe('us-central1');
  });

  it('omits fields when empty', () => {
    const result = buildGoogleVertexAiConfig({
      vertexProject: '',
      vertexLocation: ''
    });
    expect(result.project).toBeUndefined();
    expect(result.location).toBeUndefined();
  });
});

describe('buildGoogleAiStudioConfig', () => {
  it('builds config with all fields', () => {
    const result = buildGoogleAiStudioConfig({
      studioProject: 'my-project',
      studioBaseUrl: 'https://generativelanguage.googleapis.com'
    });
    expect(result.project).toBe('my-project');
    expect(result.baseUrl).toBe('https://generativelanguage.googleapis.com');
  });

  it('trims all string values', () => {
    const result = buildGoogleAiStudioConfig({
      studioProject: '  my-project  ',
      studioBaseUrl: '  https://generativelanguage.googleapis.com  '
    });
    expect(result.project).toBe('my-project');
    expect(result.baseUrl).toBe('https://generativelanguage.googleapis.com');
  });

  it('omits fields when empty', () => {
    const result = buildGoogleAiStudioConfig({
      studioProject: '',
      studioBaseUrl: ''
    });
    expect(result.project).toBeUndefined();
    expect(result.baseUrl).toBeUndefined();
  });
});

describe('buildProviderConfig', () => {
  it('builds azure config', () => {
    const result = buildProviderConfig({
      adapter: 'azure',
      azureEndpoint: 'https://azure.openai.azure.com',
      azureApiVersion: '2024-01-01',
      azureDeploymentName: 'gpt-4',
      anthropicBaseUrl: '',
      anthropicTimeout: '',
      bedrockRegion: '',
      bedrockEndpointUrl: '',
      bedrockAwsAccessKeyId: '',
      bedrockAwsSecretAccessKey: '',
      vertexProject: '',
      vertexLocation: '',
      studioProject: '',
      studioBaseUrl: ''
    });
    expect(result?.endpoint).toBe('https://azure.openai.azure.com');
    expect(result?.apiVersion).toBe('2024-01-01');
  });

  it('builds anthropic config', () => {
    const result = buildProviderConfig({
      adapter: 'anthropic',
      azureEndpoint: '',
      azureApiVersion: '',
      azureDeploymentName: '',
      anthropicBaseUrl: 'https://api.anthropic.com',
      anthropicTimeout: '60',
      bedrockRegion: '',
      bedrockEndpointUrl: '',
      bedrockAwsAccessKeyId: '',
      bedrockAwsSecretAccessKey: '',
      vertexProject: '',
      vertexLocation: '',
      studioProject: '',
      studioBaseUrl: ''
    });
    expect(result?.baseUrl).toBe('https://api.anthropic.com');
    expect(result?.timeout).toBe(60);
  });

  it('builds bedrock config', () => {
    const result = buildProviderConfig({
      adapter: 'bedrock',
      azureEndpoint: '',
      azureApiVersion: '',
      azureDeploymentName: '',
      anthropicBaseUrl: '',
      anthropicTimeout: '',
      bedrockRegion: 'us-east-1',
      bedrockEndpointUrl: 'https://bedrock.us-east-1.amazonaws.com',
      bedrockAwsAccessKeyId: '',
      bedrockAwsSecretAccessKey: '',
      vertexProject: '',
      vertexLocation: '',
      studioProject: '',
      studioBaseUrl: ''
    });
    expect(result?.region).toBe('us-east-1');
    expect(result?.endpointUrl).toBe('https://bedrock.us-east-1.amazonaws.com');
  });

  it('builds google-vertex-ai config', () => {
    const result = buildProviderConfig({
      adapter: 'google-vertex-ai',
      azureEndpoint: '',
      azureApiVersion: '',
      azureDeploymentName: '',
      anthropicBaseUrl: '',
      anthropicTimeout: '',
      bedrockRegion: '',
      bedrockEndpointUrl: '',
      bedrockAwsAccessKeyId: '',
      bedrockAwsSecretAccessKey: '',
      vertexProject: 'my-project',
      vertexLocation: 'us-central1',
      studioProject: '',
      studioBaseUrl: ''
    });
    expect(result?.project).toBe('my-project');
    expect(result?.location).toBe('us-central1');
  });

  it('builds google-ai-studio config', () => {
    const result = buildProviderConfig({
      adapter: 'google-ai-studio',
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
      studioProject: 'my-project',
      studioBaseUrl: 'https://generativelanguage.googleapis.com'
    });
    expect(result?.project).toBe('my-project');
    expect(result?.baseUrl).toBe('https://generativelanguage.googleapis.com');
  });

  it('returns undefined for openai adapter', () => {
    const result = buildProviderConfig({
      adapter: 'openai',
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
      studioBaseUrl: ''
    });
    expect(result).toBeUndefined();
  });
});