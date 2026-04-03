"use client";

import { useMutation } from "@tanstack/react-query";
import { useOrganisationId } from "@/hooks/useOrganisation";
import api from "@/api/api";
import { DatasourceSource } from "@/types/enums";

export interface TestConnectionParams {
  datasourceId?: string;
  url?: string;
  source: DatasourceSource;
  config?: Record<string, any>;
}

export function useTestDatasourceConnection() {
  const organisationId = useOrganisationId();

  return useMutation({
    mutationFn: async (params: TestConnectionParams) => {
      const endpoint = params.datasourceId
        ? `/v1/organisations/${organisationId}/datasources/${params.datasourceId}/test-connection`
        : `/v1/organisations/${organisationId}/datasources/test-connection`;
      
      const response = await api.post(endpoint, {
        url: params.url,
        source: params.source,
        config: params.config,
      });
      
      return response.data as { success: boolean; message: string };
    },
  });
}
