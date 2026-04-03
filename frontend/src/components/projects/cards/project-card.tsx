"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProjectResponse } from "@/types/projects"
import { Folder, ArrowRight, Pencil, Trash2, UserPlus, Key } from "lucide-react"
import { PermissionGuard } from "@/components/PermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import { useOrganisationId } from "@/hooks/useOrganisation"

interface ProjectCardProps {
  project: ProjectResponse
  onView: (projectId: string) => void
  onEdit: (project: ProjectResponse) => void
  onDelete: (projectId: string) => void
  onInvite?: (project: ProjectResponse) => void
  onApiKey?: (project: ProjectResponse) => void
}

export function ProjectCard({ project, onView, onEdit, onDelete, onInvite, onApiKey }: Readonly<ProjectCardProps>) {
  const organisationId = useOrganisationId()
  const formatDate = (date: Date | string) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString()
  }

  return (
    <Card className="border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center">
                <Folder className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <CardTitle className="text-base font-semibold line-clamp-1 text-gray-900 dark:text-gray-100">
                  {project.name}
                </CardTitle>
              </div>
              {project.description && (
                <CardDescription className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-1.5">
                  {project.description}
                </CardDescription>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span>Created {formatDate(project.createdAt)}</span>
              </div>
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
            onClick={() => onView(project.id)}
          >
            View
            <ArrowRight className="h-3 w-3" />
          </Button>
          {onInvite && (
            <PermissionGuard
              permission={PERMISSIONS.PROJECT.MEMBERS_CREATE}
              organisationId={organisationId}
              projectId={project.id}
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                onClick={(e) => {
                  e.stopPropagation()
                  onInvite(project)
                }}
              >
                Manage
                <UserPlus className="h-3 w-3" />
              </Button>
            </PermissionGuard>
          )}
          {onApiKey && (
            <PermissionGuard
              permission={PERMISSIONS.PROJECT.API_KEYS_MANAGE}
              organisationId={organisationId}
              projectId={project.id}
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                onClick={(e) => {
                  e.stopPropagation()
                  onApiKey(project)
                }}
              >
                API Key
                <Key className="h-3 w-3" />
              </Button>
            </PermissionGuard>
          )}
          <PermissionGuard
            permission={PERMISSIONS.PROJECT.UPDATE}
            organisationId={organisationId}
            projectId={project.id}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-[#1F1F1F]/80"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(project)
              }}
            >
              <span className="sr-only">Edit</span>
              <Pencil className="h-4 w-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard
            permission={PERMISSIONS.PROJECT.DELETE}
            organisationId={organisationId}
            projectId={project.id}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(project.id)
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

