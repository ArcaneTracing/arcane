"use client";

import { useMemo } from 'react';
import { Search, Download, Copy, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { NormalizedSpan, TempoTraceResponse } from '@/types/traces';
import type { ViewerFilters } from './use-viewer-filters';
import type { ViewerFilterOptions } from './use-viewer-filter-options';

interface ViewerFiltersBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: ViewerFilters;
  filterOptions: ViewerFilterOptions;
  entityMap: Map<string, string>;
  onFilterChange: (filters: ViewerFilters) => void;
  selectedSpanId?: string | null;
  spanTree: NormalizedSpan[];
  trace: TempoTraceResponse | Record<string, unknown> | null | undefined;
}
function findSpanById(spans: NormalizedSpan[], spanId: string): NormalizedSpan | null {
  for (const span of spans) {
    if (span.spanId === spanId) {
      return span;
    }
    if (span.children) {
      const found = findSpanById(span.children, spanId);
      if (found) return found;
    }
  }
  return null;
}
function downloadSpanAsJson(span: NormalizedSpan) {
  if (!span) return;

  const jsonString = JSON.stringify(span, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `span-${span.spanId || 'unknown'}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
export function ViewerFiltersBar({
  searchQuery,
  onSearchChange,
  filters,
  filterOptions,
  entityMap,
  onFilterChange,
  selectedSpanId,
  spanTree,
  trace
}: Readonly<ViewerFiltersBarProps>) {

  const selectedSpan = useMemo(() => {
    if (!selectedSpanId) return null;
    return findSpanById(spanTree, selectedSpanId);
  }, [spanTree, selectedSpanId]);

  const handleDownload = () => {
    if (selectedSpan) {
      downloadSpanAsJson(selectedSpan);
    }
  };

  const handleCopyTrace = async () => {
    if (!trace) return;

    const jsonString = JSON.stringify(trace, null, 2);
    try {
      await navigator.clipboard.writeText(jsonString);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const updateFilter = (key: keyof ViewerFilters, value: string | boolean) => {
    if (key === 'showOnlyEntitySpans') {
      onFilterChange({
        ...filters,
        showOnlyEntitySpans: value === true
      } as ViewerFilters);
    } else {
      const normalizedValue =
      typeof value === 'string' && value === '__all__' ? '' : value;
      onFilterChange({
        ...filters,
        [key]: normalizedValue
      } as ViewerFilters);
    }
  };


  const activeFilterCount =
  (filters.serviceName ? 1 : 0) + (
  filters.entityId ? 1 : 0) + (
  filters.showOnlyEntitySpans ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;


  const handleClearFilters = () => {
    onFilterChange({
      serviceName: '',
      entityId: '',
      showOnlyEntitySpans: false
    });
  };

  return (
    <div className="border-b p-3 min-w-0">
      {}
      <div className="flex items-center gap-2 min-w-0">
        <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="min-w-0 flex-1 text-sm border rounded px-2 py-1 bg-background" />

        <div className="flex items-center gap-0.5 flex-shrink-0">
        {}
        {(filterOptions.serviceNames.length > 0 || filterOptions.entityIds.length > 0) &&
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 relative"
                title="Filters">

                <Filter className="h-3 w-3" />
                {hasActiveFilters &&
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center text-[10px]">

                    {activeFilterCount}
                  </Badge>
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                {}
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Filters</h4>
                  {hasActiveFilters &&
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={handleClearFilters}>

                      Clear all
                    </Button>
                  }
                </div>

                {}
                {filterOptions.serviceNames.length > 0 &&
                <div className="space-y-2">
                    <Label htmlFor="service-name" className="text-xs">Service Name</Label>
                    <Select
                    value={filters.serviceName || '__all__'}
                    onValueChange={(value) => updateFilter('serviceName', value)}>

                      <SelectTrigger id="service-name" className="h-8 text-xs">
                        <SelectValue placeholder="All services" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All services</SelectItem>
                        {filterOptions.serviceNames.map((name) =>
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                      )}
                      </SelectContent>
                    </Select>
                  </div>
                }

                {}
                {filterOptions.entityIds.length > 0 &&
                <div className="space-y-2">
                    <Label htmlFor="entity" className="text-xs">Entity</Label>
                    <Select
                    value={filters.entityId || '__all__'}
                    onValueChange={(value) => updateFilter('entityId', value)}>

                      <SelectTrigger id="entity" className="h-8 text-xs">
                        <SelectValue placeholder="All entities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All entities</SelectItem>
                        {filterOptions.entityIds.map((id) =>
                      <SelectItem key={id} value={id}>
                            {entityMap.get(id) || id}
                          </SelectItem>
                      )}
                      </SelectContent>
                    </Select>
                  </div>
                }

                {}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-only-entity-spans"
                    checked={filters.showOnlyEntitySpans}
                    onCheckedChange={(checked) => {
                      updateFilter('showOnlyEntitySpans', checked === true);
                    }} />

                  <Label
                    htmlFor="show-only-entity-spans"
                    className="text-xs font-normal cursor-pointer">

                    Show only entity spans
                  </Label>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          }

        {}
        <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={handleDownload}
            disabled={!selectedSpan}
            title={selectedSpan ? `Download ${selectedSpan.name || selectedSpan.spanId}` : 'No span selected'}>

          <Download className="h-3.5 w-3.5" />
        </Button>
        <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={handleCopyTrace}
            disabled={!trace}
            title={trace ? 'Copy whole trace as JSON' : 'No trace available'}>

          <Copy className="h-3.5 w-3.5" />
        </Button>
        </div>
      </div>
    </div>);

}