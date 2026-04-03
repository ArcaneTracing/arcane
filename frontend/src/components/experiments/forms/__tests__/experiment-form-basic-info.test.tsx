import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExperimentFormBasicInfo } from '../experiment-form-basic-info'

describe('ExperimentFormBasicInfo', () => {
  const mockSetName = jest.fn()
  const mockSetDescription = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render name and description fields', () => {
    render(
      <ExperimentFormBasicInfo
        name=""
        description=""
        setName={mockSetName}
        setDescription={mockSetDescription}
        isLoading={false}
        isEditMode={false}
      />
    )

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter experiment name')).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter experiment description (optional)')).toBeInTheDocument()
  })

  it('should display current values', () => {
    render(
      <ExperimentFormBasicInfo
        name="My Experiment"
        description="Test desc"
        setName={mockSetName}
        setDescription={mockSetDescription}
        isLoading={false}
        isEditMode={false}
      />
    )

    expect(screen.getByDisplayValue('My Experiment')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test desc')).toBeInTheDocument()
  })

  it('should call setName when name changes', () => {
    render(
      <ExperimentFormBasicInfo
        name=""
        description=""
        setName={mockSetName}
        setDescription={mockSetDescription}
        isLoading={false}
        isEditMode={false}
      />
    )

    fireEvent.change(screen.getByPlaceholderText('Enter experiment name'), {
      target: { value: 'New Experiment' },
    })

    expect(mockSetName).toHaveBeenCalledWith('New Experiment')
  })

  it('should call setDescription when description changes', () => {
    render(
      <ExperimentFormBasicInfo
        name=""
        description=""
        setName={mockSetName}
        setDescription={mockSetDescription}
        isLoading={false}
        isEditMode={false}
      />
    )

    fireEvent.change(screen.getByPlaceholderText('Enter experiment description (optional)'), {
      target: { value: 'New desc' },
    })

    expect(mockSetDescription).toHaveBeenCalledWith('New desc')
  })

  it('should disable inputs when isLoading', () => {
    render(
      <ExperimentFormBasicInfo
        name=""
        description=""
        setName={mockSetName}
        setDescription={mockSetDescription}
        isLoading={true}
        isEditMode={false}
      />
    )

    expect(screen.getByPlaceholderText('Enter experiment name')).toBeDisabled()
    expect(screen.getByPlaceholderText('Enter experiment description (optional)')).toBeDisabled()
  })

  it('should disable inputs when isEditMode', () => {
    render(
      <ExperimentFormBasicInfo
        name=""
        description=""
        setName={mockSetName}
        setDescription={mockSetDescription}
        isLoading={false}
        isEditMode={true}
      />
    )

    expect(screen.getByPlaceholderText('Enter experiment name')).toBeDisabled()
  })
})
