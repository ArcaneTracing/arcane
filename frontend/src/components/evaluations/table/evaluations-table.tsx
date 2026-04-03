"use client";

import { useEvaluationsQuery, useDeleteEvaluation, useRerunEvaluation } from "@/hooks/evaluations/use-evaluations-query";
import { EvaluationResponse } from "@/types/evaluations";
import { useTableFilter, useTableSort, useTablePagination, compareTableItemValues } from "@/hooks/shared";
import { TablePagination, TableContainer } from "@/components/shared/table";
import { EvaluationCard } from "../cards/evaluation-card";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { EvaluationRerunDialog } from "../dialogs/evaluation-rerun-dialog";
import { EvaluationDeleteDialog } from "../dialogs/evaluation-delete-dialog";
import { PermissionError } from "@/components/shared/permission-error";
import { isForbiddenError } from "@/lib/error-handling";

export interface EvaluationsTableProps {
  searchQuery: string;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}

export function EvaluationsTable({ searchQuery, sortKey, sortDirection }: Readonly<EvaluationsTableProps>) {
  const { projectId, organisationId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/evaluations", strict: false });
  const navigate = useNavigate();

  const { data: allEvaluations = [], isLoading, error } = useEvaluationsQuery(projectId);

  const deleteMutation = useDeleteEvaluation(projectId);
  const rerunMutation = useRerunEvaluation(projectId);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rerunDialogOpen, setRerunDialogOpen] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<EvaluationResponse | null>(null);
  const [evaluationToRerun, setEvaluationToRerun] = useState<EvaluationResponse | null>(null);


  const filteredEvaluations = useTableFilter(allEvaluations, searchQuery, {
    searchFields: ['name', 'description', 'evaluationType', 'evaluationScope']
  });


  const { sortedItems: sortedEvaluations } = useTableSort(filteredEvaluations, {
    defaultSortKey: 'createdAt',
    defaultDirection: 'desc',
    dateFields: ['createdAt', 'updatedAt']
  });
  const evaluationsToPaginate = useMemo(() => {
    if (!sortKey || !sortDirection) return sortedEvaluations;
    const sorted = [...filteredEvaluations];
    const sortBy = sortKey as keyof EvaluationResponse;
    sorted.sort((a, b) =>
    compareTableItemValues(a[sortBy], b[sortBy], sortBy, sortDirection)
    );
    return sorted;
  }, [filteredEvaluations, sortedEvaluations, sortKey, sortDirection]);


  const { paginatedItems, meta, handlePageChange } = useTablePagination(
    evaluationsToPaginate,
    { dependencies: [searchQuery, sortKey, sortDirection] }
  );

  const handleView = (evaluationId: string) => {
    if (!organisationId) return;
    navigate({ to: "/organisations/$organisationId/projects/$projectId/evaluations/$evaluationId", params: { organisationId, projectId, evaluationId } });
  };

  const handleRerun = (evaluation: EvaluationResponse) => {
    setEvaluationToRerun(evaluation);
    setRerunDialogOpen(true);
  };

  const handleDelete = (evaluation: EvaluationResponse) => {
    setEvaluationToDelete(evaluation);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (evaluationToDelete) {
      try {
        await deleteMutation.mutateAsync(evaluationToDelete.id);
        setDeleteDialogOpen(false);
        setEvaluationToDelete(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleConfirmRerun = async () => {
    if (evaluationToRerun) {
      try {
        await rerunMutation.mutateAsync(evaluationToRerun.id);
        setRerunDialogOpen(false);
        setEvaluationToRerun(null);
      } catch (err) {
        console.error(err);
      }
    }
  };


  if (error && isForbiddenError(error)) {
    return <PermissionError error={error} resourceName="evaluations" action="view" />;
  }

  return (
    <>
      <TableContainer
        isLoading={isLoading}
        error={error}
        isEmpty={filteredEvaluations.length === 0}
        emptyMessage="No evaluations found">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedItems.map((evaluation: EvaluationResponse) =>
          <EvaluationCard
            key={evaluation.id}
            evaluation={evaluation}
            onView={handleView}
            onRerun={handleRerun}
            onDelete={handleDelete}
            projectId={projectId} />

          )}
        </div>

        <TablePagination meta={meta} onPageChange={handlePageChange} />
      </TableContainer>

      <EvaluationDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        evaluationName={evaluationToDelete?.name}
        mutation={deleteMutation}
        onConfirm={handleConfirmDelete} />


      <EvaluationRerunDialog
        open={rerunDialogOpen}
        onOpenChange={setRerunDialogOpen}
        evaluationName={evaluationToRerun?.name}
        mutation={rerunMutation}
        onConfirm={handleConfirmRerun} />

    </>);

}