"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnnotationQueueListItemResponse } from "@/types/annotation-queue"
import { ArrowRight, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import AnnotationQueueIcon from "@/components/icons/annotation-queue"
import { PermissionGuard } from "@/components/PermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import { useOrganisationId } from "@/hooks/useOrganisation"

interface AnnotationQueueCardProps {
  queue: AnnotationQueueListItemResponse
  onView: (queue: AnnotationQueueListItemResponse) => void
  onEdit: (queue: AnnotationQueueListItemResponse) => void
  onDelete: (queueId: string) => void
  projectId?: string 
}

export function AnnotationQueueCard({ queue, onView, onEdit, onDelete, projectId }: Readonly<AnnotationQueueCardProps>) {
  const organisationId = useOrganisationId()

  return (
    <Card className="border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center">
                <AnnotationQueueIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <CardTitle className="text-base font-semibold line-clamp-1 text-gray-900 dark:text-gray-100">
                  {queue.name}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {queue.type}
                </Badge>
              </div>
              {queue.description && (
                <CardDescription className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-1.5">
                  {queue.description}
                </CardDescription>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            onClick={() => onView(queue)}
          >
            View
            <ArrowRight className="h-3 w-3" />
          </Button>
          <PermissionGuard
            permission={PERMISSIONS.ANNOTATION_QUEUE.UPDATE}
            organisationId={organisationId}
            projectId={projectId}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-[#1F1F1F]/80"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(queue)
              }}
            >
              <span className="sr-only">Edit</span>
              <Pencil className="h-4 w-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard
            permission={PERMISSIONS.ANNOTATION_QUEUE.DELETE}
            organisationId={organisationId}
            projectId={projectId}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(queue.id)
              }}
            >
              <span className="sr-only">Delete</span>
              <Trash2 className="h-4 w-4" />
            </Button>
          </PermissionGuard>
        </div>
      </CardContent>
    </Card>
  )
}

