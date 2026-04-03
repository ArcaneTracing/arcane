import {
  getServiceName,
  getServiceNameFromTrace,
  getParentSpanName,
  getAllServiceNamesFromTrace,
} from '../queries'

describe('getServiceName', () => {
  it('returns "unknown" for null/undefined', () => {
    expect(getServiceName(null)).toBe('unknown')
    expect(getServiceName(undefined)).toBe('unknown')
  })

  it('extracts from resource.attributes array (service.name)', () => {
    const resource = {
      attributes: [
        { key: 'service.name', value: { stringValue: 'api' } },
      ],
    }
    expect(getServiceName(resource as any)).toBe('api')
  })

  it('extracts from resource.attributes array (serviceName key)', () => {
    const resource = {
      attributes: [
        { key: 'serviceName', value: { stringValue: 'web' } },
      ],
    }
    expect(getServiceName(resource as any)).toBe('web')
  })

  it('returns resource.serviceName when no attributes', () => {
    expect(getServiceName({ serviceName: 'legacy' } as any)).toBe('legacy')
  })

  it('returns "unknown" when no service name found', () => {
    expect(getServiceName({ attributes: [] } as any)).toBe('unknown')
  })

  it('extracts from resource.attributes object (service.name)', () => {
    const resource = {
      attributes: {
        'service.name': { stringValue: 'obj-svc' },
      },
    }
    expect(getServiceName(resource as any)).toBe('obj-svc')
  })

  it('extracts from resource.attributes object (serviceName)', () => {
    const resource = {
      attributes: {
        serviceName: { stringValue: 'obj-svc-name' },
      },
    }
    expect(getServiceName(resource as any)).toBe('obj-svc-name')
  })

  it('returns "unknown" when attribute value is falsy', () => {
    const resource = {
      attributes: [{ key: 'service.name', value: { stringValue: '' } }],
    }
    expect(getServiceName(resource as any)).toBe('unknown')
  })
})

describe('getServiceNameFromTrace', () => {
  it('returns null for null/undefined trace', () => {
    expect(getServiceNameFromTrace(null)).toBe(null)
    expect(getServiceNameFromTrace(undefined)).toBe(null)
  })

  it('extracts from batches format', () => {
    const trace = {
      batches: [
        {
          resource: {
            attributes: [{ key: 'service.name', value: { stringValue: 'batch-svc' } }],
          },
          scopeSpans: [{ spans: [] }],
        },
      ],
    }
    expect(getServiceNameFromTrace(trace as any)).toBe('batch-svc')
  })

  it('extracts from old format (spans + processes)', () => {
    const trace = {
      spans: [{ processID: 'p1' }],
      processes: { p1: { serviceName: 'old-svc' } },
    }
    expect(getServiceNameFromTrace(trace as any)).toBe('old-svc')
  })

  it('extracts from resource format', () => {
    const trace = {
      resource: {
        attributes: [{ key: 'service.name', value: { stringValue: 'resource-svc' } }],
      },
    }
    expect(getServiceNameFromTrace(trace as any)).toBe('resource-svc')
  })

  it('returns null when batches service name is unknown', () => {
    const trace = {
      batches: [
        {
          resource: {},
          scopeSpans: [{ spans: [] }],
        },
      ],
    }
    expect(getServiceNameFromTrace(trace as any)).toBe(null)
  })

  it('returns null when batches has no resource', () => {
    const trace = {
      batches: [{ scopeSpans: [{ spans: [] }] }],
    }
    expect(getServiceNameFromTrace(trace as any)).toBe(null)
  })

  it('returns null when spans exist but no processes', () => {
    const trace = {
      spans: [{ processID: 'p1', spanId: '1', parentSpanId: '', name: 'x', startTimeUnixNano: '1', endTimeUnixNano: '2', attributes: [], events: [] }],
    }
    expect(getServiceNameFromTrace(trace as any)).toBe(null)
  })

  it('returns null when spans exist but root span has no processID', () => {
    const trace = {
      spans: [{ spanId: '1', parentSpanId: '', name: 'x', startTimeUnixNano: '1', endTimeUnixNano: '2', attributes: [], events: [] }],
      processes: { p1: { serviceName: 'svc' } },
    }
    expect(getServiceNameFromTrace(trace as any)).toBe(null)
  })
})

