import { createTraceNodes } from '../graph-layout'

const minimalSpan = {
  spanId: 'root',
  parentSpanId: '',
  name: 'root-op',
  startTimeUnixNano: '1000000000',
  endTimeUnixNano: '2000000000',
  attributes: [],
  events: [],
}

describe('createTraceNodes', () => {
  it('returns empty nodes and edges for null/undefined trace', () => {
    expect(createTraceNodes(null)).toEqual({ nodes: [], edges: [] })
    expect(createTraceNodes(undefined)).toEqual({ nodes: [], edges: [] })
  })

  it('returns empty nodes and edges for trace with no spans', () => {
    expect(createTraceNodes({ batches: [] } as any)).toEqual({
      nodes: [],
      edges: [],
    })
    expect(createTraceNodes({ batches: [{ resource: {}, scopeSpans: [] }] } as any)).toEqual({
      nodes: [],
      edges: [],
    })
  })

  it('creates one node for single-span trace (batches format)', () => {
    const trace = {
      batches: [
        {
          resource: { attributes: [] },
          scopeSpans: [{ spans: [{ ...minimalSpan }] }],
        },
      ],
    }
    const result = createTraceNodes(trace as any, [])
    expect(result.nodes).toHaveLength(1)
    expect(result.edges).toHaveLength(0)
    expect(result.nodes[0].id).toBe('root')
    expect(result.nodes[0].data?.spanName).toBe('root-op')
    expect(result.nodes[0].position).toEqual({ x: 0, y: 0 })
  })

  it('creates nodes and edges for parent-child spans', () => {
    const trace = {
      batches: [
        {
          resource: { attributes: [] },
          scopeSpans: [
            {
              spans: [
                { ...minimalSpan, spanId: 'parent' },
                {
                  ...minimalSpan,
                  spanId: 'child',
                  parentSpanId: 'parent',
                  name: 'child-op',
                },
              ],
            },
          ],
        },
      ],
    }
    const result = createTraceNodes(trace as any, [])
    expect(result.nodes).toHaveLength(2)
    expect(result.edges).toHaveLength(1)
    expect(result.edges[0].source).toBe('parent')
    expect(result.edges[0].target).toBe('child')
    const parentNode = result.nodes.find((n) => n.id === 'parent')
    const childNode = result.nodes.find((n) => n.id === 'child')
    expect(parentNode?.position.x).toBe(0)
    expect(childNode?.position.x).toBe(300)
  })

  it('accepts entities and does not throw', () => {
    const trace = {
      batches: [
        {
          resource: { attributes: [] },
          scopeSpans: [{ spans: [{ ...minimalSpan }] }],
        },
      ],
    }
    const entities = [{ id: 'e1', name: 'Entity', type: 'MODEL' }] as any[]
    expect(() => createTraceNodes(trace as any, entities)).not.toThrow()
    const result = createTraceNodes(trace as any, entities)
    expect(result.nodes).toHaveLength(1)
  })

  it('creates correct layout for three-level hierarchy', () => {
    const trace = {
      batches: [
        {
          resource: { attributes: [] },
          scopeSpans: [
            {
              spans: [
                { ...minimalSpan, spanId: 'a', parentSpanId: '' },
                { ...minimalSpan, spanId: 'b', parentSpanId: 'a' },
                { ...minimalSpan, spanId: 'c', parentSpanId: 'b' },
              ],
            },
          ],
        },
      ],
    }
    const result = createTraceNodes(trace as any, [])
    expect(result.nodes).toHaveLength(3)
    expect(result.edges).toHaveLength(2)
    const nodeA = result.nodes.find((n) => n.id === 'a')
    const nodeC = result.nodes.find((n) => n.id === 'c')
    expect(nodeA?.position.x).toBe(0)
    expect(nodeC?.position.x).toBe(600)
  })

  it('uses direct spans format when trace has spans key', () => {
    const trace = {
      spans: [
        { ...minimalSpan, spanId: 's1' },
        { ...minimalSpan, spanId: 's2', parentSpanId: 's1' },
      ],
      resource: {},
    }
    const result = createTraceNodes(trace as any, [])
    expect(result.nodes).toHaveLength(2)
    expect(result.edges).toHaveLength(1)
  })
})
