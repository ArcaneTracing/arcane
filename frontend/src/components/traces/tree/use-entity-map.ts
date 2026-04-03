import { useMemo } from 'react';
import type { NormalizedSpan } from '@/types/traces';
export function useEntityMap(spans: NormalizedSpan[]): Map<string, string> {
  return useMemo(() => {
    const map = new Map<string, string>();
    spans.forEach((span) => {
      if (span.matchedEntity) {
        map.set(span.matchedEntity.id, span.matchedEntity.name);
      }
    });
    return map;
  }, [spans]);
}