import { SearchTopBar } from "@/components/traces/list/search-top-bar"
import { TracesList } from "@/components/traces/list/traces-list"
import type { SearchFilters } from "@/components/traces/list/search-top-bar/types"
import type { TempoTraceSummary, TracesSearchConfig } from "@/types/traces"

export interface TracesPageViewProps {
  filters: SearchFilters
  startDate: Date | undefined
  endDate: Date | undefined
  isSearchLoading: boolean
  onFiltersChange: (updates: Partial<SearchFilters>) => void
  onStartDateChange: (date: Date | undefined) => void
  onEndDateChange: (date: Date | undefined) => void
  onSearch: () => void
  traces: TempoTraceSummary[]
  datasourceId: string
  isFetchLoading: boolean
  searchError: string | null
  config: TracesSearchConfig
}

export function TracesPageView(props: Readonly<TracesPageViewProps>) {
  const {
    filters,
    startDate,
    endDate,
    isSearchLoading,
    onFiltersChange,
    onStartDateChange,
    onEndDateChange,
    onSearch,
    traces,
    datasourceId,
    isFetchLoading,
    searchError,
    config,
  } = props

  return (
    <div className="flex flex-col h-full">
      <SearchTopBar
        filters={filters}
        startDate={startDate}
        endDate={endDate}
        isSearchLoading={isSearchLoading}
        onFiltersChange={onFiltersChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onSearch={onSearch}
        config={config}
      />
      <div className="flex-1 overflow-auto min-h-0">
        <TracesList
          traces={traces}
          datasourceId={datasourceId}
          isSearchLoading={isSearchLoading}
          isFetchLoading={isFetchLoading}
          searchError={searchError}
          startDate={startDate}
          endDate={endDate}
          filters={filters}
        />
      </div>
    </div>
  )
}
