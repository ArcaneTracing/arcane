import {
  extractMessageContent,
  extractVariablesFromPromptVersion,
  extractVariablesFromMessages,
} from '../prompt-utils'
import { PromptVersionResponse, TemplateFormat } from '@/types/prompts'

describe('extractMessageContent', () => {
  it('returns empty string for undefined or null', () => {
    expect(extractMessageContent(undefined)).toBe('')
    expect(extractMessageContent(null)).toBe('')
  })

  it('returns string content as-is', () => {
    expect(extractMessageContent('Hello world')).toBe('Hello world')
  })

  it('extracts text from ContentPart[] format', () => {
    expect(extractMessageContent([{ text: 'Hello' }])).toBe('Hello')
    expect(extractMessageContent([{ text: 'A' }, { text: 'B' }])).toBe('AB')
  })

  it('skips parts without text property', () => {
    expect(extractMessageContent([{ text: 'Hi' }, {}])).toBe('Hi')
  })

  it('returns empty string for non-string non-array', () => {
    expect(extractMessageContent(123)).toBe('')
    expect(extractMessageContent({})).toBe('')
  })
})

describe('extractVariablesFromPromptVersion', () => {
  it('should extract variables from MUSTACHE template', () => {
    const version: PromptVersionResponse = {
      id: '1',
      templateFormat: 'MUSTACHE',
      template: {
        messages: [
          {
            role: 'user',
            content: 'Hello {{name}}, welcome to {{platform}}',
          },
        ],
      },
    } as PromptVersionResponse

    const result = extractVariablesFromPromptVersion(version)
    expect(result).toEqual(['name', 'platform'])
  })

  it('should extract variables from F_STRING template', () => {
    const version: PromptVersionResponse = {
      id: '1',
      templateFormat: 'F_STRING',
      template: {
        messages: [
          {
            role: 'user',
            content: 'Hello {name}, your score is {score}',
          },
        ],
      },
    } as PromptVersionResponse

    const result = extractVariablesFromPromptVersion(version)
    expect(result).toEqual(['name', 'score'])
  })

  it('should return empty array for NONE template format', () => {
    const version: PromptVersionResponse = {
      id: '1',
      templateFormat: 'NONE',
      template: {
        messages: [
          {
            role: 'user',
            content: 'Hello {{name}}',
          },
        ],
      },
    } as PromptVersionResponse

    const result = extractVariablesFromPromptVersion(version)
    expect(result).toEqual([])
  })

  it('should return empty array for null version', () => {
    const result = extractVariablesFromPromptVersion(null)
    expect(result).toEqual([])
  })

  it('should handle variables with spaces in MUSTACHE format', () => {
    const version: PromptVersionResponse = {
      id: '1',
      templateFormat: 'MUSTACHE',
      template: {
        messages: [
          {
            role: 'user',
            content: 'Hello {{ name }}, welcome to {{ platform }}',
          },
        ],
      },
    } as PromptVersionResponse

    const result = extractVariablesFromPromptVersion(version)
    expect(result).toEqual(['name', 'platform'])
  })

  it('should handle multiple messages', () => {
    const version: PromptVersionResponse = {
      id: '1',
      templateFormat: 'MUSTACHE',
      template: {
        messages: [
          {
            role: 'user',
            content: 'Hello {{name}}',
          },
          {
            role: 'assistant',
            content: 'Welcome to {{platform}}',
          },
        ],
      },
    } as PromptVersionResponse

    const result = extractVariablesFromPromptVersion(version)
    expect(result).toEqual(['name', 'platform'])
  })

  it('should handle empty content', () => {
    const version: PromptVersionResponse = {
      id: '1',
      templateFormat: 'MUSTACHE',
      template: {
        messages: [
          {
            role: 'user',
            content: '',
          },
        ],
      },
    } as PromptVersionResponse

    const result = extractVariablesFromPromptVersion(version)
    expect(result).toEqual([])
  })

  it('should handle variables with underscores and numbers', () => {
    const version: PromptVersionResponse = {
      id: '1',
      templateFormat: 'MUSTACHE',
      template: {
        messages: [
          {
            role: 'user',
            content: 'Hello {{user_name}}, your id is {{user_id_123}}',
          },
        ],
      },
    } as PromptVersionResponse

    const result = extractVariablesFromPromptVersion(version)
    expect(result).toEqual(['user_id_123', 'user_name'])
  })

  it('should sort variables alphabetically', () => {
    const version: PromptVersionResponse = {
      id: '1',
      templateFormat: 'MUSTACHE',
      template: {
        messages: [
          {
            role: 'user',
            content: '{{zebra}} {{apple}} {{banana}}',
          },
        ],
      },
    } as PromptVersionResponse

    const result = extractVariablesFromPromptVersion(version)
    expect(result).toEqual(['apple', 'banana', 'zebra'])
  })
})

describe('extractVariablesFromMessages', () => {
  it('should extract variables from MUSTACHE format', () => {
    const messages = [
      {
        content: 'Hello {{name}}, welcome to {{platform}}',
      },
    ]
    const result = extractVariablesFromMessages(messages, 'MUSTACHE')
    expect(result).toEqual(['name', 'platform'])
  })

  it('should extract variables from F_STRING format', () => {
    const messages = [
      {
        content: 'Hello {name}, your score is {score}',
      },
    ]
    const result = extractVariablesFromMessages(messages, 'F_STRING')
    expect(result).toEqual(['name', 'score'])
  })

  it('should return empty array for NONE format', () => {
    const messages = [
      {
        content: 'Hello {{name}}',
      },
    ]
    const result = extractVariablesFromMessages(messages, 'NONE')
    expect(result).toEqual([])
  })

  it('should handle empty messages array', () => {
    const result = extractVariablesFromMessages([], 'MUSTACHE')
    expect(result).toEqual([])
  })

  it('should handle messages with null or undefined content', () => {
    const messages = [
      { content: 'Hello {{name}}' },
      { content: null as any },
      { content: undefined as any },
    ]
    const result = extractVariablesFromMessages(messages, 'MUSTACHE')
    expect(result).toEqual(['name'])
  })

  it('should handle duplicate variables', () => {
    const messages = [
      {
        content: 'Hello {{name}}, {{name}} is repeated',
      },
    ]
    const result = extractVariablesFromMessages(messages, 'MUSTACHE')
    expect(result).toEqual(['name'])
  })
})

