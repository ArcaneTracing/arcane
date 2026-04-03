import { extractMessagesFromSpan, convertMessagesToDatasetFormat } from '../span-messages';
import { MessageType, MessageMatchingType } from '@/types';
import type { EntityResponse, FlatMessageMatchingConfiguration } from '@/types';
import type { NormalizedSpan, SpanAttribute } from '@/types/traces';

describe('span-messages', () => {
  const createMockSpan = (
  spanId: string,
  attributes: SpanAttribute[],
  startTime: number = 1000,
  endTime?: number)
  : NormalizedSpan => ({
    spanId,
    traceId: 'trace-1',
    name: 'test-span',
    startTime,
    endTime: endTime || startTime + 100,
    attributes
  });

  const createMockFlatEntity = (
  id: string,
  config: FlatMessageMatchingConfiguration)
  : EntityResponse => ({
    id,
    name: 'Test Entity',
    type: 'MODEL' as const,
    matchPattern: { type: 'REGEX' as const, pattern: '.*' },
    messageMatching: {
      type: MessageMatchingType.FLAT,
      flatMessageMatchingConfiguration: config,
      canonicalMessageMatchingConfiguration: null
    }
  });

  const createMockCanonicalEntity = (
  id: string,
  inputAttributeKey: string,
  outputAttributeKey?: string)
  : EntityResponse => ({
    id,
    name: 'Test Entity',
    type: 'MODEL' as const,
    matchPattern: { type: 'REGEX' as const, pattern: '.*' },
    messageMatching: {
      type: MessageMatchingType.CANONICAL,
      flatMessageMatchingConfiguration: null,
      canonicalMessageMatchingConfiguration: {
        inputAttributeKey,
        outputAttributeKey: outputAttributeKey || null
      }
    }
  });

  describe('extractMessagesFromSpan', () => {
    it('should return empty array for null entity', () => {
      const span = createMockSpan('span-1', []);
      const result = extractMessagesFromSpan(span, null);
      expect(result).toEqual([]);
    });

    it('should return empty array for undefined entity', () => {
      const span = createMockSpan('span-1', []);
      const result = extractMessagesFromSpan(span, undefined);
      expect(result).toEqual([]);
    });

    it('should return empty array for entity without message matching', () => {
      const entity: EntityResponse = {
        id: 'entity-1',
        name: 'Test Entity',
        type: 'MODEL' as const,
        matchPattern: { type: 'REGEX' as const, pattern: '.*' },
        messageMatching: null as any
      };
      const span = createMockSpan('span-1', []);
      const result = extractMessagesFromSpan(span, entity);
      expect(result).toEqual([]);
    });

    describe('flat message matching', () => {
      it('should extract messages from flat format', () => {
        const entity = createMockFlatEntity('entity-1', {
          flatInputMessageMatchingKeys: {
            rolePattern: 'llm\\.input_messages\\.(\\d+)\\.message\\.role',
            contentPattern: 'llm\\.input_messages\\.(\\d+)\\.message\\.content',
            namePattern: 'llm\\.input_messages\\.(\\d+)\\.name',
            toolMessageCallIdPattern: 'llm\\.tool_messages\\.(\\d+)\\.tool_call_id',
            toolCallFunctionNamePattern: 'llm\\.tool_calls\\.(\\d+)\\.function\\.name',
            toolCallIdPattern: 'llm\\.tool_calls\\.(\\d+)\\.id',
            toolCallFunctionArgumentPattern: 'llm\\.tool_calls\\.(\\d+)\\.function\\.arguments'
          },
          flatOutputMessageMatchingKeys: {
            rolePattern: 'llm\\.output_messages\\.(\\d+)\\.message\\.role',
            contentPattern: 'llm\\.output_messages\\.(\\d+)\\.message\\.content',
            namePattern: 'llm\\.output_messages\\.(\\d+)\\.name',
            toolMessageCallIdPattern: 'llm\\.tool_messages\\.(\\d+)\\.tool_call_id',
            toolCallFunctionNamePattern: 'llm\\.tool_calls\\.(\\d+)\\.function\\.name',
            toolCallIdPattern: 'llm\\.tool_calls\\.(\\d+)\\.id',
            toolCallFunctionArgumentPattern: 'llm\\.tool_calls\\.(\\d+)\\.function\\.arguments'
          }
        });

        const span = createMockSpan('span-1', [
        { key: 'llm.input_messages.0.message.role', value: 'user' },
        { key: 'llm.input_messages.0.message.content', value: 'Hello' },
        { key: 'llm.output_messages.0.message.role', value: 'assistant' },
        { key: 'llm.output_messages.0.message.content', value: 'Hi there!' }],
        1000, 2000);

        const result = extractMessagesFromSpan(span, entity);

        expect(result).toHaveLength(2);
        expect(result[0].type).toBe(MessageType.USER);
        expect(result[0].content).toBe('Hello');
        expect(result[0].timestamp).toBe(1000);
        expect(result[1].type).toBe(MessageType.ASSISTANT);
        expect(result[1].content).toBe('Hi there!');
        expect(result[1].timestamp).toBe(2000);
      });

      it('should handle attributes in any order', () => {
        const entity = createMockFlatEntity('entity-1', {
          flatInputMessageMatchingKeys: {
            rolePattern: 'llm\\.input_messages\\.(\\d+)\\.message\\.role',
            contentPattern: 'llm\\.input_messages\\.(\\d+)\\.message\\.content',
            namePattern: '',
            toolMessageCallIdPattern: '',
            toolCallFunctionNamePattern: '',
            toolCallIdPattern: '',
            toolCallFunctionArgumentPattern: ''
          },
          flatOutputMessageMatchingKeys: {
            rolePattern: '',
            contentPattern: '',
            namePattern: '',
            toolMessageCallIdPattern: '',
            toolCallFunctionNamePattern: '',
            toolCallIdPattern: '',
            toolCallFunctionArgumentPattern: ''
          }
        });


        const span = createMockSpan('span-1', [
        { key: 'llm.input_messages.0.message.content', value: 'Hello' },
        { key: 'llm.input_messages.0.message.role', value: 'user' }]
        );

        const result = extractMessagesFromSpan(span, entity);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe(MessageType.USER);
        expect(result[0].content).toBe('Hello');
      });

      it('should handle empty attributes', () => {
        const entity = createMockFlatEntity('entity-1', {
          flatInputMessageMatchingKeys: {
            rolePattern: 'llm\\.input_messages\\.(\\d+)\\.message\\.role',
            contentPattern: 'llm\\.input_messages\\.(\\d+)\\.message\\.content',
            namePattern: '',
            toolMessageCallIdPattern: '',
            toolCallFunctionNamePattern: '',
            toolCallIdPattern: '',
            toolCallFunctionArgumentPattern: ''
          },
          flatOutputMessageMatchingKeys: {
            rolePattern: '',
            contentPattern: '',
            namePattern: '',
            toolMessageCallIdPattern: '',
            toolCallFunctionNamePattern: '',
            toolCallIdPattern: '',
            toolCallFunctionArgumentPattern: ''
          }
        });

        const span = createMockSpan('span-1', []);
        const result = extractMessagesFromSpan(span, entity);
        expect(result).toEqual([]);
      });

      it('should handle null attributes', () => {
        const entity = createMockFlatEntity('entity-1', {
          flatInputMessageMatchingKeys: {
            rolePattern: 'llm\\.input_messages\\.(\\d+)\\.message\\.role',
            contentPattern: 'llm\\.input_messages\\.(\\d+)\\.message\\.content',
            namePattern: '',
            toolMessageCallIdPattern: '',
            toolCallFunctionNamePattern: '',
            toolCallIdPattern: '',
            toolCallFunctionArgumentPattern: ''
          },
          flatOutputMessageMatchingKeys: {
            rolePattern: '',
            contentPattern: '',
            namePattern: '',
            toolMessageCallIdPattern: '',
            toolCallFunctionNamePattern: '',
            toolCallIdPattern: '',
            toolCallFunctionArgumentPattern: ''
          }
        });

        const span = createMockSpan('span-1', []);
        span.attributes = null as any;
        const result = extractMessagesFromSpan(span, entity);
        expect(result).toEqual([]);
      });
    });

  });

  describe('convertMessagesToDatasetFormat', () => {
    it('should convert messages to JSON format', () => {
      const messages = [
      {
        type: MessageType.USER,
        content: 'Hello',
        timestamp: 1000,
        spanId: 'span-1'
      },
      {
        type: MessageType.ASSISTANT,
        content: 'Hi there!',
        timestamp: 2000,
        spanId: 'span-1'
      }];


      const result = convertMessagesToDatasetFormat(messages);
      const parsed = JSON.parse(result);

      expect(parsed).toHaveLength(2);
      expect(parsed[0]).toEqual({
        role: MessageType.USER,
        content: 'Hello'
      });
      expect(parsed[1]).toEqual({
        role: MessageType.ASSISTANT,
        content: 'Hi there!'
      });
    });

    it('should include name when present', () => {
      const messages = [
      {
        type: MessageType.USER,
        content: 'Hello',
        timestamp: 1000,
        spanId: 'span-1',
        name: 'Alice'
      }];


      const result = convertMessagesToDatasetFormat(messages);
      const parsed = JSON.parse(result);

      expect(parsed[0].name).toBe('Alice');
    });

    it('should include tool call information when present', () => {
      const messages = [
      {
        type: MessageType.ASSISTANT,
        content: 'Let me check',
        timestamp: 1000,
        spanId: 'span-1',
        tool_call_id: 'call_123',
        tool_call_function_name: 'get_weather',
        tool_call_function_arguments: { location: 'SF' }
      }];


      const result = convertMessagesToDatasetFormat(messages);
      const parsed = JSON.parse(result);

      expect(parsed[0].tool_calls).toBeDefined();
      expect(parsed[0].tool_calls).toHaveLength(1);
      expect(parsed[0].tool_calls[0].id).toBe('call_123');
      expect(parsed[0].tool_calls[0].type).toBe('function');
      expect(parsed[0].tool_calls[0].function.name).toBe('get_weather');
      expect(JSON.parse(parsed[0].tool_calls[0].function.arguments)).toEqual({ location: 'SF' });
    });

    it('should handle empty messages array', () => {
      const result = convertMessagesToDatasetFormat([]);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual([]);
    });
  });
});