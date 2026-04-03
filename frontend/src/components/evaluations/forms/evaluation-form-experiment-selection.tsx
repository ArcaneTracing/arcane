"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";
import { ExperimentResponse } from "@/types/experiments";
import { isForbiddenError } from "@/lib/error-handling";

export interface EvaluationFormExperimentSelectionProps {
  selectedExperimentIds: string[];
  experiments: ExperimentResponse[];
  loadingExperiments: boolean;
  experimentDatasetError: string;
  onExperimentAdd: (experimentId: string) => void;
  onExperimentRemove: (experimentId: string) => void;
  isLoading?: boolean;
  isEditMode?: boolean;
  error?: unknown;
}

export function EvaluationFormExperimentSelection({
  selectedExperimentIds,
  experiments,
  loadingExperiments,
  experimentDatasetError,
  onExperimentAdd,
  onExperimentRemove,
  isLoading = false,
  isEditMode = false,
  error
}: Readonly<EvaluationFormExperimentSelectionProps>) {
  const hasPermissionError = error && isForbiddenError(error);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium dark:text-gray-200">
        Experiments <span className="text-red-500">*</span>
      </Label>
      {(() => {
        if (loadingExperiments) {
          return (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>);

        }
        if (hasPermissionError) {
          return <p className="text-sm text-red-500 dark:text-red-400">You don't have permission to view experiments.</p>;
        }
        if (experiments.length === 0) {
          return <p className="text-sm text-gray-500 dark:text-gray-400">No experiments available. Please create an experiment first.</p>;
        }
        return (
          <div className="space-y-2">
          <Select
              value=""
              onValueChange={(value) => {
                if (value && !selectedExperimentIds.includes(value)) {
                  onExperimentAdd(value);
                }
              }}
              disabled={isLoading || isEditMode || hasPermissionError}>

            <SelectTrigger className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white">
              <SelectValue placeholder={hasPermissionError ? "No permission" : "Select an experiment to add..."} />
            </SelectTrigger>
            <SelectContent>
              {(() => {
                  if (hasPermissionError) {
                    return (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                      You don't have permission to view experiments
                    </div>);

                  }
                  return experiments.
                  filter((experiment) => !selectedExperimentIds.includes(experiment.id)).
                  map((experiment) =>
                  <SelectItem key={experiment.id} value={experiment.id}>
                      {experiment.name}
                    </SelectItem>
                  );
                })()}
            </SelectContent>
          </Select>
          {experimentDatasetError &&
            <p className="text-sm text-red-500 dark:text-red-400">{experimentDatasetError}</p>
            }
          {selectedExperimentIds.length > 0 &&
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedExperimentIds.map((experimentId) => {
                const experiment = experiments.find((e) => e.id === experimentId);
                if (!experiment) return null;
                return (
                  <div
                    key={experimentId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/20 dark:bg-red-500/20 text-red-900 dark:text-white text-sm">

                    <span>{experiment.name}</span>
                    <button
                      type="button"
                      onClick={() => onExperimentRemove(experimentId)}
                      className="hover:bg-red-500/30 dark:hover:bg-red-500/30 rounded-full p-0.5 transition-colors"
                      disabled={isLoading || isEditMode}>

                      <X className="h-3 w-3" />
                    </button>
                  </div>);

              })}
            </div>
            }
        </div>);

      })()}
    </div>);

}