import { needsModelConfigFetch, fetchModelConfig } from '../prompt-versions-list-utils'
import type { PromptVersionResponse } from '@/types/prompts'
import type { ModelConfigurationResponse } from '@/types/model-configuration'

const mockGetById = jest.fn()
jest.mock('@/api/model-configurations', () => ({
  modelConfigurationsApi: {
    getById: (...args: unknown[]) => mockGetById(...args),
  },
}))

describe('needsModelConfigFetch', () => {
  it('returns false when version has no modelConfigurationId', () => {
    const version = { id: 'v1' } as PromptVersionResponse
    const fetchedIds = new Set<string>()
    expect(needsModelConfigFetch(version, fetchedIds)).toBe(false)
  })

  it('returns false when modelConfigurationId is already fetched', () => {
    const version = { id: 'v1', modelConfigurationId: 'config-1' } as PromptVersionResponse
    const fetchedIds = new Set<string>(['config-1'])
    expect(needsModelConfigFetch(version, fetchedIds)).toBe(false)
  })

  it('returns true when modelConfigurationId exists and not fetched', () => {
    const version = { id: 'v1', modelConfigurationId: 'config-1' } as PromptVersionResponse
    const fetchedIds = new Set<string>()
    expect(needsModelConfigFetch(version, fetchedIds)).toBe(true)
  })

  it('returns true when modelConfigurationId exists but different config is fetched', () => {
    const version = { id: 'v1', modelConfigurationId: 'config-1' } as PromptVersionResponse
    const fetchedIds = new Set<string>(['config-2'])
    expect(needsModelConfigFetch(version, fetchedIds)).toBe(true)
  })
})

describe('fetchModelConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls onSuccess with config when fetch succeeds', async () => {
    const mockConfig: ModelConfigurationResponse = {
      id: 'config-1',
      name: 'Test Config',
      configuration: { modelName: 'gpt-4' },
    } as ModelConfigurationResponse

    mockGetById.mockResolvedValue(mockConfig)
    const onSuccess = jest.fn()
    const onError = jest.fn()
    const onFinally = jest.fn()

    await fetchModelConfig('org-1', 'config-1', onSuccess, onError, onFinally)

    expect(mockGetById).toHaveBeenCalledWith('org-1', 'config-1')
    expect(onSuccess).toHaveBeenCalledWith(mockConfig)
    expect(onError).not.toHaveBeenCalled()
    expect(onFinally).toHaveBeenCalled()
  })

  it('calls onError when fetch fails', async () => {
    mockGetById.mockRejectedValue(new Error('Not found'))
    const onSuccess = jest.fn()
    const onError = jest.fn()
    const onFinally = jest.fn()

    await fetchModelConfig('org-1', 'config-1', onSuccess, onError, onFinally)

    expect(mockGetById).toHaveBeenCalledWith('org-1', 'config-1')
    expect(onSuccess).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
    expect(onFinally).toHaveBeenCalled()
  })

  it('calls onFinally even when fetch fails', async () => {
    mockGetById.mockRejectedValue(new Error('Not found'))
    const onSuccess = jest.fn()
    const onError = jest.fn()
    const onFinally = jest.fn()

    await fetchModelConfig('org-1', 'config-1', onSuccess, onError, onFinally)

    expect(onFinally).toHaveBeenCalled()
  })

  it('calls onFinally even when fetch succeeds', async () => {
    const mockConfig: ModelConfigurationResponse = {
      id: 'config-1',
      name: 'Test Config',
      configuration: { modelName: 'gpt-4' },
    } as ModelConfigurationResponse

    mockGetById.mockResolvedValue(mockConfig)
    const onSuccess = jest.fn()
    const onError = jest.fn()
    const onFinally = jest.fn()

    await fetchModelConfig('org-1', 'config-1', onSuccess, onError, onFinally)

    expect(onFinally).toHaveBeenCalled()
  })
})
