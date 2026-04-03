"use client";

import { ModelConfigurationsTable } from "./model-configurations-table";
import { ModelConfigurationDialog } from "./model-configuration-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { AddIcon } from "@/components/icons/add-icon";
import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { useOrganisationId } from "@/hooks/useOrganisation";

export function ModelConfigurationsTab() {
  const organisationId = useOrganisationId();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-muted-foreground/40 dark:text-gray-400/40" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-[240px] h-8 rounded-lg bg-white dark:bg-[#0D0D0D] border-[1px] border border-gray-100 dark:border-[#2A2A2A] placeholder:text-muted-foreground/40 dark:placeholder:text-gray-400/40 dark:text-gray-100" />

        </div>
        <div className="flex items-center gap-2">
          <PermissionGuard
            permission={PERMISSIONS.MODEL_CONFIGURATION.CREATE}
            organisationId={organisationId}>

            <ModelConfigurationDialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              trigger={
              <Button className="flex items-center gap-2" size="sm">
                  <AddIcon className="h-6 w-6" />
                  New Model Configuration
                </Button>
              } />

          </PermissionGuard>
        </div>
      </div>
      <ModelConfigurationsTable searchQuery={searchQuery} />
    </>);

}