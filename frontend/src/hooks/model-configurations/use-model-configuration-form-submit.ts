import { AdapterType, ModelConfigurationData, CreateModelConfigurationRequest } from "@/types/model-configuration"
import { ModelConfigurationFormState } from "./use-model-configuration-form"

export interface BuildConfigurationParams extends ModelConfigurationFormState {
  adapter: AdapterType
  isEditMode?: boolean
}

type ParseCostParams = {
  inputCostPerToken: string
  outputCostPerToken: string
}

export function parseCosts({ inputCostPerToken, outputCostPerToken }: ParseCostParams): {
  inputCost: number
  outputCost: number
} {
  const inputCost = inputCostPerToken.trim() ? Number.parseFloat(inputCostPerToken) : 0
  const outputCost = outputCostPerToken.trim() ? Number.parseFloat(outputCostPerToken) : 0

  return {
    inputCost: !Number.isNaN(inputCost) && inputCost >= 0 ? inputCost : 0,
    outputCost: !Number.isNaN(outputCost) && outputCost >= 0 ? outputCost : 0,
  }
}

type AddOptionalNumericParams = {
  temperature?: string
  maxTokens?: string
  topP?: string
  frequencyPenalty?: string
  presencePenalty?: string
}

export function addOptionalNumericParams(
  config: ModelConfigurationData,
  { temperature, maxTokens, topP, frequencyPenalty, presencePenalty }: AddOptionalNumericParams
): void {
  if (temperature?.trim()) {
    const temp = Number.parseFloat(temperature)
    if (!Number.isNaN(temp)) config.temperature = temp
  }
  if (maxTokens?.trim()) {
    const max = Number.parseInt(maxTokens)
    if (!Number.isNaN(max)) config.maxTokens = max
  }
  if (topP?.trim()) {
    const top = Number.parseFloat(topP)
    if (!Number.isNaN(top)) config.topP = top
  }
  if (frequencyPenalty?.trim()) {
    const freq = Number.parseFloat(frequencyPenalty)
    if (!Number.isNaN(freq)) config.frequencyPenalty = freq
  }
  if (presencePenalty?.trim()) {
    const pres = Number.parseFloat(presencePenalty)
    if (!Number.isNaN(pres)) config.presencePenalty = pres
  }
}

type BuildAzureConfigParams = {
  azureEndpoint: string
  azureApiVersion: string
  azureDeploymentName: string
}

export function buildAzureConfig({ azureEndpoint, azureApiVersion, azureDeploymentName }: BuildAzureConfigParams): Record<string, string> {
  const config: Record<string, string> = {
    endpoint: azureEndpoint.trim(),
  }
  if (azureApiVersion.trim()) config.apiVersion = azureApiVersion.trim()
  if (azureDeploymentName.trim()) config.deploymentName = azureDeploymentName.trim()
  return config
}

type BuildAnthropicConfigParams = {
  anthropicBaseUrl: string
  anthropicTimeout: string
}

export function buildAnthropicConfig({ anthropicBaseUrl, anthropicTimeout }: BuildAnthropicConfigParams): Record<string, string | number> {
  const config: Record<string, string | number> = {}
  if (anthropicBaseUrl.trim()) config.baseUrl = anthropicBaseUrl.trim()
  if (anthropicTimeout.trim()) {
    const timeout = Number.parseInt(anthropicTimeout)
    if (!Number.isNaN(timeout)) config.timeout = timeout
  }
  return config
}

type BuildBedrockConfigParams = {
  bedrockRegion: string
  bedrockEndpointUrl: string
  bedrockAwsAccessKeyId: string | null
  bedrockAwsSecretAccessKey: string | null
}

export function buildBedrockConfig({
  bedrockRegion,
  bedrockEndpointUrl,
  bedrockAwsAccessKeyId,
  bedrockAwsSecretAccessKey,
}: BuildBedrockConfigParams): Record<string, string> {
  const config: Record<string, string> = {
    region: bedrockRegion.trim(),
  }
  if (bedrockEndpointUrl.trim()) config.endpointUrl = bedrockEndpointUrl.trim()
  if (bedrockAwsAccessKeyId?.trim()) config.awsAccessKeyId = bedrockAwsAccessKeyId.trim()
  if (bedrockAwsSecretAccessKey?.trim()) config.awsSecretAccessKey = bedrockAwsSecretAccessKey.trim()
  return config
}

type BuildGoogleVertexAiConfigParams = {
  vertexProject: string
  vertexLocation: string
}

export function buildGoogleVertexAiConfig({ vertexProject, vertexLocation }: BuildGoogleVertexAiConfigParams): Record<string, string> {
  const config: Record<string, string> = {}
  if (vertexProject.trim()) config.project = vertexProject.trim()
  if (vertexLocation.trim()) config.location = vertexLocation.trim()
  return config
}

type BuildGoogleAiStudioConfigParams = {
  studioProject: string
  studioBaseUrl: string
}

export function buildGoogleAiStudioConfig({ studioProject, studioBaseUrl }: BuildGoogleAiStudioConfigParams): Record<string, string> {
  const config: Record<string, string> = {}
  if (studioProject.trim()) config.project = studioProject.trim()
  if (studioBaseUrl.trim()) config.baseUrl = studioBaseUrl.trim()
  return config
}

type BuildProviderConfigParams = {
  adapter: AdapterType
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
}

