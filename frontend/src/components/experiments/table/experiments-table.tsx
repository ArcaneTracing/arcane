"use client";

import React, { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useExperimentsQuery, useDeleteExperiment, useRerunExperiment } from "@/hooks/experiments/use-experiments-query";
import { ExperimentResponse } from "@/types/experiments";
import { useTableFilter, useTableSort, useTablePagination, compareTableItemValues } from "@/hooks/shared";
import { TablePagination, TableContainer } from "@/components/shared/table";
import { ExperimentCard } from "../cards/experiment-card";
import { useParams, useNavigate } from "@tanstack/react-router";
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
import { PermissionError } from "@/components/shared/permission-error";
import { isForbiddenError } from "@/lib/error-handling";

export interface ExperimentsTableProps {
  searchQuery: string;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}

export function ExperimentsTable({ searchQuery, sortKey, sortDirection }: Readonly<ExperimentsTableProps>) {
  const { projectId, organisationId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/experiments", strict: false });
  const navigate = useNavigate();

  const {
    data: allExperiments = [],
    isLoading,
    error
  } = useExperimentsQuery(projectId);

  const deleteExperimentMutation = useDeleteExperiment(projectId);
  const rerunExperimentMutation = useRerunExperiment(projectId);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [experimentToDelete, setExperimentToDelete] = useState<ExperimentResponse | null>(null);
  const [rerunDialogOpen, setRerunDialogOpen] = useState(false);
  const [experimentToRerun, setExperimentToRerun] = useState<ExperimentResponse | null>(null);


  const filteredExperiments = useTableFilter(allExperiments, searchQuery, {
    searchFields: ['promptVersionId', 'datasetId', 'name', 'description']
  });


  const { sortedItems: sortedExperiments } = useTableSort(filteredExperiments, {
    defaultSortKey: 'createdAt',
    defaultDirection: 'desc',
    dateFields: ['createdAt', 'updatedAt']
  });

  const experimentsToPaginate = useMemo(() => {
    if (!sortKey || !sortDirection) return sortedExperiments;
    const sorted = [...filteredExperiments];
    const sortBy = sortKey as keyof ExperimentResponse;
    sorted.sort((a, b) =>
    compareTableItemValues(a[sortBy], b[sortBy], sortBy, sortDirection)
    );
    return sorted;
  }, [filteredExperiments, sortedExperiments, sortKey, sortDirection]);


  const { paginatedItems, meta, handlePageChange } = useTablePagination(
    experimentsToPaginate,
    { dependencies: [searchQuery, sortKey, sortDirection] }
  );

  const handleView = (experimentId: string) => {
    navigate({ to: "/organisations/$organisationId/projects/$projectId/experiments/$experimentId", params: { organisationId, projectId, experimentId } });
  };

  const handleRerun = (experiment: ExperimentResponse) => {
    setExperimentToRerun(experiment);
    setRerunDialogOpen(true);
  };

  const handleDelete = (experiment: ExperimentResponse) => {
    setExperimentToDelete(experiment);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (experimentToDelete) {
      try {
        await deleteExperimentMutation.mutateAsync(experimentToDelete.id);
        setDeleteDialogOpen(false);
        setExperimentToDelete(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleConfirmRerun = async () => {
    if (experimentToRerun && projectId) {
      try {
        await rerunExperimentMutation.mutateAsync(experimentToRerun.id);
        setRerunDialogOpen(false);
        setExperimentToRerun(null);
      } catch (err) {
        console.error(err);
      }
    }
  };


  if (error && isForbiddenError(error)) {
    return <PermissionError error={error} resourceName="experiments" action="view" />;
  }

  return (
    <>
      <TableContainer
        isLoading={isLoading}
        error={error}
        isEmpty={filteredExperiments.length === 0}
        emptyMessage="No experiments found">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedItems.map((experiment: ExperimentResponse) =>
          <ExperimentCard
            key={experiment.id}
            experiment={experiment}
            onView={handleView}
            onRerun={handleRerun}
            onDelete={handleDelete}
            projectId={projectId} />

          )}
        </div>

        <TablePagination meta={meta} onPageChange={handlePageChange} />
      </TableContainer>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the experiment and all its results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteExperimentMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteExperimentMutation.isPending}
              className="bg-red-600 hover:bg-red-700">

              {deleteExperimentMutation.isPending ?
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
            <AlertDialogCancel disabled={rerunExperimentMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRerun}
              disabled={rerunExperimentMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700">

              {rerunExperimentMutation.isPending ?
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