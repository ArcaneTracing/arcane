"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entitiesApi } from '@/api/entities';
import { CreateEntityRequest, UpdateEntityRequest } from '@/types/entities';
import { useOrganisationIdOrNull } from '@/hooks/useOrganisation';

export function useEntitiesQuery() {
  const organisationId = useOrganisationIdOrNull();

  return useQuery({
    queryKey: ['entities', organisationId],
    queryFn: () => entitiesApi.getAll(organisationId!),
    enabled: !!organisationId
  });
}

export function useCreateEntity() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: (data: CreateEntityRequest) => entitiesApi.create(organisationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities', organisationId] });
    }
  });
}

export function useUpdateEntity() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ id, data }: {id: string;data: UpdateEntityRequest;}) =>
    entitiesApi.update(organisationId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities', organisationId] });
    }
  });
}

export function useDeleteEntity() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: (id: string) => entitiesApi.delete(organisationId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities', organisationId] });
    }
  });
}

export function useExportEntities() {
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: () => entitiesApi.export(organisationId!),
    onSuccess: (blob) => {

      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'entities-export.yaml';
      document.body.appendChild(a);
      a.click();
      globalThis.URL.revokeObjectURL(url);
      a.remove();
    }
  });
}

export function useImportEntities() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: (file: File) => entitiesApi.import(organisationId!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities', organisationId] });
    }
  });
}