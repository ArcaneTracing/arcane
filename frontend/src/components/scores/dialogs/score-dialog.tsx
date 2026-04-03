"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle } from
"@/components/ui/dialog";
import { ScoreForm } from "../forms/score-form";
import { ScoringType } from "@/types/enums";
import { useEffect } from "react";

export interface ScoreDialogProps {
  score?: Score | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess?: () => void;
}

export function ScoreDialog({ score, open, onOpenChange, projectId, onSuccess }: Readonly<ScoreDialogProps>) {
  const isEditMode = !!score;


  useEffect(() => {
    if (score && score.scoringType === ScoringType.RAGAS && open) {
      onOpenChange(false);
    }
  }, [score, open, onOpenChange]);

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-[#0D0D0D] rounded-2xl shadow-lg border-0 sm:max-w-[700px] p-0 max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-8 pb-6 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold dark:text-white">
            {isEditMode ? 'Edit Score' : 'Create New Score'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            {isEditMode ?
            'Update the scoring criterion configuration.' :
            'Define a reusable scoring criterion for evaluating AI model outputs.'}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 overflow-y-auto flex-1 min-h-0">
          <ScoreForm
            key={score?.id ?? 'create'}
            score={score || null}
            projectId={projectId}
            onSuccess={handleSuccess} />

        </div>
      </DialogContent>
    </Dialog>);

}