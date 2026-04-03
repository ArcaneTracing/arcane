"use client";

import { useState, useRef, useCallback } from "react";
import { PromptResponse, PromptVersionResponse } from "@/types/prompts";
import type { ModelConfigurationResponse } from "@/types/model-configuration";
import { usePromptForm } from "@/hooks/prompts/use-prompt-form";
import { usePromptFormActions } from "@/hooks/prompts/use-prompt-form-actions";
import { usePromptFormSubmit } from "@/hooks/prompts/use-prompt-form-submit";
import { PromptFormBasicInfo } from "./prompt-form-basic-info";
import { PromptFormModelParameters } from "./prompt-form-model-parameters";
import { PromptFormTopBar } from "./prompt-form-top-bar";
import { PromptFormMessages } from "./prompt-form-messages";
import { PromptFormActions } from "./prompt-form-actions";
import { PromptFormResponseFormat } from "./prompt-form-response-format";
import { PromptFormTools } from "./prompt-form-tools";
import { PromptFormInputs } from "./prompt-form-inputs";
import { PromptFormOutput } from "./prompt-form-output";
import { PromptFormVersionDialog } from "./prompt-form-version-dialog";
import { showErrorToast } from "@/lib/toast";

export interface PromptFormProps {
  prompt?: PromptResponse | null;
  version?: PromptVersionResponse | null;
  projectId: string;
  onSuccess?: () => void;
}

export function PromptForm({ prompt, version, projectId, onSuccess }: Readonly<PromptFormProps>) {
  const formState = usePromptForm(prompt, version, projectId);
  const [modelConfigurationError, setModelConfigurationError] = useState<string | null>(null);
  const [modelSelectOpen, setModelSelectOpen] = useState(false);
  const responseFormatRef = useRef(formState.responseFormat);
  responseFormatRef.current = formState.responseFormat;

  const setResponseFormatWithRef = useCallback((value: string) => {
    responseFormatRef.current = value;
    formState.setResponseFormat(value);
  }, [formState.setResponseFormat]);

  const getResponseFormat = useCallback(() => responseFormatRef.current, []);

  const actions = usePromptFormActions(
    formState.messages,
    formState.tools,
    formState.toolOpenStates,
    formState.setMessages,
    formState.setTools,
    formState.setToolOpenStates
  );  const submitLogic = usePromptFormSubmit({
    prompt,
    version,
    projectId,
    name: prompt?.name ?? formState.name,
    description: prompt ? prompt.description ?? '' : formState.description,
    messages: formState.messages,
    modelConfigurationId: formState.modelConfigurationId,
    templateFormat: formState.templateFormat,
    selectedModelConfig: formState.selectedModelConfig,
    temperature: formState.temperature,
    maxTokens: formState.maxTokens,
    topP: formState.topP,
    customParams: formState.customParams,
    tools: formState.tools,
    responseFormat: formState.responseFormat,
    getResponseFormat,
    inputValues: formState.inputValues,
    onSuccess
  });

  const handleSaveClick = () => {
    if (!formState.modelConfigurationId) {
      showErrorToast('Please select a model configuration');
      setModelConfigurationError('Please select a model configuration');
      setModelSelectOpen(true);
      return;
    }
    setModelConfigurationError(null);
    formState.setVersionDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSaveClick();
  };

  const handleConfirmNewVersion = async () => {
    await submitLogic.handleSubmit();
    formState.setVersionDialogOpen(false);
  };

  const handleRun = async () => {
    await submitLogic.handleRun(formState.setOutput);
  };

  const handleModelConfigChange = (id: string, config: ModelConfigurationResponse | null) => {
    formState.setModelConfigurationId(id);
    formState.setSelectedModelConfig(config);
    setModelConfigurationError(null);
    setModelSelectOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {submitLogic.error &&
      <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-2 mb-4">
          {submitLogic.error}
        </div>
      }

      {!prompt &&
      <PromptFormBasicInfo
        name={formState.name}
        description={formState.description}
        onNameChange={formState.setName}
        onDescriptionChange={formState.setDescription} />

      }

      <PromptFormModelParameters
        temperature={formState.temperature}
        maxTokens={formState.maxTokens}
        topP={formState.topP}
        customParams={formState.customParams}
        onTemperatureChange={formState.setTemperature}
        onMaxTokensChange={formState.setMaxTokens}
        onTopPChange={formState.setTopP}
        onCustomParamsChange={formState.setCustomParams} />      <PromptFormTopBar
        templateFormat={formState.templateFormat}
        modelConfigurationId={formState.modelConfigurationId}
        configurations={formState.configurations}
        isEditMode={!!prompt}
        isLoading={submitLogic.isLoading}
        isRunning={submitLogic.isRunning}
        canRun={submitLogic.canRun}
        onTemplateFormatChange={formState.setTemplateFormat}
        onModelConfigurationChange={handleModelConfigChange}
        onRun={handleRun}
        onSave={handleSaveClick}
        error={formState.configsError}
        isLoadingConfigs={formState.isLoadingConfigs}
        modelConfigurationError={modelConfigurationError ?? undefined}
        modelSelectOpen={modelSelectOpen}
        onModelSelectOpenChange={setModelSelectOpen} />      {}
      <div className="flex gap-4">
        {}
        <div className="flex-1 flex flex-col">
          <PromptFormMessages
            messages={formState.messages}
            onAddMessage={actions.addMessage}
            onRemoveMessage={actions.removeMessage}
            onUpdateMessage={actions.updateMessage}
            onCopyMessage={actions.copyMessage} />

          
          <PromptFormActions
            responseFormatOpen={formState.responseFormatOpen}
            onToggleResponseFormat={() => {
              if (formState.responseFormatOpen) {
                formState.setResponseFormatOpen(false);

              } else {
                formState.setResponseFormatOpen(true);
                formState.setResponseFormatSchemaOpen(true);
              }
            }}
            onAddTool={actions.addTool}
            onAddMessage={actions.addMessage} />          {formState.responseFormatOpen &&
          <PromptFormResponseFormat
            responseFormat={formState.responseFormat}
            isOpen={formState.responseFormatSchemaOpen}
            onFormatChange={setResponseFormatWithRef}
            onOpenChange={formState.setResponseFormatSchemaOpen}
            adapter={formState.selectedModelConfig?.configuration?.adapter} />

          }

          <PromptFormTools
            tools={formState.tools}
            toolOpenStates={formState.toolOpenStates}
            onAddTool={actions.addTool}
            onRemoveTool={actions.removeTool}
            onUpdateTool={actions.updateTool}
            onCopyTool={actions.copyTool}
            onToggleToolOpen={actions.toggleToolOpen} />

        </div>

        {}
        <div className="w-80 flex flex-col gap-4">
          <PromptFormInputs
            templateFormat={formState.templateFormat}
            messages={formState.messages}
            inputValues={formState.inputValues}
            onInputChange={(variable, value) => {
              formState.setInputValues({ ...formState.inputValues, [variable]: value });
            }} />          <PromptFormOutput output={formState.output} />
        </div>
      </div>

      <PromptFormVersionDialog
        open={formState.versionDialogOpen}
        isEditMode={!!prompt}
        isLoading={submitLogic.isLoading}
        onOpenChange={formState.setVersionDialogOpen}
        onConfirm={handleConfirmNewVersion} />

    </form>);

}