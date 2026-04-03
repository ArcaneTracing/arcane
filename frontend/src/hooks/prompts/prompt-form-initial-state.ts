import { PromptVersionResponse } from "@/types/prompts";
import { TemplateFormat } from "@/types/enums";
import { extractMessageContent } from "@/lib/prompt-utils";
import type { ModelConfigurationResponse } from "@/types/model-configuration";
import { safeStringify } from "@/lib/utils";

export interface MessageBox {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface InvocationParamsFromVersion {
  temperature: string;
  maxTokens: string;
  topP: string;
  customParams: Array<{key: string;value: string;}>;
}

const STANDARD_PARAMS = new Set(['temperature', 'max_tokens', 'top_p']);

function toParamString(value: unknown): string {
  if (value === undefined) return '';
  if (value === null) return 'null';
  return safeStringify(value);
}
export function extractInvocationParamsFromVersion(
invocationParameters: PromptVersionResponse['invocationParameters'] | null | undefined)
: InvocationParamsFromVersion {
  const result: InvocationParamsFromVersion = {
    temperature: '0.7',
    maxTokens: '1000',
    topP: '1.0',
    customParams: []
  };
  if (!invocationParameters) return result;

  const providerKey = (invocationParameters as Record<string, unknown>).type || 'openai';
  const params = (invocationParameters as Record<string, unknown>)[providerKey] as Record<string, unknown> | undefined;
  if (!params) return result;

  if (params.temperature !== undefined) result.temperature = toParamString(params.temperature);
  if (params.max_tokens !== undefined) result.maxTokens = toParamString(params.max_tokens);
  if (params.top_p !== undefined) result.topP = toParamString(params.top_p);

  const customParamsList: Array<{key: string;value: string;}> = [];
  Object.keys(params).forEach((key) => {
    if (!STANDARD_PARAMS.has(key)) {
      const value = params[key];
      customParamsList.push({ key, value: toParamString(value) });
    }
  });

  const topLevelCustom: Array<{key: string;value: string;}> = [];
  Object.keys(invocationParameters as Record<string, unknown>).forEach((key) => {
    if (key !== 'type' && key !== providerKey) {
      const value = (invocationParameters as Record<string, unknown>)[key];
      topLevelCustom.push({ key, value: toParamString(value) });
    }
  });

  result.customParams = [...customParamsList, ...topLevelCustom];
  return result;
}
export function extractMessagesFromVersion(
version: PromptVersionResponse | null | undefined)
: MessageBox[] {
  const messages = version?.template && 'messages' in version.template ? version.template.messages : [];
  if (!messages?.length) return [];

  return messages.
  filter((msg: {role?: string;}) => msg.role !== 'tool').
  map((msg: {role?: string;content?: unknown;}, index: number) => ({
    id: String(index + 1),
    role: (msg.role ?? 'user') as 'system' | 'user' | 'assistant',
    content: extractMessageContent(msg.content)
  }));
}
export function extractToolsFromVersion(
version: PromptVersionResponse | null | undefined)
: {tools: Array<{id: string;content: string;}>;toolOpenStates: Record<string, boolean>;} {
  const toolsRaw = version?.tools;
  if (!toolsRaw) return { tools: [], toolOpenStates: {} };

  const toolsArray = Array.isArray(toolsRaw) ? toolsRaw : [toolsRaw];
  const tools = toolsArray.map((tool, index) => ({
    id: String(index + 1),
    content: JSON.stringify(tool, null, 2)
  }));
  const toolOpenStates: Record<string, boolean> = {};
  tools.forEach((t) => {
    toolOpenStates[t.id] = true;
  });
  return { tools, toolOpenStates };
}
export function getDefaultFormState(): {
  temperature: string;
  maxTokens: string;
  topP: string;
  customParams: Array<{key: string;value: string;}>;
  messages: MessageBox[];
  responseFormat: string;
  tools: Array<{id: string;content: string;}>;
  toolOpenStates: Record<string, boolean>;
} {
  return {
    temperature: '0.7',
    maxTokens: '1000',
    topP: '1.0',
    customParams: [],
    messages: [
    { id: '1', role: 'system', content: 'You are a chatbot' },
    { id: '2', role: 'user', content: '' }],

    responseFormat: '',
    tools: [],
    toolOpenStates: {}
  };
}

export interface PromptFormSetters {
  setName: (v: string) => void;
  setDescription: (v: string) => void;
  setTemplateFormat: (v: TemplateFormat) => void;
  setModelConfigurationId: (v: string) => void;
  setSelectedModelConfig: (v: ModelConfigurationResponse | null) => void;
  setTemperature: (v: string) => void;
  setMaxTokens: (v: string) => void;
  setTopP: (v: string) => void;
  setCustomParams: (v: Array<{key: string;value: string;}>) => void;
  setMessages: (v: MessageBox[]) => void;
  setResponseFormat: (v: string) => void;
  setResponseFormatOpen: (v: boolean) => void;
  setResponseFormatSchemaOpen: (v: boolean) => void;
  setTools: (v: Array<{id: string;content: string;}>) => void;
  setToolOpenStates: (v: Record<string, boolean>) => void;
  setOutput: (v: string) => void;
  setInputValues: (v: Record<string, string>) => void;
  setVersionDialogOpen: (v: boolean) => void;
}

export function applyVersionToForm(
version: PromptVersionResponse,
configurations: ModelConfigurationResponse[],
setters: PromptFormSetters)
: void {
  setters.setModelConfigurationId(version.modelConfigurationId);
  setters.setTemplateFormat(version.templateFormat ?? TemplateFormat.NONE);
  const invocationParams = extractInvocationParamsFromVersion(version.invocationParameters);
  setters.setTemperature(invocationParams.temperature);
  setters.setMaxTokens(invocationParams.maxTokens);
  setters.setTopP(invocationParams.topP);
  if (invocationParams.customParams.length > 0) setters.setCustomParams(invocationParams.customParams);
  if (!version.modelConfigurationId && configurations.length > 0) {
    setters.setModelConfigurationId(configurations[0].id);
    setters.setSelectedModelConfig(configurations[0]);
  }
  const versionMessages = extractMessagesFromVersion(version);
  if (versionMessages.length > 0) setters.setMessages(versionMessages);
  const { tools: versionTools, toolOpenStates: versionToolStates } = extractToolsFromVersion(version);
  if (versionTools.length > 0) {
    setters.setTools(versionTools);
    setters.setToolOpenStates(versionToolStates);
  }
  if (version.responseFormat) {
    setters.setResponseFormat(JSON.stringify(version.responseFormat, null, 2));
    setters.setResponseFormatOpen(true);
    setters.setResponseFormatSchemaOpen(true);
  }
}

export function resetFormToDefaults(setters: PromptFormSetters): void {
  const defaults = getDefaultFormState();
  setters.setName('');
  setters.setDescription('');
  setters.setTemplateFormat(TemplateFormat.NONE);
  setters.setModelConfigurationId('');
  setters.setSelectedModelConfig(null);
  setters.setTemperature(defaults.temperature);
  setters.setMaxTokens(defaults.maxTokens);
  setters.setTopP(defaults.topP);
  setters.setCustomParams(defaults.customParams);
  setters.setMessages(defaults.messages);
  setters.setResponseFormat(defaults.responseFormat);
  setters.setResponseFormatOpen(false);
  setters.setResponseFormatSchemaOpen(true);
  setters.setTools(defaults.tools);
  setters.setToolOpenStates(defaults.toolOpenStates);
  setters.setOutput('');
  setters.setInputValues({});
  setters.setVersionDialogOpen(false);
}
export function mergeVersionConfigIntoList(
configurations: ModelConfigurationResponse[],
versionConfig: ModelConfigurationResponse | undefined)
: ModelConfigurationResponse[] {
  if (!versionConfig || configurations.some((c) => c.id === versionConfig.id)) {
    return configurations;
  }
  return [versionConfig, ...configurations];
}