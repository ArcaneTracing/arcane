import { useMemo, useState } from 'react';
import { getServiceName } from '@/lib/traces/queries';
import type { EventWithSpan } from './use-event-collection';

export interface EventFilters {
  spanName: string;
  serviceName: string;
  entityId: string;
  eventFieldKey: string;
}
export function useEventFilters(
allEventsUnfiltered: EventWithSpan[],
entityMap: Map<string, string>)
{
  const [filters, setFilters] = useState<EventFilters>({
    spanName: '',
    serviceName: '',
    entityId: '',
    eventFieldKey: ''
  });

  const allEvents = useMemo(() => {
    return allEventsUnfiltered.filter(({ event, span }) => {

      if (filters.spanName && filters.spanName !== '__all__' && span.name !== filters.spanName) {
        return false;
      }


      if (filters.serviceName && filters.serviceName !== '__all__') {
        const serviceName = getServiceName(span.resource);
        if (serviceName !== filters.serviceName) {
          return false;
        }
      }


      if (filters.entityId && filters.entityId !== '__all__') {
        if (!span.matchedEntity || span.matchedEntity.id !== filters.entityId) {
          return false;
        }
      }


      if (filters.eventFieldKey && filters.eventFieldKey !== '__all__') {
        const eventObj = event as {attributes?: Array<{key: string;value: unknown;}>;};
        const attributes = eventObj.attributes || [];
        const hasField = attributes.some((attr) =>
        attr && typeof attr === 'object' && 'key' in attr && attr.key === filters.eventFieldKey
        );
        if (!hasField) {
          return false;
        }
      }

      return true;
    });
  }, [allEventsUnfiltered, filters, entityMap]);

  return {
    filters,
    setFilters,
    allEvents
  };
}