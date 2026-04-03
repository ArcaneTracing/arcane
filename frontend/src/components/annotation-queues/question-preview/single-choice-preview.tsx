"use client"

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface SingleChoicePreviewProps {
  questionId: string
  options: string[]
  emptyMessage?: string
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}

export function SingleChoicePreview({ questionId, options, emptyMessage, value, onChange, disabled = false }: Readonly<SingleChoicePreviewProps>) {
  const isEditable = onChange !== undefined
  
  return (
    <div className="space-y-2 mt-3">
      {options.length > 0 ? (
        <RadioGroup
          value={value || ""}
          onValueChange={(val) => onChange?.(val)}
          disabled={disabled || !isEditable}
        >
          {options.map((option) => (
            <div key={option} className="flex items-center gap-2">
              <RadioGroupItem value={option} id={`${questionId}-${option}`} />
              <Label htmlFor={`${questionId}-${option}`} className="text-sm font-normal cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      ) : (
        <p className="text-xs text-gray-400 italic">
          {emptyMessage || "No options configured"}
        </p>
      )}
    </div>
  )
}

