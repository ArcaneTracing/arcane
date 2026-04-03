"use client";

import { useState, useMemo, useRef, useId, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, UserPlus, X, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { useInviteUser, useRemoveUser, useProjectRoles, useAssignRole, useUsersWithRoles, useAvailableUsers } from "@/hooks/projects/use-projects-query";
import { ProjectUserWithRolesResponse, AvailableUser } from "@/types/projects";
import { PERMISSIONS } from "@/lib/permissions";
import { PermissionGuard } from "@/components/PermissionGuard";
import { useActionError } from "@/hooks/shared/use-action-error";
import { showSuccessToast } from "@/lib/toast";

export interface UsersTabProps {
  projectId: string;
  organisationId: string;
}

export function UsersTab({ projectId, organisationId }: Readonly<UsersTabProps>) {
  const [selectedEmail, setSelectedEmail] = useState<string>("");
  const [inviteRoleId, setInviteRoleId] = useState<string>("");
  const inviteActionError = useActionError({ showToast: true, showInline: true });
  const removeActionError = useActionError({ showToast: true, showInline: true });
  const inputRef = useRef<HTMLInputElement>(null);
  const userDatalistId = useId();


  const [editingUserEmail, setEditingUserEmail] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string>("");
  const [originalRoleId, setOriginalRoleId] = useState<string>("");

  const { data: availableUsers = [], isLoading: isLoadingAvailable } = useAvailableUsers(projectId);
  const inviteMutation = useInviteUser();
  const removeMutation = useRemoveUser();

  const { data: roles = [] } = useProjectRoles(projectId);
  const { data: usersWithRoles = [] } = useUsersWithRoles(projectId);
  const assignRoleMutation = useAssignRole();

  const isInviteLoading = inviteMutation.isPending;
  const isRemoveLoading = removeMutation.isPending;
  const isLoading = isInviteLoading || isRemoveLoading;

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


  useEffect(() => {
    if (isInviteLoading || isRemoveLoading) {
      return;
    }
    setSelectedEmail("");
    setInviteRoleId("");
    inviteActionError.clear();
    removeActionError.clear();
    setEditingUserEmail(null);
    setEditingRoleId("");
    setOriginalRoleId("");
  }, [projectId, isInviteLoading, isRemoveLoading]);

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
    if (!selectedEmail.trim() || isInviteLoading) return;

    inviteActionError.clear();
    const emailToInvite = selectedEmail.trim();

    try {
      await inviteMutation.mutateAsync({
        projectId,
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
    removeActionError.clear();
    try {
      await removeMutation.mutateAsync({
        projectId,
        email
      });
      showSuccessToast('User removed successfully');
    } catch (error: any) {
      removeActionError.handleError(error);
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
    if (!editingUserEmail || assignRoleMutation.isPending) return;

    const user = currentUsers.find((u) => u.email === editingUserEmail);
    if (!user?.id) return;

    try {
      await assignRoleMutation.mutateAsync({
        projectId,
        userId: user.id,
        data: {
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

  return (
    <div className="space-y-6">
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
        organisationId={organisationId}
        projectId={projectId}>

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
    </div>);

}