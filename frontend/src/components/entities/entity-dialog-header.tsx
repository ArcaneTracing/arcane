import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { entityTooltips } from "@/constants/entity-tooltips"

interface EntityDialogHeaderProps {
  isEditMode: boolean
}

export function EntityDialogHeader({ isEditMode }: Readonly<EntityDialogHeaderProps>) {
  return (
    <>
      <DialogTitle className="text-xl font-semibold dark:text-white">
        {isEditMode ? 'Edit Entity' : 'Create New Entity'}
      </DialogTitle>
      <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
        {entityTooltips.dialog.header}
      </DialogDescription>
    </>
  )
}

