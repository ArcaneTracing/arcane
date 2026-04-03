import { Workflow } from 'lucide-react';
import type { NormalizedSpan } from '@/types/traces';
export function getSpanIcon(spanName: string) {

  return Workflow;
}

export function buildSpanTree(spans: NormalizedSpan[]): NormalizedSpan[] {
  const spanMap = new Map<string, NormalizedSpan>();
  const rootSpans: NormalizedSpan[] = [];


  const spanCopies: NormalizedSpan[] = spans.map((span) => ({ ...span, children: [] }));


  spanCopies.forEach((span) => {
    spanMap.set(span.spanId, span);
  });


  spanCopies.forEach((span) => {
    if (!span.parentSpanId || !spanMap.has(span.parentSpanId)) {
      rootSpans.push(span);
    } else {
      const parent = spanMap.get(span.parentSpanId)!;
      parent.children ??= [];
      parent.children.push(span);
    }
  });


  const sortChildren = (span: NormalizedSpan) => {
    if (span.children && span.children.length > 0) {
      span.children.sort((a, b) => a.startTime - b.startTime);
      span.children.forEach(sortChildren);
    }
  };

  rootSpans.forEach(sortChildren);
  return rootSpans;
}
export function formatDuration(ms: number) {
  if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
export function formatTimestamp(timestamp: string | number) {
  if (timestamp === null || timestamp === undefined) return 'Unknown';


  if (typeof timestamp === 'number') {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  }


  if (typeof timestamp === 'string') {
    if (!timestamp) return 'Unknown';

    const numTimestamp = Number(timestamp);
    if (!Number.isNaN(numTimestamp)) {
      const date = new Date(numTimestamp);
      if (Number.isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
      });
    }

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  }

  return 'Unknown';
}