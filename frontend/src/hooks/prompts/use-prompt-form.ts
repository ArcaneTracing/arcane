import { useEffect, useState, useRef } from "react";
import { PromptResponse, PromptVersionResponse } from "@/types/prompts";
import { TemplateFormat } from "@/types/enums";
import type { ModelConfigurationResponse } from "@/types/model-configuration";
import { useModelConfigurationsQuery, useModelConfigurationQuery } from "@/hooks/model-configurations/use-model-configurations-query";
import type { MessageBox } from "./prompt-form-initial-state";
import {
  applyVersionToForm,
  getDefaultFormState,
  mergeVersionConfigIntoList,
  resetFormToDefaults } from
"./prompt-form-initial-state";

export type { MessageBox } from "./prompt-form-initial-state";

export interface UsePromptFormReturn {

  name: string;
  description: string;
  templateFormat: TemplateFormat;
  modelConfigurationId: string;
  selectedModelConfig: ModelConfigurationResponse | null;


  temperature: string;
  maxTokens: string;
  topP: string;
  customParams: Array<{key: string;value: string;}>;


  messages: MessageBox[];
  responseFormat: string;
  responseFormatOpen: boolean;
  responseFormatSchemaOpen: boolean;


  tools: Array<{id: string;content: string;}>;
  toolOpenStates: Record<string, boolean>;


  output: string;
  inputValues: Record<string, string>;


  versionDialogOpen: boolean;


  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setTemplateFormat: (format: TemplateFormat) => void;
  setModelConfigurationId: (id: string) => void;
  setSelectedModelConfig: (config: ModelConfigurationResponse | null) => void;
  setTemperature: (temp: string) => void;
  setMaxTokens: (tokens: string) => void;
  setTopP: (p: string) => void;
  setCustomParams: (params: Array<{key: string;value: string;}>) => void;
  setMessages: (messages: MessageBox[]) => void;
  setResponseFormat: (format: string) => void;
  setResponseFormatOpen: (open: boolean) => void;
  setResponseFormatSchemaOpen: (open: boolean) => void;
  setTools: (tools: Array<{id: string;content: string;}>) => void;
  setToolOpenStates: (states: Record<string, boolean>) => void;
  setOutput: (output: string) => void;
  setInputValues: (values: Record<string, string>) => void;
  setVersionDialogOpen: (open: boolean) => void;


  configurations: ModelConfigurationResponse[];
  configsError?: unknown;
  isLoadingConfigs: boolean;
}

export function usePromptForm(
prompt: PromptResponse | null | undefined,
version: PromptVersionResponse | null | undefined,
projectId: string)
: UsePromptFormReturn {
  const { data: configurations = [], error: configsError, isLoading: isLoadingConfigs } = useModelConfigurationsQuery();
  const versionConfigId = version?.modelConfigurationId;
  const { data: versionConfig } = useModelConfigurationQuery(versionConfigId);
  const initializedRef = useRef<string | null>(null);

  const configurationsForSelect = mergeVersionConfigIntoList(configurations, versionConfig);
  const defaultState = getDefaultFormState();

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [templateFormat, setTemplateFormat] = useState<TemplateFormat>(TemplateFormat.NONE);
  const [modelConfigurationId, setModelConfigurationId] = useState<string>('');
  const [selectedModelConfig, setSelectedModelConfig] = useState<ModelConfigurationResponse | null>(null);
  const [temperature, setTemperature] = useState<string>(defaultState.temperature);
  const [maxTokens, setMaxTokens] = useState<string>(defaultState.maxTokens);
  const [topP, setTopP] = useState<string>(defaultState.topP);
  const [customParams, setCustomParams] = useState<Array<{key: string;value: string;}>>(defaultState.customParams);
  const [messages, setMessages] = useState<MessageBox[]>(defaultState.messages);
  const [responseFormat, setResponseFormat] = useState<string>(defaultState.responseFormat);
  const [responseFormatOpen, setResponseFormatOpen] = useState(false);
  const [responseFormatSchemaOpen, setResponseFormatSchemaOpen] = useState(true);
  const [tools, setTools] = useState<Array<{id: string;content: string;}>>(defaultState.tools);
  const [toolOpenStates, setToolOpenStates] = useState<Record<string, boolean>>(defaultState.toolOpenStates);
  const [output, setOutput] = useState<string>('');
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);


  const currentId = version?.id || prompt?.id || 'new';


  useEffect(() => {
    if (initializedRef.current === currentId) return;
    initializedRef.current = currentId;

    const setters = {
      setName, setDescription, setTemplateFormat, setModelConfigurationId,
      setSelectedModelConfig, setTemperature, setMaxTokens, setTopP,
      setCustomParams, setMessages, setResponseFormat, setResponseFormatOpen,
      setResponseFormatSchemaOpen, setTools, setToolOpenStates,
      setOutput, setInputValues, setVersionDialogOpen
    };

    if (prompt) {
      setName(prompt.name || '');
      setDescription(prompt.description || '');
    }
    if (version) {
      applyVersionToForm(version, configurations, setters);
    } else if (!prompt && !version) {
      resetFormToDefaults(setters);
    }

  }, [currentId, version]);


  const effectiveModelConfigId = modelConfigurationId || versionConfigId || '';
  useEffect(() => {
    if (!effectiveModelConfigId || selectedModelConfig?.id === effectiveModelConfigId) return;
    const config = versionConfig?.id === effectiveModelConfigId ?
    versionConfig :
    configurationsForSelect.find((c) => c.id === effectiveModelConfigId);
    if (config) {
      setSelectedModelConfig(config);
    }
  }, [configurationsForSelect, versionConfig, effectiveModelConfigId, selectedModelConfig?.id]);

  return {
    name,
    description,
    templateFormat,
    modelConfigurationId: modelConfigurationId || versionConfigId || '',
    selectedModelConfig,
    temperature,
    maxTokens,
    topP,
    customParams,
    messages,
    responseFormat,
    responseFormatOpen,
    responseFormatSchemaOpen,
    tools,
    toolOpenStates,
    output,
    inputValues,
    versionDialogOpen,
    setName,
    setDescription,
    setTemplateFormat,
    setModelConfigurationId,
    setSelectedModelConfig,
    setTemperature,
    setMaxTokens,
    setTopP,
    setCustomParams,
    setMessages,
    setResponseFormat,
    setResponseFormatOpen,
    setResponseFormatSchemaOpen,
    setTools,
    setToolOpenStates,
    setOutput,
    setInputValues,
    setVersionDialogOpen,
    configurations: configurationsForSelect,
    configsError,
    isLoadingConfigs
  };
}