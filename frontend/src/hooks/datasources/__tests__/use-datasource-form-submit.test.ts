import {
  buildDatasourceSubmitData,
  buildCustomApiEndpoints,
  buildCustomApiCapabilities,
  buildCustomApiAuthentication } from
'../use-datasource-form-submit';
import { DatasourceSource, DatasourceType } from '@/types/enums';
import type { ClickHouseConfig } from '../use-datasource-form';

describe('buildDatasourceSubmitData', () => {
  it('builds base data with trimmed name and description', () => {
    const result = buildDatasourceSubmitData({
      name: '  My Datasource  ',
      description: '  Description  ',
      source: DatasourceSource.TEMPO,
      clickhouseConfig: {},
      customApiConfig: {},
      tempoJaegerAuthConfig: {},
      url: 'http://example.com'
    });
    expect(result.name).toBe('My Datasource');
    expect(result.description).toBe('Description');
    expect(result.type).toBe(DatasourceType.TRACES);
    expect(result.source).toBe(DatasourceSource.TEMPO);
  });

  it('sets description to undefined when empty', () => {
    const result = buildDatasourceSubmitData({
      name: 'Test',
      description: '',
      source: DatasourceSource.TEMPO,
      clickhouseConfig: {},
      customApiConfig: {},
      tempoJaegerAuthConfig: {},
      url: 'http://example.com'
    });
    expect(result.description).toBeUndefined();
  });

  it('builds ClickHouse config when all fields provided', () => {
    const result = buildDatasourceSubmitData({
      name: 'Test',
      description: undefined,
      source: DatasourceSource.CLICKHOUSE,
      clickhouseConfig: {
        host: 'localhost',
        port: 9000,
        database: 'testdb',
        tableName: 'traces',
        username: 'user',
        password: 'pass',
        protocol: 'https'
      },
      customApiConfig: {},
      url: undefined
    });
    expect(result.config?.clickhouse).toEqual({
      host: 'localhost',
      port: 9000,
      database: 'testdb',
      tableName: 'traces',
      username: 'user',
      password: 'pass',
      protocol: 'https'
    });
    expect(result.url).toBe('');
  });

  it('builds ClickHouse config with defaults when optional fields missing', () => {
    const result = buildDatasourceSubmitData({
      name: 'Test',
      description: undefined,
      source: DatasourceSource.CLICKHOUSE,
      clickhouseConfig: {
        host: 'localhost',
        database: 'testdb',
        tableName: 'traces'
      },
      customApiConfig: {},
      url: undefined
    });
    expect(result.config?.clickhouse).toEqual({
      host: 'localhost',
      port: 8123,
      database: 'testdb',
      tableName: 'traces',
      protocol: 'http'
    });
  });

  it('omits username when empty string', () => {
    const result = buildDatasourceSubmitData({
      name: 'Test',
      description: undefined,
      source: DatasourceSource.CLICKHOUSE,
      clickhouseConfig: {
        host: 'localhost',
        database: 'testdb',
        tableName: 'traces',
        username: '   '
      },
      customApiConfig: {},
      url: undefined
    });
    expect(result.config?.clickhouse.username).toBeUndefined();
  });

  it('omits password when empty string', () => {
    const result = buildDatasourceSubmitData({
      name: 'Test',
      description: undefined,
      source: DatasourceSource.CLICKHOUSE,
      clickhouseConfig: {
        host: 'localhost',
        database: 'testdb',
        tableName: 'traces',
        password: ''
      },
      customApiConfig: {},
      url: undefined
    });
    expect(result.config?.clickhouse.password).toBeUndefined();
  });

  it('sets URL when ClickHouse config incomplete', () => {
    const result = buildDatasourceSubmitData({
      name: 'Test',
      description: undefined,
      source: DatasourceSource.CLICKHOUSE,
      clickhouseConfig: {
        host: 'localhost'
      },
      customApiConfig: {},
      url: 'http://example.com'
    });
    expect(result.config).toBeUndefined();
    expect(result.url).toBe('http://example.com');
  });

  it('builds Custom API config with all fields', () => {
    const result = buildDatasourceSubmitData({
      name: 'Test',
      description: undefined,
      source: DatasourceSource.CUSTOM_API,
      clickhouseConfig: {},
      customApiConfig: {
        baseUrl: 'https://example.com/',
        endpoints: {
          search: { path: '/search' },
          searchByTraceId: { path: '/trace/{traceId}' },
          attributeNames: { path: '/attributes' },
          attributeValues: { path: '/attributes/{attributeName}' }
        },
        capabilities: {
          searchByQuery: true,
          searchByAttributes: false,
          filterByAttributeExists: true,
          getAttributeNames: true,
          getAttributeValues: false
        },
        authentication: {
          type: 'header',
          headerName: 'X-API-Key',
          value: 'token'
        },
        headers: { 'Custom-Header': 'value' }
      },
      url: undefined
    });
    expect(result.config?.customApi?.baseUrl).toBe('https://example.com');
    expect(result.config?.customApi?.endpoints.search.path).toBe('/search');
    expect(result.config?.customApi?.endpoints.searchByTraceId.path).toBe('/trace/{traceId}');
    expect(result.config?.customApi?.endpoints.attributeNames?.path).toBe('/attributes');
    expect(result.config?.customApi?.endpoints.attributeValues?.path).toBe('/attributes/{attributeName}');
    expect(result.config?.customApi?.capabilities?.searchByQuery).toBe(true);
    expect(result.config?.customApi?.authentication?.type).toBe('header');
    expect(result.config?.customApi?.authentication?.headerName).toBe('X-API-Key');
    expect(result.config?.customApi?.headers).toEqual({ 'Custom-Header': 'value' });
  });

  it('removes trailing slashes from Custom API baseUrl', () => {
    const result = buildDatasourceSubmitData({
      name: 'Test',
      description: undefined,
      source: DatasourceSource.CUSTOM_API,
      clickhouseConfig: {},
      customApiConfig: {
        baseUrl: 'https://example.com///',
        endpoints: {
          search: { path: '/search' },
          searchByTraceId: { path: '/trace/{traceId}' }
        }
      },
      url: undefined
    });
    expect(result.config?.customApi?.baseUrl).toBe('https://example.com');
  });

  it('builds Custom API config with minimal fields', () => {
    const result = buildDatasourceSubmitData({
      name: 'Test',
      description: undefined,
      source: DatasourceSource.CUSTOM_API,
      clickhouseConfig: {},
      customApiConfig: {
        baseUrl: 'https://example.com',
        endpoints: {
          search: { path: '/search' },
          searchByTraceId: { path: '/trace/{traceId}' }
        }
      },
      url: undefined
    });
    expect(result.config?.customApi?.baseUrl).toBe('https://example.com');
    expect(result.config?.customApi?.endpoints.search.path).toBe('/search');
    expect(result.config?.customApi?.capabilities).toBeUndefined();
    expect(result.config?.customApi?.authentication).toBeUndefined();
    expect(result.config?.customApi?.headers).toBeUndefined();
  });

  it('builds Custom API config with bearer auth', () => {
    const result = buildDatasourceSubmitData({
      name: 'Test',
      description: undefined,
      source: DatasourceSource.CUSTOM_API,
      clickhouseConfig: {},
      customApiConfig: {
        baseUrl: 'https://example.com',
        endpoints: {
          search: { path: '/search' },
          searchByTraceId: { path: '/trace/{traceId}' }
        },
        authentication: {
          type: 'bearer',
          value: 'token123'
        }
      },
      url: undefined
    });
    expect(result.config?.customApi?.authentication?.type).toBe('bearer');
    expect(result.config?.customApi?.authentication?.value).toBe('token123');
    expect(result.config?.customApi?.authentication?.headerName).toBeUndefined();
  });

  it('builds Custom API config with basic auth', () => {
    const result = buildDatasourceSubmitData({
      name: 'Test',
      description: undefined,
      source: DatasourceSource.CUSTOM_API,
      clickhouseConfig: {},
      customApiConfig: {
        baseUrl: 'https://example.com',
        endpoints: {
          search: { path: '/search' },
          searchByTraceId: { path: '/trace/{traceId}' }
        },
        authentication: {
          type: 'basic',
          username: 'user',
          password: 'pass'
        }
      },
      url: undefined
    });
    expect(result.config?.customApi?.authentication?.type).toBe('basic');
    expect(result.config?.customApi?.authentication?.username).toBe('user');
    expect(result.config?.customApi?.authentication?.password).toBe('pass');
  });

  it('omits optional Custom API endpoints when not provided', () => {
    const result = buildDatasourceSubmitData({
      name: 'Test',
      description: undefined,
      source: DatasourceSource.CUSTOM_API,
      clickhouseConfig: {},
      customApiConfig: {
        baseUrl: 'https://example.com',
        endpoints: {
          search: { path: '/search' },
          searchByTraceId: { path: '/trace/{traceId}' }
        }
      },
      url: undefined
    });
    expect(result.config?.customApi?.endpoints.attributeNames).toBeUndefined();
    expect(result.config?.customApi?.endpoints.attributeValues).toBeUndefined();
  });

  it('omits headers when empty', () => {
    const result = buildDatasourceSubmitData({
      name: 'Test',
      description: undefined,
      source: DatasourceSource.CUSTOM_API,
      clickhouseConfig: {},
      customApiConfig: {
        baseUrl: 'https://example.com',
        endpoints: {
          search: { path: '/search' },
          searchByTraceId: { path: '/trace/{traceId}' }
        },
        headers: {}
      },
      url: undefined
    });
    expect(result.config?.customApi?.headers).toBeUndefined();
  });

  it('trims all string values in Custom API config', () => {
    const result = buildDatasourceSubmitData({
      name: 'Test',
      description: undefined,
      source: DatasourceSource.CUSTOM_API,
      clickhouseConfig: {},
      customApiConfig: {
        baseUrl: '  https://example.com  ',
        endpoints: {
          search: { path: '  /search  ' },
          searchByTraceId: { path: '  /trace/{traceId}  ' }
        },
        authentication: {
          type: 'header',
          headerName: '  X-API-Key  ',
          value: '  token  '
        }
      },
      url: undefined
    });
    expect(result.config?.customApi?.baseUrl).toBe('https://example.com');
    expect(result.config?.customApi?.endpoints.search.path).toBe('/search');
    expect(result.config?.customApi?.endpoints.searchByTraceId.path).toBe('/trace/{traceId}');
    expect(result.config?.customApi?.authentication?.headerName).toBe('X-API-Key');
    expect(result.config?.customApi?.authentication?.value).toBe('token');
  });

  it('builds URL for other source types', () => {
    const result = buildDatasourceSubmitData({
      name: 'Test',
      description: undefined,
      source: DatasourceSource.TEMPO,
      clickhouseConfig: {},
      customApiConfig: {},
      tempoJaegerAuthConfig: {},
      url: 'http://tempo.example.com'
    });
    expect(result.url).toBe('http://tempo.example.com');
    expect(result.config).toBeUndefined();
  });

  it('trims URL for other source types', () => {
    const result = buildDatasourceSubmitData({
      name: 'Test',
      description: undefined,
      source: DatasourceSource.TEMPO,
      clickhouseConfig: {},
      customApiConfig: {},
      tempoJaegerAuthConfig: {},
      url: '  http://tempo.example.com  '
    });
    expect(result.url).toBe('http://tempo.example.com');
  });
});

