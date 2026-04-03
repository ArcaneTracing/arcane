"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectResponse } from "@/types/projects";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddIcon } from "@/components/icons/add-icon";
import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { UsersTable } from "@/components/projects/users-roles/tables/users-table";
import { RolesTable } from "@/components/projects/users-roles/tables/roles-table";
import { AuditTab } from "@/components/projects/users-roles/audit-tab";
import { AttributeVisibilityTab } from "@/components/projects/users-roles/attribute-visibility-tab";
import { RetentionTab } from "@/components/projects/users-roles/retention-tab";
import { ApiKeysTab } from "@/components/projects/users-roles/api-keys-tab";
import { InviteUserDialog } from "@/components/projects/users-roles/dialogs/invite-user-dialog";
import { CreateRoleDialog } from "@/components/projects/users-roles/dialogs/create-role-dialog";
import { RoleResponse } from "@/types/rbac";
import { usePermissions } from "@/hooks/usePermissions";

export interface UsersRolesPageViewProps {
  project: ProjectResponse | null;
  organisationId: string;
  projectId: string;
  isProjectLoading: boolean;
  projectError: unknown;
}

export function UsersRolesPageView({
  project,
  organisationId,
  projectId,
  isProjectLoading,
  projectError
}: Readonly<UsersRolesPageViewProps>) {
  const [activeTab, setActiveTab] = useState<
    "users" | "roles" | "attribute-visibility" | "audit" | "retention" | "api-keys">(
    "users");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [isCreateAttributeVisibilityDialogOpen, setIsCreateAttributeVisibilityDialogOpen] =
  useState(false);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);

  const { hasAnyPermission, permissions } = usePermissions({
    organisationId,
    projectId
  });
  const enterprise = permissions?.features?.enterprise ?? false;
  useEffect(() => {
    if (!enterprise && (activeTab === "audit" || activeTab === "attribute-visibility")) {
      setActiveTab("users");
    }
  }, [enterprise, activeTab]);
  const canViewAttributeVisibility =
  hasAnyPermission([
  PERMISSIONS.PROJECT.ATTRIBUTE_VISIBILITY_READ,
  PERMISSIONS.PROJECT.ATTRIBUTE_VISIBILITY_MANAGE]
  );
  const canViewApiKeys = hasAnyPermission([
  PERMISSIONS.PROJECT.API_KEYS_READ,
  PERMISSIONS.PROJECT.API_KEYS_MANAGE]
  );

  if (isProjectLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>);

  }

  if (projectError || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-500">Failed to load project</p>
      </div>);

  }

  const handleEditRole = (role: RoleResponse) => {
    setEditingRole(role);
    setIsCreateRoleDialogOpen(true);
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setIsCreateRoleDialogOpen(true);
  };

  return (
    <div className="flex-1 p-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1.5">
            Project Management
          </h1>
          <p className="text-sm text-muted-foreground/60">
            Manage users, roles, attribute visibility, and audit logs for{" "}
            {project?.name}
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) =>
        setActiveTab(v as "users" | "roles" | "attribute-visibility" | "audit" | "retention" | "api-keys")
        }
        className="w-full">

        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            {canViewAttributeVisibility && enterprise &&
            <TabsTrigger value="attribute-visibility">
                Attribute Visibility
              </TabsTrigger>
            }
            {enterprise &&
            <TabsTrigger value="audit">Audit</TabsTrigger>
            }
            <TabsTrigger value="retention">Retention</TabsTrigger>
            {canViewApiKeys && <TabsTrigger value="api-keys">API Keys</TabsTrigger>}
          </TabsList>

          {activeTab === "users" &&
          <PermissionGuard
            permission={PERMISSIONS.PROJECT.MEMBERS_CREATE}
            organisationId={organisationId}
            projectId={projectId}>

              <Button
              className="flex items-center gap-2"
              size="sm"
              onClick={() => setIsInviteDialogOpen(true)}>

                <AddIcon className="h-6 w-6" />
                Invite User
              </Button>
            </PermissionGuard>
          }

          {activeTab === "roles" && enterprise &&
          <PermissionGuard
            permission={PERMISSIONS.PROJECT.ROLES_CREATE}
            organisationId={organisationId}
            projectId={projectId}>

              <div className="flex items-center gap-2">
                <Button
                className="flex items-center gap-2"
                size="sm"
                onClick={handleCreateRole}>

                  <AddIcon className="h-6 w-6" />
                  Create Role
                </Button>
              </div>
            </PermissionGuard>
          }

          {activeTab === "attribute-visibility" &&
          <PermissionGuard
            permission={PERMISSIONS.PROJECT.ATTRIBUTE_VISIBILITY_MANAGE}
            organisationId={organisationId}
            projectId={projectId}>

              <Button
              className="flex items-center gap-2"
              size="sm"
              onClick={() => setIsCreateAttributeVisibilityDialogOpen(true)}>

                <AddIcon className="h-6 w-6" />
                Add Rule
              </Button>
            </PermissionGuard>
          }
        </div>

        <TabsContent value="users" className="mt-6">
          <UsersTable projectId={projectId} organisationId={organisationId} />
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <RolesTable
            projectId={projectId}
            organisationId={organisationId}
            onEdit={handleEditRole}
            enterprise={enterprise} />

        </TabsContent>

        {canViewAttributeVisibility && enterprise &&
        <TabsContent value="attribute-visibility" className="mt-6">
            <AttributeVisibilityTab
            projectId={projectId}
            organisationId={organisationId}
            createDialogOpen={isCreateAttributeVisibilityDialogOpen}
            onCreateDialogOpenChange={setIsCreateAttributeVisibilityDialogOpen} />

          </TabsContent>
        }

        {enterprise &&
        <TabsContent value="audit" className="mt-6">
            <AuditTab projectId={projectId} organisationId={organisationId} />
          </TabsContent>
        }

        <TabsContent value="retention" className="mt-6">
          <RetentionTab organisationId={organisationId} projectId={projectId} />
        </TabsContent>

        {canViewApiKeys &&
        <TabsContent value="api-keys" className="mt-6">
            <ApiKeysTab organisationId={organisationId} projectId={projectId} />
          </TabsContent>
        }
      </Tabs>

      {}
      <InviteUserDialog
        projectId={projectId}
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen} />


      <CreateRoleDialog
        projectId={projectId}
        role={editingRole}
        open={isCreateRoleDialogOpen}
        onOpenChange={(open) => {
          setIsCreateRoleDialogOpen(open);
          if (!open) {
            setEditingRole(null);
          }
        }} />

    </div>);

}