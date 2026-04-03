"use client"

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface BooleanPreviewProps {
  questionId: string
  value?: boolean
  onChange?: (value: boolean) => void
  disabled?: boolean
}

export function BooleanPreview({ questionId, value, onChange, disabled = false }: Readonly<BooleanPreviewProps>) {
  const isEditable = onChange !== undefined
  
  return (
    <RadioGroup
      value={value?.toString() || ""}
      onValueChange={(val) => onChange?.(val === "true")}
      disabled={disabled || !isEditable}
      className="flex gap-4 mt-3"
    >
      <div className="flex items-center gap-2">
        <RadioGroupItem value="true" id={`${questionId}-yes`} />
        <Label htmlFor={`${questionId}-yes`} className="text-sm font-normal cursor-pointer">
          Yes
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="false" id={`${questionId}-no`} />
        <Label htmlFor={`${questionId}-no`} className="text-sm font-normal cursor-pointer">
          No
        </Label>
      </div>
    </RadioGroup>
  )
}

