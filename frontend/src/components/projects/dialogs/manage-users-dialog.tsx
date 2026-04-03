"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle } from
"@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInviteUser, useRemoveUser, useProjectsQuery, useProjectRoles, useCreateProjectRole, useDeleteProjectRole, useAssignRole, useUsersWithRoles, useAvailableUsers } from "@/hooks/projects/use-projects-query";
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation";
import { Loader2, Trash2, UserPlus, Users, Shield, Plus, X, Check, Upload, FileText } from "lucide-react";
import { useEffect, useState, useMemo, useRef, useId } from "react";
import { ProjectUserWithRolesResponse, AvailableUser } from "@/types/projects";
import { PERMISSIONS } from "@/lib/permissions";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { PermissionGuard } from "@/components/PermissionGuard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { useActionError } from "@/hooks/shared/use-action-error";
import { showSuccessToast } from "@/lib/toast";

export interface ManageUsersDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageUsersDialog({ project, open, onOpenChange }: Readonly<ManageUsersDialogProps>) {
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const [selectedEmail, setSelectedEmail] = useState<string>("");
  const [inviteRoleId, setInviteRoleId] = useState<string>("");
  const inviteActionError = useActionError({ showToast: true, showInline: true });
  const removeActionError = useActionError({ showToast: true, showInline: true });
  const inputRef = useRef<HTMLInputElement>(null);
  const userDatalistId = useId();
  const lastResetRef = useRef<{projectId: string;open: boolean;} | null>(null);


  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isImportRoleOpen, setIsImportRoleOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const roleFileInputId = useId();


  const [editingUserEmail, setEditingUserEmail] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string>("");
  const [originalRoleId, setOriginalRoleId] = useState<string>("");

  const projectId = project?.id || "";
  const organisationId = useOrganisationIdOrNull();


  const { data: availableUsers = [], isLoading: isLoadingAvailable } = useAvailableUsers(projectId);
  const inviteMutation = useInviteUser();
  const removeMutation = useRemoveUser();


  const { data: roles = [], isLoading: isLoadingRoles } = useProjectRoles(projectId);
  const { data: usersWithRoles = [] } = useUsersWithRoles(projectId);
  const createRoleMutation = useCreateProjectRole();
  const deleteRoleMutation = useDeleteProjectRole();
  const assignRoleMutation = useAssignRole();


  const isInviteLoading = inviteMutation.isPending;
  const isRemoveLoading = removeMutation.isPending;
  const isLoading = isInviteLoading || isRemoveLoading;


  const { data: projects = [] } = useProjectsQuery();
  const updatedProject = projects.find((p) => p.id === projectId) || project;


  const displayProject = updatedProject || project;


  const currentUsers: ProjectUserWithRolesResponse[] = usersWithRoles || [];


  const availableUsersToInvite = availableUsers.filter(
    (user) => !currentUsers.some((cu) => cu.email === user.email)
  );


  const filteredUsers = useMemo(() => {
    if (!selectedEmail.trim()) {
      return [];
    }
    const query = selectedEmail.toLowerCase().trim();
    return availableUsersToInvite.
    filter((user) => {
      const emailMatch = user.email.toLowerCase().includes(query);
      const nameMatch = user.name?.toLowerCase().includes(query);
      return emailMatch || nameMatch;
    }).
    slice(0, 10);
  }, [selectedEmail, availableUsersToInvite]);


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
    if (isInviteLoading || isRemoveLoading) {
      return;
    }

    const currentState = { projectId: projectId || '', open };
    const lastState = lastResetRef.current;

    const shouldReset =
    !lastState ||
    lastState.projectId !== currentState.projectId ||
    lastState.open !== currentState.open;

