import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DatasetModeToggle } from '../dataset-mode-toggle'

describe('DatasetModeToggle', () => {
  it('renders label and switch', () => {
    const onToggle = jest.fn()
    render(<DatasetModeToggle enabled={false} onToggle={onToggle} />)
    expect(screen.getByText('Dataset Mode')).toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('calls onToggle when switch clicked', async () => {
    const user = userEvent.setup()
    const onToggle = jest.fn()
    render(<DatasetModeToggle enabled={false} onToggle={onToggle} />)
    await user.click(screen.getByRole('switch'))
    expect(onToggle).toHaveBeenCalledWith(true)
  })

  it('shows switch as checked when enabled', () => {
    const onToggle = jest.fn()
    render(<DatasetModeToggle enabled={true} onToggle={onToggle} />)
    expect(screen.getByRole('switch')).toBeChecked()
  })
})
