import { normalizeSpan, extractSpansFromTrace } from '../normalize';


const minimalSpan = {
  spanId: 'span1',
  parentSpanId: '',
  name: 'test-span',
  startTimeUnixNano: '1000000',
  endTimeUnixNano: '2000000',
  attributes: [],
  events: []
};

const resource = {
  attributes: [
  { key: 'service.name', value: { stringValue: 'my-service' } }]

};

describe('normalizeSpan', () => {
  it('normalizes span with string IDs', () => {
    const span = { ...minimalSpan, spanId: 's1', parentSpanId: 'p0' };
    const out = normalizeSpan(span as any, resource as any);
    expect(out.spanId).toBe('s1');
    expect(out.parentSpanId).toBe('p0');
    expect(out.name).toBe('test-span');
    expect(out.startTime).toBe(1);
    expect(out.endTime).toBe(2);
    expect(out.duration).toBe(1);
    expect(out.resource).toEqual(resource);
  });

  it('converts Uint8Array spanId to hex string', () => {
    const span = {
      ...minimalSpan,
      spanId: new Uint8Array([0xab, 0xcd]),
      parentSpanId: ''
    };
    const out = normalizeSpan(span as any, null);
    expect(out.spanId).toBe('abcd');
  });

  it('converts Uint8Array parentSpanId to hex string', () => {
    const span = {
      ...minimalSpan,
      spanId: 's1',
      parentSpanId: new Uint8Array([0x12, 0x34])
    };
    const out = normalizeSpan(span as any, null);
    expect(out.parentSpanId).toBe('1234');
  });

  it('normalizes attributes with IAnyValue', () => {
    const span = {
      ...minimalSpan,
      attributes: [
      { key: 'http.method', value: { stringValue: 'GET' } },
      { key: 'count', value: { intValue: 42 } }]

    };
    const out = normalizeSpan(span as any, null);
    expect(out.attributes).toEqual([
    { key: 'http.method', value: 'GET' },
    { key: 'count', value: 42 }]
    );
  });

  it('uses empty resource when null', () => {
    const out = normalizeSpan(minimalSpan as any, null);
    expect(out.resource).toEqual({});
  });

  it('normalizes events with attributes array', () => {
    const span = {
      ...minimalSpan,
      events: [
      {
        timeUnixNano: '3000000',
        name: 'test-event',
        attributes: [
        { key: 'event', value: { stringValue: 'started' } }]

      }]

    };
    const out = normalizeSpan(span as any, null);
    expect(out.events).toHaveLength(1);
    expect(out.events[0].timestamp).toBe(3);
    expect(out.events[0].name).toBe('test-event');
    expect(out.events[0].attributes).toEqual([
    { key: 'event', value: { stringValue: 'started' } }]
    );
  });

  it('uses empty events when not array', () => {
    const span = { ...minimalSpan, events: null };
    const out = normalizeSpan(span as any, null);
    expect(out.events).toEqual([]);
  });
});

describe('extractSpansFromTrace', () => {
  it('returns empty array for null/undefined', () => {
    expect(extractSpansFromTrace(null)).toEqual([]);
    expect(extractSpansFromTrace(undefined)).toEqual([]);
  });

  it('extracts spans from batches format', () => {
    const trace = {
      batches: [
      {
        resource: { attributes: [] },
        scopeSpans: [
        {
          spans: [
          { ...minimalSpan, spanId: 'a' },
          { ...minimalSpan, spanId: 'b' }]

        }]

      }]

    };
    const result = extractSpansFromTrace(trace as any);
    expect(result).toHaveLength(2);
    expect(result[0].span.spanId).toBe('a');
    expect(result[1].span.spanId).toBe('b');
    expect(result[0].resource).toEqual({ attributes: [] });
  });

  it('extracts spans from direct spans format', () => {
    const trace = {
      spans: [
      { ...minimalSpan, spanId: 'x' },
      { ...minimalSpan, spanId: 'y' }],

      resource: { attributes: [] }
    };
    const result = extractSpansFromTrace(trace as any);
    expect(result).toHaveLength(2);
    expect(result[0].span.spanId).toBe('x');
    expect(result[1].resource).toEqual({ attributes: [] });
  });

  it('returns empty array for trace with no batches or spans', () => {
    expect(extractSpansFromTrace({})).toEqual([]);
    expect(extractSpansFromTrace({ batches: [] })).toEqual([]);
  });

  it('handles batch with empty scopeSpans', () => {
    const trace = {
      batches: [
      {
        resource: {},
        scopeSpans: []
      }]

    };
    expect(extractSpansFromTrace(trace as any)).toEqual([]);
  });

  it('handles scopeSpan with empty spans', () => {
    const trace = {
      batches: [
      {
        resource: {},
        scopeSpans: [{ spans: [] }]
      }]

    };
    expect(extractSpansFromTrace(trace as any)).toEqual([]);
  });

  it('handles direct spans format with undefined resource', () => {
    const trace = {
      spans: [{ ...minimalSpan, spanId: 'z' }]
    };
    const result = extractSpansFromTrace(trace as any);
    expect(result).toHaveLength(1);
    expect(result[0].resource).toEqual({});
  });
});