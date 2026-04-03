"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger } from
"@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateProjectRole, useUpdateProjectRole } from "@/hooks/projects/use-projects-query";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { RoleResponse } from "@/types/rbac";
import { PERMISSIONS } from "@/lib/permissions";
import { useActionError } from "@/hooks/shared/use-action-error";
import { showSuccessToast } from "@/lib/toast";
import { FormErrorDisplay } from "@/components/shared/form-error-display";

export interface CreateRoleDialogProps {
  projectId: string;
  role?: RoleResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function CreateRoleDialog({ projectId, role, open, onOpenChange, trigger }: Readonly<CreateRoleDialogProps>) {
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const actionError = useActionError({ showToast: true, showInline: true });

  const createMutation = useCreateProjectRole();
  const updateMutation = useUpdateProjectRole();
  const mutation = role ? updateMutation : createMutation;
  const isEditMode = !!role;
  const isLoading = mutation.isPending;

  const projectPermissions = useMemo(() => {
    return Object.values(PERMISSIONS).
    flatMap((category) => Object.values(category)).
    filter((perm) => typeof perm === 'string').
    filter((perm) => {

      if (perm.startsWith('organisations:')) {
        return false;
      }

      if (perm === '*') {
        return false;
      }

      if (perm.startsWith('entities:') ||
      perm.startsWith('model-configurations:') ||
      perm.startsWith('conversation-configurations:')) {
        return perm.endsWith(':read');
      }
      return true;
    });
  }, []);


  useEffect(() => {
    if (role && open) {
      setRoleName(role.name);
      setRoleDescription(role.description || "");
      setSelectedPermissions(role.permissions || []);
    } else if (!open) {
      setRoleName("");
      setRoleDescription("");
      setSelectedPermissions([]);
      actionError.clear();
    }
  }, [role, open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roleName.trim() || isLoading) return;

    actionError.clear();
    try {
      if (isEditMode) {
        if (!role) return;
        await updateMutation.mutateAsync({
          projectId,
          roleId: role.id,
          data: {
            name: roleName.trim(),
            description: roleDescription.trim() || undefined,
            permissions: selectedPermissions
          }
        });
        showSuccessToast('Role updated successfully');
      } else {
        await createMutation.mutateAsync({
          projectId,
          data: {
            name: roleName.trim(),
            description: roleDescription.trim() || undefined,
            permissions: selectedPermissions
          }
        });
        showSuccessToast('Role created successfully');
      }
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to save role:', error);
      actionError.handleError(error);
    }
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
    prev.includes(permission) ?
    prev.filter((p) => p !== permission) :
    [...prev, permission]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="bg-white dark:bg-[#0D0D0D] rounded-2xl shadow-lg border-0 sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold mb-2 dark:text-white">
            {isEditMode ? 'Edit Role' : 'Create Role'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            {isEditMode ? 'Update role details and permissions' : 'Create a new role with custom permissions'}
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 pb-6 overflow-y-auto flex-1 space-y-4">
            {actionError.message &&
            <FormErrorDisplay error={actionError.message} variant="default" />
            }

            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g., Developer, Viewer"
                required />

            </div>

            <div className="space-y-2">
              <Label htmlFor="role-description">Description (optional)</Label>
              <Textarea
                id="role-description"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                placeholder="Describe what this role can do"
                className="min-h-[80px]" />

            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="max-h-[300px] overflow-y-auto border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-3 space-y-2">
                {projectPermissions.map((permission) =>
                <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                    id={`perm-${permission}`}
                    checked={selectedPermissions.includes(permission)}
                    onCheckedChange={() => togglePermission(permission)} />

                    <label
                    htmlFor={`perm-${permission}`}
                    className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1">

                      {permission}
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 dark:border-[#2A2A2A] flex justify-end gap-2 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}>

              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!roleName.trim() || selectedPermissions.length === 0 || isLoading}>

              {isLoading ?
              <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </> :

              <>
                  <Plus className="mr-2 h-4 w-4" />
                  {isEditMode ? 'Update Role' : 'Create Role'}
                </>
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>);

}