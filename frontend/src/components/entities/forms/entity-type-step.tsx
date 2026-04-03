"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EntityType } from "@/types/enums"
import { InfoButton } from "@/components/shared/info-button"
import { entityTooltips } from "@/constants/entity-tooltips"

interface EntityTypeStepProps {
  entityType: EntityType
  onEntityTypeChange: (type: EntityType) => void
  disabled?: boolean
}

export function EntityTypeStep({ entityType, onEntityTypeChange, disabled }: Readonly<EntityTypeStepProps>) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="entityType" className="text-sm font-medium dark:text-gray-200">
          Entity Type
        </Label>
        <InfoButton content={entityTooltips.entityType.dropdown} side="bottom" />
      </div>
      <Select
        value={entityType}
        onValueChange={(value) => onEntityTypeChange(value as EntityType)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm">
          <SelectValue placeholder="Select entity type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={EntityType.MODEL}>Model</SelectItem>
          <SelectItem value={EntityType.TOOL}>Tool</SelectItem>
          <SelectItem value={EntityType.EMBEDDING}>Embedding</SelectItem>
          <SelectItem value={EntityType.RETRIEVER}>Retriever</SelectItem>
          <SelectItem value={EntityType.GUARDRAIL}>Guardrail</SelectItem>
          <SelectItem value={EntityType.AGENT}>Agent</SelectItem>
          <SelectItem value={EntityType.EVALUATOR}>Evaluator</SelectItem>
          <SelectItem value={EntityType.CUSTOM}>Custom</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Select the type of entity you want to create. This determines which attributes will be available.
      </p>
    </div>
  )
}

