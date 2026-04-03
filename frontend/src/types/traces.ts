import type {
  IResourceSpans,
  IScopeSpans,
  ISpan } from
'@opentelemetry/otlp-transformer/build/src/trace/internal-types';
import type { IKeyValue } from '@opentelemetry/otlp-transformer/build/src/common/internal-types';
import type { Position } from '@xyflow/react';
import type { EntityResponse } from './entities';

export type TempoResourceSpans = IResourceSpans;
export type TempoScopeSpans = IScopeSpans;
export type TempoSpan = ISpan;
export type TempoSpanSetSpanAttribute = IKeyValue;


export interface TempoTraceResponse {
  batches: TempoResourceSpans[];
}


export interface TempoSpanSetSpan {
  spanID?: string;
  startTimeUnixNano?: string;
  durationNanos?: string;
  attributes?: TempoSpanSetSpanAttribute[];
  serviceName?: string;
  name?: string;
}

export interface TempoSpanSet {
  spans?: TempoSpanSetSpan[];
  matched?: number;
}

export interface TempoTraceSummary {
  traceID: string;
  rootServiceName?: string;
  rootTraceName?: string;
  startTimeUnixNano?: string;
  durationMs?: number;
  spanSet?: TempoSpanSet;
}

export interface TempoTraceSearchResponse {
  traces: TempoTraceSummary[];
}
export interface TracesSearchConfig {
  showQueryEditor: boolean;
  showAttributesFilter: boolean;
  loadAttributeNames: boolean;
  loadAttributeValues: boolean;
}

export interface SpanAttribute {
  key: string;
  value: string | number | boolean | object | null | undefined;
}
export interface SpanLogField {
  key: string;
  value: unknown;
}
export interface SpanEvent {
  timestamp: number;

  name?: string;
  attributes?: Array<{key: string;value: unknown;}>;
}

export interface SpanResource {
  attributes?: SpanAttribute[] | Record<string, unknown>;
  serviceName?: string;
  [key: string]: unknown;
}

export interface NormalizedSpan {
  spanId: string;
  parentSpanId: string | null;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  attributes: SpanAttribute[];
  events: SpanEvent[];
  resource: SpanResource;
  matchedEntity?: EntityResponse | null;
  children?: NormalizedSpan[];
}
export interface TraceSpanNodeData extends Record<string, unknown> {
  spanName: string;
  serviceName: string;
  duration: number;
  startTime: number;
  tags?: SpanAttribute[];
  logs?: SpanEvent[];
  matchedEntity?: EntityResponse | null;
}
export interface TraceSpanNode {
  id: string;
  type: 'span';
  position: {x: number;y: number;};
  data: TraceSpanNodeData;
  sourcePosition: Position;
  targetPosition: Position;
}
export interface TraceSpanEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated: boolean;
  style: {
    stroke: string;
    strokeWidth: number;
  };
}
export interface TraceGraph {
  nodes: TraceSpanNode[];
  edges: TraceSpanEdge[];
}