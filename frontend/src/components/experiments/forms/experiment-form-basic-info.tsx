"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ExperimentFormBasicInfoProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  isLoading: boolean;
  isEditMode: boolean;
}

export function ExperimentFormBasicInfo({
  name,
  setName,
  description,
  setDescription,
  isLoading,
  isEditMode
}: Readonly<ExperimentFormBasicInfoProps>) {
  return (
    <>
      {}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium dark:text-gray-200">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter experiment name"
          disabled={isLoading || isEditMode}
          className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white"
          required />

      </div>

      {}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium dark:text-gray-200">
          Description
        </Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter experiment description (optional)"
          disabled={isLoading || isEditMode}
          className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white" />

      </div>
    </>);

}