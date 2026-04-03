import { render, screen } from '@testing-library/react'
import { MemoryRouter } from '@tanstack/react-router'
import SetupPage from '../page'

jest.mock('@/lib/better-auth', () => ({
  authClient: {
    signUp: { email: jest.fn() },
    getSession: jest.fn(),
  },
}))
jest.mock('@/store/authStore', () => ({
  useSetAuthProfile: () => jest.fn(),
}))
jest.mock('@/store/organisationStore', () => ({
  useSetOrganisations: () => jest.fn(),
  useSetCurrentOrganisation: () => jest.fn(),
}))
jest.mock('@/api/organisations', () => ({ organisationsApi: { create: jest.fn() } }))
jest.mock('@/api/permissions', () => ({ clearPermissionsCache: jest.fn() }))
jest.mock('@/api/setup', () => ({ checkSetupStatus: jest.fn().mockResolvedValue({ shouldSetup: true }) }))
jest.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}))
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}))
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => jest.fn(),
  MemoryRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('SetupPage', () => {
  it('renders setup form', () => {
    render(
      <MemoryRouter>
        <SetupPage />
      </MemoryRouter>
    )
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/organization name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /complete setup/i })).toBeInTheDocument()
  })
})
