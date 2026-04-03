"use client";

import { useAnnotationQueuesQuery, useDeleteAnnotationQueue } from "@/hooks/annotation-queues/use-annotation-queues-query";
import { useActionError } from "@/hooks/shared/use-action-error";
import { showSuccessToast } from "@/lib/toast";
import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnnotationQueueListItemResponse } from "@/types/annotation-queue";
import { DeleteAnnotationQueueDialog } from "@/components/annotation-queues/dialogs/delete-annotation-queue-dialog";
import { AnnotationQueueCard } from "../cards/annotation-queue-card";
import { useTablePagination } from "@/hooks/shared";
import { TablePagination, TableContainer } from "@/components/shared/table";
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation";

export interface AnnotationQueuesTableProps {
  searchQuery: string;
  projectId: string;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}

export function AnnotationQueuesTable({ searchQuery, projectId, sortKey, sortDirection }: Readonly<AnnotationQueuesTableProps>) {
  const organisationId = useOrganisationIdOrNull();
  const navigate = useNavigate();
  const { data: allQueues = [], isLoading: isFetchLoading, error: fetchError } = useAnnotationQueuesQuery(projectId);
  const deleteMutation = useDeleteAnnotationQueue(projectId);
  const deleteActionError = useActionError({ showToast: true });

  const deleteAnnotationQueue = async (projectId: string, queueId: string) => {
    try {
      await deleteMutation.mutateAsync(queueId);
      showSuccessToast('Annotation queue deleted successfully');
    } catch (error) {
      deleteActionError.handleError(error);
    }
  };
  const isDeleteLoading = deleteMutation.isPending;

  const [queueToDelete, setQueueToDelete] = useState<string | null>(null);


  const filteredQueues: AnnotationQueueListItemResponse[] = allQueues.filter((queue) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      queue.name.toLowerCase().includes(query) ||
      queue.description?.toLowerCase().includes(query));

  });


  const queuesToPaginate = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredQueues;
    const sorted = [...filteredQueues];
    const sortBy = sortKey as 'name' | 'description' | 'type';
    const order = sortDirection;

    sorted.sort((a, b) => {
      let aValue: unknown = a[sortBy as keyof AnnotationQueueListItemResponse];
      let bValue: unknown = b[sortBy as keyof AnnotationQueueListItemResponse];


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
  }, [filteredQueues, sortKey, sortDirection]);


  const { paginatedItems, meta, handlePageChange } = useTablePagination(
    queuesToPaginate,
    { dependencies: [searchQuery, sortKey, sortDirection] }
  );

  const handleView = (queue: AnnotationQueueListItemResponse) => {
    if (!organisationId) return;
    navigate({
      to: "/organisations/$organisationId/projects/$projectId/annotation-queues/$queueId",
      params: { organisationId, projectId, queueId: queue.id }
    });
  };

  const handleEdit = (queue: AnnotationQueueListItemResponse) => {
    if (!organisationId) return;
    navigate({
      to: "/organisations/$organisationId/projects/$projectId/annotation-queues/edit/$queueId",
      params: { organisationId, projectId, queueId: queue.id }
    });
  };

  const handleDelete = async () => {
    if (queueToDelete) {
      await deleteAnnotationQueue(projectId, queueToDelete);
      setQueueToDelete(null);
    }
  };

  return (
    <>
      <TableContainer
        isLoading={isFetchLoading}
        error={fetchError}
        isEmpty={filteredQueues.length === 0}
        emptyMessage="No annotation queues found">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedItems.map((queue: AnnotationQueueListItemResponse) =>
          <AnnotationQueueCard
            key={queue.id}
            queue={queue}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={setQueueToDelete}
            projectId={projectId} />

          )}
        </div>

        <TablePagination meta={meta} onPageChange={handlePageChange} />
      </TableContainer>

      <DeleteAnnotationQueueDialog
        isOpen={!!queueToDelete}
        isLoading={isDeleteLoading}
        error={deleteActionError.message}
        onClose={() => setQueueToDelete(null)}
        onConfirm={handleDelete} />

    </>);

}