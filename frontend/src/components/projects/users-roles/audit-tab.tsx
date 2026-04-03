"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useProjectAuditLogs } from '@/hooks/projects/use-projects-query'
import { Loader2, Copy, Check } from 'lucide-react'
import { format } from 'date-fns'
import { AuditLog } from '@/api/audit-logs'

export interface AuditTabProps {
  projectId: string
  organisationId: string
}

export function AuditTab({ projectId, organisationId }: Readonly<AuditTabProps>) {
  const [actionFilter, setActionFilter] = useState<string>('')
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null)
  const [copiedCellId, setCopiedCellId] = useState<string | null>(null)

  const { data: auditLogsResponse, isLoading: isLoadingAuditLogs } = useProjectAuditLogs({
    projectId,
    action: actionFilter || undefined,
    limit: 50,
  })
  const auditLogs = auditLogsResponse?.data || []

  const handleCopyRow = async (log: AuditLog) => {
    const rowData = {
      id: log.id,
      timestamp: format(new Date(log.createdAt), 'PPp'),
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      actorId: log.actorId,
      actorType: log.actorType,
      organisationId: log.organisationId,
      projectId: log.projectId,
      beforeState: log.beforeState,
      afterState: log.afterState,
      metadata: log.metadata,
    }
    const text = JSON.stringify(rowData, null, 2)
    try {
      await navigator.clipboard.writeText(text)
      setCopiedRowId(log.id)
      setTimeout(() => setCopiedRowId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleCopyCell = async (value: string, cellId: string) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopiedCellId(cellId)
      setTimeout(() => setCopiedCellId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Audit Logs</h2>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Label htmlFor="audit-action">Action Filter</Label>
          <Input
            id="audit-action"
            placeholder="e.g., project_member.added, project_role.*"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Filter by action pattern (e.g., project.* for all project actions)
          </p>
        </div>
      </div>

      {(() => {
        if (isLoadingAuditLogs) {
          return (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" data-testid="icon-loader2" />
            </div>
          )
        }
        if (auditLogs.length === 0) {
          return (
            <div className="text-center py-12 border border-gray-200 dark:border-[#2A2A2A] rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">No audit logs found</p>
            </div>
          )
        }
        return (
          <div className="rounded-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] shadow-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource Type</TableHead>
                  <TableHead>Resource ID</TableHead>
                  <TableHead>Actor ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => {
                  const timestamp = format(new Date(log.createdAt), 'PPp')
                  const timestampCellId = `timestamp-${log.id}`
                  const actionCellId = `action-${log.id}`
                  const resourceTypeCellId = `resourceType-${log.id}`
                  const resourceIdCellId = `resourceId-${log.id}`
                  const actorIdCellId = `actorId-${log.id}`

                  return (
                    <TableRow key={log.id} className="group">
                      <TableCell className="w-12">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleCopyRow(log)}
                          title="Copy entire row"
                        >
                          {copiedRowId === log.id ? (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2 group/cell">
                          <span>{timestamp}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 opacity-0 group-hover/cell:opacity-100 transition-opacity"
                            onClick={() => handleCopyCell(timestamp, timestampCellId)}
                            title="Copy timestamp"
                          >
                            {copiedCellId === timestampCellId ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2 group/cell">
                          <span>{log.action}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 opacity-0 group-hover/cell:opacity-100 transition-opacity"
                            onClick={() => handleCopyCell(log.action, actionCellId)}
                            title="Copy action"
                          >
                            {copiedCellId === actionCellId ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 group/cell">
                          <span>{log.resourceType}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 opacity-0 group-hover/cell:opacity-100 transition-opacity"
                            onClick={() => handleCopyCell(log.resourceType, resourceTypeCellId)}
                            title="Copy resource type"
                          >
                            {copiedCellId === resourceTypeCellId ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        <div className="flex items-center gap-2 group/cell">
                          <span>{log.resourceId ? `${log.resourceId.substring(0, 8)}...` : 'N/A'}</span>
                          {log.resourceId && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 opacity-0 group-hover/cell:opacity-100 transition-opacity"
                              onClick={() => handleCopyCell(log.resourceId, resourceIdCellId)}
                              title="Copy resource ID"
                            >
                              {copiedCellId === resourceIdCellId ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        <div className="flex items-center gap-2 group/cell">
                          <span>{log.actorId ? `${log.actorId.substring(0, 8)}...` : 'N/A'}</span>
                          {log.actorId && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 opacity-0 group-hover/cell:opacity-100 transition-opacity"
                              onClick={() => handleCopyCell(log.actorId, actorIdCellId)}
                              title="Copy actor ID"
                            >
                              {copiedCellId === actorIdCellId ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )
      })()}
    </div>
  )
}
