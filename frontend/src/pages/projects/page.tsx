import { ProjectsTable } from "@/components/projects/table/projects-table"
import { ProjectDialog } from "@/components/projects/dialogs/new-project-dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { AddIcon } from "@/components/icons/add-icon"
import { SortMenu, SortOption } from "@/components/ui/sort-menu"
import { PermissionGuard } from "@/components/PermissionGuard"
import { PagePermissionGuard } from "@/components/PagePermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import { useOrganisationId } from "@/hooks/useOrganisation"
import ForbiddenPage from "@/pages/forbidden/page"

const PROJECT_SORT_OPTIONS: SortOption[] = [
  { value: 'name', label: 'Name' },
  { value: 'description', label: 'Description' },
  { value: 'members', label: 'Members' },
  { value: 'createdAt', label: 'Created Date' },
]

export function ProjectsPageContent() {
  const organisationId = useOrganisationId()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  return (
    <div className="flex-1 p-10">
      <div className="flex justify-between items-center mb-6">
        <div> 
          <h1 className="text-2xl font-semibold tracking-tight mb-1.5">Projects Dashboard</h1>
          <p className="text-sm text-muted-foreground/60">Manage and track your projects efficiently in one place.</p>
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
                className="pl-9 w-[240px] h-8 rounded-lg bg-white dark:bg-[#0D0D0D] border-[1px] border border-gray-100 dark:border-[#2A2A2A] placeholder:text-muted-foreground/40 dark:placeholder:text-gray-400/40 dark:text-gray-100"
              />
            </div>
            <SortMenu
              options={PROJECT_SORT_OPTIONS}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortChange={(key, direction) => {
                setSortKey(key)
                setSortDirection(direction)
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <PermissionGuard
              permission={PERMISSIONS.PROJECT.CREATE}
              organisationId={organisationId}
            >
              <ProjectDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                trigger={
                  <Button className="flex items-center gap-2" size="sm">
                    <AddIcon className="h-6 w-6" />
                    New Project
                  </Button>
                }
              />
            </PermissionGuard>
          </div>
        </div>
      <ProjectsTable searchQuery={searchQuery} sortKey={sortKey} sortDirection={sortDirection} />
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <PagePermissionGuard permission={PERMISSIONS.PROJECT.READ} fallback={<ForbiddenPage />}>
      <ProjectsPageContent />
    </PagePermissionGuard>
  )
}