import { useEffect, useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { createNavigationOptions } from "@/lib/navigation";
import { useSetOrganisations, useSetCurrentOrganisation, useOrganisations, useCurrentOrganisation } from "@/store/organisationStore";
import { organisationsApi } from "@/api/organisations";
import { useQueryClient } from "@tanstack/react-query";
import { isForbiddenError } from "@/lib/error-handling";
import ForbiddenPage from "@/pages/forbidden/page";
import { useIsSuperAdmin } from "@/hooks/usePermissions";
import NoOrganisationPage from "@/pages/no-organisation/page";
import { authClient } from "@/lib/better-auth";

type OrganisationGuardProps = {
  children: React.ReactNode;
  requireOrganisation?: boolean;
  fallback?: React.ReactNode;
};

export function OrganisationGuard({
  children,
  requireOrganisation = true,
  fallback
}: Readonly<OrganisationGuardProps>) {
  const setOrganisations = useSetOrganisations();
  const setCurrentOrganisation = useSetCurrentOrganisation();
  const organisations = useOrganisations();
  const currentOrganisation = useCurrentOrganisation();
  const params = useParams({ strict: false });
  const urlOrganisationId = params?.organisationId;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [hasForbiddenError, setHasForbiddenError] = useState(false);
  const [hasNoOrgs, setHasNoOrgs] = useState(false);
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const isSuperAdmin = useIsSuperAdmin({ enabled: organisations.length === 0 });


  useEffect(() => {
    if (organisations.length === 0 && !hasForbiddenError && !sessionPending && session?.user) {
      organisationsApi.getAll().
      then((orgs) => {
        setHasForbiddenError(false);
        setOrganisations(orgs);

        if (urlOrganisationId) {
          const orgExists = orgs.find((org) => org.id === urlOrganisationId);
          if (orgExists) {
            setCurrentOrganisation(orgExists);
          } else {
            queryClient.removeQueries({
              predicate: (query) => {
                const queryKey = query.queryKey;
                return (
                  Array.isArray(queryKey) &&
                  queryKey.includes(urlOrganisationId));

              }
            });

            if (orgs.length > 0) {
              setCurrentOrganisation(orgs[0]);
              const currentPath = globalThis.location.pathname;
              const newPath = currentPath.replace(
                `/organisations/${urlOrganisationId}`,
                `/organisations/${orgs[0].id}`
              );
              navigate(createNavigationOptions(newPath, { replace: true }));
            } else {
              setHasNoOrgs(true);
            }
          }
        } else if (orgs.length > 0) {
          setCurrentOrganisation(orgs[0]);
        } else {
          setHasNoOrgs(true);
        }
      }).
      catch((err: unknown) => {
        if (isForbiddenError(err)) {
          setHasForbiddenError(true);
          return;
        }

        if ((err as any)?.response?.status === 404) {
          navigate(createNavigationOptions('/login', { replace: true }));
        }
      });
    }
  }, [organisations.length, setOrganisations, setCurrentOrganisation, urlOrganisationId, queryClient, navigate, hasForbiddenError, sessionPending, session]);


  useEffect(() => {
    if (urlOrganisationId && organisations.length > 0) {
      const orgExists = organisations.find((org) => org.id === urlOrganisationId);
      if (!orgExists) {
        queryClient.removeQueries({
          predicate: (query) => {
            const queryKey = query.queryKey;
            return (
              Array.isArray(queryKey) &&
              queryKey.includes(urlOrganisationId));

          }
        });

        if (organisations.length > 0) {
          setCurrentOrganisation(organisations[0]);
          const currentPath = globalThis.location.pathname;
          const newPath = currentPath.replace(
            `/organisations/${urlOrganisationId}`,
            `/organisations/${organisations[0].id}`
          );
          navigate(createNavigationOptions(newPath, { replace: true }));
        } else {
          setHasNoOrgs(true);
        }
      }
    }
  }, [urlOrganisationId, organisations, queryClient, navigate, setCurrentOrganisation]);

  useEffect(() => {
    if (urlOrganisationId && organisations.length > 0) {
      const orgFromUrl = organisations.find((org) => org.id === urlOrganisationId);
      if (orgFromUrl && currentOrganisation?.id !== urlOrganisationId) {
        setCurrentOrganisation(orgFromUrl);
      }
    }
  }, [urlOrganisationId, organisations, currentOrganisation, setCurrentOrganisation]);

  useEffect(() => {
    if (hasNoOrgs && organisations.length === 0) {
      if (isSuperAdmin) {
        navigate(createNavigationOptions('/admin', { replace: true }));
      }
    }
  }, [hasNoOrgs, organisations.length, isSuperAdmin, navigate]);

  if (hasForbiddenError) {
    return <ForbiddenPage />;
  }

  if (hasNoOrgs && organisations.length === 0 && !isSuperAdmin && requireOrganisation) {
    return <NoOrganisationPage />;
  }

  if (sessionPending || (organisations.length === 0 && requireOrganisation && !hasNoOrgs)) {
    return fallback ||
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">{sessionPending ? 'Loading...' : 'Loading organisations...'}</p>
        </div>
      </div>;

  }


  if (requireOrganisation && !currentOrganisation && organisations.length > 0) {
    setCurrentOrganisation(organisations[0]);
  }

  return <>{children}</>;
}