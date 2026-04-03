"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface ModelConfigurationFormParametersProps {
  temperature: string
  maxTokens: string
  topP: string
  frequencyPenalty: string
  presencePenalty: string
  isLoading: boolean
  onTemperatureChange: (value: string) => void
  onMaxTokensChange: (value: string) => void
  onTopPChange: (value: string) => void
  onFrequencyPenaltyChange: (value: string) => void
  onPresencePenaltyChange: (value: string) => void
}

export function ModelConfigurationFormParameters({
  temperature,
  maxTokens,
  topP,
  frequencyPenalty,
  presencePenalty,
  isLoading,
  onTemperatureChange,
  onMaxTokensChange,
  onTopPChange,
  onFrequencyPenaltyChange,
  onPresencePenaltyChange,
}: Readonly<ModelConfigurationFormParametersProps>) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="temperature">Temperature</Label>
          <Input
            id="temperature"
            type="number"
            step="0.1"
            min="0"
            max="2"
            placeholder="0.7"
            value={temperature}
            onChange={(e) => onTemperatureChange(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxTokens">Max Tokens</Label>
          <Input
            id="maxTokens"
            type="number"
            placeholder="2000"
            value={maxTokens}
            onChange={(e) => onMaxTokensChange(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="topP">Top P</Label>
          <Input
            id="topP"
            type="number"
            step="0.1"
            min="0"
            max="1"
            placeholder="1.0"
            value={topP}
            onChange={(e) => onTopPChange(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequencyPenalty">Frequency Penalty</Label>
          <Input
            id="frequencyPenalty"
            type="number"
            step="0.1"
            min="-2"
            max="2"
            placeholder="0.0"
            value={frequencyPenalty}
            onChange={(e) => onFrequencyPenaltyChange(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="presencePenalty">Presence Penalty</Label>
          <Input
            id="presencePenalty"
            type="number"
            step="0.1"
            min="-2"
            max="2"
            placeholder="0.0"
            value={presencePenalty}
            onChange={(e) => onPresencePenaltyChange(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>
      </div>
    </>
  )
}

