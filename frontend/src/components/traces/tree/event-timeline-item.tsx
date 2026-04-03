import { formatTimestamp } from './trace-viewer-utils';
import { getEntityBackgroundColor } from '@/lib/entity-utils';
import { EventCard } from './event-card';
import type { NormalizedSpan } from '@/types/traces';
import type { EventWithSpan } from './use-event-collection';

interface EventTimelineItemProps {
  eventWithSpan: EventWithSpan;
  index: number;
  isLeft: boolean;
  isViewingSingleSpan: boolean;
  onSpanSelect: (span: NormalizedSpan) => void;
}
export function EventTimelineItem({
  eventWithSpan,
  index,
  isLeft,
  isViewingSingleSpan,
  onSpanSelect
}: Readonly<EventTimelineItemProps>) {
  const { event, span, eventIndex } = eventWithSpan;


  let dotColor = 'bg-primary';
  if (span.matchedEntity?.entityType) {
    const bgColor = getEntityBackgroundColor(span.matchedEntity.entityType, span.matchedEntity.iconId);
    if (bgColor) {
      dotColor = bgColor;
    }
  }

  return (
    <div key={`${span.spanId}-${eventIndex}-${index}`} className="relative flex items-center">
      {isLeft ?
      <>
          {}
          <div className="flex-1 min-w-0 max-w-md ml-auto">
            <EventCard
            event={event}
            span={span}
            isViewingSingleSpan={isViewingSingleSpan}
            onSpanSelect={onSpanSelect} />

          </div>
          
          {}
          <div className="relative z-10 flex-shrink-0 w-12 h-12 flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full ${dotColor} border-2 border-background`} />
          </div>
          
          {}
          <div className="flex-shrink-0 text-xs text-muted-foreground text-left" style={{ width: 'calc(50% - 1.5rem)' }}>
            {formatTimestamp(event.timestamp)}
          </div>
        </> :

      <>
          {}
          <div className="flex-shrink-0 text-xs text-muted-foreground text-right" style={{ width: 'calc(50% - 1.5rem)' }}>
            {formatTimestamp(event.timestamp)}
          </div>
          
          {}
          <div className="relative z-10 flex-shrink-0 w-12 h-12 flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full ${dotColor} border-2 border-background`} />
          </div>
          
          {}
          <div className="flex-1 min-w-0 max-w-md">
            <EventCard
            event={event}
            span={span}
            isViewingSingleSpan={isViewingSingleSpan}
            onSpanSelect={onSpanSelect} />

          </div>
        </>
      }
    </div>);

}