import { mergeTraces } from '../merge'

const minimalSpan = {
  spanId: 's1',
  parentSpanId: '',
  name: 'op',
  startTimeUnixNano: '1000000000',
  endTimeUnixNano: '2000000000',
  attributes: [],
  events: [],
}

describe('mergeTraces', () => {
  it('returns null for empty or null input', () => {
    expect(mergeTraces([])).toBe(null)
    expect(mergeTraces(null as any)).toBe(null)
  })

  it('returns single trace as-is', () => {
    const trace = { traceID: 't1', batches: [] }
    expect(mergeTraces([trace as any])).toBe(trace)
  })

  it('merges multiple traces in batches format', () => {
    const t1 = {
      traceID: 't1',
      batches: [
        {
          resource: { attributes: [] },
          scopeSpans: [
            { spans: [{ ...minimalSpan, spanId: 'a' }] },
          ],
        },
      ],
    }
    const t2 = {
      traceID: 't2',
      batches: [
        {
          resource: { attributes: [] },
          scopeSpans: [
            { spans: [{ ...minimalSpan, spanId: 'b' }] },
          ],
        },
      ],
    }
    const merged = mergeTraces([t1 as any, t2 as any])
    expect(merged).not.toBe(null)
    expect((merged as any).batches).toBeDefined()
    const batches = (merged as any).batches
    const allSpans = batches.flatMap((b: any) =>
      b.scopeSpans?.flatMap((s: any) => s.spans) ?? []
    )
    expect(allSpans.map((s: any) => s.spanId).sort()).toEqual(['a', 'b'])
  })

  it('merges multiple traces in direct spans format', () => {
    const t1 = {
      traceId: 't1',
      spans: [{ ...minimalSpan, spanId: 'x' }],
      resource: {},
    }
    const t2 = {
      traceId: 't2',
      spans: [{ ...minimalSpan, spanId: 'y' }],
      resource: {},
    }
    const merged = mergeTraces([t1 as any, t2 as any])
    expect(merged).not.toBe(null)
    expect((merged as any).spans).toHaveLength(2)
    expect((merged as any).spans.map((s: any) => s.spanId).sort()).toEqual(['x', 'y'])
  })

  it('returns traceId null when no traceId in trace or spans', () => {
    const t1 = {
      spans: [{ ...minimalSpan, spanId: 'a' }],
      resource: {},
    }
    const t2 = {
      spans: [{ ...minimalSpan, spanId: 'b' }],
      resource: {},
    }
    const merged = mergeTraces([t1 as any, t2 as any])
    expect(merged).not.toBe(null)
    expect((merged as any).traceId).toBeNull()
  })

  it('uses empty resource when no resources from spans or trace', () => {
    const t1 = { spans: [], resource: undefined }
    const t2 = { spans: [], resource: undefined }
    const merged = mergeTraces([t1 as any, t2 as any])
    expect(merged).not.toBe(null)
    expect((merged as any).resource).toEqual({})
  })

  it('uses fallbackResource from firstTrace when allResources is empty', () => {
    const t1 = { spans: [], resource: { 'service.name': 'test' } }
    const t2 = { spans: [], resource: {} }
    const merged = mergeTraces([t1 as any, t2 as any])
    expect(merged).not.toBe(null)
    expect((merged as any).resource).toEqual({ 'service.name': 'test' })
  })

  it('uses traceId from first span when not in trace object', () => {
    const t1 = {
      batches: [
        {
          resource: {},
          scopeSpans: [
            {
              spans: [{ ...minimalSpan, spanId: 'a', traceId: 'from-span' }],
            },
          ],
        },
      ],
    }
    const t2 = {
      batches: [
        {
          resource: {},
          scopeSpans: [
            {
              spans: [{ ...minimalSpan, spanId: 'b' }],
            },
          ],
        },
      ],
    }
    const merged = mergeTraces([t1 as any, t2 as any])
    expect(merged).not.toBe(null)
    expect((merged as any).batches).toBeDefined()
  })
})
