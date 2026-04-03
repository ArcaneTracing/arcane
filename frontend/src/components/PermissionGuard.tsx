import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  permission?: string;
  anyPermission?: string[];
  allPermissions?: string[];
  organisationId?: string;
  projectId?: string;
  children: ReactNode;
  fallback?: ReactNode;
  showLoading?: boolean;
}

export function PermissionGuard({
  permission,
  anyPermission,
  allPermissions,
  organisationId,
  projectId,
  children,
  fallback = null,
  showLoading = false
}: Readonly<PermissionGuardProps>) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions({
    organisationId,
    projectId
  });


  if (isLoading && showLoading) {
    return <div className="animate-pulse">Loading permissions...</div>;
  }


  if (isLoading) {
    return null;
  }


  if (permission) {
    return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
  }


  if (anyPermission && anyPermission.length > 0) {
    return hasAnyPermission(anyPermission) ? <>{children}</> : <>{fallback}</>;
  }


  if (allPermissions && allPermissions.length > 0) {
    return hasAllPermissions(allPermissions) ? <>{children}</> : <>{fallback}</>;
  }


  return <>{children}</>;
}