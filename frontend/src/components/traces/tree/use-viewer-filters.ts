import { useState, useMemo } from 'react';
import { getServiceName } from '@/lib/traces/queries';
import type { NormalizedSpan } from '@/types/traces';

export interface ViewerFilters {
  serviceName: string;
  entityId: string;
  showOnlyEntitySpans: boolean;
}
function filterBySearch(spans: NormalizedSpan[], searchQuery: string): NormalizedSpan[] {
  if (!searchQuery.trim()) return spans;

  const query = searchQuery.toLowerCase().trim();

  const matchesSpan = (span: NormalizedSpan) => {
    const nameMatch = span.name?.toLowerCase().includes(query);
    const idMatch = span.spanId?.toLowerCase().includes(query);
    return nameMatch || idMatch;
  };

  const filterRecursive = (span: NormalizedSpan): NormalizedSpan | null => {
    const matches = matchesSpan(span);
    const filteredChildren = span.children ?
    span.children.map(filterRecursive).filter((child): child is NormalizedSpan => child !== null) :
    [];


    if (matches || filteredChildren.length > 0) {
      return {
        ...span,
        children: filteredChildren
      };
    }
    return null;
  };

  return spans.map(filterRecursive).filter((span): span is NormalizedSpan => span !== null);
}


function filterByEntitySpansOnly(spans: NormalizedSpan[]): NormalizedSpan[] {
  const filterRecursive = (span: NormalizedSpan): NormalizedSpan[] => {

    if (span.matchedEntity) {
      const filteredChildren = span.children ?
      span.children.flatMap(filterRecursive) :
      [];
      return [{
        ...span,
        children: filteredChildren
      }];
    }
    if (span.children && span.children.length > 0) {
      return span.children.flatMap(filterRecursive);
    }


    return [];
  };

  return spans.flatMap(filterRecursive);
}

function filterByEntityId(
spans: NormalizedSpan[],
entityId: string)
: NormalizedSpan[] {
  const filterRecursive = (span: NormalizedSpan): NormalizedSpan[] => {
    const matchesEntity = span.matchedEntity?.id === entityId;

    if (matchesEntity) {
      const filteredChildren = span.children ?
      span.children.flatMap(filterRecursive) :
      [];
      return [{ ...span, children: filteredChildren }];
    }

    if (span.children && span.children.length > 0) {
      return span.children.flatMap(filterRecursive);
    }
    return [];
  };

  return spans.flatMap(filterRecursive);
}
function filterByServiceName(
spans: NormalizedSpan[],
serviceName: string)
: NormalizedSpan[] {
  const filterRecursive = (span: NormalizedSpan): NormalizedSpan | null => {
    const spanServiceName = getServiceName(span.resource);
    const matches = spanServiceName === serviceName;
    const filteredChildren = span.children ?
    span.children.map(filterRecursive).filter((child): child is NormalizedSpan => child !== null) :
    [];
    if (matches || filteredChildren.length > 0) {
      return { ...span, children: filteredChildren };
    }
    return null;
  };
  return spans.map(filterRecursive).filter((span): span is NormalizedSpan => span !== null);
}

function filterByServiceAndEntity(
spans: NormalizedSpan[],
serviceName: string,
entityId: string)
: NormalizedSpan[] {
  if (!serviceName && !entityId) {
    return spans;
  }

  let result = spans;

  if (entityId && entityId !== '__all__') {
    result = filterByEntityId(result, entityId);
  }

  if (serviceName && serviceName !== '__all__') {
    result = filterByServiceName(result, serviceName);
  }

  return result;
}
export function useViewerFilters(spanTree: NormalizedSpan[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ViewerFilters>({
    serviceName: '',
    entityId: '',
    showOnlyEntitySpans: false
  });

  const filteredSpanTree = useMemo(() => {

    let result = filterBySearch(spanTree, searchQuery);


    if (filters.showOnlyEntitySpans) {
      result = filterByEntitySpansOnly(result);
    }


    result = filterByServiceAndEntity(result, filters.serviceName, filters.entityId);

    return result;
  }, [spanTree, searchQuery, filters]);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredSpanTree
  };
}