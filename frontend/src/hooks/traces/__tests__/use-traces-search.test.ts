import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  calculateDatesFromLookback,
  buildSearchParams,
  useTracesSearch } from
'../use-traces-search';
import type { TracesFilters } from '../use-traces-url-state';

const mockUseTracesSearchQuery = jest.fn();
jest.mock('@/hooks/traces/use-traces-query', () => ({
  useTracesSearchQuery: (...args: unknown[]) => mockUseTracesSearchQuery(...args),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  return function Wrapper({ children }: {children: React.ReactNode;}) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const baseFilters: TracesFilters = {
  datasourceId: 'ds-1',
  q: '',
  attributes: '',
  min_duration: '',
  max_duration: '',
  lookback: '1h',
  limit: 20,
  spanName: '',
};

describe('calculateDatesFromLookback', () => {
  it('returns same date for invalid lookback', () => {
    const { startDate, endDate } = calculateDatesFromLookback('x');
    expect(startDate).toBeInstanceOf(Date);
    expect(endDate).toBeInstanceOf(Date);
  });

  it('subtracts minutes for "5m"', () => {
    const { startDate, endDate } = calculateDatesFromLookback('5m');
    expect(endDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
    expect(endDate.getTime() - startDate.getTime()).toBeGreaterThanOrEqual(4 * 60 * 1000);
  });

  it('subtracts hours for "1h"', () => {
    const { startDate, endDate } = calculateDatesFromLookback('1h');
    const diff = endDate.getTime() - startDate.getTime();
    expect(diff).toBeGreaterThanOrEqual(59 * 60 * 1000);
  });

  it('subtracts days for "7d"', () => {
    const { startDate, endDate } = calculateDatesFromLookback('7d');
    expect(endDate.getTime()).toBeGreaterThan(startDate.getTime());
  });
});

describe('buildSearchParams', () => {
  it('returns null when custom mode and no start/end', () => {
    const f: TracesFilters = { ...baseFilters, lookback: 'custom' };
    expect(buildSearchParams(f, undefined, undefined)).toBeNull();
    expect(buildSearchParams(f, new Date(), undefined)).toBeNull();
    expect(buildSearchParams(f, undefined, new Date())).toBeNull();
  });

  it('returns params for custom mode with both dates', () => {
    const f: TracesFilters = { ...baseFilters, lookback: 'custom', q: 'x' };
    const start = new Date('2024-01-10T10:00:00.000Z');
    const end = new Date('2024-01-10T12:00:00.000Z');
    const p = buildSearchParams(f, start, end);
    expect(p).not.toBeNull();
    expect(p!.start).toBe('2024-01-10T10:00:00.000Z');
    expect(p!.end).toBe('2024-01-10T12:00:00.000Z');
    expect(p!.q).toBe('x');
    expect(p!.limit).toBe(20);
  });

  it('returns params for lookback mode without start/end', () => {
    const p = buildSearchParams(baseFilters, undefined, undefined);
    expect(p).not.toBeNull();
    expect(p!.start).toBeDefined();
    expect(p!.end).toBeDefined();

    expect(p!.lookback).toBeUndefined();
  });

  it('uses attributes string in params', () => {
    const f: TracesFilters = {
      ...baseFilters,
      attributes: 'service.name=my-service span.kind=server'
    };
    const start = new Date();
    const end = new Date();
    const p = buildSearchParams(f, start, end);
    expect(p!.attributes).toBe('service.name=my-service span.kind=server');
  });

  it('merges spanName into attributes as name=value', () => {
    const f: TracesFilters = {
      ...baseFilters,
      spanName: 'project_span',
      attributes: 'service.name=my-service',
    };
    const start = new Date();
    const end = new Date();
    const p = buildSearchParams(f, start, end);
    expect(p!.attributes).toContain('name=project_span');
    expect(p!.attributes).toContain('service.name=my-service');
  });

  it('converts lookback to start/end dates', () => {
    const f: TracesFilters = {
      ...baseFilters,
      lookback: '1h'
    };
    const p = buildSearchParams(f, undefined, undefined);
    expect(p).not.toBeNull();
    expect(p!.start).toBeDefined();
    expect(p!.end).toBeDefined();

    const startTime = new Date(p!.start).getTime();
    const endTime = new Date(p!.end).getTime();
    const diffHours = (endTime - startTime) / (1000 * 60 * 60);
    expect(diffHours).toBeCloseTo(1, 0);
  });
});

describe('useTracesSearch', () => {
  beforeEach(() => {
    mockUseTracesSearchQuery.mockReturnValue({
      data: { traces: [] },
      isFetching: false,
      error: null,
    });
  });

  it('returns traces, isSearchLoading, searchError, handleSearch', () => {
    const { result } = renderHook(
      () =>
        useTracesSearch({
          projectId: 'p1',
          filters: baseFilters,
          startDate: undefined,
          endDate: undefined,
          isFetchLoading: false,
          datasourcesLength: 1,
        }),
      { wrapper: createWrapper() }
    );
    expect(result.current.traces).toEqual([]);
    expect(result.current.isSearchLoading).toBe(false);
    expect(result.current.searchError).toBeNull();
    expect(typeof result.current.handleSearch).toBe('function');
  });

  it('handleSearch triggers query with params when params are buildable', () => {
    const start = new Date('2024-01-10T10:00:00.000Z');
    const end = new Date('2024-01-10T12:00:00.000Z');
    const { result } = renderHook(
      () =>
        useTracesSearch({
          projectId: 'p1',
          filters: { ...baseFilters, lookback: 'custom' },
          startDate: start,
          endDate: end,
          isFetchLoading: false,
          datasourcesLength: 1,
        }),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.handleSearch();
    });

    expect(mockUseTracesSearchQuery).toHaveBeenCalled();
    const lastCall = mockUseTracesSearchQuery.mock.calls[mockUseTracesSearchQuery.mock.calls.length - 1];
    expect(lastCall[0]).toBe('p1');
    expect(lastCall[1]).toBe('ds-1');
    expect(lastCall[2]).toEqual(
      expect.objectContaining({
        start: '2024-01-10T10:00:00.000Z',
        end: '2024-01-10T12:00:00.000Z',
        limit: 20,
      })
    );
    expect(lastCall[3]).toBe(true);
  });

  it('handleSearch does not trigger query when datasourceId is empty', () => {
    mockUseTracesSearchQuery.mockClear();
    const { result } = renderHook(
      () =>
        useTracesSearch({
          projectId: 'p1',
          filters: { ...baseFilters, datasourceId: '' },
          startDate: new Date(),
          endDate: new Date(),
          isFetchLoading: false,
          datasourcesLength: 1,
        }),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.handleSearch();
    });

    expect(mockUseTracesSearchQuery).toHaveBeenCalledWith('p1', '', expect.anything(), false);
  });

  it('handleSearch does not trigger query when custom mode and no dates', () => {
    mockUseTracesSearchQuery.mockClear();
    const { result } = renderHook(
      () =>
        useTracesSearch({
          projectId: 'p1',
          filters: { ...baseFilters, lookback: 'custom' },
          startDate: undefined,
          endDate: undefined,
          isFetchLoading: false,
          datasourcesLength: 1,
        }),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.handleSearch();
    });

    expect(mockUseTracesSearchQuery).toHaveBeenCalledWith(
      'p1',
      'ds-1',
      expect.objectContaining({ start: '', end: '' }),
      false
    );
  });
});