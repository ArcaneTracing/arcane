import { AnnotationQueuesTable } from "@/components/annotation-queues/table/annotation-queues-table";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { AddIcon } from "@/components/icons/add-icon";
import { useParams, useNavigate } from "@tanstack/react-router";
import { SortMenu, SortOption } from "@/components/ui/sort-menu";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/components/PermissionGuard";
import { PagePermissionGuard } from "@/components/PagePermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import ForbiddenPage from "@/pages/forbidden/page";

const ANNOTATION_QUEUE_SORT_OPTIONS: SortOption[] = [
{ value: 'name', label: 'Name' },
{ value: 'description', label: 'Description' },
{ value: 'type', label: 'Type' }];


export function AnnotationQueuesPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const { projectId, organisationId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/annotation-queues", strict: false });
  const navigate = useNavigate();

  const [sortKey, setSortKey] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  return (
    <div className="flex-1 p-10">
      <div className="flex justify-between items-center mb-6">
        <div> 
          <h1 className="text-2xl font-semibold tracking-tight mb-1.5">Annotation Queues</h1>
          <p className="text-sm text-muted-foreground/60">Manage annotation queues and templates for your project.</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-muted-foreground/40 dark:text-gray-400/40" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[240px] h-8 rounded-lg bg-white dark:bg-[#0D0D0D] border-[1px] border border-gray-100 dark:border-[#2A2A2A] placeholder:text-muted-foreground/40 dark:placeholder:text-gray-400/40 dark:text-gray-100" />

          </div>
          <SortMenu
            options={ANNOTATION_QUEUE_SORT_OPTIONS}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={(key, direction) => {
              setSortKey(key);
              setSortDirection(direction);
            }} />

        </div>
        <div className="flex items-center gap-2">
          <PermissionGuard
            permission={PERMISSIONS.ANNOTATION_QUEUE.CREATE}
            organisationId={organisationId}
            projectId={projectId}>

          <Button
              size="sm"
              onClick={() => navigate({ to: "/organisations/$organisationId/projects/$projectId/annotation-queues/new", params: { organisationId, projectId } })}
              className="flex items-center gap-2">

            <AddIcon className="h-6 w-6" />
            New Annotation Queue
          </Button>
          </PermissionGuard>
        </div>
      </div>
      <AnnotationQueuesTable searchQuery={searchQuery} projectId={projectId} sortKey={sortKey} sortDirection={sortDirection} />
    </div>);

}

export default function AnnotationQueuesPage() {
  return (
    <PagePermissionGuard permission={PERMISSIONS.ANNOTATION_QUEUE.READ} fallback={<ForbiddenPage />}>
      <AnnotationQueuesPageContent />
    </PagePermissionGuard>);

}