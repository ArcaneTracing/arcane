"use client";

import { usePromptsQuery, useDeletePrompt } from "@/hooks/prompts/use-prompts-query";
import { PromptResponse } from "@/types/prompts";
import { useTableFilter, useTableSort, useTablePagination, compareTableItemValues } from "@/hooks/shared";
import { TablePagination, TableContainer } from "@/components/shared/table";
import { PromptCard } from "../cards/prompt-card";
import { DeletePromptDialog } from "../dialogs/delete-prompt-dialog";
import { EditPromptInfoModal } from "../dialogs/edit-prompt-info-modal";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useActionError } from "@/hooks/shared/use-action-error";
import { showSuccessToast } from "@/lib/toast";

export interface PromptsTableProps {
  searchQuery: string;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}

export function PromptsTable({ searchQuery, sortKey, sortDirection }: Readonly<PromptsTableProps>) {
  const { projectId, organisationId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/prompts", strict: false });
  const navigate = useNavigate();

  const { data: allPrompts = [], isLoading, error } = usePromptsQuery(projectId);
  const deleteMutation = useDeletePrompt(projectId);
  const deleteActionError = useActionError({ showToast: true });

  const deletePrompt = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      showSuccessToast('Prompt deleted successfully');
    } catch (error) {
      deleteActionError.handleError(error);
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePromptId, setDeletePromptId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState<PromptResponse | null>(null);
  const isDeleting = deleteMutation.isPending;


  const filteredPrompts = useTableFilter(allPrompts, searchQuery, {
    searchFields: ['name', 'description']
  });


  const { sortedItems: sortedPrompts } = useTableSort(filteredPrompts, {
    defaultSortKey: 'createdAt',
    defaultDirection: 'desc',
    dateFields: ['createdAt', 'updatedAt']
  });
  const promptsToPaginate = useMemo(() => {
    if (!sortKey || !sortDirection) return sortedPrompts;
    const sorted = [...filteredPrompts];
    const sortBy = sortKey as keyof PromptResponse;
    sorted.sort((a, b) =>
    compareTableItemValues(a[sortBy], b[sortBy], sortBy, sortDirection)
    );
    return sorted;
  }, [filteredPrompts, sortedPrompts, sortKey, sortDirection]);


  const { paginatedItems, meta, handlePageChange } = useTablePagination(
    promptsToPaginate,
    { dependencies: [searchQuery, sortKey, sortDirection] }
  );

  const handleEdit = (prompt: PromptResponse) => {
    setEditPrompt(prompt);
  };

  const handleView = (promptId: string) => {
    if (projectId && organisationId) {
      navigate({ to: "/organisations/$organisationId/projects/$projectId/prompts/$promptId", params: { organisationId, projectId, promptId } });
    }
  };

  const handleDelete = (promptId: string) => {
    setDeletePromptId(promptId);
    deleteActionError.clear();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletePromptId || !projectId) return;

    try {
      await deletePrompt(deletePromptId);
      setDeleteDialogOpen(false);
      setDeletePromptId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeletePromptId(null);
    deleteActionError.clear();
  };

  return (
    <>
      <TableContainer
        isLoading={isLoading}
        error={error}
        isEmpty={filteredPrompts.length === 0}
        emptyMessage="No prompts found">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedItems.map((prompt: PromptResponse) =>
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            projectId={projectId} />

          )}
        </div>

        <TablePagination meta={meta} onPageChange={handlePageChange} />
      </TableContainer>

      <DeletePromptDialog
        isOpen={deleteDialogOpen}
        isLoading={isDeleting}
        error={deleteActionError.message}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm} />


      {editPrompt && projectId &&
      <EditPromptInfoModal
        prompt={editPrompt}
        open={!!editPrompt}
        onOpenChange={(open) => !open && setEditPrompt(null)}
        onSuccess={() => setEditPrompt(null)}
        projectId={projectId} />

      }
    </>);

}