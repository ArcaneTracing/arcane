import { useCurrentOrganisation } from '@/store/organisationStore';

export function useOrganisationId(): string {
  const organisation = useCurrentOrganisation();

  if (!organisation) {
    throw new Error('No organisation selected. Please select an organisation first.');
  }

  return organisation.id;
}

export function useOrganisationIdOrNull(): string | null {
  const organisation = useCurrentOrganisation();
  return organisation?.id ?? null;
}