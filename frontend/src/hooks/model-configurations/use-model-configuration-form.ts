import { useState, useEffect } from "react"
import { ModelConfigurationResponse, AdapterType } from "@/types/model-configuration"
import { isMaskedSensitiveValue } from "./sensitive-field-utils"
type SetBasicFormFieldsParams = {
  configuration: ModelConfigurationResponse
  setName: (value: string) => void
  setAdapter: (value: AdapterType) => void
  setModelName: (value: string) => void
  setApiKey: (value: string) => void
  setInputCostPerToken: (value: string) => void
  setOutputCostPerToken: (value: string) => void
  setTemperature: (value: string) => void
  setMaxTokens: (value: string) => void
  setTopP: (value: string) => void
  setFrequencyPenalty: (value: string) => void
  setPresencePenalty: (value: string) => void
  setStopSequences: (value: string[]) => void
}
export function setBasicFormFields({
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
  setStopSequences,
}: SetBasicFormFieldsParams): void {
  const config = configuration.configuration
  setName(configuration.name || '')
  setAdapter(config.adapter || 'openai')
  setModelName(config.modelName || '')
  setApiKey(isMaskedSensitiveValue(config.apiKey || '') ? '' : (config.apiKey || ''))
  setInputCostPerToken(String(config.inputCostPerToken || ''))
  setOutputCostPerToken(String(config.outputCostPerToken || ''))
  setTemperature(config.temperature === undefined ? '' : String(config.temperature))
  setMaxTokens(config.maxTokens === undefined ? '' : String(config.maxTokens))
  setTopP(config.topP === undefined ? '' : String(config.topP))
  setFrequencyPenalty(config.frequencyPenalty === undefined ? '' : String(config.frequencyPenalty))
  setPresencePenalty(config.presencePenalty === undefined ? '' : String(config.presencePenalty))
  setStopSequences(config.stopSequences || [])
}
export function formatTimeout(timeout: unknown): string {
  if (timeout == null) return ''
  if (typeof timeout === 'object') {
    return JSON.stringify(timeout)
  }
  return String(timeout)
}
type SetProviderConfigParams = {
  adapter: AdapterType
  providerConfig: Record<string, unknown>
  setAzureEndpoint: (value: string) => void
  setAzureApiVersion: (value: string) => void
  setAzureDeploymentName: (value: string) => void
  setAnthropicBaseUrl: (value: string) => void
  setAnthropicTimeout: (value: string) => void
  setBedrockRegion: (value: string) => void
  setBedrockEndpointUrl: (value: string) => void
  setBedrockAwsAccessKeyId: (value: string) => void
  setBedrockAwsSecretAccessKey: (value: string) => void
  setVertexProject: (value: string) => void
  setVertexLocation: (value: string) => void
  setStudioProject: (value: string) => void
  setStudioBaseUrl: (value: string) => void
}
export function setProviderConfig({
  adapter,
  providerConfig,
  setAzureEndpoint,
  setAzureApiVersion,
  setAzureDeploymentName,
  setAnthropicBaseUrl,
  setAnthropicTimeout,
  setBedrockRegion,
  setBedrockEndpointUrl,
  setBedrockAwsAccessKeyId,
  setBedrockAwsSecretAccessKey,
  setVertexProject,
  setVertexLocation,
  setStudioProject,
  setStudioBaseUrl,
}: SetProviderConfigParams): void {
  switch (adapter) {
    case 'azure':
      setAzureEndpoint((providerConfig.endpoint as string) || '')
      setAzureApiVersion((providerConfig.apiVersion as string) || '')
      setAzureDeploymentName((providerConfig.deploymentName as string) || '')
      break
    case 'anthropic':
      setAnthropicBaseUrl((providerConfig.baseUrl as string) || '')
      setAnthropicTimeout(formatTimeout(providerConfig.timeout))
      break
    case 'bedrock': {
      const awsKeyId = (providerConfig.awsAccessKeyId as string) || ''
      const awsSecret = (providerConfig.awsSecretAccessKey as string) || ''
      setBedrockRegion((providerConfig.region as string) || '')
      setBedrockEndpointUrl((providerConfig.endpointUrl as string) || '')
      setBedrockAwsAccessKeyId(isMaskedSensitiveValue(awsKeyId) ? '' : awsKeyId)
      setBedrockAwsSecretAccessKey(isMaskedSensitiveValue(awsSecret) ? '' : awsSecret)
      break
    }
    case 'google-vertex-ai':
      setVertexProject((providerConfig.project as string) || '')
      setVertexLocation((providerConfig.location as string) || '')
      break
    case 'google-ai-studio':
      setStudioProject((providerConfig.project as string) || '')
      setStudioBaseUrl((providerConfig.baseUrl as string) || '')
      break
  }
}
export interface ModelConfigurationFormState {
  name: string
  adapter: AdapterType
  modelName: string
  apiKey: string
  showApiKey: boolean
  
