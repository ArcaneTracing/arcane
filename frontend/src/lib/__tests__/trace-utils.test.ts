


import {
  traceIdForUrl,
  otlpBase64TraceIdToHexBrowser,
  extractAttributeValue,
  normalizeSpan,
  extractSpansFromTrace,
  getServiceName,
  getServiceNameFromTrace,
  getParentSpanName,
  getAllServiceNamesFromTrace,
  mergeTraces,
  createTraceNodes } from
'../trace-utils';

describe('trace-utils facade', () => {
  it('traceIdForUrl decodes base64 to hex and returns as-is on invalid base64', () => {
    expect(traceIdForUrl(btoa('ab'))).toBe('6162');
    expect(traceIdForUrl('Ms4+tHl+88kCUFfJ8aUb5Q==')).toBe(otlpBase64TraceIdToHexBrowser('Ms4+tHl+88kCUFfJ8aUb5Q=='));
    expect(traceIdForUrl('trace-xyz-hex')).toBe('trace-xyz-hex');
    expect(traceIdForUrl('')).toBe('');
  });

  it('re-exports otlp helpers', () => {
    expect(typeof otlpBase64TraceIdToHexBrowser).toBe('function');
    expect(typeof extractAttributeValue).toBe('function');
    expect(otlpBase64TraceIdToHexBrowser(btoa('ab'))).toBe('6162');
    expect(extractAttributeValue({ stringValue: 'x' })).toBe('x');
  });

  it('re-exports normalize helpers', () => {
    expect(typeof normalizeSpan).toBe('function');
    expect(typeof extractSpansFromTrace).toBe('function');
    const span = {
      spanId: 's1',
      parentSpanId: '',
      name: 'n',
      startTimeUnixNano: '1000000',
      endTimeUnixNano: '2000000',
      attributes: [],
      events: []
    };
    const out = normalizeSpan(span as any, null);
    expect(out.spanId).toBe('s1');
    expect(out.duration).toBe(1);
    expect(extractSpansFromTrace(null)).toEqual([]);
  });

  it('re-exports query helpers', () => {
    expect(typeof getServiceName).toBe('function');
    expect(typeof getServiceNameFromTrace).toBe('function');
    expect(typeof getParentSpanName).toBe('function');
    expect(typeof getAllServiceNamesFromTrace).toBe('function');
    expect(getServiceName(null)).toBe('unknown');
    expect(getServiceNameFromTrace(null)).toBe(null);
    expect(getParentSpanName(null)).toBe(null);
    expect(getAllServiceNamesFromTrace(null)).toEqual([]);
  });

  it('re-exports mergeTraces and createTraceNodes', () => {
    expect(typeof mergeTraces).toBe('function');
    expect(typeof createTraceNodes).toBe('function');
    expect(mergeTraces([])).toBe(null);
    expect(createTraceNodes(null)).toEqual({ nodes: [], edges: [] });
  });
});