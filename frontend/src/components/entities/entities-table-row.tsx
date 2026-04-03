import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { EntityResponse } from "@/types/entities"
import { Badge } from "@/components/ui/badge"
import { 
  getEntityIcon, 
  getEntityIconColor, 
  getEntityTypeName, 
  getPatternMatchTypeLabel 
} from "@/lib/entity-utils"
import { EntityType } from "@/types/enums"
import { PermissionGuard } from "@/components/PermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import { useOrganisationId } from "@/hooks/useOrganisation"

interface EntitiesTableRowProps {
  entity: EntityResponse
  onEdit: (entity: EntityResponse) => void
  onDelete: (entityId: string) => void
}

export function EntitiesTableRow({ entity, onEdit, onDelete }: Readonly<EntitiesTableRowProps>) {
  const organisationId = useOrganisationId()
  const iconColor = getEntityIconColor(entity.entityType, entity.iconId)
  const EntityIcon = getEntityIcon(
    entity.entityType, 
    iconColor,
    entity.entityType === EntityType.CUSTOM ? entity.iconId : undefined
  )
  const typeName = getEntityTypeName(
    entity.entityType, 
    entity.entityType === EntityType.CUSTOM ? entity.type : undefined
  )
  const patternLabel = getPatternMatchTypeLabel(entity.matchingPatternType)
  
  return (
    <TableRow className="border-b border-gray-100 dark:border-[#2A2A2A] hover:bg-gray-50/50 dark:hover:bg-[#1F1F1F]/50">
      <TableCell className="py-3">
        <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
          {entity.name}
        </span>
      </TableCell>
      <TableCell className="py-3">
        <div className="flex items-center gap-2">
          <span className="flex-shrink-0">
            {EntityIcon}
          </span>
          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
            {typeName}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-xs text-gray-600 dark:text-gray-400">
        {entity.description}
      </TableCell>
      <TableCell className="text-xs text-gray-600 dark:text-gray-400">
        <Badge 
          variant="outline" 
          className="text-[10px] px-1.5 py-0.5 h-5 font-medium"
        >
          {patternLabel}
        </Badge>
      </TableCell>
      <TableCell className="text-xs text-gray-600 dark:text-gray-400">
        {new Date(entity.createdAt || entity.updatedAt || entity.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 justify-end">
          <PermissionGuard
            permission={PERMISSIONS.ENTITY.UPDATE}
            organisationId={organisationId}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-[#1F1F1F]/80"
              onClick={() => onEdit(entity)}
            >
              <span className="sr-only">Edit</span>
              <Pencil className="h-4 w-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard
            permission={PERMISSIONS.ENTITY.DELETE}
            organisationId={organisationId}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
              onClick={() => onDelete(entity.id)}
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

