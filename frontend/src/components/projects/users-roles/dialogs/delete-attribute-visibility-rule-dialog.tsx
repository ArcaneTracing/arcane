"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useDeleteAttributeVisibilityRule } from "@/hooks/projects/use-projects-query"
import { Loader2 } from "lucide-react"
import type { AttributeVisibilityRuleResponse } from "@/types/attribute-visibility"
import { useActionError } from "@/hooks/shared/use-action-error"
import { showSuccessToast } from "@/lib/toast"
import { FormErrorDisplay } from "@/components/shared/form-error-display"

export interface DeleteAttributeVisibilityRuleDialogProps {
  rule: AttributeVisibilityRuleResponse
  projectId: string
  organisationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteAttributeVisibilityRuleDialog({
  rule,
  projectId,
  open,
  onOpenChange,
}: Readonly<DeleteAttributeVisibilityRuleDialogProps>) {
  const deleteMutation = useDeleteAttributeVisibilityRule()
  const actionError = useActionError({ showToast: true, showInline: true })
  const isLoading = deleteMutation.isPending

  const handleDelete = async () => {
    actionError.clear()
    try {
      await deleteMutation.mutateAsync({
        projectId,
        ruleId: rule.id,
      })
      showSuccessToast("Visibility rule deleted successfully")
      onOpenChange(false)
    } catch (error: unknown) {
      actionError.handleError(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-[#0D0D0D] rounded-2xl shadow-lg border-0 sm:max-w-[500px]">
        <div className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold mb-2 dark:text-white">
            Delete Visibility Rule
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete the visibility rule for &quot;
            {rule.attributeName}&quot;? This attribute will be visible to all
            users.
          </DialogDescription>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {actionError.message && (
            <FormErrorDisplay error={actionError.message} variant="default" />
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Rule"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
