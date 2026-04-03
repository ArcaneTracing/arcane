"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useProjectRoles } from "@/hooks/projects/use-projects-query"
import { RoleResponse } from "@/types/rbac"
import { Trash2, Pencil, Shield } from "lucide-react"
import { useState } from "react"
import { TableContainer } from "@/components/shared/table"
import { PermissionGuard } from "@/components/PermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import { DeleteRoleDialog } from "../dialogs/delete-role-dialog"

export interface RolesTableProps {
  projectId: string
  organisationId: string
  onEdit: (role: RoleResponse) => void
  enterprise?: boolean
}

export function RolesTable({ projectId, organisationId, onEdit, enterprise = true }: Readonly<RolesTableProps>) {
  const { data: roles = [], isLoading } = useProjectRoles(projectId)
  const [roleToDelete, setRoleToDelete] = useState<RoleResponse | null>(null)

  return (
    <>
      <TableContainer
        isLoading={isLoading}
        isEmpty={roles.length === 0}
        emptyMessage="No roles created yet"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium">{role.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                  {role.description || '-'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((perm) => (
                      <span
                        key={perm}
                        className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-[#2A2A2A] text-gray-700 dark:text-gray-300 rounded"
                      >
                        {perm}
                      </span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span className="text-xs px-2 py-0.5 text-gray-500 dark:text-gray-400">
                        +{role.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {enterprise && role.canDelete !== false && (
                      <PermissionGuard
                        permission={PERMISSIONS.PROJECT.ROLES_UPDATE}
                        organisationId={organisationId}
                        projectId={projectId}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => onEdit(role)}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </PermissionGuard>
                    )}
                    {enterprise && role.canDelete !== false && (
                      <PermissionGuard
                        permission={PERMISSIONS.PROJECT.ROLES_DELETE}
                        organisationId={organisationId}
                        projectId={projectId}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                          onClick={() => setRoleToDelete(role)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete role</span>
                        </Button>
                      </PermissionGuard>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {roleToDelete && (
        <DeleteRoleDialog
          role={roleToDelete}
          projectId={projectId}
          open={!!roleToDelete}
          onOpenChange={(open) => {
            if (!open) {
              setRoleToDelete(null)
            }
          }}
        />
      )}
    </>
  )
}
