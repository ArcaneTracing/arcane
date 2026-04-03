"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchMode } from "./types"

interface SearchModeSelectorProps {
  value: SearchMode
  onValueChange: (value: SearchMode) => void
}

export function SearchModeSelector({
  value,
  onValueChange,
}: Readonly<SearchModeSelectorProps>) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-9 w-[150px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="query">Query</SelectItem>
        <SelectItem value="tag">Attributes</SelectItem>
        <SelectItem value="tag-values">Attribute Values</SelectItem>
        <SelectItem value="span-name">Span name</SelectItem>
      </SelectContent>
    </Select>
  )
}

