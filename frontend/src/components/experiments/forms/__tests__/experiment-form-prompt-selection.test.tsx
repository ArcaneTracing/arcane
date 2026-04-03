import React from 'react'
import { render, screen } from '@testing-library/react'
import { AxiosError } from 'axios'
import { ExperimentFormPromptSelection } from '../experiment-form-prompt-selection'

describe('ExperimentFormPromptSelection', () => {
  const mockSetSelectedPromptId = jest.fn()
  const mockSetPromptVersionId = jest.fn()

  const prompts = [
    { id: 'prompt-1', name: 'Prompt 1' },
    { id: 'prompt-2', name: 'Prompt 2' },
  ]

  const versions = [
    { id: 'version-1', versionName: 'Version 1' },
    { id: 'version-2', versionName: 'Version 2' },
  ]

  const baseProps = {
    prompts,
    loadingPrompts: false,
    selectedPromptId: '',
    setSelectedPromptId: mockSetSelectedPromptId,
    promptVersions: versions,
    loadingVersions: false,
    promptVersionId: '',
    setPromptVersionId: mockSetPromptVersionId,
    isLoading: false,
    isEditMode: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders prompt and prompt version labels', () => {
    render(<ExperimentFormPromptSelection {...baseProps} />)

    expect(screen.getByText('Prompt')).toBeInTheDocument()
    expect(screen.getByText('Prompt Version')).toBeInTheDocument()
  })

  it('shows prompts loading state when loadingPrompts and no selectedPromptId', () => {
    render(
      <ExperimentFormPromptSelection
        {...baseProps}
        loadingPrompts={true}
      />
    )

    expect(screen.getByText('Loading prompts...')).toBeInTheDocument()
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument()
  })

  it('shows versions loading state when loadingVersions and no promptVersionId', () => {
    render(
      <ExperimentFormPromptSelection
        {...baseProps}
        selectedPromptId="prompt-1"
        loadingVersions={true}
      />
    )

    expect(screen.getByText('Loading versions...')).toBeInTheDocument()
  })

  it('shows empty state when no prompts available', () => {
    render(
      <ExperimentFormPromptSelection
        {...baseProps}
        prompts={[]}
      />
    )

    expect(screen.getByText('No prompts available')).toBeInTheDocument()
  })

  it('shows empty state when no versions available', () => {
    render(
      <ExperimentFormPromptSelection
        {...baseProps}
        selectedPromptId="prompt-1"
        promptVersions={[]}
      />
    )

    expect(screen.getByText('No versions available')).toBeInTheDocument()
  })

  it("shows permission error for prompts when promptsError is forbidden", () => {
    const forbiddenError = new AxiosError('Forbidden')
    ;(forbiddenError as any).response = { status: 403 }

    render(
      <ExperimentFormPromptSelection
        {...baseProps}
        promptsError={forbiddenError}
      />
    )

    expect(
      screen.getByText("You don't have permission to view prompts")
    ).toBeInTheDocument()
  })

  it("shows permission error for versions when versionsError is forbidden", () => {
    const forbiddenError = new AxiosError('Forbidden')
    ;(forbiddenError as any).response = { status: 403 }

    render(
      <ExperimentFormPromptSelection
        {...baseProps}
        selectedPromptId="prompt-1"
        versionsError={forbiddenError}
      />
    )

    expect(
      screen.getByText("You don't have permission to view prompt versions")
    ).toBeInTheDocument()
  })
})

