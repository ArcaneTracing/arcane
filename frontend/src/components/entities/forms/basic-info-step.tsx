"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InfoButton } from "@/components/shared/info-button"
import { entityTooltips } from "@/constants/entity-tooltips"

interface BasicInfoStepProps {
  name: string
  description: string
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  disabled?: boolean
}

export function BasicInfoStep({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  disabled
}: Readonly<BasicInfoStepProps>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium dark:text-gray-200">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Enter entity name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
          disabled={disabled}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="description" className="text-sm font-medium dark:text-gray-200">
            Description
          </Label>
          <InfoButton content={entityTooltips.basicInfo.description} />
        </div>
        <Input
          id="description"
          placeholder="Enter entity description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-transparent focus:ring-blue-600 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
          disabled={disabled}
        />
      </div>
    </div>
  )
}

