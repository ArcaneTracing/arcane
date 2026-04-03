import { processAttributePatterns } from '../flat-pattern-processor'
import type { SpanAttribute } from '@/types/traces'
import type { FlatMessageMatchingPatterns } from '@/types'
import type { ExtractedMessage } from '../shared'

describe('processAttributePatterns', () => {
  const createGetOrCreateMessage = (messages: Map<string, Partial<ExtractedMessage>>) =>
    (key: string | null) => {
      const k = key ?? '__default'
      if (!messages.has(k)) messages.set(k, { type: 0, content: '', timestamp: 0, spanId: '' })
      return messages.get(k)!
    }

  it('returns false when attr has no key', () => {
    const getOrCreate = createGetOrCreateMessage(new Map())
    expect(processAttributePatterns({ key: '', value: null }, {}, getOrCreate)).toBe(false)
  })

  it('matches role pattern and sets message type', () => {
    const messages = new Map<string, Partial<ExtractedMessage>>()
    const patterns: FlatMessageMatchingPatterns = {
      rolePattern: 'llm\\.input_messages\\.(\\d+)\\.message\\.role',
    }
    const attr: SpanAttribute = { key: 'llm.input_messages.0.message.role', value: 'user' }
    const result = processAttributePatterns(attr, patterns, createGetOrCreateMessage(messages))
    expect(result).toBe(true)
    expect(messages.get('0')?.type).toBeDefined()
  })

  it('matches content pattern', () => {
    const messages = new Map<string, Partial<ExtractedMessage>>()
    const patterns: FlatMessageMatchingPatterns = {
      contentPattern: 'llm\\.input_messages\\.(\\d+)\\.message\\.content',
    }
    const attr: SpanAttribute = { key: 'llm.input_messages.0.message.content', value: 'Hello' }
    const result = processAttributePatterns(attr, patterns, createGetOrCreateMessage(messages))
    expect(result).toBe(true)
  })

  it('returns false when no pattern matches', () => {
    const messages = new Map<string, Partial<ExtractedMessage>>()
    const patterns: FlatMessageMatchingPatterns = {}
    const attr: SpanAttribute = { key: 'unknown.attribute', value: 'x' }
    expect(processAttributePatterns(attr, patterns, createGetOrCreateMessage(messages))).toBe(false)
  })
})
