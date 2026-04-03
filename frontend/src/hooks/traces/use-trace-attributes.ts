import { useQuery } from '@tanstack/react-query';
import { tracesApi } from '@/api/traces';
import { useOrganisationIdOrNull } from '@/hooks/useOrganisation';

export interface UseTraceAttributeNamesOptions {
  organisationId: string | undefined;
  projectId: string | undefined;
  datasourceId: string | undefined;
  enabled: boolean;
}

export function useTraceAttributeNames({
  organisationId,
  projectId,
  datasourceId,
  enabled
}: UseTraceAttributeNamesOptions) {
  const actualOrganisationId = organisationId || useOrganisationIdOrNull();

  return useQuery({
    queryKey: ['trace-attributes', actualOrganisationId, projectId, datasourceId],
    queryFn: async () => {
      if (!actualOrganisationId || !projectId || !datasourceId) {
        throw new Error('Organisation ID, Project ID, and Datasource ID are required');
      }
      return tracesApi.getAttributes(actualOrganisationId, projectId, datasourceId);
    },
    enabled:
    enabled &&
    !!actualOrganisationId &&
    !!projectId &&
    !!datasourceId &&
    typeof datasourceId === 'string' &&
    datasourceId.trim() !== '',
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {

      if (error?.response?.status === 400) {
        return false;
      }
      return failureCount < 2;
    }
  });
}

export interface UseTraceAttributeValuesOptions {
  organisationId: string | undefined;
  projectId: string | undefined;
  datasourceId: string | undefined;
  attributeName: string | undefined;
  enabled: boolean;
}

export function useTraceAttributeValues({
  organisationId,
  projectId,
  datasourceId,
  attributeName,
  enabled
}: UseTraceAttributeValuesOptions) {
  const actualOrganisationId = organisationId || useOrganisationIdOrNull();

  return useQuery({
    queryKey: ['trace-attribute-values', actualOrganisationId, projectId, datasourceId, attributeName],
    queryFn: async () => {
      if (!actualOrganisationId || !projectId || !datasourceId || !attributeName) {
        throw new Error('Organisation ID, Project ID, Datasource ID, and Attribute Name are required');
      }
      return tracesApi.getAttributeValues(actualOrganisationId, projectId, datasourceId, attributeName);
    },
    enabled:
    enabled &&
    !!actualOrganisationId &&
    !!projectId &&
    !!datasourceId &&
    !!attributeName &&
    typeof datasourceId === 'string' &&
    datasourceId.trim() !== '' &&
    typeof attributeName === 'string' &&
    attributeName.trim() !== '',
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {

      if (error?.response?.status === 400) {
        return false;
      }
      return failureCount < 2;
    }
  });
}