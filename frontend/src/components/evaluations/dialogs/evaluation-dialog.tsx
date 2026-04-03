"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { EvaluationForm } from "../forms/evaluation-form"
import { EvaluationResponse } from "@/types/evaluations"

export interface EvaluationDialogProps {
  evaluation?: EvaluationResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  onSuccess?: () => void
}

export function EvaluationDialog({ evaluation, open, onOpenChange, projectId, onSuccess }: Readonly<EvaluationDialogProps>) {
  const isEditMode = !!evaluation
  const [footerEl, setFooterEl] = React.useState<HTMLDivElement | null>(null)

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess()
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-[#0D0D0D] rounded-2xl shadow-lg border-0 sm:max-w-[700px] p-0 max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-8 pb-6 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold dark:text-white">
            {isEditMode ? 'Edit Evaluation' : 'Create New Evaluation'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            {isEditMode 
              ? 'Update the evaluation configuration.' 
              : 'Create a new evaluation to assess datasets or experiments using scores.'}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4 overflow-y-auto flex-1 min-h-0">
          <EvaluationForm 
            evaluation={evaluation || null} 
            projectId={projectId}
            onSuccess={handleSuccess}
            footerEl={footerEl}
          />
        </div>

        <div
          ref={setFooterEl}
          className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D]"
        />
      </DialogContent>
    </Dialog>
  )
}

