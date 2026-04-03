"use client";

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle } from
'@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { X, Database, Loader2 } from 'lucide-react';
import { useDatasetQuery, useUpsertDatasetRow } from '@/hooks/datasets/use-datasets-query';

interface DatasetMappingDrawerProps {
  projectId: string;
  datasetId: string | null;
  mappings: Map<string, string | string[]>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToDataset: () => void;
  onRemoveMapping: (columnName: string) => void;
}

export function DatasetMappingDrawer({
  projectId,
  datasetId,
  mappings,
  isOpen,
  onOpenChange,
  onAddToDataset,
  onRemoveMapping
}: Readonly<DatasetMappingDrawerProps>) {
  const { data: dataset, isLoading } = useDatasetQuery(projectId, isOpen ? datasetId : undefined);
  const upsertMutation = useUpsertDatasetRow(projectId);

  const handleAddToDataset = async () => {
    if (!datasetId || !dataset || !projectId || !dataset.header || !Array.isArray(dataset.header)) return;
    const values = dataset.header.map((columnName) => {
      const mapping = mappings.get(columnName);
      if (!mapping) return '';
      if (Array.isArray(mapping)) {

        return JSON.stringify(mapping);
      }
      return mapping;
    });

    try {
      await upsertMutation.mutateAsync({ datasetId, data: { values } });
      onAddToDataset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding row to dataset:', error);
    }
  };

  const isSubmitting = upsertMutation.isPending;

  const mappedColumns = Array.from(mappings.entries()).map(([columnName, value]) => ({
    columnName,
    value
  }));

  return (
    <>
      {}
      {datasetId && mappings.size > 0 &&
      <Button
        onClick={() => onOpenChange(true)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50"
        size="icon">

          <Database className="h-5 w-5" />
          {mappings.size > 0 &&
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">

              {mappings.size}
            </Badge>
        }
        </Button>
      }

      {}
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Dataset Mappings</SheetTitle>
            <SheetDescription>
              Review and submit your mapped values to the dataset
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {(() => {
              if (isLoading) {
                return (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>);

              }
              if (!dataset) {
                return (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No dataset selected
                  </div>);

              }
              return (
                <>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Dataset: {dataset.name}</h3>
                  <div className="text-xs text-muted-foreground">
                    {dataset.description || 'No description'}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Column Mappings</h4>
                  
                  {!dataset.header || dataset.header.length === 0 ?
                    <div className="text-sm text-muted-foreground">
                      This dataset has no columns
                    </div> :

                    <div className="h-[400px] overflow-auto">
                      <div className="space-y-3">
                        {dataset.header.map((columnName) => {
                          const mapping = mappings.get(columnName);
                          return (
                            <div
                              key={columnName}
                              className="border rounded-lg p-3 space-y-2">

                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{columnName}</span>
                                {mapping &&
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => onRemoveMapping(columnName)}>

                                    <X className="h-3 w-3" />
                                  </Button>
                                }
                              </div>
                              {mapping ?
                              <div className="text-xs text-muted-foreground bg-muted p-2 rounded break-words">
                                  {Array.isArray(mapping) ?

                                <div className="space-y-1">
                                      <div className="font-medium mb-1">
                                        {mapping.length} item{mapping.length === 1 ? '' : 's'}:
                                      </div>
                                      <ul className="list-disc list-inside space-y-0.5">
                                        {mapping.map((item: string) => {
                                      const itemStr = String(item);
                                      const displayStr = itemStr.length > 100 ?
                                      `${itemStr.substring(0, 100)}...` :
                                      itemStr;
                                      return (
                                        <li key={itemStr} className="text-xs">
                                              {displayStr}
                                            </li>);

                                    })}
                                      </ul>
                                    </div> :
                                (() => {
                                  if (mapping.length > 200) return `${mapping.substring(0, 200)}...`;
                                  return mapping;
                                })()}
                                </div> :

                              <div className="text-xs text-muted-foreground italic">
                                  Not mapped
                                </div>
                              }
                            </div>);

                        })}
                      </div>
                    </div>
                    }
                </div>

                {mappedColumns.length > 0 && dataset.header &&
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Mapped Values ({mappedColumns.length}/{dataset.header.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {mappedColumns.map(({ columnName }) =>
                      <Badge key={columnName} variant="secondary">
                          {columnName}
                        </Badge>
                      )}
                    </div>
                  </div>
                  }
              </>);

            })()}
          </div>

          <SheetFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}>

              Cancel
            </Button>
            <Button
              onClick={handleAddToDataset}
              disabled={isSubmitting || !datasetId || !dataset || mappedColumns.length === 0}>

              {isSubmitting ?
              <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </> :

              'Add to Dataset'
              }
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>);

}