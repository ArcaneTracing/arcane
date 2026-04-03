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
import { useUsersWithRoles, useRemoveUser, useAssignRole, useProjectRoles } from "@/hooks/projects/use-projects-query"
import { ProjectUserWithRolesResponse } from "@/types/projects"
import { Trash2, Pencil, Loader2, Check, X } from "lucide-react"
import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { showSuccessToast } from "@/lib/toast"
import { TableContainer } from "@/components/shared/table"
import { PermissionGuard } from "@/components/PermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"

export interface UsersTableProps {
  projectId: string
  organisationId: string
}

export function UsersTable({ projectId, organisationId }: Readonly<UsersTableProps>) {
  const { data: usersWithRoles = [], isLoading } = useUsersWithRoles(projectId)
  const { data: roles = [] } = useProjectRoles(projectId)
  const removeMutation = useRemoveUser()
  const assignRoleMutation = useAssignRole()

  const [editingUserEmail, setEditingUserEmail] = useState<string | null>(null)
  const [editingRoleId, setEditingRoleId] = useState<string>("")
  const [originalRoleId, setOriginalRoleId] = useState<string>("")

  const handleStartEditRole = (user: ProjectUserWithRolesResponse) => {
    const currentRoleId = user.roles?.[0]?.id || ""
    setEditingUserEmail(user.email)
    setEditingRoleId(currentRoleId)
    setOriginalRoleId(currentRoleId)
  }

  const handleSaveRole = async (user: ProjectUserWithRolesResponse) => {
    if (!editingRoleId || assignRoleMutation.isPending) return

    try {
      await assignRoleMutation.mutateAsync({
        projectId,
        userId: user.id,
        data: {
          roleId: editingRoleId,
        },
      })
      setEditingUserEmail(null)
      setEditingRoleId("")
      setOriginalRoleId("")
      showSuccessToast('Role updated successfully')
    } catch (error: any) {
      console.error('Failed to assign role:', error)
    }
  }

  const handleCancelEditRole = () => {
    setEditingUserEmail(null)
    setEditingRoleId("")
    setOriginalRoleId("")
  }

  const handleRemove = async (email: string) => {
    try {
      await removeMutation.mutateAsync({
        projectId,
        email,
      })
      showSuccessToast('User removed successfully')
    } catch (error: any) {
      console.error('Failed to remove user:', error)
    }
  }

  return (
    <TableContainer
      isLoading={isLoading}
      isEmpty={usersWithRoles.length === 0}
      emptyMessage="No users in this project"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usersWithRoles.map((user) => {
            const currentRole = user.roles?.[0]
            const isEditing = editingUserEmail === user.email
            const hasRoleChanged = editingRoleId !== originalRoleId

            const roleDisplay = currentRole ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                {currentRole.name}
              </span>
            ) : (
              <span className="text-xs text-gray-400">No role</span>
            )

            return (
              <TableRow key={user.email}>
                <TableCell className="font-medium">
                  {user.name || user.email}
                </TableCell>
                <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Select
                        value={editingRoleId || undefined}
                        onValueChange={(value) => setEditingRoleId(value || "")}
                      >
                        <SelectTrigger className="w-[200px] h-8">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {hasRoleChanged && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          onClick={() => handleSaveRole(user)}
                          disabled={assignRoleMutation.isPending}
                          data-testid="save-role-button"
                        >
                          {assignRoleMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          <span className="sr-only">Save</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        onClick={handleCancelEditRole}
                        data-testid="cancel-role-edit-button"
                        title="Discard change"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Discard change</span>
                      </Button>
                    </div>
                  ) : (
                    roleDisplay
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {!isEditing && (
                      <>
                        <PermissionGuard
                          permission={PERMISSIONS.PROJECT.ROLES_ASSIGN}
                          organisationId={organisationId}
                          projectId={projectId}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => handleStartEditRole(user)}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Change Role
                          </Button>
                        </PermissionGuard>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                          onClick={() => handleRemove(user.email)}
                          disabled={removeMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove user</span>
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
