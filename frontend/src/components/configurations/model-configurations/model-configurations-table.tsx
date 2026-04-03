"use client";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useModelConfigurationsQuery } from "@/hooks/model-configurations/use-model-configurations-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { ModelConfigurationDialog } from "@/components/configurations/model-configurations/model-configuration-dialog";
import { ModelConfigurationResponse } from "@/types/model-configuration";
import { useTableFilter, useTableSort, useTablePagination } from "@/hooks/shared";
import { ModelConfigurationsTableHeader } from "@/components/configurations/model-configurations/model-configurations-table-header";
import { ModelConfigurationsTableRow } from "@/components/configurations/model-configurations/model-configurations-table-row";
import { DeleteModelConfigurationDialog } from "@/components/configurations/model-configurations/delete-model-configuration-dialog";
import { ModelConfigurationsTablePagination } from "@/components/configurations/model-configurations/model-configurations-table-pagination";

export interface ModelConfigurationsTableProps {
  searchQuery: string;
}

export function ModelConfigurationsTable({ searchQuery }: Readonly<ModelConfigurationsTableProps>) {
  const { data: allConfigurations = [], isLoading: isFetchLoading, error: fetchError } = useModelConfigurationsQuery();

  const [editingConfiguration, setEditingConfiguration] = useState<ModelConfigurationResponse | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [configurationToDelete, setConfigurationToDelete] = useState<string | null>(null);


  const filteredConfigurations = useTableFilter(allConfigurations, searchQuery, {
    searchFields: ['name', 'description']
  });


  const { sortedItems: sortedConfigurations, sortConfig, handleSort } = useTableSort(filteredConfigurations, {
    defaultSortKey: 'createdAt',
    defaultDirection: 'desc',
    dateFields: ['createdAt', 'updatedAt']
  });


  const { paginatedItems, meta, handlePageChange } = useTablePagination(
    sortedConfigurations,
    { dependencies: [searchQuery, sortConfig.key, sortConfig.direction] }
  );

  const handleEdit = (configuration: ModelConfiguration) => {
    setEditingConfiguration(configuration);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {


    if (configurationToDelete) {

      setConfigurationToDelete(null);
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
          <ModelConfigurationsTableHeader sortConfig={sortConfig} onSort={handleSort} />
          <TableBody>
            {fetchError ?
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="text-sm text-red-500 dark:text-red-400">
                    Error: {fetchError}
                  </div>
                </TableCell>
              </TableRow> :
            (() => {
              if (filteredConfigurations.length === 0) {
                return (
                  <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    No model configurations found
                  </div>
                </TableCell>
              </TableRow>);

              }
              return paginatedItems.map((configuration: ModelConfigurationResponse) =>
              <ModelConfigurationsTableRow
                key={configuration.id}
                configuration={configuration}
                onEdit={handleEdit}
                onDelete={setConfigurationToDelete} />

              );
            })()}
          </TableBody>
        </Table>

        <ModelConfigurationDialog
          configuration={editingConfiguration}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen} />


        <DeleteModelConfigurationDialog
          isOpen={!!configurationToDelete}
          isLoading={false}
          error={null}
          onClose={() => setConfigurationToDelete(null)}
          onConfirm={handleDelete} />

      </div>

      {filteredConfigurations.length > 0 &&
      <ModelConfigurationsTablePagination meta={meta} onPageChange={handlePageChange} />
      }
    </>);

}