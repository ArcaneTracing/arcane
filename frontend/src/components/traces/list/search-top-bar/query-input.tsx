"use client"

import { Input } from "@/components/ui/input"
import { InfoButton } from "@/components/shared/info-button"

interface QueryInputProps {
  value: string
  onChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  tooltipContent?: string
}

export function QueryInput({ value, onChange, onKeyDown, tooltipContent }: Readonly<QueryInputProps>) {
  return (
    <div className="flex items-center gap-2 flex-1">
      <Input
        className="h-9 flex-1"
        placeholder='e.g. { name="project_span" }'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      {tooltipContent && (
        <InfoButton content={tooltipContent} />
      )}
    </div>
  )
}

