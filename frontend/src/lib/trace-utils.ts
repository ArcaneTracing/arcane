import { otlpBase64TraceIdToHexBrowser } from './traces/otlp';

/** Decode base64 OTLP trace ID to hex for URL/API use. Returns as-is if not valid base64. */
export function traceIdForUrl(traceId: string): string {
  if (!traceId || typeof traceId !== 'string') return traceId;
  try {
    return otlpBase64TraceIdToHexBrowser(traceId);
  } catch {
    return traceId;
  }
}

export { otlpBase64TraceIdToHexBrowser, extractAttributeValue } from './traces/otlp';
export { normalizeSpan, extractSpansFromTrace } from './traces/normalize';
export {
  getServiceName,
  getServiceNameFromTrace,
  getParentSpanName,
  getAllServiceNamesFromTrace,
  extractTraceId } from
'./traces/queries';
export { mergeTraces } from './traces/merge';
export { createTraceNodes } from './traces/graph-layout';