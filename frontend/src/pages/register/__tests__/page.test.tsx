import { render, screen } from '@testing-library/react'
import { MemoryRouter } from '@tanstack/react-router'
import RegisterPage from '../page'

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
jest.mock('@/api/organisations', () => ({ organisationsApi: {} }))
jest.mock('@/api/permissions', () => ({ clearPermissionsCache: jest.fn() }))
jest.mock('@/hooks/useConfig', () => ({
  useConfig: () => ({ config: { oktaEnabled: false }, isLoading: false }),
}))
jest.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}))
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ search: '' }),
  MemoryRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}))

describe('RegisterPage', () => {
  it('renders registration form', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
  })
})
