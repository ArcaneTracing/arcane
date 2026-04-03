import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SetupFormView } from '../setup-form-view'

jest.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}))

const defaultProps = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  organisationName: '',
  error: '',
  isLoading: false,
  isSigningUp: false,
  showPassword: false,
  showConfirmPassword: false,
  onNameChange: jest.fn(),
  onEmailChange: jest.fn(),
  onPasswordChange: jest.fn(),
  onConfirmPasswordChange: jest.fn(),
  onOrganisationNameChange: jest.fn(),
  onTogglePasswordVisibility: jest.fn(),
  onToggleConfirmPasswordVisibility: jest.fn(),
  onSubmit: jest.fn(),
}

describe('SetupFormView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form fields and submit button', () => {
    render(<SetupFormView {...defaultProps} />)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/organization name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /complete setup/i })).toBeInTheDocument()
  })

  it('shows error message when error prop is set', () => {
    render(<SetupFormView {...defaultProps} error="Invalid email" />)
    expect(screen.getByText('Invalid email')).toBeInTheDocument()
  })

  it('shows loading state on submit button when isLoading', () => {
    render(<SetupFormView {...defaultProps} isLoading={true} />)
    expect(screen.getByRole('button', { name: /setting up/i })).toBeDisabled()
  })

  it('calls onSubmit when form is submitted', () => {
    const onSubmit = jest.fn()
    render(<SetupFormView {...defaultProps} onSubmit={onSubmit} />)
    const form = screen.getByRole('button', { name: /complete setup/i }).closest('form')
    expect(form).toBeInTheDocument()
    fireEvent.submit(form!)
    expect(onSubmit).toHaveBeenCalled()
  })
})