describe('buildCustomApiEndpoints', () => {
  it('builds endpoints with required fields', () => {
    const result = buildCustomApiEndpoints({
      endpoints: {
        search: { path: '/search' },
        searchByTraceId: { path: '/trace/{traceId}' }
      }
    });
    expect(result.search.path).toBe('/search');
    expect(result.searchByTraceId.path).toBe('/trace/{traceId}');
  });

  it('trims path values', () => {
    const result = buildCustomApiEndpoints({
      endpoints: {
        search: { path: '  /search  ' },
        searchByTraceId: { path: '  /trace/{traceId}  ' }
      }
    });
    expect(result.search.path).toBe('/search');
    expect(result.searchByTraceId.path).toBe('/trace/{traceId}');
  });

  it('includes attributeNames when path is provided', () => {
    const result = buildCustomApiEndpoints({
      endpoints: {
        search: { path: '/search' },
        searchByTraceId: { path: '/trace/{traceId}' },
        attributeNames: { path: '/attributes' }
      }
    });
    expect(result.attributeNames?.path).toBe('/attributes');
  });

  it('includes attributeValues when path is provided', () => {
    const result = buildCustomApiEndpoints({
      endpoints: {
        search: { path: '/search' },
        searchByTraceId: { path: '/trace/{traceId}' },
        attributeValues: { path: '/attributes/{attributeName}' }
      }
    });
    expect(result.attributeValues?.path).toBe('/attributes/{attributeName}');
  });

  it('omits attributeNames when path is not provided', () => {
    const result = buildCustomApiEndpoints({
      endpoints: {
        search: { path: '/search' },
        searchByTraceId: { path: '/trace/{traceId}' }
      }
    });
    expect(result.attributeNames).toBeUndefined();
  });

  it('omits attributeValues when path is not provided', () => {
    const result = buildCustomApiEndpoints({
      endpoints: {
        search: { path: '/search' },
        searchByTraceId: { path: '/trace/{traceId}' }
      }
    });
    expect(result.attributeValues).toBeUndefined();
  });

  it('omits attributeNames when path is empty string', () => {
    const result = buildCustomApiEndpoints({
      endpoints: {
        search: { path: '/search' },
        searchByTraceId: { path: '/trace/{traceId}' },
        attributeNames: { path: '' }
      }
    });
    expect(result.attributeNames).toBeUndefined();
  });

  it('includes both optional endpoints when provided', () => {
    const result = buildCustomApiEndpoints({
      endpoints: {
        search: { path: '/search' },
        searchByTraceId: { path: '/trace/{traceId}' },
        attributeNames: { path: '/attributes' },
        attributeValues: { path: '/values/{attributeName}' }
      }
    });
    expect(result.attributeNames?.path).toBe('/attributes');
    expect(result.attributeValues?.path).toBe('/values/{attributeName}');
  });
});

