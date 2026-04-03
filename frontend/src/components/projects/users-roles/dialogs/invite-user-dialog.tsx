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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { useInviteUser, useProjectRoles, useAvailableUsers } from "@/hooks/projects/use-projects-query";
import { Loader2, UserPlus } from "lucide-react";
import { useEffect, useState, useMemo, useRef, useId } from "react";
import { AvailableUser } from "@/types/projects";
import { useActionError } from "@/hooks/shared/use-action-error";
import { showSuccessToast } from "@/lib/toast";
import { FormErrorDisplay } from "@/components/shared/form-error-display";

export interface InviteUserDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function InviteUserDialog({ projectId, open, onOpenChange, trigger }: Readonly<InviteUserDialogProps>) {
  const [selectedEmail, setSelectedEmail] = useState<string>("");
  const [inviteRoleId, setInviteRoleId] = useState<string>("");
  const inviteActionError = useActionError({ showToast: true, showInline: true });
  const inputRef = useRef<HTMLInputElement>(null);
  const userDatalistId = useId();

  const { data: availableUsers = [], isLoading: isLoadingAvailable } = useAvailableUsers(projectId);
  const { data: roles = [] } = useProjectRoles(projectId);
  const inviteMutation = useInviteUser();

  const isInviteLoading = inviteMutation.isPending;


  const filteredUsers = useMemo(() => {
    if (!selectedEmail.trim()) {
      return [];
    }
    const query = selectedEmail.toLowerCase().trim();
    return availableUsers.
    filter((user) => {
      const emailMatch = user.email.toLowerCase().includes(query);
      const nameMatch = user.name?.toLowerCase().includes(query);
      return emailMatch || nameMatch;
    }).
    slice(0, 10);
  }, [selectedEmail, availableUsers]);


  useEffect(() => {
    if (!open) {
      setSelectedEmail("");
      setInviteRoleId("");
      inviteActionError.clear();
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && selectedEmail.trim() && !isInviteLoading) {
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
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to invite user:', error);
      inviteActionError.handleError(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="bg-white dark:bg-[#0D0D0D] rounded-2xl shadow-lg border-0 sm:max-w-[500px]">
        <div className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold mb-2 dark:text-white">
            Invite User
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            Add a new user to this project
          </DialogDescription>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {inviteActionError.message &&
          <FormErrorDisplay error={inviteActionError.message} variant="default" />
          }

          <div className="space-y-2">
            <Label htmlFor="user-email">Email</Label>
            <div className="relative">
              <Input
                ref={inputRef}
                id="user-email"
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
                disabled={isInviteLoading || isLoadingAvailable}
                className="w-full" />

              <datalist id={userDatalistId}>
                {filteredUsers.map((user) =>
                <option key={user.email} value={user.email}>
                    {user.name || user.email}
                  </option>
                )}
              </datalist>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role">Assign Role (optional)</Label>
            <Select value={inviteRoleId || undefined} onValueChange={(value) => setInviteRoleId(value || "")}>
              <SelectTrigger id="invite-role">
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
            <p className="text-xs text-muted-foreground">
              Defaults to "member" role if not specified
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isInviteLoading}>

              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!selectedEmail.trim() || isInviteLoading}>

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
      </DialogContent>
    </Dialog>);

}