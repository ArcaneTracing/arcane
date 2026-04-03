import { extractTracesSearchParams, hasTracesSearchParams } from '../traces-search-params';

describe('extractTracesSearchParams', () => {
  it('extracts all traces search params', () => {
    const search = {
      datasourceId: 'ds-1',
      q: 'query',
      attributes: 'service.name=my-service',
      start: '2024-01-01T00:00:00Z',
      end: '2024-01-02T00:00:00Z',
      lookback: '1h',
      min_duration: '10ms',
      max_duration: '1s',
      limit: '50'
    };

    const result = extractTracesSearchParams(search);

    expect(result).toEqual({
      datasourceId: 'ds-1',
      q: 'query',
      attributes: 'service.name=my-service',
      start: '2024-01-01T00:00:00Z',
      end: '2024-01-02T00:00:00Z',
      lookback: '1h',
      min_duration: '10ms',
      max_duration: '1s',
      limit: '50'
    });
  });

  it('returns empty object when no search params present', () => {
    const search = {};
    const result = extractTracesSearchParams(search);
    expect(result).toEqual({});
  });

  it('ignores non-traces params', () => {
    const search = {
      otherParam: 'value',
      anotherParam: 123
    };
    const result = extractTracesSearchParams(search);
    expect(result).toEqual({});
  });

  it('converts non-string values to strings', () => {
    const search = {
      datasourceId: 123,
      limit: 50
    };
    const result = extractTracesSearchParams(search);
    expect(result).toEqual({
      datasourceId: '123',
      limit: '50'
    });
  });

  it('only extracts defined values (skips empty strings, null, undefined)', () => {
    const search = {
      datasourceId: 'ds-1',
      q: undefined,
      attributes: null,
      start: '',
      end: '2024-01-02T00:00:00Z'
    };
    const result = extractTracesSearchParams(search);

    expect(result).toEqual({
      datasourceId: 'ds-1',
      end: '2024-01-02T00:00:00Z'
    });
  });
});

describe('hasTracesSearchParams', () => {
  it('returns true when search params are present', () => {
    expect(hasTracesSearchParams({ datasourceId: 'ds-1' })).toBe(true);
    expect(hasTracesSearchParams({ q: 'query' })).toBe(true);
    expect(hasTracesSearchParams({ attributes: 'key=value' })).toBe(true);
    expect(hasTracesSearchParams({ start: '2024-01-01' })).toBe(true);
    expect(hasTracesSearchParams({ end: '2024-01-02' })).toBe(true);
    expect(hasTracesSearchParams({ lookback: '1h' })).toBe(true);
    expect(hasTracesSearchParams({ min_duration: '10ms' })).toBe(true);
    expect(hasTracesSearchParams({ max_duration: '1s' })).toBe(true);
    expect(hasTracesSearchParams({ limit: '20' })).toBe(true);
    expect(hasTracesSearchParams({ spanName: 'project_span' })).toBe(true);
  });

  it('returns false when no search params are present', () => {
    expect(hasTracesSearchParams({})).toBe(false);
    expect(hasTracesSearchParams({ otherParam: 'value' })).toBe(false);
  });
});