"use client";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useConversationConfigurationsQuery, useDeleteConversationConfiguration } from "@/hooks/conversation/use-conversation-query";
import { useActionError } from "@/hooks/shared/use-action-error";
import { showSuccessToast } from "@/lib/toast";
import { Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { ConversationDialog } from "@/components/configurations/conversations/conversation-dialog";
import { ConversationConfigurationResponse } from "@/types/conversation-configuration";
import { useTableFilter, useTableSort, useTablePagination } from "@/hooks/shared";
import { ConversationTableHeader } from "@/components/configurations/conversations/conversation-table-header";
import { ConversationTableRow } from "@/components/configurations/conversations/conversation-table-row";
import { DeleteConversationDialog } from "@/components/configurations/conversations/delete-conversation-dialog";
import { ConversationTablePagination } from "@/components/configurations/conversations/conversation-table-pagination";
import { filterConversationConfigurations } from "./conversation-table-filter";

export interface ConversationTableProps {
  searchQuery: string;
  startDate?: string;
  endDate?: string;
}

export function ConversationTable({ searchQuery, startDate, endDate }: Readonly<ConversationTableProps>) {
  const { data: allConfigurations = [], isLoading: isFetchLoading, error: fetchError } = useConversationConfigurationsQuery();
  const deleteMutation = useDeleteConversationConfiguration();
  const deleteActionError = useActionError({ showToast: true });

  const deleteConfiguration = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      showSuccessToast('Conversation configuration deleted successfully');
    } catch (error) {
      deleteActionError.handleError(error);
    }
  };
  const isDeleteLoading = deleteMutation.isPending;

  const [editingConfiguration, setEditingConfiguration] = useState<ConversationConfigurationResponse | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [configurationToDelete, setConfigurationToDelete] = useState<string | null>(null);

  const filteredConfigurations = useTableFilter(allConfigurations, searchQuery, {
    customFilter: (item, query) =>
    filterConversationConfigurations(item, query, startDate, endDate)
  });


  const { sortedItems: sortedConfigurations, sortConfig, handleSort } = useTableSort(filteredConfigurations, {
    defaultSortKey: 'createdAt',
    defaultDirection: 'desc',
    dateFields: ['createdAt', 'updatedAt']
  });


  const { paginatedItems, meta, handlePageChange } = useTablePagination(
    sortedConfigurations,
    { dependencies: [searchQuery, startDate, endDate, sortConfig.key, sortConfig.direction] }
  );

  const handleEdit = (configuration: ConversationConfigurationResponse) => {
    setEditingConfiguration(configuration);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (configurationToDelete) {
      await deleteConfiguration(configurationToDelete);
      setConfigurationToDelete(null);
    }
  };

  if (isFetchLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin" />
      </div>);

  }

  let tableBodyContent: ReactNode;
  if (fetchError) {
    tableBodyContent =
    <TableRow>
        <TableCell colSpan={5} className="h-24 text-center">
          <div className="text-sm text-red-500 dark:text-red-400">
            Error: {fetchError}
          </div>
        </TableCell>
      </TableRow>;

  } else if (filteredConfigurations.length === 0) {
    tableBodyContent =
    <TableRow>
        <TableCell colSpan={5} className="h-24 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No conversation configurations found
          </div>
        </TableCell>
      </TableRow>;

  } else {
    tableBodyContent = paginatedItems.map((configuration: ConversationConfigurationResponse) =>
    <ConversationTableRow
      key={configuration.id}
      configuration={configuration}
      onEdit={handleEdit}
      onDelete={setConfigurationToDelete} />

    );
  }

  return (
    <>
      <div className="rounded-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] shadow-sm">
        <Table>
          <ConversationTableHeader sortConfig={sortConfig} onSort={handleSort} />
          <TableBody>
            {tableBodyContent}
          </TableBody>
        </Table>

        <ConversationDialog
          configuration={editingConfiguration}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen} />


        <DeleteConversationDialog
          isOpen={!!configurationToDelete}
          isLoading={isDeleteLoading}
          error={deleteActionError.message}
          onClose={() => setConfigurationToDelete(null)}
          onConfirm={handleDelete} />

      </div>

      <ConversationTablePagination meta={meta} onPageChange={handlePageChange} />
    </>);

}