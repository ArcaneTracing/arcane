import { useMemo } from 'react';
import { safeStringify } from '@/lib/utils';

export interface TableFilterOptions<T> {
  searchFields?: (keyof T)[];
  customFilter?: (item: T, searchQuery: string) => boolean;
}

export function useTableFilter<T>(
items: T[],
searchQuery: string,
options?: TableFilterOptions<T>)
: T[] {
  const { searchFields, customFilter } = options || {};

  return useMemo(() => {
    if (!searchQuery.trim()) return items;

    const searchLower = searchQuery.toLowerCase();

    if (customFilter) {
      return items.filter((item) => customFilter(item, searchLower));
    }

    if (searchFields && searchFields.length > 0) {
      return items.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (value == null) return false;
        const valueStr = safeStringify(value);
        return valueStr.toLowerCase().includes(searchLower);
      })
      );
    }


    return items.filter((item) =>
    Object.values(item).some((value) => {
      if (value == null) return false;
      const valueStr = safeStringify(value);
      return valueStr.toLowerCase().includes(searchLower);
    })
    );
  }, [items, searchQuery, searchFields, customFilter]);
}