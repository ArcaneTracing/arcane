"use client"

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface DatasetModeToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export function DatasetModeToggle({ enabled, onToggle }: Readonly<DatasetModeToggleProps>) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        id="dataset-mode"
        checked={enabled}
        onCheckedChange={onToggle}
      />
      <Label htmlFor="dataset-mode" className="text-sm font-medium cursor-pointer">
        Dataset Mode
      </Label>
    </div>
  )
}

