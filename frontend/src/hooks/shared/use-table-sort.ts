import { useState, useCallback, useMemo } from 'react';
import type { NonObjectPrimitive } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc';


function toComparable(value: unknown, isDateField: boolean): number | string {
  if (isDateField) {
    if (value instanceof Date) return value.getTime();
    if (value && typeof value === 'string' && !Number.isNaN(Date.parse(value))) {
      return new Date(value).getTime();
    }
  }
  if (value == null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'string') return value;
  return String(value as NonObjectPrimitive);
}


export function compareWithDirection(cmp: number, direction: SortDirection): number {
  if (cmp < 0) return direction === 'asc' ? -1 : 1;
  if (cmp > 0) return direction === 'asc' ? 1 : -1;
  return 0;
}
export function compareTableItemValues(
aValue: unknown,
bValue: unknown,
sortKey: string,
direction: SortDirection,
dateFields: string[] = ['createdAt', 'updatedAt'])
: number {
  const isDate = dateFields.includes(sortKey);
  const a = toComparable(aValue, isDate);
  const b = toComparable(bValue, isDate);
  const cmp =
  typeof a === 'string' && typeof b === 'string' ?
  a.toLowerCase().localeCompare(b.toLowerCase()) :
  (a as number) - (b as number);
  return compareWithDirection(cmp, direction);
}

export interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

export interface TableSortOptions<T> {
  defaultSortKey?: keyof T;
  defaultDirection?: SortDirection;
  dateFields?: (keyof T)[];
  numericFields?: (keyof T)[];
  customSort?: (a: T, b: T, key: keyof T, direction: SortDirection) => number;
}

function valueToNumericParseString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'object') return '0';
  return String(value as NonObjectPrimitive);
}

function valueToComparableString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'object') return JSON.stringify(value).toLowerCase();
  if (typeof value === 'string') return value.toLowerCase();
  return String(value as NonObjectPrimitive).toLowerCase();
}

function toSortableDate(value: unknown): number {
  if (value instanceof Date) return value.getTime();
  if (value && typeof value === 'string' && !Number.isNaN(Date.parse(value))) {
    return new Date(value).getTime();
  }
  return 0;
}

function toSortableValue(
  value: unknown,
  isDateField: boolean,
  isNumericField: boolean,
): number | string {
  if (isDateField) return toSortableDate(value);
  if (isNumericField) {
    const str = valueToNumericParseString(value);
    const n = Number.parseFloat(str);
    return Number.isNaN(n) ? 0 : n;
  }
  return valueToComparableString(value);
}

function compareSortableValues(
aVal: number | string,
bVal: number | string,
order: SortDirection)
: number {
  const cmp = typeof aVal === 'number' && typeof bVal === 'number' ?
  aVal - bVal :
  String(aVal).localeCompare(String(bVal));
  return compareWithDirection(cmp, order);
}

function compareTableRow<T>(
a: T,
b: T,
sortBy: keyof T,
order: SortDirection,
dateFields: (keyof T)[],
numericFields: (keyof T)[])
: number {
  const isDateField = dateFields.includes(sortBy);
  const isNumericField = numericFields.includes(sortBy);
  const aVal = toSortableValue((a as Record<keyof T, unknown>)[sortBy], isDateField, isNumericField);
  const bVal = toSortableValue((b as Record<keyof T, unknown>)[sortBy], isDateField, isNumericField);
  return compareSortableValues(aVal, bVal, order);
}

export function useTableSort<T>(
items: T[],
options?: TableSortOptions<T>)
{
  const {
    defaultSortKey = null,
    defaultDirection = 'asc',
    dateFields = [],
    numericFields = [],
    customSort
  } = options || {};

  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: defaultSortKey,
    direction: defaultDirection
  });

  const handleSort = useCallback((key: keyof T) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
      prevConfig.key === key && prevConfig.direction === 'asc' ?
      'desc' :
      'asc'
    }));
  }, []);

  const sortedItems = useMemo(() => {
    if (!sortConfig.key) return items;

    const sorted = [...items];
    const sortBy = sortConfig.key;
    const order = sortConfig.direction;

    sorted.sort((a, b) => {
      if (customSort) {
        return customSort(a, b, sortBy, order);
      }
      return compareTableRow(a, b, sortBy, order, dateFields, numericFields);
    });

    return sorted;
  }, [items, sortConfig, dateFields, numericFields, customSort]);

  return {
    sortedItems,
    sortConfig,
    handleSort
  };
}