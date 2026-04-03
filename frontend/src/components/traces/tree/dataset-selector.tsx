"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useDatasetsQuery } from '@/hooks/datasets/use-datasets-query';
import { Loader2 } from 'lucide-react';
import { isForbiddenError } from '@/lib/error-handling';

interface DatasetSelectorProps {
  projectId: string;
  selectedDatasetId: string | null;
  onSelect: (datasetId: string | null) => void;
}

export function DatasetSelector({
  projectId,
  selectedDatasetId,
  onSelect
}: Readonly<DatasetSelectorProps>) {

  const { data: datasets = [], isLoading, error } = useDatasetsQuery(projectId);


  const hasPermissionError = error && isForbiddenError(error);

  return (
    <div className="space-y-2">
      <Label htmlFor="dataset-select">Select Dataset</Label>
      <Select
        value={selectedDatasetId || ''}
        onValueChange={(value) => onSelect(value || null)}
        disabled={isLoading || hasPermissionError}>

        <SelectTrigger id="dataset-select" className="w-full">
          <SelectValue placeholder={
          (() => {
            if (isLoading) return "Loading datasets...";
            if (hasPermissionError) return "No permission to view datasets";
            return "Choose a dataset";
          })()
          } />
        </SelectTrigger>
        <SelectContent>
          {(() => {
            if (isLoading) {
              return (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>);

            }
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