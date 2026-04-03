"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ReactNode } from "react"
import { AdapterType } from "@/types/model-configuration"

const ADAPTERS: { value: AdapterType; label: string }[] = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'azure', label: 'Azure OpenAI' },
  { value: 'bedrock', label: 'AWS Bedrock' },
  { value: 'google-vertex-ai', label: 'Google Vertex AI' },
  { value: 'google-ai-studio', label: 'Google AI Studio' },
]

export interface ModelConfigurationFormBasicFieldsProps {
  name: string
  adapter: AdapterType
  modelName: string
  apiKey: string
  isEditMode: boolean
  isLoading: boolean
  onNameChange: (name: string) => void
  onAdapterChange: (adapter: AdapterType) => void
  onModelNameChange: (modelName: string) => void
  onApiKeyChange: (apiKey: string) => void
}

export function ModelConfigurationFormBasicFields({
  name,
  adapter,
  modelName,
  apiKey,
  isEditMode,
  isLoading,
  onNameChange,
  onAdapterChange,
  onModelNameChange,
  onApiKeyChange,
}: Readonly<ModelConfigurationFormBasicFieldsProps>) {
  let apiKeyFieldContent: ReactNode
  if (adapter === "bedrock") {
    apiKeyFieldContent = (
      <p className="text-sm text-muted-foreground">
        Bedrock uses AWS default credentials (env vars, ~/.aws/credentials, or IAM roles).
        Optionally configure AWS keys in the provider settings below.
      </p>
    )
  } else if (adapter === "google-vertex-ai") {
    apiKeyFieldContent = (
      <>
        <Label htmlFor="apiKey">
          Service account credentials (JSON) <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="apiKey"
          placeholder={
            isEditMode
              ? "Enter new credentials to update, or leave empty to keep existing"
              : '{"type": "service_account", "project_id": "...", ...}'
          }
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          disabled={isLoading}
          className="w-full font-mono text-sm min-h-[160px]"
          rows={6}
        />
        <p className="text-xs text-muted-foreground">
          Paste the full JSON from GCP Console → IAM & Admin → Service Accounts → Keys.
        </p>
      </>
    )
  } else {
    apiKeyFieldContent = (
      <>
        <Label htmlFor="apiKey">
          API Key <span className="text-red-500">*</span>
        </Label>
        <Input
          id="apiKey"
          type="password"
          placeholder={
            isEditMode
              ? "Enter new key to update, or leave empty to keep existing"
              : "sk-..."
          }
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          disabled={isLoading}
          className="w-full"
          autoComplete="off"
        />
      </>
    )
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="e.g., GPT-4 Production"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={isLoading}
          className="w-full"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="adapter">
            Adapter <span className="text-red-500">*</span>
          </Label>
          <Select
            value={adapter}
            onValueChange={(value) => onAdapterChange(value as AdapterType)}
            disabled={isLoading || isEditMode}
          >
            <SelectTrigger id="adapter" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ADAPTERS.map((adapterOption) => (
                <SelectItem key={adapterOption.value} value={adapterOption.value}>
                  {adapterOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="modelName">
            Model Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="modelName"
            type="text"
            placeholder="e.g., gpt-4, claude-3-sonnet"
            value={modelName}
            onChange={(e) => onModelNameChange(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        {apiKeyFieldContent}
      </div>
    </>
  )
}

