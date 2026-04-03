import { useState, useMemo, useEffect, useCallback } from 'react';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface TablePaginationOptions {
  itemsPerPage?: number;
  dependencies?: any[];
}

function calculateItemsPerPage(): number {
  if (globalThis.window === undefined) return 10;

  const height = globalThis.window.innerHeight;
  if (height < 1000) return 6;
  if (height > 1500) return 15;
  return 10;
}

export function useTablePagination<T>(
items: T[] | undefined,
options?: TablePaginationOptions)
{
  const { itemsPerPage, dependencies = [] } = options || {};
  const tableLimit = useMemo(() => {
    return itemsPerPage !== undefined && itemsPerPage > 0 ? itemsPerPage : calculateItemsPerPage();
  }, [itemsPerPage]);
  const [currentPage, setCurrentPage] = useState(1);

  const safeItems = items || [];


  useEffect(() => {
    setCurrentPage(1);
  }, [...dependencies, itemsPerPage]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * tableLimit;
    const endIndex = startIndex + tableLimit;
    return safeItems.slice(startIndex, endIndex);
  }, [safeItems, currentPage, tableLimit]);

  const meta: PaginationMeta = useMemo(() => {
    const total = safeItems.length;
    const totalPages = Math.ceil(total / tableLimit);

    return {
      page: currentPage,
      limit: tableLimit,
      total,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };
  }, [safeItems.length, currentPage, tableLimit]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    paginatedItems,
    meta,
    handlePageChange
  };
}