import { ExperimentsTable } from "@/components/experiments/table/experiments-table"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useCallback, useEffect, useRef } from "react"
import { AddIcon } from "@/components/icons/add-icon"
import { useParams } from "@tanstack/react-router"
import { ExperimentDialog } from "@/components/experiments/dialogs/experiment-dialog"
import { SortMenu, SortOption } from "@/components/ui/sort-menu"
import { useUrlTableState } from "@/hooks/shared"
import { PermissionGuard } from "@/components/PermissionGuard"
import { PagePermissionGuard } from "@/components/PagePermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import ForbiddenPage from "@/pages/forbidden/page"

const EXPERIMENT_SORT_OPTIONS: SortOption[] = [
  { value: 'name', label: 'Name' },
  { value: 'description', label: 'Description' },
  { value: 'promptVersionId', label: 'Prompt Version' },
  { value: 'datasetId', label: 'Dataset' },
  { value: 'createdAt', label: 'Created Date' },
]

export function ExperimentsPageContent() {
  const { projectId, organisationId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/experiments", strict: false })
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const { search, sortKey, sortDirection, updateSearch, updateSort } = useUrlTableState({
    sortKey: 'createdAt',
    sortDirection: 'desc'
  })

  const prevStateRef = useRef({ createDialogOpen, search, sortKey, sortDirection })
  const renderCountRef = useRef(0)

  useEffect(() => {
    renderCountRef.current += 1
    prevStateRef.current = { createDialogOpen, search, sortKey, sortDirection }
  })

  const handleDialogSuccess = useCallback(() => {
    setCreateDialogOpen(false)
  }, [])

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <div> 
          <h1 className="text-2xl font-semibold tracking-tight mb-1.5">Experiments Management</h1>
          <p className="text-sm text-muted-foreground/60">Run prompts against datasets and analyze results.</p>
        </div>  
      </div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-muted-foreground/40 dark:text-gray-400/40" />
            <Input 
              placeholder="Search" 
              className="pl-9 w-[240px] h-8 rounded-lg bg-white dark:bg-[#0D0D0D] border-[1px] border border-gray-100 dark:border-[#2A2A2A] placeholder:text-muted-foreground/40 dark:placeholder:text-gray-400/40 dark:text-gray-100"
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
            />
          </div>
          <SortMenu
            options={EXPERIMENT_SORT_OPTIONS}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={updateSort}
          />
        </div>
        <div className="flex gap-2">
          <PermissionGuard
            permission={PERMISSIONS.EXPERIMENT.CREATE}
            organisationId={organisationId}
            projectId={projectId}
          >
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <AddIcon className="h-6 w-6" />
            New experiment
          </Button>
          </PermissionGuard>
        </div>
      </div>
      <ExperimentsTable 
        searchQuery={search}
        sortKey={sortKey}
        sortDirection={sortDirection}
      />
      
      <ExperimentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        projectId={projectId}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}

export default function ExperimentsPage() {
  return (
    <PagePermissionGuard permission={PERMISSIONS.EXPERIMENT.READ} fallback={<ForbiddenPage />}>
      <ExperimentsPageContent />
    </PagePermissionGuard>
  )
}

