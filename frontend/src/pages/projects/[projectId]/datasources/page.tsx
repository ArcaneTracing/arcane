import { DatasourcesTable } from "@/components/datasources/table/datasources-table"
import { Button } from "@/components/ui/button"
import { DatasourceDialog } from "@/components/datasources/dialogs/datasource-dialog"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AddIcon } from "@/components/icons/add-icon"
import { SortMenu, SortOption } from "@/components/ui/sort-menu"
import { useUrlTableState } from "@/hooks/shared"
import { useParams } from "@tanstack/react-router"
import { PermissionGuard } from "@/components/PermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"

const DATASOURCE_SORT_OPTIONS: SortOption[] = [
  { value: 'name', label: 'Name' },
  { value: 'type', label: 'Type' },
  { value: 'source', label: 'Source' },
  { value: 'description', label: 'Description' },
]

export default function DatasourcesPage() {
  const { projectId, organisationId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/datasources", strict: false })
  const { search, sortKey, sortDirection, updateSearch, updateSort } = useUrlTableState({
    sortKey: 'name',
    sortDirection: 'asc'
  })
  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
      <div> 
          <h1 className="text-2xl font-semibold tracking-tight mb-1.5">Data Sources Management</h1>
          <p className="text-sm text-muted-foreground/60">Easily configure and monitor your trace providers.</p>
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
            options={DATASOURCE_SORT_OPTIONS}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={updateSort}
          />
        </div>
        <div className="flex gap-2">
          <PermissionGuard
            permission={PERMISSIONS.DATASOURCE.CREATE}
            organisationId={organisationId}
            projectId={projectId}
          >
            <DatasourceDialog 
              trigger={
                <Button size="sm">
                  <AddIcon className="h-6 w-6" />
                  New data source
                </Button>
              }
            />
          </PermissionGuard>
        </div>
      </div>
      <DatasourcesTable search={search} sortKey={sortKey} sortDirection={sortDirection} />
    </div>
  )
}