"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList } from
"@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger } from
"@/components/ui/popover";
import { X, Loader2, ChevronsUpDown, Info } from "lucide-react";
import { ScoreResponse } from "@/types/scores";
import { isForbiddenError } from "@/lib/error-handling";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger } from
"@/components/ui/tooltip";
import { STATISTICS_TOOLTIPS } from "@/lib/evaluations/statistics-tooltips";

function isManualScore(score: ScoreResponse, isRagasScore: (s: ScoreResponse) => boolean): boolean {
  return !isRagasScore(score) && !score.evaluatorPrompt?.id;
}

export interface EvaluationFormScoreSelectionProps {
  selectedScoreIds: string[];
  scores: ScoreResponse[];
  loadingScores: boolean;
  isRagasScore: (score: ScoreResponse) => boolean;
  onScoreAdd: (scoreId: string) => void;
  onScoreRemove: (scoreId: string) => void;
  isLoading?: boolean;
  isEditMode?: boolean;
  error?: unknown;
}

function getScoreDisplayText(score: ScoreResponse, isRagasScore: (s: ScoreResponse) => boolean): string {
  const name = isRagasScore(score) ? `RAGAS: ${score.name}` : score.name;
  return score.description ? `${name} - ${score.description}` : name;
}

export function EvaluationFormScoreSelection({
  selectedScoreIds,
  scores,
  loadingScores,
  isRagasScore,
  onScoreAdd,
  onScoreRemove,
  isLoading = false,
  isEditMode = false,
  error
}: Readonly<EvaluationFormScoreSelectionProps>) {
  const [open, setOpen] = React.useState(false);
  const hasPermissionError = error && isForbiddenError(error);
  const availableScores = scores.filter((score) => !selectedScoreIds.includes(score.id));

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium dark:text-gray-200">
        Scores <span className="text-red-500">*</span>
      </Label>
      {loadingScores &&
      <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      }
      {!loadingScores && hasPermissionError &&
      <p className="text-sm text-red-500 dark:text-red-400">You don't have permission to view scores.</p>
      }
      {!loadingScores && !hasPermissionError && scores.length === 0 &&
      <p className="text-sm text-gray-500 dark:text-gray-400">No scores available. Please create a score first.</p>
      }
      {!loadingScores && !hasPermissionError && scores.length > 0 &&
      <div className="space-y-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full h-9 justify-between font-normal border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white",
                !availableScores.length && "text-muted-foreground"
              )}
              disabled={isLoading || isEditMode || hasPermissionError || availableScores.length === 0}>

                {hasPermissionError ? "No permission" : "Select a score to add..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-[280px] w-80 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search scores..." className="h-9" />
                <CommandList className="max-h-[min(400px,var(--radix-select-content-available-height,400px))]">
                  <CommandEmpty>
                    {hasPermissionError ?
                  "You don't have permission to view scores" :
                  "No score found."}
                  </CommandEmpty>
                  <CommandGroup>
                    {availableScores.map((score) => {
                    const displayText = getScoreDisplayText(score, isRagasScore);
                    return (
                      <CommandItem
                        key={score.id}
                        value={`${score.id} ${displayText}`}
                        onSelect={() => {
                          onScoreAdd(score.id);
                          setOpen(false);
                        }}>

                          {displayText}
                        </CommandItem>);

                  })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedScoreIds.length > 0 &&
        <div className="flex flex-wrap gap-2 mt-2">
              {selectedScoreIds.map((scoreId) => {
            const score = scores.find((s) => s.id === scoreId);
            if (!score) return null;
            const manual = isManualScore(score, isRagasScore);
            return (
              <div
                key={scoreId}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/20 dark:bg-red-500/20 text-red-900 dark:text-white text-sm">

                    <span>{isRagasScore(score) ? `RAGAS: ${score.name}` : score.name}</span>
                    {manual &&
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
                }
                    <button
                  type="button"
                  onClick={() => onScoreRemove(scoreId)}
                  className="hover:bg-red-500/30 dark:hover:bg-red-500/30 rounded-full p-0.5 transition-colors"
                  disabled={isLoading || isEditMode}>

                      <X className="h-3 w-3" />
                    </button>
                  </div>);

          })}
            </div>
        }
        </div>
      }
    </div>);

}