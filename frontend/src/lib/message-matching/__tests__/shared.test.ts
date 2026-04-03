import { mergeConversations, processSpansForMessageMatching } from '../shared'
import type { ExtractedMessage } from '../shared'
import { MessageType } from '@/types'

const createMessage = (
  type: MessageType,
  content: string,
  timestamp = 1000,
  spanId = 's1'
): ExtractedMessage => ({
  type,
  content,
  timestamp,
  spanId,
})

describe('mergeConversations', () => {
  it('returns empty array for empty input', () => {
    expect(mergeConversations([])).toEqual([])
  })

  it('returns single conversation as-is', () => {
    const conv = [
      createMessage(MessageType.USER, 'Hi'),
      createMessage(MessageType.ASSISTANT, 'Hello'),
    ]
    expect(mergeConversations([conv])).toEqual(conv)
  })

  it('merges two conversations with common prefix', () => {
    const conv1 = [
      createMessage(MessageType.USER, 'Hi', 1000),
      createMessage(MessageType.ASSISTANT, 'Hello', 2000),
    ]
    const conv2 = [
      createMessage(MessageType.USER, 'Hi', 1000),
      createMessage(MessageType.ASSISTANT, 'Hello', 2000),
      createMessage(MessageType.USER, 'Bye', 3000),
    ]
    const result = mergeConversations([conv1, conv2])
    expect(result).toHaveLength(3)
    expect(result[2].content).toBe('Bye')
  })

  it('sorts merged result by timestamp', () => {
    const conv1 = [createMessage(MessageType.USER, 'A', 2000)]
    const conv2 = [createMessage(MessageType.ASSISTANT, 'B', 1000)]
    const result = mergeConversations([conv1, conv2])
    expect(result[0].timestamp).toBeLessThanOrEqual(result[1].timestamp)
  })
})

describe('processSpansForMessageMatching', () => {
  it('returns empty array for null trace', () => {
    expect(processSpansForMessageMatching(null, [])).toEqual([])
  })

  it('returns empty array for empty entities', () => {
    expect(
      processSpansForMessageMatching({ batches: [], traceID: 't1' }, [])
    ).toEqual([])
  })
})
