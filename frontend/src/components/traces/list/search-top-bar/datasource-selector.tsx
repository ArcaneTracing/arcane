"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { DatasourceResponse } from "@/types/datasources";
import { isForbiddenError } from "@/lib/error-handling";

interface DatasourceSelectorProps {
  datasources: DatasourceResponse[];
  value: string;
  onValueChange: (value: string) => void;
  error?: unknown;
  isLoading?: boolean;
}

export function DatasourceSelector({
  datasources,
  value,
  onValueChange,
  error,
  isLoading = false
}: Readonly<DatasourceSelectorProps>) {

  const hasPermissionError = error && isForbiddenError(error);

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="traces-datasource-select" className="text-sm font-medium whitespace-nowrap">Datasource</label>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={isLoading || hasPermissionError}>

        <SelectTrigger id="traces-datasource-select" className="h-9 w-[180px]">
          <SelectValue placeholder={
          (() => {
            if (isLoading) return "Loading...";
            if (hasPermissionError) return "No permission";
            return "Select datasource";
          })()
          } />
        </SelectTrigger>
        <SelectContent>
          {(() => {
            if (hasPermissionError) {
              return (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  You don't have permission to view datasources
                </div>);

            }
            if (datasources.length === 0) {
              return (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No datasources available
                </div>);

            }
            return datasources.map((ds) =>
            <SelectItem key={ds.id} value={ds.id}>
                {ds.name}
              </SelectItem>
            );
          })()}
        </SelectContent>
      </Select>
    </div>);

}