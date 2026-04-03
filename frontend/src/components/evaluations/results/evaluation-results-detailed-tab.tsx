"use client";

import type { ReactNode } from "react";
import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTableSort } from "@/hooks/dataset/use-table-sort";
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation";
import { DatasetRowResponse } from "@/types/datasets";
import type { EvaluationResponse } from "@/types/evaluations";
import type { ExperimentResponse } from "@/types/experiments";
import { getScoreName, filterDetailedRows, getDetailedDescription, isManualScore } from "./evaluation-results-detailed-utils";
import { DatasetEvaluationContent, ExperimentEvaluationContent } from "./evaluation-results-detailed-content";
import { useEvaluationResultsDetailedData } from "./use-evaluation-results-detailed-data";
import type { DetailedResultRow } from "./evaluation-results-detailed-utils";
import type { PaginationQuery, PaginationMeta } from "@/types/pagination";
import { ManualScoreResultsModal } from "./manual-score-results-modal";

interface EvaluationResultsDetailedTabProps {
  projectId: string;
  evaluationId: string;
  evaluation: EvaluationResponse;
}

export function EvaluationResultsDetailedTab({
  projectId,
  evaluationId,
  evaluation
}: Readonly<EvaluationResultsDetailedTabProps>) {
  const organisationId = useOrganisationIdOrNull();
  const queryClient = useQueryClient();


  const [selectedRow, setSelectedRow] = useState<DetailedResultRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);


  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');


  const paginationQuery: PaginationQuery = useMemo(() => ({
    page,
    limit: 20,
    search: searchQuery || undefined,
    sortBy: sortBy || undefined,
    sortOrder
  }), [page, searchQuery, sortBy, sortOrder]);

  const {
    setSearchQuery: setHookSearchQuery,
    selectedExperimentId,
    setSelectedExperimentId,
    isDatasetEvaluation,
    hasSingleExperiment,
    hasExperiments,
    experiments,
    scores,
    loadingExperiments,
    datasetHeader,
    datasetForEvaluationHeader,
    combinedRows,
    isLoadingData,
    isLoadingScores,
    paginationMeta
  } = useEvaluationResultsDetailedData(organisationId, projectId, evaluationId, evaluation, paginationQuery);


  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setHookSearchQuery(value);
    setPage(1);
  };

  const handleSort = (index: number) => {
    setSortBy(index.toString());
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const filteredRows = filterDetailedRows(combinedRows, searchQuery, hasSingleExperiment);
  const datasetHeaders = isDatasetEvaluation ?
  datasetForEvaluationHeader?.length || 0 :
  datasetHeader?.length || 0;
  const { sortedRows } = useTableSort(
    filteredRows as DatasetRowResponse[],
    datasetHeaders
  );
  const sortedRowsTyped = sortedRows as DetailedResultRow[];
  const displayScoreIds = evaluation.scores.map((s) => s.id);
  const getScoreNameFn = (scoreId: string) => getScoreName(scoreId, scores, evaluation);

  const manualScores = useMemo(
    () => scores.filter((s) => isManualScore(s)),
    [scores]
  );
  const manualScoreIds = useMemo(() => manualScores.map((s) => s.id), [manualScores]);

  const handleRowClick = (row: DetailedResultRow) => {
    setSelectedRow(row);
    setModalOpen(true);
  };

  const handleManualScoreSuccess = () => {
    if (!organisationId) return;
    queryClient.invalidateQueries({ queryKey: ["dataset-results", organisationId, projectId, evaluationId] });
    queryClient.invalidateQueries({ queryKey: ["experiment-results", organisationId, projectId, evaluationId] });
    queryClient.invalidateQueries({ queryKey: ["experiment-scores", organisationId, projectId, evaluationId] });
    queryClient.invalidateQueries({ queryKey: ["dataset-statistics", organisationId, projectId, evaluationId] });
    queryClient.invalidateQueries({ queryKey: ["evaluation-statistics", organisationId, projectId, evaluationId] });
  };


  const defaultPaginationMeta: PaginationMeta = {
    page,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  };
  const paginationMetaWithDefault = paginationMeta || defaultPaginationMeta;

  const content = renderDetailedContent({
    hasExperiments,
    isDatasetEvaluation,
    datasetForEvaluationHeader,
    datasetHeader,
    combinedRows,
    searchQuery,
    setSearchQuery: handleSearchChange,
    filteredRows: sortedRowsTyped,
    paginatedItems: sortedRowsTyped,
    displayScoreIds,
    getScoreNameFn,
    handleSort,
    meta: paginationMetaWithDefault,
    handlePageChange,
    isLoadingData,
    hasSingleExperiment,
    selectedExperimentId,
    setSelectedExperimentId,
    loadingExperiments,
    experiments,
    evaluation,
    isLoadingScores,
    manualScoreIds,
    onRowClick: manualScoreIds.length > 0 ? handleRowClick : undefined
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
          <CardDescription>
            {getDetailedDescription(isDatasetEvaluation, hasSingleExperiment)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {content}
        </CardContent>
      </Card>
      <ManualScoreResultsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        row={selectedRow}
        manualScores={manualScores}
        organisationId={organisationId}
        projectId={projectId}
        evaluationId={evaluationId}
        isDatasetEvaluation={isDatasetEvaluation}
        onSuccess={handleManualScoreSuccess} />

    </div>);

}

type RenderContentParams = {
  hasExperiments: boolean;
  isDatasetEvaluation: boolean;
  datasetForEvaluationHeader: string[] | null | undefined;
  datasetHeader: string[] | null | undefined;
  combinedRows: DetailedResultRow[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filteredRows: DetailedResultRow[];
  paginatedItems: DetailedResultRow[];
  displayScoreIds: string[];
  getScoreNameFn: (id: string) => string;
  handleSort: (index: number) => void;
  meta: PaginationMeta;
  handlePageChange: (page: number) => void;
  isLoadingData: boolean;
  hasSingleExperiment: boolean;
  selectedExperimentId: string;
  setSelectedExperimentId: (id: string) => void;
  loadingExperiments: boolean;
  experiments: ExperimentResponse[];
  evaluation: EvaluationResponse;
  isLoadingScores: boolean;
  manualScoreIds: string[];
  onRowClick?: (row: DetailedResultRow) => void;
};

function renderDetailedContent(params: Readonly<RenderContentParams>): ReactNode {
  const { hasExperiments, isDatasetEvaluation } = params;
  if (!hasExperiments && !isDatasetEvaluation) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        This evaluation does not include experiments. Detailed results are only available for
        experiment-based or dataset-based evaluations.
      </div>);

  }
  if (isDatasetEvaluation) {
    return (
      <DatasetEvaluationContent
        isLoading={params.isLoadingData}
        datasetForEvaluationHeader={params.datasetForEvaluationHeader}
        combinedRows={params.combinedRows}
        searchQuery={params.searchQuery}
        onSearchChange={params.setSearchQuery}
        filteredRows={params.filteredRows}
        paginatedItems={params.paginatedItems}
        displayScoreIds={params.displayScoreIds}
        getScoreName={params.getScoreNameFn}
        handleSort={params.handleSort}
        meta={params.meta}
        handlePageChange={params.handlePageChange}
        manualScoreIds={params.manualScoreIds}
        onRowClick={params.onRowClick} />);


  }
  return (
    <ExperimentEvaluationContent
      hasSingleExperiment={params.hasSingleExperiment}
      selectedExperimentId={params.selectedExperimentId}
      onExperimentChange={params.setSelectedExperimentId}
      loadingExperiments={params.loadingExperiments}
      experiments={params.experiments}
      evaluation={params.evaluation}
      datasetHeader={params.datasetHeader}
      isLoading={params.isLoadingScores}
      combinedRows={params.combinedRows}
      searchQuery={params.searchQuery}
      onSearchChange={params.setSearchQuery}
      filteredRows={params.filteredRows}
      paginatedItems={params.paginatedItems}
      displayScoreIds={params.displayScoreIds}
      getScoreName={params.getScoreNameFn}
      handleSort={params.handleSort}
      meta={params.meta}
      handlePageChange={params.handlePageChange}
      manualScoreIds={params.manualScoreIds}
      onRowClick={params.onRowClick} />);


}