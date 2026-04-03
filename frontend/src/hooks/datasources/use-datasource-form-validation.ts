import { DatasourceSource } from '@/types/enums'
import type { CustomApiConfig, TempoJaegerAuthConfig } from '@/types/datasources'
import type { ClickHouseConfig } from './use-datasource-form'

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

type ValidateClickhouseParams = {
  clickhouseConfig: Partial<ClickHouseConfig>
  url: string | undefined
}

export function validateClickhouse({ clickhouseConfig, url }: ValidateClickhouseParams): Record<string, string> {
  const errors: Record<string, string> = {}
  const hasConfig =
    !!clickhouseConfig.host?.trim() &&
    !!clickhouseConfig.database?.trim() &&
    !!clickhouseConfig.tableName?.trim()

  if (!hasConfig && !url?.trim()) {
    errors.config = 'Either config fields (host, database, table name) or URL must be provided'
    errors.url = 'Either config fields or URL must be provided'
    return errors
  }

  if (!hasConfig) return errors

  if (!clickhouseConfig.host?.trim()) errors.host = 'Host is required'
  if (!clickhouseConfig.database?.trim()) errors.database = 'Database is required'
  if (!clickhouseConfig.tableName?.trim()) errors.tableName = 'Table name is required'
  if (clickhouseConfig.port != null && (clickhouseConfig.port < 1 || clickhouseConfig.port > 65535)) {
    errors.port = 'Port must be between 1 and 65535'
  }

  return errors
}

type ValidateCustomApiEndpointsParams = {
  endpoints: CustomApiConfig['endpoints']
  capabilities: CustomApiConfig['capabilities']
}

function validateCustomApiEndpoints({
  endpoints,
  capabilities,
}: ValidateCustomApiEndpointsParams): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!endpoints?.search?.path?.trim()) {
    errors['endpoints.search.path'] = 'Search endpoint path is required'
  }

  if (!endpoints?.searchByTraceId?.path?.trim()) {
    errors['endpoints.searchByTraceId.path'] = 'Search by Trace ID endpoint path is required'
  } else if (!endpoints.searchByTraceId.path.includes('{traceId}')) {
    errors['endpoints.searchByTraceId.path'] =
      'Search by Trace ID endpoint path must contain {traceId} placeholder'
  }

  if (capabilities?.getAttributeNames && !endpoints?.attributeNames?.path?.trim()) {
    errors['endpoints.attributeNames.path'] =
      'Attribute Names endpoint path is required when Get Attribute Names capability is enabled'
  }

  if (capabilities?.getAttributeValues) {
    if (!endpoints?.attributeValues?.path?.trim()) {
      errors['endpoints.attributeValues.path'] =
        'Attribute Values endpoint path is required when Get Attribute Values capability is enabled'
    } else if (!endpoints.attributeValues.path.includes('{attributeName}')) {
      errors['endpoints.attributeValues.path'] =
        'Attribute Values endpoint path must contain {attributeName} placeholder'
    }
  }

  return errors
}

type ValidateCustomApiAuthParams = {
  authentication: CustomApiConfig['authentication']
}

function validateCustomApiAuth({ authentication }: ValidateCustomApiAuthParams): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!authentication) return errors

  if (authentication.type === 'header') {
    if (!authentication.headerName?.trim()) {
      errors['authentication.headerName'] = 'Header name is required for header authentication'
    }
    if (!authentication.value?.trim()) {
      errors['authentication.value'] = 'Value is required for header authentication'
    }
  } else if (authentication.type === 'bearer') {
    if (!authentication.value?.trim()) {
      errors['authentication.value'] = 'Token value is required for bearer authentication'
    }
  } else if (authentication.type === 'basic') {
    if (!authentication.username?.trim()) {
      errors['authentication.username'] = 'Username is required for basic authentication'
    }
    if (!authentication.password?.trim()) {
      errors['authentication.password'] = 'Password is required for basic authentication'
    }
  }

  return errors
}

type ValidateCustomApiParams = {
  customApiConfig: Partial<CustomApiConfig>
}

export function validateCustomApi({ customApiConfig }: ValidateCustomApiParams): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!customApiConfig.baseUrl?.trim()) {
    errors.baseUrl = 'Base URL is required'
  } else if (!isValidUrl(customApiConfig.baseUrl.trim())) {
    errors.baseUrl = 'Base URL must be a valid HTTP or HTTPS URL'
  }

  const endpointErrors = validateCustomApiEndpoints({
    endpoints: customApiConfig.endpoints,
    capabilities: customApiConfig.capabilities,
  })
  Object.assign(errors, endpointErrors)

  const authErrors = validateCustomApiAuth({ authentication: customApiConfig.authentication })
  Object.assign(errors, authErrors)

  return errors
}

type ValidateTempoJaegerAuthParams = {
  tempoJaegerAuthConfig: Partial<TempoJaegerAuthConfig>
}

function validateTempoJaegerAuth({ tempoJaegerAuthConfig }: ValidateTempoJaegerAuthParams): Record<string, string> {
  const errors: Record<string, string> = {}
  const auth = tempoJaegerAuthConfig.authentication

  if (!auth) return errors

  if (auth.type === 'basic') {
    if (!auth.username?.trim()) {
      errors['authentication.username'] = 'Username is required for basic authentication'
    }
    if (!auth.password?.trim()) {
      errors['authentication.password'] = 'Password is required for basic authentication'
    }
  } else if (auth.type === 'bearer') {
    if (!auth.token?.trim()) {
      errors['authentication.token'] = 'Token is required for bearer authentication'
    }
  }

  return errors
}

type ValidateFormParams = {
  source: DatasourceSource | ''
  clickhouseConfig: Partial<ClickHouseConfig>
  customApiConfig: Partial<CustomApiConfig>
  tempoJaegerAuthConfig: Partial<TempoJaegerAuthConfig>
  url: string | undefined
}

export function validateDatasourceForm({
  source,
  clickhouseConfig,
  customApiConfig,
  tempoJaegerAuthConfig,
  url,
}: ValidateFormParams): Record<string, string> {
  if (source === DatasourceSource.CLICKHOUSE) {
    return validateClickhouse({ clickhouseConfig, url })
  }

  if (source === DatasourceSource.CUSTOM_API) {
    return validateCustomApi({ customApiConfig })
  }

  if (source === DatasourceSource.TEMPO || source === DatasourceSource.JAEGER) {
    const errors: Record<string, string> = {}
    if (!url?.trim()) {
      errors.url = 'URL is required'
    }
    const authErrors = validateTempoJaegerAuth({ tempoJaegerAuthConfig })
    Object.assign(errors, authErrors)
    return errors
  }

  if (source) {
    return url?.trim() ? {} : { url: 'URL is required' }
  }

  return {}
}
