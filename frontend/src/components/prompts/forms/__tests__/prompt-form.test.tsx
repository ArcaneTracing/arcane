import React from 'react'
import { render, screen } from '@testing-library/react'
import { PromptForm } from '../prompt-form'

const mockSetVersionDialogOpen = jest.fn()
const mockFormState = {
  name: 'Test Prompt',
  description: '',
  templateFormat: 'JINJA2',
  modelConfigurationId: '',
  selectedModelConfig: null,
  temperature: '0.7',
  maxTokens: '1000',
  topP: '1',
  customParams: [],
  messages: [],
  responseFormat: '',
  responseFormatOpen: false,
  responseFormatSchemaOpen: false,
  tools: [],
  toolOpenStates: {},
  output: '',
  inputValues: {},
  versionDialogOpen: false,
  setName: jest.fn(),
  setDescription: jest.fn(),
  setTemplateFormat: jest.fn(),
  setModelConfigurationId: jest.fn(),
  setSelectedModelConfig: jest.fn(),
  setTemperature: jest.fn(),
  setMaxTokens: jest.fn(),
  setTopP: jest.fn(),
  setCustomParams: jest.fn(),
  setMessages: jest.fn(),
  setResponseFormat: jest.fn(),
  setResponseFormatOpen: jest.fn(),
  setResponseFormatSchemaOpen: jest.fn(),
  setTools: jest.fn(),
  setToolOpenStates: jest.fn(),
  setOutput: jest.fn(),
  setInputValues: jest.fn(),
  setVersionDialogOpen: mockSetVersionDialogOpen,
  configurations: [],
  configsError: null,
  isLoadingConfigs: false,
}

const mockActions = {
  addMessage: jest.fn(),
  removeMessage: jest.fn(),
  updateMessage: jest.fn(),
  copyMessage: jest.fn(),
  addTool: jest.fn(),
  removeTool: jest.fn(),
  updateTool: jest.fn(),
  copyTool: jest.fn(),
  toggleToolOpen: jest.fn(),
}

const mockSubmitLogic = {
  error: null,
  isLoading: false,
  isRunning: false,
  canRun: false,
  handleSubmit: jest.fn().mockResolvedValue(undefined),
  handleRun: jest.fn().mockResolvedValue(undefined),
}

jest.mock('@/hooks/prompts/use-prompt-form', () => ({
  usePromptForm: jest.fn(() => mockFormState),
}))
jest.mock('@/hooks/prompts/use-prompt-form-actions', () => ({
  usePromptFormActions: jest.fn(() => mockActions),
}))
jest.mock('@/hooks/prompts/use-prompt-form-submit', () => ({
  usePromptFormSubmit: jest.fn(() => mockSubmitLogic),
}))

jest.mock('../prompt-form-basic-info', () => ({
  PromptFormBasicInfo: () => <div data-testid="basic-info">Basic Info</div>,
}))
jest.mock('../prompt-form-model-parameters', () => ({
  PromptFormModelParameters: () => <div data-testid="model-params">Model Params</div>,
}))
jest.mock('../prompt-form-top-bar', () => ({
  PromptFormTopBar: () => <div data-testid="top-bar">Top Bar</div>,
}))
jest.mock('../prompt-form-messages', () => ({
  PromptFormMessages: () => <div data-testid="messages">Messages</div>,
}))
jest.mock('../prompt-form-actions', () => ({
  PromptFormActions: () => <div data-testid="form-actions">Form Actions</div>,
}))
jest.mock('../prompt-form-response-format', () => ({
  PromptFormResponseFormat: () => <div data-testid="response-format">Response Format</div>,
}))
jest.mock('../prompt-form-tools', () => ({
  PromptFormTools: () => <div data-testid="tools">Tools</div>,
}))
jest.mock('../prompt-form-inputs', () => ({
  PromptFormInputs: () => <div data-testid="inputs">Inputs</div>,
}))
jest.mock('../prompt-form-output', () => ({
  PromptFormOutput: () => <div data-testid="output">Output</div>,
}))
jest.mock('../prompt-form-version-dialog', () => ({
  PromptFormVersionDialog: () => <div data-testid="version-dialog">Version Dialog</div>,
}))

jest.mock('@/lib/toast', () => ({
  showErrorToast: jest.fn(),
  showSuccessToast: jest.fn(),
}))

describe('PromptForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form for new prompt', () => {
    render(<PromptForm projectId="proj-1" />)
    expect(screen.getByTestId('basic-info')).toBeInTheDocument()
    expect(screen.getByTestId('model-params')).toBeInTheDocument()
    expect(screen.getByTestId('top-bar')).toBeInTheDocument()
    expect(screen.getByTestId('messages')).toBeInTheDocument()
    expect(screen.getByTestId('form-actions')).toBeInTheDocument()
    expect(screen.getByTestId('inputs')).toBeInTheDocument()
    expect(screen.getByTestId('output')).toBeInTheDocument()
  })

  it('does not render basic info when editing existing prompt', () => {
    render(
      <PromptForm
        projectId="proj-1"
        prompt={{ id: 'p1', name: 'Existing', description: '', projectId: 'proj-1' } as any}
      />
    )
    expect(screen.queryByTestId('basic-info')).not.toBeInTheDocument()
  })

  it('shows error when submitLogic has error', () => {
    const usePromptFormSubmit = require('@/hooks/prompts/use-prompt-form-submit').usePromptFormSubmit
    usePromptFormSubmit.mockReturnValue({
      ...mockSubmitLogic,
      error: 'Something went wrong',
    })

    render(<PromptForm projectId="proj-1" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders version dialog', () => {
    render(<PromptForm projectId="proj-1" />)
    expect(screen.getByTestId('version-dialog')).toBeInTheDocument()
  })
})
