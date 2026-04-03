import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ModelConfigurationFormParameters } from '../model-configuration-form-parameters'
import { render as customRender } from '@/__tests__/test-utils'

describe('ModelConfigurationFormParameters', () => {
  const mockOnTemperatureChange = jest.fn()
  const mockOnMaxTokensChange = jest.fn()
  const mockOnTopPChange = jest.fn()
  const mockOnFrequencyPenaltyChange = jest.fn()
  const mockOnPresencePenaltyChange = jest.fn()

  const defaultProps = {
    temperature: '',
    maxTokens: '',
    topP: '',
    frequencyPenalty: '',
    presencePenalty: '',
    isLoading: false,
    onTemperatureChange: mockOnTemperatureChange,
    onMaxTokensChange: mockOnMaxTokensChange,
    onTopPChange: mockOnTopPChange,
    onFrequencyPenaltyChange: mockOnFrequencyPenaltyChange,
    onPresencePenaltyChange: mockOnPresencePenaltyChange,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all parameter fields', () => {
    customRender(<ModelConfigurationFormParameters {...defaultProps} />)

    expect(screen.getByLabelText(/^temperature$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^max tokens$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^top p$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^frequency penalty$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^presence penalty$/i)).toBeInTheDocument()
  })

  it('should display temperature value', () => {
    customRender(<ModelConfigurationFormParameters {...defaultProps} temperature="0.7" />)

    const temperatureInput = screen.getByLabelText(/^temperature$/i) as HTMLInputElement
    expect(temperatureInput.value).toBe('0.7')
  })

  it('should display maxTokens value', () => {
    customRender(<ModelConfigurationFormParameters {...defaultProps} maxTokens="2000" />)

    const maxTokensInput = screen.getByLabelText(/^max tokens$/i) as HTMLInputElement
    expect(maxTokensInput.value).toBe('2000')
  })

  it('should display topP value', () => {
    customRender(<ModelConfigurationFormParameters {...defaultProps} topP="1.0" />)

    const topPInput = screen.getByLabelText(/^top p$/i) as HTMLInputElement
    expect(topPInput.value).toBe('1.0')
  })

  it('should display frequencyPenalty value', () => {
    customRender(<ModelConfigurationFormParameters {...defaultProps} frequencyPenalty="0.5" />)

    const frequencyPenaltyInput = screen.getByLabelText(/^frequency penalty$/i) as HTMLInputElement
    expect(frequencyPenaltyInput.value).toBe('0.5')
  })

  it('should display presencePenalty value', () => {
    customRender(<ModelConfigurationFormParameters {...defaultProps} presencePenalty="0.3" />)

    const presencePenaltyInput = screen.getByLabelText(/^presence penalty$/i) as HTMLInputElement
    expect(presencePenaltyInput.value).toBe('0.3')
  })

  it('should call onTemperatureChange when temperature changes', () => {
    customRender(<ModelConfigurationFormParameters {...defaultProps} />)

    const temperatureInput = screen.getByLabelText(/^temperature$/i) as HTMLInputElement
    fireEvent.change(temperatureInput, { target: { value: '0.8' } })

    expect(mockOnTemperatureChange).toHaveBeenCalledWith('0.8')
  })

  it('should call onMaxTokensChange when maxTokens changes', () => {
    customRender(<ModelConfigurationFormParameters {...defaultProps} />)

    const maxTokensInput = screen.getByLabelText(/^max tokens$/i) as HTMLInputElement
    fireEvent.change(maxTokensInput, { target: { value: '3000' } })

    expect(mockOnMaxTokensChange).toHaveBeenCalledWith('3000')
  })

  it('should call onTopPChange when topP changes', () => {
    customRender(<ModelConfigurationFormParameters {...defaultProps} />)

    const topPInput = screen.getByLabelText(/^top p$/i) as HTMLInputElement
    fireEvent.change(topPInput, { target: { value: '0.9' } })

    expect(mockOnTopPChange).toHaveBeenCalledWith('0.9')
  })

  it('should call onFrequencyPenaltyChange when frequencyPenalty changes', () => {
    customRender(<ModelConfigurationFormParameters {...defaultProps} />)

    const frequencyPenaltyInput = screen.getByLabelText(/^frequency penalty$/i) as HTMLInputElement
    fireEvent.change(frequencyPenaltyInput, { target: { value: '0.4' } })

    expect(mockOnFrequencyPenaltyChange).toHaveBeenCalledWith('0.4')
  })

  it('should call onPresencePenaltyChange when presencePenalty changes', () => {
    customRender(<ModelConfigurationFormParameters {...defaultProps} />)

    const presencePenaltyInput = screen.getByLabelText(/^presence penalty$/i) as HTMLInputElement
    fireEvent.change(presencePenaltyInput, { target: { value: '0.2' } })

    expect(mockOnPresencePenaltyChange).toHaveBeenCalledWith('0.2')
  })

  it('should disable all inputs when isLoading is true', () => {
    customRender(<ModelConfigurationFormParameters {...defaultProps} isLoading={true} />)

    const temperatureInput = screen.getByLabelText(/^temperature$/i)
    const maxTokensInput = screen.getByLabelText(/^max tokens$/i)
    const topPInput = screen.getByLabelText(/^top p$/i)
    const frequencyPenaltyInput = screen.getByLabelText(/^frequency penalty$/i)
    const presencePenaltyInput = screen.getByLabelText(/^presence penalty$/i)

    expect(temperatureInput).toHaveAttribute('disabled')
    expect(maxTokensInput).toHaveAttribute('disabled')
    expect(topPInput).toHaveAttribute('disabled')
    expect(frequencyPenaltyInput).toHaveAttribute('disabled')
    expect(presencePenaltyInput).toHaveAttribute('disabled')
  })

  it('should have correct input attributes for temperature', () => {
    customRender(<ModelConfigurationFormParameters {...defaultProps} />)

    const temperatureInput = screen.getByLabelText(/^temperature$/i) as HTMLInputElement
    expect(temperatureInput).toHaveAttribute('type', 'number')
    expect(temperatureInput).toHaveAttribute('step', '0.1')
    expect(temperatureInput).toHaveAttribute('min', '0')
    expect(temperatureInput).toHaveAttribute('max', '2')
  })

  it('should have correct input attributes for topP', () => {
    customRender(<ModelConfigurationFormParameters {...defaultProps} />)

    const topPInput = screen.getByLabelText(/^top p$/i) as HTMLInputElement
    expect(topPInput).toHaveAttribute('type', 'number')
    expect(topPInput).toHaveAttribute('step', '0.1')
    expect(topPInput).toHaveAttribute('min', '0')
    expect(topPInput).toHaveAttribute('max', '1')
  })

  it('should have correct input attributes for frequencyPenalty', () => {
    customRender(<ModelConfigurationFormParameters {...defaultProps} />)

    const frequencyPenaltyInput = screen.getByLabelText(/^frequency penalty$/i) as HTMLInputElement
    expect(frequencyPenaltyInput).toHaveAttribute('type', 'number')
    expect(frequencyPenaltyInput).toHaveAttribute('step', '0.1')
    expect(frequencyPenaltyInput).toHaveAttribute('min', '-2')
    expect(frequencyPenaltyInput).toHaveAttribute('max', '2')
  })

  it('should have correct input attributes for presencePenalty', () => {
    customRender(<ModelConfigurationFormParameters {...defaultProps} />)

    const presencePenaltyInput = screen.getByLabelText(/^presence penalty$/i) as HTMLInputElement
    expect(presencePenaltyInput).toHaveAttribute('type', 'number')
    expect(presencePenaltyInput).toHaveAttribute('step', '0.1')
    expect(presencePenaltyInput).toHaveAttribute('min', '-2')
    expect(presencePenaltyInput).toHaveAttribute('max', '2')
  })

  it('should display placeholder values', () => {
    customRender(<ModelConfigurationFormParameters {...defaultProps} />)

    const temperatureInput = screen.getByLabelText(/^temperature$/i) as HTMLInputElement
    const maxTokensInput = screen.getByLabelText(/^max tokens$/i) as HTMLInputElement
    const topPInput = screen.getByLabelText(/^top p$/i) as HTMLInputElement
    const frequencyPenaltyInput = screen.getByLabelText(/^frequency penalty$/i) as HTMLInputElement
    const presencePenaltyInput = screen.getByLabelText(/^presence penalty$/i) as HTMLInputElement

    expect(temperatureInput.placeholder).toBe('0.7')
    expect(maxTokensInput.placeholder).toBe('2000')
    expect(topPInput.placeholder).toBe('1.0')
    expect(frequencyPenaltyInput.placeholder).toBe('0.0')
    expect(presencePenaltyInput.placeholder).toBe('0.0')
  })

  it('should handle negative penalty values', () => {
    customRender(
      <ModelConfigurationFormParameters
        {...defaultProps}
        frequencyPenalty="-1.5"
        presencePenalty="-0.5"
      />
    )

    const frequencyPenaltyInput = screen.getByLabelText(/^frequency penalty$/i) as HTMLInputElement
    const presencePenaltyInput = screen.getByLabelText(/^presence penalty$/i) as HTMLInputElement

    expect(frequencyPenaltyInput.value).toBe('-1.5')
    expect(presencePenaltyInput.value).toBe('-0.5')
  })

  it('should handle empty values', () => {
    customRender(<ModelConfigurationFormParameters {...defaultProps} />)

    const temperatureInput = screen.getByLabelText(/^temperature$/i) as HTMLInputElement
    const maxTokensInput = screen.getByLabelText(/^max tokens$/i) as HTMLInputElement

    expect(temperatureInput.value).toBe('')
    expect(maxTokensInput.value).toBe('')
  })
})

