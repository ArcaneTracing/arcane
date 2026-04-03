"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface PromptFormBasicInfoProps {
  name: string
  description: string
  onNameChange: (name: string) => void
  onDescriptionChange: (description: string) => void
}

export function PromptFormBasicInfo({
  name,
  description,
  onNameChange,
  onDescriptionChange,
}: Readonly<PromptFormBasicInfoProps>) {
  return (
    <div className="space-y-4 mb-4 pb-4 border-b border-gray-200 dark:border-[#2A2A2A]">
      <div className="space-y-2">
        <Label htmlFor="prompt-name" className="text-sm font-medium dark:text-gray-200">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="prompt-name"
          placeholder="Enter prompt name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="prompt-description" className="text-sm font-medium dark:text-gray-200">
          Description
        </Label>
        <Input
          id="prompt-description"
          placeholder="Enter prompt description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
    </div>
  )
}

