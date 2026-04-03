"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle } from
"@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CreatePromptRequestBody, PromptResponse } from "@/types/prompts";
import type { InvocationParameters } from "@/types/prompt-types";
import type { AdapterType } from "@/types/model-configuration";
import { TemplateType, TemplateFormat } from "@/types/enums";


function adapterToInvocationType(adapter: AdapterType): InvocationParameters['type'] {
  const map = {
    openai: 'openai',
    anthropic: 'anthropic',
    azure: 'azure_openai',
    bedrock: 'aws',
    'google-vertex-ai': 'google',
    'google-ai-studio': 'google'
  } satisfies Record<AdapterType, InvocationParameters['type']>;
  return map[adapter] ?? 'openai';
}
import { useCreatePrompt } from "@/hooks/prompts/use-prompts-query";
import { useModelConfigurationsQuery } from "@/hooks/model-configurations/use-model-configurations-query";
import { isForbiddenError } from "@/lib/error-handling";
import { DialogErrorHandler } from "@/components/shared/dialog-error-handler";
import { useMutationAction } from "@/hooks/shared/use-mutation-action";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export interface PromptDialogProps {
  prompt?: PromptResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  projectId?: string;
}

interface FormData {
  name: string;
  description: string;
  modelConfigurationId: string;
  templateFormat: TemplateFormat;
  systemMessage: string;
  userMessage: string;
  temperature: string;
  maxTokens: string;
  topP: string;
}

const TEMPLATE_FORMATS: TemplateFormat[] = [TemplateFormat.MUSTACHE, TemplateFormat.F_STRING, TemplateFormat.NONE];

