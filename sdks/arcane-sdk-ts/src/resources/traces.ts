import type { ArcaneClient } from '../client';
import type {
  TraceSearchResponse,
  TraceResponse,
  SearchTracesParams,
} from '../types';

export class TracesResource {
  constructor(private readonly client: ArcaneClient) {}

  async search(
    datasourceId: string,
    params?: SearchTracesParams
  ): Promise<TraceSearchResponse> {
    return this.client.post<TraceSearchResponse>(
      `/api/public/datasources/${datasourceId}/traces/search`,
      params ?? {}
    );
  }

  async get(datasourceId: string, traceId: string): Promise<TraceResponse> {
    return this.client.get<TraceResponse>(
      `/api/public/datasources/${datasourceId}/traces/${encodeURIComponent(traceId)}`
    );
  }

  async getAttributeNames(datasourceId: string): Promise<string[]> {
    return this.client.get<string[]>(
      `/api/public/datasources/${datasourceId}/traces/attributes`
    );
  }

  async getAttributeValues(
    datasourceId: string,
    attributeName: string
  ): Promise<string[]> {
    return this.client.get<string[]>(
      `/api/public/datasources/${datasourceId}/traces/attributes/${encodeURIComponent(attributeName)}/values`
    );
  }
}
