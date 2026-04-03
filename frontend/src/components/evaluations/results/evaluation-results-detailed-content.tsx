import { Loader2 } from 'lucide-react';
import { type ReactNode } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import { DetailedResultsTable } from './detailed-results-table';
import type { PaginationMeta } from '@/components/shared/table';
import type { DetailedResultRow } from './evaluation-results-detailed-utils';
import type { EvaluationResponse } from '@/types/evaluations';
import type { ExperimentResponse } from '@/types/experiments';

type DatasetContentProps = {
  isLoading: boolean;
  datasetForEvaluationHeader: string[] | null | undefined;
  combinedRows: DetailedResultRow[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filteredRows: DetailedResultRow[];
  paginatedItems: DetailedResultRow[];
  displayScoreIds: string[];
  getScoreName: (scoreId: string) => string;
  handleSort: (index: number) => void;
  meta: PaginationMeta;
  handlePageChange: (page: number) => void;
  manualScoreIds?: string[];
  onRowClick?: (row: DetailedResultRow) => void;
};

export function DatasetEvaluationContent({
  isLoading,
  datasetForEvaluationHeader,
  combinedRows,
  searchQuery,
  onSearchChange,
  filteredRows,
  paginatedItems,
  displayScoreIds,
  getScoreName,
  handleSort,
  meta,
  handlePageChange,
  manualScoreIds = [],
  onRowClick
}: Readonly<DatasetContentProps>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" data-testid="icon-loader2" />
      </div>);

  }
  if (!datasetForEvaluationHeader || datasetForEvaluationHeader.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground">
        {datasetForEvaluationHeader ? 'No dataset header found' : 'Loading dataset header...'}
      </div>);

  }
  if (combinedRows.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground">
        No results found for this dataset evaluation
      </div>);

  }

  return (
    <DetailedResultsTable
      headers={datasetForEvaluationHeader}
      displayScoreIds={displayScoreIds}
      paginatedItems={paginatedItems}
      filteredRows={filteredRows}
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      onSort={handleSort}
      getScoreName={getScoreName}
      meta={meta}
      onPageChange={handlePageChange}
      showExperimentColumn={false}
      showStatusBadge={true}
      manualScoreIds={manualScoreIds}
      onRowClick={onRowClick} />);


}

type ExperimentContentProps = Omit<DatasetContentProps, 'datasetForEvaluationHeader'> & {
  hasSingleExperiment: boolean;
  selectedExperimentId: string;
  onExperimentChange: (id: string) => void;
  loadingExperiments: boolean;
  experiments: ExperimentResponse[];
  evaluation: EvaluationResponse;
  datasetHeader: string[] | null | undefined;
  manualScoreIds?: string[];
  onRowClick?: (row: DetailedResultRow) => void;
};

export function ExperimentEvaluationContent({
  hasSingleExperiment,
  selectedExperimentId,
  onExperimentChange,
  loadingExperiments,
  experiments,
  evaluation,
  datasetHeader,
  isLoading,
  combinedRows,
  searchQuery,
  onSearchChange,
  filteredRows,
  paginatedItems,
  displayScoreIds,
  getScoreName,
  handleSort,
  meta,
  handlePageChange,
  manualScoreIds = [],
  onRowClick
}: Readonly<ExperimentContentProps>) {
  const showExperimentSelector = !hasSingleExperiment;
  const hasSelection = selectedExperimentId || hasSingleExperiment;


  let experimentSelectItems: ReactNode;
  if (loadingExperiments) {
    experimentSelectItems =
    <SelectItem value="loading" disabled>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading experiments...
        </div>
      </SelectItem>;

  } else if (experiments.length > 0) {
    experimentSelectItems = experiments.map((experiment) =>
    <SelectItem key={experiment.id} value={experiment.id}>
        {experiment.name}
      </SelectItem>
    );
  } else {
    experimentSelectItems = evaluation.experiments.map((experiment) =>
    <SelectItem key={experiment.id} value={experiment.id}>
        Experiment {experiment.id.slice(0, 8)}...
      </SelectItem>
    );
  }


  const selectorSection = showExperimentSelector ?
  <div className="space-y-2">
      <label htmlFor="eval-detail-experiment-select" className="text-sm font-medium">
        Select Experiment
      </label>
      <Select
      value={selectedExperimentId}
      onValueChange={onExperimentChange}
      disabled={loadingExperiments}>

        <SelectTrigger id="eval-detail-experiment-select" className="w-full max-w-md">
          <SelectValue placeholder="Choose an experiment..." />
        </SelectTrigger>
        <SelectContent>
          {experimentSelectItems}
        </SelectContent>
      </Select>
    </div> :
  null;


  if (!hasSelection) {
    return (
      <>
        {selectorSection}
        <div className="text-center py-12 text-sm text-muted-foreground">
          Please select an experiment to view detailed results
        </div>
      </>);

  }


  if (isLoading) {
    return (
      <>
        {selectorSection}
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" data-testid="icon-loader2" />
        </div>
      </>);

  }


  if (!datasetHeader || datasetHeader.length === 0) {
    return (
      <>
        {selectorSection}
        <div className="text-center py-12 text-sm text-muted-foreground">
          {datasetHeader ? 'No dataset header found' : 'Loading dataset header...'}
        </div>
      </>);

  }


  if (combinedRows.length === 0) {
    return (
      <>
        {selectorSection}
        <div className="text-center py-12 text-sm text-muted-foreground">
          No results found for this experiment
        </div>
      </>);

  }


  return (
    <>
      {selectorSection}
      <DetailedResultsTable
        headers={datasetHeader}
        displayScoreIds={displayScoreIds}
        paginatedItems={paginatedItems}
        filteredRows={filteredRows}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onSort={handleSort}
        getScoreName={getScoreName}
        meta={meta}
        onPageChange={handlePageChange}
        showExperimentColumn={!hasSingleExperiment}
        showStatusBadge={false}
        manualScoreIds={manualScoreIds}
        onRowClick={onRowClick} />

    </>);

}