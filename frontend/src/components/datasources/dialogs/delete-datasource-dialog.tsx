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

interface DeleteDatasourceDialogProps {
  isOpen: boolean
  isLoading: boolean
  error: string | null
  onClose: () => void
  onConfirm: () => void
}

export function DeleteDatasourceDialog({ 
  isOpen, 
  isLoading, 
  error, 
  onClose, 
  onConfirm 
}: Readonly<DeleteDatasourceDialogProps>) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Datasource</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this datasource? This action cannot be undone.
            {error && <div className="text-red-500 dark:text-red-400 mt-2">{error}</div>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

