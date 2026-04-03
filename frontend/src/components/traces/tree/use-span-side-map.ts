import { useMemo } from 'react';
import type { EventWithSpan } from './use-event-collection';
export function useSpanSideMap(allEvents: EventWithSpan[]): Map<string, 'left' | 'right'> {
  return useMemo(() => {
    const map = new Map<string, 'left' | 'right'>();
    const seenSpans = new Set<string>();
    let spanIndex = 0;


    allEvents.forEach(({ span }) => {
      if (!seenSpans.has(span.spanId)) {
        seenSpans.add(span.spanId);

        map.set(span.spanId, spanIndex % 2 === 0 ? 'left' : 'right');
        spanIndex++;
      }
    });

    return map;
  }, [allEvents]);
}