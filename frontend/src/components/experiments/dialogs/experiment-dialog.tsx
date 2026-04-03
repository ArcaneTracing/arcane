"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle } from
"@/components/ui/dialog";
import { ExperimentForm } from "../forms/experiment-form";
import { ExperimentResponse } from "@/types/experiments";

export interface ExperimentDialogProps {
  experiment?: ExperimentResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess?: () => void;
}

export function ExperimentDialog({ experiment, open, onOpenChange, projectId, onSuccess }: Readonly<ExperimentDialogProps>) {
  const prevPropsRef = useRef({ experiment, open, projectId, onSuccess, onOpenChange });
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current += 1;
    prevPropsRef.current = { experiment, open, projectId, onSuccess, onOpenChange };
  });

  const isEditMode = !!experiment;

  const handleSuccessRef = useRef(onSuccess);
  const onOpenChangeRef = useRef(onOpenChange);

  useEffect(() => {
    handleSuccessRef.current = onSuccess;
    onOpenChangeRef.current = onOpenChange;
  }, [onSuccess, onOpenChange]);

  const handleSuccess = useCallback(() => {
    handleSuccessRef.current?.();
    onOpenChangeRef.current(false);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-[#0D0D0D] rounded-2xl shadow-lg border-0 sm:max-w-[700px] p-0 max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-8 pb-6 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold dark:text-white">
            {isEditMode ? 'View experiment' : 'Create New Experiment'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            {isEditMode ?
            'Experiment configuration cannot be updated. Create a new experiment to use different settings.' :
            'Run a prompt version against a dataset to test performance.'}
          </DialogDescription>
        </DialogHeader>

        {open &&
        <div className="px-6 pb-6 overflow-y-auto flex-1 min-h-0">
            <ExperimentForm
            key={experiment?.id || 'new'}
            experiment={experiment || null}
            projectId={projectId}
            onSuccess={handleSuccess} />

          </div>
        }
      </DialogContent>
    </Dialog>);

}