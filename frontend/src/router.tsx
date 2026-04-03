import React, { lazy } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  Outlet } from
"@tanstack/react-router";
import { createNavigationPath } from "@/lib/navigation";
import { OrganisationGuard } from "@/components/OrganisationGuard";
import { ProjectGuard } from "@/components/ProjectGuard";
import { SetupGuard } from "@/components/SetupGuard";
import { AppLayout } from "@/components/AppLayout";
import { HomeRedirect } from "@/components/HomeRedirect";
import { RouteErrorFallback } from "@/components/ErrorFallback";
import { NotFoundFallback } from "@/components/NotFoundFallback";
import TracesPage from "@/pages/projects/[projectId]/traces/page";

const rootRoute = createRootRoute({
  component: () =>
  <SetupGuard>
      <Outlet />
    </SetupGuard>,
  errorComponent: ({ error, reset }) => {
    return <RouteErrorFallback error={error} reset={reset} />;
  },
  notFoundComponent: NotFoundFallback
});

const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "appLayout",
  component: () => {
    return <AppLayout />;
  }
});

const organisationRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/organisations/$organisationId",
  component: () => {
    return (
      <OrganisationGuard>
        <Outlet />
      </OrganisationGuard>);
  }
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: lazy(() => import("@/pages/login/page"))
});
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: lazy(() => import("@/pages/register/page"))
});
const healthRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/health",
  component: lazy(() => import("@/pages/health/page"))
});
const readyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ready",
  component: lazy(() => import("@/pages/ready/page"))
});
const setupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/setup",
  component: lazy(() => import("@/pages/setup/page"))
});

const forbiddenRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/forbidden",
  component: lazy(() => import("@/pages/forbidden/page"))
});

const noOrganisationRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/no-organisation",
  component: lazy(() => import("@/pages/no-organisation/page"))
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomeRedirect
});

const projectsRoute = createRoute({
  getParentRoute: () => organisationRoute,
  path: "/projects",
  component: lazy(() => import("@/pages/projects/page"))
});

const projectRoute = createRoute({
  getParentRoute: () => organisationRoute,
  path: "/projects/$projectId",
  component: () => {
    return (
      <ProjectGuard>
        <div>
          <Outlet />
        </div>
      </ProjectGuard>);
  }
});

const projectIndexRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/",
  component: lazy(() => import("@/pages/projects/[projectId]/page"))
});

const projectDatasourcesRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/datasources",
  component: () => {
    const organisationId = globalThis.location.pathname.split('/')[2];
    return <Navigate to={createNavigationPath(`/organisations/${organisationId}/configurations?tab=datasources`)} replace />;
  }
});
const projectDatasetsRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/datasets",
  component: lazy(() => import("@/pages/projects/[projectId]/datasets/page"))
});
const projectDatasetRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/datasets/$datasetId",
  component: lazy(() => import("@/pages/projects/[projectId]/datasets/[datasetId]/page"))
});
const projectTracesRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/traces",
  component: () => {
    return <TracesPage />;
  },
  errorComponent: ({ error, reset }) => {
    return <RouteErrorFallback error={error} reset={reset} />;
  }
});
const projectTraceRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/traces/$datasourceId/$traceId",
  component: lazy(() => import("@/pages/projects/[projectId]/traces/[datasourceId]/[traceId]/page"))
});
const projectExperimentsRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/experiments",
  component: lazy(() => import("@/pages/projects/[projectId]/experiments/page"))
});
const projectExperimentRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/experiments/$experimentId",
  component: lazy(() => import("@/pages/projects/[projectId]/experiments/[experimentId]/page"))
});
const projectEvaluationsRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/evaluations",
  component: lazy(() => import("@/pages/projects/[projectId]/evaluations/page"))
});
const projectEvaluationRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/evaluations/$evaluationId",
  component: lazy(() => import("@/pages/projects/[projectId]/evaluations/[evaluationId]/page"))
});
const projectPromptsRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/prompts",
  component: lazy(() => import("@/pages/projects/[projectId]/prompts/page"))
});
const projectPromptRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/prompts/$promptId",
  component: lazy(() => import("@/pages/projects/[projectId]/prompts/[promptId]/page"))
});
const projectPromptEditRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/prompts/$promptId/edit",
  component: lazy(() => import("@/pages/projects/[projectId]/prompts/[promptId]/edit/page"))
});
const projectPromptNewRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/prompts/new",
  component: lazy(() => import("@/pages/projects/[projectId]/prompts/new/page"))
});
const projectScoresRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/scores",
  component: lazy(() => import("@/pages/projects/[projectId]/scores/page"))
});
const projectAnnotationQueuesRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/annotation-queues",
  component: lazy(() => import("@/pages/projects/[projectId]/annotation-queues/page"))
});
const projectAnnotationQueueRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/annotation-queues/$queueId",
  component: lazy(() => import("@/pages/projects/[projectId]/annotation-queues/[queueId]/page"))
});
const projectAnnotationQueueNewRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/annotation-queues/new",
  component: lazy(() => import("@/pages/projects/[projectId]/annotation-queues/new/page"))
});
const projectAnnotationQueueEditRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/annotation-queues/edit/$queueId",
  component: lazy(() => import("@/pages/projects/[projectId]/annotation-queues/edit/[queueId]/page"))
});
const projectConversationsRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/conversations",
  component: lazy(() => import("@/pages/projects/[projectId]/conversations/page"))
});
const projectConversationRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/conversations/$conversationConfigId/$conversationId",
  component: lazy(() => import("@/pages/projects/[projectId]/conversations/[conversationConfigId]/[conversationId]/page"))
});
const projectManagementRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/project-management",
  component: lazy(() => import("@/pages/projects/[projectId]/users-roles/page"))
});

const configurationsRoute = createRoute({
  getParentRoute: () => organisationRoute,
  path: "/configurations",
  component: lazy(() => import("@/pages/configurations/page"))
});

const adminRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/admin",
  component: lazy(() => import("@/pages/admin/page"))
});

const routeTree = rootRoute.addChildren([
homeRoute,
loginRoute,
registerRoute,
healthRoute,
readyRoute,
setupRoute,

appLayoutRoute.addChildren([
forbiddenRoute,
noOrganisationRoute,
adminRoute,
organisationRoute.addChildren([
projectsRoute,
configurationsRoute,
projectRoute.addChildren([
projectIndexRoute,
projectDatasourcesRoute,
projectDatasetsRoute,
projectDatasetRoute,
projectTracesRoute,
projectTraceRoute,
projectExperimentsRoute,
projectExperimentRoute,
projectEvaluationsRoute,
projectEvaluationRoute,
projectPromptsRoute,
projectPromptRoute,
projectPromptEditRoute,
projectPromptNewRoute,
projectScoresRoute,
projectAnnotationQueuesRoute,
projectAnnotationQueueRoute,
projectAnnotationQueueNewRoute,
projectAnnotationQueueEditRoute,
projectConversationsRoute,
projectConversationRoute,
projectManagementRoute]
)]
)]
)]
);

export const router = createRouter({
  basepath: import.meta.env.VITE_BASE_URL || "/",
  routeTree,
  scrollRestoration: true,
  defaultNotFoundComponent: NotFoundFallback
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}