"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger } from
"@/components/ui/dialog";
import { useCreateModelConfiguration, useUpdateModelConfiguration } from "@/hooks/model-configurations/use-model-configurations-query";
import { ModelConfigurationResponse } from "@/types/model-configuration";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useModelConfigurationForm } from "@/hooks/model-configurations/use-model-configuration-form";
import { buildConfigurationRequest, validateConfiguration } from "@/hooks/model-configurations/use-model-configuration-form-submit";
import { ModelConfigurationFormBasicFields } from "./model-configuration-form-basic-fields";
import { ModelConfigurationFormCostFields } from "./model-configuration-form-cost-fields";
import { ModelConfigurationFormParameters } from "./model-configuration-form-parameters";
import { ModelConfigurationFormStopSequences } from "./model-configuration-form-stop-sequences";
import { ModelConfigurationFormProviderConfigs } from "./model-configuration-form-provider-configs";
import { DialogErrorHandler } from "@/components/shared/dialog-error-handler";
import { useMutationAction } from "@/hooks/shared/use-mutation-action";
import { showSuccessToast } from "@/lib/toast";

export interface ModelConfigurationDialogProps {
  configuration?: ModelConfigurationResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function ModelConfigurationDialog({ configuration, open, onOpenChange, trigger }: Readonly<ModelConfigurationDialogProps>) {
  const createMutation = useCreateModelConfiguration();
  const updateMutation = useUpdateModelConfiguration();
  const mutation = configuration ? updateMutation : createMutation;
  const isEditMode = !!configuration;


  useMutationAction({
    mutation,
    onSuccess: () => {
      onOpenChange(false);
      showSuccessToast(isEditMode ? 'Model configuration updated successfully' : 'Model configuration created successfully');
    },
    showErrorToast: true
  });

  const isCreateLoading = createMutation.isPending;
  const isUpdateLoading = updateMutation.isPending;

  const formState = useModelConfigurationForm(configuration, open);
  const isLoading = isCreateLoading || isUpdateLoading;

  const handleAddStopSequence = () => {
    formState.setStopSequences([...formState.stopSequences, ""]);
  };

  const handleRemoveStopSequence = (index: number) => {
    formState.setStopSequences(formState.stopSequences.filter((_, i) => i !== index));
  };

  const handleStopSequenceChange = (index: number, value: string) => {
    const newSequences = [...formState.stopSequences];
    newSequences[index] = value;
    formState.setStopSequences(newSequences);
  };

  const handleProviderFieldChange = (field: keyof typeof formState, value: string) => {
    switch (field) {
      case 'azureEndpoint':
        formState.setAzureEndpoint(value);
        break;
      case 'azureApiVersion':
        formState.setAzureApiVersion(value);
        break;
      case 'azureDeploymentName':
        formState.setAzureDeploymentName(value);
        break;
      case 'anthropicBaseUrl':
        formState.setAnthropicBaseUrl(value);
        break;
      case 'anthropicTimeout':
        formState.setAnthropicTimeout(value);
        break;
      case 'bedrockRegion':
        formState.setBedrockRegion(value);
        break;
      case 'bedrockEndpointUrl':
        formState.setBedrockEndpointUrl(value);
        break;
      case 'bedrockAwsAccessKeyId':
        formState.setBedrockAwsAccessKeyId(value);
        break;
      case 'bedrockAwsSecretAccessKey':
        formState.setBedrockAwsSecretAccessKey(value);
        break;
      case 'vertexProject':
        formState.setVertexProject(value);
        break;
      case 'vertexLocation':
        formState.setVertexLocation(value);
        break;
      case 'studioProject':
        formState.setStudioProject(value);
        break;
      case 'studioBaseUrl':
        formState.setStudioBaseUrl(value);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    formState.setError(null);

    const validationError = validateConfiguration({ ...formState, isEditMode });
    if (validationError) {
      formState.setError(validationError);
      return;
    }

    try {
      const data = buildConfigurationRequest({ ...formState, isEditMode });

      if (isEditMode) {
        if (!configuration) return;
        await updateMutation.mutateAsync({ id: configuration.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="bg-white dark:bg-[#0D0D0D] rounded-2xl shadow-lg border-0 sm:max-w-[800px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogErrorHandler mutation={mutation} errorDisplayPosition="top">
          <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Edit Model Configuration" : "Create Model Configuration"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0">
              {formState.error &&
              <Alert variant="destructive">
                  <AlertDescription>{formState.error}</AlertDescription>
                </Alert>
              }

            <ModelConfigurationFormBasicFields
                name={formState.name}
                adapter={formState.adapter}
                modelName={formState.modelName}
                apiKey={formState.apiKey}
                isEditMode={isEditMode}
                isLoading={isLoading}
                onNameChange={formState.setName}
                onAdapterChange={formState.setAdapter}
                onModelNameChange={formState.setModelName}
                onApiKeyChange={formState.setApiKey} />


            <ModelConfigurationFormCostFields
                inputCostPerToken={formState.inputCostPerToken}
                outputCostPerToken={formState.outputCostPerToken}
                isLoading={isLoading}
                onInputCostChange={formState.setInputCostPerToken}
                onOutputCostChange={formState.setOutputCostPerToken} />


            <ModelConfigurationFormParameters
                temperature={formState.temperature}
                maxTokens={formState.maxTokens}
                topP={formState.topP}
                frequencyPenalty={formState.frequencyPenalty}
                presencePenalty={formState.presencePenalty}
                isLoading={isLoading}
                onTemperatureChange={formState.setTemperature}
                onMaxTokensChange={formState.setMaxTokens}
                onTopPChange={formState.setTopP}
                onFrequencyPenaltyChange={formState.setFrequencyPenalty}
                onPresencePenaltyChange={formState.setPresencePenalty} />


            <ModelConfigurationFormStopSequences
                stopSequences={formState.stopSequences}
                isLoading={isLoading}
                onAdd={handleAddStopSequence}
                onRemove={handleRemoveStopSequence}
                onChange={handleStopSequenceChange} />


            <ModelConfigurationFormProviderConfigs
                adapter={formState.adapter}
                formState={formState}
                isLoading={isLoading}
                isEditMode={isEditMode}
                onFieldChange={handleProviderFieldChange} />

          </div>

          <DialogFooter>
            <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}>

              Cancel
            </Button>
            <Button
                type="submit"
                disabled={
                isLoading ||
                !formState.name.trim() ||
                !formState.modelName.trim() ||
                formState.adapter !== "bedrock" &&
                !formState.apiKey.trim() &&
                !isEditMode
                }>

              {(() => {
                  if (isLoading) return "Saving...";
                  if (isEditMode) return "Save Changes";
                  return "Create Configuration";
                })()}
            </Button>
          </DialogFooter>
        </form>
        </DialogErrorHandler>
      </DialogContent>
    </Dialog>);

}