import { getServiceName } from './queries';
import type { TempoTraceResponse, TempoResourceSpans, SpanResource } from '@/types/traces';


type TraceInput = TempoTraceResponse | Record<string, unknown> | null | undefined;

function getServiceNameFromBatchesFormat(traceObj: Record<string, unknown>): string | null {
  if (!('batches' in traceObj) || !Array.isArray(traceObj.batches) || traceObj.batches.length === 0) {
    return null;
  }
  const firstBatch = (traceObj.batches as TempoResourceSpans[])[0];
  if (!firstBatch?.resource) return null;
  const serviceName = getServiceName(firstBatch.resource as SpanResource);
  return serviceName === 'unknown' ? null : serviceName;
}

function getServiceNameFromSpansFormat(traceObj: Record<string, unknown>): string | null {
  if (!('spans' in traceObj) || !Array.isArray(traceObj.spans) || traceObj.spans.length === 0) {
    return null;
  }
  const rootSpan = (traceObj.spans as unknown[])[0] as {processID?: string | number;} | undefined;
  const processes = traceObj.processes as Record<string, {serviceName?: string;}> | undefined;
  const processID = rootSpan?.processID;
  if (processID == null || !processes) return null;
  return processes[String(processID)]?.serviceName || null;
}

function getServiceNameFromResourceFormat(traceObj: Record<string, unknown>): string | null {
  if (!('resource' in traceObj) || !traceObj.resource) return null;
  const serviceName = getServiceName(traceObj.resource as SpanResource);
  return serviceName === 'unknown' ? null : serviceName;
}


export function getServiceNameFromTrace(trace: TraceInput): string | null {
  if (!trace) return null;
  const traceObj = trace as Record<string, unknown>;
  return (
    getServiceNameFromBatchesFormat(traceObj) ??
    getServiceNameFromSpansFormat(traceObj) ??
    getServiceNameFromResourceFormat(traceObj));

}