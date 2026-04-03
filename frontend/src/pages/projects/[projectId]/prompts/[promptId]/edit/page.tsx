import { useParams, useNavigate, useLocation } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PromptForm } from "@/components/prompts/forms/prompt-form";
import { promptsApi } from "@/api/prompts";
import { useEffect, useState } from "react";
import { PromptResponse, PromptVersionResponse } from "@/types/prompts";
import { PagePermissionGuard } from "@/components/PagePermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import ForbiddenPage from "@/pages/forbidden/page";

function EditPromptPageContent() {
  const { projectId, organisationId, promptId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/prompts/$promptId/edit", strict: false });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const versionId = searchParams.get('versionId');

  const [prompt, setPrompt] = useState<PromptResponse | null>(null);
  const [promptLoading, setPromptLoading] = useState(true);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [version, setVersion] = useState<PromptVersionResponse | null>(null);
  const [versionLoading, setVersionLoading] = useState(false);
  const [versionError, setVersionError] = useState<string | null>(null);

  const handleSaveSuccess = async () => {
    if (!organisationId || !projectId || !promptId) return;
    const queryKey = (base: string[]) => [...base, organisationId, projectId, promptId] as const;

    await queryClient.invalidateQueries({ queryKey: queryKey(['promptVersions']) });
    await queryClient.invalidateQueries({ queryKey: queryKey(['latestPromptVersion']) });
    await queryClient.invalidateQueries({ queryKey: queryKey(['prompt']) });
    await queryClient.invalidateQueries({ queryKey: ['prompts', organisationId, projectId] });

    await Promise.all([
    queryClient.fetchQuery({
      queryKey: queryKey(['promptVersions']),
      queryFn: () => promptsApi.listVersions(organisationId, projectId, promptId),
      staleTime: 0
    }),
    queryClient.fetchQuery({
      queryKey: queryKey(['latestPromptVersion']),
      queryFn: () => promptsApi.getLatestVersion(organisationId, projectId, promptId),
      staleTime: 0
    }),
    queryClient.fetchQuery({
      queryKey: queryKey(['prompt']),
      queryFn: () => promptsApi.getById(organisationId, projectId, promptId),
      staleTime: 0
    })]
    );
    navigate({
      to: "/organisations/$organisationId/projects/$projectId/prompts/$promptId",
      params: { organisationId, projectId, promptId }
    });
  };


  useEffect(() => {
    if (organisationId && projectId && promptId) {
      setPromptLoading(true);
      setPromptError(null);
      promptsApi.list(organisationId, projectId).
      then((prompts) => {
        const foundPrompt = prompts.find((p) => p.id === promptId);
        if (foundPrompt) {
          setPrompt(foundPrompt);
        } else {
          setPromptError('Prompt not found');
        }
      }).
      catch((err: unknown) => {
        setPromptError(err instanceof Error ? err.message : 'Failed to load prompt');
      }).
      finally(() => setPromptLoading(false));
    }
  }, [organisationId, projectId, promptId]);


  useEffect(() => {
    if (organisationId && projectId && promptId) {
      setVersionLoading(true);
      setVersionError(null);

      if (versionId) {

        promptsApi.getVersionById(organisationId, projectId, versionId).
        then(setVersion).
        catch((err) => {
          setVersionError(err instanceof Error ? err.message : 'Failed to load version');
        }).
        finally(() => setVersionLoading(false));
      } else {

        promptsApi.getLatestVersion(organisationId, projectId, promptId).
        then(setVersion).
        catch((err) => {
          setVersionError(err instanceof Error ? err.message : 'Failed to load latest version');
        }).
        finally(() => setVersionLoading(false));
      }
    }
  }, [organisationId, versionId, projectId, promptId]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-[#2A2A2A]">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/organisations/$organisationId/projects/$projectId/prompts", params: { organisationId, projectId } })}
          className="mb-4">

          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Prompts
        </Button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        {(() => {
          if (promptLoading || versionLoading) {
            return (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin" />
              </div>);

          }
          if (promptError || versionError) {
            return (
              <div className="text-sm text-red-500 dark:text-red-400">
                Error: {promptError || versionError}
              </div>);

          }
          if (!prompt) {
            return (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Prompt not found
              </div>);

          }
          return <PromptForm prompt={prompt} projectId={projectId} version={version} onSuccess={handleSaveSuccess} />;
        })()}
      </div>
    </div>);

}

export default function EditPromptPage() {
  return (
    <PagePermissionGuard permission={PERMISSIONS.PROMPT.UPDATE} fallback={<ForbiddenPage />}>
      <EditPromptPageContent />
    </PagePermissionGuard>);

}