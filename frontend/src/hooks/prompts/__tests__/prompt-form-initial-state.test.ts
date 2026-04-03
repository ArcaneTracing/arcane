import {
  getDefaultFormState,
  mergeVersionConfigIntoList,
  extractInvocationParamsFromVersion,
  extractMessagesFromVersion,
  extractToolsFromVersion,
} from '../prompt-form-initial-state'
import type { ModelConfigurationResponse } from '@/types/model-configuration'
import type { PromptVersionResponse } from '@/types/prompts'

describe('getDefaultFormState', () => {
  it('returns default form state with empty responseFormat', () => {
    const state = getDefaultFormState()
    expect(state.responseFormat).toBe('')
    expect(state.temperature).toBe('0.7')
    expect(state.maxTokens).toBe('1000')
    expect(state.topP).toBe('1.0')
    expect(state.messages).toHaveLength(2)
    expect(state.messages[0].role).toBe('system')
    expect(state.messages[0].content).toBe('You are a chatbot')
    expect(state.messages[1].role).toBe('user')
    expect(state.tools).toEqual([])
    expect(state.toolOpenStates).toEqual({})
  })
})

describe('mergeVersionConfigIntoList', () => {
  it('returns original list when versionConfig is undefined', () => {
    const configs: ModelConfigurationResponse[] = [
      { id: 'c1', name: 'Config 1', configuration: {} as any, createdAt: new Date(), updatedAt: new Date() },
    ]
    expect(mergeVersionConfigIntoList(configs, undefined)).toEqual(configs)
  })

  it('returns original list when versionConfig already in list', () => {
    const versionConfig: ModelConfigurationResponse = {
      id: 'c1',
      name: 'Config 1',
      configuration: {} as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const configs = [versionConfig]
    expect(mergeVersionConfigIntoList(configs, versionConfig)).toEqual(configs)
  })

  it('prepends versionConfig when not in list', () => {
    const versionConfig: ModelConfigurationResponse = {
      id: 'c2',
      name: 'Config 2',
      configuration: {} as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const configs: ModelConfigurationResponse[] = [
      { id: 'c1', name: 'Config 1', configuration: {} as any, createdAt: new Date(), updatedAt: new Date() },
    ]
    const result = mergeVersionConfigIntoList(configs, versionConfig)
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('c2')
    expect(result[1].id).toBe('c1')
  })
})

describe('extractInvocationParamsFromVersion', () => {
  it('returns defaults when invocationParameters is null', () => {
    const result = extractInvocationParamsFromVersion(null)
    expect(result.temperature).toBe('0.7')
    expect(result.maxTokens).toBe('1000')
    expect(result.topP).toBe('1.0')
    expect(result.customParams).toEqual([])
  })

  it('extracts params from openai invocationParameters', () => {
    const result = extractInvocationParamsFromVersion({
      type: 'openai',
      openai: {
        temperature: 0.5,
        max_tokens: 2000,
        top_p: 0.9,
      },
    } as any)
    expect(result.temperature).toBe('0.5')
    expect(result.maxTokens).toBe('2000')
    expect(result.topP).toBe('0.9')
  })
})

describe('extractMessagesFromVersion', () => {
  it('returns empty array when version is null', () => {
    expect(extractMessagesFromVersion(null)).toEqual([])
  })

  it('extracts messages from version template', () => {
    const version: Partial<PromptVersionResponse> = {
      template: {
        type: 'chat',
        messages: [
          { role: 'system', content: 'You are helpful' },
          { role: 'user', content: 'Hello' },
        ],
      },
    }
    const result = extractMessagesFromVersion(version as PromptVersionResponse)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ id: '1', role: 'system', content: 'You are helpful' })
    expect(result[1]).toEqual({ id: '2', role: 'user', content: 'Hello' })
  })

  it('filters out tool messages', () => {
    const version: Partial<PromptVersionResponse> = {
      template: {
        type: 'chat',
        messages: [
          { role: 'user', content: 'Hi' },
          { role: 'tool', content: 'tool output' },
        ],
      },
    }
    const result = extractMessagesFromVersion(version as PromptVersionResponse)
    expect(result).toHaveLength(1)
    expect(result[0].role).toBe('user')
  })
})

describe('extractToolsFromVersion', () => {
  it('returns empty tools when version has no tools', () => {
    const result = extractToolsFromVersion(null)
    expect(result.tools).toEqual([])
    expect(result.toolOpenStates).toEqual({})
  })

  it('extracts tools from version', () => {
    const version: Partial<PromptVersionResponse> = {
      tools: [
        { type: 'function', function: { name: 'test_fn', description: 'Test' } },
      ],
    }
    const result = extractToolsFromVersion(version as PromptVersionResponse)
    expect(result.tools).toHaveLength(1)
    expect(result.tools[0].id).toBe('1')
    expect(JSON.parse(result.tools[0].content)).toMatchObject({ type: 'function' })
    expect(result.toolOpenStates['1']).toBe(true)
  })
})
