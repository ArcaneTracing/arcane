import api from './api';
import {
  AnnotationQueueResponse,
  AnnotationQueueListItemResponse,
  CreateAnnotationQueueRequest,
  UpdateAnnotationQueueRequest,
  AnnotationTemplateResponse,
  AnnotationResponse,
  CreateAnnotationRequest,
  UpdateAnnotationRequest,
  QueuedTraceResponse,
  QueuedConversationResponse,
  EnqueueTraceRequest,
  EnqueueTraceBulkRequest,
  BulkQueueTraceResponse,
  EnqueueConversationRequest } from
'@/types/annotation-queue';
import { AnnotationQueueType } from '@/types/enums';
import { otlpBase64TraceIdToHexBrowser } from '@/lib/trace-utils';

export const annotationQueuesApi = {
  async getAll(organisationId: string, projectId: string, type: AnnotationQueueType, signal?: AbortSignal): Promise<AnnotationQueueListItemResponse[]> {
    const { data } = await api.get<AnnotationQueueListItemResponse[]>(
      `/v1/organisations/${organisationId}/projects/${projectId}/queues`,
      { params: { type }, signal }
    );
    return Array.isArray(data) ? data : [];
  },

  async getById(organisationId: string, projectId: string, queueId: string, signal?: AbortSignal): Promise<AnnotationQueueResponse> {
    const { data } = await api.get<AnnotationQueueResponse>(`/v1/organisations/${organisationId}/projects/${projectId}/queues/${queueId}`, { signal });
    return data;
  },

  async create(organisationId: string, projectId: string, data: CreateAnnotationQueueRequest): Promise<AnnotationQueueResponse> {
    const { data: queue } = await api.post<AnnotationQueueResponse>(`/v1/organisations/${organisationId}/projects/${projectId}/queues`, data);
    return queue;
  },

  async update(organisationId: string, projectId: string, queueId: string, data: UpdateAnnotationQueueRequest): Promise<AnnotationQueueResponse> {
    const { data: queue } = await api.put<AnnotationQueueResponse>(`/v1/organisations/${organisationId}/projects/${projectId}/queues/${queueId}`, data);
    return queue;
  },

  async delete(organisationId: string, projectId: string, queueId: string): Promise<void> {
    await api.delete(`/v1/organisations/${organisationId}/projects/${projectId}/queues/${queueId}`);
  },


  async getTemplate(organisationId: string, projectId: string, queueId: string, signal?: AbortSignal): Promise<AnnotationTemplateResponse> {
    const { data } = await api.get<AnnotationTemplateResponse>(`/v1/organisations/${organisationId}/projects/${projectId}/queues/${queueId}/template`, { signal });
    return data;
  },


  async createAnnotation(organisationId: string, projectId: string, queueId: string, data: CreateAnnotationRequest): Promise<AnnotationResponse> {
    const { data: annotation } = await api.post<AnnotationResponse>(`/v1/organisations/${organisationId}/projects/${projectId}/queues/${queueId}/annotations`, data);
    return annotation;
  },

  async updateAnnotation(
  organisationId: string,
  projectId: string,
  queueId: string,
  annotationId: string,
  data: UpdateAnnotationRequest)
  : Promise<AnnotationResponse> {
    const { data: annotation } = await api.put<AnnotationResponse>(`/v1/organisations/${organisationId}/projects/${projectId}/queues/${queueId}/annotations/${annotationId}`, data);
    return annotation;
  },

  async deleteAnnotation(organisationId: string, projectId: string, queueId: string, annotationId: string): Promise<void> {
    await api.delete(`/v1/organisations/${organisationId}/projects/${projectId}/queues/${queueId}/annotations/${annotationId}`);
  },


  async addTrace(
  organisationId: string,
  projectId: string,
  queueId: string,
  data: EnqueueTraceRequest)
  : Promise<QueuedTraceResponse> {
    const { data: result } = await api.post<QueuedTraceResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/queues/${queueId}/traces`,
      data
    );
    return result;
  },

  async addTracesBulk(
  organisationId: string,
  projectId: string,
  queueId: string,
  data: EnqueueTraceBulkRequest)
  : Promise<BulkQueueTraceResponse> {
    const { data: result } = await api.post<BulkQueueTraceResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/queues/${queueId}/traces/bulk`,
      data
    );
    return result;
  },

  async removeTrace(organisationId: string, projectId: string, queueId: string, otelTraceId: string): Promise<void> {
    await api.delete(`/v1/organisations/${organisationId}/projects/${projectId}/queues/${queueId}/traces/${otelTraceId}`);
  },

  async removeTraceById(organisationId: string, projectId: string, queueId: string, id: string): Promise<void> {
    await api.delete(`/v1/organisations/${organisationId}/projects/${projectId}/queues/${queueId}/traces/by-id/${id}`);
  },


  async addConversation(
  organisationId: string,
  projectId: string,
  queueId: string,
  data: EnqueueConversationRequest,
  options?: {decodeTraceIds?: boolean;})
  : Promise<QueuedConversationResponse> {
    const rawTraceIds = data?.otelTraceIds ?? [];
    const processedData: EnqueueConversationRequest =
    options?.decodeTraceIds === true ?
    {
      ...data,
      otelTraceIds: rawTraceIds.map((traceId) => {
        try {
          return otlpBase64TraceIdToHexBrowser(traceId);
        } catch (error) {
          console.warn(`Failed to decode traceId ${traceId}, using as-is:`, error);
          return traceId;
        }
      })
    } :
    { ...data, otelTraceIds: rawTraceIds };

    const { data: result } = await api.post<QueuedConversationResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/queues/${queueId}/conversations`,
      processedData
    );
    return result;
  },

  async removeConversation(organisationId: string, projectId: string, queueId: string, id: string): Promise<void> {
    await api.delete(`/v1/organisations/${organisationId}/projects/${projectId}/queues/${queueId}/conversations/${id}`);
  }
};