describe('getParentSpanName', () => {
  it('returns null for null/undefined trace', () => {
    expect(getParentSpanName(null)).toBe(null)
    expect(getParentSpanName(undefined)).toBe(null)
  })

  it('returns root span name from batches format', () => {
    const trace = {
      batches: [
        {
          resource: {},
          scopeSpans: [
            {
              spans: [
                {
                  spanId: 'root',
                  parentSpanId: '',
                  name: 'root-op',
                  startTimeUnixNano: '1000000000',
                  endTimeUnixNano: '2000000000',
                  attributes: [],
                  events: [],
                },
                {
                  spanId: 'child',
                  parentSpanId: 'root',
                  name: 'child-op',
                  startTimeUnixNano: '1500000000',
                  endTimeUnixNano: '1800000000',
                  attributes: [],
                  events: [],
                },
              ],
            },
          ],
        },
      ],
    }
    expect(getParentSpanName(trace as any)).toBe('root-op')
  })

  it('returns null when no spans', () => {
    expect(getParentSpanName({ batches: [] } as any)).toBe(null)
  })

  it('returns null when root span has no name', () => {
    const trace = {
      batches: [
        {
          resource: {},
          scopeSpans: [
            {
              spans: [
                {
                  spanId: 'root',
                  parentSpanId: '',
                  name: '',
                  startTimeUnixNano: '1000000000',
                  endTimeUnixNano: '2000000000',
                  attributes: [],
                  events: [],
                },
              ],
            },
          ],
        },
      ],
    }
    expect(getParentSpanName(trace as any)).toBe(null)
  })
})

describe('getAllServiceNamesFromTrace', () => {
  it('returns empty array for null/undefined', () => {
    expect(getAllServiceNamesFromTrace(null)).toEqual([])
    expect(getAllServiceNamesFromTrace(undefined)).toEqual([])
  })

  it('returns unique sorted service names from batches', () => {
    const trace = {
      batches: [
        {
          resource: {
            attributes: [{ key: 'service.name', value: { stringValue: 'b' } }],
          },
          scopeSpans: [{ spans: [{ spanId: '1', parentSpanId: '', name: 'x', startTimeUnixNano: '1', endTimeUnixNano: '2', attributes: [], events: [] }] }],
        },
        {
          resource: {
            attributes: [{ key: 'service.name', value: { stringValue: 'a' } }],
          },
          scopeSpans: [{ spans: [{ spanId: '2', parentSpanId: '', name: 'y', startTimeUnixNano: '1', endTimeUnixNano: '2', attributes: [], events: [] }] }],
        },
      ],
    }
    expect(getAllServiceNamesFromTrace(trace as any)).toEqual(['a', 'b'])
  })

  it('filters out unknown service names', () => {
    const trace = {
      batches: [
        {
          resource: { attributes: [] },
          scopeSpans: [{ spans: [{ spanId: '1', parentSpanId: '', name: 'x', startTimeUnixNano: '1', endTimeUnixNano: '2', attributes: [], events: [] }] }],
        },
        {
          resource: {
            attributes: [{ key: 'service.name', value: { stringValue: 'known' } }],
          },
          scopeSpans: [{ spans: [{ spanId: '2', parentSpanId: '', name: 'y', startTimeUnixNano: '1', endTimeUnixNano: '2', attributes: [], events: [] }] }],
        },
      ],
    }
    expect(getAllServiceNamesFromTrace(trace as any)).toEqual(['known'])
  })
})
