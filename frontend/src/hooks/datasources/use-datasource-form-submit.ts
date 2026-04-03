import { DatasourceSource, DatasourceType } from '@/types/enums'
import type {
  CreateDatasourceRequest,
  UpdateDatasourceRequest,
  CustomApiConfig,
  TempoJaegerAuthConfig,
} from '@/types/datasources'
import type { ClickHouseConfig } from './use-datasource-form'

type BuildClickhouseConfigParams = {
  clickhouseConfig: Partial<ClickHouseConfig>
  url: string | undefined
}

function buildClickhouseConfig({ clickhouseConfig, url }: BuildClickhouseConfigParams): {
  config?: { clickhouse: ClickHouseConfig }
  url: string
} {
  const result: { config?: { clickhouse: ClickHouseConfig }; url: string } = {
    url: url?.trim() ?? '',
  }

  if (clickhouseConfig.host && clickhouseConfig.database && clickhouseConfig.tableName) {
    result.config = {
      clickhouse: {
        host: clickhouseConfig.host.trim(),
        port: clickhouseConfig.port ?? 8123,
        database: clickhouseConfig.database.trim(),
        tableName: clickhouseConfig.tableName.trim(),
        protocol: clickhouseConfig.protocol ?? 'http',
        ...(clickhouseConfig.username?.trim() && { username: clickhouseConfig.username.trim() }),
        ...(clickhouseConfig.password != null &&
          clickhouseConfig.password !== '' && { password: clickhouseConfig.password }),
      },
    }
  }

  return result
}

type BuildCustomApiEndpointsParams = {
  endpoints: CustomApiConfig['endpoints']
}

export function buildCustomApiEndpoints({ endpoints }: BuildCustomApiEndpointsParams): CustomApiConfig['endpoints'] {
  return {
    search: { path: endpoints.search.path.trim() },
    searchByTraceId: { path: endpoints.searchByTraceId.path.trim() },
    ...(endpoints.attributeNames?.path && {
      attributeNames: { path: endpoints.attributeNames.path.trim() },
    }),
    ...(endpoints.attributeValues?.path && {
      attributeValues: { path: endpoints.attributeValues.path.trim() },
    }),
  }
}

type BuildCustomApiCapabilitiesParams = {
  capabilities: CustomApiConfig['capabilities']
}

export function buildCustomApiCapabilities({
  capabilities,
}: BuildCustomApiCapabilitiesParams): CustomApiConfig['capabilities'] {
  return {
    ...(capabilities.searchByQuery !== undefined && {
      searchByQuery: capabilities.searchByQuery,
    }),
    ...(capabilities.searchByAttributes !== undefined && {
      searchByAttributes: capabilities.searchByAttributes,
    }),
    ...(capabilities.filterByAttributeExists !== undefined && {
      filterByAttributeExists: capabilities.filterByAttributeExists,
    }),
    ...(capabilities.getAttributeNames !== undefined && {
      getAttributeNames: capabilities.getAttributeNames,
    }),
    ...(capabilities.getAttributeValues !== undefined && {
      getAttributeValues: capabilities.getAttributeValues,
    }),
  }
}

type BuildCustomApiAuthenticationParams = {
  authentication: CustomApiConfig['authentication']
}

export function buildCustomApiAuthentication({
  authentication,
}: BuildCustomApiAuthenticationParams): CustomApiConfig['authentication'] {
  return {
    type: authentication.type,
    ...(authentication.headerName && {
      headerName: authentication.headerName.trim(),
    }),
    ...(authentication.value && {
      value: authentication.value.trim(),
    }),
    ...(authentication.username && {
      username: authentication.username.trim(),
    }),
    ...(authentication.password && {
      password: authentication.password.trim(),
    }),
  }
}

type BuildCustomApiConfigParams = {
  customApiConfig: Partial<CustomApiConfig>
}

function buildCustomApiConfig({ customApiConfig }: BuildCustomApiConfigParams): {
  config?: { customApi: CustomApiConfig }
} {
  if (!customApiConfig.baseUrl || !customApiConfig.endpoints) {
    return {}
  }

  const config: CustomApiConfig = {
    baseUrl: customApiConfig.baseUrl.trim().replace(/\/+$/, ''),
    endpoints: buildCustomApiEndpoints({ endpoints: customApiConfig.endpoints }),
  }

  if (customApiConfig.capabilities) {
    config.capabilities = buildCustomApiCapabilities({ capabilities: customApiConfig.capabilities })
  }

  if (customApiConfig.authentication) {
    config.authentication = buildCustomApiAuthentication({ authentication: customApiConfig.authentication })
  }

  if (customApiConfig.headers && Object.keys(customApiConfig.headers).length > 0) {
    config.headers = customApiConfig.headers
  }

  return { config: { customApi: config } }
}

function buildTempoJaegerConfig({ tempoJaegerAuthConfig }: { tempoJaegerAuthConfig: Partial<TempoJaegerAuthConfig> }): {
  config?: { authentication: TempoJaegerAuthConfig['authentication'] }
} {
  if (!tempoJaegerAuthConfig.authentication) {
    return {}
  }

  const auth = tempoJaegerAuthConfig.authentication
  const configAuth: TempoJaegerAuthConfig['authentication'] = {
    type: auth.type,
  }

  if (auth.type === 'basic') {
    if (auth.username?.trim()) {
      configAuth.username = auth.username.trim()
    }
    if (auth.password?.trim()) {
      configAuth.password = auth.password.trim()
    }
  } else if (auth.type === 'bearer') {
    if (auth.token?.trim()) {
      configAuth.token = auth.token.trim()
    }
  }

  return Object.keys(configAuth).length > 1 ? { config: { authentication: configAuth } } : {}
}

type BuildSubmitDataParams = {
  name: string
  description: string | undefined
  source: DatasourceSource | ''
  clickhouseConfig: Partial<ClickHouseConfig>
  customApiConfig: Partial<CustomApiConfig>
  tempoJaegerAuthConfig: Partial<TempoJaegerAuthConfig>
  url: string | undefined
}

export function buildDatasourceSubmitData({
  name,
  description,
  source,
  clickhouseConfig,
  customApiConfig,
  tempoJaegerAuthConfig,
  url,
}: BuildSubmitDataParams): Partial<CreateDatasourceRequest & UpdateDatasourceRequest> {
  const baseData: Partial<CreateDatasourceRequest & UpdateDatasourceRequest> = {
    name: name.trim(),
    description: description?.trim() || undefined,
    type: DatasourceType.TRACES,
    source: source as DatasourceSource,
  }

  if (source === DatasourceSource.CLICKHOUSE) {
    const clickhouseData = buildClickhouseConfig({ clickhouseConfig, url })
    Object.assign(baseData, clickhouseData)
  } else if (source === DatasourceSource.CUSTOM_API) {
    const customApiData = buildCustomApiConfig({ customApiConfig })
    Object.assign(baseData, customApiData)
  } else if (source === DatasourceSource.TEMPO || source === DatasourceSource.JAEGER) {
    baseData.url = url?.trim()
    const authData = buildTempoJaegerConfig({ tempoJaegerAuthConfig })
    if (authData.config) {
      baseData.config = { ...baseData.config, ...authData.config }
    }
  } else {
    baseData.url = url?.trim()
  }

  return baseData
}
