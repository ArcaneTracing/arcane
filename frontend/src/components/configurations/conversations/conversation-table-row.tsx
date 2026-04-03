import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { ConversationConfigurationResponse } from "@/types/conversation-configuration"
import { Badge } from "@/components/ui/badge"
import { PermissionGuard } from "@/components/PermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import { useOrganisationId } from "@/hooks/useOrganisation"

interface ConversationTableRowProps {
  configuration: ConversationConfigurationResponse
  onEdit: (configuration: ConversationConfigurationResponse) => void
  onDelete: (configurationId: string) => void
}

export function ConversationTableRow({ configuration, onEdit, onDelete }: Readonly<ConversationTableRowProps>) {
  const organisationId = useOrganisationId()
  return (
    <TableRow className="border-b border-gray-100 dark:border-[#2A2A2A] hover:bg-gray-50/50 dark:hover:bg-[#1F1F1F]/50">
      <TableCell className="py-3">
        <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
          {configuration.name}
        </span>
      </TableCell>
      <TableCell className="text-xs text-gray-600 dark:text-gray-400">
        {configuration.description || '-'}
      </TableCell>
      <TableCell className="py-3">
        <div className="flex flex-wrap gap-1">
          {configuration.stitchingAttributesName.length === 0 ? (
            <span className="text-xs text-gray-400">No attributes</span>
          ) : (
            configuration.stitchingAttributesName.slice(0, 2).map((attr) => (
              <Badge 
                key={attr}
                variant="outline" 
                className="text-[10px] px-1.5 py-0.5 h-5 font-medium"
              >
                {attr}
              </Badge>
            ))
          )}
          {configuration.stitchingAttributesName.length > 2 && (
            <Badge 
              variant="outline" 
              className="text-[10px] px-1.5 py-0.5 h-5 font-medium"
            >
              +{configuration.stitchingAttributesName.length - 2} more
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-xs text-gray-600 dark:text-gray-400">
        {new Date(configuration.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 justify-end">
          <PermissionGuard
            permission={PERMISSIONS.CONVERSATION_CONFIG.UPDATE}
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
            permission={PERMISSIONS.CONVERSATION_CONFIG.DELETE}
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

