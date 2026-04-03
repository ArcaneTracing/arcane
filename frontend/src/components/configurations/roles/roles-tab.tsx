"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from
'@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useOrganisationRoles,
  useCreateOrganisationRole,
  useUpdateOrganisationRole,
  useDeleteOrganisationRole } from
'@/hooks/organisations/use-organisation-config-query';
import { Plus, Trash2, Loader2, Edit, Shield } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { PermissionGuard } from '@/components/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';
import { RoleResponse } from '@/types/rbac';

export function RolesTab() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);


  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const { data: roles = [], isLoading: isLoadingRoles } = useOrganisationRoles();
  const createMutation = useCreateOrganisationRole();
  const updateMutation = useUpdateOrganisationRole();
  const deleteMutation = useDeleteOrganisationRole();


  const organisationPermissions = useMemo(() => {
    return Object.values(PERMISSIONS.ORGANISATION).filter((perm) => typeof perm === 'string');
  }, []);

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
    prev.includes(permission) ?
    prev.filter((p) => p !== permission) :
    [...prev, permission]
    );
  };

  const resetForm = () => {
    setRoleName('');
    setRoleDescription('');
    setSelectedPermissions([]);
    setEditingRole(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (role: RoleResponse) => {
    if (role.isSystemRole) {
      showErrorToast('System roles cannot be edited');
      return;
    }
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || '');
    setSelectedPermissions(role.permissions);
    setIsCreateDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!roleName.trim()) {
      showErrorToast('Role name is required');
      return;
    }
    if (selectedPermissions.length === 0) {
      showErrorToast('At least one permission is required');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: roleName.trim(),
        description: roleDescription.trim() || undefined,
        permissions: selectedPermissions
      });
      showSuccessToast('Role created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error: any) {
      showErrorToast(error?.response?.data?.message || 'Failed to create role');
    }
  };

  const handleUpdate = async () => {
    if (!editingRole || !roleName.trim()) {
      showErrorToast('Role name is required');
      return;
    }
    if (selectedPermissions.length === 0) {
      showErrorToast('At least one permission is required');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        roleId: editingRole.id,
        data: {
          name: roleName.trim(),
          description: roleDescription.trim() || undefined,
          permissions: selectedPermissions
        }
      });
      showSuccessToast('Role updated successfully');
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error: any) {
      showErrorToast(error?.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;

    const role = roles.find((r) => r.id === roleToDelete);
    if (!role) return;

    if (role.isSystemRole) {
      showErrorToast('System roles cannot be deleted');
      setRoleToDelete(null);
      return;
    }

    try {
      await deleteMutation.mutateAsync(roleToDelete);
      showSuccessToast('Role deleted successfully');
      setRoleToDelete(null);
    } catch (error: any) {
      showErrorToast(error?.response?.data?.message || 'Failed to delete role');
    }
  };

  const isEditing = !!editingRole;
  const customRoles = roles.filter((role) => !role.isSystemRole);
  const systemRoles = roles.filter((role) => role.isSystemRole);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Roles ({roles.length})</h2>
        <PermissionGuard permission={PERMISSIONS.ORGANISATION.ROLES_CREATE}>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </PermissionGuard>
      </div>

      {(() => {
        if (isLoadingRoles) {
          return (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" data-testid="icon-loader2" />
            </div>);

        }
        if (roles.length === 0) {
          return (
            <div className="text-center py-12 border border-gray-200 dark:border-[#2A2A2A] rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">No roles found</p>
            </div>);

        }
        return (
          <>
          {}
          {systemRoles.length > 0 &&
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">System Roles</h3>
              <div className="rounded-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemRoles.map((role) =>
                    <TableRow key={role.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {role.name}
                            <Shield className="h-3 w-3 text-gray-400" />
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                          {role.description || 'N/A'}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                          {role.permissions.includes('*') ? 'All permissions' : `${role.permissions.length} permission(s)`}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-xs text-gray-400">System role</span>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            }

          {}
          {customRoles.length > 0 &&
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Roles</h3>
              <div className="rounded-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customRoles.map((role) =>
                    <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                          {role.description || 'N/A'}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                          {role.permissions.includes('*') ? 'All permissions' : `${role.permissions.length} permission(s)`}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {role.canDelete !== false &&
                          <PermissionGuard permission={PERMISSIONS.ORGANISATION.ROLES_UPDATE}>
                                <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(role)}
                              className="h-8 w-8">

                                  <Edit className="h-3 w-3" data-testid="icon-edit" />
                                </Button>
                              </PermissionGuard>
                          }
                            {role.canDelete !== false &&
                          <PermissionGuard permission={PERMISSIONS.ORGANISATION.ROLES_DELETE}>
                                <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setRoleToDelete(role.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive">

                                  <Trash2 className="h-3 w-3" data-testid="icon-trash2" />
                                </Button>
                              </PermissionGuard>
                          }
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            }
        </>);

      })()}

      {}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Role' : 'Create Role'}</DialogTitle>
            <DialogDescription>
              {isEditing ?
              'Update the role name, description, and permissions.' :
              'Create a new custom role for your organization.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                placeholder="Enter role name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)} />

            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Description (optional)</Label>
              <Textarea
                id="role-description"
                placeholder="Enter role description"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                rows={3} />

            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="max-h-[300px] overflow-y-auto border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-3 space-y-2">
                {organisationPermissions.map((permission) =>
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
              {selectedPermissions.length === 0 &&
              <p className="text-xs text-destructive">At least one permission is required</p>
              }
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button
              onClick={isEditing ? handleUpdate : handleCreate}
              disabled={
              !roleName.trim() ||
              selectedPermissions.length === 0 ||
              createMutation.isPending ||
              updateMutation.isPending
              }>

              {(createMutation.isPending || updateMutation.isPending) &&
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              }
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this role? Users with this role will lose their permissions. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}>

              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);

}