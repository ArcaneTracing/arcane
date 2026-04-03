export type SearchMode = 'query' | 'tag' | 'tag-values' | 'span-name';

export interface SearchFilters {
  datasourceId: string;
  q: string;
  attributes: string;
  min_duration: string;
  max_duration: string;
  lookback: string;
  startDate?: Date;
  endDate?: Date;
  limit: number;
  spanName: string;
}

export interface SearchTopBarProps {
  filters: SearchFilters;
  startDate?: Date;
  endDate?: Date;
  isSearchLoading: boolean;
  onFiltersChange: (updates: Partial<SearchFilters>) => void;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onSearch: () => void;
  config?: {
    showQueryEditor: boolean;
    showAttributesFilter: boolean;
    loadAttributeNames: boolean;
    loadAttributeValues: boolean;
  };
}