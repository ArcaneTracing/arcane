import { Position } from '@xyflow/react';
import { findMatchingEntity } from '../entity-utils';
import { extractSpansFromTrace, normalizeSpan } from './normalize';
import { getServiceName } from './queries';
import type {
  TempoTraceResponse,
  NormalizedSpan,
  TraceSpanNode,
  TraceSpanEdge,
  TraceGraph } from
'@/types/traces';
import type { EntityResponse } from '@/types/entities';
export function createTraceNodes(
trace: TempoTraceResponse | Record<string, unknown> | null | undefined,
entities: EntityResponse[] = [])
: TraceGraph {
  if (!trace) {
    return { nodes: [], edges: [] };
  }

  const spanData = extractSpansFromTrace(trace);
  if (spanData.length === 0) {
    return { nodes: [], edges: [] };
  }

  const nodes: TraceSpanNode[] = [];
  const edges: TraceSpanEdge[] = [];
  const spanMap = new Map<string, NormalizedSpan>();

  const normalizedSpans = spanData.map(({ span, resource }) =>
  normalizeSpan(span, resource)
  );
  normalizedSpans.forEach((span) => {
    spanMap.set(span.spanId, span);
  });

  const childrenMap = new Map<string, NormalizedSpan[]>();
  const rootSpans: NormalizedSpan[] = [];

  normalizedSpans.forEach((span) => {
    if (!span.parentSpanId || !spanMap.has(span.parentSpanId)) {
      rootSpans.push(span);
    } else {
      const parentId = span.parentSpanId;
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      const children = childrenMap.get(parentId);
      if (children) {
        children.push(span);
      }
    }
  });

  const subtreeHeights = new Map<string, number>();
  const calculateSubtreeHeight = (spanId: string): number => {
    if (subtreeHeights.has(spanId)) {
      return subtreeHeights.get(spanId)!;
    }

    const children = childrenMap.get(spanId) || [];
    if (children.length === 0) {
      subtreeHeights.set(spanId, 1);
      return 1;
    }

    let totalHeight = 0;
    children.forEach((child: NormalizedSpan) => {
      totalHeight += calculateSubtreeHeight(child.spanId);
    });
    const height = Math.max(1, totalHeight);
    subtreeHeights.set(spanId, height);
    return height;
  };

  normalizedSpans.forEach((span: NormalizedSpan) => {
    calculateSubtreeHeight(span.spanId);
  });

  const positionSpans = (
  span: NormalizedSpan,
  depth: number,
  verticalOffset = 0)
  : number => {
    const serviceName = getServiceName(span.resource);

    let matchedEntity = null;
    if (entities && entities.length > 0) {
      matchedEntity = findMatchingEntity(span, entities);
    }

    const node: TraceSpanNode = {
      id: span.spanId,
      type: 'span' as const,
      position: {
        x: depth * 300,
        y: verticalOffset * 120
      },
      data: {
        spanName: span.name,
        serviceName: serviceName,
        startTime: span.startTime,
        duration: span.duration,
        tags: span.attributes || [],
        logs: span.events || [],
        matchedEntity: matchedEntity
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left
    };

    nodes.push(node);

    const children = (childrenMap.get(span.spanId) || []).sort(
      (a, b) => a.startTime - b.startTime
    );

    let childOffset = verticalOffset;
    children.forEach((childSpan) => {
      edges.push({
        id: `edge-${span.spanId}-${childSpan.spanId}`,
        source: span.spanId,
        target: childSpan.spanId,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#555', strokeWidth: 2 }
      });

      const childHeight = subtreeHeights.get(childSpan.spanId) ?? 1;
      positionSpans(childSpan, depth + 1, childOffset);
      childOffset += childHeight;
    });

    return subtreeHeights.get(span.spanId) || 1;
  };

  let verticalOffset = 0;
  const sortedRootSpans = [...rootSpans].sort((a, b) => a.startTime - b.startTime);
  sortedRootSpans.forEach((rootSpan) => {
    const height = positionSpans(rootSpan, 0, verticalOffset);
    verticalOffset += height;
  });

  return { nodes, edges };
}