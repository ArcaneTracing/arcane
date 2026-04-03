import { PromptResponse, PromptVersionResponse, CreatePromptRequestBody, InvocationParameters } from "@/types/prompts";
import { TemplateType, TemplateFormat } from "@/types/enums";
import { PromptMessage } from "@/types/prompt-types";
import type { ModelConfigurationResponse } from "@/types/model-configuration";
import { MessageBox } from "./prompt-form-initial-state";

export interface VersionContentFormState {
  messages: MessageBox[];
  modelConfigurationId: string;
  templateFormat: string;
  temperature: string;
  maxTokens: string;
  topP: string;
  customParams: Array<{key: string;value: string;}>;
  tools: Array<{id: string;content: string;}>;
  responseFormat: string;
}

type MessageLike = {role: string;content: string;};

export function messagesDiffer(
versionMessages: MessageLike[],
formMessages: MessageLike[])
: boolean {
  if (versionMessages.length !== formMessages.length) return true;
  for (let i = 0; i < versionMessages.length; i++) {
    const vm = versionMessages[i];
    const fm = formMessages[i];
    if (!fm || vm.role !== fm.role || vm.content !== fm.content) return true;
  }
  return false;
}

export function invocationParamsDiffer(
version: PromptVersionResponse,
formState: VersionContentFormState)
: boolean {
  const providerKey = version.invocationParameters?.type || 'openai';
  const versionParams = (version.invocationParameters as Record<string, unknown>)?.[providerKey] as Record<string, unknown> | undefined;
  if (!versionParams) return false;
  const t = Number.parseFloat(formState.temperature) || 0.7;
  const m = Number.parseInt(formState.maxTokens) || 1000;
  const p = Number.parseFloat(formState.topP) || 1;
  return (
    Number(versionParams.temperature) !== t ||
    Number(versionParams.max_tokens) !== m ||
    Number(versionParams.top_p) !== p);

}

export function getVersionToolsArray(version: PromptVersionResponse): unknown[] {
  if (Array.isArray(version.tools)) return version.tools;
  if (version.tools) return [version.tools];
  return [];
}


export function getToolsNestingError(tools: Array<{id: string;content: string;}>): string | null {
  for (let i = 0; i < tools.length; i++) {
    try {
      const parsed = JSON.parse(tools[i].content);
      if (
      typeof parsed === "object" &&
      parsed !== null &&
      "tools" in parsed &&
      Array.isArray(parsed.tools))
      {
        return `Tool ${i + 1}: Do not wrap tools in a "tools" key. Each tool should be a single tool object (e.g. { "functionDeclarations": [...] } or { "type": "function", "function": {...} }).`;
      }
    } catch {

    }
  }
  return null;
}

export function normalizeFormToolContent(tools: Array<{id: string;content: string;}>): string[] {
  return tools.map((t) => {
    try {
      return JSON.stringify(JSON.parse(t.content));
    } catch {
      return t.content;
    }
  });
}

export function toolsDiffer(version: PromptVersionResponse, formState: VersionContentFormState): boolean {
  const versionTools = getVersionToolsArray(version);
  const formTools = normalizeFormToolContent(formState.tools);
  if (versionTools.length !== formTools.length) return true;
  const versionToolsStr = versionTools.
  map((t) => JSON.stringify(t)).
  slice().
  sort((a, b) => a.localeCompare(b)).
  join('|');
  const formToolsStr = formTools.
  slice().
  sort((a, b) => a.localeCompare(b)).
  join('|');
  return versionToolsStr !== formToolsStr;
}

export function responseFormatDiffer(version: PromptVersionResponse, formState: VersionContentFormState): boolean {
  const versionResponseFormat = version.responseFormat ? JSON.stringify(version.responseFormat) : '';
  const formResponseFormat = formState.responseFormat?.trim() || '';
  try {
    const formParsed = formResponseFormat ? JSON.stringify(JSON.parse(formResponseFormat)) : '';
    return versionResponseFormat !== formParsed;
  } catch {
    return versionResponseFormat !== formResponseFormat;
  }
}

export function hasVersionContentChanged(
formState: VersionContentFormState,
version: PromptVersionResponse | null | undefined)
: boolean {
  if (!version) return true;
  if (version.templateType !== TemplateType.CHAT) return true;
  if (formState.modelConfigurationId !== version.modelConfigurationId) return true;
  if (formState.templateFormat !== version.templateFormat) return true;

  const versionMessages = version.template?.messages ?? [];
  const formMessages = formState.messages.
  filter((m) => m.content.trim()).
  map((m) => ({ role: m.role, content: m.content }));
  if (messagesDiffer(versionMessages, formMessages)) return true;
  if (invocationParamsDiffer(version, formState)) return true;
  if (toolsDiffer(version, formState)) return true;
  if (responseFormatDiffer(version, formState)) return true;

  return false;
}


