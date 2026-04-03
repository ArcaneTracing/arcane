import { EventTimelineItem } from './event-timeline-item';
import type { NormalizedSpan } from '@/types/traces';
import type { EventWithSpan } from './use-event-collection';

interface EventTimelineProps {
  allEvents: EventWithSpan[];
  spanSideMap: Map<string, 'left' | 'right'>;
  isViewingSingleSpan: boolean;
  onSpanSelect: (span: NormalizedSpan) => void;
}
export function EventTimeline({
  allEvents,
  spanSideMap,
  isViewingSingleSpan,
  onSpanSelect
}: Readonly<EventTimelineProps>) {
  if (allEvents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {isViewingSingleSpan ? 'No events found in this span' : 'No events found in this trace'}
      </div>);

  }

  return (
    <div className="space-y-4 relative">
      {allEvents.map((eventWithSpan, index) => {
        const side = spanSideMap.get(eventWithSpan.span.spanId) || 'right';
        const isLeft = side === 'left';

        return (
          <EventTimelineItem
            key={`${eventWithSpan.span.spanId}-${eventWithSpan.eventIndex}-${index}`}
            eventWithSpan={eventWithSpan}
            index={index}
            isLeft={isLeft}
            isViewingSingleSpan={isViewingSingleSpan}
            onSpanSelect={onSpanSelect} />);


      })}
    </div>);

}