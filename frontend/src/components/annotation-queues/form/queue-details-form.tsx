"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AnnotationQueueType } from '@/types'

interface QueueDetailsFormProps {
  name: string
  description: string
  type: AnnotationQueueType
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onTypeChange: (value: AnnotationQueueType) => void
  disabled?: boolean
  isEditMode?: boolean
}

export function QueueDetailsForm({
  name,
  description,
  type,
  onNameChange,
  onDescriptionChange,
  onTypeChange,
  disabled,
  isEditMode = false,
}: Readonly<QueueDetailsFormProps>) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Queue Details</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            placeholder="Enter queue name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            disabled={disabled}
            required
            className="max-w-md"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter queue description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            disabled={disabled}
            rows={4}
            className="max-w-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Queue Type *</Label>
          <p className="text-xs text-muted-foreground">Choose what you want to annotate in this queue.</p>
          <Select
            value={type}
            onValueChange={(value) => onTypeChange(value as AnnotationQueueType)}
            disabled={disabled || isEditMode}
          >
            <SelectTrigger id="type" className="max-w-md">
              <SelectValue placeholder="Select annotation type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AnnotationQueueType.TRACES}>Traces</SelectItem>
              <SelectItem value={AnnotationQueueType.CONVERSATIONS}>Conversations</SelectItem>
            </SelectContent>
          </Select>
          {isEditMode && (
            <p className="text-xs text-muted-foreground">
              Annotation type cannot be changed after creation
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

