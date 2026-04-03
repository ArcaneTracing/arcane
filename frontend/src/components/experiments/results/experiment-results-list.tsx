"use client";

import { useState, useMemo } from "react";
import { Loader2, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ExperimentResultsTableHeader } from "@/components/experiments/results/experiment-results-table-header";
import { TablePagination } from "@/components/shared/table";
import { TruncatedCell } from "@/components/shared/truncated-cell";
import { useExperimentQuery, useExperimentResultsQuery } from "@/hooks/experiments/use-experiments-query";
import { useDatasetQuery } from "@/hooks/datasets/use-datasets-query";
import { PaginationQuery } from "@/types/pagination";

interface ExperimentResultsListProps {
  projectId: string;
  experimentId: string;
}

export function ExperimentResultsList({ projectId, experimentId }: Readonly<ExperimentResultsListProps>) {

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: experiment, isLoading: isLoadingExperiment, error: experimentError } = useExperimentQuery(projectId, experimentId);


  const paginationQuery: PaginationQuery = useMemo(() => ({
    page,
    limit: 20,
    search: searchQuery || undefined,
    sortBy: sortBy || undefined,
    sortOrder
  }), [page, searchQuery, sortBy, sortOrder]);


  const { data: resultsData, isLoading: isLoadingResults, error: resultsError } = useExperimentResultsQuery(projectId, experimentId, paginationQuery);


  const { data: dataset } = useDatasetQuery(projectId, experiment?.datasetId, { page: 1, limit: 1 });

  const isLoading = isLoadingExperiment || isLoadingResults;
  const error = experimentError?.message || resultsError?.message || null;


  const combinedRows = resultsData?.data || [];


  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleSort = (columnIndex: number | null) => {
    if (columnIndex === null) {
      setSortBy(undefined);
      setSortOrder('desc');
    } else {
      setSortBy(columnIndex.toString());
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    }
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };


  const sortConfig = {
    columnIndex: sortBy ? Number.parseInt(sortBy, 10) : null,
    direction: sortOrder
  };


  const headers = dataset?.header || (combinedRows.length > 0 ? Array.from({ length: combinedRows[0]?.datasetRow.values.length || 0 }, (_, i) => `Column ${i + 1}`) : []);

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

  if (headers.length === 0 && !isLoading) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-12">
        No dataset header found
      </div>);

  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-muted-foreground/40 dark:text-gray-400/40" />
        <Input
          placeholder="Search results"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 w-[240px] h-8 rounded-lg bg-white dark:bg-[#0D0D0D] border-[1px] border border-gray-100 dark:border-[#2A2A2A] placeholder:text-muted-foreground/40 dark:placeholder:text-gray-400/40 dark:text-gray-100" />

      </div>

      <div className="rounded-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <ExperimentResultsTableHeader
              headers={headers}
              sortConfig={sortConfig}
              onSort={handleSort} />

            <TableBody>
              {combinedRows.length === 0 ?
              <TableRow>
                  <TableCell colSpan={headers.length + 1} className="h-24 text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No results found
                    </div>
                  </TableCell>
                </TableRow> :

              combinedRows.map((row) =>
              <TableRow
                key={row.experimentResultId}
                className="border-b border-gray-100 dark:border-[#2A2A2A] hover:bg-gray-50/50 dark:hover:bg-[#1F1F1F]/50">

                    {row.datasetRow.values.map((value, index) =>
                <TableCell
                  key={`${row.experimentResultId}-${index}`}
                  className="text-xs text-gray-900 dark:text-gray-100 py-3">

                        <TruncatedCell value={value || ""} maxLength={50} />
                      </TableCell>
                )}
                    <TableCell className="text-xs text-gray-900 dark:text-gray-100 py-3">
                      <TruncatedCell value={row.experimentResult || ''} maxLength={50} />
                    </TableCell>
                  </TableRow>
              )
              }
            </TableBody>
          </Table>
        </div>
        {resultsData?.pagination &&
        <TablePagination meta={resultsData.pagination} onPageChange={handlePageChange} />
        }
      </div>
    </div>);

}