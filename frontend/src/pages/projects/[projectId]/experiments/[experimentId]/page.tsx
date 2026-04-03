import { useParams, useNavigate, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Play, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { experimentsApi } from "@/api/experiments";
import { ExperimentResponse } from "@/types/experiments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExperimentResultsList } from "@/components/experiments/results/experiment-results-list";
import { useDeleteExperiment, useRerunExperiment } from "@/hooks/experiments/use-experiments-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle } from
"@/components/ui/alert-dialog";
import { promptsApi } from "@/api/prompts";
import { PromptVersionResponse } from "@/types/prompts";
import { datasetsApi } from "@/api/datasets";
import { DatasetResponse } from "@/types/datasets";
import { PagePermissionGuard } from "@/components/PagePermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import ForbiddenPage from "@/pages/forbidden/page";

function ExperimentDetailPageContent() {
  const { projectId, organisationId, experimentId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/experiments/$experimentId", strict: false });
  const navigate = useNavigate();

  const [experiment, setExperiment] = useState<ExperimentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rerunDialogOpen, setRerunDialogOpen] = useState(false);
  const [promptVersion, setPromptVersion] = useState<PromptVersionResponse | null>(null);
  const [dataset, setDataset] = useState<DatasetResponse | null>(null);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const deleteMutation = useDeleteExperiment(projectId);
  const rerunMutation = useRerunExperiment(projectId);

  useEffect(() => {
    if (organisationId && projectId && experimentId) {
      setIsLoading(true);
      setError(null);
      experimentsApi.get(organisationId, projectId, experimentId).
      then((data) => {
        setExperiment(data);
      }).
      catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load experiment');
      }).
      finally(() => setIsLoading(false));
    }
  }, [organisationId, projectId, experimentId]);


  useEffect(() => {
    if (experiment && organisationId && projectId) {
      setLoadingRelated(true);


      const fetchPromptVersion = promptsApi.getVersionById(organisationId, projectId, experiment.promptVersionId).
      then((version) => {
        setPromptVersion(version);
      }).
      catch((err) => {
        console.error('Failed to load prompt version:', err);
      });


      const fetchDataset = datasetsApi.getById(organisationId, projectId, experiment.datasetId).
      then((data) => {
        setDataset(data);
      }).
      catch((err) => {
        console.error('Failed to load dataset:', err);
      });

      Promise.all([fetchPromptVersion, fetchDataset]).
      finally(() => setLoadingRelated(false));
    } else {
      setPromptVersion(null);
      setDataset(null);
    }
  }, [experiment, organisationId, projectId]);

  const handleDelete = async () => {
    if (!experimentId) return;
    try {
      await deleteMutation.mutateAsync(experimentId);
      navigate({ to: "/organisations/$organisationId/projects/$projectId/experiments", params: { organisationId, projectId } });
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRerun = async () => {
    if (!experimentId) return;
    try {
      await rerunMutation.mutateAsync(experimentId);
      setRerunDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="p-10">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/organisations/$organisationId/projects/$projectId/experiments", params: { organisationId, projectId } })}
            className="mb-4">

            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Experiments
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight mb-1.5 dark:text-white">
                Experiment Details
              </h1>
              <p className="text-sm text-muted-foreground/60">
                View experiment configuration and results
              </p>
            </div>
            {experiment &&
            <div className="flex gap-2">
                <Button
                variant="outline"
                size="sm"
                onClick={() => setRerunDialogOpen(true)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">

                  <Play className="h-4 w-4 mr-2" />
                  Re-run
                </Button>
                <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">

                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            }
          </div>
        </div>

        {(() => {
          if (isLoading) {
            return (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin" />
              </div>);

          }
          if (error) {
            return (
              <div className="text-sm text-red-500 dark:text-red-400">
                Error: {error}
              </div>);

          }
          if (!experiment) {
            return (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Experiment not found
              </div>);

          }
          return (
            <Tabs defaultValue="details" className="w-full">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="results">Results ({experiment.results?.length || 0})</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                    <CardDescription>
                      Created {new Date(experiment.createdAt).toLocaleDateString()} • 
                      Updated {new Date(experiment.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Name</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {experiment.name}
                      </p>
                    </div>
                    {experiment.description &&
                      <div>
                        <h3 className="text-sm font-medium mb-2">Description</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {experiment.description}
                        </p>
                      </div>
                      }
                    <div>
                      <h3 className="text-sm font-medium mb-2">Prompt</h3>
                      {(() => {
                          if (loadingRelated) {
                            return (
                              <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
                            </div>);

                          }
                          if (promptVersion?.promptName && promptVersion?.promptId) {
                            return (
                              <div className="flex items-center gap-2">
                              <Link
                                  to="/projects/$projectId/prompts/$promptId"
                                  params={{ projectId, promptId: promptVersion.promptId }}
                                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">

                                {promptVersion.promptName}
                              </Link>
                              <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                Version: {promptVersion.versionName || experiment.promptVersionId.substring(0, 8)}
                              </span>
                            </div>);

                          }
                          return (
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                            {experiment.promptVersionId}
                          </p>);

                        })()}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Dataset</h3>
                      {(() => {
                          if (loadingRelated) {
                            return (
                              <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
                            </div>);

                          }
                          if (dataset) {
                            return (
                              <Link
                                to="/organisations/$organisationId/projects/$projectId/datasets/$datasetId"
                                params={{ organisationId: organisationId as string, projectId, datasetId: dataset.id }}
                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">

                              {dataset.name}
                            </Link>);

                          }
                          return (
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                            {experiment.datasetId}
                          </p>);

                        })()}
                    </div>
                    {experiment.promptInputMappings && Object.keys(experiment.promptInputMappings).length > 0 &&
                      <div>
                        <h3 className="text-sm font-medium mb-2">Prompt Input Mappings</h3>
                        <div className="space-y-2">
                          {Object.entries(experiment.promptInputMappings).map(([key, value]) =>
                          <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-[#1A1A1A] rounded">
                              <span className="text-sm font-medium">{key}</span>
                              <span className="text-sm text-gray-500">→</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      }
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="results" className="mt-6">
              <ExperimentResultsList
                  projectId={projectId}
                  experimentId={experiment.id} />

            </TabsContent>
          </Tabs>);

        })()}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the experiment and all its results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700">

              {deleteMutation.isPending ?
              <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </> :

              'Delete'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={rerunDialogOpen} onOpenChange={setRerunDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Re-run Experiment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will re-run the experiment against the dataset. This may take some time to complete.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rerunMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRerun}
              disabled={rerunMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700">

              {rerunMutation.isPending ?
              <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Re-running...
                </> :

              'Re-run'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>);

}

export default function ExperimentDetailPage() {
  return (
    <PagePermissionGuard permission={PERMISSIONS.EXPERIMENT.READ} fallback={<ForbiddenPage />}>
      <ExperimentDetailPageContent />
    </PagePermissionGuard>);

}