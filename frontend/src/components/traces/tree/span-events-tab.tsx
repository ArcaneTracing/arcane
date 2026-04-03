"use client";

import { ScrollArea } from '@/components/ui/scroll-area';
import { useEventCollection } from './use-event-collection';
import { useFilterOptions } from './use-filter-options';
import { useEventFilters } from './use-event-filters';
import { useSpanSideMap } from './use-span-side-map';
import { useEntityMap } from './use-entity-map';
import { EventTimeline } from './event-timeline';
import { FiltersSidebar } from './filters-sidebar';
import type { NormalizedSpan } from '@/types/traces';

interface SpanEventsTabProps {
  spans: NormalizedSpan[];
  selectedSpan: NormalizedSpan | null;
  onSpanSelect: (span: NormalizedSpan) => void;
}

export function SpanEventsTab({
  spans,
  selectedSpan,
  onSpanSelect
}: Readonly<SpanEventsTabProps>) {
  const isViewingSingleSpan = selectedSpan !== null;


  const allEventsUnfiltered = useEventCollection(spans, selectedSpan);


  const filterOptions = useFilterOptions(spans, allEventsUnfiltered);


  const entityMap = useEntityMap(spans);


  const { filters, setFilters, allEvents } = useEventFilters(allEventsUnfiltered, entityMap);


  const spanSideMap = useSpanSideMap(allEvents);

  return (
    <div className="flex h-full">
      {}
      {!isViewingSingleSpan &&
      <FiltersSidebar
        filters={filters}
        filterOptions={filterOptions}
        entityMap={entityMap}
        onFilterChange={setFilters} />

      }

      {}
      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="max-w-4xl mx-auto">
              <div className="relative min-h-full">
                {}
                {allEvents.length > 0 &&
                <div className="absolute left-1/2 top-0 w-0.5 bg-border -translate-x-1/2" style={{ height: '100%' }} />
                }
                
                {}
                <EventTimeline
                  allEvents={allEvents}
                  spanSideMap={spanSideMap}
                  isViewingSingleSpan={isViewingSingleSpan}
                  onSpanSelect={onSpanSelect} />

              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>);

}