describe('buildCustomApiCapabilities', () => {
  it('includes all capabilities when all are defined', () => {
    const result = buildCustomApiCapabilities({
      capabilities: {
        searchByQuery: true,
        searchByAttributes: false,
        filterByAttributeExists: true,
        getAttributeNames: false,
        getAttributeValues: true
      }
    });
    expect(result.searchByQuery).toBe(true);
    expect(result.searchByAttributes).toBe(false);
    expect(result.filterByAttributeExists).toBe(true);
    expect(result.getAttributeNames).toBe(false);
    expect(result.getAttributeValues).toBe(true);
  });

  it('omits capabilities when undefined', () => {
    const result = buildCustomApiCapabilities({
      capabilities: {
        searchByQuery: true
      }
    });
    expect(result.searchByQuery).toBe(true);
    expect(result.searchByAttributes).toBeUndefined();
    expect(result.filterByAttributeExists).toBeUndefined();
    expect(result.getAttributeNames).toBeUndefined();
    expect(result.getAttributeValues).toBeUndefined();
  });

  it('includes false values', () => {
    const result = buildCustomApiCapabilities({
      capabilities: {
        searchByQuery: false,
        searchByAttributes: false
      }
    });
    expect(result.searchByQuery).toBe(false);
    expect(result.searchByAttributes).toBe(false);
  });

  it('returns empty object when all capabilities are undefined', () => {
    const result = buildCustomApiCapabilities({
      capabilities: {}
    });
    expect(result).toEqual({});
  });

  it('includes only defined capabilities', () => {
    const result = buildCustomApiCapabilities({
      capabilities: {
        searchByQuery: true,
        getAttributeNames: false
      }
    });
    expect(result.searchByQuery).toBe(true);
    expect(result.getAttributeNames).toBe(false);
    expect(result.searchByAttributes).toBeUndefined();
    expect(result.filterByAttributeExists).toBeUndefined();
    expect(result.getAttributeValues).toBeUndefined();
  });
});

