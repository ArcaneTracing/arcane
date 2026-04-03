import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { PromptVersionsList } from '../prompt-versions-list';
import { PromptVersionResponse } from '@/types/prompts';
import { render as customRender } from '@/__tests__/test-utils';

const mockGetById = jest.fn();
jest.mock('@/api/model-configurations', () => ({
  modelConfigurationsApi: {
    getById: (...args: unknown[]) => mockGetById(...args)
  }
}));

jest.mock('@/hooks/useOrganisation', () => ({
  useOrganisationIdOrNull: () => 'org-1'
}));

const mockMutate = jest.fn();
jest.mock('@/hooks/prompts/use-prompts-query', () => ({
  usePromoteVersion: () => ({
    mutate: mockMutate,
    isPending: false,
    variables: null
  })
}));

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
    template: { type: 'chat', messages: [] },
    invocationParameters: { type: 'openai', openai: {} },
    tools: null,
    responseFormat: null,
    createdAt: '2026-02-04T17:02:25.000Z',
    updatedAt: '2026-02-04T17:02:25.000Z',
    ...overrides
  };
}

describe('PromptVersionsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "No versions found" when versions is empty', () => {
    customRender(
      <PromptVersionsList
        promptId="prompt-1"
        promptIdentifier="test-prompt"
        versions={[]}
        promotedVersionId={null}
        projectId="project-1" />

    );

    expect(screen.getByText('No versions found')).toBeInTheDocument();
  });

  it('fetches model config using modelConfigurationId and displays config name', async () => {
    const version = createMockVersion();
    mockGetById.mockResolvedValue({
      id: 'model-config-1',
      name: 'GPT-4 Config',
      configuration: { modelName: 'gpt-4' }
    });

    customRender(
      <PromptVersionsList
        promptId="prompt-1"
        promptIdentifier="test-prompt"
        versions={[version]}
        promotedVersionId={null}
        projectId="project-1" />

    );

    expect(mockGetById).toHaveBeenCalledWith('org-1', 'model-config-1');

    await waitFor(() => {
      expect(screen.getByText(/GPT-4 Config \(gpt-4\)/)).toBeInTheDocument();
    });
  });

  it('shows Loading... while fetching model config', () => {
    const version = createMockVersion();
    mockGetById.mockImplementation(() => new Promise(() => {}));

    customRender(
      <PromptVersionsList
        promptId="prompt-1"
        promptIdentifier="test-prompt"
        versions={[version]}
        promotedVersionId={null}
        projectId="project-1" />

    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows Unknown Config when model config fetch fails', async () => {
    const version = createMockVersion();
    mockGetById.mockRejectedValue(new Error('Not found'));

    customRender(
      <PromptVersionsList
        promptId="prompt-1"
        promptIdentifier="test-prompt"
        versions={[version]}
        promotedVersionId={null}
        projectId="project-1" />

    );

    await waitFor(() => {
      expect(screen.getByText('Unknown Config')).toBeInTheDocument();
    });
  });

  it('renders version with versionName when available', async () => {
    const version = createMockVersion({ versionName: 'v2' });
    mockGetById.mockResolvedValue({
      id: 'model-config-1',
      name: 'GPT-4',
      configuration: { modelName: 'gpt-4' }
    });

    customRender(
      <PromptVersionsList
        promptId="prompt-1"
        promptIdentifier="test-prompt"
        versions={[version]}
        promotedVersionId={null}
        projectId="project-1" />

    );

    await waitFor(() => {
      expect(screen.getByText('Version v2')).toBeInTheDocument();
    });
  });

  it('renders Promoted badge when version is promoted', async () => {
    const version = createMockVersion();
    mockGetById.mockResolvedValue({
      id: 'model-config-1',
      name: 'GPT-4',
      configuration: { modelName: 'gpt-4' }
    });

    customRender(
      <PromptVersionsList
        promptId="prompt-1"
        promptIdentifier="test-prompt"
        versions={[version]}
        promotedVersionId="version-1"
        projectId="project-1" />

    );

    await waitFor(() => {
      expect(screen.getByText('Promoted')).toBeInTheDocument();
    });
  });

  it('calls onEditVersion when Edit button clicked', async () => {
    const version = createMockVersion();
    const onEditVersion = jest.fn();
    mockGetById.mockResolvedValue({
      id: 'model-config-1',
      name: 'GPT-4',
      configuration: { modelName: 'gpt-4' }
    });

    customRender(
      <PromptVersionsList
        promptId="prompt-1"
        promptIdentifier="test-prompt"
        versions={[version]}
        promotedVersionId={null}
        projectId="project-1"
        onEditVersion={onEditVersion} />

    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    screen.getByRole('button', { name: /edit/i }).click();
    expect(onEditVersion).toHaveBeenCalledWith('version-1');
  });
});