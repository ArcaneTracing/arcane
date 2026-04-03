"use client"

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface MultipleChoicePreviewProps {
  options: string[]
  emptyMessage?: string
  questionId?: string
  value?: string[]
  onChange?: (value: string[]) => void
  disabled?: boolean
}

export function MultipleChoicePreview({ options, emptyMessage, questionId, value, onChange, disabled = false }: Readonly<MultipleChoicePreviewProps>) {
  const isEditable = onChange !== undefined
  const currentValues = value || []
  
  return (
    <div className="space-y-2 mt-3">
      {options.length > 0 ? (
        options.map((option) => (
          <div key={option} className="flex items-center gap-2">
            <Checkbox
              id={`${questionId || 'checkbox'}-${option}`}
              checked={currentValues.includes(option)}
              onCheckedChange={(checked) => {
                if (onChange) {
                  if (checked) {
                    onChange([...currentValues, option])
                  } else {
                    onChange(currentValues.filter(v => v !== option))
                  }
                }
              }}
              disabled={disabled || !isEditable}
            />
            <Label htmlFor={`${questionId || 'checkbox'}-${option}`} className="text-sm font-normal cursor-pointer">
              {option}
            </Label>
          </div>
        ))
      ) : (
        <p className="text-xs text-gray-400 italic">
          {emptyMessage || "No options configured"}
        </p>
      )}
    </div>
  )
}

