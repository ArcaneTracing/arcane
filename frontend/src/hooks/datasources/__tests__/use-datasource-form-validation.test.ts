import {
  validateClickhouse,
  validateCustomApi,
  validateDatasourceForm } from
'../use-datasource-form-validation';
import { DatasourceSource } from '@/types/enums';
import type { ClickHouseConfig, CustomApiConfig } from '@/types/datasources';

describe('validateClickhouse', () => {
  it('returns errors when neither config nor url provided', () => {
    const result = validateClickhouse({
      clickhouseConfig: {},
      url: undefined
    });
    expect(result.config).toBe('Either config fields (host, database, table name) or URL must be provided');
    expect(result.url).toBe('Either config fields or URL must be provided');
  });

  it('returns no errors when url provided but no config', () => {
    const result = validateClickhouse({
      clickhouseConfig: {},
      url: 'http://example.com'
    });
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('returns errors when config fields partially filled without URL', () => {
    const result = validateClickhouse({
      clickhouseConfig: { host: 'localhost' },
      url: undefined
    });
    expect(result.config).toBe('Either config fields (host, database, table name) or URL must be provided');
    expect(result.url).toBe('Either config fields or URL must be provided');
  });

  it('returns no errors when config partially filled but URL provided', () => {
    const result = validateClickhouse({
      clickhouseConfig: { host: 'localhost' },
      url: 'http://example.com'
    });
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('returns config/url error when host is empty string (hasConfig becomes false)', () => {
    const result = validateClickhouse({
      clickhouseConfig: { host: '', database: 'db', tableName: 'table' },
      url: undefined
    });
    expect(result.config).toBe('Either config fields (host, database, table name) or URL must be provided');
    expect(result.url).toBe('Either config fields or URL must be provided');
  });

  it('returns config/url error when database is empty string (hasConfig becomes false)', () => {
    const result = validateClickhouse({
      clickhouseConfig: { host: 'localhost', database: '', tableName: 'table' },
      url: undefined
    });
    expect(result.config).toBe('Either config fields (host, database, table name) or URL must be provided');
    expect(result.url).toBe('Either config fields or URL must be provided');
  });

  it('returns config/url error when tableName is empty string (hasConfig becomes false)', () => {
    const result = validateClickhouse({
      clickhouseConfig: { host: 'localhost', database: 'db', tableName: '' },
      url: undefined
    });
    expect(result.config).toBe('Either config fields (host, database, table name) or URL must be provided');
    expect(result.url).toBe('Either config fields or URL must be provided');
  });

  it('returns error when port is out of range (too low)', () => {
    const result = validateClickhouse({
      clickhouseConfig: { host: 'localhost', database: 'db', tableName: 'table', port: 0 },
      url: undefined
    });
    expect(result.port).toBe('Port must be between 1 and 65535');
  });

  it('returns error when port is out of range (too high)', () => {
    const result = validateClickhouse({
      clickhouseConfig: { host: 'localhost', database: 'db', tableName: 'table', port: 65536 },
      url: undefined
    });
    expect(result.port).toBe('Port must be between 1 and 65535');
  });

  it('returns no errors when valid config provided', () => {
    const result = validateClickhouse({
      clickhouseConfig: { host: 'localhost', database: 'db', tableName: 'table', port: 8123 },
      url: undefined
    });
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('handles whitespace-only values (hasConfig becomes false)', () => {
    const result = validateClickhouse({
      clickhouseConfig: { host: '   ', database: 'db', tableName: 'table' },
      url: undefined
    });
    expect(result.config).toBe('Either config fields (host, database, table name) or URL must be provided');
    expect(result.url).toBe('Either config fields or URL must be provided');
  });

  it('validates individual fields only when hasConfig is true (all fields have values)', () => {


    const result = validateClickhouse({
      clickhouseConfig: { host: '', database: '', tableName: '' },
      url: undefined
    });
    expect(result.config).toBe('Either config fields (host, database, table name) or URL must be provided');
    expect(result.url).toBe('Either config fields or URL must be provided');
  });
});

describe('validateCustomApi', () => {
  it('returns error when baseUrl is missing', () => {
    const result = validateCustomApi({
      customApiConfig: {}
    });
    expect(result.baseUrl).toBe('Base URL is required');
  });

  it('returns error when baseUrl is invalid', () => {
    const result = validateCustomApi({
      customApiConfig: { baseUrl: 'not-a-url' }
    });
    expect(result.baseUrl).toBe('Base URL must be a valid HTTP or HTTPS URL');
  });

  it('returns error when baseUrl is not HTTP/HTTPS', () => {
    const result = validateCustomApi({
      customApiConfig: { baseUrl: 'ftp://example.com' }
    });
    expect(result.baseUrl).toBe('Base URL must be a valid HTTP or HTTPS URL');
  });

  it('accepts valid HTTP URL', () => {
    const result = validateCustomApi({
      customApiConfig: { baseUrl: 'http://example.com' }
    });
    expect(result.baseUrl).toBeUndefined();
  });

  it('accepts valid HTTPS URL', () => {
    const result = validateCustomApi({
      customApiConfig: { baseUrl: 'https://example.com' }
    });
    expect(result.baseUrl).toBeUndefined();
  });

  it('returns error when search endpoint path missing', () => {
    const result = validateCustomApi({
      customApiConfig: {
        baseUrl: 'https://example.com',
        endpoints: { search: { path: '' }, searchByTraceId: { path: '/trace/{traceId}' } }
      }
    });
    expect(result['endpoints.search.path']).toBe('Search endpoint path is required');
  });

  it('returns error when searchByTraceId endpoint path missing', () => {
    const result = validateCustomApi({
      customApiConfig: {
        baseUrl: 'https://example.com',
        endpoints: { search: { path: '/search' }, searchByTraceId: { path: '' } }
      }
    });
    expect(result['endpoints.searchByTraceId.path']).toBe('Search by Trace ID endpoint path is required');
  });

  it('returns error when searchByTraceId path missing {traceId} placeholder', () => {
    const result = validateCustomApi({
      customApiConfig: {
        baseUrl: 'https://example.com',
        endpoints: { search: { path: '/search' }, searchByTraceId: { path: '/trace' } }
      }
    });
    expect(result['endpoints.searchByTraceId.path']).toBe(
      'Search by Trace ID endpoint path must contain {traceId} placeholder'
    );
  });

  it('returns error when getAttributeNames enabled but endpoint missing', () => {
    const result = validateCustomApi({
      customApiConfig: {
        baseUrl: 'https://example.com',
        endpoints: { search: { path: '/search' }, searchByTraceId: { path: '/trace/{traceId}' } },
        capabilities: { getAttributeNames: true }
      }
    });
    expect(result['endpoints.attributeNames.path']).toBe(
      'Attribute Names endpoint path is required when Get Attribute Names capability is enabled'
    );
  });

  it('returns error when getAttributeValues enabled but endpoint missing', () => {
    const result = validateCustomApi({
      customApiConfig: {
        baseUrl: 'https://example.com',
        endpoints: { search: { path: '/search' }, searchByTraceId: { path: '/trace/{traceId}' } },
        capabilities: { getAttributeValues: true }
      }
    });
    expect(result['endpoints.attributeValues.path']).toBe(
      'Attribute Values endpoint path is required when Get Attribute Values capability is enabled'
    );
  });

  it('returns error when attributeValues path missing {attributeName} placeholder', () => {
    const result = validateCustomApi({
      customApiConfig: {
        baseUrl: 'https://example.com',
        endpoints: {
          search: { path: '/search' },
          searchByTraceId: { path: '/trace/{traceId}' },
          attributeValues: { path: '/attributes' }
        },
        capabilities: { getAttributeValues: true }
      }
    });
    expect(result['endpoints.attributeValues.path']).toBe(
      'Attribute Values endpoint path must contain {attributeName} placeholder'
    );
  });

  it('returns error when header auth missing headerName', () => {
    const result = validateCustomApi({
      customApiConfig: {
        baseUrl: 'https://example.com',
        endpoints: { search: { path: '/search' }, searchByTraceId: { path: '/trace/{traceId}' } },
        authentication: { type: 'header', value: 'token' }
      }
    });
    expect(result['authentication.headerName']).toBe('Header name is required for header authentication');
  });

  it('returns error when header auth missing value', () => {
    const result = validateCustomApi({
      customApiConfig: {
        baseUrl: 'https://example.com',
        endpoints: { search: { path: '/search' }, searchByTraceId: { path: '/trace/{traceId}' } },
        authentication: { type: 'header', headerName: 'X-API-Key' }
      }
    });
    expect(result['authentication.value']).toBe('Value is required for header authentication');
  });

  it('returns error when bearer auth missing value', () => {
    const result = validateCustomApi({
      customApiConfig: {
        baseUrl: 'https://example.com',
        endpoints: { search: { path: '/search' }, searchByTraceId: { path: '/trace/{traceId}' } },
        authentication: { type: 'bearer' }
      }
    });
    expect(result['authentication.value']).toBe('Token value is required for bearer authentication');
  });

  it('returns error when basic auth missing username', () => {
    const result = validateCustomApi({
      customApiConfig: {
        baseUrl: 'https://example.com',
        endpoints: { search: { path: '/search' }, searchByTraceId: { path: '/trace/{traceId}' } },
        authentication: { type: 'basic', password: 'pass' }
      }
    });
    expect(result['authentication.username']).toBe('Username is required for basic authentication');
  });

  it('returns error when basic auth missing password', () => {
    const result = validateCustomApi({
      customApiConfig: {
        baseUrl: 'https://example.com',
        endpoints: { search: { path: '/search' }, searchByTraceId: { path: '/trace/{traceId}' } },
        authentication: { type: 'basic', username: 'user' }
      }
    });
    expect(result['authentication.password']).toBe('Password is required for basic authentication');
  });

  it('returns no errors when valid config provided', () => {
    const result = validateCustomApi({
      customApiConfig: {
        baseUrl: 'https://example.com',
        endpoints: {
          search: { path: '/search' },
          searchByTraceId: { path: '/trace/{traceId}' },
          attributeNames: { path: '/attributes' },
          attributeValues: { path: '/attributes/{attributeName}' }
        },
        capabilities: {
          getAttributeNames: true,
          getAttributeValues: true
        },
        authentication: { type: 'header', headerName: 'X-API-Key', value: 'token' }
      }
    });
    expect(Object.keys(result)).toHaveLength(0);
  });
});

describe('validateDatasourceForm', () => {
  it('returns empty errors when source is empty', () => {
    const result = validateDatasourceForm({
      source: '',
      clickhouseConfig: {},
      customApiConfig: {},
      url: undefined
    });
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('validates ClickHouse source', () => {
    const result = validateDatasourceForm({
      source: DatasourceSource.CLICKHOUSE,
      clickhouseConfig: {},
      customApiConfig: {},
      url: undefined
    });
    expect(result.config).toBeDefined();
  });

  it('validates Custom API source', () => {
    const result = validateDatasourceForm({
      source: DatasourceSource.CUSTOM_API,
      clickhouseConfig: {},
      customApiConfig: {},
      url: undefined
    });
    expect(result.baseUrl).toBe('Base URL is required');
  });

  it('validates other source types require URL', () => {
    const result = validateDatasourceForm({
      source: DatasourceSource.TEMPO,
      clickhouseConfig: {},
      customApiConfig: {},
      tempoJaegerAuthConfig: {},
      url: undefined
    });
    expect(result.url).toBe('URL is required');
  });

  it('returns no errors for other source types when URL provided', () => {
    const result = validateDatasourceForm({
      source: DatasourceSource.TEMPO,
      clickhouseConfig: {},
      customApiConfig: {},
      tempoJaegerAuthConfig: {},
      url: 'http://example.com'
    });
    expect(Object.keys(result)).toHaveLength(0);
  });
});