import api from './api';
import { ConversationResponse, FullConversationResponse, GetFullConversationRequest } from '@/types/conversations';
export interface ConversationSearchParams {
  organisationId: string;
  projectId: string;
  datasourceId: string;
  conversationConfigId: string;
  start?: string;
  end?: string;
}

export interface FullConversationParams {
  organisationId: string;
  projectId: string;
  datasourceId: string;
  conversationConfigId: string;
  value: string;
  start?: string;
  end?: string;
}

export interface ConversationByTracesParams {
  organisationId: string;
  projectId: string;
  datasourceId: string;
  traceIds: string[];
  start?: string;
  end?: string;
}

export const conversationsApi = {
  async search(
  params: ConversationSearchParams,
  signal?: AbortSignal)
  : Promise<ConversationResponse> {
    if (!params.organisationId || !params.projectId || !params.datasourceId || !params.conversationConfigId) {
      throw new Error('Organisation ID, Project ID, Datasource ID and Conversation Config ID are required');
    }


    const queryParams: Record<string, string> = {};

    if (params.start) {
      queryParams.start = params.start;
    }
    if (params.end) {
      queryParams.end = params.end;
    }

    const { data } = await api.get<ConversationResponse>(
      `/v1/organisations/${params.organisationId}/projects/${params.projectId}/datasources/${params.datasourceId}/conversations/config/${params.conversationConfigId}`,
      { params: Object.keys(queryParams).length > 0 ? queryParams : undefined, signal }
    );

    return data;
  },

  async getFullConversation(
  params: FullConversationParams,
  signal?: AbortSignal)
  : Promise<FullConversationResponse> {
    if (!params.organisationId || !params.projectId || !params.datasourceId || !params.conversationConfigId || !params.value) {
      throw new Error('Organisation ID, Project ID, Datasource ID, Conversation Config ID, and value are required');
    }


    if (!params.start || !params.end) {
      throw new Error('Start and end parameters are required for Tempo trace search');
    }

    const requestBody: GetFullConversationRequest = {
      value: params.value,
      start: params.start,
      end: params.end
    };

    const { data } = await api.post<FullConversationResponse>(
      `/v1/organisations/${params.organisationId}/projects/${params.projectId}/datasources/${params.datasourceId}/conversations/config/${params.conversationConfigId}/full`,
      requestBody,
      { signal }
    );

    return data;
  },

  async getConversationByTraces(
  params: ConversationByTracesParams,
  signal?: AbortSignal)
  : Promise<FullConversationResponse> {
    if (!params.organisationId || !params.projectId || !params.datasourceId || !params.traceIds || params.traceIds.length === 0) {
      throw new Error('Organisation ID, Project ID, Datasource ID, and traceIds are required');
    }


    const searchParams = new URLSearchParams();
    params.traceIds.forEach((id) => searchParams.append('traceIds', id));
    if (params.start) searchParams.append('startDate', params.start);
    if (params.end) searchParams.append('endDate', params.end);
    const queryString = searchParams.toString();

    const suffix = queryString ? '?' + queryString : '';
    const url = `/v1/organisations/${params.organisationId}/projects/${params.projectId}/datasources/${params.datasourceId}/conversations/by-traces${suffix}`;

    const { data } = await api.get<FullConversationResponse>(url, { signal });

    return data;
  }
};