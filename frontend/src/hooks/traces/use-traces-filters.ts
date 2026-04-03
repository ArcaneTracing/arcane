import { useCallback } from 'react';
import type { TracesFilters, TracesUrlUpdates } from './use-traces-url-state';

export type TracesFilterUpdates = Partial<
  Pick<
    TracesFilters,
    'datasourceId' |
    'q' |
    'attributes' |
    'min_duration' |
    'max_duration' |
    'lookback' |
    'limit' |
    'spanName'>>;
export interface UseTracesFiltersOptions {
  filters: TracesFilters;
  setFilters: React.Dispatch<React.SetStateAction<TracesFilters>>;
  setStartDate: (d: Date | undefined) => void;
  setEndDate: (d: Date | undefined) => void;
  updateUrlParams: (u: TracesUrlUpdates) => void;
}
export function useTracesFilters(options: UseTracesFiltersOptions) {
  const { filters, setFilters, setStartDate, setEndDate, updateUrlParams } = options;

  const updateFilters = useCallback(
    (updates: TracesFilterUpdates) => {
      const isDatasourceChange = updates.datasourceId !== undefined;

      const effectiveUpdates: TracesFilterUpdates = { ...updates };
      if (isDatasourceChange) {
        effectiveUpdates.q = '';
        effectiveUpdates.attributes = '';
        effectiveUpdates.spanName = '';
      }

      setFilters((prev) => ({ ...prev, ...effectiveUpdates }));

      const urlUpdates: TracesUrlUpdates = {};
      if (updates.datasourceId !== undefined) urlUpdates.datasourceId = updates.datasourceId;
      if (effectiveUpdates.q !== undefined) urlUpdates.q = effectiveUpdates.q;
      if (effectiveUpdates.attributes !== undefined) urlUpdates.attributes = effectiveUpdates.attributes;
      if (effectiveUpdates.spanName !== undefined) urlUpdates.spanName = effectiveUpdates.spanName;
      if (updates.min_duration !== undefined) urlUpdates.min_duration = updates.min_duration;
      if (updates.max_duration !== undefined) urlUpdates.max_duration = updates.max_duration;
      if (updates.lookback !== undefined) urlUpdates.lookback = updates.lookback;
      if (updates.limit !== undefined) urlUpdates.limit = updates.limit;

      if (Object.keys(urlUpdates).length > 0) {
        updateUrlParams(urlUpdates);
      }
    },
    [setFilters, updateUrlParams]
  );

  const handleStartDateChange = useCallback(
    (date: Date | undefined) => {
      setStartDate(date);
      updateUrlParams({ start: date });
      if (date && filters.lookback !== 'custom') {
        setFilters((prev) => ({ ...prev, lookback: 'custom' }));
        updateUrlParams({ lookback: 'custom' });
      }
    },
    [filters.lookback, setFilters, setStartDate, updateUrlParams]
  );

  const handleEndDateChange = useCallback(
    (date: Date | undefined) => {
      setEndDate(date);
      updateUrlParams({ end: date });
      if (date && filters.lookback !== 'custom') {
        setFilters((prev) => ({ ...prev, lookback: 'custom' }));
        updateUrlParams({ lookback: 'custom' });
      }
    },
    [filters.lookback, setFilters, setEndDate, updateUrlParams]
  );

  return { updateFilters, handleStartDateChange, handleEndDateChange };
}