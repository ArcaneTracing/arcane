import { useMemo } from 'react';
import { getServiceName } from '@/lib/traces/queries';
import type { NormalizedSpan } from '@/types/traces';
import type { EventWithSpan } from './use-event-collection';

export interface FilterOptions {
  spanNames: string[];
  serviceNames: string[];
  entityIds: string[];
  eventFieldKeys: string[];
}
export function useFilterOptions(
spans: NormalizedSpan[],
allEvents: EventWithSpan[])
: FilterOptions {
  return useMemo(() => {
    const spanNames = new Set<string>();
    const serviceNames = new Set<string>();
    const entityIds = new Set<string>();
    const eventFieldKeys = new Set<string>();


    spans.forEach((span) => {
      spanNames.add(span.name);
      const serviceName = getServiceName(span.resource);
      if (serviceName && serviceName !== 'unknown') {
        serviceNames.add(serviceName);
      }
      if (span.matchedEntity) {
        entityIds.add(span.matchedEntity.id);
      }
    });


    allEvents.forEach(({ event }) => {
      const eventObj = event as {attributes?: Array<{key: string;value: unknown;}>;};
      const attributes = eventObj.attributes || [];
      attributes.forEach((attr) => {
        if (attr && typeof attr === 'object' && 'key' in attr) {
          eventFieldKeys.add(attr.key);
        }
      });
    });

    return {
      spanNames: Array.from(spanNames).sort((a, b) => a.localeCompare(b)),
      serviceNames: Array.from(serviceNames).sort((a, b) => a.localeCompare(b)),
      entityIds: Array.from(entityIds),
      eventFieldKeys: Array.from(eventFieldKeys).sort((a, b) => a.localeCompare(b))
    };
  }, [allEvents, spans]);
}