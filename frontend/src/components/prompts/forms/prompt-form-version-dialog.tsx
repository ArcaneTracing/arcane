"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

export interface PromptFormVersionDialogProps {
  open: boolean
  isEditMode: boolean
  isLoading: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function PromptFormVersionDialog({
  open,
  isEditMode,
  isLoading,
  onOpenChange,
  onConfirm,
}: Readonly<PromptFormVersionDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Save as New Version' : 'Save Prompt'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Save your changes as a new version. The next version number (e.g. v2) will be assigned automatically.'
              : 'Create the initial version of this prompt. It will be saved as v0.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
          >
            {(() => {
              if (isLoading) {
                return (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                )
              }
              return isEditMode ? 'Save Version' : 'Save Prompt'
            })()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
