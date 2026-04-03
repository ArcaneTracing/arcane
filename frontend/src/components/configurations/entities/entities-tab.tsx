"use client"

import { EntitiesTable } from "@/components/entities/entities-table"
import { EntityDialog } from "@/components/entities/new-entity-dialog"
import { ImportEntitiesDialog } from "@/components/entities/import-entities-dialog"
import { QuickStartDialog } from "@/components/entities/quick-start-dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search, Download, Upload, Loader2, Sparkles } from "lucide-react"
import { AddIcon } from "@/components/icons/add-icon"
import { useExportEntities } from "@/hooks/entities/use-entities-query"
import { PermissionGuard } from "@/components/PermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import { useOrganisationId } from "@/hooks/useOrganisation"

export function EntitiesTab() {
  const organisationId = useOrganisationId()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isQuickStartDialogOpen, setIsQuickStartDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const exportMutation = useExportEntities()

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync()
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-muted-foreground/40 dark:text-gray-400/40" />
          <Input 
            placeholder="Search" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-[240px] h-8 rounded-lg bg-white dark:bg-[#0D0D0D] border-[1px] border border-gray-100 dark:border-[#2A2A2A] placeholder:text-muted-foreground/40 dark:placeholder:text-gray-400/40 dark:text-gray-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <PermissionGuard
            permission={PERMISSIONS.ENTITY.READ}
            organisationId={organisationId}
          >
          <Button
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="flex items-center gap-2"
            size="sm"
            variant="outline"
          >
            {exportMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export
              </>
            )}
          </Button>
          </PermissionGuard>
          <PermissionGuard
            permission={PERMISSIONS.ENTITY.CREATE}
            organisationId={organisationId}
          >
          <QuickStartDialog
            open={isQuickStartDialogOpen}
            onOpenChange={setIsQuickStartDialogOpen}
            trigger={
              <Button className="flex items-center gap-2" size="sm" variant="outline">
                <Sparkles className="h-4 w-4" />
                Start from Source
              </Button>
            }
          />
          </PermissionGuard>
          <PermissionGuard
            permission={PERMISSIONS.ENTITY.CREATE}
            organisationId={organisationId}
          >
          <ImportEntitiesDialog
            open={isImportDialogOpen}
            onOpenChange={setIsImportDialogOpen}
            trigger={
              <Button className="flex items-center gap-2" size="sm" variant="outline">
                <Upload className="h-4 w-4" />
                Import
              </Button>
            }
          />
          </PermissionGuard>
          <PermissionGuard
            permission={PERMISSIONS.ENTITY.CREATE}
            organisationId={organisationId}
          >
          <EntityDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            trigger={
              <Button className="flex items-center gap-2" size="sm">
                <AddIcon className="h-6 w-6" />
                New Entity
              </Button>
            }
          />
          </PermissionGuard>
        </div>
      </div>
      <EntitiesTable searchQuery={searchQuery} />
    </>
  )
}

