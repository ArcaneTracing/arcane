"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationApi } from '@/api/conversation-config';
import { CreateConversationConfigurationRequest, UpdateConversationConfigurationRequest } from '@/types/conversation-configuration';
import { conversationsApi, ConversationSearchParams, ConversationByTracesParams, FullConversationParams } from '@/api/conversations';
import { useIsAuthenticated } from '@/hooks/useAuth';
import { useOrganisationIdOrNull } from '@/hooks/useOrganisation';

export function useConversationConfigurationsQuery() {
  const { isAuthenticated, isLoading: isAuthLoading } = useIsAuthenticated();
  const organisationId = useOrganisationIdOrNull();

  return useQuery({
    queryKey: ['conversationConfigurations', organisationId],
    queryFn: () => conversationApi.getAll(organisationId!),
    enabled: !!organisationId && isAuthenticated && !isAuthLoading
  });
}

export function useCreateConversationConfiguration() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: (data: CreateConversationConfigurationRequest) => conversationApi.create(organisationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversationConfigurations', organisationId] });
    }
  });
}

export function useUpdateConversationConfiguration() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ id, data }: {id: string;data: UpdateConversationConfigurationRequest;}) =>
    conversationApi.update(organisationId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversationConfigurations', organisationId] });
    }
  });
}

export function useDeleteConversationConfiguration() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: (id: string) => conversationApi.delete(organisationId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversationConfigurations', organisationId] });
    }
  });
}


export function useConversationsSearch() {
  return useMutation({
    mutationFn: (params: ConversationSearchParams) => conversationsApi.search(params)
  });
}

export function useConversationByTraces() {
  return useMutation({
    mutationFn: (params: ConversationByTracesParams) => conversationsApi.getConversationByTraces(params)
  });
}

export function useFullConversation() {
  return useMutation({
    mutationFn: (params: FullConversationParams) => conversationsApi.getFullConversation(params)
  });
}

export function useExportConversationConfigurations() {
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: () => conversationApi.export(organisationId!),
    onSuccess: (blob) => {

      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'conversation-configurations-export.yaml';
      document.body.appendChild(a);
      a.click();
      globalThis.URL.revokeObjectURL(url);
      a.remove();
    }
  });
}

export function useImportConversationConfigurations() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: (file: File) => conversationApi.import(organisationId!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversationConfigurations', organisationId] });
    }
  });
}