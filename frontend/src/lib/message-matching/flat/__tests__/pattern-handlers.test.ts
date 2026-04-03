import {
  matchesPattern,
  extractIndexFromMatch,
  handleContentPattern,
  handleRolePattern,
  handleToolCallFunctionNamePattern,
  handleToolCallIdPattern,
  handleToolCallFunctionArgumentPattern,
  handleToolMessageCallIdPattern,
  handleNamePattern } from
'../pattern-handlers';
import { MessageType } from '@/types';
import type { SpanAttribute } from '@/types/traces';

describe('pattern-handlers', () => {
  describe('matchesPattern', () => {
    it('should return true when pattern matches key', () => {
      expect(matchesPattern('llm.input_messages.0.message.role', 'llm\\.input_messages\\.\\d+\\.message\\.role')).toBe(true);
    });

    it('should return false when pattern does not match key', () => {
      expect(matchesPattern('llm.output_messages.0.message.role', 'llm\\.input_messages\\.\\d+\\.message\\.role')).toBe(false);
    });

    it('should return false when pattern is undefined', () => {
      expect(matchesPattern('some.key', undefined)).toBe(false);
    });

    it('should return false when key is empty', () => {
      expect(matchesPattern('', 'some\\.pattern')).toBe(false);
    });

    it('should handle invalid regex gracefully', () => {
      expect(matchesPattern('some.key', '[invalid')).toBe(false);
    });

    it('should match patterns with capture groups', () => {
      expect(matchesPattern('llm.input_messages.5.message.content', 'llm\\.input_messages\\.(\\d+)\\.message\\.content')).toBe(true);
    });
  });

  describe('extractIndexFromMatch', () => {
    it('should extract index from capture group', () => {
      const pattern = 'llm\\.input_messages\\.(\\d+)\\.message\\.role';
      const key = 'llm.input_messages.0.message.role';
      expect(extractIndexFromMatch(key, pattern)).toBe('0');
    });

    it('should extract index from capture group with multiple digits', () => {
      const pattern = 'llm\\.input_messages\\.(\\d+)\\.message\\.role';
      const key = 'llm.input_messages.123.message.role';
      expect(extractIndexFromMatch(key, pattern)).toBe('123');
    });

    it('should extract index from matched portion when no capture group', () => {
      const pattern = 'llm\\.input_messages\\.\\d+\\.message\\.role';
      const key = 'llm.input_messages.5.message.role';
      expect(extractIndexFromMatch(key, pattern)).toBe('5');
    });

    it('should use fallback to extract index from key', () => {
      const pattern = 'input_messages.*role';
      const key = 'llm.input_messages.7.message.role';
      expect(extractIndexFromMatch(key, pattern)).toBe('7');
    });

    it('should return null when no match found', () => {
      const pattern = 'llm\\.input_messages\\.\\d+\\.message\\.role';
      const key = 'llm.output_messages.0.message.role';
      expect(extractIndexFromMatch(key, pattern)).toBeNull();
    });

    it('should return null when no index can be extracted', () => {
      const pattern = 'some\\.pattern';
      const key = 'some.pattern';
      expect(extractIndexFromMatch(key, pattern)).toBeNull();
    });

    it('should handle invalid regex gracefully', () => {
      const pattern = '[invalid';
      const key = 'some.key';
      expect(extractIndexFromMatch(key, pattern)).toBeNull();
    });

    it('should extract string identifiers, not just numbers', () => {
      const pattern = 'messages\\.(\\w+)\\.role';
      const key = 'messages.msg_123.role';
      expect(extractIndexFromMatch(key, pattern)).toBe('msg_123');
    });
  });

  describe('handleContentPattern', () => {
    const mockMessage: Partial<import('../shared').ExtractedMessage> = {
      type: MessageType.USER,
      content: '',
      timestamp: 1000,
      spanId: 'span-1'
    };

    it('should add content when pattern matches', () => {
      const pattern = 'llm\\.input_messages\\.\\d+\\.message\\.content';
      const key = 'llm.input_messages.0.message.content';
      const value: SpanAttribute['value'] = 'Hello, world!';

      const result = handleContentPattern(pattern, key, value, mockMessage);

      expect(result).toBe(true);
      expect(mockMessage.content).toBe('Hello, world!');
    });

    it('should append content with newline separator', () => {
      const pattern = 'llm\\.input_messages\\.\\d+\\.message\\.content';
      mockMessage.content = 'First part';

      const result = handleContentPattern(pattern, 'llm.input_messages.0.message.content', 'Second part', mockMessage);

      expect(result).toBe(true);
      expect(mockMessage.content).toBe('First part\n\nSecond part');
    });

    it('should return false when pattern does not match', () => {
      const pattern = 'llm\\.input_messages\\.\\d+\\.message\\.content';
      const key = 'llm.output_messages.0.message.content';

      const result = handleContentPattern(pattern, key, 'content', mockMessage);

      expect(result).toBe(false);
    });

    it('should return false when pattern is undefined', () => {
      const result = handleContentPattern(undefined, 'some.key', 'content', mockMessage);
      expect(result).toBe(false);
    });

    it('should validate index when currentMessageIndex is provided', () => {
      const pattern = 'llm\\.input_messages\\.(\\d+)\\.message\\.content';
      const key = 'llm.input_messages.1.message.content';

      const result = handleContentPattern(pattern, key, 'content', mockMessage, 0);

      expect(result).toBe(false);
    });

    it('should allow content when indices match', () => {
      const pattern = 'llm\\.input_messages\\.(\\d+)\\.message\\.content';
      const key = 'llm.input_messages.0.message.content';

      const result = handleContentPattern(pattern, key, 'content', mockMessage, 0);

      expect(result).toBe(true);
    });

    it('should extract content from object value', () => {
      const pattern = 'llm\\.input_messages\\.\\d+\\.message\\.content';
      const value: SpanAttribute['value'] = { content: 'Nested content' };
      const freshMessage: Partial<import('../shared').ExtractedMessage> = {
        type: MessageType.USER,
        content: '',
        timestamp: 1000,
        spanId: 'span-1'
      };

      handleContentPattern(pattern, 'llm.input_messages.0.message.content', value, freshMessage);

      expect(freshMessage.content).toBe('Nested content');
    });

    it('should handle null/undefined values gracefully', () => {
      const pattern = 'llm\\.input_messages\\.\\d+\\.message\\.content';
      const freshMessage: Partial<import('../shared').ExtractedMessage> = {
        type: MessageType.USER,
        content: '',
        timestamp: 1000,
        spanId: 'span-1'
      };

      handleContentPattern(pattern, 'llm.input_messages.0.message.content', null, freshMessage);
      expect(freshMessage.content).toBe('');

      const freshMessage2: Partial<import('../shared').ExtractedMessage> = {
        type: MessageType.USER,
        content: '',
        timestamp: 1000,
        spanId: 'span-1'
      };
      handleContentPattern(pattern, 'llm.input_messages.0.message.content', undefined, freshMessage2);
      expect(freshMessage2.content).toBe('');
    });
  });

  describe('handleRolePattern', () => {
    it('should return matched=false when pattern does not match', () => {
      const pattern = 'llm\\.input_messages\\.\\d+\\.message\\.role';
      const key = 'llm.output_messages.0.message.role';

      const result = handleRolePattern(pattern, key, 'user', null, 1000, 'span-1');

      expect(result.matched).toBe(false);
      expect(result.finalizedMessage).toBeNull();
      expect(result.newMessage).toBeNull();
    });

    it('should create new message with USER type for user role', () => {
      const pattern = 'llm\\.input_messages\\.(\\d+)\\.message\\.role';
      const key = 'llm.input_messages.0.message.role';

      const result = handleRolePattern(pattern, key, 'user', null, 1000, 'span-1');

      expect(result.matched).toBe(true);
      expect(result.newMessage?.type).toBe(MessageType.USER);
      expect(result.newMessage?.timestamp).toBe(1000);
      expect(result.newMessage?.spanId).toBe('span-1');
    });

    it('should create new message with ASSISTANT type for assistant role', () => {
      const pattern = 'llm\\.input_messages\\.(\\d+)\\.message\\.role';
      const key = 'llm.input_messages.0.message.role';

      const result = handleRolePattern(pattern, key, 'assistant', null, 1000, 'span-1');

      expect(result.matched).toBe(true);
      expect(result.newMessage?.type).toBe(MessageType.ASSISTANT);
    });

    it('should create new message with SYSTEM type for system role', () => {
      const pattern = 'llm\\.input_messages\\.(\\d+)\\.message\\.role';
      const key = 'llm.input_messages.0.message.role';

      const result = handleRolePattern(pattern, key, 'system', null, 1000, 'span-1');

      expect(result.matched).toBe(true);
      expect(result.newMessage?.type).toBe(MessageType.SYSTEM);
    });

    it('should create new message with TOOL type for tool role', () => {
      const pattern = 'llm\\.input_messages\\.(\\d+)\\.message\\.role';
      const key = 'llm.input_messages.0.message.role';

      const result = handleRolePattern(pattern, key, 'tool', null, 1000, 'span-1');

      expect(result.matched).toBe(true);
      expect(result.newMessage?.type).toBe(MessageType.TOOL);
    });

    it('should finalize current message when provided', () => {
      const pattern = 'llm\\.input_messages\\.(\\d+)\\.message\\.role';
      const key = 'llm.input_messages.1.message.role';
      const currentMessage: Partial<import('../shared').ExtractedMessage> = {
        type: MessageType.USER,
        content: 'Previous message',
        timestamp: 500,
        spanId: 'span-1'
      };

      const result = handleRolePattern(pattern, key, 'assistant', currentMessage, 1000, 'span-1');

      expect(result.matched).toBe(true);
      expect(result.finalizedMessage).not.toBeNull();
      expect(result.finalizedMessage?.type).toBe(MessageType.USER);
      expect(result.finalizedMessage?.content).toBe('Previous message');
      expect(result.newMessage?.type).toBe(MessageType.ASSISTANT);
    });

    it('should extract message index from pattern', () => {
      const pattern = 'llm\\.input_messages\\.(\\d+)\\.message\\.role';
      const key = 'llm.input_messages.5.message.role';

      const result = handleRolePattern(pattern, key, 'user', null, 1000, 'span-1');

      expect(result.matched).toBe(true);
      expect(result.messageIndex).toBe(5);
    });

    it('should handle case-insensitive role values', () => {
      const pattern = 'llm\\.input_messages\\.(\\d+)\\.message\\.role';
      const key = 'llm.input_messages.0.message.role';

      const result = handleRolePattern(pattern, key, 'USER', null, 1000, 'span-1');

      expect(result.matched).toBe(true);
      expect(result.newMessage?.type).toBe(MessageType.USER);
    });

    it('should default to USER type for unknown role', () => {
      const pattern = 'llm\\.input_messages\\.(\\d+)\\.message\\.role';
      const key = 'llm.input_messages.0.message.role';

      const result = handleRolePattern(pattern, key, 'unknown', null, 1000, 'span-1');

      expect(result.matched).toBe(true);
      expect(result.newMessage?.type).toBe(MessageType.USER);
    });
  });

  describe('handleToolCallFunctionNamePattern', () => {
    const mockMessage: Partial<import('../shared').ExtractedMessage> = {
      type: MessageType.ASSISTANT,
      content: '',
      timestamp: 1000,
      spanId: 'span-1'
    };

    it('should set tool_call_function_name when pattern matches', () => {
      const pattern = 'llm\\.tool_calls\\.\\d+\\.function\\.name';
      const key = 'llm.tool_calls.0.function.name';

      const result = handleToolCallFunctionNamePattern(pattern, key, 'get_weather', mockMessage);

      expect(result).toBe(true);
      expect(mockMessage.tool_call_function_name).toBe('get_weather');
    });

    it('should return false when pattern does not match', () => {
      const pattern = 'llm\\.tool_calls\\.\\d+\\.function\\.name';
      const key = 'llm.tool_calls.0.function.args';

      const result = handleToolCallFunctionNamePattern(pattern, key, 'get_weather', mockMessage);

      expect(result).toBe(false);
    });
  });

  describe('handleToolCallIdPattern', () => {
    const mockMessage: Partial<import('../shared').ExtractedMessage> = {
      type: MessageType.ASSISTANT,
      content: '',
      timestamp: 1000,
      spanId: 'span-1'
    };

    it('should set tool_call_id when pattern matches', () => {
      const pattern = 'llm\\.tool_calls\\.\\d+\\.id';
      const key = 'llm.tool_calls.0.id';

      const result = handleToolCallIdPattern(pattern, key, 'call_123', mockMessage);

      expect(result).toBe(true);
      expect(mockMessage.tool_call_id).toBe('call_123');
    });

    it('should return false when pattern does not match', () => {
      const pattern = 'llm\\.tool_calls\\.\\d+\\.id';
      const key = 'llm.tool_calls.0.name';

      const result = handleToolCallIdPattern(pattern, key, 'call_123', mockMessage);

      expect(result).toBe(false);
    });
  });

  describe('handleToolCallFunctionArgumentPattern', () => {
    const mockMessage: Partial<import('../shared').ExtractedMessage> = {
      type: MessageType.ASSISTANT,
      content: '',
      timestamp: 1000,
      spanId: 'span-1'
    };

    it('should set tool_call_function_arguments for object value', () => {
      const pattern = 'llm\\.tool_calls\\.\\d+\\.function\\.arguments';
      const key = 'llm.tool_calls.0.function.arguments';
      const value: SpanAttribute['value'] = { location: 'SF', unit: 'celsius' };

      const result = handleToolCallFunctionArgumentPattern(pattern, key, value, mockMessage);

      expect(result).toBe(true);
      expect(mockMessage.tool_call_function_arguments).toEqual({ location: 'SF', unit: 'celsius' });
    });

    it('should wrap non-object values in object', () => {
      const pattern = 'llm\\.tool_calls\\.\\d+\\.function\\.arguments';
      const key = 'llm.tool_calls.0.function.arguments';

      handleToolCallFunctionArgumentPattern(pattern, key, 'string_value', mockMessage);
      expect(mockMessage.tool_call_function_arguments).toEqual({ value: 'string_value' });

      handleToolCallFunctionArgumentPattern(pattern, key, 123, mockMessage);
      expect(mockMessage.tool_call_function_arguments).toEqual({ value: 123 });
    });

    it('should return false when pattern does not match', () => {
      const pattern = 'llm\\.tool_calls\\.\\d+\\.function\\.arguments';
      const key = 'llm.tool_calls.0.function.name';

      const result = handleToolCallFunctionArgumentPattern(pattern, key, { arg: 'value' }, mockMessage);

      expect(result).toBe(false);
    });
  });

  describe('handleToolMessageCallIdPattern', () => {
    const mockMessage: Partial<import('../shared').ExtractedMessage> = {
      type: MessageType.TOOL,
      content: '',
      timestamp: 1000,
      spanId: 'span-1'
    };

    it('should set tool_call_id when pattern matches', () => {
      const pattern = 'llm\\.tool_messages\\.\\d+\\.tool_call_id';
      const key = 'llm.tool_messages.0.tool_call_id';

      const result = handleToolMessageCallIdPattern(pattern, key, 'call_456', mockMessage);

      expect(result).toBe(true);
      expect(mockMessage.tool_call_id).toBe('call_456');
    });
  });

  describe('handleNamePattern', () => {
    it('should set name when pattern matches', () => {
      const pattern = 'llm\\.input_messages\\.\\d+\\.name';
      const key = 'llm.input_messages.0.name';
      const mockMessage: Partial<import('../shared').ExtractedMessage> = {
        type: MessageType.USER,
        content: '',
        timestamp: 1000,
        spanId: 'span-1'
      };

      const result = handleNamePattern(pattern, key, 'Alice', mockMessage);

      expect(result).toBe(true);
      expect(mockMessage.name).toBe('Alice');
    });

    it('should not set name if it matches content', () => {
      const pattern = 'llm\\.input_messages\\.\\d+\\.name';
      const key = 'llm.input_messages.0.name';
      const messageWithContent: Partial<import('../shared').ExtractedMessage> = {
        type: MessageType.USER,
        content: 'Hello',
        timestamp: 1000,
        spanId: 'span-1'
      };

      const result = handleNamePattern(pattern, key, 'Hello', messageWithContent);
      expect(result).toBe(true);
      expect(messageWithContent.name).toBeUndefined();
    });

    it('should return false when pattern does not match', () => {
      const pattern = 'llm\\.input_messages\\.\\d+\\.name';
      const key = 'llm.input_messages.0.role';
      const mockMessage: Partial<import('../shared').ExtractedMessage> = {
        type: MessageType.USER,
        content: '',
        timestamp: 1000,
        spanId: 'span-1'
      };

      const result = handleNamePattern(pattern, key, 'Alice', mockMessage);

      expect(result).toBe(false);
    });
  });
});