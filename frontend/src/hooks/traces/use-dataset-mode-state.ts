import { useState, useEffect, useMemo } from 'react';
import { useDatasetQuery } from '@/hooks/datasets/use-datasets-query';

export interface UseDatasetModeStateReturn {
  datasetMode: boolean;
  selectedDatasetId: string | null;
  columnMappings: Map<string, string | string[]>;
  datasetColumns: string[];
  isMappingDrawerOpen: boolean;
  mappedColumnsSet: Set<string>;
  setDatasetMode: (enabled: boolean) => void;
  setSelectedDatasetId: (id: string | null) => void;
  setIsMappingDrawerOpen: (open: boolean) => void;
  handleMapToColumn: (columnName: string, value: string, mode?: 'add' | 'map') => void;
  handleRemoveMapping: (columnName: string) => void;
  handleAddToDataset: () => void;
}

export function useDatasetModeState(
projectId: string | undefined)
: UseDatasetModeStateReturn {
  const [datasetMode, setDatasetMode] = useState(false);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [columnMappings, setColumnMappings] = useState<
    Map<string, string | string[]>>(
    new Map());
  const [datasetColumns, setDatasetColumns] = useState<string[]>([]);
  const [isMappingDrawerOpen, setIsMappingDrawerOpen] = useState(false);


  const { data: dataset } = useDatasetQuery(projectId, selectedDatasetId);

  useEffect(() => {
    if (dataset?.header) {
      setDatasetColumns(dataset.header);

      setColumnMappings((prev) => {
        const newMap = new Map(prev);

        Array.from(newMap.keys()).forEach((col) => {
          if (!dataset.header.includes(col)) {
            newMap.delete(col);
          }
        });
        return newMap;
      });
    } else if (!selectedDatasetId) {
      setDatasetColumns([]);
    }
  }, [dataset, selectedDatasetId]);


  useEffect(() => {
    if (!datasetMode) {
      setSelectedDatasetId(null);
      setColumnMappings(new Map());
      setDatasetColumns([]);
    }
  }, [datasetMode]);

  const handleMapToColumn = (
  columnName: string,
  value: string,
  mode: 'add' | 'map' = 'add') =>
  {
    setColumnMappings((prev) => {
      const newMap = new Map(prev);

      if (mode === 'map') {

        newMap.set(columnName, value);
      } else {

        const existingValue = newMap.get(columnName);

        if (existingValue) {
          if (Array.isArray(existingValue)) {

            newMap.set(columnName, [...existingValue, value]);
          } else {

            newMap.set(columnName, [existingValue, value]);
          }
        } else {

          newMap.set(columnName, [value]);
        }
      }

      return newMap;
    });
  };

  const handleRemoveMapping = (columnName: string) => {
    setColumnMappings((prev) => {
      const newMap = new Map(prev);
      newMap.delete(columnName);
      return newMap;
    });
  };

  const handleAddToDataset = () => {

    setColumnMappings(new Map());
  };

  const mappedColumnsSet = useMemo(() => {
    return new Set(columnMappings.keys());
  }, [columnMappings]);

  return {
    datasetMode,
    selectedDatasetId,
    columnMappings,
    datasetColumns,
    isMappingDrawerOpen,
    mappedColumnsSet,
    setDatasetMode,
    setSelectedDatasetId,
    setIsMappingDrawerOpen,
    handleMapToColumn,
    handleRemoveMapping,
    handleAddToDataset
  };
}