import { MessageType } from '@/types'
import type { ExtractedMessage } from './shared'

interface ChatMessage {
  role: string;
  content: string;
  name?: string;
  tool_calls?: Array<{
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
}

export function convertMessagesToDatasetFormat(messages: ExtractedMessage[]): string {
  const chatMessages = messages.map(msg => {
    const role = msg.type || MessageType.USER

    const chatMessage: ChatMessage = {
      role,
      content: msg.content,
    }

    if (msg.name) {
      chatMessage.name = msg.name
    }

    if (msg.tool_call_id || msg.tool_call_function_name) {
      if (msg.tool_call_id && msg.tool_call_function_name) {
        chatMessage.tool_calls = [{
          id: msg.tool_call_id,
          type: 'function',
          function: {
            name: msg.tool_call_function_name,
            arguments: msg.tool_call_function_arguments 
              ? JSON.stringify(msg.tool_call_function_arguments)
              : '{}'
          }
        }]
      }
      if (msg.tool_call_id && !msg.tool_call_function_name) {
        chatMessage.tool_call_id = msg.tool_call_id
      }
    }

    return chatMessage
  })

  return JSON.stringify(chatMessages)
}
