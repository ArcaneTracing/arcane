"use client";

import { SpanTreeNode } from './trace-span-tree-node';
import { ViewerFiltersBar } from './viewer-filters-bar';
import { useViewerFilters } from './use-viewer-filters';
import { useViewerFilterOptions } from './use-viewer-filter-options';
import type { NormalizedSpan, TempoTraceResponse } from '@/types/traces';

interface TraceTreePanelProps {
  spanTree: NormalizedSpan[];
  selectedSpanId?: string | null;
  onSpanSelect: (span: NormalizedSpan) => void;
  expandedNodes: Set<string>;
  onToggleExpand: (spanId: string) => void;
  trace: TempoTraceResponse | Record<string, unknown> | null | undefined;
}
export function TraceTreePanel({
  spanTree,
  selectedSpanId,
  onSpanSelect,
  expandedNodes,
  onToggleExpand,
  trace
}: Readonly<TraceTreePanelProps>) {

  const { filterOptions, entityMap } = useViewerFilterOptions(spanTree);


  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredSpanTree
  } = useViewerFilters(spanTree);

  return (
    <div className="w-80 border-r flex flex-col">
      <ViewerFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        filterOptions={filterOptions}
        entityMap={entityMap}
        onFilterChange={setFilters}
        selectedSpanId={selectedSpanId}
        spanTree={spanTree}
        trace={trace} />

      <div className="flex-1 overflow-auto">
        <div className="p-2">
          {filteredSpanTree.length > 0 ?
          filteredSpanTree.map((root) =>
          <SpanTreeNode
            key={root.spanId}
            span={root}
            depth={0}
            selectedSpanId={selectedSpanId}
            onSelect={onSpanSelect}
            expandedNodes={expandedNodes}
            onToggleExpand={onToggleExpand} />

          ) :

          <div className="text-sm text-muted-foreground text-center py-4">
              {searchQuery ? `No spans found matching "${searchQuery}"` : 'No spans found'}
            </div>
          }
        </div>
      </div>
    </div>);

}