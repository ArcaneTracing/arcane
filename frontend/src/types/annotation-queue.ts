
import { AnnotationQueueType, AnnotationQuestionType } from './enums';

export { AnnotationQuestionType } from './enums';

export interface AnnotationQuestionResponse {
  id: string;
  question: string;
  helperText?: string;
  placeholder?: string;
  type: AnnotationQuestionType;
  options?: string[];
  min?: number;
  max?: number;
  required?: boolean;
  default?: string | number | boolean;
}

export interface AnnotationTemplateResponse {
  id: string;
  questions: AnnotationQuestionResponse[];
}

export interface AnnotationAnswerResponse {
  id: string;
  questionId: string;
  value?: string;
  numberValue?: number;
  booleanValue?: boolean;
  stringArrayValue?: string[];
}

export interface QueuedTraceResponse {
  id: string;
  otelTraceId: string;
  datasourceId: string;
  startDate?: Date;
  endDate?: Date;
}

export interface QueuedConversationResponse {
  id: string;
  otelConversationId: string;
  conversationConfigId: string;
  datasourceId: string;
  traceIds: string[];
  startDate?: Date;
  endDate?: Date;
}

export interface AnnotationResponse {
  id: string;
  otelTraceId?: string;
  datasourceId?: string;
  traceId?: string;
  conversationId?: string;
  otelConversationId?: string;
  conversationConfigId?: string;
  conversationDatasourceId?: string;
  startDate?: Date;
  endDate?: Date;
  answers: AnnotationAnswerResponse[];
}

export interface AnnotationQueueResponse {
  id: string;
  name: string;
  description?: string;
  type: string;
  templateId: string;
  annotations: AnnotationResponse[];
  tracesToBeAnnotated: QueuedTraceResponse[];
  conversationsToBeAnnotated: QueuedConversationResponse[];
}

export interface AnnotationQueueListItemResponse {
  id: string;
  name: string;
  description?: string;
  type: string;
}

export interface CreateAnnotationQuestionRequest {
  question: string;
  helperText?: string;
  placeholder?: string;
  type: AnnotationQuestionType;
  options?: string[];
  min?: number;
  max?: number;
  required?: boolean;
  default?: string | number | boolean;
}

export interface CreateAnnotationTemplateRequest {
  questions: CreateAnnotationQuestionRequest[];
}

export interface CreateAnnotationQueueRequest {
  name: string;
  description?: string;
  type?: AnnotationQueueType;
  template: CreateAnnotationTemplateRequest;
}

export interface UpdateAnnotationQueueRequest {
  name?: string;
  description?: string;
  type?: AnnotationQueueType;
  template?: CreateAnnotationTemplateRequest;
}

export interface CreateAnnotationAnswerRequest {
  questionId: string;
  value?: string;
  numberValue?: number;
  booleanValue?: boolean;
  stringArrayValue?: string[];
}

export interface CreateAnnotationRequest {

  traceId?: string;

  conversationId?: string;
  answers: CreateAnnotationAnswerRequest[];
  startDate?: string;
  endDate?: string;
}

export interface UpdateAnnotationRequest {
  answers: CreateAnnotationAnswerRequest[];
}

export interface EnqueueTraceRequest {
  otelTraceId: string;
  datasourceId: string;
  startDate?: string;
  endDate?: string;
}

export interface EnqueueConversationRequest {
  conversationConfigId: string;
  datasourceId: string;
  otelConversationId: string;
  otelTraceIds: string[];
  startDate?: string;
  endDate?: string;
}

export interface EnqueueTraceBulkRequest {
  otelTraceIds: string[];
  datasourceId: string;
  startDate?: string;
  endDate?: string;
}

export interface BulkQueueTraceResponse {
  added: QueuedTraceResponse[];
  skipped: string[];
  total: number;
  addedCount: number;
  skippedCount: number;
}

export interface MessageResponse {
  message: string;
}