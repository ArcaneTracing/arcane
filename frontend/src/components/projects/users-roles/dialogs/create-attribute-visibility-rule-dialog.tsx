"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  useCreateAttributeVisibilityRule,
  useProjectRoles,
} from "@/hooks/projects/use-projects-query"
import { Loader2, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { useActionError } from "@/hooks/shared/use-action-error"
import { showSuccessToast } from "@/lib/toast"
import { FormErrorDisplay } from "@/components/shared/form-error-display"

export interface CreateAttributeVisibilityRuleDialogProps {
  projectId: string
  organisationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateAttributeVisibilityRuleDialog({
  projectId,
  organisationId,
  open,
  onOpenChange,
}: Readonly<CreateAttributeVisibilityRuleDialogProps>) {
  const [attributeName, setAttributeName] = useState("")
  const [hiddenFromRoleIds, setHiddenFromRoleIds] = useState<string[]>([])
  const actionError = useActionError({ showToast: true, showInline: true })

  const createMutation = useCreateAttributeVisibilityRule()
  const { data: roles = [] } = useProjectRoles(projectId)
  const isLoading = createMutation.isPending

  useEffect(() => {
    if (!open) {
      setAttributeName("")
      setHiddenFromRoleIds([])
      actionError.clear()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!attributeName.trim() || isLoading) return

    actionError.clear()
    try {
      await createMutation.mutateAsync({
        projectId,
        data: {
          attributeName: attributeName.trim(),
          hiddenRoleIds: hiddenFromRoleIds,
        },
      })
      showSuccessToast("Visibility rule created successfully")
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
            Add Visibility Rule
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            Select which roles the attribute is hidden from. Unselected roles can
            see it.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 pb-6 overflow-y-auto flex-1 space-y-4">
            {actionError.message && (
              <FormErrorDisplay error={actionError.message} variant="default" />
            )}

            <div className="space-y-2">
              <Label htmlFor="attribute-name">Attribute Name</Label>
              <Input
                id="attribute-name"
                value={attributeName}
                onChange={(e) => setAttributeName(e.target.value)}
                placeholder="e.g., api.key, user.email"
                required
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label>Hide from Roles</Label>
              <p className="text-xs text-muted-foreground">
                Check the roles to hide this attribute from. Unchecked roles can
                see it. Check all = hidden from everyone.
              </p>
              <div className="max-h-[200px] overflow-y-auto border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-3 space-y-2">
                {roles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No roles available. Create roles in the Roles tab first.
                  </p>
                ) : (
                  roles.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={hiddenFromRoleIds.includes(role.id)}
                        onCheckedChange={() => toggleRole(role.id)}
                      />
                      <label
                        htmlFor={`role-${role.id}`}
                        className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
                      >
                        {role.name}
                      </label>
                    </div>
                  ))
                )}
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
            <Button type="submit" disabled={!attributeName.trim() || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Rule
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
