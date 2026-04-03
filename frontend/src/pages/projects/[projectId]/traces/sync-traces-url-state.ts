import type { TracesFilters } from '@/hooks/traces/use-traces-url-state'

type SearchParams = {
  start?: unknown
  end?: unknown
  datasourceId?: unknown
  q?: unknown
  attributes?: unknown
  min_duration?: unknown
  max_duration?: unknown
  lookback?: unknown
  limit?: unknown
  spanName?: unknown
}

type StateSetters = {
  setStartDate: (date: Date) => void
  setEndDate: (date: Date) => void
  setFilters: React.Dispatch<React.SetStateAction<TracesFilters>>
  isUpdatingFromUrlRef: React.RefObject<boolean>
}

type CurrentState = {
  startDate: Date | undefined
  endDate: Date | undefined
  filters: TracesFilters
}

function serializeSearchParams(search: SearchParams): string {
  return JSON.stringify({
    start: search.start,
    end: search.end,
    datasourceId: search.datasourceId,
    q: search.q,
    attributes: search.attributes,
    min_duration: search.min_duration,
    max_duration: search.max_duration,
    lookback: search.lookback,
    limit: search.limit,
    spanName: search.spanName,
  })
}

function updateStartDate(
  searchStart: string | undefined,
  currentStart: Date | undefined,
  setStartDate: (date: Date) => void
): void {
  if (searchStart && searchStart !== currentStart?.toISOString()) {
    setStartDate(new Date(searchStart))
  }
}

function updateEndDate(
  searchEnd: string | undefined,
  currentEnd: Date | undefined,
  setEndDate: (date: Date) => void
): void {
  if (searchEnd && searchEnd !== currentEnd?.toISOString()) {
    setEndDate(new Date(searchEnd))
  }
}

function updateDatasourceId(
  searchDatasourceId: string | undefined,
  currentDatasourceId: string,
  setFilters: React.Dispatch<React.SetStateAction<TracesFilters>>
): void {
  if (searchDatasourceId && searchDatasourceId !== currentDatasourceId) {
    setFilters((prev) => ({
      ...prev,
      datasourceId: searchDatasourceId,
      q: '',
      attributes: '',
      spanName: '',
    }))
  }
}

function updateQuery(
  searchQ: string | undefined,
  currentQ: string,
  setFilters: React.Dispatch<React.SetStateAction<TracesFilters>>
): void {
  if (searchQ !== undefined && searchQ !== currentQ) {
    setFilters((prev) => ({ ...prev, q: searchQ }))
  }
}

function updateAttributes(
  searchAttributes: string | undefined,
  currentAttributes: string,
  setFilters: React.Dispatch<React.SetStateAction<TracesFilters>>
): void {
  if (searchAttributes !== undefined && searchAttributes !== currentAttributes) {
    setFilters((prev) => ({ ...prev, attributes: searchAttributes }))
  }
}

function updateMinDuration(
  searchMinDuration: string | undefined,
  currentMinDuration: string,
  setFilters: React.Dispatch<React.SetStateAction<TracesFilters>>
): void {
  if (searchMinDuration !== undefined && searchMinDuration !== currentMinDuration) {
    setFilters((prev) => ({ ...prev, min_duration: searchMinDuration }))
  }
}

function updateMaxDuration(
  searchMaxDuration: string | undefined,
  currentMaxDuration: string,
  setFilters: React.Dispatch<React.SetStateAction<TracesFilters>>
): void {
  if (searchMaxDuration !== undefined && searchMaxDuration !== currentMaxDuration) {
    setFilters((prev) => ({ ...prev, max_duration: searchMaxDuration }))
  }
}

function updateLookback(
  searchLookback: string | undefined,
  currentLookback: string,
  setFilters: React.Dispatch<React.SetStateAction<TracesFilters>>,
  isUpdatingFromUrlRef: React.RefObject<boolean>
): void {
  if (searchLookback && searchLookback !== currentLookback) {
    isUpdatingFromUrlRef.current = true
    setFilters((prev) => ({ ...prev, lookback: searchLookback }))
    requestAnimationFrame(() => {
      isUpdatingFromUrlRef.current = false
    })
  }
}

function updateLimit(
  searchLimit: string | undefined,
  currentLimit: number,
  setFilters: React.Dispatch<React.SetStateAction<TracesFilters>>
): void {
  if (searchLimit !== undefined) {
    const limit = Number.parseInt(searchLimit, 10) || 20
    if (limit !== currentLimit) {
      setFilters((prev) => ({ ...prev, limit }))
    }
  }
}

function updateSpanName(
  searchSpanName: string | undefined,
  currentSpanName: string,
  setFilters: React.Dispatch<React.SetStateAction<TracesFilters>>
): void {
  if (searchSpanName !== undefined && searchSpanName !== currentSpanName) {
    setFilters((prev) => ({ ...prev, spanName: searchSpanName }))
  }
}

export function syncTracesStateFromUrl(
  search: SearchParams,
  currentState: CurrentState,
  setters: StateSetters,
  prevSearchRef: React.RefObject<string>
): void {
  const currentSearchString = serializeSearchParams(search)
  const willSync = !setters.isUpdatingFromUrlRef.current && currentSearchString !== prevSearchRef.current

  if (willSync) {
    prevSearchRef.current = currentSearchString

    const searchStart = search.start as string | undefined
    const searchEnd = search.end as string | undefined
    const searchDatasourceId = search.datasourceId as string | undefined
    const searchQ = search.q as string | undefined
    const searchAttributes = search.attributes as string | undefined
    const searchMinDuration = search.min_duration as string | undefined
    const searchMaxDuration = search.max_duration as string | undefined
    const searchLookback = search.lookback as string | undefined
    const searchLimit = search.limit as string | undefined
    const searchSpanName = search.spanName as string | undefined

    updateStartDate(searchStart, currentState.startDate, setters.setStartDate)
    updateEndDate(searchEnd, currentState.endDate, setters.setEndDate)
    updateQuery(searchQ, currentState.filters.q, setters.setFilters)
    updateAttributes(searchAttributes, currentState.filters.attributes, setters.setFilters)
    updateMinDuration(searchMinDuration, currentState.filters.min_duration, setters.setFilters)
    updateMaxDuration(searchMaxDuration, currentState.filters.max_duration, setters.setFilters)
    updateLookback(searchLookback, currentState.filters.lookback, setters.setFilters, setters.isUpdatingFromUrlRef)
    updateLimit(searchLimit, currentState.filters.limit, setters.setFilters)
    updateSpanName(searchSpanName, currentState.filters.spanName ?? '', setters.setFilters)
    updateDatasourceId(searchDatasourceId, currentState.filters.datasourceId, setters.setFilters)
  } else if (currentSearchString !== prevSearchRef.current) {
    prevSearchRef.current = currentSearchString
  }
}
