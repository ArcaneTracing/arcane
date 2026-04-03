import { buildTraceSearchRequest } from '../traces-search-request-builder'

describe('buildTraceSearchRequest', () => {
  it('builds minimal request with start and end only', () => {
    const result = buildTraceSearchRequest({
      start: '2024-01-01T00:00:00Z',
      end: '2024-01-02T00:00:00Z',
    })
    expect(result).toEqual({
      start: '2024-01-01T00:00:00Z',
      end: '2024-01-02T00:00:00Z',
    })
  })

  it('adds q when provided and non-empty', () => {
    const result = buildTraceSearchRequest({
      start: '2024-01-01',
      end: '2024-01-02',
      q: 'span.http.status_code=200',
    })
    expect(result.q).toBe('span.http.status_code=200')
  })

  it('omits q when empty string', () => {
    const result = buildTraceSearchRequest({
      start: '2024-01-01',
      end: '2024-01-02',
      q: '',
    })
    expect(result).not.toHaveProperty('q')
  })

  it('adds minDuration as number when string', () => {
    const result = buildTraceSearchRequest({
      start: '2024-01-01',
      end: '2024-01-02',
      minDuration: '1000000',
    })
    expect(result.minDuration).toBe(1000000)
  })

  it('adds minDuration as number when already number', () => {
    const result = buildTraceSearchRequest({
      start: '2024-01-01',
      end: '2024-01-02',
      minDuration: 500000,
    })
    expect(result.minDuration).toBe(500000)
  })

  it('adds limit with default 20 when provided', () => {
    const result = buildTraceSearchRequest({
      start: '2024-01-01',
      end: '2024-01-02',
      limit: 50,
    })
    expect(result.limit).toBe(50)
  })

  it('omits limit when empty string', () => {
    const result = buildTraceSearchRequest({
      start: '2024-01-01',
      end: '2024-01-02',
      limit: '',
    })
    expect(result.limit).toBeUndefined()
  })

  it('adds all optional fields when provided', () => {
    const result = buildTraceSearchRequest({
      start: '2024-01-01',
      end: '2024-01-02',
      q: 'query',
      attributes: 'attr=val',
      serviceName: 'api',
      operationName: 'GET',
      minDuration: 1000,
      maxDuration: 2000,
      limit: 10,
    })
    expect(result).toEqual({
      start: '2024-01-01',
      end: '2024-01-02',
      q: 'query',
      attributes: 'attr=val',
      serviceName: 'api',
      operationName: 'GET',
      minDuration: 1000,
      maxDuration: 2000,
      limit: 10,
    })
  })
})
