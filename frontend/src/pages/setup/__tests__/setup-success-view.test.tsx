import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from '@tanstack/react-router'
import { SetupSuccessView } from '../setup-success-view'

const mockNavigate = jest.fn()
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: () => mockNavigate,
  MemoryRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
jest.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}))
jest.mock('@/lib/navigation', () => ({
  createNavigationPath: (path: string) => path,
}))

describe('SetupSuccessView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders success message and Go to Login button', () => {
    render(
      <MemoryRouter>
        <SetupSuccessView createdOrganisationId={null} />
      </MemoryRouter>
    )
    expect(screen.getByText('Setup completed')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to Login' })).toBeInTheDocument()
  })

  it('renders Continue to app button when createdOrganisationId is provided', () => {
    render(
      <MemoryRouter>
        <SetupSuccessView createdOrganisationId="org-123" />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: 'Continue to app' })).toBeInTheDocument()
  })

  it('navigates to login when Go to Login clicked', async () => {
    render(
      <MemoryRouter>
        <SetupSuccessView createdOrganisationId={null} />
      </MemoryRouter>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Go to Login' }))
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' })
  })
})
