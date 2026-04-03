"use client";

import { useState, useMemo, useRef, useId } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
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
  useAdminOrganisations,
  useCreateAdminOrganisation,
  useDeleteAdminOrganisation,
  useInstanceOwners,
  useAddInstanceOwner,
  useRemoveInstanceOwner,
  useOrganisationAuditLogs,
  useInstanceOwnerAuditLogs,
  useSearchUsersByEmail,
  useAllUsers,
  useDeleteUser } from
'@/hooks/admin/use-admin-query';
import { authClient } from '@/lib/better-auth';
import { Plus, Trash2, X, Loader2, Shield, Building2, FileText, Users, Copy, Check } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { format } from 'date-fns';
import { PERMISSIONS } from '@/lib/permissions';
import { PagePermissionGuard } from '@/components/PagePermissionGuard';
import ForbiddenPage from '@/pages/forbidden/page';
import { ComponentErrorBoundary } from '@/components/ComponentErrorBoundary';

export function AdminPageContent() {
  const [activeTab, setActiveTab] = useState<'organisations' | 'admins' | 'users' | 'audit'>('organisations');


  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [orgToDelete, setOrgToDelete] = useState<string | null>(null);


  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState<{id: string;email: string;name: string;} | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const adminDatalistId = useId();
  const [adminToRemove, setAdminToRemove] = useState<string | null>(null);


  const [auditLogType, setAuditLogType] = useState<'organisations' | 'instance-owners'>('organisations');
  const [auditLogAction, setAuditLogAction] = useState<string>('');
  const [auditLogOrgId, setAuditLogOrgId] = useState<string>('');
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);
  const [copiedCellId, setCopiedCellId] = useState<string | null>(null);


  const [userToDelete, setUserToDelete] = useState<string | null>(null);


  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;


  const { data: organisations = [], isLoading: isLoadingOrgs } = useAdminOrganisations();
  const { data: instanceOwnersData, isLoading: isLoadingAdmins } = useInstanceOwners();
  const instanceOwners = instanceOwnersData?.users || [];
  const { data: allUsers = [], isLoading: isLoadingUsers } = useAllUsers();


  const { data: searchResults, isLoading: isSearching } = useSearchUsersByEmail(
    searchEmail,
    isAddAdminOpen && searchEmail.trim().length >= 2
  );


  const availableUsers = useMemo(() => {
    const adminIds = new Set(instanceOwners.map((owner) => owner.id));
    return (searchResults?.users || []).filter((user) => !adminIds.has(user.id));
  }, [searchResults, instanceOwners]);


  const filteredUsers = useMemo(() => {
    if (!searchEmail.trim()) {
      return [];
    }
    const query = searchEmail.toLowerCase().trim();
    return availableUsers.
    filter((user) => {
      const emailMatch = user.email.toLowerCase().includes(query);
      const nameMatch = user.name?.toLowerCase().includes(query);
      return emailMatch || nameMatch;
    }).
    slice(0, 10);
  }, [searchEmail, availableUsers]);


  const organisationAuditLogsParams = {
    ...(auditLogAction ? { action: auditLogAction } : {}),
    ...(auditLogOrgId ? { organisationId: auditLogOrgId } : {}),
    limit: 50
  };
  const { data: organisationAuditLogsResponse, isLoading: isLoadingOrgAuditLogs } = useOrganisationAuditLogs(
    auditLogType === 'organisations' ? organisationAuditLogsParams : undefined
  );


  const instanceOwnerAuditLogsParams = {
    ...(auditLogAction ? { action: auditLogAction } : {}),
    limit: 50
  };
  const { data: instanceOwnerAuditLogsResponse, isLoading: isLoadingInstanceOwnerAuditLogs } = useInstanceOwnerAuditLogs(
    auditLogType === 'instance-owners' ? instanceOwnerAuditLogsParams : undefined
  );


  const auditLogsResponse = auditLogType === 'organisations' ? organisationAuditLogsResponse : instanceOwnerAuditLogsResponse;
  const auditLogs = auditLogsResponse?.data || [];
  const isLoadingAuditLogs = auditLogType === 'organisations' ? isLoadingOrgAuditLogs : isLoadingInstanceOwnerAuditLogs;


  const createOrgMutation = useCreateAdminOrganisation();
  const deleteOrgMutation = useDeleteAdminOrganisation();
  const addAdminMutation = useAddInstanceOwner();
  const removeAdminMutation = useRemoveInstanceOwner();
  const deleteUserMutation = useDeleteUser();


  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) {
      showErrorToast('Organization name is required');
      return;
    }

    try {
      await createOrgMutation.mutateAsync({ name: newOrgName.trim() });
      showSuccessToast('Organization created successfully');
      setIsCreateOrgOpen(false);
      setNewOrgName('');

    } catch (error: any) {
      showErrorToast(error?.response?.data?.message || 'Failed to create organization');
    }
  };

  const handleDeleteOrg = async () => {
    if (!orgToDelete) return;

    try {
      await deleteOrgMutation.mutateAsync(orgToDelete);
      showSuccessToast('Organization deleted successfully');
      setOrgToDelete(null);
    } catch (error: any) {
      showErrorToast(error?.response?.data?.message || 'Failed to delete organization');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && selectedUser) {
      e.preventDefault();
      handleAddAdmin();
    } else if (e.key === 'Escape') {
      setSearchEmail('');
      setSelectedUser(null);
    }
  };

  const handleUserSelect = (user: {id: string;email: string;name: string;}) => {
    setSelectedUser(user);
    setSearchEmail(user.email);
  };


  const handleAddAdmin = async () => {
    if (!selectedUser) {
      showErrorToast('Please select a user');
      return;
    }

    try {
      await addAdminMutation.mutateAsync(selectedUser.id);
      showSuccessToast('Instance admin added successfully');
      setIsAddAdminOpen(false);
      setSearchEmail('');
      setSelectedUser(null);
      setSelectedIndex(-1);
    } catch (error: any) {
      showErrorToast(error?.response?.data?.message || 'Failed to add instance admin');
    }
  };

  const handleRemoveAdmin = async () => {
    if (!adminToRemove) return;

    try {
      await removeAdminMutation.mutateAsync(adminToRemove);
      showSuccessToast('Instance admin removed successfully');
      setAdminToRemove(null);
    } catch (error: any) {
      showErrorToast(error?.response?.data?.message || 'Failed to remove instance admin');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserMutation.mutateAsync(userToDelete);
      showSuccessToast('User deleted successfully');
      setUserToDelete(null);
    } catch (error: any) {
      showErrorToast(error?.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleCopyRow = async (log: any) => {
    const rowData = {
      id: log.id,
      timestamp: format(new Date(log.createdAt), 'PPp'),
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      actorId: log.actorId,
      actorType: log.actorType,
      organisationId: log.organisationId,
      projectId: log.projectId,
      beforeState: log.beforeState,
      afterState: log.afterState,
      metadata: log.metadata
    };
    const text = JSON.stringify(rowData, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedRowId(log.id);
      setTimeout(() => setCopiedRowId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyCell = async (value: string, cellId: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedCellId(cellId);
      setTimeout(() => setCopiedCellId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex-1 p-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight mb-1.5">Instance Administration</h1>
            <p className="text-sm text-muted-foreground/60">
              Manage organizations and instance administrators
            </p>
          </div>
        </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
        <div className="mb-4 border-b pb-4">
          <TabsList>
            <TabsTrigger value="organisations">
              <Building2 className="h-4 w-4 mr-2" />
              Organizations
            </TabsTrigger>
            <TabsTrigger value="admins">
              <Shield className="h-4 w-4 mr-2" />
              Instance Admins
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="audit">
              <FileText className="h-4 w-4 mr-2" />
              Audit Logs
            </TabsTrigger>
          </TabsList>
        </div>

        {}
        <TabsContent value="organisations" className="mt-0">
          <ComponentErrorBoundary scope="OrganisationsTab">
            <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Organizations ({organisations.length})</h2>
              <Button onClick={() => setIsCreateOrgOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
            </div>

            {(() => {
                if (isLoadingOrgs) {
                  return (
                    <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>);

                }
                if (organisations.length === 0) {
                  return (
                    <div className="text-center py-12 border border-gray-200 dark:border-[#2A2A2A] rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No organizations found</p>
                  </div>);

                }
                return (
                  <div className="rounded-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organisations.map((org) =>
                        <TableRow key={org.id}>
                        <TableCell className="font-medium">{org.name}</TableCell>
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(org.createdAt), 'PPp')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setOrgToDelete(org.id)}
                              className="text-destructive hover:text-destructive">

                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                        )}
                  </TableBody>
                </Table>
              </div>);

              })()}
          </div>
          </ComponentErrorBoundary>
        </TabsContent>

        {}
        <TabsContent value="admins" className="mt-0">
          <ComponentErrorBoundary scope="InstanceAdminsTab">
            <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Instance Admins ({instanceOwners.length})</h2>
              <Button onClick={() => {
                  setIsAddAdminOpen(true);
                  setSearchEmail('');
                  setSelectedUser(null);
                }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Admin
              </Button>
            </div>

            {(() => {
                if (isLoadingAdmins) {
                  return (
                    <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>);

                }
                if (instanceOwners.length === 0) {
                  return (
                    <div className="text-center py-12 border border-gray-200 dark:border-[#2A2A2A] rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No instance admins found</p>
                  </div>);

                }
                return (
                  <div className="rounded-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instanceOwners.map((owner) =>
                        <TableRow key={owner.id}>
                        <TableCell className="font-medium">{owner.name || 'N/A'}</TableCell>
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                          {owner.email}
                        </TableCell>
                        <TableCell className="text-right">
                          {instanceOwners.length > 1 &&
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setAdminToRemove(owner.id)}
                              className="text-destructive hover:text-destructive">

                              <X className="h-4 w-4" />
                            </Button>
                            }
                        </TableCell>
                      </TableRow>
                        )}
                  </TableBody>
                </Table>
              </div>);

              })()}
          </div>
          </ComponentErrorBoundary>
        </TabsContent>

        {}
        <TabsContent value="users" className="mt-0">
          <ComponentErrorBoundary scope="UsersTab">
            <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">All Users ({allUsers.length})</h2>
            </div>

            {(() => {
                if (isLoadingUsers) {
                  return (
                    <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>);

                }
                if (allUsers.length === 0) {
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
                      <TableHead>User ID</TableHead>
                      <TableHead>Is Instance Admin</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map((user) => {
                          const isInstanceAdmin = instanceOwners.some((owner) => owner.id === user.id);
                          const isCurrentUser = currentUserId === user.id;
                          const canDelete = !isCurrentUser && !isInstanceAdmin;
                          return (
                            <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                          <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {user.id ? `${user.id.substring(0, 8)}...` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {isInstanceAdmin ?
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                <Shield className="h-3 w-3 mr-1" />
                                Yes
                              </span> :

                                <span className="text-xs text-gray-400">No</span>
                                }
                          </TableCell>
                          <TableCell className="text-right">
                            {canDelete &&
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setUserToDelete(user.id)}
                                  className="text-destructive hover:text-destructive">

                                <Trash2 className="h-4 w-4" />
                              </Button>
                                }
                          </TableCell>
                        </TableRow>);

                        })}
                  </TableBody>
                </Table>
              </div>);

              })()}
          </div>
          </ComponentErrorBoundary>
        </TabsContent>

        {}
        <TabsContent value="audit" className="mt-0">
          <ComponentErrorBoundary scope="AuditLogsTab">
            <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Audit Logs</h2>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Label htmlFor="audit-type">Log Type</Label>
                <Select
                    value={auditLogType}
                    onValueChange={(value: 'organisations' | 'instance-owners') => {
                      setAuditLogType(value);

                      if (value === 'instance-owners') {
                        setAuditLogOrgId('');
                      }
                    }}>

                  <SelectTrigger id="audit-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organisations">Organization Actions</SelectItem>
                    <SelectItem value="instance-owners">Instance Owner Actions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="audit-action">Action Filter</Label>
                <Input
                    id="audit-action"
                    placeholder={
                    auditLogType === 'organisations' ?
                    'e.g., organisation.created, organisation.*' :
                    'e.g., instance_owner.assigned, instance_owner.*'
                    }
                    value={auditLogAction}
                    onChange={(e) => setAuditLogAction(e.target.value)} />

              </div>
              {auditLogType === 'organisations' &&
                <div className="flex-1">
                  <Label htmlFor="audit-org">Organization ID</Label>
                  <Input
                    id="audit-org"
                    placeholder="Filter by organization ID"
                    value={auditLogOrgId}
                    onChange={(e) => setAuditLogOrgId(e.target.value)} />

                </div>
                }
            </div>

            {(() => {
                if (isLoadingAuditLogs) {
                  return (
                    <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>);

                }
                if (auditLogs.length === 0) {
                  return (
                    <div className="text-center py-12 border border-gray-200 dark:border-[#2A2A2A] rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No audit logs found</p>
                  </div>);

                }
                return (
                  <div className="rounded-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] shadow-sm overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource Type</TableHead>
                      <TableHead>Resource ID</TableHead>
                      <TableHead>Organization ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => {
                          const timestamp = format(new Date(log.createdAt), 'PPp');
                          const timestampCellId = `timestamp-${log.id}`;
                          const actionCellId = `action-${log.id}`;
                          const resourceTypeCellId = `resourceType-${log.id}`;
                          const resourceIdCellId = `resourceId-${log.id}`;
                          const organisationIdCellId = `organisationId-${log.id}`;

                          return (
                            <TableRow key={log.id} className="group">
                          <TableCell className="w-12">
                            <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleCopyRow(log)}
                                  title="Copy entire row">

                              {copiedRowId === log.id ?
                                  <Check className="h-3.5 w-3.5 text-green-600" /> :

                                  <Copy className="h-3.5 w-3.5" />
                                  }
                            </Button>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-2 group/cell">
                              <span>{timestamp}</span>
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 opacity-0 group-hover/cell:opacity-100 transition-opacity"
                                    onClick={() => handleCopyCell(timestamp, timestampCellId)}
                                    title="Copy timestamp">

                                {copiedCellId === timestampCellId ?
                                    <Check className="h-3 w-3 text-green-600" /> :

                                    <Copy className="h-3 w-3" />
                                    }
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2 group/cell">
                              <span>{log.action}</span>
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 opacity-0 group-hover/cell:opacity-100 transition-opacity"
                                    onClick={() => handleCopyCell(log.action, actionCellId)}
                                    title="Copy action">

                                {copiedCellId === actionCellId ?
                                    <Check className="h-3 w-3 text-green-600" /> :

                                    <Copy className="h-3 w-3" />
                                    }
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 group/cell">
                              <span>{log.resourceType}</span>
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 opacity-0 group-hover/cell:opacity-100 transition-opacity"
                                    onClick={() => handleCopyCell(log.resourceType, resourceTypeCellId)}
                                    title="Copy resource type">

                                {copiedCellId === resourceTypeCellId ?
                                    <Check className="h-3 w-3 text-green-600" /> :

                                    <Copy className="h-3 w-3" />
                                    }
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            <div className="flex items-center gap-2 group/cell">
                              <span>{log.resourceId ? `${log.resourceId.substring(0, 8)}...` : 'N/A'}</span>
                              {log.resourceId &&
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 opacity-0 group-hover/cell:opacity-100 transition-opacity"
                                    onClick={() => handleCopyCell(log.resourceId, resourceIdCellId)}
                                    title="Copy resource ID">

                                  {copiedCellId === resourceIdCellId ?
                                    <Check className="h-3 w-3 text-green-600" /> :

                                    <Copy className="h-3 w-3" />
                                    }
                                </Button>
                                  }
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            <div className="flex items-center gap-2 group/cell">
                              <span>{log.organisationId ? `${log.organisationId.substring(0, 8)}...` : 'N/A'}</span>
                              {log.organisationId &&
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 opacity-0 group-hover/cell:opacity-100 transition-opacity"
                                    onClick={() => handleCopyCell(log.organisationId, organisationIdCellId)}
                                    title="Copy organization ID">

                                  {copiedCellId === organisationIdCellId ?
                                    <Check className="h-3 w-3 text-green-600" /> :

                                    <Copy className="h-3 w-3" />
                                    }
                                </Button>
                                  }
                            </div>
                          </TableCell>
                        </TableRow>);

                        })}
                  </TableBody>
                </Table>
              </div>);

              })()}
          </div>
          </ComponentErrorBoundary>
        </TabsContent>
      </Tabs>

      {}
      <Dialog open={isCreateOrgOpen} onOpenChange={setIsCreateOrgOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Create a new organization in the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                placeholder="Enter organization name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateOrg();
                  }
                }} />

            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOrgOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrg}
              disabled={createOrgMutation.isPending || !newOrgName.trim()}>

              {createOrgMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={!!orgToDelete} onOpenChange={(open) => !open && setOrgToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this organization? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrgToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOrg}
              disabled={deleteOrgMutation.isPending}>

              {deleteOrgMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={isAddAdminOpen} onOpenChange={(open) => {
        setIsAddAdminOpen(open);
        if (!open) {
          setSearchEmail('');
          setSelectedUser(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Instance Admin</DialogTitle>
            <DialogDescription>
              Search for a user by email to add them as an instance administrator.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email-search">Search by Email</Label>
              <div className="relative">
                <Input
                  ref={inputRef}
                  id="admin-email-search"
                  type="text"
                  list={adminDatalistId}
                  placeholder={isSearching ? "Searching..." : "Type email to search..."}
                  value={searchEmail}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchEmail(value);
                    const matchedUser = filteredUsers.find((u) => u.email === value);
                    if (matchedUser) {
                      handleUserSelect(matchedUser);
                    } else {
                      setSelectedUser(null);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={addAdminMutation.isPending || isSearching} />

                <datalist id={adminDatalistId}>
                  {filteredUsers.map((user) =>
                  <option key={user.id} value={user.email}>
                      {user.name || user.email}
                    </option>
                  )}
                </datalist>
                {isSearching && searchEmail.trim().length >= 2 &&
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                }
              </div>
              {selectedUser &&
              <div className="mt-2 p-2 bg-gray-50 dark:bg-[#1A1A1A] rounded border border-gray-200 dark:border-[#2A2A2A]">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Selected: {selectedUser.name || selectedUser.email}
                  </p>
                  {selectedUser.name &&
                <p className="text-xs text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                }
                </div>
              }
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddAdminOpen(false);
              setSearchEmail('');
              setSelectedUser(null);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleAddAdmin}
              disabled={addAdminMutation.isPending || !selectedUser}>

              {addAdminMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={!!adminToRemove} onOpenChange={(open) => !open && setAdminToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Instance Admin</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this user's instance administrator privileges? 
              You cannot remove the last instance admin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdminToRemove(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveAdmin}
              disabled={removeAdminMutation.isPending}>

              {removeAdminMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user from the system? This action cannot be undone.
              Instance admins cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}>

              {deleteUserMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>);

}

export default function AdminPage() {
  return (
    <PagePermissionGuard permission={PERMISSIONS.INSTANCE.ALL} fallback={<ForbiddenPage />}>
      <AdminPageContent />
    </PagePermissionGuard>);

}