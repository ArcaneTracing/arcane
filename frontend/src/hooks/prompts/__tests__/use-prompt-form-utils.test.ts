import {
  hasVersionContentChanged,
  buildInvocationParameters,
  convertMessagesToChatMessages,
  messagesDiffer,
  invocationParamsDiffer,
  getVersionToolsArray,
  normalizeFormToolContent,
  toolsDiffer,
  responseFormatDiffer,
  getToolsNestingError,
} from '../use-prompt-form-utils'
import type { VersionContentFormState } from '../use-prompt-form-utils'
import { TemplateType, TemplateFormat } from '@/types/enums'
import type { PromptVersionResponse } from '@/types/prompts'
import type { ModelConfigurationResponse } from '@/types/model-configuration'

describe('hasVersionContentChanged', () => {
  const baseFormState: VersionContentFormState = {
    messages: [{ role: 'user', content: 'Hello' }],
    modelConfigurationId: 'mc-1',
    templateFormat: TemplateFormat.NONE,
    temperature: '0.7',
    maxTokens: '1000',
    topP: '1',
    customParams: [],
    tools: [],
    responseFormat: '',
  }

  const baseVersion: PromptVersionResponse = {
    id: 'v1',
    promptId: 'p1',
    promptName: 'Test',
    versionName: 'v0',
    description: null,
    modelConfigurationId: 'mc-1',
    template: { type: 'chat', messages: [{ role: 'user', content: 'Hello' }] },
    templateType: TemplateType.CHAT,
    templateFormat: TemplateFormat.NONE,
    invocationParameters: { type: 'openai', openai: { temperature: 0.7, max_tokens: 1000, top_p: 1 } },
    tools: null,
    responseFormat: null,
    createdAt: '',
    updatedAt: '',
  } as PromptVersionResponse

  it('returns true when version is null', () => {
    expect(hasVersionContentChanged(baseFormState, null)).toBe(true)
  })

  it('returns true when version is undefined', () => {
    expect(hasVersionContentChanged(baseFormState, undefined)).toBe(true)
  })

  it('returns true when templateType is not CHAT', () => {
    expect(
      hasVersionContentChanged(baseFormState, {
        ...baseVersion,
        templateType: 'completion' as TemplateType,
      } as PromptVersionResponse)
    ).toBe(true)
  })

  it('returns true when modelConfigurationId differs', () => {
    expect(
      hasVersionContentChanged(
        { ...baseFormState, modelConfigurationId: 'mc-2' },
        baseVersion
      )
    ).toBe(true)
  })

  it('returns true when messages differ', () => {
    expect(
      hasVersionContentChanged(
        { ...baseFormState, messages: [{ role: 'user', content: 'Different' }] },
        baseVersion
      )
    ).toBe(true)
  })

  it('returns false when form matches version', () => {
    expect(hasVersionContentChanged(baseFormState, baseVersion)).toBe(false)
  })

  it('returns true when templateFormat differs', () => {
    expect(
      hasVersionContentChanged(
        { ...baseFormState, templateFormat: TemplateFormat.OPENAI },
        baseVersion
      )
    ).toBe(true)
  })

  it('returns true when tools differ', () => {
    const versionWithTools = {
      ...baseVersion,
      tools: [{ type: 'function', function: { name: 'foo' } }],
    } as PromptVersionResponse
    expect(
      hasVersionContentChanged(
        { ...baseFormState, tools: [{ id: '1', content: '{"type":"function","function":{"name":"bar"}}' }] },
        versionWithTools
      )
    ).toBe(true)
  })

  it('returns true when response format differs', () => {
    const versionWithResponse = {
      ...baseVersion,
      responseFormat: { type: 'json' },
    } as PromptVersionResponse
    expect(
      hasVersionContentChanged(
        { ...baseFormState, responseFormat: '{"type":"text"}' },
        versionWithResponse
      )
    ).toBe(true)
  })
})

