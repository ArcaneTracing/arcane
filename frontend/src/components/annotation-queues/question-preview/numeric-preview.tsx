"use client"

import { Input } from '@/components/ui/input'

interface NumericPreviewProps {
  placeholder?: string
  min?: number
  max?: number
  value?: number
  onChange?: (value: number | undefined) => void
  disabled?: boolean
}

export function NumericPreview({ placeholder, min, max, value, onChange, disabled = false }: Readonly<NumericPreviewProps>) {
  const isEditable = onChange !== undefined
  
  return (
    <Input
      type="number"
      placeholder={placeholder || "Enter a number"}
      min={min}
      max={max}
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value ? Number(e.target.value) : undefined)}
      disabled={disabled || !isEditable}
      className="mt-2 max-w-xs"
    />
  )
}

