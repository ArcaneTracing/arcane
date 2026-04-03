"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { IconPicker } from "./icon-picker"
import { entityTooltips } from "@/constants/entity-tooltips"
import { InfoButton } from "@/components/shared/info-button"

interface CustomEntityStepProps {
  customType: string
  iconId?: string
  onCustomTypeChange: (type: string) => void
  onIconChange: (iconId: string) => void
  disabled?: boolean
}

export function CustomEntityStep({
  customType,
  iconId,
  onCustomTypeChange,
  onIconChange,
  disabled,
}: Readonly<CustomEntityStepProps>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="customType" className="text-sm font-medium dark:text-gray-200">
            Type
          </Label>
          <InfoButton content={entityTooltips.customEntity.typeInput} />
        </div>
        <Input
          id="customType"
          type="text"
          value={customType}
          onChange={(e) => onCustomTypeChange(e.target.value)}
          placeholder="e.g., CHAIN, PIPELINE, EMBEDDER"
          disabled={disabled}
          className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {entityTooltips.customEntity.typeInput}
        </p>
      </div>
      <IconPicker
        selectedIconId={iconId}
        onIconChange={onIconChange}
        disabled={disabled}
      />
    </div>
  )
}
