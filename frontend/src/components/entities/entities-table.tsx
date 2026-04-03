"use client";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useEntitiesQuery, useDeleteEntity } from "@/hooks/entities/use-entities-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { EntityDialog } from "./new-entity-dialog";
import { EntityResponse } from "@/types/entities";
import { useTableFilter, useTableSort, useTablePagination } from "@/hooks/shared";
import { EntitiesTableHeader } from "./entities-table-header";
import { EntitiesTableRow } from "./entities-table-row";
import { DeleteEntityDialog } from "./delete-entity-dialog";
import { EntitiesTablePagination } from "./entities-table-pagination";
import { useActionError } from "@/hooks/shared/use-action-error";
import { showSuccessToast } from "@/lib/toast";

export interface EntitiesTableProps {
  searchQuery: string;
}

export function EntitiesTable({ searchQuery }: Readonly<EntitiesTableProps>) {
  const { data: allEntities = [], isLoading: isFetchLoading, error: fetchError } = useEntitiesQuery();
  const deleteMutation = useDeleteEntity();
  const deleteActionError = useActionError({ showToast: true });

  const deleteEntity = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      showSuccessToast('Entity deleted successfully');
    } catch (error) {
      deleteActionError.handleError(error);
    }
  };
  const isDeleteLoading = deleteMutation.isPending;

  const [editingEntity, setEditingEntity] = useState<EntityResponse | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<string | null>(null);


  const filteredEntities = useTableFilter(allEntities, searchQuery, {
    searchFields: ['name', 'description']
  });


  const { sortedItems: sortedEntities, sortConfig, handleSort } = useTableSort(filteredEntities, {
    defaultSortKey: 'createdAt',
    defaultDirection: 'desc',
    dateFields: ['createdAt', 'updatedAt']
  });


  const { paginatedItems, meta, handlePageChange } = useTablePagination(
    sortedEntities,
    { dependencies: [searchQuery, sortConfig.key, sortConfig.direction] }
  );

  const handleEdit = (entity: EntityResponse) => {
    setEditingEntity(entity);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (entityToDelete) {
      await deleteEntity(entityToDelete);
      setEntityToDelete(null);
    }
  };

  if (isFetchLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin" />
      </div>);

  }

  return (
    <>
      <div className="rounded-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] shadow-sm">
        <Table>
          <EntitiesTableHeader sortConfig={sortConfig} onSort={handleSort} />
          <TableBody>
            {fetchError ?
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="text-sm text-red-500 dark:text-red-400">
                    Error: {fetchError instanceof Error ? fetchError.message : String(fetchError)}
                  </div>
                </TableCell>
              </TableRow> :
            (() => {
              if (filteredEntities.length === 0) {
                return (
                  <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    No entities found
                  </div>
                </TableCell>
              </TableRow>);

              }
              return paginatedItems.map((entity: EntityResponse) =>
              <EntitiesTableRow
                key={entity.id}
                entity={entity}
                onEdit={handleEdit}
                onDelete={setEntityToDelete} />

              );
            })()}
          </TableBody>
        </Table>

        <EntityDialog
          entity={editingEntity}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen} />


        <DeleteEntityDialog
          isOpen={!!entityToDelete}
          isLoading={isDeleteLoading}
          error={deleteActionError.message}
          onClose={() => setEntityToDelete(null)}
          onConfirm={handleDelete} />

      </div>

      <EntitiesTablePagination meta={meta} onPageChange={handlePageChange} />
    </>);

}