export function PromptDialog({ prompt, open, onOpenChange, trigger, onSuccess, projectId }: Readonly<PromptDialogProps>) {
  const { data: configurations = [], error: configsError, isLoading: isLoadingConfigs } = useModelConfigurationsQuery();
  const hasConfigsPermissionError = configsError && isForbiddenError(configsError);
  const createMutation = useCreatePrompt(projectId);
  const isEditMode = !!prompt;
  const mutation = createMutation;


  const mutationAction = useMutationAction({
    mutation,
    onSuccess: () => {
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
      showSuccessToast(isEditMode ? 'Prompt updated successfully' : 'Prompt created successfully');
    },
    showErrorToast: true
  });

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    modelConfigurationId: "",
    templateFormat: TemplateFormat.MUSTACHE,
    systemMessage: "",
    userMessage: "",
    temperature: "0.7",
    maxTokens: "1000",
    topP: "1.0"
  });

  const isLoading = mutationAction.isPending;
  useEffect(() => {
    if (open && configurations.length > 0 && !formData.modelConfigurationId) {
      setFormData((prev) => ({ ...prev, modelConfigurationId: configurations[0].id }));
    }
  }, [open, configurations, formData.modelConfigurationId]);


  useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        description: "",
        modelConfigurationId: "",
        templateFormat: TemplateFormat.MUSTACHE,
        systemMessage: "",
        userMessage: "",
        temperature: "0.7",
        maxTokens: "1000",
        topP: "1.0"
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.modelConfigurationId) {
      showErrorToast('Please select a model configuration');
      return;
    }


    const selectedConfig = configurations.find((c) => c.id === formData.modelConfigurationId);
    const adapter = selectedConfig?.configuration?.adapter || 'openai';
    const invocationType = adapterToInvocationType(adapter);
    const params = {
      temperature: Number.parseFloat(formData.temperature) || 0.7,
      max_tokens: Number.parseInt(formData.maxTokens) || 1000,
      top_p: Number.parseFloat(formData.topP) || 1
    };

    const requestData: CreatePromptRequestBody = {
      prompt: {
        name: formData.name,
        description: formData.description || undefined,
        metadata: {}
      },
      version: {
        versionName: null,
        description: "Initial version",
        modelConfigurationId: formData.modelConfigurationId,
        template: {
          type: "chat",
          messages: [
          ...(formData.systemMessage ? [{
            role: "system" as const,
            content: formData.systemMessage
          }] : []),
          {
            role: "user" as const,
            content: formData.userMessage || "{{user_message}}"
          }]

        },
        templateType: TemplateType.CHAT,
        templateFormat: formData.templateFormat,
        invocationParameters: {
          type: invocationType,
          [invocationType]: params
        } as unknown as InvocationParameters,
        tools: null,
        responseFormat: null
      }
    };

    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      await createMutation.mutateAsync(requestData);

    } catch (err) {
      console.error('Error creating prompt', err);
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-[#0D0D0D] rounded-2xl shadow-lg border-0 sm:max-w-[640px] p-0 max-h-[90vh] overflow-y-auto">
        <DialogErrorHandler mutation={mutation} errorDisplayPosition="top">
          <form onSubmit={handleSubmit}>
          <DialogHeader className="px-6 pt-8 pb-6">
            <DialogTitle className="text-xl font-semibold dark:text-white">
              {isEditMode ? 'Edit Prompt' : 'Create New Prompt'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              {isEditMode ?
                'Update your prompt configuration.' :
                'Create a new prompt with an initial version.'}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium dark:text-gray-200">
                  Name *
                </Label>
                <Input
                    id="name"
                    placeholder="Enter prompt name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm"
                    disabled={isLoading}
                    required />

              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium dark:text-gray-200">
                  Description
                </Label>
                <Input
                    id="description"
                    placeholder="Enter prompt description"
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm"
                    disabled={isLoading} />

              </div>

                <div className="space-y-2">
                <Label htmlFor="modelConfiguration" className="text-sm font-medium dark:text-gray-200">
                  Model Configuration *
                  </Label>
                  <Select
                    value={formData.modelConfigurationId}
                    onValueChange={(value) => handleFieldChange('modelConfigurationId', value)}
                    disabled={isLoading || isLoadingConfigs || !!hasConfigsPermissionError}>

                  <SelectTrigger id="modelConfiguration" className="h-9">
                    <SelectValue placeholder={
                      (() => {
                        if (isLoadingConfigs) return "Loading...";
                        if (hasConfigsPermissionError) return "No permission";
                        return "Select model configuration";
                      })()
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        if (hasConfigsPermissionError) {
                          return (
                            <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                              You don't have permission to view model configurations
                            </div>);

                        }
                        if (configurations.length === 0) {
                          return (
                            <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                              No configurations available
                            </div>);

                        }
                        return configurations.map((config) =>
                        <SelectItem key={config.id} value={config.id}>
                            {config.name} ({config.configuration.modelName})
                          </SelectItem>
                        );
                      })()}
                    </SelectContent>
                  </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="templateFormat" className="text-sm font-medium dark:text-gray-200">
                  Template Format *
                </Label>
                <Select
                    value={formData.templateFormat}
                    onValueChange={(value) => handleFieldChange('templateFormat', value as TemplateFormat)}
                    disabled={isLoading}>

                  <SelectTrigger id="templateFormat" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_FORMATS.map((format) =>
                      <SelectItem key={format} value={format}>{format}</SelectItem>
                      )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemMessage" className="text-sm font-medium dark:text-gray-200">
                  System Message
                </Label>
                <Textarea
                    id="systemMessage"
                    placeholder="Enter system message (optional)"
                    value={formData.systemMessage}
                    onChange={(e) => handleFieldChange('systemMessage', e.target.value)}
                    className="w-full min-h-[80px] border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm"
                    disabled={isLoading} />

              </div>

              <div className="space-y-2">
                <Label htmlFor="userMessage" className="text-sm font-medium dark:text-gray-200">
                  User Message *
                </Label>
                <Textarea
                    id="userMessage"
                    placeholder="Enter user message template (e.g., {{user_message}})"
                    value={formData.userMessage}
                    onChange={(e) => handleFieldChange('userMessage', e.target.value)}
                    className="w-full min-h-[80px] border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm"
                    disabled={isLoading}
                    required />

              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature" className="text-sm font-medium dark:text-gray-200">
                    Temperature
                  </Label>
                  <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      placeholder="0.7"
                      value={formData.temperature}
                      onChange={(e) => handleFieldChange('temperature', e.target.value)}
                      className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm"
                      disabled={isLoading} />

                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTokens" className="text-sm font-medium dark:text-gray-200">
                    Max Tokens
                  </Label>
                  <Input
                      id="maxTokens"
                      type="number"
                      min="1"
                      placeholder="1000"
                      value={formData.maxTokens}
                      onChange={(e) => handleFieldChange('maxTokens', e.target.value)}
                      className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm"
                      disabled={isLoading} />

                </div>

                <div className="space-y-2">
                  <Label htmlFor="topP" className="text-sm font-medium dark:text-gray-200">
                    Top P
                  </Label>
                  <Input
                      id="topP"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      placeholder="1.0"
                      value={formData.topP}
                      onChange={(e) => handleFieldChange('topP', e.target.value)}
                      className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm"
                      disabled={isLoading} />

                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 px-6 py-6 mt-4">
            <Button
                type="button"
                variant="modern"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-9 px-4 text-sm font-medium"
                disabled={isLoading}>

              Cancel
            </Button>
            <Button
                type="submit"
                size="sm"
                disabled={isLoading}
                className="h-9 px-4 text-sm font-medium">

              {isLoading ?
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </> :

                'Create'
                }
            </Button>
          </div>
        </form>
        </DialogErrorHandler>
      </DialogContent>
    </Dialog>);

}