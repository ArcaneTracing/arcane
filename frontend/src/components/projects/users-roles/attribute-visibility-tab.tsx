"use client"

import { AttributeVisibilityRulesTable } from "./tables/attribute-visibility-rules-table"
import { CreateAttributeVisibilityRuleDialog } from "./dialogs/create-attribute-visibility-rule-dialog"
import { EditAttributeVisibilityRuleRolesDialog } from "./dialogs/edit-attribute-visibility-rule-roles-dialog"
import type { AttributeVisibilityRuleResponse } from "@/types/attribute-visibility"
import { useState } from "react"

export interface AttributeVisibilityTabProps {
  projectId: string
  organisationId: string
  createDialogOpen?: boolean
  onCreateDialogOpenChange?: (open: boolean) => void
}

export function AttributeVisibilityTab({
  projectId,
  organisationId,
  createDialogOpen = false,
  onCreateDialogOpenChange,
}: Readonly<AttributeVisibilityTabProps>) {
  const [editingRule, setEditingRule] =
    useState<AttributeVisibilityRuleResponse | null>(null)

  return (
    <>
      <div className="space-y-4">
        <AttributeVisibilityRulesTable
          projectId={projectId}
          organisationId={organisationId}
          onEdit={setEditingRule}
        />
      </div>

      <CreateAttributeVisibilityRuleDialog
        projectId={projectId}
        organisationId={organisationId}
        open={createDialogOpen}
        onOpenChange={onCreateDialogOpenChange ?? (() => {})}
      />

      {editingRule && (
        <EditAttributeVisibilityRuleRolesDialog
          rule={editingRule}
          projectId={projectId}
          organisationId={organisationId}
          open={!!editingRule}
          onOpenChange={(open) => {
            if (!open) {
              setEditingRule(null)
            }
          }}
        />
      )}
    </>
  )
}
