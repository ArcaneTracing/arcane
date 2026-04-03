import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ModelConfigurationFormCostFields } from '../model-configuration-form-cost-fields'
import { render as customRender } from '@/__tests__/test-utils'

describe('ModelConfigurationFormCostFields', () => {
  const mockOnInputCostChange = jest.fn()
  const mockOnOutputCostChange = jest.fn()

  const defaultProps = {
    inputCostPerToken: '',
    outputCostPerToken: '',
    isLoading: false,
    onInputCostChange: mockOnInputCostChange,
    onOutputCostChange: mockOnOutputCostChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render both cost fields', () => {
    customRender(<ModelConfigurationFormCostFields {...defaultProps} />)

    expect(screen.getByLabelText(/input cost per token/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/output cost per token/i)).toBeInTheDocument()
  })

  it('should display input cost value', () => {
    customRender(
      <ModelConfigurationFormCostFields {...defaultProps} inputCostPerToken="0.00003" />
    )

    const inputCostInput = screen.getByLabelText(/input cost per token/i) as HTMLInputElement
    expect(inputCostInput.value).toBe('0.00003')
  })

  it('should display output cost value', () => {
    customRender(
      <ModelConfigurationFormCostFields {...defaultProps} outputCostPerToken="0.00006" />
    )

    const outputCostInput = screen.getByLabelText(/output cost per token/i) as HTMLInputElement
    expect(outputCostInput.value).toBe('0.00006')
  })

  it('should call onInputCostChange when input cost changes', () => {
    customRender(<ModelConfigurationFormCostFields {...defaultProps} />)

    const inputCostInput = screen.getByLabelText(/input cost per token/i) as HTMLInputElement
    fireEvent.change(inputCostInput, { target: { value: '0.00003' } })

    expect(mockOnInputCostChange).toHaveBeenCalledWith('0.00003')
  })

  it('should call onOutputCostChange when output cost changes', () => {
    customRender(<ModelConfigurationFormCostFields {...defaultProps} />)

    const outputCostInput = screen.getByLabelText(/output cost per token/i) as HTMLInputElement
    fireEvent.change(outputCostInput, { target: { value: '0.00006' } })

    expect(mockOnOutputCostChange).toHaveBeenCalledWith('0.00006')
  })

  it('should disable inputs when isLoading is true', () => {
    customRender(<ModelConfigurationFormCostFields {...defaultProps} isLoading={true} />)

    const inputCostInput = screen.getByLabelText(/input cost per token/i)
    const outputCostInput = screen.getByLabelText(/output cost per token/i)

    expect(inputCostInput).toHaveAttribute('disabled')
    expect(outputCostInput).toHaveAttribute('disabled')
  })

  it('should have correct input type and step for number inputs', () => {
    customRender(<ModelConfigurationFormCostFields {...defaultProps} />)

    const inputCostInput = screen.getByLabelText(/input cost per token/i) as HTMLInputElement
    const outputCostInput = screen.getByLabelText(/output cost per token/i) as HTMLInputElement

    expect(inputCostInput).toHaveAttribute('type', 'number')
    expect(inputCostInput).toHaveAttribute('step', '0.0000001')
    expect(outputCostInput).toHaveAttribute('type', 'number')
    expect(outputCostInput).toHaveAttribute('step', '0.0000001')
  })

  it('should display placeholder values', () => {
    customRender(<ModelConfigurationFormCostFields {...defaultProps} />)

    const inputCostInput = screen.getByLabelText(/input cost per token/i) as HTMLInputElement
    const outputCostInput = screen.getByLabelText(/output cost per token/i) as HTMLInputElement

    expect(inputCostInput.placeholder).toBe('0.00003')
    expect(outputCostInput.placeholder).toBe('0.00006')
  })

  it('should handle empty values', () => {
    customRender(<ModelConfigurationFormCostFields {...defaultProps} />)

    const inputCostInput = screen.getByLabelText(/input cost per token/i) as HTMLInputElement
    const outputCostInput = screen.getByLabelText(/output cost per token/i) as HTMLInputElement

    expect(inputCostInput.value).toBe('')
    expect(outputCostInput.value).toBe('')
  })

  it('should handle very small decimal values', () => {
    customRender(
      <ModelConfigurationFormCostFields
        {...defaultProps}
        inputCostPerToken="0.0000001"
        outputCostPerToken="0.0000002"
      />
    )

    const inputCostInput = screen.getByLabelText(/input cost per token/i) as HTMLInputElement
    const outputCostInput = screen.getByLabelText(/output cost per token/i) as HTMLInputElement

    expect(inputCostInput.value).toBe('0.0000001')
    expect(outputCostInput.value).toBe('0.0000002')
  })

  it('should handle large values', () => {
    customRender(
      <ModelConfigurationFormCostFields
        {...defaultProps}
        inputCostPerToken="1.5"
        outputCostPerToken="2.5"
      />
    )

    const inputCostInput = screen.getByLabelText(/input cost per token/i) as HTMLInputElement
    const outputCostInput = screen.getByLabelText(/output cost per token/i) as HTMLInputElement

    expect(inputCostInput.value).toBe('1.5')
    expect(outputCostInput.value).toBe('2.5')
  })
})

