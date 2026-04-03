"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"
import { UseMutationResult } from "@tanstack/react-query"
import { EvaluationResponse } from "@/types/evaluations"

interface EvaluationRerunDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  evaluationName?: string
  mutation: UseMutationResult<EvaluationResponse, Error, string, unknown>
  onConfirm: () => void
}

export function EvaluationRerunDialog({
  open,
  onOpenChange,
  evaluationName,
  mutation,
  onConfirm,
}: Readonly<EvaluationRerunDialogProps>) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Re-run Evaluation?</AlertDialogTitle>
          <AlertDialogDescription>
            This will create a new evaluation with the same configuration as "{evaluationName}". This may take some time to complete.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={mutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Re-running...
              </>
            ) : (
              'Re-run'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

