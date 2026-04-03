"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CanonicalMessageMatchingConfiguration } from "@/types/entities"
import { InfoButton } from "@/components/shared/info-button"
import { entityTooltips } from "@/constants/entity-tooltips"

interface CanonicalMessageMatchingStepProps {
  configuration: CanonicalMessageMatchingConfiguration
  onConfigurationChange: (configuration: CanonicalMessageMatchingConfiguration) => void
  disabled?: boolean
}

export function CanonicalMessageMatchingStep({
  configuration,
  onConfigurationChange,
  disabled
}: Readonly<CanonicalMessageMatchingStepProps>) {
  const handleInputChange = (field: 'inputAttributeKey' | 'outputAttributeKey', value: string) => {
    onConfigurationChange({
      ...configuration,
      [field]: value,
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="inputAttributeKey" className="text-sm font-medium dark:text-gray-200">
            Input Attribute Key <span className="text-red-500">*</span>
          </Label>
          <InfoButton content={entityTooltips.messageMatching.canonicalInputKey} />
        </div>
        <Input
          id="inputAttributeKey"
          placeholder="e.g., llm.input.messages"
          value={configuration.inputAttributeKey}
          onChange={(e) => handleInputChange('inputAttributeKey', e.target.value)}
          className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
          disabled={disabled}
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          The span attribute key that contains input messages in OpenTelemetry format
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="outputAttributeKey" className="text-sm font-medium dark:text-gray-200">
            Output Attribute Key <span className="text-red-500">*</span>
          </Label>
          <InfoButton content={entityTooltips.messageMatching.canonicalOutputKey} />
        </div>
        <Input
          id="outputAttributeKey"
          placeholder="e.g., llm.output.messages"
          value={configuration.outputAttributeKey}
          onChange={(e) => handleInputChange('outputAttributeKey', e.target.value)}
          className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
          disabled={disabled}
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          The span attribute key that contains output messages in OpenTelemetry format
        </p>
      </div>
    </div>
  )
}

