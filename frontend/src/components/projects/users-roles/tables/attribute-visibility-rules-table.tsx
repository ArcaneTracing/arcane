"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useAttributeVisibilityRules,
} from "@/hooks/projects/use-projects-query"
import type { AttributeVisibilityRuleResponse } from "@/types/attribute-visibility"
import { Trash2, Pencil, Eye } from "lucide-react"
import { useState } from "react"
import { TableContainer } from "@/components/shared/table"
import { PermissionGuard } from "@/components/PermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import { DeleteAttributeVisibilityRuleDialog } from "../dialogs/delete-attribute-visibility-rule-dialog"

export interface AttributeVisibilityRulesTableProps {
  projectId: string
  organisationId: string
  onEdit: (rule: AttributeVisibilityRuleResponse) => void
}

export function AttributeVisibilityRulesTable({
  projectId,
  organisationId,
  onEdit,
}: Readonly<AttributeVisibilityRulesTableProps>) {
  const { data: rules = [], isLoading } = useAttributeVisibilityRules(projectId)
  const [ruleToDelete, setRuleToDelete] =
    useState<AttributeVisibilityRuleResponse | null>(null)

  return (
    <>
      <TableContainer
        isLoading={isLoading}
        isEmpty={rules.length === 0}
        emptyMessage="No visibility rules configured. Add a rule to restrict which roles can see specific trace attributes."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Attribute Name</TableHead>
              <TableHead>Hidden from</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="font-mono text-sm">{rule.attributeName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                  {rule.hiddenRoles.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {rule.hiddenRoles.map((role) => (
                        <span
                          key={role.id}
                          className="inline-flex items-center rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700 dark:bg-[#2A2A2A] dark:text-gray-300"
                        >
                          {role.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="italic text-gray-400">
                      No roles (everyone can see)
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <PermissionGuard
                      permission={PERMISSIONS.PROJECT.ATTRIBUTE_VISIBILITY_MANAGE}
                      organisationId={organisationId}
                      projectId={projectId}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => onEdit(rule)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit Roles
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        onClick={() => setRuleToDelete(rule)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete rule</span>
                      </Button>
                    </PermissionGuard>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {ruleToDelete && (
        <DeleteAttributeVisibilityRuleDialog
          rule={ruleToDelete}
          projectId={projectId}
          organisationId={organisationId}
          open={!!ruleToDelete}
          onOpenChange={(open) => {
            if (!open) {
              setRuleToDelete(null)
            }
          }}
        />
      )}
    </>
  )
}
