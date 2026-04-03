"use client";

import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { annotationQueuesApi } from '@/api/annotation-queues';
import type { CreateAnnotationQueueRequest, UpdateAnnotationQueueRequest, CreateAnnotationRequest, UpdateAnnotationRequest } from '@/types/annotation-queue';
import { AnnotationQueueListItemResponse, AnnotationQueueType } from '@/types';
import { useOrganisationIdOrNull } from '@/hooks/useOrganisation';

export function useAnnotationQueuesQuery(projectId: string | undefined, type: AnnotationQueueType): UseQueryResult<AnnotationQueueListItemResponse[], Error> {
  const organisationId = useOrganisationIdOrNull();

  return useQuery({
    queryKey: ['annotationQueues', organisationId, projectId, type],
    queryFn: () => annotationQueuesApi.getAll(organisationId!, projectId!, type),
    enabled: !!organisationId && !!projectId
  });
}


export const useAnnotationQueuesByTypeQuery = useAnnotationQueuesQuery;

export function useAnnotationQueueQuery(projectId: string | undefined, queueId: string | undefined) {
  const organisationId = useOrganisationIdOrNull();

  return useQuery({
    queryKey: ['annotationQueue', organisationId, projectId, queueId],
    queryFn: () => annotationQueuesApi.getById(organisationId!, projectId!, queueId!),
    enabled: !!organisationId && !!projectId && !!queueId
  });
}

export function useCreateAnnotationQueue(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: (data: CreateAnnotationQueueRequest) => annotationQueuesApi.create(organisationId!, projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotationQueues', organisationId, projectId] });
    }
  });
}

export function useUpdateAnnotationQueue(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ queueId, data }: {queueId: string;data: UpdateAnnotationQueueRequest;}) =>
    annotationQueuesApi.update(organisationId!, projectId!, queueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotationQueues', organisationId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['annotationQueue', organisationId, projectId] });
    }
  });
}

export function useDeleteAnnotationQueue(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: (queueId: string) => annotationQueuesApi.delete(organisationId!, projectId!, queueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotationQueues', organisationId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['annotationQueue', organisationId, projectId] });
    }
  });
}


export function useAnnotationTemplateQuery(projectId: string | undefined, queueId: string | undefined) {
  const organisationId = useOrganisationIdOrNull();

  return useQuery({
    queryKey: ['annotationTemplate', organisationId, projectId, queueId],
    queryFn: () => annotationQueuesApi.getTemplate(organisationId!, projectId!, queueId!),
    enabled: !!organisationId && !!projectId && !!queueId
  });
}


export function useCreateAnnotation(projectId: string | undefined, queueId: string | undefined) {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: (data: CreateAnnotationRequest) => annotationQueuesApi.createAnnotation(organisationId!, projectId!, queueId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotationTemplate', organisationId, projectId, queueId] });
      queryClient.invalidateQueries({ queryKey: ['annotationQueue', organisationId, projectId, queueId] });
    }
  });
}

export function useUpdateAnnotation(projectId: string | undefined, queueId: string | undefined) {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ annotationId, data }: {annotationId: string;data: UpdateAnnotationRequest;}) =>
    annotationQueuesApi.updateAnnotation(organisationId!, projectId!, queueId!, annotationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotationTemplate', organisationId, projectId, queueId] });
      queryClient.invalidateQueries({ queryKey: ['annotationQueue', organisationId, projectId, queueId] });
    }
  });
}

export function useDeleteAnnotation(projectId: string | undefined, queueId: string | undefined) {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: (annotationId: string) => annotationQueuesApi.deleteAnnotation(organisationId!, projectId!, queueId!, annotationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotationTemplate', organisationId, projectId, queueId] });
      queryClient.invalidateQueries({ queryKey: ['annotationQueue', organisationId, projectId, queueId] });
    }
  });
}


export function useAddTrace(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ queueId, data }: {queueId: string;data: {otelTraceId: string;datasourceId: string;startDate?: string;endDate?: string;};}) =>
    annotationQueuesApi.addTrace(organisationId!, projectId!, queueId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['annotationQueue', organisationId, projectId, variables.queueId] });
    }
  });
}

export function useAddTracesBulk(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ queueId, data }: {queueId: string;data: {otelTraceIds: string[];datasourceId: string;startDate?: string;endDate?: string;};}) => {
      return annotationQueuesApi.addTracesBulk(organisationId!, projectId!, queueId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['annotationQueue', organisationId, projectId, variables.queueId] });
    }
  });
}

export function useRemoveTrace(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ queueId, otelTraceId }: {queueId: string;otelTraceId: string;}) =>
    annotationQueuesApi.removeTrace(organisationId!, projectId!, queueId, otelTraceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['annotationQueue', organisationId, projectId, variables.queueId] });
    }
  });
}

export function useRemoveTraceById(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ queueId, queueTraceId }: {queueId: string;queueTraceId: string;}) =>
    annotationQueuesApi.removeTraceById(organisationId!, projectId!, queueId, queueTraceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['annotationQueue', organisationId, projectId, variables.queueId] });
    }
  });
}


export function useAddConversation(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ queueId, data, decodeTraceIds
    }: {queueId: string;data: {conversationConfigId: string;datasourceId: string;otelConversationId: string;otelTraceIds: string[];startDate?: string;endDate?: string;};decodeTraceIds?: boolean;}) => annotationQueuesApi.addConversation(organisationId!, projectId!, queueId, data, { decodeTraceIds }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['annotationQueue', organisationId, projectId, variables.queueId] });
    }
  });
}

export function useRemoveConversation(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ queueId, id }: {queueId: string;id: string;}) =>
    annotationQueuesApi.removeConversation(organisationId!, projectId!, queueId, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['annotationQueue', organisationId, projectId, variables.queueId] });
    }
  });
}