"use client";

import { useDatasourcesQuery, useDeleteDatasource } from "@/hooks/datasources/use-datasources-query";
import { useActionError } from "@/hooks/shared/use-action-error";
import { showSuccessToast } from "@/lib/toast";
import { useState, useMemo } from "react";
import { useTableFilter, useTableSort, useTablePagination } from "@/hooks/shared";
import { DeleteDatasourceDialog } from "../dialogs/delete-datasource-dialog";
import { TableContainer, TablePagination } from "@/components/shared/table";
import { DatasourceResponse } from "@/types/datasources";
import { DatasourceCard } from "../cards/datasource-card";
import { DatasourceDialog } from "../dialogs/datasource-dialog";

export interface DatasourcesTableProps {
  search: string;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}

export function DatasourcesTable({ search, sortKey, sortDirection }: Readonly<DatasourcesTableProps>) {
  const { data: allDatasources = [], isLoading: isFetchLoading, error: fetchError } = useDatasourcesQuery();
  const deleteMutation = useDeleteDatasource();
  const deleteActionError = useActionError({ showToast: true });

  const deleteDatasource = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      showSuccessToast('Datasource deleted successfully');
    } catch (error) {
      deleteActionError.handleError(error);
    }
  };
  const isDeleteLoading = deleteMutation.isPending;

  const [datasourceToDelete, setDatasourceToDelete] = useState<DatasourceResponse | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDatasource, setSelectedDatasource] = useState<DatasourceResponse | null>(null);
  const filteredDatasources = useTableFilter(allDatasources, search, {
    searchFields: ['name', 'type', 'source', 'description']
  });


  const { sortedItems: sortedDatasources } = useTableSort(filteredDatasources, {
    defaultSortKey: 'name',
    defaultDirection: 'asc'
  });

  const datasourcesToPaginate = useMemo(() => {
    if (!sortKey || !sortDirection) return sortedDatasources;
    const sorted = [...filteredDatasources];
    const sortBy = sortKey as keyof DatasourceResponse;
    const order = sortDirection;

    sorted.sort((a, b) => {
      let aValue: unknown = a[sortBy];
      let bValue: unknown = b[sortBy];


      aValue ??= '';
      bValue ??= '';


      if (typeof aValue !== 'string') aValue = String(aValue);
      if (typeof bValue !== 'string') bValue = String(bValue);


      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();


      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredDatasources, sortedDatasources, sortKey, sortDirection]);


  const { paginatedItems, meta, handlePageChange } = useTablePagination(
    datasourcesToPaginate,
    { dependencies: [search, sortKey, sortDirection] }
  );

  const handleEdit = (datasource: DatasourceResponse) => {
    setSelectedDatasource(datasource);
    setEditDialogOpen(true);
  };

  const handleDelete = (datasource: DatasourceResponse) => {
    setDatasourceToDelete(datasource);
  };

  const handleConfirmDelete = async () => {
    if (datasourceToDelete) {
      await deleteDatasource(datasourceToDelete.id);
      setDatasourceToDelete(null);
    }
  };

  const handleDialogSuccess = () => {

    setEditDialogOpen(false);
    setSelectedDatasource(null);
  };

  return (
    <>
      <TableContainer
        isLoading={isFetchLoading}
        error={fetchError}
        isEmpty={filteredDatasources.length === 0}
        emptyMessage="No datasources found">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedItems.map((datasource: DatasourceResponse) =>
          <DatasourceCard
            key={datasource.id}
            datasource={datasource}
            onEdit={handleEdit}
            onDelete={handleDelete} />

          )}
        </div>

        <TablePagination meta={meta} onPageChange={handlePageChange} />
      </TableContainer>

      <DatasourceDialog
        datasource={selectedDatasource || undefined}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setSelectedDatasource(null);
          }
        }}
        onSuccess={handleDialogSuccess} />


      <DeleteDatasourceDialog
        isOpen={!!datasourceToDelete}
        isLoading={isDeleteLoading}
        error={deleteActionError.message}
        onClose={() => setDatasourceToDelete(null)}
        onConfirm={handleConfirmDelete} />

    </>);

}