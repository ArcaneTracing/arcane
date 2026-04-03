"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle } from
"@/components/ui/dialog";
import { ScoringType } from "@/types/enums";
import { useState } from "react";
import { Loader2, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDeleteScore, useScoreQuery } from "@/hooks/scores/use-scores-query";
import { useActionError } from "@/hooks/shared/use-action-error";
import { showSuccessToast } from "@/lib/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle } from
"@/components/ui/alert-dialog";

export interface ScoreViewDialogProps {
  scoreId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onEdit?: (score: Score) => void;
  onDelete?: () => void;
}

export function ScoreViewDialog({ scoreId, open, onOpenChange, projectId, onEdit, onDelete }: Readonly<ScoreViewDialogProps>) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const deleteMutation = useDeleteScore(projectId);
  const { data: score, isLoading, error: queryError } = useScoreQuery(projectId, open ? scoreId : undefined);
  const deleteActionError = useActionError({ showToast: true });

  const handleDelete = async () => {
    if (!scoreId) return;
    try {
      await deleteMutation.mutateAsync(scoreId);
      showSuccessToast('Score deleted successfully');
      if (onDelete) {
        onDelete();
      }
      onOpenChange(false);
      setDeleteDialogOpen(false);
    } catch (err) {
      deleteActionError.handleError(err);
    }
  };

  const getScaleInfo = () => {
    if (!score) return null;

    if ((score.scoringType === ScoringType.ORDINAL || score.scoringType === ScoringType.NOMINAL) && score.scale) {
      return (
        <div className="space-y-2">
          {score.scale.map((option) =>
          <div key={`${option.label}-${option.value}`} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-[#1A1A1A] rounded">
              <span className="text-sm font-medium">{option.label}</span>
              <Badge variant="outline">{option.value}</Badge>
            </div>
          )}
        </div>);

    }
    return <p className="text-sm text-gray-500 dark:text-gray-400">No scale configured</p>;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-white dark:bg-[#0D0D0D] rounded-2xl shadow-lg border-0 sm:max-w-[600px] p-0 max-h-[90vh] flex flex-col overflow-hidden">
          <div className="px-6 pt-8 pb-6 flex items-center justify-between flex-shrink-0">
            <DialogHeader className="flex-1">
              <DialogTitle className="text-xl font-semibold dark:text-white">
                Score Details
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                View score configuration
              </DialogDescription>
            </DialogHeader>
            {score && score.scoringType !== ScoringType.RAGAS &&
            <div className="flex gap-2">
                <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (onEdit && score) {
                    onEdit(score);
                  }
                }}>

                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">

                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            }
          </div>

          <div className="px-6 pb-6 overflow-y-auto flex-1 min-h-0">
            {isLoading &&
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin" />
              </div>
            }
            {!isLoading && queryError &&
            <div className="text-sm text-red-500 dark:text-red-400">
                Error: {queryError.message || String(queryError)}
              </div>
            }
            {!isLoading && !queryError && !score &&
            <div className="text-sm text-gray-500 dark:text-gray-400">
                Score not found
              </div>
            }
            {!isLoading && !queryError && score &&
            <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{score.name}</CardTitle>
                      <Badge variant="outline">{score.scoringType}</Badge>
                    </div>
                    {score.description &&
                  <CardDescription className="mt-2">
                        {score.description}
                      </CardDescription>
                  }
                    <CardDescription>
                      Created {new Date(score.createdAt).toLocaleDateString()} • 
                      Updated {new Date(score.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {score.scoringType === 'RAGAS' ?
                  <div>
                        <h3 className="text-sm font-medium mb-3">RAGAS Score Configuration</h3>
                        {score.ragasScoreKey &&
                    <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">RAGAS Score Key:</span>
                              <span className="text-sm font-medium">{score.ragasScoreKey}</span>
                            </div>
                          </div>
                    }
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          This is a system-generated RAGAS score and cannot be edited.
                        </p>
                      </div> :

                  <>
                        <div>
                          <h3 className="text-sm font-medium mb-3">Scale Configuration</h3>
                          {getScaleInfo()}
                        </div>

                        {}
                        {score.scoringType === ScoringType.ORDINAL && score.ordinalConfig &&
                    <div>
                            <h3 className="text-sm font-medium mb-3">Ordinal Configuration</h3>
                            <div className="space-y-3">
                              {score.ordinalConfig.acceptable_set && score.ordinalConfig.acceptable_set.length > 0 &&
                        <div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">Acceptable Set:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {score.ordinalConfig.acceptable_set.map((label) =>
                            <Badge key={label} variant="outline" className="text-xs">
                                        {label}
                                      </Badge>
                            )}
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 italic">
                                    Used for pass_rate calculation
                                  </p>
                                </div>
                        }
                              {score.ordinalConfig.threshold_rank !== undefined &&
                        <div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">Threshold Rank:</p>
                                  <Badge variant="outline" className="text-xs">
                                    {score.ordinalConfig.threshold_rank}
                                  </Badge>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 italic">
                                    Used for tail_mass_below calculation
                                  </p>
                                </div>
                        }
                              {(!score.ordinalConfig.acceptable_set || score.ordinalConfig.acceptable_set.length === 0) &&
                        score.ordinalConfig.threshold_rank === undefined &&
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                  No ordinal configuration set
                                </p>
                        }
                            </div>
                          </div>
                    }
                        
                        {score.evaluatorPrompt?.id &&
                    <div>
                            <h3 className="text-sm font-medium mb-2">Evaluator Prompt</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Prompt ID: {score.evaluatorPrompt.id}
                            </p>
                          </div>
                    }
                      </>
                  }
                  </CardContent>
                </Card>
              </div>
            }
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the score "{score?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700">

              {deleteMutation.isPending ?
              <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </> :

              'Delete'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>);

}