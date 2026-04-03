"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import {
  useOrganisationUsers,
  useInviteOrganisationUser,
  useChangeOrganisationUserRole,
  useRemoveOrganisationUser,
  useOrganisationRoles } from
'@/hooks/organisations/use-organisation-config-query';
import { Plus, Trash2, Loader2, UserCog, X } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { PermissionGuard } from '@/components/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';

export function UsersTab() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState<string>('');
  const [userToRemove, setUserToRemove] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<{id: string;email: string;currentRoleId: string;} | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string>('');

  const { data: users = [], isLoading: isLoadingUsers } = useOrganisationUsers();
  const { data: roles = [], isLoading: isLoadingRoles } = useOrganisationRoles();
  const inviteMutation = useInviteOrganisationUser();
  const changeRoleMutation = useChangeOrganisationUserRole();
  const removeMutation = useRemoveOrganisationUser();


  const defaultRole = roles.find((role) => role.isSystemRole && role.name.toLowerCase().includes('member')) || roles[0];

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      showErrorToast('Email is required');
      return;
    }

    const roleIdToUse = inviteRoleId || defaultRole?.id;
    if (!roleIdToUse) {
      showErrorToast('No default role available. Please select a role.');
      return;
    }

    try {
      await inviteMutation.mutateAsync({
        email: inviteEmail.trim(),
        roleId: roleIdToUse
      });
      showSuccessToast('User invited successfully');
      setIsInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRoleId('');
    } catch (error: any) {
      showErrorToast(error?.response?.data?.message || 'Failed to invite user');
    }
  };

  const handleChangeRole = async () => {
    if (!editingUser || !editingRoleId) {
      return;
    }

    try {
      await changeRoleMutation.mutateAsync({
        userId: editingUser.id,
        roleId: editingRoleId
      });
      showSuccessToast('User role updated successfully');
      setEditingUser(null);
      setEditingRoleId('');
    } catch (error: any) {
      showErrorToast(error?.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleRemove = async () => {
    if (!userToRemove) return;

    const user = users.find((u) => u.id === userToRemove);
    if (!user) return;

    try {
      await removeMutation.mutateAsync(user.email);
      showSuccessToast('User removed successfully');
      setUserToRemove(null);
    } catch (error: any) {
      showErrorToast(error?.response?.data?.message || 'Failed to remove user');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Users ({users.length})</h2>
        <PermissionGuard permission={PERMISSIONS.ORGANISATION.MEMBERS_CREATE}>
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </PermissionGuard>
      </div>

      {(() => {
        if (isLoadingUsers) {
          return (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" data-testid="icon-loader2" />
            </div>);

        }
        if (users.length === 0) {
          return (
            <div className="text-center py-12 border border-gray-200 dark:border-[#2A2A2A] rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">No users found</p>
            </div>);

        }
        return (
          <div className="rounded-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] shadow-sm">
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
              {users.map((user) =>
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                  <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    {editingUser?.id === user.id ?
                    <div className="flex items-center gap-2">
                        <Select
                        value={editingRoleId}
                        onValueChange={setEditingRoleId}>

                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) =>
                          <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                          )}
                          </SelectContent>
                        </Select>
                        <Button
                        size="sm"
                        onClick={handleChangeRole}
                        disabled={changeRoleMutation.isPending}>

                          {changeRoleMutation.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                          Save
                        </Button>
                        <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        onClick={() => {
                          setEditingUser(null);
                          setEditingRoleId('');
                        }}
                        title="Discard change">

                          <X className="h-4 w-4" />
                          <span className="sr-only">Discard change</span>
                        </Button>
                      </div> :

                    <div className="flex items-center gap-2">
                        <span>{user.role.name}</span>
                        <PermissionGuard permission={PERMISSIONS.ORGANISATION.MEMBERS_UPDATE}>
                          <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            setEditingUser({
                              id: user.id,
                              email: user.email,
                              currentRoleId: user.role.id
                            });
                            setEditingRoleId(user.role.id);
                          }}
                          title="Change role">

                            <UserCog className="h-3 w-3" data-testid="icon-usercog" />
                          </Button>
                        </PermissionGuard>
                      </div>
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <PermissionGuard permission={PERMISSIONS.ORGANISATION.MEMBERS_DELETE}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setUserToRemove(user.id)}
                        className="text-destructive hover:text-destructive">

                        <Trash2 className="h-4 w-4" data-testid="icon-trash2" />
                      </Button>
                    </PermissionGuard>
                  </TableCell>
                </TableRow>
                )}
            </TableBody>
          </Table>
        </div>);

      })()}

      {}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Invite a user to join this organization. They will receive an email invitation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInvite();
                  }
                }} />

            </div>
            {!isLoadingRoles && roles.length > 0 &&
            <div className="space-y-2">
                <Label htmlFor="invite-role">Role (optional)</Label>
                <Select value={inviteRoleId} onValueChange={setInviteRoleId}>
                  <SelectTrigger id="invite-role">
                    <SelectValue placeholder={`Default: ${defaultRole?.name || 'Organisation Member'}`} />
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
                  Defaults to Organisation Member if not specified
                </p>
              </div>
            }
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={inviteMutation.isPending || !inviteEmail.trim()}>

              {inviteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={!!userToRemove} onOpenChange={(open) => !open && setUserToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove User</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this user from the organization? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToRemove(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={removeMutation.isPending}>

              {removeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);

}