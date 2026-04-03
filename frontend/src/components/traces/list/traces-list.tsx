"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, CalendarIcon, ClockIcon, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from
"@/components/ui/table";
import { useNavigate, useParams, Link } from "@tanstack/react-router";
import { stateToTracesListSearch } from "@/hooks/traces/use-traces-url-state";
import { AddToQueueDialog } from "./add-to-queue-dialog";
import { useTablePagination } from "@/hooks/shared/use-table-pagination";
import { TablePagination } from "@/components/shared/table/table-pagination";
import { TempoTraceSummary } from "@/types/traces";
import type { SearchFilters } from "./search-top-bar/types";

interface TracesListProps {
  traces: TempoTraceSummary[];
  datasourceId: string;
  isSearchLoading: boolean;
  isFetchLoading: boolean;
  searchError: string | null;
  startDate?: Date;
  endDate?: Date;
  filters?: SearchFilters;
}

export function TracesList({
  traces,
  datasourceId,
  isSearchLoading,
  isFetchLoading,
  searchError,
  startDate,
  endDate,
  filters
}: Readonly<TracesListProps>) {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const projectId = params?.projectId;
  const organisationId = params?.organisationId;

  const [selectedTraces, setSelectedTraces] = useState<Set<string>>(new Set());
  const selectAllCheckboxRef = useRef<HTMLButtonElement>(null);


  const TRACES_PER_PAGE = 10;
  const { paginatedItems: paginatedTraces, meta, handlePageChange } = useTablePagination(
    traces,
    {
      itemsPerPage: TRACES_PER_PAGE,
      dependencies: [traces]
    }
  );


  useEffect(() => {
    setSelectedTraces(new Set());
  }, [traces]);


  const currentPageTraceIds = new Set(paginatedTraces.map((trace: TempoTraceSummary) => trace.traceID).filter(Boolean));
  const selectedOnCurrentPage = Array.from(selectedTraces).filter((id) => currentPageTraceIds.has(id));
  const isAllSelected = paginatedTraces.length > 0 && selectedOnCurrentPage.length === paginatedTraces.length;
  const isIndeterminate = selectedOnCurrentPage.length > 0 && selectedOnCurrentPage.length < paginatedTraces.length;


  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const input = selectAllCheckboxRef.current.querySelector('input[type="checkbox"]');
      if (input) {
        input.indeterminate = isIndeterminate;
      }
    }
  }, [isIndeterminate]);

  if (isSearchLoading || isFetchLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>);

  }

  if (searchError) {
    return (
      <div className="text-destructive p-4">Error: {searchError}</div>);

  }

  if (traces.length === 0) {
    return (
      <div className="text-muted-foreground p-4">No traces found</div>);

  }


  const getServiceColor = (index: number) => {
    const colors = [
    'bg-red-100 text-red-800 dark:bg-red-600 dark:text-white',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-600 dark:text-white',
    'bg-blue-100 text-blue-800 dark:bg-blue-600 dark:text-white',
    'bg-green-100 text-green-800 dark:bg-green-600 dark:text-white',
    'bg-purple-100 text-purple-800 dark:bg-purple-600 dark:text-white',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-white'];

    return colors[index % colors.length];
  };


  const formatDuration = (ms: number) => {
    if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getTraceSearchParams = (trace: TempoTraceSummary) =>
    filters
      ? stateToTracesListSearch({
          filters: {
            datasourceId: filters.datasourceId,
            q: filters.q,
            attributes: filters.attributes,
            min_duration: filters.min_duration,
            max_duration: filters.max_duration,
            lookback: filters.lookback,
            limit: filters.limit,
            spanName: filters.spanName ?? ""
          },
          startDate,
          endDate
        })
      : { datasourceId };

  const handleRowClick = (trace: TempoTraceSummary, e: React.MouseEvent) => {

    if ((e.target as HTMLElement).closest('[role="checkbox"]') || (e.target as HTMLElement).closest('[data-open-in-new-tab]')) {
      return;
    }
    if (!trace?.traceID || !organisationId || !projectId) return;

    const returnSearch = getTraceSearchParams(trace);

    navigate({
      to: "/organisations/$organisationId/projects/$projectId/traces/$datasourceId/$traceId",
      params: { organisationId, projectId, datasourceId, traceId: trace.traceID },
      search: returnSearch
    });
  };

  const handleSelectTrace = (traceId: string, checked: boolean) => {
    setSelectedTraces((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(traceId);
      } else {
        newSet.delete(traceId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const newSelected = new Set(selectedTraces);
    currentPageTraceIds.forEach((id) => newSelected.add(id));
    setSelectedTraces(newSelected);
  };

  const handleDeselectAll = () => {
    const newSelected = new Set(selectedTraces);
    currentPageTraceIds.forEach((id) => newSelected.delete(id));
    setSelectedTraces(newSelected);
  };

  const handleAddToQueueSuccess = () => {
    setSelectedTraces(new Set());
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      {selectedTraces.size > 0 &&
      <div className="border-b border-border p-3 bg-muted/50 flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-muted-foreground">
            {selectedTraces.size} trace{selectedTraces.size === 1 ? '' : 's'} selected
          </div>
          <AddToQueueDialog
          selectedTraces={selectedTraces}
          projectId={projectId!}
          datasourceId={datasourceId}
          startDate={startDate}
          endDate={endDate}
          onSuccess={handleAddToQueueSuccess} />

        </div>
      }
      <div className="flex-1 overflow-auto min-h-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  ref={selectAllCheckboxRef}
                  checked={isAllSelected}
                  onCheckedChange={(checked) => (checked ? handleSelectAll : handleDeselectAll)()} />

              </TableHead>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTraces.map((trace: TempoTraceSummary) => {
              const startTime = trace.startTimeUnixNano ?
              new Date(Number(trace.startTimeUnixNano) / 1000000).toLocaleString() :
              'Unknown';
              const durationMs = trace.durationMs || 0;
              const rootTraceName = trace.rootTraceName || 'Unknown';
              const rootServiceName = trace.rootServiceName || 'Unknown';
              const serviceColor = getServiceColor(0);
              const isSelected = selectedTraces.has(trace.traceID);

              return (
                <TableRow
                  key={trace.traceID}
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50"
                  onClick={(e) => handleRowClick(trace, e)}>

                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                      handleSelectTrace(trace.traceID, !!checked)
                      } />

                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="font-medium text-[13px] text-foreground">
                        {rootTraceName}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        #{trace.traceID}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`flex items-center gap-2 py-1 px-2 ${serviceColor} text-[11px] w-fit`}>

                      <span className="font-medium">{rootServiceName}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <CalendarIcon className="w-3 h-3" />
                      <span className="translate-y-[0.5px]">{startTime}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <ClockIcon className="w-3 h-3" />
                      <span className="translate-y-[0.5px]">{formatDuration(durationMs)}</span>
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()} className="p-1">
                    {organisationId && projectId && trace.traceID && (
                      <Link
                        to="/organisations/$organisationId/projects/$projectId/traces/$datasourceId/$traceId"
                        params={{ organisationId, projectId, datasourceId, traceId: trace.traceID }}
                        search={getTraceSearchParams(trace)}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-open-in-new-tab
                        className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted"
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </TableCell>
                </TableRow>);

            })}
          </TableBody>
        </Table>
      </div>
      <div className="border-t border-border p-4 flex-shrink-0">
        <TablePagination meta={meta} onPageChange={handlePageChange} />
      </div>
    </div>);

}