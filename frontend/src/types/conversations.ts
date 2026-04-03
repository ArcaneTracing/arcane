
import { TempoTraceResponse } from './traces';

export interface ConversationListItemResponse {
  conversationId: string;
  name: string;
  traceIds: string[];
  traceCount: number;
}

export interface ConversationResponse {
  conversations: ConversationListItemResponse[];
}

export interface FullConversationResponse {
  traces: TempoTraceResponse[];
}

export interface GetConversationsRequest {
  start?: string;
  end?: string;
}

export interface GetFullConversationRequest {
  start?: string;
  end?: string;
  value: string;
}

export interface GetConversationsByTracesRequest {
  traceIds: string[];
  startDate?: string;
  endDate?: string;
}