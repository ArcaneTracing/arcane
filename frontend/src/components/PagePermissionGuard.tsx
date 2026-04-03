import { ReactNode } from "react";
import { useParams, Outlet, useLocation } from "@tanstack/react-router";
import { usePermissions } from "@/hooks/usePermissions";
import ForbiddenPage from "@/pages/forbidden/page";


function getOrganisationIdFromPath(pathname: string): string | undefined {
  const match = /\/organisations\/([^/]+)/.exec(pathname);
  return match?.[1];
}


function getProjectIdFromPath(pathname: string): string | undefined {
  const match = /\/organisations\/[^/]+\/projects\/([^/]+)/.exec(pathname);
  return match?.[1];
}

export interface PagePermissionGuardProps {

  permission: string;

  organisationId?: string;

  projectId?: string;

  fallback?: ReactNode;

  showLoading?: boolean;

  children?: ReactNode;
}


export function PagePermissionGuard({
  permission,
  organisationId: organisationIdProp,
  projectId: projectIdProp,
  fallback,
  showLoading = true,
  children
}: Readonly<PagePermissionGuardProps>) {
  const params = useParams({ strict: false });
  const { pathname } = useLocation();
  const organisationId =
  organisationIdProp ?? params?.organisationId ?? getOrganisationIdFromPath(pathname);
  const projectId =
  projectIdProp ?? params?.projectId ?? getProjectIdFromPath(pathname);

  const { hasPermission, isLoading } = usePermissions({
    organisationId,
    projectId
  });

  const hasRequiredPermission = hasPermission(permission);

  if (isLoading && showLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>);

  }

  if (isLoading && !showLoading) {
    return null;
  }

  if (!hasRequiredPermission) {
    return <>{fallback ?? <ForbiddenPage />}</>;
  }

  return <>{children ?? <Outlet />}</>;
}