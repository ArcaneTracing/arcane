"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdapterType } from "@/types/model-configuration";
import { ModelConfigurationFormState } from "@/hooks/model-configurations/use-model-configuration-form";

export interface ModelConfigurationFormProviderConfigsProps {
  adapter: AdapterType;
  formState: ModelConfigurationFormState;
  isLoading: boolean;
  isEditMode: boolean;
  onFieldChange: (field: keyof ModelConfigurationFormState, value: string) => void;
}

export function ModelConfigurationFormProviderConfigs({
  adapter,
  formState,
  isLoading,
  isEditMode,
  onFieldChange
}: Readonly<ModelConfigurationFormProviderConfigsProps>) {
  if (adapter === 'azure') {
    return (
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-semibold">Azure OpenAI Configuration</h3>
        <div className="space-y-2">
          <Label htmlFor="azureEndpoint">
            Endpoint <span className="text-red-500">*</span>
          </Label>
          <Input
            id="azureEndpoint"
            type="text"
            placeholder="https://your-resource.openai.azure.com"
            value={formState.azureEndpoint}
            onChange={(e) => onFieldChange('azureEndpoint', e.target.value)}
            disabled={isLoading}
            className="w-full" />

        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="azureApiVersion">API Version</Label>
            <Input
              id="azureApiVersion"
              type="text"
              placeholder="2024-02-15-preview"
              value={formState.azureApiVersion}
              onChange={(e) => onFieldChange('azureApiVersion', e.target.value)}
              disabled={isLoading}
              className="w-full" />

          </div>
          <div className="space-y-2">
            <Label htmlFor="azureDeploymentName">Deployment Name</Label>
            <Input
              id="azureDeploymentName"
              type="text"
              placeholder="gpt-4-deployment"
              value={formState.azureDeploymentName}
              onChange={(e) => onFieldChange('azureDeploymentName', e.target.value)}
              disabled={isLoading}
              className="w-full" />

          </div>
        </div>
      </div>);

  }

  if (adapter === 'anthropic') {
    return (
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-semibold">Anthropic Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="anthropicBaseUrl">Base URL</Label>
            <Input
              id="anthropicBaseUrl"
              type="text"
              placeholder="https://api.anthropic.com"
              value={formState.anthropicBaseUrl}
              onChange={(e) => onFieldChange('anthropicBaseUrl', e.target.value)}
              disabled={isLoading}
              className="w-full" />

          </div>
          <div className="space-y-2">
            <Label htmlFor="anthropicTimeout">Timeout (seconds)</Label>
            <Input
              id="anthropicTimeout"
              type="number"
              placeholder="240"
              value={formState.anthropicTimeout}
              onChange={(e) => onFieldChange('anthropicTimeout', e.target.value)}
              disabled={isLoading}
              className="w-full" />

          </div>
        </div>
      </div>);

  }

  if (adapter === 'bedrock') {
    return (
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-semibold">AWS Bedrock Configuration</h3>
        <div className="space-y-2">
          <Label htmlFor="bedrockRegion">
            Region <span className="text-red-500">*</span>
          </Label>
          <Input
            id="bedrockRegion"
            type="text"
            placeholder="us-east-1"
            value={formState.bedrockRegion}
            onChange={(e) => onFieldChange('bedrockRegion', e.target.value)}
            disabled={isLoading}
            className="w-full" />

        </div>
        <div className="space-y-2">
          <Label htmlFor="bedrockEndpointUrl">Endpoint URL</Label>
          <Input
            id="bedrockEndpointUrl"
            type="text"
            placeholder="https://bedrock-runtime.us-east-1.amazonaws.com"
            value={formState.bedrockEndpointUrl}
            onChange={(e) => onFieldChange('bedrockEndpointUrl', e.target.value)}
            disabled={isLoading}
            className="w-full" />

        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bedrockAwsAccessKeyId">AWS Access Key ID</Label>
            <Input
              id="bedrockAwsAccessKeyId"
              type="password"
              placeholder={
              isEditMode ?
              "Enter to update, or leave empty to keep existing" :
              undefined
              }
              value={formState.bedrockAwsAccessKeyId}
              onChange={(e) => onFieldChange("bedrockAwsAccessKeyId", e.target.value)}
              disabled={isLoading}
              className="w-full"
              autoComplete="off" />

          </div>
          <div className="space-y-2">
            <Label htmlFor="bedrockAwsSecretAccessKey">AWS Secret Access Key</Label>
            <Input
              id="bedrockAwsSecretAccessKey"
              type="password"
              placeholder={
              isEditMode ?
              "Enter to update, or leave empty to keep existing" :
              undefined
              }
              value={formState.bedrockAwsSecretAccessKey}
              onChange={(e) => onFieldChange("bedrockAwsSecretAccessKey", e.target.value)}
              disabled={isLoading}
              className="w-full"
              autoComplete="off" />

          </div>
        </div>
      </div>);

  }

  if (adapter === 'google-vertex-ai') {
    return (
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-semibold">Google Vertex AI Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vertexProject">Project</Label>
            <Input
              id="vertexProject"
              type="text"
              placeholder="your-gcp-project-id"
              value={formState.vertexProject}
              onChange={(e) => onFieldChange('vertexProject', e.target.value)}
              disabled={isLoading}
              className="w-full" />

          </div>
          <div className="space-y-2">
            <Label htmlFor="vertexLocation">Location</Label>
            <Input
              id="vertexLocation"
              type="text"
              placeholder="us-central1"
              value={formState.vertexLocation}
              onChange={(e) => onFieldChange('vertexLocation', e.target.value)}
              disabled={isLoading}
              className="w-full" />

          </div>
        </div>
      </div>);

  }

  if (adapter === 'google-ai-studio') {
    return (
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-semibold">Google AI Studio Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="studioProject">Project</Label>
            <Input
              id="studioProject"
              type="text"
              placeholder="your-gcp-project-id"
              value={formState.studioProject}
              onChange={(e) => onFieldChange('studioProject', e.target.value)}
              disabled={isLoading}
              className="w-full" />

          </div>
          <div className="space-y-2">
            <Label htmlFor="studioBaseUrl">Base URL</Label>
            <Input
              id="studioBaseUrl"
              type="text"
              placeholder="https://generativelanguage.googleapis.com"
              value={formState.studioBaseUrl}
              onChange={(e) => onFieldChange('studioBaseUrl', e.target.value)}
              disabled={isLoading}
              className="w-full" />

          </div>
        </div>
      </div>);

  }

  return null;
}