
import {
  PromptTemplate,
  InvocationParameters,
  Tools,
  ResponseFormat } from
'./prompt-types';

export interface PromptResponse {
  id: string;
  name: string;
  description: string | null;
  metadata: Record<string, unknown> | null;

  promotedVersionId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PromptVersionResponse {
  id: string;
  promptId: string;
  promptName: string;
  versionName: string | null;
  description: string | null;
  modelConfigurationId: string;
  template: PromptTemplate;
  templateType: TemplateType;
  templateFormat: TemplateFormat;
  invocationParameters: InvocationParameters;
  tools: Tools | null;
  responseFormat: ResponseFormat | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromptRequest {
  name: string;
  description?: string | null;
  sourcePromptId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface CreatePromptVersionRequest {
  versionName?: string | null;
  description?: string | null;
  modelConfigurationId: string;
  template: PromptTemplate;
  templateType: TemplateType;
  templateFormat: TemplateFormat;
  invocationParameters: InvocationParameters;
  tools?: Tools | null;
  responseFormat?: ResponseFormat | null;
}

export interface CreatePromptRequestBody {
  prompt: CreatePromptRequest;
  version: CreatePromptVersionRequest;
}

export interface UpdatePromptRequest {
  name?: string;
  description?: string | null;
}

export interface RunPromptRequest {
  promptVersion: PromptVersionResponse;
  modelConfigurationId: string;
  inputs: Record<string, unknown>;
}

export interface RunPromptResponse {
  output: string;
  modelConfigurationId: string;
  promptVersionId: string;
  inputs: Record<string, unknown>;
  metadata?: {
    tokensUsed?: number;
    executionTimeMs?: number;
  };
}

export interface LLMServiceRequest {
  model_configuration: {
    id: string;
    name: string;
    configuration: ModelConfigurationData & {
      apiKey: string;
    };
    createdAt: Date;
    updatedAt: Date;
  };
  prompt_version: PromptVersionResponse;
  inputs: Record<string, unknown>;
}

export interface LLMServiceResponse {
  output: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: {
    id: string;
    name: string;
  };
  metadata?: {
    execution_time_ms: number;
    finish_reason?: string;
  };
  tool_calls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  }>;
}

export interface Response<T> {
  data: T;
}

export interface ListResponse<T> {
  data: T[];
}


import type { ModelConfigurationData } from './model-configuration';import { TemplateFormat, TemplateType } from './enums';