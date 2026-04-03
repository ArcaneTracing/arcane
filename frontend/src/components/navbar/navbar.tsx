import { useEffect, useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { createNavigationOptions, createNavigationPath } from '@/lib/navigation';
import { useCurrentOrganisation, useOrganisations, useSetCurrentOrganisation, useSetOrganisations } from '@/store/organisationStore';
import { organisationsApi } from '@/api/organisations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Building2, Shield } from 'lucide-react';
import { useIsSuperAdmin } from '@/hooks/usePermissions';
import { authClient } from '@/lib/better-auth';

export function Navbar() {
  const navigate = useNavigate();
  const currentOrganisation = useCurrentOrganisation();
  const organisations = useOrganisations();
  const setCurrentOrganisation = useSetCurrentOrganisation();
  const setOrganisations = useSetOrganisations();
  const isSuperAdmin = useIsSuperAdmin();

  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
  const hasAttemptedLoad = useRef(false);
  const { data: session, isPending: sessionPending } = authClient.useSession();


  useEffect(() => {
    if (sessionPending) {
      return;
    }

    const storedOrgs = JSON.parse(localStorage.getItem('organisation-storage') || '{}')?.state?.organisations;
    const hasStoredOrgs = Array.isArray(storedOrgs);

    if (hasStoredOrgs) {
      setIsLoadingOrgs(false);
      hasAttemptedLoad.current = true;
      return;
    }

    if (!hasAttemptedLoad.current && organisations.length === 0 && session?.user) {
      hasAttemptedLoad.current = true;
      setIsLoadingOrgs(true);
      organisationsApi.getAll().
      then((orgs) => {
        setOrganisations(orgs);
        setIsLoadingOrgs(false);
      }).
      catch((error) => {
        setIsLoadingOrgs(false);
      });
    } else if (hasAttemptedLoad.current) {
      setIsLoadingOrgs(false);
    }
  }, [organisations.length, setOrganisations, sessionPending, session]);

  const handleOrganisationChange = (organisationId: string) => {
    const organisation = organisations.find((org) => org.id === organisationId);
    if (organisation) {
      setCurrentOrganisation(organisation);

      const currentPath = globalThis.location.pathname;
      const pathParts = currentPath.split('/');

      const orgIndex = pathParts.indexOf('organisations');
      if (orgIndex !== -1 && pathParts[orgIndex + 1]) {
        pathParts[orgIndex + 1] = organisationId;
        const newPath = pathParts.join('/');
        navigate(createNavigationOptions(newPath, { replace: true }));
      } else {
        navigate(createNavigationOptions(`/organisations/${organisationId}/projects`, { replace: true }));
      }
    }
  };

  return (
    <div className="h-14 border-b border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#181818] flex items-center justify-between px-6">
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        {(() => {
          if (isLoadingOrgs) {
            return (
              <div className="w-[200px] h-9 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                Loading...
              </div>);

          }
          if (organisations.length > 0) {
            return (
              <Select
                value={currentOrganisation?.id || ''}
                onValueChange={handleOrganisationChange}>

            <SelectTrigger className="w-[200px] h-9">
              <SelectValue placeholder="Select organisation">
                {currentOrganisation?.name || 'Select organisation'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {organisations.map((org) =>
                  <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
                  )}
            </SelectContent>
          </Select>);

          }
          return (
            <div className="w-[200px] h-9 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            No organisations...
          </div>);

        })()}
        {isSuperAdmin &&
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: createNavigationPath('/admin') })}
          className="h-9 w-9"
          title="Instance Administration">
          <Shield className="h-4 w-4" />
        </Button>
        }
      </div>
    </div>);

}