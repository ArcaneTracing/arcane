import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import TracesSquareIcon from "@/components/icons/traces-square-solid-rounded";
import DatabaseIcon from "@/components/icons/database-icon";
import ChatIcon from "../icons/chat-solid-rounded";
import PromptIcon from "../icons/prompt-icon";
import PlaygroundIcon from "../icons/playground-icon";
import AnnotationQueueIcon from "../icons/annotation-queue";
import ScoreIcon from "../icons/score-icon";
import EvaluationIcon from "../icons/evaluation-icon";
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
import { createNavigationPath } from "@/lib/navigation";
import { useMemo } from "react";

const navigation = [
{
  name: "Traces",
  href: "/traces",
  icon: TracesSquareIcon
},
{
  name: "Conversations",
  href: "/conversations",
  icon: ChatIcon
},
{
  name: "Annotation Queues",
  href: "/annotation-queues",
  icon: AnnotationQueueIcon
},
{
  name: "Datasets",
  href: "/datasets",
  icon: DatabaseIcon
},
{
  name: "Prompts",
  href: "/prompts",
  icon: PromptIcon
},
{
  name: "Scores",
  href: "/scores",
  icon: ScoreIcon
},
{
  name: "Experiments",
  href: "/experiments",
  icon: PlaygroundIcon
},
{
  name: "Evaluations",
  href: "/evaluations",
  icon: EvaluationIcon
}];


interface SidebarNavigationProps {
  isCollapsed: boolean;
  selectedProjectId: string | null;
}

export function SidebarNavigation({ isCollapsed, selectedProjectId }: Readonly<SidebarNavigationProps>) {
  const location = useLocation();
  const pathname = location.pathname;
  const organisationId = useOrganisationIdOrNull();
  const { hasPermission } = usePermissions({
    organisationId: organisationId || undefined,
    projectId: selectedProjectId || undefined
  });


  const visibleNavigation = useMemo(() => {
    const permissionMap: Record<string, string> = {
      '/traces': PERMISSIONS.TRACE.READ,
      '/conversations': PERMISSIONS.CONVERSATION.READ,
      '/annotation-queues': PERMISSIONS.ANNOTATION_QUEUE.READ,
      '/datasets': PERMISSIONS.DATASET.READ,
      '/prompts': PERMISSIONS.PROMPT.READ,
      '/scores': PERMISSIONS.SCORE.READ,
      '/experiments': PERMISSIONS.EXPERIMENT.READ,
      '/evaluations': PERMISSIONS.EVALUATION.READ
    };

    return navigation.filter((item) => {
      const requiredPermission = permissionMap[item.href];
      if (!requiredPermission) return true;
      return hasPermission(requiredPermission);
    });
  }, [hasPermission]);

  if (!selectedProjectId || !organisationId) return null;

  return (
    <div className="space-y-1">
      {visibleNavigation.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.includes(item.href);


        const routeMap: Record<string, string> = {
          '/traces': '/organisations/$organisationId/projects/$projectId/traces',
          '/conversations': '/organisations/$organisationId/projects/$projectId/conversations',
          '/annotation-queues': '/organisations/$organisationId/projects/$projectId/annotation-queues',
          '/datasets': '/organisations/$organisationId/projects/$projectId/datasets',
          '/prompts': '/organisations/$organisationId/projects/$projectId/prompts',
          '/scores': '/organisations/$organisationId/projects/$projectId/scores',
          '/experiments': '/organisations/$organisationId/projects/$projectId/experiments',
          '/evaluations': '/organisations/$organisationId/projects/$projectId/evaluations'
        };

        const routePath = routeMap[item.href] || `/organisations/${organisationId}/projects/${selectedProjectId}${item.href}`;
        const linkParams = { organisationId, projectId: selectedProjectId };

        return (
          <Link
            key={item.name}
            to={createNavigationPath(routePath)}
            params={linkParams}
            className={cn(
              "flex items-center gap-3 py-2.5 text-xs text-gray-800 dark:text-gray-200 rounded-md transition-colors group relative",
              isActive && "before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:bg-[#F93647] before:rounded-r-md",
              !isActive && "hover:bg-gray-100 dark:hover:bg-[#1F1F1F]",
              isCollapsed ? "justify-center px-2" : "px-3"
            )}
            title={isCollapsed ? item.name : undefined}>

            <Icon
              className={cn(
                "flex-shrink-0 h-4 w-4",
                isActive ? "text-[#F93647]" : "text-gray-600 dark:text-gray-400 group-hover:text-[#F93647]"
              )} />

            {!isCollapsed &&
            <span className={isActive ? "font-medium" : ""}>
                {item.name}
              </span>
            }
          </Link>);

      })}
    </div>);

}