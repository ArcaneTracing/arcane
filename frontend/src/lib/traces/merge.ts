import { extractSpansFromTrace } from './normalize';
import type {
  TempoTraceResponse,
  TempoSpan,
  TempoResourceSpans,
  SpanResource } from
'@/types/traces';
export function mergeTraces(
traces: (TempoTraceResponse | Record<string, unknown>)[])
: TempoTraceResponse | Record<string, unknown> | null {
  if (!traces || traces.length === 0) {
    return null;
  }

  if (traces.length === 1) {
    return traces[0];
  }

  const spanResourcePairs: Array<{span: TempoSpan;resource: SpanResource;}> = [];
  const allResources: Map<string, SpanResource> = new Map();
  let traceId: string | null = null;

  traces.forEach((trace) => {
    const spanData = extractSpansFromTrace(trace);

    spanData.forEach(({ span, resource }) => {
      const resourceKey = JSON.stringify(resource);
      if (!allResources.has(resourceKey)) {
        allResources.set(resourceKey, resource);
      }
      spanResourcePairs.push({ span, resource });
    });

    if (!traceId) {
      const traceObj = trace;
      const fromTrace =
      'traceId' in traceObj && typeof traceObj.traceId === 'string' ?
      traceObj.traceId :
      null;
      traceId = fromTrace ?? (spanData.length > 0 && typeof spanData[0].span.traceId === 'string' ?
      spanData[0].span.traceId :
      null);
    }
  });

  const firstTrace = traces[0];
  if (!firstTrace) return null;

  if ('batches' in firstTrace && Array.isArray(firstTrace.batches)) {
    const resourceGroups = new Map<string, {resource: SpanResource;spans: TempoSpan[];}>();

    spanResourcePairs.forEach(({ span, resource }) => {
      const resourceKey = JSON.stringify(resource);
      let group = resourceGroups.get(resourceKey);
      if (!group) {
        group = { resource, spans: [] };
        resourceGroups.set(resourceKey, group);
      }
      group.spans.push(span);
    });

    const batches = Array.from(resourceGroups.values()).map(({ resource, spans }) => ({
      resource,
      scopeSpans: [
      {
        spans,
        scope:
        (firstTrace.batches as TempoResourceSpans[])[0]?.scopeSpans?.[0]?.scope ?? {}
      }]

    }));

    return {
      batches: batches as unknown as TempoResourceSpans[]
    } as TempoTraceResponse;
  }

  const allSpans = spanResourcePairs.map(({ span }) => span);
  const firstResource = Array.from(allResources.values())[0];
  const fallbackResource =
  'resource' in firstTrace && firstTrace.resource ?
  firstTrace.resource as SpanResource :
  undefined;

  return {
    traceId,
    spans: allSpans,
    resource: firstResource ?? fallbackResource ?? {} as SpanResource
  } as Record<string, unknown>;
}