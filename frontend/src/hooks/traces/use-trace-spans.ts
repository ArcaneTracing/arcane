import { useMemo } from 'react';
import { extractSpansFromTrace, normalizeSpan, getServiceName } from '@/lib/trace-utils';
import { findMatchingEntity } from '@/lib/entity-utils';
import { buildSpanTree } from '@/components/traces/tree/trace-viewer-utils';
import type {
  NormalizedSpan,
  TempoTraceResponse } from
'@/types/traces';
import type { EntityResponse } from '@/types/entities';

export interface TraceMetrics {
  duration: number;
  startTime: number;
  serviceName: string;
}

export interface UseTraceSpansReturn {
  spans: NormalizedSpan[];
  spanTree: NormalizedSpan[];
  traceMetrics: TraceMetrics | null;
}

export function useTraceSpans(
trace: TempoTraceResponse | Record<string, unknown> | null | undefined,
entities: EntityResponse[])
: UseTraceSpansReturn {

  const entitiesKey = useMemo(() => {
    if (!entities || entities.length === 0) return '';
    return JSON.stringify(entities.map((e) => e.id).sort((a, b) => a.localeCompare(b)));
  }, [entities]);


  const spans = useMemo(() => {
    if (!trace) return [];
    const spanData = extractSpansFromTrace(trace);
    const normalizedSpans = spanData.map((item) =>
    normalizeSpan(item.span, item.resource)
    );


    if (entities && entities.length > 0) {
      return normalizedSpans.map((span: NormalizedSpan) => ({
        ...span,
        matchedEntity: findMatchingEntity(span, entities)
      }));
    }

    return normalizedSpans;
  }, [trace, entitiesKey, entities]);


  const spanTree = useMemo(() => {
    return buildSpanTree(spans);
  }, [spans]);


  const traceMetrics = useMemo<TraceMetrics | null>(() => {
    if (spans.length === 0) return null;

    const rootSpan =
    spans.find((s: NormalizedSpan) => !s.parentSpanId) || spans[0];
    const totalDuration =
    rootSpan.duration ||
    Math.max(...spans.map((s: NormalizedSpan) => s.endTime)) -
    Math.min(...spans.map((s: NormalizedSpan) => s.startTime));

    return {
      duration: totalDuration,
      startTime: rootSpan.startTime,
      serviceName: getServiceName(rootSpan.resource)
    };
  }, [spans]);

  return {
    spans,
    spanTree,
    traceMetrics
  };
}