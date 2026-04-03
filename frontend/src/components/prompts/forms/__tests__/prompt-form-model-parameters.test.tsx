import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PromptFormModelParameters } from '../prompt-form-model-parameters'

describe('PromptFormModelParameters', () => {
  const onTemperatureChange = jest.fn()
  const onMaxTokensChange = jest.fn()
  const onTopPChange = jest.fn()
  const onCustomParamsChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders Model Parameters section', () => {
    render(
      <PromptFormModelParameters
        temperature="0.7"
        maxTokens="1000"
        topP="1.0"
        customParams={[]}
        onTemperatureChange={onTemperatureChange}
        onMaxTokensChange={onMaxTokensChange}
        onTopPChange={onTopPChange}
        onCustomParamsChange={onCustomParamsChange}
      />
    )
    expect(screen.getByText('Model Parameters')).toBeInTheDocument()
  })

  it('renders temperature, max tokens, and top P inputs', () => {
    render(
      <PromptFormModelParameters
        temperature="0.7"
        maxTokens="1000"
        topP="1.0"
        customParams={[]}
        onTemperatureChange={onTemperatureChange}
        onMaxTokensChange={onMaxTokensChange}
        onTopPChange={onTopPChange}
        onCustomParamsChange={onCustomParamsChange}
      />
    )
    expect(screen.getByLabelText(/temperature/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/max tokens/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/top p/i)).toBeInTheDocument()
  })

  it('displays current values', () => {
    render(
      <PromptFormModelParameters
        temperature="0.5"
        maxTokens="500"
        topP="0.9"
        customParams={[]}
        onTemperatureChange={onTemperatureChange}
        onMaxTokensChange={onMaxTokensChange}
        onTopPChange={onTopPChange}
        onCustomParamsChange={onCustomParamsChange}
      />
    )
    expect(screen.getByDisplayValue('0.5')).toBeInTheDocument()
    expect(screen.getByDisplayValue('500')).toBeInTheDocument()
    expect(screen.getByDisplayValue('0.9')).toBeInTheDocument()
  })

  it('calls onTemperatureChange when temperature changes', () => {
    render(
      <PromptFormModelParameters
        temperature="0.7"
        maxTokens="1000"
        topP="1.0"
        customParams={[]}
        onTemperatureChange={onTemperatureChange}
        onMaxTokensChange={onMaxTokensChange}
        onTopPChange={onTopPChange}
        onCustomParamsChange={onCustomParamsChange}
      />
    )
    fireEvent.change(screen.getByLabelText(/temperature/i), {
      target: { value: '0.8' },
    })
    expect(onTemperatureChange).toHaveBeenCalledWith('0.8')
  })

  it('calls onMaxTokensChange when max tokens changes', () => {
    render(
      <PromptFormModelParameters
        temperature="0.7"
        maxTokens="1000"
        topP="1.0"
        customParams={[]}
        onTemperatureChange={onTemperatureChange}
        onMaxTokensChange={onMaxTokensChange}
        onTopPChange={onTopPChange}
        onCustomParamsChange={onCustomParamsChange}
      />
    )
    fireEvent.change(screen.getByLabelText(/max tokens/i), {
      target: { value: '2000' },
    })
    expect(onMaxTokensChange).toHaveBeenCalledWith('2000')
  })

  it('calls onTopPChange when top P changes', () => {
    render(
      <PromptFormModelParameters
        temperature="0.7"
        maxTokens="1000"
        topP="1.0"
        customParams={[]}
        onTemperatureChange={onTemperatureChange}
        onMaxTokensChange={onMaxTokensChange}
        onTopPChange={onTopPChange}
        onCustomParamsChange={onCustomParamsChange}
      />
    )
    fireEvent.change(screen.getByLabelText(/top p/i), {
      target: { value: '0.95' },
    })
    expect(onTopPChange).toHaveBeenCalledWith('0.95')
  })

  it('renders Custom Parameters section with Add Parameter button', () => {
    render(
      <PromptFormModelParameters
        temperature="0.7"
        maxTokens="1000"
        topP="1.0"
        customParams={[]}
        onTemperatureChange={onTemperatureChange}
        onMaxTokensChange={onMaxTokensChange}
        onTopPChange={onTopPChange}
        onCustomParamsChange={onCustomParamsChange}
      />
    )
    expect(screen.getByText('Custom Parameters')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add parameter/i })).toBeInTheDocument()
  })

  it('shows empty state when no custom params', () => {
    render(
      <PromptFormModelParameters
        temperature="0.7"
        maxTokens="1000"
        topP="1.0"
        customParams={[]}
        onTemperatureChange={onTemperatureChange}
        onMaxTokensChange={onMaxTokensChange}
        onTopPChange={onTopPChange}
        onCustomParamsChange={onCustomParamsChange}
      />
    )
    expect(screen.getByText(/No custom parameters/i)).toBeInTheDocument()
  })

  it('calls onCustomParamsChange when Add Parameter clicked', () => {
    render(
      <PromptFormModelParameters
        temperature="0.7"
        maxTokens="1000"
        topP="1.0"
        customParams={[]}
        onTemperatureChange={onTemperatureChange}
        onMaxTokensChange={onMaxTokensChange}
        onTopPChange={onTopPChange}
        onCustomParamsChange={onCustomParamsChange}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /add parameter/i }))
    expect(onCustomParamsChange).toHaveBeenCalledWith([{ key: '', value: '' }])
  })

  it('renders custom param rows and allows editing', () => {
    render(
      <PromptFormModelParameters
        temperature="0.7"
        maxTokens="1000"
        topP="1.0"
        customParams={[{ key: 'param1', value: 'val1' }]}
        onTemperatureChange={onTemperatureChange}
        onMaxTokensChange={onMaxTokensChange}
        onTopPChange={onTopPChange}
        onCustomParamsChange={onCustomParamsChange}
      />
    )
    expect(screen.getByDisplayValue('param1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('val1')).toBeInTheDocument()
  })

  it('calls onCustomParamsChange when param key changes', () => {
    render(
      <PromptFormModelParameters
        temperature="0.7"
        maxTokens="1000"
        topP="1.0"
        customParams={[{ key: 'param1', value: 'val1' }]}
        onTemperatureChange={onTemperatureChange}
        onMaxTokensChange={onMaxTokensChange}
        onTopPChange={onTopPChange}
        onCustomParamsChange={onCustomParamsChange}
      />
    )
    const keyInputs = screen.getAllByPlaceholderText('Parameter name')
    fireEvent.change(keyInputs[0], { target: { value: 'newKey' } })
    expect(onCustomParamsChange).toHaveBeenCalledWith([{ key: 'newKey', value: 'val1' }])
  })

  it('calls onCustomParamsChange when remove button clicked', () => {
    render(
      <PromptFormModelParameters
        temperature="0.7"
        maxTokens="1000"
        topP="1.0"
        customParams={[{ key: 'param1', value: 'val1' }]}
        onTemperatureChange={onTemperatureChange}
        onMaxTokensChange={onMaxTokensChange}
        onTopPChange={onTopPChange}
        onCustomParamsChange={onCustomParamsChange}
      />
    )
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[buttons.length - 1])
    expect(onCustomParamsChange).toHaveBeenCalledWith([])
  })
})
