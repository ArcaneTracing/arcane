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
import { PermissionGuard } from "@/components/PermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"

interface DeleteProjectDialogProps {
  isOpen: boolean
  isLoading: boolean
  error: string | null
  onClose: () => void
  onConfirm: () => void
  organisationId?: string
  projectId?: string
}

export function DeleteProjectDialog({ 
  isOpen, 
  isLoading, 
  error, 
  onClose, 
  onConfirm,
  organisationId,
  projectId
}: Readonly<DeleteProjectDialogProps>) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the project.
            {error && <div className="text-red-500 dark:text-red-400 mt-2">{error}</div>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <PermissionGuard
            permission={PERMISSIONS.PROJECT.DELETE}
            organisationId={organisationId}
            projectId={projectId}
          >
            <AlertDialogAction 
              onClick={onConfirm} 
              className="bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </PermissionGuard>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

