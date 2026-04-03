import { useMemo } from 'react';
import type { NormalizedSpan, SpanEvent } from '@/types/traces';

export interface EventWithSpan {
  event: SpanEvent;
  span: NormalizedSpan;
  eventIndex: number;
}
function collectAllEvents(spans: NormalizedSpan[]): EventWithSpan[] {
  const events: EventWithSpan[] = [];

  const collectFromSpan = (span: NormalizedSpan) => {
    span.events.forEach((event, index) => {
      events.push({ event, span, eventIndex: index });
    });
    if (span.children) {
      span.children.forEach(collectFromSpan);
    }
  };

  spans.forEach(collectFromSpan);
  return events.sort((a, b) => a.event.timestamp - b.event.timestamp);
}
function collectSpanEvents(span: NormalizedSpan | null): EventWithSpan[] {
  if (!span) return [];
  return span.events.map((event, index) => ({ event, span, eventIndex: index })).
  sort((a, b) => a.event.timestamp - b.event.timestamp);
}
export function useEventCollection(
spans: NormalizedSpan[],
selectedSpan: NormalizedSpan | null)
: EventWithSpan[] {
  return useMemo(() => {
    if (selectedSpan) {
      return collectSpanEvents(selectedSpan);
    }
    return collectAllEvents(spans);
  }, [selectedSpan, spans]);
}