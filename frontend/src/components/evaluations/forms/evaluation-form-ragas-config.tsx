"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ModelConfigurationResponse } from "@/types/model-configuration";
import { isForbiddenError } from "@/lib/error-handling";

export interface EvaluationFormRagasConfigProps {
  ragasModelConfigurationId: string;
  configurations: ModelConfigurationResponse[];
  loadingModelConfigurations: boolean;
  onConfigurationChange: (configurationId: string) => void;
  isLoading?: boolean;
  isEditMode?: boolean;
  error?: unknown;
}

export function EvaluationFormRagasConfig({
  ragasModelConfigurationId,
  configurations,
  loadingModelConfigurations,
  onConfigurationChange,
  isLoading = false,
  isEditMode = false,
  error
}: Readonly<EvaluationFormRagasConfigProps>) {
  const hasPermissionError = error && isForbiddenError(error);

  return (
    <div className="space-y-2">
      <Label htmlFor="ragasModelConfiguration" className="text-sm font-medium dark:text-gray-200">
        RAGAS Model <span className="text-red-500">*</span>
      </Label>
      {(() => {
        if (loadingModelConfigurations) {
          return (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>);

        }
        if (hasPermissionError) {
          return <p className="text-sm text-red-500 dark:text-red-400">You don't have permission to view model configurations.</p>;
        }
        if (configurations.length === 0) {
          return <p className="text-sm text-gray-500 dark:text-gray-400">No model configurations available. Please create a model configuration first.</p>;
        }
        return (
          <Select
            value={ragasModelConfigurationId}
            onValueChange={onConfigurationChange}
            disabled={isLoading || isEditMode || hasPermissionError}>

          <SelectTrigger id="ragasModelConfiguration" className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white">
            <SelectValue placeholder={hasPermissionError ? "No permission" : "Select a model configuration for RAGAS"} />
          </SelectTrigger>
          <SelectContent>
            {(() => {
                if (hasPermissionError) {
                  return (
                    <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                    You don't have permission to view model configurations
                  </div>);

                }
                return configurations.map((config) =>
                <SelectItem key={config.id} value={config.id}>
                  {config.name} ({config.configuration.modelName})
                </SelectItem>
                );
              })()}
          </SelectContent>
        </Select>);

      })()}
    </div>);

}