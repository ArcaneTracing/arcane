import { useParams, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDeleteEvaluation, useRerunEvaluation, useEvaluationQuery } from "@/hooks/evaluations/use-evaluations-query";
import { EvaluationRerunDialog } from "@/components/evaluations/dialogs/evaluation-rerun-dialog";
import { EvaluationDeleteDialog } from "@/components/evaluations/dialogs/evaluation-delete-dialog";
import { EvaluationResultsGeneralTab } from "@/components/evaluations/results/evaluation-results-general-tab";
import { EvaluationResultsDetailedTab } from "@/components/evaluations/results/evaluation-results-detailed-tab";
import { EvaluationResultsComparisonTab } from "@/components/evaluations/results/evaluation-results-comparison-tab";
import { PagePermissionGuard } from "@/components/PagePermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import ForbiddenPage from "@/pages/forbidden/page";

function EvaluationDetailPageContent() {
  const { projectId, organisationId, evaluationId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/evaluations/$evaluationId", strict: false });
  const navigate = useNavigate();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rerunDialogOpen, setRerunDialogOpen] = useState(false);


  const { data: evaluation, isLoading, error: evaluationError } = useEvaluationQuery(projectId, evaluationId);

  const deleteMutation = useDeleteEvaluation(projectId);
  const rerunMutation = useRerunEvaluation(projectId);

  const handleDelete = async () => {
    if (!evaluationId) return;
    try {
      await deleteMutation.mutateAsync(evaluationId);
      navigate({ to: "/organisations/$organisationId/projects/$projectId/evaluations", params: { organisationId, projectId } });
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRerun = async () => {
    if (!evaluationId) return;
    try {
      await rerunMutation.mutateAsync(evaluationId);
      setRerunDialogOpen(false);

    } catch (err) {
      console.error(err);
    }
  };

  const error = evaluationError?.message || null;

  return (
    <>
      <div className="p-10">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/organisations/$organisationId/projects/$projectId/evaluations", params: { organisationId, projectId } })}
            className="mb-4">

            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Evaluations
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight mb-1.5 dark:text-white">
                {evaluation ? evaluation.name : "Evaluation Details"}
              </h1>
              <p className="text-sm text-muted-foreground/60">
                View evaluation configuration, details, and results
              </p>
            </div>
            {evaluation &&
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
          if (!evaluation) {
            return (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Evaluation not found
              </div>);

          }
          return (
            <Tabs defaultValue="general" className="w-full">
            <div className="mb-4 border-b pb-4">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="detailed">Detailed</TabsTrigger>
                {evaluation.evaluationScope === 'EXPERIMENT' && evaluation.experiments.length > 1 &&
                  <TabsTrigger value="comparison">Comparison</TabsTrigger>
                  }
              </TabsList>
            </div>

            <TabsContent value="general" className="mt-0">
              <EvaluationResultsGeneralTab
                  projectId={projectId}
                  evaluationId={evaluationId}
                  evaluation={evaluation} />

            </TabsContent>

            <TabsContent value="detailed" className="mt-0">
              <EvaluationResultsDetailedTab
                  projectId={projectId}
                  evaluationId={evaluationId}
                  evaluation={evaluation} />

            </TabsContent>

            {evaluation.evaluationScope === 'EXPERIMENT' && evaluation.experiments.length > 1 &&
              <TabsContent value="comparison" className="mt-0">
                <EvaluationResultsComparisonTab
                  projectId={projectId}
                  evaluationId={evaluationId}
                  evaluation={evaluation} />

              </TabsContent>
              }
          </Tabs>);

        })()}
      </div>

      <EvaluationDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        evaluationName={evaluation?.name}
        mutation={deleteMutation}
        onConfirm={handleDelete} />


      <EvaluationRerunDialog
        open={rerunDialogOpen}
        onOpenChange={setRerunDialogOpen}
        evaluationName={evaluation?.name}
        mutation={rerunMutation}
        onConfirm={handleRerun} />

    </>);

}

export default function EvaluationDetailPage() {
  return (
    <PagePermissionGuard permission={PERMISSIONS.EVALUATION.READ} fallback={<ForbiddenPage />}>
      <EvaluationDetailPageContent />
    </PagePermissionGuard>);

}