describe('messagesDiffer', () => {
  it('returns false when messages match', () => {
    const versionMessages = [{ role: 'user', content: 'Hi' }]
    const formMessages = [{ role: 'user', content: 'Hi' }]
    expect(messagesDiffer(versionMessages, formMessages)).toBe(false)
  })

  it('returns true when lengths differ', () => {
    expect(messagesDiffer([{ role: 'user', content: 'Hi' }], [])).toBe(true)
    expect(messagesDiffer([], [{ role: 'user', content: 'Hi' }])).toBe(true)
  })

  it('returns true when role differs', () => {
    const versionMessages = [{ role: 'user', content: 'Hi' }]
    const formMessages = [{ role: 'assistant', content: 'Hi' }]
    expect(messagesDiffer(versionMessages, formMessages)).toBe(true)
  })

  it('returns true when content differs', () => {
    const versionMessages = [{ role: 'user', content: 'Hi' }]
    const formMessages = [{ role: 'user', content: 'Bye' }]
    expect(messagesDiffer(versionMessages, formMessages)).toBe(true)
  })
})

describe('invocationParamsDiffer', () => {
  const formState: VersionContentFormState = {
    messages: [],
    modelConfigurationId: '',
    templateFormat: '',
    temperature: '0.7',
    maxTokens: '1000',
    topP: '1',
    customParams: [],
    tools: [],
    responseFormat: '',
  }

  it('returns false when version has no invocation params', () => {
    const version = { invocationParameters: null } as PromptVersionResponse
    expect(invocationParamsDiffer(version, formState)).toBe(false)
  })

  it('returns false when params match', () => {
    const version = {
      invocationParameters: { type: 'openai', openai: { temperature: 0.7, max_tokens: 1000, top_p: 1 } },
    } as PromptVersionResponse
    expect(invocationParamsDiffer(version, formState)).toBe(false)
  })

  it('returns true when temperature differs', () => {
    const version = {
      invocationParameters: { type: 'openai', openai: { temperature: 0.5, max_tokens: 1000, top_p: 1 } },
    } as PromptVersionResponse
    expect(invocationParamsDiffer(version, formState)).toBe(true)
  })

  it('returns true when max_tokens differs', () => {
    const version = {
      invocationParameters: { type: 'openai', openai: { temperature: 0.7, max_tokens: 500, top_p: 1 } },
    } as PromptVersionResponse
    expect(invocationParamsDiffer(version, formState)).toBe(true)
  })
})

describe('getVersionToolsArray', () => {
  it('returns array when version.tools is array', () => {
    const version = { tools: [{ name: 'a' }, { name: 'b' }] } as PromptVersionResponse
    expect(getVersionToolsArray(version)).toEqual([{ name: 'a' }, { name: 'b' }])
  })

  it('returns single-item array when version.tools is single object', () => {
    const version = { tools: { name: 'a' } } as PromptVersionResponse
    expect(getVersionToolsArray(version)).toEqual([{ name: 'a' }])
  })

  it('returns empty array when version.tools is null/undefined', () => {
    expect(getVersionToolsArray({ tools: null } as PromptVersionResponse)).toEqual([])
    expect(getVersionToolsArray({ tools: undefined } as PromptVersionResponse)).toEqual([])
  })
})

describe('getToolsNestingError', () => {
  it('returns null when tools is empty', () => {
    expect(getToolsNestingError([])).toBe(null)
  })

  it('returns null when tool has valid format (no nesting)', () => {
    expect(
      getToolsNestingError([
        { id: '1', content: '{"type":"function","function":{"name":"foo"}}' },
      ])
    ).toBe(null)
    expect(
      getToolsNestingError([
        { id: '1', content: '{"functionDeclarations":[{"name":"foo"}]}' },
      ])
    ).toBe(null)
  })

  it('returns error when tool has nested tools key', () => {
    const result = getToolsNestingError([
      { id: '1', content: '{"tools":[{"functionDeclarations":[{"name":"foo"}]}]}' },
    ])
    expect(result).toContain('Tool 1')
    expect(result).toContain('Do not wrap tools')
  })

  it('returns error for first tool with nesting', () => {
    const result = getToolsNestingError([
      { id: '1', content: '{"type":"function","function":{"name":"foo"}}' },
      { id: '2', content: '{"tools":[{"name":"bar"}]}' },
    ])
    expect(result).toContain('Tool 2')
  })
})

