import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/permissions';

export interface UseTraceViewerPermissionsReturn {
  effectiveShowAddToAnnotationQueue: boolean;
  effectiveShowAddToDataset: boolean;
}

export function useTraceViewerPermissions(
organisationId: string | undefined,
projectId: string | undefined,
showAddToAnnotationQueue: boolean,
showAddToDataset: boolean)
: UseTraceViewerPermissionsReturn {
  const { hasPermission } = usePermissions({
    organisationId,
    projectId
  });

  const canAddToAnnotationQueue = hasPermission(
    PERMISSIONS.ANNOTATION_QUEUE.TRACES_CREATE
  );
  const canAddToDataset = hasPermission(PERMISSIONS.DATASET.ROWS_CREATE);

  const effectiveShowAddToAnnotationQueue =
  showAddToAnnotationQueue && canAddToAnnotationQueue;
  const effectiveShowAddToDataset = showAddToDataset && canAddToDataset;

  return {
    effectiveShowAddToAnnotationQueue,
    effectiveShowAddToDataset
  };
}