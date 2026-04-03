import { extractAttributeValue } from './otlp';
import { extractSpansFromTrace, normalizeSpan } from './normalize';
import type {
  TempoTraceResponse,
  NormalizedSpan,
  SpanResource,
  SpanAttribute } from
'@/types/traces';

function formatServiceNameValue(value: unknown): string {
  if (!value) return 'unknown';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function getServiceNameFromArrayAttributes(attributes: SpanAttribute[]): string | null {
  const attr = attributes.find(
    (a: SpanAttribute) => a.key === 'service.name' || a.key === 'serviceName'
  );
  return attr ? formatServiceNameValue(extractAttributeValue(attr.value)) : null;
}

function getServiceNameFromObjectAttributes(
attrs: Record<string, unknown>)
: string | null {
  const serviceName = attrs['service.name'] || attrs.serviceName;
  if (!serviceName) return null;
  const value = extractAttributeValue(serviceName);
  return formatServiceNameValue(value);
}


export function getServiceName(resource: SpanResource | null | undefined): string {
  if (!resource) return 'unknown';

  if (Array.isArray(resource.attributes)) {
    const name = getServiceNameFromArrayAttributes(resource.attributes);
    if (name) return name;
  }

  if (
  resource.attributes &&
  typeof resource.attributes === 'object' &&
  !Array.isArray(resource.attributes))
  {
    const name = getServiceNameFromObjectAttributes(
      resource.attributes
    );
    if (name) return name;
  }

  return resource.serviceName || 'unknown';
}

export { getServiceNameFromTrace } from './queries-service-name';


export function getParentSpanName(
trace: TempoTraceResponse | Record<string, unknown> | null | undefined)
: string | null {
  if (!trace) return null;

  const spanData = extractSpansFromTrace(trace);
  if (spanData.length === 0) return null;

  const normalizedSpans = spanData.map(({ span, resource }) =>
  normalizeSpan(span, resource)
  );
  const spanMap = new Map<string, NormalizedSpan>();
  normalizedSpans.forEach((span) => {
    spanMap.set(span.spanId, span);
  });

  const rootSpans = normalizedSpans.filter((span) => {
    return !span.parentSpanId || !spanMap.has(span.parentSpanId);
  });

  if (rootSpans.length > 0) {
    rootSpans.sort((a, b) => a.startTime - b.startTime);
    return rootSpans[0].name || null;
  }

  return null;
}


export function getAllServiceNamesFromTrace(
trace: TempoTraceResponse | Record<string, unknown> | null | undefined)
: string[] {
  if (!trace) return [];

  const spanData = extractSpansFromTrace(trace);
  if (spanData.length === 0) return [];

  const serviceNames = new Set<string>();

  spanData.forEach(({ resource }) => {
    const serviceName = getServiceName(resource);
    if (serviceName && serviceName !== 'unknown') {
      serviceNames.add(serviceName);
    }
  });

  return Array.from(serviceNames).sort((a, b) => a.localeCompare(b));
}


export function extractTraceId(trace: unknown): string {
  if (trace && typeof trace === 'object') {
    const t = trace as Record<string, unknown>;
    if (typeof t.traceId === 'string') return t.traceId;
    if (typeof t.traceID === 'string') return t.traceID;
  }
  return 'default';
}