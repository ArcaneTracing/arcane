import api from './api';
import { TempoTraceSearchResponse, TempoTraceResponse } from '@/types/traces';
import { buildTraceSearchRequest } from './traces-search-request-builder';

export interface TraceSearchParams {
  start: string;
  end: string;
  q?: string;
  attributes?: string;
  serviceName?: string;
  operationName?: string;
  minDuration?: number | string;
  maxDuration?: number | string;
  limit?: number | string;

}

export const tracesApi = {
  async search(
  organisationId: string,
  projectId: string,
  datasourceId: string,
  params: TraceSearchParams,
  signal?: AbortSignal)
  : Promise<TempoTraceSearchResponse> {
    if (!organisationId || !projectId || !datasourceId) {
      throw new Error('Organisation ID, Project ID and Datasource ID are required');
    }
    if (!params.start || !params.end) {
      throw new Error('Start and End dates are required');
    }

    const requestBody = buildTraceSearchRequest(params);

    const { data } = await api.post<TempoTraceSearchResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/datasources/${datasourceId}/traces/search`,
      requestBody,
      { signal }
    );

    return data;
  },

  async getById(
  organisationId: string,
  projectId: string,
  datasourceId: string,
  traceId: string,
  signal?: AbortSignal)
  : Promise<TempoTraceResponse> {
    if (!organisationId || !projectId || !datasourceId || !traceId) {
      throw new Error('Organisation ID, Project ID, Datasource ID, and Trace ID are required');
    }

    const { data } = await api.get<TempoTraceResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/datasources/${datasourceId}/traces/${traceId}`,
      { signal }
    );

    return data;
  },

  async getAttributes(
  organisationId: string,
  projectId: string,
  datasourceId: string,
  signal?: AbortSignal)
  : Promise<string[]> {
    if (!organisationId || !projectId || !datasourceId) {
      throw new Error('Organisation ID, Project ID and Datasource ID are required');
    }

    const { data } = await api.get<string[]>(
      `/v1/organisations/${organisationId}/projects/${projectId}/datasources/${datasourceId}/traces/attributes`,
      { signal }
    );
    return Array.isArray(data) ? data : [];
  },

  async getAttributeValues(
  organisationId: string,
  projectId: string,
  datasourceId: string,
  attributeName: string,
  signal?: AbortSignal)
  : Promise<string[]> {
    if (!organisationId || !projectId || !datasourceId || !attributeName) {
      throw new Error('Organisation ID, Project ID, Datasource ID, and Attribute Name are required');
    }

    const { data } = await api.get<string[]>(
      `/v1/organisations/${organisationId}/projects/${projectId}/datasources/${datasourceId}/traces/attributes/${encodeURIComponent(attributeName)}/values`,
      { signal }
    );
    return Array.isArray(data) ? data : [];
  }
};