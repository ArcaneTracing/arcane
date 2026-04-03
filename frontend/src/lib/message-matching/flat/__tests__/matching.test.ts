import { extractFlatMessagesFromTrace, processAttribute } from '../matching'
import type { TempoTraceResponse, SpanAttribute } from '@/types/traces'
import type { FlatMessageMatchingPatterns } from '@/types'
import type { ExtractedMessage } from '../../shared'

describe('flat/matching', () => {
  describe('extractFlatMessagesFromTrace', () => {
    it('should return empty array for null trace', () => {
      const result = extractFlatMessagesFromTrace(null, [])
      expect(result).toEqual([])
    })

    it('should return empty array for empty entities', () => {
      const trace: TempoTraceResponse = {
        batches: [],
        traceID: 'trace-1',
      }
      const result = extractFlatMessagesFromTrace(trace, [])
      expect(result).toEqual([])
    })
  })

  describe('processAttribute', () => {
    const createGetOrCreateMessage = (messages: Map<string, Partial<ExtractedMessage>>) =>
      (key: string | null) => {
        if (key === null) return null
        const k = key
        if (!messages.has(k)) {
          messages.set(k, { type: 0, content: '', timestamp: 0, spanId: '' })
        }
        return messages.get(k)!
      }

    it('returns false when no pattern matches', () => {
      const messages = new Map<string, Partial<ExtractedMessage>>()
      const patterns: FlatMessageMatchingPatterns = {}
      const result = processAttribute('unknown.attribute', 'value', patterns, createGetOrCreateMessage(messages))
      expect(result).toBe(false)
    })

    it('matches role pattern and sets message type', () => {
      const messages = new Map<string, Partial<ExtractedMessage>>()
      const patterns: FlatMessageMatchingPatterns = {
        rolePattern: 'llm\\.input_messages\\.(\\d+)\\.message\\.role',
      }
      const result = processAttribute('llm.input_messages.0.message.role', 'user', patterns, createGetOrCreateMessage(messages))
      expect(result).toBe(true)
      expect(messages.get('0')?.type).toBeDefined()
    })

    it('handles null value for role pattern', () => {
      const messages = new Map<string, Partial<ExtractedMessage>>()
      const patterns: FlatMessageMatchingPatterns = {
        rolePattern: 'llm\\.input_messages\\.(\\d+)\\.message\\.role',
      }
      const result = processAttribute('llm.input_messages.0.message.role', null, patterns, createGetOrCreateMessage(messages))
      expect(result).toBe(true)
      expect(messages.get('0')?.type).toBeDefined()
    })

    it('matches content pattern', () => {
      const messages = new Map<string, Partial<ExtractedMessage>>()
      const patterns: FlatMessageMatchingPatterns = {
        contentPattern: 'llm\\.input_messages\\.(\\d+)\\.message\\.content',
      }
      const result = processAttribute('llm.input_messages.0.message.content', 'Hello', patterns, createGetOrCreateMessage(messages))
      expect(result).toBe(true)
      expect(messages.get('0')?.content).toBe('Hello')
    })

    it('matches toolCallFunctionNamePattern and sets function name', () => {
      const messages = new Map<string, Partial<ExtractedMessage>>()
      const patterns: FlatMessageMatchingPatterns = {
        toolCallFunctionNamePattern: 'llm\\.input_messages\\.(\\d+)\\.tool_call\\.function\\.name',
      }
      const result = processAttribute('llm.input_messages.0.tool_call.function.name', 'get_weather', patterns, createGetOrCreateMessage(messages))
      expect(result).toBe(true)
      expect(messages.get('0')?.tool_call_function_name).toBe('get_weather')
    })

    it('does not set toolCallFunctionName when value is null', () => {
      const messages = new Map<string, Partial<ExtractedMessage>>()
      const patterns: FlatMessageMatchingPatterns = {
        toolCallFunctionNamePattern: 'llm\\.input_messages\\.(\\d+)\\.tool_call\\.function\\.name',
      }
      const result = processAttribute('llm.input_messages.0.tool_call.function.name', null, patterns, createGetOrCreateMessage(messages))
      expect(result).toBe(true)
      expect(messages.get('0')?.tool_call_function_name).toBeUndefined()
    })

    it('matches toolCallIdPattern and sets tool call id', () => {
      const messages = new Map<string, Partial<ExtractedMessage>>()
      const patterns: FlatMessageMatchingPatterns = {
        toolCallIdPattern: 'llm\\.input_messages\\.(\\d+)\\.tool_call\\.id',
      }
      const result = processAttribute('llm.input_messages.0.tool_call.id', 'call_123', patterns, createGetOrCreateMessage(messages))
      expect(result).toBe(true)
      expect(messages.get('0')?.tool_call_id).toBe('call_123')
    })

    it('matches toolCallFunctionArgumentPattern and sets arguments', () => {
      const messages = new Map<string, Partial<ExtractedMessage>>()
      const patterns: FlatMessageMatchingPatterns = {
        toolCallFunctionArgumentPattern: 'llm\\.input_messages\\.(\\d+)\\.tool_call\\.function\\.arguments',
      }
      const args = { location: 'NYC', unit: 'celsius' }
      const result = processAttribute('llm.input_messages.0.tool_call.function.arguments', args, patterns, createGetOrCreateMessage(messages))
      expect(result).toBe(true)
      expect(messages.get('0')?.tool_call_function_arguments).toEqual(args)
    })

    it('matches toolMessageCallIdPattern and sets tool call id', () => {
      const messages = new Map<string, Partial<ExtractedMessage>>()
      const patterns: FlatMessageMatchingPatterns = {
        toolMessageCallIdPattern: 'llm\\.output_messages\\.(\\d+)\\.tool_call_id',
      }
      const result = processAttribute('llm.output_messages.0.tool_call_id', 'call_123', patterns, createGetOrCreateMessage(messages))
      expect(result).toBe(true)
      expect(messages.get('0')?.tool_call_id).toBe('call_123')
    })

    it('matches namePattern and sets name', () => {
      const messages = new Map<string, Partial<ExtractedMessage>>()
      const patterns: FlatMessageMatchingPatterns = {
        namePattern: 'llm\\.input_messages\\.(\\d+)\\.message\\.name',
      }
      const result = processAttribute('llm.input_messages.0.message.name', 'assistant', patterns, createGetOrCreateMessage(messages))
      expect(result).toBe(true)
      expect(messages.get('0')?.name).toBe('assistant')
    })

    it('handles object values by stringifying them', () => {
      const messages = new Map<string, Partial<ExtractedMessage>>()
      const patterns: FlatMessageMatchingPatterns = {
        toolCallFunctionNamePattern: 'llm\\.input_messages\\.(\\d+)\\.tool_call\\.function\\.name',
      }
      const objValue = { nested: 'value' }
      const result = processAttribute('llm.input_messages.0.tool_call.function.name', objValue, patterns, createGetOrCreateMessage(messages))
      expect(result).toBe(true)
      expect(messages.get('0')?.tool_call_function_name).toBe(JSON.stringify(objValue))
    })

    it('returns true when getOrCreateMessage returns null', () => {
      const getOrCreateNull = () => null
      const patterns: FlatMessageMatchingPatterns = {
        rolePattern: 'llm\\.input_messages\\.(\\d+)\\.message\\.role',
      }
      const result = processAttribute('llm.input_messages.0.message.role', 'user', patterns, getOrCreateNull)
      expect(result).toBe(true)
    })
  })
})
