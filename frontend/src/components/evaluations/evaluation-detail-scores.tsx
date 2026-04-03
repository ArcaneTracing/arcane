"use client";

import { Loader2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScoreResponse, ScaleOption } from "@/types/scores";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger } from
"@/components/ui/tooltip";
import { STATISTICS_TOOLTIPS } from "@/lib/evaluations/statistics-tooltips";

interface EvaluationDetailScoresProps {
  scores: ScoreResponse[];
  evaluation: Evaluation;
  loadingRelated: boolean;
}

export function EvaluationDetailScores({ scores, evaluation, loadingRelated }: Readonly<EvaluationDetailScoresProps>) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Scores</h3>
      {loadingRelated && scores.length === 0 ?
      <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Loading score details...</span>
        </div> :

      <div className="space-y-4">
          {scores.length > 0 ?
        scores.map((score) =>
        <div key={score.id} className="p-4 bg-gray-50 dark:bg-[#1A1A1A] rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{score.name}</span>
                      <Badge variant="outline">{score.scoringType}</Badge>
                    </div>
                    {score.description &&
              <p className="text-xs text-gray-500 dark:text-gray-400">
                        {score.description}
                      </p>
              }
                  </div>
                </div>
                
                {}
                <div>
                  <h4 className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">Scale Configuration</h4>
                  {(score.scoringType === 'ORDINAL' || score.scoringType === 'NOMINAL') && score.scale ?
            <div className="space-y-1.5">
                      {score.scale.map((option: ScaleOption) =>
              <div key={`${option.label}-${option.value}`} className="flex justify-between items-center text-xs">
                          <span className="font-medium">{option.label}</span>
                          <Badge variant="outline" className="text-xs">{option.value}</Badge>
                        </div>
              )}
                    </div> :

            <p className="text-xs text-gray-500 dark:text-gray-400">No scale configured</p>
            }
                </div>

                {}
                {score.scoringType === 'ORDINAL' && score.ordinalConfig &&
          <div>
                    <h4 className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">Ordinal Configuration</h4>
                    <div className="space-y-2">
                      {score.ordinalConfig.acceptable_set && score.ordinalConfig.acceptable_set.length > 0 &&
              <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Acceptable Set:</p>
                          <div className="flex flex-wrap gap-1">
                            {score.ordinalConfig.acceptable_set.map((label) =>
                  <Badge key={label} variant="outline" className="text-xs">
                                {label}
                              </Badge>
                  )}
                          </div>
                        </div>
              }
                      {score.ordinalConfig.threshold_rank !== undefined &&
              <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Threshold Rank:</p>
                          <Badge variant="outline" className="text-xs">
                            {score.ordinalConfig.threshold_rank}
                          </Badge>
                        </div>
              }
                    </div>
                  </div>
          }

                {}
                {score.evaluatorPrompt ?
          <div>
                    <h4 className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Evaluator Prompt</h4>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {score.evaluatorPrompt.name}
                    </p>
                  </div> :

          score.scoringType !== 'RAGAS' &&
          <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Manual score</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 shrink-0 cursor-help opacity-80" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{STATISTICS_TOOLTIPS.MANUAL_SCORE}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

          }
              </div>
        ) :

        evaluation.scores.map((score) =>
        <div key={score.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-[#1A1A1A] rounded">
                <div>
                  <span className="text-sm font-medium">{score.name}</span>
                  {score.description &&
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      - {score.description}
                    </span>
            }
                </div>
                <Badge variant="outline">{score.scoringType}</Badge>
              </div>
        )
        }
        </div>
      }
    </div>);

}