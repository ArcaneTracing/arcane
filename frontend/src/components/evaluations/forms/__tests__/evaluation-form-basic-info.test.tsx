import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { EvaluationFormBasicInfo } from '../evaluation-form-basic-info'

describe('EvaluationFormBasicInfo', () => {
  const mockOnNameChange = jest.fn()
  const mockOnDescriptionChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render name and description fields', () => {
    render(
      <EvaluationFormBasicInfo
        name=""
        description=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    )

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter evaluation name')).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter evaluation description (optional)')).toBeInTheDocument()
  })

  it('should display current name and description values', () => {
    render(
      <EvaluationFormBasicInfo
        name="My Evaluation"
        description="Test description"
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    )

    expect(screen.getByDisplayValue('My Evaluation')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument()
  })

  it('should call onNameChange when name input changes', () => {
    render(
      <EvaluationFormBasicInfo
        name=""
        description=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    )

    fireEvent.change(screen.getByPlaceholderText('Enter evaluation name'), {
      target: { value: 'New Name' },
    })

    expect(mockOnNameChange).toHaveBeenCalledWith('New Name')
  })

  it('should call onDescriptionChange when description changes', () => {
    render(
      <EvaluationFormBasicInfo
        name=""
        description=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
      />
    )

    fireEvent.change(screen.getByPlaceholderText('Enter evaluation description (optional)'), {
      target: { value: 'New description' },
    })

    expect(mockOnDescriptionChange).toHaveBeenCalledWith('New description')
  })

  it('should disable inputs when isLoading or isEditMode', () => {
    render(
      <EvaluationFormBasicInfo
        name=""
        description=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
        isLoading={true}
      />
    )

    expect(screen.getByPlaceholderText('Enter evaluation name')).toBeDisabled()
    expect(screen.getByPlaceholderText('Enter evaluation description (optional)')).toBeDisabled()
  })

  it('should disable inputs when isEditMode', () => {
    render(
      <EvaluationFormBasicInfo
        name=""
        description=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
        isEditMode={true}
      />
    )

    expect(screen.getByPlaceholderText('Enter evaluation name')).toBeDisabled()
  })
})