describe('buildCustomApiAuthentication', () => {
  it('builds header authentication with all fields', () => {
    const result = buildCustomApiAuthentication({
      authentication: {
        type: 'header',
        headerName: 'X-API-Key',
        value: 'token123'
      }
    });
    expect(result.type).toBe('header');
    expect(result.headerName).toBe('X-API-Key');
    expect(result.value).toBe('token123');
    expect(result.username).toBeUndefined();
    expect(result.password).toBeUndefined();
  });

  it('builds bearer authentication', () => {
    const result = buildCustomApiAuthentication({
      authentication: {
        type: 'bearer',
        value: 'bearer-token'
      }
    });
    expect(result.type).toBe('bearer');
    expect(result.value).toBe('bearer-token');
    expect(result.headerName).toBeUndefined();
    expect(result.username).toBeUndefined();
    expect(result.password).toBeUndefined();
  });

  it('builds basic authentication', () => {
    const result = buildCustomApiAuthentication({
      authentication: {
        type: 'basic',
        username: 'user',
        password: 'pass'
      }
    });
    expect(result.type).toBe('basic');
    expect(result.username).toBe('user');
    expect(result.password).toBe('pass');
    expect(result.headerName).toBeUndefined();
    expect(result.value).toBeUndefined();
  });

  it('trims all string values', () => {
    const result = buildCustomApiAuthentication({
      authentication: {
        type: 'header',
        headerName: '  X-API-Key  ',
        value: '  token  '
      }
    });
    expect(result.headerName).toBe('X-API-Key');
    expect(result.value).toBe('token');
  });

  it('trims username and password for basic auth', () => {
    const result = buildCustomApiAuthentication({
      authentication: {
        type: 'basic',
        username: '  user  ',
        password: '  pass  '
      }
    });
    expect(result.username).toBe('user');
    expect(result.password).toBe('pass');
  });

  it('omits headerName when not provided for header auth', () => {
    const result = buildCustomApiAuthentication({
      authentication: {
        type: 'header',
        value: 'token'
      }
    });
    expect(result.type).toBe('header');
    expect(result.value).toBe('token');
    expect(result.headerName).toBeUndefined();
  });

  it('omits value when not provided', () => {
    const result = buildCustomApiAuthentication({
      authentication: {
        type: 'bearer'
      }
    });
    expect(result.type).toBe('bearer');
    expect(result.value).toBeUndefined();
  });

  it('omits username when not provided for basic auth', () => {
    const result = buildCustomApiAuthentication({
      authentication: {
        type: 'basic',
        password: 'pass'
      }
    });
    expect(result.type).toBe('basic');
    expect(result.password).toBe('pass');
    expect(result.username).toBeUndefined();
  });

  it('omits password when not provided for basic auth', () => {
    const result = buildCustomApiAuthentication({
      authentication: {
        type: 'basic',
        username: 'user'
      }
    });
    expect(result.type).toBe('basic');
    expect(result.username).toBe('user');
    expect(result.password).toBeUndefined();
  });

  it('omits empty string values', () => {
    const result = buildCustomApiAuthentication({
      authentication: {
        type: 'header',
        headerName: '',
        value: ''
      }
    });
    expect(result.type).toBe('header');
    expect(result.headerName).toBeUndefined();
    expect(result.value).toBeUndefined();
  });

  it('includes empty strings after trimming whitespace-only values', () => {
    const result = buildCustomApiAuthentication({
      authentication: {
        type: 'header',
        headerName: '   ',
        value: '   '
      }
    });
    expect(result.type).toBe('header');
    expect(result.headerName).toBe('');
    expect(result.value).toBe('');
  });
});