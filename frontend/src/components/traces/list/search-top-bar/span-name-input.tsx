"use client"

import { Input } from "@/components/ui/input"

interface SpanNameInputProps {
  value: string
  onChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export function SpanNameInput({ value, onChange, onKeyDown }: Readonly<SpanNameInputProps>) {
  return (
    <Input
      className="h-9 flex-1 min-w-[220px]"
      placeholder="Filter by span name"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
    />
  )
}
