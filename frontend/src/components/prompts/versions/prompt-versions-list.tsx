"use client";

import { PromptVersionResponse } from "@/types/prompts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowUpCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation";
import { usePromoteVersion } from "@/hooks/prompts/use-prompts-query";
import { needsModelConfigFetch, fetchModelConfig } from "./prompt-versions-list-utils";
import type { ModelConfigurationResponse } from "@/types/model-configuration";

interface PromptVersionsListProps {
  promptId: string;
  promptIdentifier: string;
  versions: PromptVersionResponse[];
  promotedVersionId: string | null;
  projectId: string;
  onEditVersion?: (versionId: string) => void;
}

type ModelConfigBadgeProps = {
  isLoading: boolean;
  config: ModelConfigurationResponse | undefined;
};

function ModelConfigBadge({ isLoading, config }: Readonly<ModelConfigBadgeProps>) {
  if (isLoading) return <Badge variant="outline" className="text-xs">Loading...</Badge>;
  if (config) return <Badge variant="outline" className="text-xs">{config.name} ({config.configuration.modelName})</Badge>;
  return <Badge variant="outline" className="text-xs">Unknown Config</Badge>;
}

function processVersionForFetch(
version: PromptVersionResponse,
organisationId: string,
fetchedRef: React.RefObject<Set<string>>,
setLoading: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
setModelConfigs: React.Dispatch<React.SetStateAction<Record<string, ModelConfigurationResponse>>>)
: void {
  if (!fetchedRef.current || !needsModelConfigFetch(version, fetchedRef.current)) return;

  const configId = version.modelConfigurationId;
  fetchedRef.current.add(configId);
  setLoading((prev) => ({ ...prev, [configId]: true }));

  fetchModelConfig(
    organisationId,
    configId,
    (config: ModelConfigurationResponse) => setModelConfigs((prev) => ({ ...prev, [configId]: config })),
    () => {

    },
    () => setLoading((prev) => ({ ...prev, [configId]: false }))
  );
}

export function PromptVersionsList({ promptId, promptIdentifier, versions, promotedVersionId, projectId, onEditVersion }: Readonly<PromptVersionsListProps>) {
  const organisationId = useOrganisationIdOrNull();
  const promoteMutation = usePromoteVersion(projectId, promptIdentifier);
  const [modelConfigs, setModelConfigs] = useState<Record<string, ModelConfigurationResponse>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const fetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!organisationId) return;
    for (const version of versions) {
      processVersionForFetch(version, organisationId, fetchedRef, setLoading, setModelConfigs);
    }
  }, [versions, organisationId]);

  if (versions.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
        No versions found
      </div>);

  }

  return (
    <div className="space-y-4">
      {versions.map((version) => {
        const config = modelConfigs[version.modelConfigurationId];
        const isLoading = loading[version.modelConfigurationId];

        return (
          <Card key={version.id} className="border-gray-100 dark:border-[#2A2A2A]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {version.versionName !== undefined && version.versionName !== null ? `Version ${version.versionName}` : `Version ${version.id}`}
                    {promotedVersionId === version.id &&
                    <Badge variant="secondary" className="text-xs">Promoted</Badge>
                    }
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {version.description || 'No description'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <ModelConfigBadge isLoading={isLoading} config={config} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => promoteMutation.mutate(version.id)}
                    disabled={promoteMutation.isPending || promotedVersionId === version.id}
                    title={promotedVersionId === version.id ? 'Already promoted' : 'Promote as latest'}>

                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    {promoteMutation.isPending && promoteMutation.variables === version.id ? 'Promoting...' : 'Promote'}
                  </Button>
                  {onEditVersion &&
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditVersion(version.id)}>

                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  }
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Template Format:</span> {version.templateFormat}
                  </div>
                  <div>
                    <span className="font-medium">Template Type:</span> {version.templateType}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {new Date(version.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {new Date(version.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>);

      })}
    </div>);

}