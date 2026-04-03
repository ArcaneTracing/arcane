"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { datasetsApi } from '@/api/datasets';
import { CreateDatasetRequest, UpdateDatasetRequest, UpsertRowToDatasetRequest } from '@/types/datasets';
import { useOrganisationIdOrNull } from '@/hooks/useOrganisation';
import { PaginationQuery } from '@/types/pagination';

export function useDatasetsQuery(projectId: string | undefined) {
  const organisationId = useOrganisationIdOrNull();

  return useQuery({
    queryKey: ['datasets', organisationId, projectId],
    queryFn: () => datasetsApi.getAll(organisationId!, projectId!),
    enabled: !!organisationId && !!projectId
  });
}

export function useDatasetQuery(
projectId: string | undefined,
datasetId: string | undefined,
paginationQuery?: PaginationQuery)
{
  const organisationId = useOrganisationIdOrNull();

  return useQuery({
    queryKey: ['dataset', organisationId, projectId, datasetId, paginationQuery],
    queryFn: () => datasetsApi.getById(organisationId!, projectId!, datasetId!, paginationQuery),
    enabled: !!organisationId && !!projectId && !!datasetId
  });
}

export function useCreateDataset(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: (data: CreateDatasetRequest) => datasetsApi.create(organisationId!, projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets', organisationId, projectId] });
    }
  });
}

export function useUpdateDataset(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ id, data }: {id: string;data: UpdateDatasetRequest;}) =>
    datasetsApi.update(organisationId!, projectId!, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['datasets', organisationId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['dataset', organisationId, projectId, variables.id] });
    }
  });
}

export function useDeleteDataset(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: (id: string) => datasetsApi.delete(organisationId!, projectId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets', organisationId, projectId] });
    }
  });
}

export function useDatasetHeaderQuery(projectId: string | undefined, datasetId: string | undefined) {
  const organisationId = useOrganisationIdOrNull();

  return useQuery({
    queryKey: ['datasetHeader', organisationId, projectId, datasetId],
    queryFn: () => datasetsApi.getHeader(organisationId!, projectId!, datasetId!),
    enabled: !!organisationId && !!projectId && !!datasetId
  });
}

export function useUpsertDatasetRow(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ datasetId, data }: {datasetId: string;data: UpsertRowToDatasetRequest;}) =>
    datasetsApi.upsertRow(organisationId!, projectId!, datasetId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dataset', organisationId, projectId, variables.datasetId] });
      queryClient.invalidateQueries({ queryKey: ['datasetHeader', organisationId, projectId, variables.datasetId] });
    }
  });
}

export function useImportDataset(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ file, name, description }: {file: File;name: string;description?: string;}) =>
    datasetsApi.import(organisationId!, projectId!, file, name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets', organisationId, projectId] });
    }
  });
}

export function useExportDataset(projectId: string | undefined, datasetId: string | undefined) {
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: () => datasetsApi.export(organisationId!, projectId!, datasetId!),
    onSuccess: ({ blob, filename }) => {

      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      globalThis.URL.revokeObjectURL(url);
      a.remove();
    }
  });
}