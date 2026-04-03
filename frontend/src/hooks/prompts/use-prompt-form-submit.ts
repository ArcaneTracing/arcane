import { useNavigate } from "@tanstack/react-router";
import { AxiosError } from "axios";
import { PromptResponse, PromptVersionResponse } from "@/types/prompts";
import type { ModelConfigurationResponse } from "@/types/model-configuration";
import { useCreatePrompt, useUpdatePrompt } from "@/hooks/prompts/use-prompts-query";
import { useMutation } from "@tanstack/react-query";
import { promptsApi } from "@/api/prompts";
import { buildCreatePromptRequest, buildPromptVersionData, getToolsNestingError } from "./use-prompt-form-utils";
import { MessageBox } from "./use-prompt-form";
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation";
import { showErrorToast } from "@/lib/toast";

function extractRunErrorMessage(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data) {
    const data = err.response.data as Record<string, unknown>;
    if (typeof data.message === 'string') return data.message;
    if (typeof data.error === 'string') return data.error;
    if (typeof data.detail === 'string') return data.detail;
  }
  return err instanceof Error ? err.message : 'Failed to run prompt';
}

export interface UsePromptFormSubmitParams {
  prompt: PromptResponse | null | undefined;
  version: PromptVersionResponse | null | undefined;
  projectId: string;
  name: string;
  description: string;
  messages: MessageBox[];
  modelConfigurationId: string;
  templateFormat: string;
  selectedModelConfig: ModelConfigurationResponse | null;
  temperature: string;
  maxTokens: string;
  topP: string;
  customParams: Array<{key: string;value: string;}>;
  tools: Array<{id: string;content: string;}>;
  responseFormat: string;

  getResponseFormat?: () => string;
  inputValues: Record<string, string>;
  onSuccess?: () => void | Promise<void>;
}

export function usePromptFormSubmit(params: UsePromptFormSubmitParams) {
  const navigate = useNavigate();
  const organisationId = useOrganisationIdOrNull();
  const {
    prompt,
    projectId,
    name,
    description,
    messages,
    modelConfigurationId,
    templateFormat,
    selectedModelConfig,
    temperature,
    maxTokens,
    topP,
    customParams,
    tools,
    responseFormat,
    getResponseFormat,
    inputValues,
    onSuccess
  } = params;

  const createMutation = useCreatePrompt(projectId);
  const updateMutation = useUpdatePrompt(projectId);
  const runMutation = useMutation({
    mutationFn: ({
      data


    }: {data: {promptVersion: Omit<PromptVersionResponse, 'id' | 'promptId' | 'promptName' | 'versionName' | 'description' | 'createdAt' | 'updatedAt'>;modelConfigurationId: string;inputs: Record<string, unknown>;};}) => {
      if (!organisationId) {
        throw new Error('Organisation ID is required');
      }
      return promptsApi.run(organisationId, projectId, data);
    }
  });

  const isEditMode = !!prompt;
  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error?.message || updateMutation.error?.message || runMutation.error?.message || null;

  const handleSubmit = async () => {

    if (!modelConfigurationId) {
      showErrorToast('Please select a model configuration');
      return;
    }

    const toolsNestingError = getToolsNestingError(tools);
    if (toolsNestingError) {
      showErrorToast(toolsNestingError);
      return;
    }

    const versionDescription = isEditMode ? "New version" : "Initial version";
    const requestData = buildCreatePromptRequest(
      prompt,
      name,
      description,
      versionDescription,
      messages,
      modelConfigurationId,
      templateFormat,
      selectedModelConfig,
      temperature,
      maxTokens,
      topP,
      customParams,
      tools,
      responseFormat
    );

    try {

      if (isEditMode && prompt && (name !== prompt.name || description !== (prompt.description || ''))) {
        await updateMutation.mutateAsync({
          id: prompt.id,
          data: {
            name: name || prompt.name,
            description: description || undefined
          }
        });
      }


      await createMutation.mutateAsync(requestData);
      if (onSuccess) {
        await onSuccess();
      } else {
        navigate({ to: "/organisations/$organisationId/projects/$projectId/prompts", params: { organisationId: organisationId!, projectId } });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRun = async (setOutput: (output: string) => void) => {

    if (!modelConfigurationId) {
      setOutput('Error: Please select a model configuration');
      return;
    }

    const toolsNestingError = getToolsNestingError(tools);
    if (toolsNestingError) {
      setOutput(`Error: ${toolsNestingError}`);
      return;
    }


    const responseFormatValue = getResponseFormat?.() ?? responseFormat;
    if (responseFormatValue?.trim()) {
      try {
        JSON.parse(responseFormatValue);
      } catch {
        setOutput('Error: Invalid JSON in Response Format. Please check your schema (e.g. no trailing commas).');
        return;
      }
    }

    try {
      setOutput('Running...');


      const promptVersionData = buildPromptVersionData(
        messages,
        modelConfigurationId,
        templateFormat,
        selectedModelConfig,
        temperature,
        maxTokens,
        topP,
        customParams,
        tools,
        responseFormatValue
      );

      const result = await runMutation.mutateAsync({
        data: {
          promptVersion: promptVersionData,
          modelConfigurationId,
          inputs: inputValues
        }
      });


      if (typeof result === 'string') {
        setOutput(result);
      } else if (result && typeof result === 'object') {

        if (result.content) {
          setOutput(result.content);
        } else if (result.message) {
          setOutput(result.message);
        } else if (result.text) {
          setOutput(result.text);
        } else {

          setOutput(JSON.stringify(result, null, 2));
        }
      } else {
        setOutput(String(result));
      }
    } catch (err) {
      const errorMessage = extractRunErrorMessage(err);
      setOutput(`Error: ${errorMessage}`);
    }
  };

  return {
    handleSubmit,
    handleRun,
    isLoading,
    error,
    isRunning: runMutation.isPending,
    canRun: !!modelConfigurationId
  };
}