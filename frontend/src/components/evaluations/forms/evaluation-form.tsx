"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { EvaluationResponse } from "@/types/evaluations";
import { useCreateEvaluation } from "@/hooks/evaluations/use-evaluations-query";
import { useModelConfigurationsQuery } from "@/hooks/model-configurations/use-model-configurations-query";
import { EvaluationFormBasicInfo } from "./evaluation-form-basic-info";
import { EvaluationFormScopeSelection } from "./evaluation-form-scope-selection";
import { EvaluationFormDatasetSelection } from "./evaluation-form-dataset-selection";
import { EvaluationFormExperimentSelection } from "./evaluation-form-experiment-selection";
import { EvaluationFormScoreSelection } from "./evaluation-form-score-selection";
import { EvaluationFormRagasConfig } from "./evaluation-form-ragas-config";
import { EvaluationFormScoreMappings } from "./evaluation-form-score-mappings";
import { useEvaluationForm } from "@/hooks/evaluations/use-evaluation-form";
import { buildEvaluationRequest } from "@/hooks/evaluations/use-evaluation-form-submit";
import { useMutationAction } from "@/hooks/shared/use-mutation-action";
import { showSuccessToast } from "@/lib/toast";
import { FormErrorDisplay } from "@/components/shared/form-error-display";

export interface EvaluationFormProps {
  evaluation?: EvaluationResponse | null;
  projectId: string;
  onSuccess?: () => void;

  footerEl?: HTMLDivElement | null;
}

const EVALUATION_FORM_ID = "evaluation-form";

export function EvaluationForm({ evaluation, projectId, onSuccess, footerEl }: Readonly<EvaluationFormProps>) {
  const formState = useEvaluationForm(evaluation, projectId);
  const { data: configurations = [], isLoading: loadingModelConfigurations, error: configsError } = useModelConfigurationsQuery();
  const createMutation = useCreateEvaluation(projectId);


  const mutationAction = useMutationAction({
    mutation: createMutation,
    onSuccess: () => {
      if (onSuccess) {
        onSuccess();
      }
      showSuccessToast('Evaluation created successfully');
    },
    showErrorToast: true
  });

  const isLoading = mutationAction.isPending;
  const isEditMode = !!evaluation;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const requestData = buildEvaluationRequest({
        name: formState.name,
        description: formState.description,
        evaluationType: formState.evaluationType,
        evaluationScope: formState.evaluationScope,
        selectedScoreIds: formState.selectedScoreIds,
        datasetId: formState.datasetId,
        selectedExperimentIds: formState.selectedExperimentIds,
        scoreMappings: formState.scoreMappings,
        ragasModelConfigurationId: formState.ragasModelConfigurationId,
        scores: formState.scores,
        isRagasScore: formState.isRagasScore,
        experimentDatasetError: formState.experimentDatasetError
      });

      await createMutation.mutateAsync(requestData);

    } catch (err) {
      console.error(err);
    }
  };

  const submitButton =
  <div className="flex justify-end">
      <Button
      type="submit"
      form={EVALUATION_FORM_ID}
      disabled={isLoading || isEditMode}>

        {isLoading ?
      <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </> :

      'Create Evaluation'
      }
      </Button>
    </div>;


  return (
    <form id={EVALUATION_FORM_ID} onSubmit={handleSubmit} className="space-y-6">
      <FormErrorDisplay error={mutationAction.errorMessage} variant="default" />

      <EvaluationFormBasicInfo
        name={formState.name}
        description={formState.description}
        onNameChange={formState.setName}
        onDescriptionChange={formState.setDescription}
        isLoading={isLoading}
        isEditMode={isEditMode} />


      <EvaluationFormScopeSelection
        evaluationScope={formState.evaluationScope}
        onScopeChange={formState.setEvaluationScope}
        onScopeReset={formState.handleScopeReset}
        isLoading={isLoading}
        isEditMode={isEditMode} />


      {formState.evaluationScope === 'DATASET' &&
      <EvaluationFormDatasetSelection
        datasetId={formState.datasetId}
        datasets={formState.datasets}
        loadingDatasets={formState.loadingDatasets}
        onDatasetChange={formState.setDatasetId}
        isLoading={isLoading}
        isEditMode={isEditMode}
        error={formState.datasetsError} />

      }

      {formState.evaluationScope === 'EXPERIMENT' &&
      <EvaluationFormExperimentSelection
        selectedExperimentIds={formState.selectedExperimentIds}
        experiments={formState.experiments}
        loadingExperiments={formState.loadingExperiments}
        experimentDatasetError={formState.experimentDatasetError}
        onExperimentAdd={(id) => formState.setSelectedExperimentIds([...formState.selectedExperimentIds, id])}
        onExperimentRemove={(id) => formState.setSelectedExperimentIds(formState.selectedExperimentIds.filter((expId) => expId !== id))}
        isLoading={isLoading}
        isEditMode={isEditMode}
        error={formState.experimentsError} />

      }

      <EvaluationFormScoreSelection
        selectedScoreIds={formState.selectedScoreIds}
        scores={formState.scores}
        loadingScores={formState.loadingScores}
        isRagasScore={formState.isRagasScore}
        onScoreAdd={(id) => formState.setSelectedScoreIds([...formState.selectedScoreIds, id])}
        onScoreRemove={(id) => formState.setSelectedScoreIds(formState.selectedScoreIds.filter((scoreId) => scoreId !== id))}
        isLoading={isLoading}
        isEditMode={isEditMode}
        error={formState.scoresError} />


      {formState.selectedScoreIds.some((id) => {
        const score = formState.scores.find((s) => s.id === id);
        return score && formState.isRagasScore(score);
      }) &&
      <EvaluationFormRagasConfig
        ragasModelConfigurationId={formState.ragasModelConfigurationId}
        configurations={configurations}
        loadingModelConfigurations={loadingModelConfigurations}
        onConfigurationChange={formState.setRagasModelConfigurationId}
        isLoading={isLoading}
        isEditMode={isEditMode}
        error={configsError} />

      }

      <EvaluationFormScoreMappings
        selectedScoreIds={formState.selectedScoreIds}
        scores={formState.scores}
        scoreVariables={formState.scoreVariables}
        scoreMappings={formState.scoreMappings}
        customFieldValues={formState.customFieldValues}
        datasetHeaders={formState.datasetHeaders}
        loadingHeaders={formState.loadingHeaders}
        evaluationScope={formState.evaluationScope}
        datasetId={formState.datasetId}
        selectedExperimentIds={formState.selectedExperimentIds}
        isRagasScore={formState.isRagasScore}
        getScoreMappingSelectValue={formState.getScoreMappingSelectValue}
        onScoreMappingFieldChange={formState.handleScoreMappingFieldChange}
        onScoreCustomFieldChange={formState.handleScoreCustomFieldChange}
        onScoreMappingUpdate={formState.updateScoreMapping}
        isLoading={isLoading}
        isEditMode={isEditMode} />


      {footerEl ? createPortal(submitButton, footerEl) :
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-[#2A2A2A]">
          {submitButton}
        </div>
      }
    </form>);

}