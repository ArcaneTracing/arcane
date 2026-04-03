import { useParams, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Search, Save, Plus, Download } from "lucide-react";
import { TableIcon } from "@/components/icons/table-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { DatasetRowsTableHeader } from "@/components/datasets/rows-table/dataset-rows-table-header";
import { TablePagination } from "@/components/shared/table";
import { TruncatedCell } from "@/components/shared/truncated-cell";
import { useExportDataset, useDatasetQuery } from "@/hooks/datasets/use-datasets-query";
import { updateRowValueAtColumn } from "./dataset-detail-utils";
import { PagePermissionGuard } from "@/components/PagePermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import ForbiddenPage from "@/pages/forbidden/page";
import { PaginationQuery } from "@/types/pagination";
import { datasetsApi } from "@/api/datasets";

function DatasetDetailPageContent() {
  const { projectId, organisationId, datasetId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/datasets/$datasetId", strict: false });
  const navigate = useNavigate();


  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [newRows, setNewRows] = useState<Array<{id: string;values: string[];}>>([]);
  const [isSaving, setIsSaving] = useState(false);

  const exportMutation = useExportDataset(projectId, datasetId);
  const queryClient = useQueryClient();


  const paginationQuery: PaginationQuery = useMemo(() => ({
    page,
    limit: 20,
    search: searchQuery || undefined,
    sortBy: sortBy || undefined,
    sortOrder
  }), [page, searchQuery, sortBy, sortOrder]);


  const { data: datasetData, isLoading, error } = useDatasetQuery(projectId, datasetId, paginationQuery);


  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleSort = (columnIndex: number | null, direction: 'asc' | 'desc') => {
    if (columnIndex === null) {
      setSortBy(undefined);
      setSortOrder('asc');
    } else {
      setSortBy(columnIndex.toString());
      setSortOrder(direction);
    }
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };


  const dataset = datasetData ? {
    id: datasetData.id,
    name: datasetData.name,
    description: datasetData.description,
    header: datasetData.header,
    rows: datasetData.data,
    createdAt: new Date(),
    updatedAt: new Date()
  } : null;


  const allRows = dataset ?
  [
  ...newRows.map((nr) => ({ id: nr.id, values: nr.values })),
  ...dataset.rows] :

  [];


  const sortConfig = {
    columnIndex: sortBy ? Number.parseInt(sortBy, 10) : null,
    direction: sortOrder
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>);

  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error loading dataset</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Failed to load dataset'}
          </p>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/organisations/$organisationId/projects/$projectId/datasets", params: { organisationId, projectId } })}>

            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Datasets
          </Button>
        </div>
      </div>);

  }

  if (!dataset) {
    return null;
  }

  const handleAddNewRow = () => {
    const newRow = {
      id: `new-${crypto.randomUUID()}`,
      values: new Array(dataset.header.length).fill("")
    };
    setNewRows([newRow, ...newRows]);
  };

  const handleUpdateNewRow = (rowId: string, columnIndex: number, value: string) => {
    setNewRows((prevRows) =>
    prevRows.map((row) => updateRowValueAtColumn(row, rowId, columnIndex, value))
    );
  };

  const handleSave = async () => {
    if (newRows.length === 0) return;

    setIsSaving(true);
    try {
      if (!organisationId || !projectId || !datasetId) return;


      for (const newRow of newRows) {

        if (newRow.values.some((v) => v.trim() === "")) {
          continue;
        }
        await datasetsApi.upsertRow(organisationId, projectId, datasetId, { values: newRow.values });
      }


      queryClient.invalidateQueries({ queryKey: ['dataset', organisationId, projectId, datasetId] });
      setNewRows([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rows');
    } finally {
      setIsSaving(false);
    }
  };

  const hasUnsavedRows = newRows.some((row) => row.values.some((v) => v.trim() !== ""));

  return (
    <div className="flex-1 p-10">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/organisations/$organisationId/projects/$projectId/datasets", params: { organisationId, projectId } })}
          className="mb-6">

          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <TableIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                {dataset.name}
              </h1>
            </div>
            
            {dataset.description &&
            <p className="text-sm text-muted-foreground/80 mb-4 max-w-3xl">
                {dataset.description}
              </p>
            }

            <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium">Created:</span>
                <span>{new Date(dataset.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Updated:</span>
                <span>{new Date(dataset.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-muted-foreground/40 dark:text-gray-400/40" />
          <Input
            placeholder="Search rows"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 w-[240px] h-8 rounded-lg bg-white dark:bg-[#0D0D0D] border-[1px] border border-gray-100 dark:border-[#2A2A2A] placeholder:text-muted-foreground/40 dark:placeholder:text-gray-400/40 dark:text-gray-100" />

        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="flex items-center gap-2">

            {exportMutation.isPending ?
            <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </> :

            <>
                <Download className="h-4 w-4" />
                Export CSV
              </>
            }
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddNewRow}
            className="flex items-center gap-2">

            <Plus className="h-4 w-4" />
            Add Row
          </Button>
          {hasUnsavedRows &&
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2">

              {isSaving ?
            <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </> :

            <>
                  <Save className="h-4 w-4" />
                  Save
                </>
            }
            </Button>
          }
        </div>
      </div>

      <div className="rounded-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] shadow-sm">
        {allRows.length === 0 ?
        <div className="p-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No rows in this dataset yet.
            </p>
          </div> :

        <>
            <div className="overflow-x-auto">
              <Table>
                <DatasetRowsTableHeader
                headers={dataset.header}
                sortConfig={sortConfig}
                onSort={handleSort} />

                <TableBody>
                  {allRows.length === 0 ?
                <TableRow>
                      <TableCell colSpan={dataset.header.length} className="h-24 text-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          No rows found
                        </div>
                      </TableCell>
                    </TableRow> :

                allRows.map((row) => {
                  const isNewRow = newRows.some((nr) => nr.id === row.id);
                  return (
                    <TableRow
                      key={row.id}
                      className={`border-b border-gray-100 dark:border-[#2A2A2A] hover:bg-gray-50/50 dark:hover:bg-[#1F1F1F]/50 ${
                      isNewRow ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`
                      }>

                          {dataset.header.map((header, index) =>
                      <TableCell
                        key={`${row.id}-${header}`}
                        className="text-xs text-gray-900 dark:text-gray-100 py-3">

                              {isNewRow ?
                        <Input
                          value={row.values[index]}
                          onChange={(e) => handleUpdateNewRow(row.id, index, e.target.value)}
                          className="h-7 text-xs border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D]"
                          placeholder={header} /> :


                        <TruncatedCell value={row.values[index] || ""} maxLength={50} />
                        }
                            </TableCell>
                      )}
                        </TableRow>);

                })
                }
                </TableBody>
              </Table>
            </div>
            {datasetData?.pagination &&
          <TablePagination meta={datasetData.pagination} onPageChange={handlePageChange} />
          }
          </>
        }
      </div>
    </div>);

}

export default function DatasetDetailPage() {
  return (
    <PagePermissionGuard permission={PERMISSIONS.DATASET.READ} fallback={<ForbiddenPage />}>
      <DatasetDetailPageContent />
    </PagePermissionGuard>);

}