import { Navigate } from '@tanstack/react-router';
import { useCurrentOrganisation, useOrganisations } from '@/store/organisationStore';

export function HomeRedirect() {
  const currentOrganisation = useCurrentOrganisation();
  const organisations = useOrganisations();


  if (currentOrganisation) {
    return <Navigate to={`/organisations/${currentOrganisation.id}/projects`} />;
  }


  if (organisations.length > 0) {
    return <Navigate to={`/organisations/${organisations[0].id}/projects`} />;
  }


  return <Navigate to="/no-organisation" />;
}