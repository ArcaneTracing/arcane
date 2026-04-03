import { useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { createNavigationOptions } from '@/lib/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useOrganisationIdOrNull } from '@/hooks/useOrganisation';
import { useProjectQuery } from '@/hooks/projects/use-projects-query';
import { authClient } from '@/lib/better-auth';
import { isForbiddenError } from '@/lib/error-handling';
import ForbiddenPage from '@/pages/forbidden/page';

type ProjectGuardProps = {
  children: React.ReactNode;
  requireProject?: boolean;
  fallback?: React.ReactNode;
};

export function ProjectGuard({
  children,
  requireProject = true,
  fallback
}: Readonly<ProjectGuardProps>) {
  const params = useParams({ strict: false });
  const projectId = params?.projectId;
  const organisationId = useOrganisationIdOrNull();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const { data: project, error, isError, isLoading } = useProjectQuery(projectId);

  useEffect(() => {


    if (!isLoading && isError && error && projectId && organisationId && !project) {
      const status = error && typeof error === 'object' && 'response' in error ?
      (error.response as {status?: number;})?.status :
      undefined;


      if (status === 403) {

        return;
      }


      if (status === 404) {

        if (!session?.user) {
          return;
        }


        const retryKey = `project-404-retry-${projectId}`;
        const hasRetried = sessionStorage.getItem(retryKey);

        if (!hasRetried) {
          sessionStorage.setItem(retryKey, 'true');


          setTimeout(() => {
            queryClient.invalidateQueries({
              queryKey: ['project', organisationId, projectId]
            });
          }, 1000);

          return;
        }


        sessionStorage.removeItem(retryKey);


        queryClient.removeQueries({
          predicate: (query) => {
            const queryKey = query.queryKey;
            return (
              Array.isArray(queryKey) && (
              queryKey.includes(projectId) || queryKey.includes(organisationId)));

          }
        });


        navigate(createNavigationOptions(`/organisations/${organisationId}/projects`, { replace: true }));
      }
    }
  }, [isLoading, isError, error, projectId, organisationId, navigate, queryClient, project, session]);


  if (isLoading && requireProject) {
    return fallback ||
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>;

  }


  if (isError && error && isForbiddenError(error) && requireProject) {
    return <ForbiddenPage />;
  }


  if (isError && error && !project && requireProject) {


    return fallback ||
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Project not found.</p>
        </div>
      </div>;

  }


  return <>{children}</>;
}