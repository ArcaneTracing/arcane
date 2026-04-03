"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export interface DatasourceFormActionsProps {
  isEditMode: boolean
  busy: boolean
  onCancel: () => void
}

export function DatasourceFormActions({
  isEditMode,
  busy,
  onCancel,
}: Readonly<DatasourceFormActionsProps>) {
  return (
    <div className="flex justify-end gap-2 px-6 py-4 mt-5 border-t border-gray-100 dark:border-[#2A2A2A]">
      <Button
        type="button"
        variant="modern"
        size="sm"
        onClick={onCancel}
        className="h-9 px-4 text-sm font-medium"
        disabled={busy}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={busy}
        size="sm"
        className="h-9 px-4 text-sm font-medium"
      >
        {(() => {
          if (busy) {
            return (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            )
          }
          return isEditMode ? "Update Data Source" : "Create Data Source"
        })()}
      </Button>
    </div>
  )
}
