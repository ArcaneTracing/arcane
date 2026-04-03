import { authClient } from '@/lib/better-auth'
import { organisationsApi } from '@/api/organisations'
import { clearPermissionsCache } from '@/api/permissions'
import { checkSetupStatus } from '@/api/setup'
import type { Profile } from '@/types/auth'
import type { OrganisationResponse } from '@/types/organisations'

export function validateSetupForm(
  password: string,
  confirmPassword: string,
  organisationName: string
): string | null {
  if (password !== confirmPassword) return 'Passwords do not match'
  if (password.length < 8) return 'Password must be at least 8 characters long'
  if (!organisationName.trim()) return 'Organisation name is required'
  return null
}

export type SetupResult =
  | { ok: true; organisationId: string; organisation: OrganisationResponse }
  | { ok: false; error: string }

export type SetupCallbacks = {
  setProfile: (profile: Profile) => void
  setOrganisations: (organisations: OrganisationResponse[]) => void
  setCurrentOrganisation: (organisation: OrganisationResponse) => void
}

export async function performSetup(
  email: string,
  password: string,
  name: string,
  organisationName: string,
  cb: SetupCallbacks
): Promise<SetupResult> {
  const { error: signUpError } = await authClient.signUp.email({
    email,
    password,
    name,
  })
  if (signUpError) {
    return { ok: false, error: signUpError.message || 'Failed to create account' }
  }

  clearPermissionsCache()
  const session = await authClient.getSession()
  if (session?.user) {
    cb.setProfile({
      name: session.user.name || name,
      email: session.user.email || email,
      picture: session.user.image || undefined,
    })
  }

  const organisation = await organisationsApi.create({
    name: organisationName.trim(),
  })
  cb.setOrganisations([organisation])
  cb.setCurrentOrganisation(organisation)

  const status = await checkSetupStatus()
  if (status.shouldSetup) {
    return { ok: false, error: 'Setup could not be verified. Please try again.' }
  }

  return { ok: true, organisationId: organisation.id, organisation }
}
