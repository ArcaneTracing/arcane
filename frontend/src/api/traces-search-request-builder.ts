import type { TraceSearchParams } from './traces'

type TraceSearchRequestBody = {
  start: string
  end: string
  q?: string
  attributes?: string
  serviceName?: string
  operationName?: string
  minDuration?: number
  maxDuration?: number
  limit?: number
}

type Duration = number | string | undefined
type Limit = number | string | undefined
type PossibleString = string | undefined
export class TraceSearchRequestBuilder {
  private readonly body: TraceSearchRequestBody

  constructor(start: string, end: string) {
    this.body = { start, end }
  }

  withQuery(q: PossibleString): this {
    if (q !== undefined && q !== '') {
      this.body.q = q
    }
    return this
  }

  withAttributes(attributes: PossibleString): this {
    if (attributes !== undefined && attributes !== '') {
      this.body.attributes = attributes
    }
    return this
  }

  withServiceName(serviceName: PossibleString): this {
    if (serviceName !== undefined && serviceName !== '') {
      this.body.serviceName = serviceName
    }
    return this
  }

  withOperationName(operationName: PossibleString): this {
    if (operationName !== undefined && operationName !== '') {
      this.body.operationName = operationName
    }
    return this
  }

  withMinDuration(minDuration: Duration): this {
    if (minDuration !== undefined && minDuration !== '') {
      this.body.minDuration =
        typeof minDuration === 'string'
          ? Number.parseFloat(minDuration)
          : minDuration
    }
    return this
  }

  withMaxDuration(maxDuration: Duration): this {
    if (maxDuration !== undefined && maxDuration !== '') {
      this.body.maxDuration =
        typeof maxDuration === 'string'
          ? Number.parseFloat(maxDuration)
          : maxDuration
    }
    return this
  }

  withLimit(limit: Limit): this {
    if (limit !== undefined && limit !== '') {
      this.body.limit = Number.parseInt(String(limit)) || 20
    }
    return this
  }

  build(): TraceSearchRequestBody {
    return this.body
  }
}

export function buildTraceSearchRequest(params: TraceSearchParams): TraceSearchRequestBody {
  return new TraceSearchRequestBuilder(params.start, params.end)
    .withQuery(params.q)
    .withAttributes(params.attributes)
    .withServiceName(params.serviceName)
    .withOperationName(params.operationName)
    .withMinDuration(params.minDuration)
    .withMaxDuration(params.maxDuration)
    .withLimit(params.limit)
    .build()
}
