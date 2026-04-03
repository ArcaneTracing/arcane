import { MessageBox } from "./use-prompt-form"

export interface UsePromptFormActionsReturn {
  addMessage: () => void
  removeMessage: (id: string) => void
  updateMessage: (id: string, field: 'role' | 'content', value: string) => void
  copyMessage: (id: string) => void
  addTool: () => void
  removeTool: (id: string) => void
  updateTool: (id: string, content: string) => void
  copyTool: (id: string) => void
  toggleToolOpen: (id: string) => void
}

export function usePromptFormActions(
  messages: MessageBox[],
  tools: Array<{ id: string; content: string }>,
  toolOpenStates: Record<string, boolean>,
  setMessages: (messages: MessageBox[]) => void,
  setTools: (tools: Array<{ id: string; content: string }>) => void,
  setToolOpenStates: (states: Record<string, boolean>) => void
): UsePromptFormActionsReturn {
  const addMessage = () => {
    const newId = String(messages.length + 1)
    setMessages([...messages, { id: newId, role: 'user', content: '' }])
  }

  const removeMessage = (id: string) => {
    setMessages(messages.filter(msg => msg.id !== id))
  }

  const updateMessage = (id: string, field: 'role' | 'content', value: string) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, [field]: value } : msg
    ))
  }

  const copyMessage = (id: string) => {
    const message = messages.find(msg => msg.id === id)
    if (message) {
      navigator.clipboard.writeText(message.content)
    }
  }

  const addTool = () => {
    const newId = `tool-${crypto.randomUUID()}`
    const defaultTool = {
      type: "function",
      function: {
        name: `new_function_${tools.length + 1}`,
        description: "a description",
        parameters: {
          type: "object",
          properties: {
            new_arg: {
              type: "string"
            }
          },
          required: []
        }
      }
    }
    setTools([...tools, { id: newId, content: JSON.stringify(defaultTool, null, 2) }])
    setToolOpenStates({ ...toolOpenStates, [newId]: true })
  }

  const toggleToolOpen = (id: string) => {
    setToolOpenStates({ ...toolOpenStates, [id]: !toolOpenStates[id] })
  }

  const removeTool = (id: string) => {
    setTools(tools.filter(tool => tool.id !== id))
    setToolOpenStates(prev => {
      const newState = { ...prev }
      delete newState[id]
      return newState
    })
  }

  const updateTool = (id: string, content: string) => {
    setTools(tools.map(tool => 
      tool.id === id ? { ...tool, content } : tool
    ))
  }

  const copyTool = (id: string) => {
    const tool = tools.find(t => t.id === id)
    if (tool) {
      navigator.clipboard.writeText(tool.content)
    }
  }

  return {
    addMessage,
    removeMessage,
    updateMessage,
    copyMessage,
    addTool,
    removeTool,
    updateTool,
    copyTool,
    toggleToolOpen,
  }
}

