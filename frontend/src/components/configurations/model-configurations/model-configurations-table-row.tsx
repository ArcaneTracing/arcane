import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { ModelConfigurationResponse } from "@/types/model-configuration"
import { Badge } from "@/components/ui/badge"
import { PermissionGuard } from "@/components/PermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import { useOrganisationId } from "@/hooks/useOrganisation"

interface ModelConfigurationsTableRowProps {
  configuration: ModelConfigurationResponse
  onEdit: (configuration: ModelConfigurationResponse) => void
  onDelete: (configurationId: string) => void
}

export function ModelConfigurationsTableRow({ configuration, onEdit, onDelete }: Readonly<ModelConfigurationsTableRowProps>) {
  const organisationId = useOrganisationId()
  return (
    <TableRow className="border-b border-gray-100 dark:border-[#2A2A2A] hover:bg-gray-50/50 dark:hover:bg-[#1F1F1F]/50">
      <TableCell className="py-3">
        <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
          {configuration.name}
        </span>
      </TableCell>
      <TableCell className="py-3">
        <Badge 
          variant="outline" 
          className="text-[10px] px-2 py-0.5 h-5 font-medium"
        >
          {configuration.configuration.adapter || '-'}
        </Badge>
      </TableCell>
      <TableCell className="text-xs text-gray-600 dark:text-gray-400">
        {configuration.configuration.modelName || '-'}
      </TableCell>
      <TableCell className="text-xs text-gray-600 dark:text-gray-400">
        {new Date(configuration.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 justify-end">
          <PermissionGuard
            permission={PERMISSIONS.MODEL_CONFIGURATION.UPDATE}
            organisationId={organisationId}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-[#1F1F1F]/80"
              onClick={() => onEdit(configuration)}
            >
              <span className="sr-only">Edit</span>
              <Pencil className="h-4 w-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard
            permission={PERMISSIONS.MODEL_CONFIGURATION.DELETE}
            organisationId={organisationId}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
              onClick={() => onDelete(configuration.id)}
            >
              <span className="sr-only">Delete</span>
              <Trash2 className="h-4 w-4" />
            </Button>
          </PermissionGuard>
        </div>
      </TableCell>
    </TableRow>
  )
}

