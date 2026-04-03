"use client";

import { useState, useMemo, useRef, useId, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Trash2, Shield, Plus, X, Upload, FileText } from "lucide-react";
import { useProjectRoles, useCreateProjectRole, useDeleteProjectRole } from "@/hooks/projects/use-projects-query";
import { PERMISSIONS } from "@/lib/permissions";
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation";

export interface RolesTabProps {
  projectId: string;
  organisationId: string;
}

export function RolesTab({ projectId, organisationId }: Readonly<RolesTabProps>) {
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isImportRoleOpen, setIsImportRoleOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const roleFileInputId = useId();

  const { data: roles = [], isLoading: isLoadingRoles } = useProjectRoles(projectId);
  const createRoleMutation = useCreateProjectRole();
  const deleteRoleMutation = useDeleteProjectRole();
  const orgId = useOrganisationIdOrNull();

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
    if (!isCreateRoleOpen && !isImportRoleOpen) {
      setRoleName("");
      setRoleDescription("");
      setSelectedPermissions([]);
      setSelectedFile(null);
    }
  }, [isCreateRoleOpen, isImportRoleOpen]);

  const handleCreateRole = async () => {
    if (!roleName.trim() || createRoleMutation.isPending) return;

    try {
      await createRoleMutation.mutateAsync({
        projectId,
        data: {
          name: roleName.trim(),
          description: roleDescription.trim() || undefined,
          permissions: selectedPermissions
        }
      });
      setIsCreateRoleOpen(false);
      setRoleName("");
      setRoleDescription("");
      setSelectedPermissions([]);
    } catch (error: any) {
      console.error('Failed to create role:', error);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await deleteRoleMutation.mutateAsync({
        projectId,
        roleId
      });
    } catch (error: any) {
      console.error('Failed to delete role:', error);
    }
  };

  const handleFileSelect = (file: File) => {
    const isValidExtension = file.name.toLowerCase().endsWith('.json') ||
    file.name.toLowerCase().endsWith('.yaml') ||
    file.name.toLowerCase().endsWith('.yml');
    const isValidMimeType = [
    'application/json',
    'application/x-yaml',
    'text/yaml',
    'text/plain',
    'application/yaml'].
    includes(file.type) || !file.type;

    if (isValidExtension && (isValidMimeType || !file.type)) {
      setSelectedFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImportRole = async () => {
    if (!selectedFile || !orgId) return;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`/api/organisations/${orgId}/projects/${projectId}/roles/import`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to import role' }));
        throw new Error(errorData.message || 'Failed to import role');
      }

      const roleData = await response.json();


      setRoleName(roleData.name || "");
      setRoleDescription(roleData.description || "");
      setSelectedPermissions(roleData.permissions || []);
      setIsImportRoleOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsCreateRoleOpen(true);
    } catch (error: any) {
      console.error('Failed to import role:', error);
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
    <div className="space-y-6">
      {}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium dark:text-gray-200">
            Project Roles ({roles.length})
          </Label>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsImportRoleOpen(true)}
              className="h-8">

              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button
              size="sm"
              onClick={() => setIsCreateRoleOpen(true)}
              className="h-8">

              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </div>
        </div>
        {(() => {
          if (isLoadingRoles) {
            return (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>);

          }
          if (roles.length === 0) {
            return (
              <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center border border-gray-200 dark:border-[#2A2A2A] rounded-lg">
                No roles created yet
              </div>);

          }
          return (
            <div className="space-y-2">
              {roles.map((role) =>
              <div
                key={role.id}
                className="flex items-start justify-between p-3 border border-gray-200 dark:border-[#2A2A2A] rounded-lg bg-gray-50 dark:bg-[#1A1A1A]">

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {role.name}
                      </span>
                    </div>
                    {role.description &&
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {role.description}
                      </p>
                  }
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((perm) =>
                    <span
                      key={perm}
                      className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-[#2A2A2A] text-gray-700 dark:text-gray-300 rounded">

                          {perm}
                        </span>
                    )}
                      {role.permissions.length > 3 &&
                    <span className="text-xs px-2 py-0.5 text-gray-500 dark:text-gray-400">
                          +{role.permissions.length - 3} more
                        </span>
                    }
                    </div>
                  </div>
                  {role.canDelete !== false &&
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 ml-2 flex-shrink-0"
                  onClick={() => handleDeleteRole(role.id)}
                  disabled={deleteRoleMutation.isPending}>

                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete role</span>
                    </Button>
                }
                </div>
              )}
            </div>);

        })()}
      </div>

      {}
      {isImportRoleOpen &&
      <div className="space-y-4 border-t border-gray-200 dark:border-[#2A2A2A] pt-6">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium dark:text-gray-200">
              Import Role from File
            </Label>
            <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setIsImportRoleOpen(false);
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}>

              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
                Role File (JSON or YAML)
              </Label>
              <input
              id={roleFileInputId}
              ref={fileInputRef}
              type="file"
              accept=".json,.yaml,.yml"
              onChange={handleFileInputChange}
              className="hidden" />

              {selectedFile ?
            <div className="border-2 border-dashed border-gray-300 dark:border-[#2A2A2A] rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-[#3A3A3A] transition-colors">
                  <div className="space-y-2">
                    <FileText className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedFile.name}</p>
                    <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}>

                      Remove
                    </Button>
                  </div>
                </div> :

            <label
              htmlFor={roleFileInputId}
              className="block border-2 border-dashed border-gray-300 dark:border-[#2A2A2A] rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 dark:hover:border-[#3A3A3A] transition-colors">

                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      JSON or YAML files only
                    </p>
                  </div>
                </label>
            }
            </div>
            <Button
            onClick={handleImportRole}
            disabled={!selectedFile}
            className="w-full h-9"
            size="sm">

              <Upload className="mr-2 h-4 w-4" />
              Import Role
            </Button>
          </div>
        </div>
      }

      {}
      {isCreateRoleOpen &&
      <div className="space-y-4 border-t border-gray-200 dark:border-[#2A2A2A] pt-6">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium dark:text-gray-200">
              Create New Role
            </Label>
            <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setIsCreateRoleOpen(false);
              setRoleName("");
              setRoleDescription("");
              setSelectedPermissions([]);
            }}>

              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="role-name" className="text-xs text-gray-600 dark:text-gray-400">
                Role Name
              </Label>
              <Input
              id="role-name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g., Developer, Viewer"
              className="mt-1 h-9" />

            </div>
            <div>
              <Label htmlFor="role-description" className="text-xs text-gray-600 dark:text-gray-400">
                Description (optional)
              </Label>
              <Textarea
              id="role-description"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              placeholder="Describe what this role can do"
              className="mt-1 min-h-[60px]" />

            </div>
            <div>
              <Label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
                Permissions
              </Label>
              <div className="max-h-[200px] overflow-y-auto border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-3 space-y-2">
                {projectPermissions.map((permission) =>
              <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                  id={`perm-${permission}`}
                  checked={selectedPermissions.includes(permission)}
                  onCheckedChange={() => togglePermission(permission)} />

                    <label
                  htmlFor={`perm-${permission}`}
                  className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer flex-1">

                      {permission}
                    </label>
                  </div>
              )}
              </div>
            </div>
            <Button
            onClick={handleCreateRole}
            disabled={!roleName.trim() || selectedPermissions.length === 0 || createRoleMutation.isPending}
            className="w-full h-9"
            size="sm">

              {createRoleMutation.isPending ?
            <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </> :

            <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Role
                </>
            }
            </Button>
          </div>
        </div>
      }
    </div>);

}