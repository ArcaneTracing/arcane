"use client"

import { Textarea } from '@/components/ui/textarea'

interface FreeformPreviewProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}

export function FreeformPreview({ placeholder, value, onChange, disabled = false }: Readonly<FreeformPreviewProps>) {
  const isEditable = onChange !== undefined
  
  return (
    <Textarea
      placeholder={placeholder || "Enter your answer..."}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled || !isEditable}
      className="mt-2"
      rows={isEditable ? 4 : 3}
    />
  )
}

