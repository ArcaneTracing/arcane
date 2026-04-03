"use client"

import { Input } from "@/components/ui/input"
import { TagBadge } from "./tag-badge"

interface TagInputProps {
  tags: string[]
  value: string
  onChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onRemoveTag: (tag: string) => void
}

export function TagInput({
  tags,
  value,
  onChange,
  onKeyDown,
  onRemoveTag,
}: Readonly<TagInputProps>) {
  return (
    <div className="flex-1 flex flex-col gap-1.5 min-w-0">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <TagBadge
              key={tag}
              label={tag}
              onRemove={() => onRemoveTag(tag)}
            />
          ))}
        </div>
      )}
      <Input
        className="h-9"
        placeholder="Add tag (e.g. http.status_code:400)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </div>
  )
}

