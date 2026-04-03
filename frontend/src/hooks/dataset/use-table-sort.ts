import { useState, useCallback, useMemo } from 'react';
import { DatasetRowResponse } from '@/types/datasets';

type SortDirection = 'asc' | 'desc';

interface SortConfig {
  columnIndex: number | null;
  direction: SortDirection;
}

export function useTableSort(rows: DatasetRowResponse[], headerLength: number) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    columnIndex: null,
    direction: 'asc'
  });

  const handleSort = useCallback((columnIndex: number) => {
    setSortConfig((prevConfig) => ({
      columnIndex,
      direction: prevConfig.columnIndex === columnIndex && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const sortedRows = useMemo(() => {
    if (sortConfig.columnIndex === null) return rows;

    const sorted = [...rows];
    const columnIndex = sortConfig.columnIndex;
    const order = sortConfig.direction;

    sorted.sort((a, b) => {
      const aValue = a.values[columnIndex] || '';
      const bValue = b.values[columnIndex] || '';


      const aNum = Number.parseFloat(aValue);
      const bNum = Number.parseFloat(bValue);
      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
        return order === 'asc' ? aNum - bNum : bNum - aNum;
      }


      const aDate = new Date(aValue).getTime();
      const bDate = new Date(bValue).getTime();
      if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) {
        return order === 'asc' ? aDate - bDate : bDate - aDate;
      }


      const aStr = aValue.toLowerCase();
      const bStr = bValue.toLowerCase();
      if (aStr < bStr) return order === 'asc' ? -1 : 1;
      if (aStr > bStr) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [rows, sortConfig]);

  return {
    sortedRows,
    sortConfig,
    handleSort
  };
}