import { useCallback, useMemo, useState, useEffect } from 'react';
import { useTracesSearchQuery } from '@/hooks/traces/use-traces-query';
import { calculateDatesFromLookback } from '@/lib/lookback';
import type { TracesFilters } from '@/hooks/traces/use-traces-url-state';
import type { TraceSearchParams } from '@/api/traces';


export { calculateDatesFromLookback } from '@/lib/lookback';

/** Merges span name into attributes as name=value (OpenTelemetry/TraceQL convention). */
function buildAttributesWithSpanName(attributes: string, spanName: string): string {
  const spanNamePart = spanName?.trim() ? `name=${spanName.trim()}` : '';
  const attrsPart = attributes?.trim() ?? '';
  return [spanNamePart, attrsPart].filter(Boolean).join(' ');
}

/** Rounds start/end to the minute for a stable query key (avoids refetches on every render). */
function stabilizeParamsForCache(params: TraceSearchParams): TraceSearchParams {
  const roundToMinute = (iso: string) => {
    const d = new Date(iso);
    d.setSeconds(0, 0);
    return d.toISOString();
  };
  return { ...params, start: roundToMinute(params.start), end: roundToMinute(params.end) };
}

export function buildSearchParams(
filters: TracesFilters,
startDate: Date | undefined,
endDate: Date | undefined)
: TraceSearchParams | null {
  let start: string;
  let end: string;


  if (filters.lookback && filters.lookback !== 'custom') {
    const { startDate: s, endDate: e } = calculateDatesFromLookback(filters.lookback);
    start = s.toISOString();
    end = e.toISOString();
  } else {

    if (!startDate || !endDate) return null;
    start = startDate.toISOString();
    end = endDate.toISOString();
  }

  const attributes = buildAttributesWithSpanName(filters.attributes, filters.spanName);

  return {
    start,
    end,
    q: filters.q || undefined,
    attributes: attributes || undefined,
    minDuration: filters.min_duration || undefined,
    maxDuration: filters.max_duration || undefined,
    limit: filters.limit
  };
}

export interface UseTracesSearchOptions {
  projectId: string | undefined;
  filters: TracesFilters;
  startDate: Date | undefined;
  endDate: Date | undefined;
  isFetchLoading: boolean;
  datasourcesLength: number;
}
export function useTracesSearch(options: UseTracesSearchOptions) {
  const {
    projectId,
    filters,
    startDate,
    endDate,
    isFetchLoading,
    datasourcesLength
  } = options;

  const [searchParams, setSearchParams] = useState<TraceSearchParams | null>(null);

  useEffect(() => {
    setSearchParams(null);
  }, [filters.datasourceId]);

  const stableSearchParams = useMemo(
    () => (searchParams ? stabilizeParamsForCache(searchParams) : null),
    [searchParams]
  );

  const canSearch =
    !!projectId &&
    !isFetchLoading &&
    datasourcesLength > 0 &&
    !!filters.datasourceId &&
    typeof filters.datasourceId === 'string' &&
    filters.datasourceId.trim() !== '';

  const query = useTracesSearchQuery(
    projectId,
    filters.datasourceId,
    stableSearchParams ?? { start: '', end: '' },
    !!stableSearchParams && !!stableSearchParams.start && !!stableSearchParams.end
  );

  const traces = query.data?.traces ?? [];
  const isSearchLoading = query.isFetching;
  const searchError = query.error?.message ?? null;

  const handleSearch = useCallback(() => {
    if (!canSearch) return;
    const params = buildSearchParams(filters, startDate, endDate);
    if (params) setSearchParams(params);
  }, [canSearch, filters, startDate, endDate]);

  return { traces, isSearchLoading, searchError, handleSearch };
}