    if (shouldReset && (!open || open && displayProject)) {
      setSelectedEmail("");
      setInviteRoleId("");
      inviteActionError.clear();
      removeActionError.clear();
      setIsCreateRoleOpen(false);
      setRoleName("");
      setRoleDescription("");
      setSelectedPermissions([]);
      setEditingUserEmail(null);
      setEditingRoleId("");
      setOriginalRoleId("");
      setIsImportRoleOpen(false);
      setSelectedFile(null);
      lastResetRef.current = currentState;
    }
  }, [open, projectId, displayProject, isInviteLoading, isRemoveLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && selectedEmail.trim() && !isLoading) {
      e.preventDefault();
      handleInvite();
    } else if (e.key === "Escape") {
      inputRef.current?.blur();
    }
  };

  const handleUserSelect = (user: AvailableUser) => {
    setSelectedEmail(user.email);
    inputRef.current?.blur();
  };

  const handleInvite = async () => {
    if (!displayProject || !selectedEmail.trim() || isInviteLoading) return;

    inviteActionError.clear();
    const emailToInvite = selectedEmail.trim();

    try {
      await inviteMutation.mutateAsync({
        projectId: displayProject.id,
        data: {
          email: emailToInvite,
          ...(inviteRoleId ? { roleId: inviteRoleId } : {})
        }
      });
      setSelectedEmail("");
      setInviteRoleId("");
      showSuccessToast('User invited successfully');
    } catch (error: any) {
      console.error('Failed to invite user:', error);
      inviteActionError.handleError(error);
    }
  };

  const handleRemove = async (email: string) => {
    if (!displayProject) return;

    removeActionError.clear();
    try {
      await removeMutation.mutateAsync({
        projectId: displayProject.id,
        email
      });
      showSuccessToast('User removed successfully');
    } catch (error: any) {
      removeActionError.handleError(error);
    }
  };

  const handleCreateRole = async () => {
    if (!displayProject || !roleName.trim() || createRoleMutation.isPending) return;

    try {
      await createRoleMutation.mutateAsync({
        projectId: displayProject.id,
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
    if (!displayProject) return;

    try {
      await deleteRoleMutation.mutateAsync({
        projectId: displayProject.id,
        roleId
      });
    } catch (error: any) {
      console.error('Failed to delete role:', error);
    }
  };

  const handleStartEditRole = (userEmail: string) => {
    const userWithRoles = usersWithRoles.find((u) => u.email === userEmail);
    const currentRoleId = userWithRoles?.roles?.[0]?.id || "";
    setEditingUserEmail(userEmail);
    setEditingRoleId(currentRoleId);
    setOriginalRoleId(currentRoleId);
  };

  const handleSaveRole = async () => {
    if (!displayProject || !editingUserEmail || assignRoleMutation.isPending) return;

    try {
      await assignRoleMutation.mutateAsync({
        projectId: displayProject.id,
        data: {
          email: editingUserEmail,
          roleId: editingRoleId
        }
      });
      setEditingUserEmail(null);
      setEditingRoleId("");
      setOriginalRoleId("");
    } catch (error: any) {
      console.error('Failed to assign role:', error);
    }
  };

  const handleCancelEditRole = () => {
    setEditingUserEmail(null);
    setEditingRoleId("");
    setOriginalRoleId("");
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
    if (!displayProject || !selectedFile || !organisationId) return;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`/api/organisations/${organisationId}/projects/${displayProject.id}/roles/import`, {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-[#0D0D0D] rounded-2xl shadow-lg border-0 sm:max-w-[700px] p-0 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 pt-8 pb-6 flex items-center gap-4 flex-shrink-0">
          <div className="inline-flex shrink-0">
            <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center">
              <Users className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <div className="text-left flex-1">
            <DialogTitle className="text-xl font-semibold mb-2 dark:text-white">
              Manage Project Users & Roles
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              Add users and manage roles for {displayProject?.name || "this project"}
            </DialogDescription>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "users" | "roles")} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 border-b border-gray-200 dark:border-[#2A2A2A] flex-shrink-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
            </TabsList>
          </div>

          <div className="px-6 pb-6 overflow-y-auto flex-1 min-h-0">
            <TabsContent value="users" className="mt-6 space-y-6">
              {}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium dark:text-gray-200 mb-3 block">
                    Current Users ({currentUsers.length})
                  </Label>
                  {currentUsers.length === 0 ?
                  <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center border border-gray-200 dark:border-[#2A2A2A] rounded-lg">
                      No users in this project
                    </div> :

                  <div className="space-y-2">
                      {currentUsers.map((user) => {
                      const userRoles = user.roles || [];
                      const currentRole = userRoles[0];
                      const isEditing = editingUserEmail === user.email;
                      const hasRoleChanged = editingRoleId !== originalRoleId;

                      return (
                        <div
                          key={user.email}
                          className="flex items-center justify-between p-3 border border-gray-200 dark:border-[#2A2A2A] rounded-lg bg-gray-50 dark:bg-[#1A1A1A]">

                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {user.name || user.email}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.email}
                              </div>
                              {!isEditing && currentRole &&
                            <div className="flex flex-wrap gap-1 mt-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                                    {currentRole.name}
                                  </span>
                                </div>
                            }
                              {isEditing &&
                            <div className="mt-2 flex items-center gap-2">
                                  <Select
                                value={editingRoleId || undefined}
                                onValueChange={(value) => setEditingRoleId(value || "")}>

                                    <SelectTrigger className="h-8 w-[200px]">
                                      <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {roles.map((role) =>
                                  <SelectItem key={role.id} value={role.id}>
                                          {role.name}
                                        </SelectItem>
                                  )}
                                    </SelectContent>
                                  </Select>
                                  {hasRoleChanged &&
                              <>
                                      <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                                  onClick={handleSaveRole}
                                  disabled={assignRoleMutation.isPending}>

                                        {assignRoleMutation.isPending ?
                                  <Loader2 className="h-4 w-4 animate-spin" /> :

                                  <Check className="h-4 w-4" />
                                  }
                                        <span className="sr-only">Save</span>
                                      </Button>
                                      <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                  onClick={handleCancelEditRole}>

                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Cancel</span>
                                      </Button>
                                    </>
                              }
                                </div>
                            }
                            </div>
                            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                              {!isEditing &&
                            <>
                                  <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => handleStartEditRole(user.email)}>

                                    Change Role
                                  </Button>
                                  <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
                                onClick={() => handleRemove(user.email)}
                                disabled={isLoading}>

                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remove user</span>
                                  </Button>
                                </>
                            }
                            </div>
                          </div>);

                    })}
                    </div>
                  }
                </div>
              </div>

              {}
              <PermissionGuard
                permission={PERMISSIONS.PROJECT.MEMBERS_CREATE}
                organisationId={organisationId || undefined}
                projectId={projectId || undefined}>

                <div className="space-y-4 border-t border-gray-200 dark:border-[#2A2A2A] pt-6">
                  <div>
                    <Label className="text-sm font-medium dark:text-gray-200 mb-3 block">
                      Add User
                    </Label>
                    {removeActionError.message &&
                    <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-2 mb-3">
                        {removeActionError.message}
                      </div>
                    }
                    {inviteActionError.message &&
                    <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-2 mb-3">
                        {inviteActionError.message}
                      </div>
                    }
                    
                    <div className="space-y-3">
                      <div className="relative">
                        <Input
                          ref={inputRef}
                          type="text"
                          list={userDatalistId}
                          placeholder={isLoadingAvailable ? "Loading users..." : "Type email or name to search..."}
                          value={selectedEmail}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSelectedEmail(value);
                            const matchedUser = filteredUsers.find((u) => u.email === value);
                            if (matchedUser) {
                              handleUserSelect(matchedUser);
                            }
                          }}
                          onKeyDown={handleKeyDown}
                          disabled={isLoading || isLoadingAvailable}
                          className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white" />

                        <datalist id={userDatalistId}>
                          {filteredUsers.map((user) =>
                          <option key={user.email} value={user.email}>
                              {user.name || user.email}
                            </option>
                          )}
                        </datalist>
                      </div>
                      <div>
                        <Label htmlFor="invite-role" className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                          Assign Role (optional - defaults to "member" if not specified)
                        </Label>
                        <Select value={inviteRoleId || undefined} onValueChange={(value) => setInviteRoleId(value || "")}>
                          <SelectTrigger id="invite-role" className="h-9">
                            <SelectValue placeholder="Default (Member)" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) =>
                            <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        onClick={handleInvite}
                        disabled={!selectedEmail.trim() || isInviteLoading}
                        className="w-full h-9"
                        size="sm">

                        {isInviteLoading ?
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Inviting...
                          </> :

                        <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invite User
                          </>
                        }
                      </Button>
                    </div>
                  </div>
                </div>
              </PermissionGuard>
            </TabsContent>

            <TabsContent value="roles" className="mt-6 space-y-6">
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

            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 px-6 py-6 mt-4 border-t border-gray-200 dark:border-[#2A2A2A] flex-shrink-0">
          <Button
            type="button"
            variant="modern"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 text-sm font-medium"
            disabled={isLoading}>

            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>);

}