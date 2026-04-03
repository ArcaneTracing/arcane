import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EntitiesTab } from "@/components/configurations/entities/entities-tab";
import { ConversationTab } from "@/components/configurations/conversations/conversation-tab";
import { ModelConfigurationsTab } from "@/components/configurations/model-configurations/model-configurations-tab";
import { DatasourcesTab } from "@/components/configurations/datasources/datasources-tab";
import { UsersTab } from "@/components/configurations/users/users-tab";
import { RolesTab } from "@/components/configurations/roles/roles-tab";
import { AuditTab } from "@/components/configurations/audit/audit-tab";
import { OrganisationRetentionTab } from "@/components/configurations/retention/organisation-retention-tab";
import { PagePermissionGuard } from "@/components/PagePermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation";
import ForbiddenPage from "@/pages/forbidden/page";
import { useSearch } from "@tanstack/react-router";
import { usePermissions } from "@/hooks/usePermissions";
import { Users, Shield, FileText, Brain, MessageCircle, Database, ComponentIcon, Clock } from "lucide-react";
import { ComponentErrorBoundary } from "@/components/ComponentErrorBoundary";
export function ConfigurationsPageContent() {
  const search = useSearch({ strict: false });
  const tabParam = typeof search?.tab === 'string' ? search.tab : undefined;
  const organisationId = useOrganisationIdOrNull();
  const { hasPermission, permissions } = usePermissions({ organisationId: organisationId || undefined });
  const enterprise = permissions?.features?.enterprise ?? false;


  const canViewUsersTab = hasPermission(PERMISSIONS.ORGANISATION.MEMBERS_READ);
  const canViewRolesTab = enterprise && hasPermission(PERMISSIONS.ORGANISATION.ROLES_READ);
  const canViewAuditTab = enterprise && hasPermission(PERMISSIONS.ORGANISATION.READ);
  const canViewRetentionTab = hasPermission(PERMISSIONS.ORGANISATION.UPDATE);


  const getDefaultTab = () => {
    if (tabParam) return tabParam;
    if (canViewUsersTab) return "users";
    if (canViewRolesTab) return "roles";
    if (canViewAuditTab) return "audit";
    if (canViewRetentionTab) return "retention";
    return "entities";
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab());


  useEffect(() => {
    if (!enterprise && (activeTab === "audit" || activeTab === "roles")) {
      setActiveTab(getDefaultTab());
    }
  }, [enterprise, activeTab]);


  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <div className="flex-1 p-10">
        <div className="flex justify-between items-center mb-6">
          <div> 
            <h1 className="text-2xl font-semibold tracking-tight mb-1.5">Configurations</h1>
            <p className="text-sm text-muted-foreground/60">Manage and track your configurations efficiently in one place.</p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-4 border-b pb-4">
            <TabsList>
              {canViewUsersTab &&
            <TabsTrigger value="users">
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </TabsTrigger>
            }
              {canViewRolesTab &&
            <TabsTrigger value="roles">
                  <Shield className="h-4 w-4 mr-2" />
                  Roles
                </TabsTrigger>
            }
              {canViewAuditTab &&
            <TabsTrigger value="audit">
                  <FileText className="h-4 w-4 mr-2" />
                  Audit
                </TabsTrigger>
            }
              <TabsTrigger value="entities" className="flex items-center gap-1">
                <ComponentIcon className="h-4 w-4 mr-2" />
                Entities
              </TabsTrigger>
              <TabsTrigger value="conversation">
                <MessageCircle className="h-4 w-4 mr-2" />
                Conversation</TabsTrigger>
              <TabsTrigger value="model-configurations">
                <Brain className="h-4 w-4 mr-2" />
                AI Models</TabsTrigger>
              <TabsTrigger value="datasources">
                <Database className="h-4 w-4 mr-2" />
                Data Sources</TabsTrigger>
              {canViewRetentionTab &&
            <TabsTrigger value="retention">
                  <Clock className="h-4 w-4 mr-2" />
                  Retention
                </TabsTrigger>
            }
            </TabsList>
          </div>

          {canViewUsersTab &&
        <TabsContent value="users" className="mt-0">
              <ComponentErrorBoundary scope="UsersTab">
                <UsersTab />
              </ComponentErrorBoundary>
            </TabsContent>
        }

          {canViewRolesTab &&
        <TabsContent value="roles" className="mt-0">
              <ComponentErrorBoundary scope="RolesTab">
                <RolesTab />
              </ComponentErrorBoundary>
            </TabsContent>
        }

          {canViewAuditTab &&
        <TabsContent value="audit" className="mt-0">
              <ComponentErrorBoundary scope="AuditTab">
                <AuditTab />
              </ComponentErrorBoundary>
            </TabsContent>
        }

          <TabsContent value="entities" className="mt-0">
            <ComponentErrorBoundary scope="EntitiesTab">
              <EntitiesTab />
            </ComponentErrorBoundary>
          </TabsContent>

          <TabsContent value="conversation" className="mt-0">
            <ComponentErrorBoundary scope="ConversationTab">
              <ConversationTab />
            </ComponentErrorBoundary>
          </TabsContent>

          <TabsContent value="model-configurations" className="mt-0">
            <ComponentErrorBoundary scope="ModelConfigurationsTab">
              <ModelConfigurationsTab />
            </ComponentErrorBoundary>
          </TabsContent>

          <TabsContent value="datasources" className="mt-0">
            <ComponentErrorBoundary scope="DatasourcesTab">
              <DatasourcesTab />
            </ComponentErrorBoundary>
          </TabsContent>

          {canViewRetentionTab &&
        <TabsContent value="retention" className="mt-0">
              <ComponentErrorBoundary scope="OrganisationRetentionTab">
                <OrganisationRetentionTab />
              </ComponentErrorBoundary>
            </TabsContent>
        }

        </Tabs>
      </div>);

}

export default function ConfigurationsPage() {
  return (
    <PagePermissionGuard permission={PERMISSIONS.ORGANISATION.CONFIGURATIONS_READ} fallback={<ForbiddenPage />}>
      <ConfigurationsPageContent />
    </PagePermissionGuard>);

}