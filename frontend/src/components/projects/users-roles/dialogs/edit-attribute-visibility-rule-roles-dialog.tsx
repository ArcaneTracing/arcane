"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  useAddRolesToVisibilityRule,
  useRemoveRolesFromVisibilityRule,
  useProjectRoles,
} from "@/hooks/projects/use-projects-query"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import type { AttributeVisibilityRuleResponse } from "@/types/attribute-visibility"
import { useActionError } from "@/hooks/shared/use-action-error"
import { showSuccessToast } from "@/lib/toast"
import { FormErrorDisplay } from "@/components/shared/form-error-display"

export interface EditAttributeVisibilityRuleRolesDialogProps {
  rule: AttributeVisibilityRuleResponse
  projectId: string
  organisationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditAttributeVisibilityRuleRolesDialog({
  rule,
  projectId,
  organisationId,
  open,
  onOpenChange,
}: Readonly<EditAttributeVisibilityRuleRolesDialogProps>) {
  const [hiddenFromRoleIds, setHiddenFromRoleIds] = useState<string[]>([])
  const actionError = useActionError({ showToast: true, showInline: true })

  const addMutation = useAddRolesToVisibilityRule()
  const removeMutation = useRemoveRolesFromVisibilityRule()
  const { data: roles = [] } = useProjectRoles(projectId)
  const isLoading = addMutation.isPending || removeMutation.isPending

  useEffect(() => {
    if (rule && open) {
      setHiddenFromRoleIds(rule.hiddenRoleIds)
    }
  }, [rule, open])

  useEffect(() => {
    if (!open) {
      actionError.clear()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoading) return

    const toAdd = hiddenFromRoleIds.filter((id) => !rule.hiddenRoleIds.includes(id))
    const toRemove = rule.hiddenRoleIds.filter((id) => !hiddenFromRoleIds.includes(id))

    actionError.clear()
    try {
      if (toAdd.length > 0) {
        await addMutation.mutateAsync({
          projectId,
          ruleId: rule.id,
          data: { roleIds: toAdd },
        })
      }
      if (toRemove.length > 0) {
        await removeMutation.mutateAsync({
          projectId,
          ruleId: rule.id,
          data: { roleIds: toRemove },
        })
      }
      if (toAdd.length > 0 || toRemove.length > 0) {
        showSuccessToast("Visibility rule updated successfully")
      }
      onOpenChange(false)
    } catch (error: unknown) {
      actionError.handleError(error)
    }
  }

  const toggleRole = (roleId: string) => {
    setHiddenFromRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-[#0D0D0D] rounded-2xl shadow-lg border-0 sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold mb-2 dark:text-white">
            Edit Hide from Roles
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            Update which roles the attribute &quot;{rule.attributeName}&quot; is
            hidden from
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 pb-6 overflow-y-auto flex-1 space-y-4">
            {actionError.message && (
              <FormErrorDisplay error={actionError.message} variant="default" />
            )}

            <div className="space-y-2">
              <Label>Hide from Roles</Label>
              <p className="text-xs text-muted-foreground">
                Check the roles to hide this attribute from. Unchecked roles can
                see it.
              </p>
              <div className="max-h-[300px] overflow-y-auto border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-3 space-y-2">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-role-${role.id}`}
                      checked={hiddenFromRoleIds.includes(role.id)}
                      onCheckedChange={() => toggleRole(role.id)}
                    />
                    <label
                      htmlFor={`edit-role-${role.id}`}
                      className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
                    >
                      {role.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 dark:border-[#2A2A2A] flex justify-end gap-2 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
