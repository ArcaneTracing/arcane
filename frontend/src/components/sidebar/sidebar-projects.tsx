import { FolderIcon } from "@/components/icons/folder-icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectResponse } from "@/types/projects";
import { Link } from "@tanstack/react-router";
import AiSettingsIcon from "../icons/ai-setting";
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation";
import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";

interface SidebarProjectsProps {
  isCollapsed: boolean;
  projects: Project[];
  selectedProjectId: string | null;
  onProjectChange: (value: string) => void;
}

export function SidebarProjects({
  isCollapsed,
  projects,
  selectedProjectId,
  onProjectChange,
}: Readonly<SidebarProjectsProps>) {
  const organisationId = useOrganisationIdOrNull();
  
  if (!organisationId) return null;
  
  return (
    <>
     <PermissionGuard
        permission={PERMISSIONS.ORGANISATION.CONFIGURATIONS_READ}
        organisationId={organisationId || undefined}
      >
        <Link 
          to="/organisations/$organisationId/configurations" 
          params={{ organisationId }}
          className={cn(
            "flex items-center gap-3 py-2.5 text-xs text-gray-800 dark:text-gray-200 rounded-md transition-colors group",
            "hover:bg-gray-100 dark:hover:bg-[#1F1F1F]",
            isCollapsed ? "justify-center px-2" : "px-3"
          )}>
          <AiSettingsIcon className="flex-shrink-0 h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-[#F93647]" />
          {!isCollapsed && <span>Configurations</span>}
        </Link>
      </PermissionGuard>
      <Link
        to="/organisations/$organisationId/projects"
        params={{ organisationId }}
        className={cn(
          "flex items-center gap-3 py-2.5 text-xs text-gray-800 dark:text-gray-200 rounded-md transition-colors group",
          "hover:bg-gray-100 dark:hover:bg-[#1F1F1F]",
          isCollapsed ? "justify-center px-2" : "px-3"
        )}
      >
        <FolderIcon className="flex-shrink-0 h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-[#F93647]" />
        {!isCollapsed && <span>Projects</span>}
      </Link>

      {!isCollapsed && projects?.length > 0 && selectedProjectId && (
        <div className="mb-3">
          <div className="px-3 py-2">
            <Select
              value={selectedProjectId || ''}
              onValueChange={onProjectChange}
            >
              <SelectTrigger className="w-full h-auto bg-transparent border-0 shadow-none p-0 hover:bg-transparent focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
                <div className="flex items-center gap-2 w-full">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {projects.find(p => p.id === selectedProjectId)?.name.toUpperCase() || 'PROJECT'}
                  </span>
                  <ChevronDown className="h-3 w-3 text-gray-400 dark:text-gray-500 ml-auto" />
                </div>
              </SelectTrigger>
            <SelectContent 
              className="bg-white dark:bg-[#1F1F1F] border-gray-200 dark:border-[#2A2A2A] shadow-lg p-1 min-w-[200px]"
              position="popper"
              sideOffset={4}
            >
              {projects.map((project: ProjectResponse) => (
                <SelectItem
                  key={project.id}
                  value={project.id}
                  className="text-xs py-2 pl-8 pr-3 rounded-md cursor-pointer data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-[#2A2A2A] [&>span:first-child>svg]:text-[#F93647]"
                >
                  <div className="flex items-center gap-2">
                    <FolderIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-800 dark:text-gray-200">{project.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        </div>
      )}
    </>
  );
}

