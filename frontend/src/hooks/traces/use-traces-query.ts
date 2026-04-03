"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tracesApi, TraceSearchParams } from '@/api/traces';
import { useOrganisationIdOrNull } from '@/hooks/useOrganisation';

export function useTracesSearchQuery(
projectId: string | undefined,
datasourceId: string | undefined,
params: TraceSearchParams,
enabled: boolean = true)
{
  const organisationId = useOrganisationIdOrNull();

  return useQuery({
    queryKey: ['traces', organisationId, projectId, datasourceId, params],
    queryFn: () => tracesApi.search(organisationId!, projectId!, datasourceId!, params),
    enabled: enabled && !!organisationId && !!projectId && !!datasourceId && typeof datasourceId === 'string' && datasourceId.trim() !== '' && !!params.start && !!params.end,
    staleTime: 0,
    gcTime: 0
  });
}

export function useTraceQuery(
projectId: string | undefined,
datasourceId: string | undefined,
traceId: string | undefined)
{
  const organisationId = useOrganisationIdOrNull();

  return useQuery({
    queryKey: ['trace', organisationId, projectId, datasourceId, traceId],
    queryFn: () => tracesApi.getById(organisationId!, projectId!, datasourceId!, traceId!),
    enabled: !!organisationId && !!projectId && !!datasourceId && typeof datasourceId === 'string' && datasourceId.trim() !== '' && !!traceId
  });
}


export function useSearchTracesMutation() {
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ projectId, datasourceId, params }: {projectId: string;datasourceId: string;params: TraceSearchParams;}) => {
      if (!organisationId || !projectId || !datasourceId || typeof datasourceId !== 'string' || datasourceId.trim() === '' || !params.start || !params.end) {
        throw new Error('Organisation ID, Project ID, Datasource ID, Start date, and End date are required');
      }
      return tracesApi.search(organisationId, projectId, datasourceId, params);
    }
  });
}

export function useFetchTraceMutation() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ projectId, datasourceId, traceId }: {projectId: string;datasourceId: string;traceId: string;}) => {
      if (!organisationId || !projectId || !datasourceId || typeof datasourceId !== 'string' || datasourceId.trim() === '' || !traceId || traceId.trim() === '') {
        throw new Error('Organisation ID, Project ID, Datasource ID, and Trace ID are required');
      }
      return tracesApi.getById(organisationId, projectId, datasourceId, traceId);
    },
    onSuccess: (result, variables) => {
      queryClient.setQueryData(['trace', organisationId, variables.projectId, variables.datasourceId, variables.traceId], result);
    }
  });
}