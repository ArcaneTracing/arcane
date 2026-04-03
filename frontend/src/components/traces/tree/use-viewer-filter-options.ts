import { useMemo } from 'react';
import { getServiceName } from '@/lib/traces/queries';
import type { NormalizedSpan } from '@/types/traces';

export interface ViewerFilterOptions {
  serviceNames: string[];
  entityIds: string[];
}
function collectFromSpanTree(
spans: NormalizedSpan[],
serviceNames: Set<string>,
entityIds: Set<string>,
entityMap: Map<string, string>)
{
  spans.forEach((span) => {
    const serviceName = getServiceName(span.resource);
    if (serviceName && serviceName !== 'unknown') {
      serviceNames.add(serviceName);
    }

    if (span.matchedEntity) {
      entityIds.add(span.matchedEntity.id);
      entityMap.set(span.matchedEntity.id, span.matchedEntity.name);
    }


    if (span.children && span.children.length > 0) {
      collectFromSpanTree(span.children, serviceNames, entityIds, entityMap);
    }
  });
}

export function useViewerFilterOptions(
spans: NormalizedSpan[])
: {filterOptions: ViewerFilterOptions;entityMap: Map<string, string>;} {
  return useMemo(() => {
    const serviceNames = new Set<string>();
    const entityIds = new Set<string>();
    const entityMap = new Map<string, string>();


    collectFromSpanTree(spans, serviceNames, entityIds, entityMap);

    return {
      filterOptions: {
        serviceNames: Array.from(serviceNames).sort((a, b) => a.localeCompare(b)),
        entityIds: Array.from(entityIds)
      },
      entityMap
    };
  }, [spans]);
}