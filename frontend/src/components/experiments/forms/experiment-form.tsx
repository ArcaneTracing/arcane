"use client"

import { useEffect, useRef } from "react"
import { useExperimentForm } from "@/hooks/experiments/use-experiment-form"
import { usePromptsQuery } from "@/hooks/prompts/use-prompts-query"
import { ExperimentResponse } from "@/types/experiments"
import { FormErrorDisplay } from "@/components/shared/form-error-display"
import { ExperimentFormBasicInfo } from "./experiment-form-basic-info"
import { ExperimentFormPromptSelection } from "./experiment-form-prompt-selection"
import { ExperimentFormDatasetSelection } from "./experiment-form-dataset-selection"
import { ExperimentFormInputMappings } from "./experiment-form-input-mappings"
import { ExperimentFormActions } from "./experiment-form-actions"

export interface ExperimentFormProps {
  experiment?: ExperimentResponse | null
  projectId: string
  onSuccess?: () => void
}

export function ExperimentForm({ experiment, projectId, onSuccess }: Readonly<ExperimentFormProps>) {
  const prevPropsRef = useRef({ experiment, projectId, onSuccess })
  const renderCountRef = useRef(0)
  
  useEffect(() => {
    renderCountRef.current += 1
    prevPropsRef.current = { experiment, projectId, onSuccess }
  })
  
  useEffect(() => {
    return () => {
    }
  }, [])

  const { data: prompts = [], isLoading: loadingPrompts, error: promptsError } = usePromptsQuery(projectId)
  
  const formState = useExperimentForm(experiment, projectId, onSuccess)

  const isValid = !!formState.name.trim() && !!formState.promptVersionId && !!formState.datasetId

  return (
    <form onSubmit={formState.handleSubmit} className="space-y-6">
      <FormErrorDisplay error={formState.error} variant="default" />

      <ExperimentFormBasicInfo
        name={formState.name}
        setName={formState.setName}
        description={formState.description}
        setDescription={formState.setDescription}
        isLoading={formState.isLoading}
        isEditMode={formState.isEditMode}
      />

      <ExperimentFormPromptSelection
        prompts={prompts}
        loadingPrompts={loadingPrompts}
        selectedPromptId={formState.selectedPromptId}
        setSelectedPromptId={formState.setSelectedPromptId}
        promptVersions={formState.promptVersions}
        loadingVersions={formState.loadingVersions}
        promptVersionId={formState.promptVersionId}
        setPromptVersionId={formState.setPromptVersionId}
        isLoading={formState.isLoading}
        isEditMode={formState.isEditMode}
        promptsError={promptsError}
        versionsError={formState.versionsError}
      />

      <ExperimentFormDatasetSelection
        datasets={formState.datasets}
        loadingDatasets={formState.loadingDatasets}
        datasetId={formState.datasetId}
        setDatasetId={formState.setDatasetId}
        isLoading={formState.isLoading}
        error={formState.datasetsError}
      />

      <ExperimentFormInputMappings
        detectedVariables={formState.detectedVariables}
        datasetId={formState.datasetId}
        loadingHeaders={formState.loadingHeaders}
        inputMappings={formState.inputMappings}
        datasetHeaders={formState.datasetHeaders}
        customFieldValues={formState.customFieldValues}
        getSelectValue={formState.getSelectValue}
        handleDatasetFieldChange={formState.handleDatasetFieldChange}
        handleCustomFieldChange={formState.handleCustomFieldChange}
        updateMapping={formState.updateMapping}
      />

      <ExperimentFormActions
        isLoading={formState.isLoading}
        isValid={isValid}
      />
    </form>
  )
}
