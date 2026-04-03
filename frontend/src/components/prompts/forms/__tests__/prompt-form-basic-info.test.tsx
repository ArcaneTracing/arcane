import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PromptFormBasicInfo } from '../prompt-form-basic-info'

describe('PromptFormBasicInfo', () => {
  const onNameChange = jest.fn()
  const onDescriptionChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders name and description fields with labels', () => {
    render(
      <PromptFormBasicInfo
        name=""
        description=""
        onNameChange={onNameChange}
        onDescriptionChange={onDescriptionChange}
      />
    )

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter prompt name')).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter prompt description')).toBeInTheDocument()
  })

  it('displays current values', () => {
    render(
      <PromptFormBasicInfo
        name="My Prompt"
        description="Prompt description"
        onNameChange={onNameChange}
        onDescriptionChange={onDescriptionChange}
      />
    )

    expect(screen.getByDisplayValue('My Prompt')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Prompt description')).toBeInTheDocument()
  })

  it('calls onNameChange when name input changes', () => {
    render(
      <PromptFormBasicInfo
        name=""
        description=""
        onNameChange={onNameChange}
        onDescriptionChange={onDescriptionChange}
      />
    )

    fireEvent.change(screen.getByPlaceholderText('Enter prompt name'), {
      target: { value: 'New Name' },
    })

    expect(onNameChange).toHaveBeenCalledWith('New Name')
  })

  it('calls onDescriptionChange when description input changes', () => {
    render(
      <PromptFormBasicInfo
        name=""
        description=""
        onNameChange={onNameChange}
        onDescriptionChange={onDescriptionChange}
      />
    )

    fireEvent.change(screen.getByPlaceholderText('Enter prompt description'), {
      target: { value: 'New Description' },
    })

    expect(onDescriptionChange).toHaveBeenCalledWith('New Description')
  })
})

