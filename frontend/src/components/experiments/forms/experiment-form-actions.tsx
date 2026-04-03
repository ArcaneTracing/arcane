"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ExperimentFormActionsProps {
  isLoading: boolean
  isValid: boolean
}

export function ExperimentFormActions({
  isLoading,
  isValid,
}: Readonly<ExperimentFormActionsProps>) {
  return (
    <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-[#2A2A2A]">
      <Button
        type="submit"
        disabled={isLoading || !isValid}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          'Create Experiment'
        )}
      </Button>
    </div>
  )
}