  inputCostPerToken: string
  outputCostPerToken: string
  
  temperature: string
  maxTokens: string
  topP: string
  frequencyPenalty: string
  presencePenalty: string
  stopSequences: string[]
  
  azureEndpoint: string
  azureApiVersion: string
  azureDeploymentName: string
  anthropicBaseUrl: string
  anthropicTimeout: string
  bedrockRegion: string
  bedrockEndpointUrl: string
  bedrockAwsAccessKeyId: string
  bedrockAwsSecretAccessKey: string
  vertexProject: string
  vertexLocation: string
  studioProject: string
  studioBaseUrl: string
  
  error: string | null
}
export interface UseModelConfigurationFormReturn extends ModelConfigurationFormState {
  setName: (name: string) => void
  setAdapter: (adapter: AdapterType) => void
  setModelName: (modelName: string) => void
  setApiKey: (apiKey: string) => void
  setShowApiKey: (show: boolean) => void
  setInputCostPerToken: (value: string) => void
  setOutputCostPerToken: (value: string) => void
  setTemperature: (value: string) => void
  setMaxTokens: (value: string) => void
  setTopP: (value: string) => void
  setFrequencyPenalty: (value: string) => void
  setPresencePenalty: (value: string) => void
  setStopSequences: (sequences: string[]) => void
  setAzureEndpoint: (value: string) => void
  setAzureApiVersion: (value: string) => void
  setAzureDeploymentName: (value: string) => void
  setAnthropicBaseUrl: (value: string) => void
  setAnthropicTimeout: (value: string) => void
  setBedrockRegion: (value: string) => void
  setBedrockEndpointUrl: (value: string) => void
  setBedrockAwsAccessKeyId: (value: string) => void
  setBedrockAwsSecretAccessKey: (value: string) => void
  setVertexProject: (value: string) => void
  setVertexLocation: (value: string) => void
  setStudioProject: (value: string) => void
  setStudioBaseUrl: (value: string) => void
  setError: (error: string | null) => void
  resetForm: () => void
}
export function useModelConfigurationForm(
  configuration: ModelConfigurationResponse | null | undefined,
  open: boolean
): UseModelConfigurationFormReturn {
  const [name, setName] = useState("")
  const [adapter, setAdapter] = useState<AdapterType>("openai")
  const [modelName, setModelName] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [inputCostPerToken, setInputCostPerToken] = useState("")
  const [outputCostPerToken, setOutputCostPerToken] = useState("")
  const [temperature, setTemperature] = useState("")
  const [maxTokens, setMaxTokens] = useState("")
  const [topP, setTopP] = useState("")
  const [frequencyPenalty, setFrequencyPenalty] = useState("")
  const [presencePenalty, setPresencePenalty] = useState("")
  const [stopSequences, setStopSequences] = useState<string[]>([])
  const [azureEndpoint, setAzureEndpoint] = useState("")
  const [azureApiVersion, setAzureApiVersion] = useState("")
  const [azureDeploymentName, setAzureDeploymentName] = useState("")
  const [anthropicBaseUrl, setAnthropicBaseUrl] = useState("")
  const [anthropicTimeout, setAnthropicTimeout] = useState("")
  const [bedrockRegion, setBedrockRegion] = useState("")
  const [bedrockEndpointUrl, setBedrockEndpointUrl] = useState("")
  const [bedrockAwsAccessKeyId, setBedrockAwsAccessKeyId] = useState("")
  const [bedrockAwsSecretAccessKey, setBedrockAwsSecretAccessKey] = useState("")
  const [vertexProject, setVertexProject] = useState("")
  const [vertexLocation, setVertexLocation] = useState("")
  const [studioProject, setStudioProject] = useState("")
  const [studioBaseUrl, setStudioBaseUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const resetForm = () => {
    setName("")
    setAdapter("openai")
    setModelName("")
    setApiKey("")
    setShowApiKey(false)
    setInputCostPerToken("")
    setOutputCostPerToken("")
    setTemperature("")
    setMaxTokens("")
    setTopP("")
    setFrequencyPenalty("")
    setPresencePenalty("")
    setStopSequences([])
    setAzureEndpoint("")
    setAzureApiVersion("")
    setAzureDeploymentName("")
    setAnthropicBaseUrl("")
    setAnthropicTimeout("")
    setBedrockRegion("")
    setBedrockEndpointUrl("")
    setBedrockAwsAccessKeyId("")
    setBedrockAwsSecretAccessKey("")
    setVertexProject("")
    setVertexLocation("")
    setStudioProject("")
    setStudioBaseUrl("")
    setError(null)
  }
  useEffect(() => {
    if (!open) {
      return
    }
    if (configuration) {
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
        setStopSequences,
      })
      const providerConfig = configuration.configuration.config || {}
      setProviderConfig({
        adapter: configuration.configuration.adapter,
        providerConfig,
        setAzureEndpoint,
        setAzureApiVersion,
        setAzureDeploymentName,
        setAnthropicBaseUrl,
        setAnthropicTimeout,
        setBedrockRegion,
        setBedrockEndpointUrl,
        setBedrockAwsAccessKeyId,
        setBedrockAwsSecretAccessKey,
        setVertexProject,
        setVertexLocation,
        setStudioProject,
        setStudioBaseUrl,
      })
    } else {
      resetForm()
    }
    setError(null)
  }, [open, configuration?.id])
  return {
    name,
    adapter,
    modelName,
    apiKey,
    showApiKey,
    inputCostPerToken,
    outputCostPerToken,
    temperature,
    maxTokens,
    topP,
    frequencyPenalty,
    presencePenalty,
    stopSequences,
    azureEndpoint,
    azureApiVersion,
    azureDeploymentName,
    anthropicBaseUrl,
    anthropicTimeout,
    bedrockRegion,
    bedrockEndpointUrl,
    bedrockAwsAccessKeyId,
    bedrockAwsSecretAccessKey,
    vertexProject,
    vertexLocation,
    studioProject,
    studioBaseUrl,
    error,
    setName,
    setAdapter,
    setModelName,
    setApiKey,
    setShowApiKey,
    setInputCostPerToken,
    setOutputCostPerToken,
    setTemperature,
    setMaxTokens,
    setTopP,
    setFrequencyPenalty,
    setPresencePenalty,
    setStopSequences,
    setAzureEndpoint,
    setAzureApiVersion,
    setAzureDeploymentName,
    setAnthropicBaseUrl,
    setAnthropicTimeout,
    setBedrockRegion,
    setBedrockEndpointUrl,
    setBedrockAwsAccessKeyId,
    setBedrockAwsSecretAccessKey,
    setVertexProject,
    setVertexLocation,
    setStudioProject,
    setStudioBaseUrl,
    setError,
    resetForm,
  }
}
