"use client";

import { useDatasetsQuery, useDeleteDataset } from "@/hooks/datasets/use-datasets-query";
import { useActionError } from "@/hooks/shared/use-action-error";
import { showSuccessToast } from "@/lib/toast";
import { useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { DatasetDialog } from "../dialogs/new-dataset-dialog";
import { DatasetListItemResponse } from "@/types/datasets";
import { useTableFilter, useTableSort, useTablePagination, compareTableItemValues } from "@/hooks/shared";
import { TablePagination, TableContainer } from "@/components/shared/table";
import { DatasetCard } from "../cards/dataset-card";
import { DeleteDatasetDialog } from "../dialogs/delete-dataset-dialog";
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation";
import { PermissionError } from "@/components/shared/permission-error";
import { isForbiddenError } from "@/lib/error-handling";

export interface DatasetsTableProps {
  searchQuery: string;
  projectId: string;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}

export function DatasetsTable({ searchQuery, projectId, sortKey, sortDirection }: Readonly<DatasetsTableProps>) {
  const organisationId = useOrganisationIdOrNull();
  const { data: allDatasets = [], isLoading: isFetchLoading, error: fetchError } = useDatasetsQuery(projectId);
  const deleteMutation = useDeleteDataset(projectId);
  const deleteActionError = useActionError({ showToast: true });

  const deleteDataset = async (projectId: string, id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      showSuccessToast('Dataset deleted successfully');
    } catch (error) {
      deleteActionError.handleError(error);
    }
  };
  const isDeleteLoading = deleteMutation.isPending;

  const [editingDataset, setEditingDataset] = useState<DatasetListItemResponse | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const filteredDatasets = useTableFilter(allDatasets, searchQuery, {
    searchFields: ['name', 'description']
  });


  const { sortedItems: sortedDatasets } = useTableSort(filteredDatasets, {
    defaultSortKey: 'createdAt',
    defaultDirection: 'desc',
    dateFields: ['createdAt', 'updatedAt']
  });
  const datasetsToPaginate = useMemo(() => {
    if (!sortKey || !sortDirection) return sortedDatasets;
    const sorted = [...filteredDatasets];
    const sortBy = sortKey as keyof DatasetListItemResponse;
    sorted.sort((a, b) =>
    compareTableItemValues(a[sortBy], b[sortBy], sortBy, sortDirection)
    );
    return sorted;
  }, [filteredDatasets, sortedDatasets, sortKey, sortDirection]);


  const { paginatedItems, meta, handlePageChange } = useTablePagination(
    datasetsToPaginate,
    { dependencies: [searchQuery, sortKey, sortDirection] }
  );

  const handleEdit = (dataset: DatasetListItemResponse) => {
    setEditingDataset(dataset);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (datasetToDelete) {
      await deleteDataset(datasetToDelete);
      setDatasetToDelete(null);
    }
  };

  const handleView = (datasetId: string) => {
    if (!organisationId) return;
    navigate({ to: "/organisations/$organisationId/projects/$projectId/datasets/$datasetId", params: { organisationId, projectId, datasetId } });
  };


  if (fetchError && isForbiddenError(fetchError)) {
    return <PermissionError error={fetchError} resourceName="datasets" action="view" />;
  }

  return (
    <>
      <TableContainer
        isLoading={isFetchLoading}
        error={fetchError}
        isEmpty={filteredDatasets.length === 0}
        emptyMessage="No datasets found">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedItems.map((dataset: DatasetListItemResponse) =>
          <DatasetCard
            key={dataset.id}
            dataset={dataset}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={setDatasetToDelete}
            projectId={projectId} />

          )}
        </div>

        <TablePagination meta={meta} onPageChange={handlePageChange} />
      </TableContainer>

      <DatasetDialog
        dataset={editingDataset}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        projectId={projectId} />


      <DeleteDatasetDialog
        isOpen={!!datasetToDelete}
        isLoading={isDeleteLoading}
        error={deleteActionError.message}
        onClose={() => setDatasetToDelete(null)}
        onConfirm={handleDelete} />

    </>);

}