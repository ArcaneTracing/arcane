import { useRef, useCallback } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { Lookback } from '@/types/enums';

export interface TracesFilters {
  datasourceId: string;
  q: string;
  attributes: string;
  min_duration: string;
  max_duration: string;
  lookback: string;
  limit: number;
  spanName: string;
}

export interface TracesUrlState {
  startDate: Date | undefined;
  endDate: Date | undefined;
  filters: TracesFilters;
}

export interface TracesUrlUpdates {
  datasourceId?: string;
  q?: string;
  attributes?: string;
  min_duration?: string;
  max_duration?: string;
  lookback?: string;
  start?: Date;
  end?: Date;
  limit?: number;
  spanName?: string;
}

export function parseTagValues(tagValuesParam: string | null): Array<{tag: string;value: string;}> {
  if (!tagValuesParam) return [];
  try {
    return JSON.parse(decodeURIComponent(tagValuesParam));
  } catch {
    return [];
  }
}
export type TracesListSearchParams = Record<string, string>;

export function stateToTracesListSearch(state: TracesUrlState): TracesListSearchParams {
  const search: TracesListSearchParams = {};
  if (state.filters.datasourceId) search.datasourceId = state.filters.datasourceId;
  if (state.filters.q) search.q = state.filters.q;
  if (state.filters.attributes) search.attributes = state.filters.attributes;
  if (state.filters.min_duration) search.min_duration = state.filters.min_duration;
  if (state.filters.max_duration) search.max_duration = state.filters.max_duration;
  if (state.filters.lookback) search.lookback = state.filters.lookback;
  if (state.filters.limit) search.limit = state.filters.limit.toString();
  if (state.filters.spanName) search.spanName = state.filters.spanName;
  if (state.startDate) search.start = state.startDate.toISOString();
  if (state.endDate) search.end = state.endDate.toISOString();
  return search;
}

export function searchToState(search: Record<string, unknown>): TracesUrlState {
  const start = search.start as string | undefined;
  const end = search.end as string | undefined;


  let attributes = search.attributes as string || '';
  if (!attributes && search.tags) {

    const tagsArray = (search.tags as string).split('|').filter(Boolean);
    if (tagsArray.length > 0) {
      attributes = tagsArray.join(' ');
    }
  }

  return {
    startDate: start ? new Date(start) : undefined,
    endDate: end ? new Date(end) : undefined,
    filters: {
      datasourceId: search.datasourceId as string || '',
      q: search.q as string || '',
      attributes,
      min_duration: search.min_duration as string || '',
      max_duration: search.max_duration as string || '',
      lookback: search.lookback as string || Lookback.HOUR,
      limit: Number.parseInt(search.limit as string || '20', 10),
      spanName: search.spanName as string || ''
    }
  };
}

function applyTracesUrlUpdates(
prev: Record<string, string>,
updates: TracesUrlUpdates)
: Record<string, string> {
  const newSearch = { ...prev };
  const setOrDelete = (key: string, value: string | undefined) => {
    if (value) newSearch[key] = value;else
    delete newSearch[key];
  };
  if (updates.datasourceId !== undefined) setOrDelete('datasourceId', updates.datasourceId);
  if (updates.q !== undefined) setOrDelete('q', updates.q);
  if (updates.attributes !== undefined) setOrDelete('attributes', updates.attributes);
  if (updates.min_duration !== undefined) setOrDelete('min_duration', updates.min_duration);
  if (updates.max_duration !== undefined) setOrDelete('max_duration', updates.max_duration);
  if (updates.lookback !== undefined) setOrDelete('lookback', updates.lookback);
  if (updates.start !== undefined) setOrDelete('start', updates.start?.toISOString());
  if (updates.end !== undefined) setOrDelete('end', updates.end?.toISOString());
  if (updates.limit !== undefined) newSearch.limit = updates.limit.toString();
  if (updates.spanName !== undefined) setOrDelete('spanName', updates.spanName);
  return newSearch;
}

export function useTracesUrlState() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const isUpdatingFromUrlRef = useRef(false);

  const updateUrlParams = useCallback(
    (updates: TracesUrlUpdates) => {
      isUpdatingFromUrlRef.current = true;
      navigate({
        to: pathname as any,
        search: (prev: Record<string, string>) => applyTracesUrlUpdates(prev, updates),
        replace: true
      });
      setTimeout(() => {
        isUpdatingFromUrlRef.current = false;
      }, 100);
    },
    [navigate, pathname]
  );

  return { updateUrlParams, isUpdatingFromUrlRef };
}