export function buildProviderConfig(params: BuildProviderConfigParams): Record<string, unknown> | undefined {
  switch (params.adapter) {
    case 'azure':
      return buildAzureConfig({
        azureEndpoint: params.azureEndpoint,
        azureApiVersion: params.azureApiVersion,
        azureDeploymentName: params.azureDeploymentName,
      })
    case 'anthropic':
      return buildAnthropicConfig({
        anthropicBaseUrl: params.anthropicBaseUrl,
        anthropicTimeout: params.anthropicTimeout,
      })
    case 'bedrock':
      return buildBedrockConfig({
        bedrockRegion: params.bedrockRegion,
        bedrockEndpointUrl: params.bedrockEndpointUrl,
        bedrockAwsAccessKeyId: params.bedrockAwsAccessKeyId,
        bedrockAwsSecretAccessKey: params.bedrockAwsSecretAccessKey,
      })
    case 'google-vertex-ai':
      return buildGoogleVertexAiConfig({
        vertexProject: params.vertexProject,
        vertexLocation: params.vertexLocation,
      })
    case 'google-ai-studio':
      return buildGoogleAiStudioConfig({
        studioProject: params.studioProject,
        studioBaseUrl: params.studioBaseUrl,
      })
    default:
      return undefined
  }
}

function getApiKeyForRequest(params: BuildConfigurationParams): string | null {
  if (params.adapter === "bedrock") return ""
  if (params.isEditMode && !params.apiKey.trim()) return null
  return params.apiKey.trim()
}

export function buildConfigurationRequest(params: BuildConfigurationParams): CreateModelConfigurationRequest {
  const { inputCost, outputCost } = parseCosts({
    inputCostPerToken: params.inputCostPerToken,
    outputCostPerToken: params.outputCostPerToken,
  })

  const apiKeyValue = getApiKeyForRequest(params)

  const config: ModelConfigurationData = {
    adapter: params.adapter,
    modelName: params.modelName.trim(),
    apiKey: apiKeyValue,
    inputCostPerToken: inputCost,
    outputCostPerToken: outputCost,
  }

  addOptionalNumericParams(config, {
    temperature: params.temperature,
    maxTokens: params.maxTokens,
    topP: params.topP,
    frequencyPenalty: params.frequencyPenalty,
    presencePenalty: params.presencePenalty,
  })

  const validStopSequences = params.stopSequences.filter((s) => s.trim() !== '')
  if (validStopSequences.length > 0) {
    config.stopSequences = validStopSequences
  }

  const bedrockAwsKeyId: string | null =
    params.isEditMode && !params.bedrockAwsAccessKeyId.trim()
      ? null
      : params.bedrockAwsAccessKeyId.trim()
  const bedrockAwsSecret: string | null =
    params.isEditMode && !params.bedrockAwsSecretAccessKey.trim()
      ? null
      : params.bedrockAwsSecretAccessKey.trim()

  const providerConfig = buildProviderConfig({
    adapter: params.adapter,
    azureEndpoint: params.azureEndpoint,
    azureApiVersion: params.azureApiVersion,
    azureDeploymentName: params.azureDeploymentName,
    anthropicBaseUrl: params.anthropicBaseUrl,
    anthropicTimeout: params.anthropicTimeout,
    bedrockRegion: params.bedrockRegion,
    bedrockEndpointUrl: params.bedrockEndpointUrl,
    bedrockAwsAccessKeyId: bedrockAwsKeyId,
    bedrockAwsSecretAccessKey: bedrockAwsSecret,
    vertexProject: params.vertexProject,
    vertexLocation: params.vertexLocation,
    studioProject: params.studioProject,
    studioBaseUrl: params.studioBaseUrl,
  })

  if (providerConfig && Object.keys(providerConfig).length > 0) {
    config.config = providerConfig
  }

  return {
    name: params.name.trim(),
    configuration: config,
  }
}

function getEmptyApiKeyErrorMessage(adapter: AdapterType): string {
  return adapter === "google-vertex-ai"
    ? "Service account credentials (JSON) cannot be empty"
    : "API key cannot be empty"
}

function validateVertexAiCredentials(apiKey: string): string | null {
  try {
    const parsed = JSON.parse(apiKey.trim())
    if (typeof parsed !== "object" || parsed === null) {
      return "Credentials must be a valid JSON object"
    }
    if (!parsed.type || parsed.type !== "service_account") {
      return "Credentials must be a service account JSON (type: service_account)"
    }
  } catch {
    return "Invalid JSON. Paste the full service account credentials from GCP Console."
  }
  return null
}

function validateCostField(value: string, fieldLabel: string): string | null {
  if (!value.trim()) return null
  const num = Number.parseFloat(value)
  if (Number.isNaN(num) || num < 0) {
    return `${fieldLabel} must be a number >= 0`
  }
  return null
}

function validateProviderSpecific(params: BuildConfigurationParams): string | null {
  if (params.adapter === "azure" && !params.azureEndpoint.trim()) {
    return "Azure endpoint is required"
  }
  if (params.adapter === "bedrock" && !params.bedrockRegion.trim()) {
    return "AWS region is required for Bedrock"
  }
  return null
}

export function validateConfiguration(params: BuildConfigurationParams): string | null {
  if (!params.name.trim()) return "Name cannot be empty"
  if (!params.modelName.trim()) return "Model name cannot be empty"

  if (
    !params.apiKey.trim() &&
    params.adapter !== "bedrock" &&
    !params.isEditMode
  ) {
    return getEmptyApiKeyErrorMessage(params.adapter)
  }

  if (params.adapter === "google-vertex-ai" && !(params.isEditMode && !params.apiKey.trim())) {
    const error = validateVertexAiCredentials(params.apiKey)
    if (error) return error
  }

  const inputCostError = validateCostField(params.inputCostPerToken, "Input cost per token")
  if (inputCostError) return inputCostError

  const outputCostError = validateCostField(params.outputCostPerToken, "Output cost per token")
  if (outputCostError) return outputCostError

  return validateProviderSpecific(params)
}

