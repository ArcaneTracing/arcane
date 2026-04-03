import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PromptFormTopBar } from '../prompt-form-top-bar'
import { TemplateFormat } from '@/types/enums'

jest.mock('@/lib/error-handling', () => ({
  isForbiddenError: jest.fn(() => false),
}))

const mockConfigs = [
  {
    id: 'config-1',
    name: 'Config 1',
    configuration: { modelName: 'gpt-4' },
  },
  {
    id: 'config-2',
    name: 'Config 2',
    configuration: { modelName: 'claude-3' },
  },
] as any

describe('PromptFormTopBar', () => {
  const onTemplateFormatChange = jest.fn()
  const onModelConfigurationChange = jest.fn()
  const onRun = jest.fn()
  const onSave = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    require('@/lib/error-handling').isForbiddenError.mockReturnValue(false)
  })

  it('renders template format buttons', () => {
    render(
      <PromptFormTopBar
        templateFormat={TemplateFormat.NONE}
        modelConfigurationId=""
        configurations={mockConfigs}
        isEditMode={false}
        isLoading={false}
        isRunning={false}
        canRun={true}
        onTemplateFormatChange={onTemplateFormatChange}
        onModelConfigurationChange={onModelConfigurationChange}
        onRun={onRun}
        onSave={onSave}
      />
    )
    expect(screen.getByRole('button', { name: 'None' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mustache' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'F-String' })).toBeInTheDocument()
  })

  it('calls onTemplateFormatChange when format button clicked', () => {
    render(
      <PromptFormTopBar
        templateFormat={TemplateFormat.NONE}
        modelConfigurationId=""
        configurations={mockConfigs}
        isEditMode={false}
        isLoading={false}
        isRunning={false}
        canRun={true}
        onTemplateFormatChange={onTemplateFormatChange}
        onModelConfigurationChange={onModelConfigurationChange}
        onRun={onRun}
        onSave={onSave}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Mustache' }))
    expect(onTemplateFormatChange).toHaveBeenCalledWith(TemplateFormat.MUSTACHE)
  })

  it('calls onRun when Run button clicked', () => {
    render(
      <PromptFormTopBar
        templateFormat={TemplateFormat.NONE}
        modelConfigurationId=""
        configurations={mockConfigs}
        isEditMode={false}
        isLoading={false}
        isRunning={false}
        canRun={true}
        onTemplateFormatChange={onTemplateFormatChange}
        onModelConfigurationChange={onModelConfigurationChange}
        onRun={onRun}
        onSave={onSave}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /run/i }))
    expect(onRun).toHaveBeenCalled()
  })

  it('calls onSave when Save button clicked', () => {
    render(
      <PromptFormTopBar
        templateFormat={TemplateFormat.NONE}
        modelConfigurationId=""
        configurations={mockConfigs}
        isEditMode={false}
        isLoading={false}
        isRunning={false}
        canRun={true}
        onTemplateFormatChange={onTemplateFormatChange}
        onModelConfigurationChange={onModelConfigurationChange}
        onRun={onRun}
        onSave={onSave}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /save prompt/i }))
    expect(onSave).toHaveBeenCalled()
  })

  it('shows Save as New Version when isEditMode', () => {
    render(
      <PromptFormTopBar
        templateFormat={TemplateFormat.NONE}
        modelConfigurationId=""
        configurations={mockConfigs}
        isEditMode={true}
        isLoading={false}
        isRunning={false}
        canRun={true}
        onTemplateFormatChange={onTemplateFormatChange}
        onModelConfigurationChange={onModelConfigurationChange}
        onRun={onRun}
        onSave={onSave}
      />
    )
    expect(screen.getByRole('button', { name: /save as new version/i })).toBeInTheDocument()
  })

  it('shows Running... when isRunning', () => {
    render(
      <PromptFormTopBar
        templateFormat={TemplateFormat.NONE}
        modelConfigurationId=""
        configurations={mockConfigs}
        isEditMode={false}
        isLoading={false}
        isRunning={true}
        canRun={true}
        onTemplateFormatChange={onTemplateFormatChange}
        onModelConfigurationChange={onModelConfigurationChange}
        onRun={onRun}
        onSave={onSave}
      />
    )
    expect(screen.getByText('Running...')).toBeInTheDocument()
  })

  it('shows Saving... when isLoading', () => {
    render(
      <PromptFormTopBar
        templateFormat={TemplateFormat.NONE}
        modelConfigurationId=""
        configurations={mockConfigs}
        isEditMode={false}
        isLoading={true}
        isRunning={false}
        canRun={true}
        onTemplateFormatChange={onTemplateFormatChange}
        onModelConfigurationChange={onModelConfigurationChange}
        onRun={onRun}
        onSave={onSave}
      />
    )
    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  it('renders model select when isLoadingConfigs', () => {
    render(
      <PromptFormTopBar
        templateFormat={TemplateFormat.NONE}
        modelConfigurationId=""
        configurations={[]}
        isEditMode={false}
        isLoading={false}
        isRunning={false}
        canRun={true}
        onTemplateFormatChange={onTemplateFormatChange}
        onModelConfigurationChange={onModelConfigurationChange}
        onRun={onRun}
        onSave={onSave}
        isLoadingConfigs={true}
      />
    )
    expect(screen.getByTestId('select')).toBeInTheDocument()
  })

  it('shows permission error when hasConfigsPermissionError', () => {
    require('@/lib/error-handling').isForbiddenError.mockReturnValue(true)
    render(
      <PromptFormTopBar
        templateFormat={TemplateFormat.NONE}
        modelConfigurationId=""
        configurations={[]}
        isEditMode={false}
        isLoading={false}
        isRunning={false}
        canRun={true}
        onTemplateFormatChange={onTemplateFormatChange}
        onModelConfigurationChange={onModelConfigurationChange}
        onRun={onRun}
        onSave={onSave}
        error={new Error('Forbidden')}
      />
    )
    fireEvent.click(screen.getByTestId('select').querySelector('button')!)
    expect(screen.getByText(/don't have permission/i)).toBeInTheDocument()
  })

  it('shows No configurations available when configs empty', () => {
    render(
      <PromptFormTopBar
        templateFormat={TemplateFormat.NONE}
        modelConfigurationId=""
        configurations={[]}
        isEditMode={false}
        isLoading={false}
        isRunning={false}
        canRun={true}
        onTemplateFormatChange={onTemplateFormatChange}
        onModelConfigurationChange={onModelConfigurationChange}
        onRun={onRun}
        onSave={onSave}
      />
    )
    fireEvent.click(screen.getByTestId('select').querySelector('button')!)
    expect(screen.getByText(/no configurations available/i)).toBeInTheDocument()
  })

  it('shows modelConfigurationError when provided', () => {
    render(
      <PromptFormTopBar
        templateFormat={TemplateFormat.NONE}
        modelConfigurationId=""
        configurations={mockConfigs}
        isEditMode={false}
        isLoading={false}
        isRunning={false}
        canRun={true}
        onTemplateFormatChange={onTemplateFormatChange}
        onModelConfigurationChange={onModelConfigurationChange}
        onRun={onRun}
        onSave={onSave}
        modelConfigurationError="Please select a model"
      />
    )
    expect(screen.getByText('Please select a model')).toBeInTheDocument()
  })
})
