import { extractAttributeValue } from './otlp';
import type {
  TempoTraceResponse,
  TempoSpan,
  NormalizedSpan,
  SpanResource,
  SpanAttribute,
  SpanEvent } from
'@/types/traces';
export function normalizeSpan(
span: TempoSpan,
resource: SpanResource | null = null)
: NormalizedSpan {
  const startTime = Number(span.startTimeUnixNano) / 1000000;
  const endTime = Number(span.endTimeUnixNano) / 1000000;

  const normalizedAttributes: SpanAttribute[] = Array.isArray(span.attributes) ?
  span.attributes.map((attr) => ({
    key: attr.key,
    value: extractAttributeValue(attr.value)
  })) :
  [];

  let spanId: string;
  if (typeof span.spanId === 'string') {
    spanId = span.spanId;
  } else {
    spanId = Array.from(span.spanId).
    map((b) => b.toString(16).padStart(2, '0')).
    join('');
  }

  let parentSpanId: string | null = null;
  if (span.parentSpanId) {
    if (typeof span.parentSpanId === 'string') {
      parentSpanId = span.parentSpanId;
    } else {
      parentSpanId = Array.from(span.parentSpanId).
      map((b) => b.toString(16).padStart(2, '0')).
      join('');
    }
  }

  const events: SpanEvent[] = Array.isArray(span.events) ?
  span.events.map((event) => {
    const attributes = Array.isArray(event.attributes) ?
    event.attributes.map((attr) => ({
      key: attr.key,
      value: attr.value
    })) :
    [];

    return {
      timestamp: Number(event.timeUnixNano) / 1000000,

      name: (event as {name?: string;}).name,
      attributes
    };
  }) :
  [];

  return {
    spanId,
    parentSpanId,
    name: span.name,
    startTime,
    endTime,
    duration: endTime - startTime,
    attributes: normalizedAttributes,
    events,
    resource: resource || {} as SpanResource
  };
}


export function extractSpansFromTrace(
trace: TempoTraceResponse | Record<string, unknown> | null | undefined)
: Array<{span: TempoSpan;resource: SpanResource;}> {
  if (!trace) return [];

  const traceObj = trace;

  if ('batches' in traceObj && Array.isArray(traceObj.batches)) {
    const spans: Array<{span: TempoSpan;resource: SpanResource;}> = [];
    const batches = traceObj.batches;

    batches.forEach((batch) => {
      const resource = batch.resource as unknown as SpanResource || {} as SpanResource;
      if (batch.scopeSpans && Array.isArray(batch.scopeSpans)) {
        batch.scopeSpans.forEach((scopeSpan) => {
          if (scopeSpan.spans && Array.isArray(scopeSpan.spans)) {
            scopeSpan.spans.forEach((span) => {
              spans.push({ span, resource });
            });
          }
        });
      }
    });
    return spans;
  }

  if ('spans' in traceObj && Array.isArray(traceObj.spans)) {
    return traceObj.spans.map((span) => ({
      span,
      resource: traceObj.resource as SpanResource || {} as SpanResource
    }));
  }

  return [];
}