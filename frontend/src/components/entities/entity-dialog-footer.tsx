import { Button } from "@/components/ui/button"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"

interface EntityDialogFooterProps {
  currentStep: number
  totalSteps: number
  isLoading: boolean
  canProceed: boolean
  isEditMode: boolean
  onPrevious: (e?: React.MouseEvent) => void
  onNext: (e?: React.MouseEvent) => void
  onCancel: () => void
}

export function EntityDialogFooter({
  currentStep,
  totalSteps,
  isLoading,
  canProceed,
  isEditMode,
  onPrevious,
  onNext,
  onCancel,
}: Readonly<EntityDialogFooterProps>) {
  return (
    <div className="flex justify-between items-center gap-2 px-6 py-6 mt-4 flex-shrink-0 border-t border-gray-100 dark:border-[#2A2A2A]">
      <div className="flex gap-2">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="modern"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onPrevious(e)
            }}
            className="h-9 px-4 text-sm font-medium"
            disabled={isLoading}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="modern"
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onCancel()
          }}
          className="h-9 px-4 text-sm font-medium"
          disabled={isLoading}
        >
          Cancel
        </Button>
        {currentStep < totalSteps ? (
          <Button
            type="button"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onNext(e)
            }}
            disabled={isLoading || !canProceed}
            className="h-9 px-4 text-sm font-medium"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            type="submit" 
            size="sm"
            disabled={isLoading || !canProceed}
            className="h-9 px-4 text-sm font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              'Save'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

