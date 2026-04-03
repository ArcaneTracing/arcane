"use client"

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface FormFooterProps {
  isLoading: boolean
  isEditMode: boolean
  canSubmit: boolean
  onCancel: () => void
  onSubmit: () => void
}

export function FormFooter({ isLoading, isEditMode, canSubmit, onCancel, onSubmit }: Readonly<FormFooterProps>) {
  return (
    <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={onSubmit}
        disabled={isLoading || !canSubmit}
      >
        {(() => {
          if (isLoading) {
            return (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            )
          }
          return isEditMode ? 'Update Queue' : 'Create Queue'
        })()}
      </Button>
    </div>
  )
}

