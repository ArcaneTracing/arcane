"use client";

import { useProjectsQuery, useDeleteProject } from "@/hooks/projects/use-projects-query";
import { useActionError } from "@/hooks/shared/use-action-error";
import { showSuccessToast } from "@/lib/toast";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProjectDialog } from "../dialogs/new-project-dialog";
import { ApiKeyDialog } from "../users-roles/dialogs/api-key-dialog";
import { ProjectResponse } from "@/types/projects";
import { useTableFilter, useTableSort, useTablePagination } from "@/hooks/shared";
import { ProjectCard } from "../cards/project-card";
import { DeleteProjectDialog } from "../dialogs/delete-project-dialog";
import { TablePagination, TableContainer } from "@/components/shared/table";
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation";

function toComparable(value: unknown): number | string {
  if (value instanceof Date) return value.getTime();
  if (value && typeof value === 'string' && !Number.isNaN(Date.parse(value))) {
    return new Date(value).getTime();
  }
  return (value ?? '') as string;
}

function compareProjectValues(
aValue: unknown,
bValue: unknown,
direction: 'asc' | 'desc')
: number {
  const a = toComparable(aValue);
  const b = toComparable(bValue);
  if (a < b) return direction === 'asc' ? -1 : 1;
  if (a > b) return direction === 'asc' ? 1 : -1;
  return 0;
}

export interface ProjectsTableProps {
  searchQuery: string;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}

export function ProjectsTable({ searchQuery, sortKey, sortDirection }: Readonly<ProjectsTableProps>) {
  const organisationId = useOrganisationIdOrNull();
  const { data: allProjects = [], isLoading: isFetchLoading, error: fetchError } = useProjectsQuery();
  const deleteMutation = useDeleteProject();
  const deleteActionError = useActionError({ showToast: true });

  const deleteProject = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      showSuccessToast('Project deleted successfully');
    } catch (error) {
      deleteActionError.handleError(error);
    }
  };
  const isDeleteLoading = deleteMutation.isPending;

  const [editingProject, setEditingProject] = useState<ProjectResponse | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [projectForApiKey, setProjectForApiKey] = useState<ProjectResponse | null>(null);
  const navigate = useNavigate();


  const filteredProjects = useTableFilter(allProjects, searchQuery, {
    searchFields: ['name', 'description']
  });


  const { sortedItems: sortedProjects } = useTableSort(filteredProjects, {
    defaultSortKey: 'createdAt',
    defaultDirection: 'desc',
    dateFields: ['createdAt', 'updatedAt'],
    customSort: (a, b, key, direction) =>
    compareProjectValues(a[key], b[key], direction)
  });


  const projectsToPaginate = useMemo(() => {
    if (!sortKey || !sortDirection) return sortedProjects;
    const sorted = [...filteredProjects];
    const sortBy = sortKey as keyof ProjectResponse;
    sorted.sort((a, b) =>
    compareProjectValues(a[sortBy], b[sortBy], sortDirection)
    );
    return sorted;
  }, [filteredProjects, sortedProjects, sortKey, sortDirection]);


  const { paginatedItems, meta, handlePageChange } = useTablePagination(
    projectsToPaginate,
    { dependencies: [searchQuery, sortKey, sortDirection] }
  );

  const handleEdit = (project: ProjectResponse) => {
    setEditingProject(project);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete);
      setProjectToDelete(null);
    }
  };

  const handleView = (projectId: string) => {
    if (!organisationId) return;
    navigate({ to: "/organisations/$organisationId/projects/$projectId", params: { organisationId, projectId } });
  };

  const handleInvite = (project: ProjectResponse) => {
    if (!organisationId) return;
    navigate({
      to: "/organisations/$organisationId/projects/$projectId/project-management",
      params: { organisationId, projectId: project.id }
    });
  };

  const handleApiKey = (project: ProjectResponse) => {
    setProjectForApiKey(project);
  };

  return (
    <>
      <TableContainer
        isLoading={isFetchLoading}
        error={fetchError}
        isEmpty={filteredProjects.length === 0}
        emptyMessage="No projects found">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedItems.map((project: ProjectResponse) =>
          <ProjectCard
            key={project.id}
            project={project}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={setProjectToDelete}
            onInvite={handleInvite}
            onApiKey={handleApiKey} />

          )}
        </div>

        <TablePagination meta={meta} onPageChange={handlePageChange} />
      </TableContainer>

      <ProjectDialog
        project={editingProject}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen} />


      <DeleteProjectDialog
        isOpen={!!projectToDelete}
        isLoading={isDeleteLoading}
        error={deleteActionError.message}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDelete}
        organisationId={organisationId || undefined}
        projectId={projectToDelete || undefined} />


      {projectForApiKey && organisationId &&
      <ApiKeyDialog
        open={!!projectForApiKey}
        onOpenChange={(open) => !open && setProjectForApiKey(null)}
        organisationId={organisationId}
        projectId={projectForApiKey.id}
        projectName={projectForApiKey.name} />

      }
    </>);

}