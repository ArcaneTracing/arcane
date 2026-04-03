import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '@/__tests__/test-utils';
import { useExperimentForm } from '../use-experiment-form';
import { ExperimentResponse } from '@/types/experiments';
import { promptsApi } from '@/api/prompts';

jest.mock('@/api/prompts', () => ({
  promptsApi: {
    getVersionById: jest.fn()
  }
}));
jest.mock('@/hooks/prompts/use-prompts-query', () => {
  const prompts = [{ id: 'prompt-1', identifier: 'test-prompt', name: 'Test Prompt' }];
  const version = {
    id: 'version-1',
    templateFormat: 'MUSTACHE',
    template: { messages: [{ role: 'user', content: 'Hello {{name}}, welcome to {{platform}}' }] }
  };
  return {
    usePromptsQuery: jest.fn(() => ({ data: prompts, isLoading: false, error: null })),
    usePromptVersionsQuery: jest.fn(() => ({ data: [version], isLoading: false, error: null })),
    usePromptVersionQuery: jest.fn((_p: string, promptVersionId: string) => ({
      data: promptVersionId ? version : undefined,
      isLoading: false,
      error: null
    }))
  };
});

jest.mock('@/hooks/datasets/use-datasets-query', () => {
  const datasets = [{ id: 'dataset-1', name: 'Test Dataset' }];
  const headers = ['name', 'email', 'message'];
  return {
    useDatasetsQuery: jest.fn(() => ({ data: datasets, isLoading: false })),
    useDatasetHeaderQuery: jest.fn((_p: string, datasetId: string) => ({
      data: datasetId ? headers : [],
      isLoading: false
    }))
  };
});

jest.mock('../use-experiments-query', () => ({
  useCreateExperiment: jest.fn(() => ({
    mutateAsync: jest.fn().mockResolvedValue({ id: 'new-exp' }),
    isPending: false,
    error: null
  }))
}));

describe('useExperimentForm', () => {
  let queryClient: QueryClient;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    queryClient = createTestQueryClient();
    (promptsApi.getVersionById as jest.Mock).mockResolvedValue({
      id: 'version-1',
      promptId: 'prompt-1',
      templateFormat: 'MUSTACHE',
      template: {
        messages: [{ role: 'user', content: 'Hello {{name}}, welcome to {{platform}}' }]
      }
    });
  });

  afterEach(() => {
    consoleSpy?.mockRestore();
    queryClient.clear();
  });

  const createWrapper = () => {
    return ({ children }: {children: React.ReactNode;}) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  describe('initialization', () => {
    it('should initialize with empty form when no experiment provided', () => {
      const { result } = renderHook(() => useExperimentForm(null, 'project-1'), {
        wrapper: createWrapper()
      });

      expect(result.current.name).toBe('');
      expect(result.current.description).toBe('');
      expect(result.current.promptVersionId).toBe('');
      expect(result.current.datasetId).toBe('');
      expect(result.current.isEditMode).toBe(false);
    });

    it('should initialize with experiment data when experiment provided', async () => {
      const experiment: ExperimentResponse = {
        id: 'exp-1',
        projectId: 'project-1',
        name: 'Test Experiment',
        description: 'Test Description',
        promptVersionId: 'version-1',
        datasetId: 'dataset-1',
        promptInputMappings: { name: 'name', platform: 'email' },
        results: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      const { result } = renderHook(() => useExperimentForm(experiment, 'project-1'), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.name).toBe('Test Experiment');
        expect(result.current.description).toBe('Test Description');
        expect(result.current.isEditMode).toBe(true);
      });
    });
  });

  describe('setters', () => {
    it('should update name when setName is called', async () => {
      const { result } = renderHook(() => useExperimentForm(null, 'project-1'), {
        wrapper: createWrapper()
      });

      act(() => {result.current.setName('New Name');});
      await waitFor(() => expect(result.current.name).toBe('New Name'));
    });

    it('should update description when setDescription is called', async () => {
      const { result } = renderHook(() => useExperimentForm(null, 'project-1'), {
        wrapper: createWrapper()
      });

      act(() => {result.current.setDescription('New Description');});
      await waitFor(() => expect(result.current.description).toBe('New Description'));
    });

    it('should update promptVersionId when setPromptVersionId is called', async () => {
      const { result } = renderHook(() => useExperimentForm(null, 'project-1'), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.setSelectedPromptId('prompt-1');
        result.current.setPromptVersionId('version-1');
      });
      await waitFor(() => expect(result.current.promptVersionId).toBe('version-1'));
    });

    it('should update datasetId when setDatasetId is called', async () => {
      const { result } = renderHook(() => useExperimentForm(null, 'project-1'), {
        wrapper: createWrapper()
      });

      act(() => {result.current.setDatasetId('dataset-1');});
      await waitFor(() => expect(result.current.datasetId).toBe('dataset-1'));
    });
  });

  describe('input mappings', () => {
    it('should update mapping when updateMapping is called', async () => {
      const { result } = renderHook(() => useExperimentForm(null, 'project-1'), {
        wrapper: createWrapper()
      });

      act(() => {result.current.updateMapping(0, 'key', 'name');});
      await waitFor(() => expect(result.current.inputMappings[0]?.key).toBe('name'));
    });

    it('should set value when handleDatasetFieldChange is called with a header', async () => {
      const { result } = renderHook(() => useExperimentForm(null, 'project-1'), {
        wrapper: createWrapper()
      });

      result.current.updateMapping(0, 'key', 'name');
      result.current.handleDatasetFieldChange(0, 'email');
      await waitFor(() => expect(result.current.inputMappings[0]?.value).toBe('email'));
    });

    it('should set value and customFieldValues when handleCustomFieldChange is called', async () => {
      const { result } = renderHook(() => useExperimentForm(null, 'project-1'), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.setDatasetId('dataset-1');
        result.current.updateMapping(0, 'key', 'name');
        result.current.handleCustomFieldChange(0, 'custom-value');
      });
      await waitFor(() => {
        expect(result.current.inputMappings[0]?.value).toBe('custom-value');
        expect(result.current.customFieldValues[0]).toBe('custom-value');
      });
    });
  });

  describe('getSelectValue', () => {
    it('should return the value when it is a dataset header', async () => {
      const { result } = renderHook(() => useExperimentForm(null, 'project-1'), {
        wrapper: createWrapper()
      });

      act(() => {result.current.setDatasetId('dataset-1');});
      await waitFor(() => expect(result.current.datasetHeaders.length).toBeGreaterThan(0));

      expect(result.current.getSelectValue('name', 0)).toBe('name');
    });

    it('should return __other__ when value is not a dataset header', async () => {
      const { result } = renderHook(() => useExperimentForm(null, 'project-1'), {
        wrapper: createWrapper()
      });

      act(() => {result.current.setDatasetId('dataset-1');});
      await waitFor(() => expect(result.current.datasetHeaders.length).toBeGreaterThan(0));

      expect(result.current.getSelectValue('custom-field', 0)).toBe('__other__');
    });
  });
});