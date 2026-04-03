import {
  setBasicFormFields,
  formatTimeout,
  setProviderConfig } from
'../use-model-configuration-form';
import type { ModelConfigurationResponse } from '@/types/model-configuration';

describe('setBasicFormFields', () => {
  it('sets all basic form fields from configuration', () => {
    const setName = jest.fn();
    const setAdapter = jest.fn();
    const setModelName = jest.fn();
    const setApiKey = jest.fn();
    const setInputCostPerToken = jest.fn();
    const setOutputCostPerToken = jest.fn();
    const setTemperature = jest.fn();
    const setMaxTokens = jest.fn();
    const setTopP = jest.fn();
    const setFrequencyPenalty = jest.fn();
    const setPresencePenalty = jest.fn();
    const setStopSequences = jest.fn();

    const configuration: ModelConfigurationResponse = {
      id: '1',
      name: 'Test Config',
      configuration: {
        adapter: 'openai',
        modelName: 'gpt-4',
        apiKey: 'sk-test',
        inputCostPerToken: 0.001,
        outputCostPerToken: 0.002,
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
        frequencyPenalty: 0.5,
        presencePenalty: 0.3,
        stopSequences: ['end', 'stop']
      }
    };

    setBasicFormFields({
      configuration,
      setName,
      setAdapter,
      setModelName,
      setApiKey,
      setInputCostPerToken,
      setOutputCostPerToken,
      setTemperature,
      setMaxTokens,
      setTopP,
      setFrequencyPenalty,
      setPresencePenalty,
      setStopSequences
    });

    expect(setName).toHaveBeenCalledWith('Test Config');
    expect(setAdapter).toHaveBeenCalledWith('openai');
    expect(setModelName).toHaveBeenCalledWith('gpt-4');
    expect(setApiKey).toHaveBeenCalledWith('sk-test');
    expect(setInputCostPerToken).toHaveBeenCalledWith('0.001');
    expect(setOutputCostPerToken).toHaveBeenCalledWith('0.002');
    expect(setTemperature).toHaveBeenCalledWith('0.7');
    expect(setMaxTokens).toHaveBeenCalledWith('1000');
    expect(setTopP).toHaveBeenCalledWith('0.9');
    expect(setFrequencyPenalty).toHaveBeenCalledWith('0.5');
    expect(setPresencePenalty).toHaveBeenCalledWith('0.3');
    expect(setStopSequences).toHaveBeenCalledWith(['end', 'stop']);
  });

  it('uses default values when fields are missing', () => {
    const setName = jest.fn();
    const setAdapter = jest.fn();
    const setModelName = jest.fn();
    const setApiKey = jest.fn();
    const setInputCostPerToken = jest.fn();
    const setOutputCostPerToken = jest.fn();
    const setTemperature = jest.fn();
    const setMaxTokens = jest.fn();
    const setTopP = jest.fn();
    const setFrequencyPenalty = jest.fn();
    const setPresencePenalty = jest.fn();
    const setStopSequences = jest.fn();

    const configuration: ModelConfigurationResponse = {
      id: '1',
      name: '',
      configuration: {
        adapter: 'openai',
        modelName: '',
        apiKey: '',
        inputCostPerToken: 0,
        outputCostPerToken: 0
      }
    };

    setBasicFormFields({
      configuration,
      setName,
      setAdapter,
      setModelName,
      setApiKey,
      setInputCostPerToken,
      setOutputCostPerToken,
      setTemperature,
      setMaxTokens,
      setTopP,
      setFrequencyPenalty,
      setPresencePenalty,
      setStopSequences
    });

    expect(setName).toHaveBeenCalledWith('');
    expect(setAdapter).toHaveBeenCalledWith('openai');
    expect(setModelName).toHaveBeenCalledWith('');
    expect(setApiKey).toHaveBeenCalledWith('');
    expect(setInputCostPerToken).toHaveBeenCalledWith('');
    expect(setOutputCostPerToken).toHaveBeenCalledWith('');
    expect(setTemperature).toHaveBeenCalledWith('');
    expect(setMaxTokens).toHaveBeenCalledWith('');
    expect(setTopP).toHaveBeenCalledWith('');
    expect(setFrequencyPenalty).toHaveBeenCalledWith('');
    expect(setPresencePenalty).toHaveBeenCalledWith('');
    expect(setStopSequences).toHaveBeenCalledWith([]);
  });

  it('handles undefined optional fields', () => {
    const setTemperature = jest.fn();
    const setMaxTokens = jest.fn();
    const setTopP = jest.fn();
    const setFrequencyPenalty = jest.fn();
    const setPresencePenalty = jest.fn();

    const configuration: ModelConfigurationResponse = {
      id: '1',
      name: 'Test',
      configuration: {
        adapter: 'openai',
        modelName: 'gpt-4',
        apiKey: 'sk-test',
        inputCostPerToken: 0,
        outputCostPerToken: 0
      }
    };

    setBasicFormFields({
      configuration,
      setName: jest.fn(),
      setAdapter: jest.fn(),
      setModelName: jest.fn(),
      setApiKey: jest.fn(),
      setInputCostPerToken: jest.fn(),
      setOutputCostPerToken: jest.fn(),
      setTemperature,
      setMaxTokens,
      setTopP,
      setFrequencyPenalty,
      setPresencePenalty,
      setStopSequences: jest.fn()
    });

    expect(setTemperature).toHaveBeenCalledWith('');
    expect(setMaxTokens).toHaveBeenCalledWith('');
    expect(setTopP).toHaveBeenCalledWith('');
    expect(setFrequencyPenalty).toHaveBeenCalledWith('');
    expect(setPresencePenalty).toHaveBeenCalledWith('');
  });
});

