import { DatasetsTable } from "@/components/datasets/table/datasets-table"
import { DatasetDialog } from "@/components/datasets/dialogs/new-dataset-dialog"
import { ImportDatasetDialog } from "@/components/datasets/dialogs/import-dataset-dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search, Upload } from "lucide-react"
import { AddIcon } from "@/components/icons/add-icon"
import { useParams } from "@tanstack/react-router"
import { SortMenu, SortOption } from "@/components/ui/sort-menu"
import { useUrlTableState } from "@/hooks/shared"
import { PermissionGuard } from "@/components/PermissionGuard"
import { PagePermissionGuard } from "@/components/PagePermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import ForbiddenPage from "@/pages/forbidden/page"

const DATASET_SORT_OPTIONS: SortOption[] = [
  { value: 'name', label: 'Name' },
  { value: 'description', label: 'Description' },
  { value: 'createdAt', label: 'Created Date' },
]

export function DatasetsPageContent() {
  const { projectId, organisationId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/datasets", strict: false })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const { search: searchQuery, sortKey, sortDirection, updateSearch, updateSort } = useUrlTableState({
    sortKey: 'createdAt',
    sortDirection: 'desc'
  })

  return (
    <div className="flex-1 p-10">
      <div className="flex justify-between items-center mb-6">
        <div> 
          <h1 className="text-2xl font-semibold tracking-tight mb-1.5">Datasets</h1>
          <p className="text-sm text-muted-foreground/60">Manage and track your datasets efficiently in one place.</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-muted-foreground/40 dark:text-gray-400/40" />
            <Input 
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => updateSearch(e.target.value)}
              className="pl-9 w-[240px] h-8 rounded-lg bg-white dark:bg-[#0D0D0D] border-[1px] border border-gray-100 dark:border-[#2A2A2A] placeholder:text-muted-foreground/40 dark:placeholder:text-gray-400/40 dark:text-gray-100"
            />
          </div>
          <SortMenu
            options={DATASET_SORT_OPTIONS}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={updateSort}
          />
        </div>
        <div className="flex items-center gap-2">
            <PermissionGuard
              permission={PERMISSIONS.DATASET.IMPORT}
              organisationId={organisationId}
              projectId={projectId}
            >
            <ImportDatasetDialog
              open={isImportDialogOpen}
              onOpenChange={setIsImportDialogOpen}
              projectId={projectId}
              trigger={
                <Button className="flex items-center gap-2" size="sm" variant="outline">
                  <Upload className="h-4 w-4" />
                  Import Dataset
                </Button>
              }
            />
            </PermissionGuard>
            <PermissionGuard
              permission={PERMISSIONS.DATASET.CREATE}
              organisationId={organisationId}
              projectId={projectId}
            >
            <DatasetDialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              projectId={projectId}
              trigger={
                <Button className="flex items-center gap-2" size="sm">
                  <AddIcon className="h-6 w-6" />
                  New Dataset
                </Button>
              }
            />
            </PermissionGuard>
        </div>
      </div>
      <DatasetsTable searchQuery={searchQuery} projectId={projectId} sortKey={sortKey} sortDirection={sortDirection} />
    </div>
  )
}

export default function DatasetsPage() {
  return (
    <PagePermissionGuard permission={PERMISSIONS.DATASET.READ} fallback={<ForbiddenPage />}>
      <DatasetsPageContent />
    </PagePermissionGuard>
  )
}