export function buildInvocationParameters(
selectedModelConfig: ModelConfigurationResponse | null,
temperature: string,
maxTokens: string,
topP: string,
customParams: Array<{key: string;value: string;}>)
: InvocationParameters {

  const adapter = selectedModelConfig?.configuration?.adapter || 'openai';
  const providerKey = adapter;
  const providerParams: Record<string, any> = {
    temperature: Number.parseFloat(temperature) || 0.7,
    max_tokens: Number.parseInt(maxTokens) || 1000,
    top_p: Number.parseFloat(topP) || 1
  };


  customParams.forEach((param) => {
    if (param.key.trim() && param.value.trim()) {

      let parsedValue: any = param.value.trim();

      try {
        parsedValue = JSON.parse(param.value.trim());
      } catch {

        if (!Number.isNaN(Number(param.value.trim())) && param.value.trim() !== '') {
          parsedValue = Number(param.value.trim());
        } else if (param.value.trim().toLowerCase() === 'true') {
          parsedValue = true;
        } else if (param.value.trim().toLowerCase() === 'false') {
          parsedValue = false;
        }
      }
      providerParams[param.key.trim()] = parsedValue;
    }
  });

  return {
    type: providerKey,
    [providerKey]: providerParams
  };
}


export function convertMessagesToChatMessages(messages: MessageBox[]): PromptMessage[] {
  return messages.
  filter((msg) => msg.content.trim()).
  map((msg) => ({
    role: msg.role as PromptMessage['role'],
    content: msg.content
  }));
}


export function buildPromptVersionData(
messages: MessageBox[],
modelConfigurationId: string,
templateFormat: string,
selectedModelConfig: ModelConfigurationResponse | null,
temperature: string,
maxTokens: string,
topP: string,
customParams: Array<{key: string;value: string;}>,
tools: Array<{id: string;content: string;}>,
responseFormat: string)
: Omit<PromptVersionResponse, 'id' | 'promptId' | 'promptName' | 'versionName' | 'description' | 'createdAt' | 'updatedAt'> {
  const chatMessages = convertMessagesToChatMessages(messages);
  const invocationParameters = buildInvocationParameters(
    selectedModelConfig,
    temperature,
    maxTokens,
    topP,
    customParams
  );

  return {
    modelConfigurationId,
    template: {
      type: "chat" as const,
      messages: chatMessages
    },
    templateType: TemplateType.CHAT,
    templateFormat: templateFormat as any,
    invocationParameters,
    tools: tools.length > 0 ?
    tools.map((tool) => {
      try {
        return JSON.parse(tool.content);
      } catch {
        return null;
      }
    }).filter(Boolean) :
    undefined,
    responseFormat: responseFormat?.trim() ?
    (() => {
      try {
        return JSON.parse(responseFormat);
      } catch {
        return undefined;
      }
    })() :
    undefined
  };
}


export function buildCreatePromptRequest(
prompt: PromptResponse | null | undefined,
name: string,
description: string,
versionDescription: string | undefined,
messages: MessageBox[],
modelConfigurationId: string,
templateFormat: string,
selectedModelConfig: ModelConfigurationResponse | null,
temperature: string,
maxTokens: string,
topP: string,
customParams: Array<{key: string;value: string;}>,
tools: Array<{id: string;content: string;}>,
responseFormat: string)
: CreatePromptRequestBody {
  const chatMessages = convertMessagesToChatMessages(messages);
  const invocationParameters = buildInvocationParameters(
    selectedModelConfig,
    temperature,
    maxTokens,
    topP,
    customParams
  );

  return {
    prompt: {
      name: name || 'Untitled Prompt',
      description: description || undefined,
      sourcePromptId: prompt?.id || null,
      metadata: {}
    },
    version: {
      description: versionDescription || undefined,
      modelConfigurationId,
      template: {
        type: "chat",
        messages: chatMessages
      },
      templateType: TemplateType.CHAT,
      templateFormat: (templateFormat || TemplateFormat.NONE) as any,
      invocationParameters,
      tools: tools.length > 0 ?
      tools.map((tool) => {
        try {
          return JSON.parse(tool.content);
        } catch {
          return null;
        }
      }).filter(Boolean) :
      null,
      responseFormat: responseFormat ? JSON.parse(responseFormat) : null
    }
  };
}