"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { ScoreResponse } from "@/types/scores";
import { EvaluationScope } from "@/types/enums";
import { useTablePagination } from "@/hooks/shared/use-table-pagination";

const SCORE_MAPPINGS_PER_PAGE = 1;

export interface EvaluationFormScoreMappingsProps {
  selectedScoreIds: string[];
  scores: ScoreResponse[];
  scoreVariables: Record<string, string[]>;
  scoreMappings: Record<string, Record<string, string>>;
  customFieldValues: Record<string, Record<number, string>>;
  datasetHeaders: string[];
  loadingHeaders: boolean;
  evaluationScope: EvaluationScope;
  datasetId: string;
  selectedExperimentIds: string[];
  isRagasScore: (score: ScoreResponse) => boolean;
  getScoreMappingSelectValue: (scoreId: string, variable: string, variableIndex: number) => string;
  onScoreMappingFieldChange: (scoreId: string, variableIndex: number, value: string) => void;
  onScoreCustomFieldChange: (scoreId: string, variableIndex: number, value: string) => void;
  onScoreMappingUpdate?: (scoreId: string, variable: string, value: string) => void;
  isLoading?: boolean;
  isEditMode?: boolean;
}

export function EvaluationFormScoreMappings({
  selectedScoreIds,
  scores,
  scoreVariables,
  scoreMappings,
  customFieldValues,
  datasetHeaders,
  loadingHeaders,
  evaluationScope,
  datasetId,
  selectedExperimentIds,
  isRagasScore,
  getScoreMappingSelectValue,
  onScoreMappingFieldChange,
  onScoreCustomFieldChange,
  onScoreMappingUpdate,
  isLoading = false,
  isEditMode = false
}: Readonly<EvaluationFormScoreMappingsProps>) {
  const hasScope = evaluationScope === "DATASET" ? !!datasetId : selectedExperimentIds.length > 0;
  const mappableScoreIds = React.useMemo(() => {
    return selectedScoreIds.filter((scoreId) => {
      const score = scores.find((s) => s.id === scoreId);
      const variables = scoreVariables[scoreId] || [];
      return score && variables.length > 0 && hasScope;
    });
  }, [selectedScoreIds, scores, scoreVariables, hasScope]);

  const { paginatedItems: paginatedScoreIds, meta, handlePageChange } = useTablePagination(mappableScoreIds, {
    itemsPerPage: SCORE_MAPPINGS_PER_PAGE,
    dependencies: [selectedScoreIds, datasetId, selectedExperimentIds]
  });


  const prevMappableCountRef = React.useRef(mappableScoreIds.length);
  React.useEffect(() => {
    const currentCount = mappableScoreIds.length;
    if (currentCount > prevMappableCountRef.current && meta.totalPages > 1) {
      handlePageChange(meta.totalPages);
    }
    prevMappableCountRef.current = currentCount;
  }, [mappableScoreIds.length, meta.totalPages, handlePageChange]);

  if (mappableScoreIds.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-[#2A2A2A]">
        <p className="text-sm text-muted-foreground">
          {mappableScoreIds.length} score{mappableScoreIds.length === 1 ? "" : "s"} with mappings
        </p>
        {meta.totalPages > 1 ?
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex gap-1">
              <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={!meta.hasPreviousPage}
              className="h-8">

                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={!meta.hasNextPage}
              className="h-8">

                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div> :

        <span className="text-sm text-muted-foreground">
            {meta.page} of {meta.totalPages}
          </span>
        }
      </div>
      {paginatedScoreIds.map((scoreId) => {
        const score = scores.find((s) => s.id === scoreId);
        const variables = scoreVariables[scoreId] || [];
        if (!score || variables.length === 0) return null;

        const isRagas = isRagasScore(score);

        return (
          <div key={scoreId} className="space-y-4 p-4 border border-gray-200 dark:border-[#2A2A2A] rounded-lg bg-gray-50 dark:bg-[#1A1A1A]">
            <div>
              <Label className="text-sm font-medium dark:text-gray-200">
                Score Mappings: {isRagas ? `RAGAS: ${score.name}` : score.name}
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {isRagas ?
                'Map RAGAS score fields to dataset fields' :
                'Map evaluator prompt variables to dataset fields'}
                {evaluationScope === 'EXPERIMENT' && ' (including experiment_result)'}
              </p>
            </div>
            {loadingHeaders ?
            <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div> :

            <div className="space-y-2">
                {variables.map((variable, index) =>
              <div key={variable} className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Input
                    placeholder={isRagas ? "RAGAS score field" : "Evaluator prompt variable"}
                    value={variable}
                    readOnly
                    disabled
                    className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-gray-100 dark:bg-[#1A1A1A] dark:text-gray-400 rounded-lg text-sm cursor-not-allowed" />

                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">→</span>
                    <div className="flex-1 space-y-2">
                      {!loadingHeaders && datasetHeaders.length > 0 ?
                  <>
                          <Select
                      value={getScoreMappingSelectValue(scoreId, variable, index)}
                      onValueChange={(value) => onScoreMappingFieldChange(scoreId, index, value)}
                      disabled={isLoading || isEditMode}>

                            <SelectTrigger className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm">
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent side="top">
                              {datasetHeaders.map((header) =>
                        <SelectItem key={header} value={header}>
                                  {header}
                                </SelectItem>
                        )}
                              <SelectItem value="__other__">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {getScoreMappingSelectValue(scoreId, variable, index) === '__other__' &&
                    <Input
                      placeholder="Enter custom field name"
                      value={customFieldValues[scoreId]?.[index] || scoreMappings[scoreId]?.[variable] || ''}
                      onChange={(e) => onScoreCustomFieldChange(scoreId, index, e.target.value)}
                      className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm"
                      disabled={isLoading || isEditMode} />

                    }
                        </> :

                  <Input
                    placeholder={loadingHeaders ? "Loading headers..." : "Field name"}
                    value={scoreMappings[scoreId]?.[variable] || ''}
                    onChange={(e) => {
                      if (onScoreMappingUpdate) {
                        onScoreMappingUpdate(scoreId, variable, e.target.value);
                      } else {
                        onScoreCustomFieldChange(scoreId, index, e.target.value);
                      }
                    }}
                    className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm"
                    disabled={isLoading || isEditMode || loadingHeaders} />

                  }
                    </div>
                  </div>
              )}
              </div>
            }
          </div>);

      })}
    </div>);

}