describe('formatTimeout', () => {
  it('returns empty string when timeout is null', () => {
    expect(formatTimeout(null)).toBe('');
  });

  it('returns empty string when timeout is undefined', () => {
    expect(formatTimeout(undefined)).toBe('');
  });

  it('converts number to string', () => {
    expect(formatTimeout(60)).toBe('60');
  });

  it('converts string to string', () => {
    expect(formatTimeout('60')).toBe('60');
  });

  it('converts object to JSON string', () => {
    const obj = { value: 60 };
    expect(formatTimeout(obj)).toBe('{"value":60}');
  });

  it('handles complex objects', () => {
    const obj = { timeout: 60, unit: 'seconds' };
    expect(formatTimeout(obj)).toBe('{"timeout":60,"unit":"seconds"}');
  });

  it('handles arrays', () => {
    expect(formatTimeout([1, 2, 3])).toBe('[1,2,3]');
  });
});

describe('setProviderConfig', () => {
  it('sets Azure config fields', () => {
    const setAzureEndpoint = jest.fn();
    const setAzureApiVersion = jest.fn();
    const setAzureDeploymentName = jest.fn();

    setProviderConfig({
      adapter: 'azure',
      providerConfig: {
        endpoint: 'https://azure.openai.azure.com',
        apiVersion: '2024-01-01',
        deploymentName: 'gpt-4'
      },
      setAzureEndpoint,
      setAzureApiVersion,
      setAzureDeploymentName,
      setAnthropicBaseUrl: jest.fn(),
      setAnthropicTimeout: jest.fn(),
      setBedrockRegion: jest.fn(),
      setBedrockEndpointUrl: jest.fn(),
      setBedrockAwsAccessKeyId: jest.fn(),
      setBedrockAwsSecretAccessKey: jest.fn(),
      setVertexProject: jest.fn(),
      setVertexLocation: jest.fn(),
      setStudioProject: jest.fn(),
      setStudioBaseUrl: jest.fn()
    });

    expect(setAzureEndpoint).toHaveBeenCalledWith('https://azure.openai.azure.com');
    expect(setAzureApiVersion).toHaveBeenCalledWith('2024-01-01');
    expect(setAzureDeploymentName).toHaveBeenCalledWith('gpt-4');
  });

  it('sets Anthropic config fields', () => {
    const setAnthropicBaseUrl = jest.fn();
    const setAnthropicTimeout = jest.fn();

    setProviderConfig({
      adapter: 'anthropic',
      providerConfig: {
        baseUrl: 'https://api.anthropic.com',
        timeout: 60
      },
      setAzureEndpoint: jest.fn(),
      setAzureApiVersion: jest.fn(),
      setAzureDeploymentName: jest.fn(),
      setAnthropicBaseUrl,
      setAnthropicTimeout,
      setBedrockRegion: jest.fn(),
      setBedrockEndpointUrl: jest.fn(),
      setBedrockAwsAccessKeyId: jest.fn(),
      setBedrockAwsSecretAccessKey: jest.fn(),
      setVertexProject: jest.fn(),
      setVertexLocation: jest.fn(),
      setStudioProject: jest.fn(),
      setStudioBaseUrl: jest.fn()
    });

    expect(setAnthropicBaseUrl).toHaveBeenCalledWith('https://api.anthropic.com');
    expect(setAnthropicTimeout).toHaveBeenCalledWith('60');
  });

  it('sets Bedrock config fields', () => {
    const setBedrockRegion = jest.fn();
    const setBedrockEndpointUrl = jest.fn();
    const setBedrockAwsAccessKeyId = jest.fn();
    const setBedrockAwsSecretAccessKey = jest.fn();

    setProviderConfig({
      adapter: 'bedrock',
      providerConfig: {
        region: 'us-east-1',
        endpointUrl: 'https://bedrock.us-east-1.amazonaws.com',
        awsAccessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        awsSecretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
      },
      setAzureEndpoint: jest.fn(),
      setAzureApiVersion: jest.fn(),
      setAzureDeploymentName: jest.fn(),
      setAnthropicBaseUrl: jest.fn(),
      setAnthropicTimeout: jest.fn(),
      setBedrockRegion,
      setBedrockEndpointUrl,
      setBedrockAwsAccessKeyId,
      setBedrockAwsSecretAccessKey,
      setVertexProject: jest.fn(),
      setVertexLocation: jest.fn(),
      setStudioProject: jest.fn(),
      setStudioBaseUrl: jest.fn()
    });

    expect(setBedrockRegion).toHaveBeenCalledWith('us-east-1');
    expect(setBedrockEndpointUrl).toHaveBeenCalledWith('https://bedrock.us-east-1.amazonaws.com');
    expect(setBedrockAwsAccessKeyId).toHaveBeenCalledWith('AKIAIOSFODNN7EXAMPLE');
    expect(setBedrockAwsSecretAccessKey).toHaveBeenCalledWith('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
  });

  it('sets Google Vertex AI config fields', () => {
    const setVertexProject = jest.fn();
    const setVertexLocation = jest.fn();

    setProviderConfig({
      adapter: 'google-vertex-ai',
      providerConfig: {
        project: 'my-project',
        location: 'us-central1'
      },
      setAzureEndpoint: jest.fn(),
      setAzureApiVersion: jest.fn(),
      setAzureDeploymentName: jest.fn(),
      setAnthropicBaseUrl: jest.fn(),
      setAnthropicTimeout: jest.fn(),
      setBedrockRegion: jest.fn(),
      setBedrockEndpointUrl: jest.fn(),
      setBedrockAwsAccessKeyId: jest.fn(),
      setBedrockAwsSecretAccessKey: jest.fn(),
      setVertexProject,
      setVertexLocation,
      setStudioProject: jest.fn(),
      setStudioBaseUrl: jest.fn()
    });

    expect(setVertexProject).toHaveBeenCalledWith('my-project');
    expect(setVertexLocation).toHaveBeenCalledWith('us-central1');
  });

  it('sets Google AI Studio config fields', () => {
    const setStudioProject = jest.fn();
    const setStudioBaseUrl = jest.fn();

    setProviderConfig({
      adapter: 'google-ai-studio',
      providerConfig: {
        project: 'my-project',
        baseUrl: 'https://generativelanguage.googleapis.com'
      },
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
      setStudioProject,
      setStudioBaseUrl
    });

    expect(setStudioProject).toHaveBeenCalledWith('my-project');
    expect(setStudioBaseUrl).toHaveBeenCalledWith('https://generativelanguage.googleapis.com');
  });

  it('uses empty string when provider config fields are missing', () => {
    const setAzureEndpoint = jest.fn();
    const setAzureApiVersion = jest.fn();
    const setAzureDeploymentName = jest.fn();

    setProviderConfig({
      adapter: 'azure',
      providerConfig: {},
      setAzureEndpoint,
      setAzureApiVersion,
      setAzureDeploymentName,
      setAnthropicBaseUrl: jest.fn(),
      setAnthropicTimeout: jest.fn(),
      setBedrockRegion: jest.fn(),
      setBedrockEndpointUrl: jest.fn(),
      setBedrockAwsAccessKeyId: jest.fn(),
      setBedrockAwsSecretAccessKey: jest.fn(),
      setVertexProject: jest.fn(),
      setVertexLocation: jest.fn(),
      setStudioProject: jest.fn(),
      setStudioBaseUrl: jest.fn()
    });

    expect(setAzureEndpoint).toHaveBeenCalledWith('');
    expect(setAzureApiVersion).toHaveBeenCalledWith('');
    expect(setAzureDeploymentName).toHaveBeenCalledWith('');
  });

  it('handles openai adapter (no provider config)', () => {
    const setAzureEndpoint = jest.fn();
    const setAnthropicBaseUrl = jest.fn();

    setProviderConfig({
      adapter: 'openai',
      providerConfig: {},
      setAzureEndpoint,
      setAzureApiVersion: jest.fn(),
      setAzureDeploymentName: jest.fn(),
      setAnthropicBaseUrl,
      setAnthropicTimeout: jest.fn(),
      setBedrockRegion: jest.fn(),
      setBedrockEndpointUrl: jest.fn(),
      setBedrockAwsAccessKeyId: jest.fn(),
      setBedrockAwsSecretAccessKey: jest.fn(),
      setVertexProject: jest.fn(),
      setVertexLocation: jest.fn(),
      setStudioProject: jest.fn(),
      setStudioBaseUrl: jest.fn()
    });

    expect(setAzureEndpoint).not.toHaveBeenCalled();
    expect(setAnthropicBaseUrl).not.toHaveBeenCalled();
  });
});