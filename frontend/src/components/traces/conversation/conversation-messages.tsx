"use client";

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageType } from '@/types';
import { formatTimestamp } from '../tree/trace-viewer-utils';
import { ExtractedMessage } from '@/lib/message-matching/shared';
import AiBrainIcon from '@/components/entities/icons/ai-brain-icon';
import ToolIcon from '@/components/entities/icons/tool-icon';
import UserIcon from '@/components/icons/user-icon';

interface ConversationMessagesProps {
  messages: ExtractedMessage[];
  emptyMessage?: {
    title: string;
    description?: string;
  };
}

export function ConversationMessages({ messages, emptyMessage }: Readonly<ConversationMessagesProps>) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">{emptyMessage?.title || 'No messages found'}</p>
          {emptyMessage?.description &&
          <p className="text-xs mt-2">{emptyMessage.description}</p>
          }
        </div>
      </div>);

  }

  const isUserMessage = (type: MessageType) => {
    return type === MessageType.USER;
  };

  const getAssistantName = (message: ExtractedMessage) => {

    switch (message.type) {
      case MessageType.ASSISTANT:
        return 'AI Assistant';
      case MessageType.SYSTEM:
        return 'System';
      case MessageType.TOOL:
        return 'Tool';
      default:
        return 'Assistant';
    }
  };

  const formatToolCallArguments = (args: any): string => {
    if (!args) return '';
    if (typeof args === 'string') {
      try {

        const parsed = JSON.parse(args);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return args;
      }
    }
    if (typeof args === 'object') {
      return JSON.stringify(args, null, 2);
    }
    return String(args);
  };

  const hasToolCallInfo = (message: ExtractedMessage): boolean => {
    return !!(
    message.tool_call_id ||
    message.tool_call_function_name ||
    message.tool_call_function_arguments);

  };

  const hasMetadata = (message: ExtractedMessage): boolean => {
    return hasToolCallInfo(message) || !!message.name;
  };

  const getMessageIcon = (type: MessageType) => {
    switch (type) {
      case MessageType.USER:
        return <UserIcon className="h-4 w-4 text-foreground" />;
      case MessageType.TOOL:
        return <ToolIcon className="h-4 w-4 text-foreground" />;
      case MessageType.SYSTEM:
      case MessageType.ASSISTANT:
      default:
        return <AiBrainIcon className="h-4 w-4 text-foreground" />;
    }
  };

  const getMessageBubbleStyles = (type: MessageType) => {
    if (type === MessageType.USER) {
      return 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100';
    }
    if (type === MessageType.TOOL) {
      return 'bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-400 dark:border-yellow-600 text-yellow-900 dark:text-yellow-100';
    }
    if (type === MessageType.SYSTEM) {
      return 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-400 dark:border-blue-600 text-blue-900 dark:text-blue-100';
    }
    return 'bg-card border border-border text-card-foreground';
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message, index) => {
            const isUser = isUserMessage(message.type);
            const isSystem = message.type === MessageType.SYSTEM;


            if (isSystem) {
              return (
                <div
                  key={`${message.spanId}-${index}`}
                  className="w-full">

                  <div
                    className={`rounded-2xl px-4 py-3 w-full ${getMessageBubbleStyles(message.type)}`}>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wide">
                        {getAssistantName(message)}
                      </span>
                    </div>
                    {}
                    {hasMetadata(message) &&
                    <div className="mb-3 pb-3 border-b border-border/50">
                        <div className="space-y-1.5">
                          {message.name &&
                        <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-muted-foreground">Name:</span>
                              <span className="text-xs font-mono font-medium">
                                {message.name}
                              </span>
                            </div>
                        }
                          {message.tool_call_function_name &&
                        <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-muted-foreground">Function:</span>
                              <span className="text-xs font-mono font-medium">
                                {message.tool_call_function_name}
                              </span>
                            </div>
                        }
                          {message.tool_call_id &&
                        <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-muted-foreground">Call ID:</span>
                              <span className="text-xs font-mono">
                                {message.tool_call_id}
                              </span>
                            </div>
                        }
                          {message.tool_call_function_arguments &&
                        <div className="mt-2">
                              <span className="text-xs font-semibold text-muted-foreground block mb-1">
                                Arguments:
                              </span>
                              <pre className="text-xs font-mono bg-background/50 dark:bg-background/30 rounded p-2 overflow-x-auto max-w-full">
                                {formatToolCallArguments(message.tool_call_function_arguments)}
                              </pre>
                            </div>
                        }
                        </div>
                      </div>
                    }
                    {message.content &&
                    <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {message.content}
                      </div>
                    }
                    <div className="text-xs text-muted-foreground mt-2">
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>);

            }

            return (
              <div
                key={`${message.spanId}-${index}`}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

                {}
                <div className="flex-shrink-0">
                  <Avatar className="h-8 w-8 bg-muted border border-border">
                    <AvatarFallback className="bg-muted">
                      {getMessageIcon(message.type)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} flex-1 max-w-[80%]`}>
                  {}
                  {!isUser &&
                  <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {getAssistantName(message)}
                      </span>
                    </div>
                  }
                  
                  {}
                  <div
                    className={`rounded-2xl px-4 py-3 ${getMessageBubbleStyles(message.type)}`}>

                    {}
                    {hasMetadata(message) &&
                    <div className="mb-3 pb-3 border-b border-border/50">
                        <div className="space-y-1.5">
                          {message.name &&
                        <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-muted-foreground">Name:</span>
                              <span className="text-xs font-mono font-medium">
                                {message.name}
                              </span>
                            </div>
                        }
                          {message.tool_call_function_name &&
                        <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-muted-foreground">Function:</span>
                              <span className="text-xs font-mono font-medium">
                                {message.tool_call_function_name}
                              </span>
                            </div>
                        }
                          {message.tool_call_id &&
                        <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-muted-foreground">Call ID:</span>
                              <span className="text-xs font-mono">
                                {message.tool_call_id}
                              </span>
                            </div>
                        }
                          {message.tool_call_function_arguments &&
                        <div className="mt-2">
                              <span className="text-xs font-semibold text-muted-foreground block mb-1">
                                Arguments:
                              </span>
                              <pre className="text-xs font-mono bg-background/50 dark:bg-background/30 rounded p-2 overflow-x-auto max-w-full">
                                {formatToolCallArguments(message.tool_call_function_arguments)}
                              </pre>
                            </div>
                        }
                        </div>
                      </div>
                    }
                    
                    {message.content &&
                    <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {message.content}
                      </div>
                    }
                  </div>
                  
                  {}
                  <span className="text-xs text-muted-foreground mt-1 px-1">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              </div>);

          })}
        </div>
      </div>
    </div>);

}