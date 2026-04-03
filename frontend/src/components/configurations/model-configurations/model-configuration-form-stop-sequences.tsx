"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

export interface ModelConfigurationFormStopSequencesProps {
  stopSequences: string[]
  isLoading: boolean
  onAdd: () => void
  onRemove: (index: number) => void
  onChange: (index: number, value: string) => void
}

export function ModelConfigurationFormStopSequences({
  stopSequences,
  isLoading,
  onAdd,
  onRemove,
  onChange,
}: Readonly<ModelConfigurationFormStopSequencesProps>) {
  return (
    <div className="space-y-2">
      <Label>Stop Sequences</Label>
      <div className="space-y-2">
        {stopSequences.map((sequence, index) => (
          <div key={sequence || `stop-seq-${index}`} className="flex gap-2">
            <Input
              type="text"
              placeholder="Stop sequence"
              value={sequence}
              onChange={(e) => onChange(index, e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Stop Sequence
        </Button>
      </div>
    </div>
  )
}

