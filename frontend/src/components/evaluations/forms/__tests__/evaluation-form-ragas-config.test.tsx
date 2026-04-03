import React from 'react'
import { render, screen } from '@testing-library/react'
import { AxiosError } from 'axios'
import { EvaluationFormRagasConfig } from '../evaluation-form-ragas-config'
import type { ModelConfigurationResponse } from '@/types/model-configuration'

const mockConfigurations: ModelConfigurationResponse[] = [
  {
    id: 'config-1',
    name: 'GPT-4 Config',
    configuration: { modelName: 'gpt-4' },
  } as ModelConfigurationResponse,
  {
    id: 'config-2',
    name: 'Claude Config',
    configuration: { modelName: 'claude-3' },
  } as ModelConfigurationResponse,
]

describe('EvaluationFormRagasConfig', () => {
  const mockOnConfigurationChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders RAGAS Model label with required indicator', () => {
    render(
      <EvaluationFormRagasConfig
        ragasModelConfigurationId=""
        configurations={mockConfigurations}
        loadingModelConfigurations={false}
        onConfigurationChange={mockOnConfigurationChange}
      />
    )
    expect(screen.getByLabelText(/ragas model/i)).toBeInTheDocument()
  })

  it('shows loading spinner when loadingModelConfigurations is true', () => {
    render(
      <EvaluationFormRagasConfig
        ragasModelConfigurationId=""
        configurations={[]}
        loadingModelConfigurations={true}
        onConfigurationChange={mockOnConfigurationChange}
      />
    )
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument()
  })

  it('shows "No model configurations available" when configurations is empty', () => {
    render(
      <EvaluationFormRagasConfig
        ragasModelConfigurationId=""
        configurations={[]}
        loadingModelConfigurations={false}
        onConfigurationChange={mockOnConfigurationChange}
      />
    )
    expect(screen.getByText(/no model configurations available/i)).toBeInTheDocument()
  })

  it('shows configuration options when configurations are provided', () => {
    render(
      <EvaluationFormRagasConfig
        ragasModelConfigurationId=""
        configurations={mockConfigurations}
        loadingModelConfigurations={false}
        onConfigurationChange={mockOnConfigurationChange}
      />
    )
    expect(screen.getByText(/GPT-4 Config/)).toBeInTheDocument()
    expect(screen.getByText(/gpt-4/)).toBeInTheDocument()
  })

  it('shows permission error when error is 403 Forbidden', () => {
    const forbiddenError = new AxiosError('Forbidden')
    ;(forbiddenError as any).response = { status: 403 }
    render(
      <EvaluationFormRagasConfig
        ragasModelConfigurationId=""
        configurations={mockConfigurations}
        loadingModelConfigurations={false}
        onConfigurationChange={mockOnConfigurationChange}
        error={forbiddenError}
      />
    )
    expect(screen.getByText(/you don't have permission to view model configurations/i)).toBeInTheDocument()
  })
})