describe('normalizeFormToolContent', () => {
  it('parses valid JSON and re-stringifies', () => {
    const result = normalizeFormToolContent([{ id: '1', content: '{"x":1}' }])
    expect(result).toEqual(['{"x":1}'])
  })

  it('returns raw content when not valid JSON', () => {
    const result = normalizeFormToolContent([{ id: '1', content: 'not json' }])
    expect(result).toEqual(['not json'])
  })

  it('handles multiple tools', () => {
    const result = normalizeFormToolContent([
      { id: '1', content: '{"a":1}' },
      { id: '2', content: 'plain' },
    ])
    expect(result).toEqual(['{"a":1}', 'plain'])
  })
})

describe('toolsDiffer', () => {
  const baseFormState: VersionContentFormState = {
    messages: [],
    modelConfigurationId: '',
    templateFormat: '',
    temperature: '0.7',
    maxTokens: '1000',
    topP: '1',
    customParams: [],
    tools: [],
    responseFormat: '',
  }

  it('returns false when both are empty', () => {
    const version = { tools: null } as PromptVersionResponse
    expect(toolsDiffer(version, baseFormState)).toBe(false)
  })

  it('returns true when lengths differ', () => {
    const version = { tools: [{ name: 'a' }] } as PromptVersionResponse
    expect(toolsDiffer(version, baseFormState)).toBe(true)
  })

  it('returns true when content differs', () => {
    const version = { tools: [{ name: 'a' }] } as PromptVersionResponse
    const formState = { ...baseFormState, tools: [{ id: '1', content: '{"name":"b"}' }] }
    expect(toolsDiffer(version, formState)).toBe(true)
  })
})

describe('responseFormatDiffer', () => {
  const baseFormState: VersionContentFormState = {
    messages: [],
    modelConfigurationId: '',
    templateFormat: '',
    temperature: '0.7',
    maxTokens: '1000',
    topP: '1',
    customParams: [],
    tools: [],
    responseFormat: '',
  }

  it('returns false when both are empty', () => {
    const version = { responseFormat: null } as PromptVersionResponse
    expect(responseFormatDiffer(version, baseFormState)).toBe(false)
  })

  it('returns true when version has format and form is empty', () => {
    const version = { responseFormat: { type: 'json' } } as PromptVersionResponse
    expect(responseFormatDiffer(version, baseFormState)).toBe(true)
  })

  it('returns true when form has different JSON', () => {
    const version = { responseFormat: { type: 'json' } } as PromptVersionResponse
    const formState = { ...baseFormState, responseFormat: '{"type":"text"}' }
    expect(responseFormatDiffer(version, formState)).toBe(true)
  })

  it('returns false when parsed form matches version', () => {
    const version = { responseFormat: { type: 'json' } } as PromptVersionResponse
    const formState = { ...baseFormState, responseFormat: '{"type":"json"}' }
    expect(responseFormatDiffer(version, formState)).toBe(false)
  })
})

describe('buildInvocationParameters', () => {
  it('builds openai params with defaults', () => {
    const result = buildInvocationParameters(
      null,
      '',
      '',
      '',
      []
    )
    expect(result.type).toBe('openai')
    expect(result.openai).toEqual({
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
    })
  })

  it('uses adapter from model config', () => {
    const config = {
      configuration: { adapter: 'anthropic' },
    } as ModelConfigurationResponse
    const result = buildInvocationParameters(config, '0.5', '500', '0.9', [])
    expect(result.type).toBe('anthropic')
    expect(result.anthropic?.temperature).toBe(0.5)
  })

  it('parses custom params as numbers', () => {
    const result = buildInvocationParameters(
      null,
      '0.7',
      '1000',
      '1',
      [{ key: 'top_k', value: '40' }]
    )
    expect(result.openai?.top_k).toBe(40)
  })
})

describe('convertMessagesToChatMessages', () => {
  it('filters empty messages', () => {
    const result = convertMessagesToChatMessages([
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: '   ' },
    ])
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ role: 'user', content: 'Hi' })
  })
})
