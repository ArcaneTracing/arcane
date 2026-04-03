import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SetupPasswordInput } from '../setup-password-input'

describe('SetupPasswordInput', () => {
  it('renders label and input with password type by default', () => {
    render(
      <SetupPasswordInput
        id="test-password"
        label="Password"
        value=""
        onChange={jest.fn()}
        showPassword={false}
        onToggleVisibility={jest.fn()}
        placeholder="Enter password"
      />
    )
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter password')).toHaveAttribute('type', 'password')
  })

  it('shows text type when showPassword is true', () => {
    render(
      <SetupPasswordInput
        id="test-password"
        label="Password"
        value="secret"
        onChange={jest.fn()}
        showPassword={true}
        onToggleVisibility={jest.fn()}
        placeholder="Enter password"
      />
    )
    expect(screen.getByDisplayValue('secret')).toHaveAttribute('type', 'text')
  })

  it('calls onToggleVisibility when visibility button clicked', async () => {
    const onToggleVisibility = jest.fn()
    render(
      <SetupPasswordInput
        id="test-password"
        label="Password"
        value=""
        onChange={jest.fn()}
        showPassword={false}
        onToggleVisibility={onToggleVisibility}
        placeholder="Enter password"
      />
    )
    const toggleButton = screen.getByRole('button', { name: '' })
    await userEvent.click(toggleButton)
    expect(onToggleVisibility).toHaveBeenCalled()
  })

  it('calls onChange when input value changes', async () => {
    const onChange = jest.fn()
    render(
      <SetupPasswordInput
        id="test-password"
        label="Password"
        value=""
        onChange={onChange}
        showPassword={true}
        onToggleVisibility={jest.fn()}
        placeholder="Enter password"
      />
    )
    await userEvent.type(screen.getByPlaceholderText('Enter password'), 'a')
    expect(onChange).toHaveBeenCalledWith('a')
  })
})
