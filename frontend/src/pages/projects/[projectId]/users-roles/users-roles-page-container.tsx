"use client"

import { useParams } from "@tanstack/react-router"
import { useProjectQuery } from "@/hooks/projects/use-projects-query"
import { UsersRolesPageView } from "./users-roles-page-view"

export function UsersRolesPageContainer() {
  const { projectId, organisationId } = useParams({
    from: "/appLayout/organisations/$organisationId/projects/$projectId/project-management",
    strict: false,
  })

  const { data: project, isLoading: isProjectLoading, error: projectError } = useProjectQuery(projectId)

  return (
    <UsersRolesPageView
      project={project || null}
      organisationId={organisationId}
      projectId={projectId}
      isProjectLoading={isProjectLoading}
      projectError={projectError}
    />
  )
}
