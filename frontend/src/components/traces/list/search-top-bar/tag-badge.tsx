"use client"

interface TagBadgeProps {
  label: string
  onRemove: () => void
  maxWidth?: string
}

export function TagBadge({ label, onRemove, maxWidth = "200px" }: Readonly<TagBadgeProps>) {
  return (
    <div className="flex items-center gap-1 bg-secondary px-2 py-0.5 rounded-md text-xs">
      <span className="truncate" style={{ maxWidth }}>
        {label}
      </span>
      <button
        onClick={onRemove}
        className="hover:text-destructive ml-1 flex-shrink-0"
        type="button"
      >
        ×
      </button>
    </div>
  )
}

