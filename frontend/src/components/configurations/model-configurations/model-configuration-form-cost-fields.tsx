"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface ModelConfigurationFormCostFieldsProps {
  inputCostPerToken: string
  outputCostPerToken: string
  isLoading: boolean
  onInputCostChange: (value: string) => void
  onOutputCostChange: (value: string) => void
}

export function ModelConfigurationFormCostFields({
  inputCostPerToken,
  outputCostPerToken,
  isLoading,
  onInputCostChange,
  onOutputCostChange,
}: Readonly<ModelConfigurationFormCostFieldsProps>) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="inputCostPerToken">
          Input Cost Per Token
        </Label>
        <Input
          id="inputCostPerToken"
          type="number"
          step="0.0000001"
          placeholder="0.00003"
          value={inputCostPerToken}
          onChange={(e) => onInputCostChange(e.target.value)}
          disabled={isLoading}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="outputCostPerToken">
          Output Cost Per Token
        </Label>
        <Input
          id="outputCostPerToken"
          type="number"
          step="0.0000001"
          placeholder="0.00006"
          value={outputCostPerToken}
          onChange={(e) => onOutputCostChange(e.target.value)}
          disabled={isLoading}
          className="w-full"
        />
      </div>
    </div>
  )
}

