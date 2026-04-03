"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface EvaluationFormBasicInfoProps {
  name: string;
  description: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  isLoading?: boolean;
  isEditMode?: boolean;
}

export function EvaluationFormBasicInfo({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  isLoading = false,
  isEditMode = false
}: Readonly<EvaluationFormBasicInfoProps>) {
  return (
    <>
      {}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium dark:text-gray-200">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Enter evaluation name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
          required
          disabled={isLoading || isEditMode} />

      </div>

      {}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium dark:text-gray-200">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Enter evaluation description (optional)"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full min-h-[80px] border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
          disabled={isLoading || isEditMode} />

      </div>
    </>);

}