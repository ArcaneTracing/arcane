import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { PromptVersionView } from '../prompt-version-view'
import { PromptVersionResponse } from '@/types/prompts'
import { render as customRender } from '@/__tests__/test-utils'

const mockGetById = jest.fn()
jest.mock('@/api/model-configurations', () => ({
  modelConfigurationsApi: {
    getById: (...args: unknown[]) => mockGetById(...args),
  },
}))

jest.mock('@/hooks/useOrganisation', () => ({
  useOrganisationIdOrNull: () => 'org-1',
}))

const mockMutate = jest.fn()
jest.mock('@/hooks/prompts/use-prompts-query', () => ({
  usePromoteVersion: () => ({
    mutate: mockMutate,
    isPending: false,
    variables: null,
  }),
}))

function createMockVersion(overrides?: Partial<PromptVersionResponse>): PromptVersionResponse {
  return {
    id: 'version-1',
    promptId: 'prompt-1',
    promptName: 'test-prompt',
    versionName: null,
    description: 'Test version',
    modelConfigurationId: 'model-config-1',
    templateType: 'CHAT',
    templateFormat: 'MUSTACHE',
    template: { type: 'chat', messages: [{ role: 'user', content: 'Hello' }] },
    invocationParameters: { type: 'openai', openai: {} },
    tools: null,
    responseFormat: null,
    createdAt: '2026-02-04T17:02:25.000Z',
    updatedAt: '2026-02-04T17:02:25.000Z',
    ...overrides,
  }
}

describe('PromptVersionView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches model config using modelConfigurationId and displays config name', async () => {
    const version = createMockVersion()
    mockGetById.mockResolvedValue({
      id: 'model-config-1',
      name: 'GPT-4 Config',
      configuration: { modelName: 'gpt-4' },
    })

    customRender(
      <PromptVersionView
        promptId="prompt-1"
        promptIdentifier="test-prompt"
        version={version}
        promotedVersionId={null}
        projectId="project-1"
      />
    )

    expect(mockGetById).toHaveBeenCalledWith('org-1', 'model-config-1')

    await waitFor(() => {
      expect(screen.getByText(/GPT-4 Config \(gpt-4\)/)).toBeInTheDocument()
    })
  })

  it('shows Unknown Configuration when model config fetch fails', async () => {
    const version = createMockVersion()
    mockGetById.mockRejectedValue(new Error('Not found'))

    customRender(
      <PromptVersionView
        promptId="prompt-1"
        promptIdentifier="test-prompt"
        version={version}
        promotedVersionId={null}
        projectId="project-1"
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Unknown Configuration')).toBeInTheDocument()
    })
  })

  it('renders template content', async () => {
    const version = createMockVersion()
    mockGetById.mockResolvedValue({
      id: 'model-config-1',
      name: 'GPT-4',
      configuration: { modelName: 'gpt-4' },
    })

    customRender(
      <PromptVersionView
        promptId="prompt-1"
        promptIdentifier="test-prompt"
        version={version}
        promotedVersionId={null}
        projectId="project-1"
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/"Hello"/)).toBeInTheDocument()
    })
  })
})
