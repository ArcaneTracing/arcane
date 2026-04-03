"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { DatasetListItemResponse } from "@/types/datasets";
import { isForbiddenError } from "@/lib/error-handling";

interface ExperimentFormDatasetSelectionProps {
  datasets: DatasetListItemResponse[];
  loadingDatasets: boolean;
  datasetId: string;
  setDatasetId: (id: string) => void;
  isLoading: boolean;
  error?: unknown;
}

export function ExperimentFormDatasetSelection({
  datasets,
  loadingDatasets,
  datasetId,
  setDatasetId,
  isLoading,
  error
}: Readonly<ExperimentFormDatasetSelectionProps>) {
  const hasPermissionError = error && isForbiddenError(error);

  return (
    <div className="space-y-2">
      <Label htmlFor="dataset" className="text-sm font-medium dark:text-gray-200">
        Dataset <span className="text-red-500">*</span>
      </Label>
      <Select
        value={datasetId}
        onValueChange={setDatasetId}
        disabled={isLoading || loadingDatasets || hasPermissionError}>

        <SelectTrigger id="dataset" className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white">
          {loadingDatasets && !datasetId ?
          <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading datasets...</span>
            </div> :

          <SelectValue placeholder={hasPermissionError ? "No permission" : "Select a dataset"} />
          }
        </SelectTrigger>
        <SelectContent>
          {(() => {
            if (hasPermissionError) {
              return (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  You don't have permission to view datasets
                </div>);

            }
            if (datasets.length === 0) {
              return (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No datasets available
                </div>);

            }
            return datasets.map((dataset) =>
            <SelectItem key={dataset.id} value={dataset.id}>
                {dataset.name}
              </SelectItem>
            );
          })()}
        </SelectContent>
      </Select>
    </div>);

}