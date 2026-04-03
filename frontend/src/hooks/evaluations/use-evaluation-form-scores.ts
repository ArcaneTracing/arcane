import { ScoreResponse } from "@/types/scores"
import { EvaluationResponse } from "@/types/evaluations"
import { PromptVersionResponse } from "@/types/prompts"
import { useEvaluationFormScoreVariables } from "./use-evaluation-form-score-variables"
import { useEvaluationFormScoreMappings } from "./use-evaluation-form-score-mappings"

export interface UseEvaluationFormScoresReturn {
  scoreMappings: Record<string, Record<string, string>>
  scoreVariables: Record<string, string[]>
  evaluatorPromptVersions: Record<string, PromptVersionResponse>
  customFieldValues: Record<string, Record<number, string>>
  updateScoreMapping: (scoreId: string, variable: string, value: string) => void
  handleScoreMappingFieldChange: (scoreId: string, variableIndex: number, value: string) => void
  handleScoreCustomFieldChange: (scoreId: string, variableIndex: number, value: string) => void
  getScoreMappingSelectValue: (scoreId: string, variable: string, variableIndex: number) => string
  isRagasScore: (score: ScoreResponse) => boolean
}

export function useEvaluationFormScores(
  projectId: string,
  selectedScoreIds: string[],
  scores: ScoreResponse[],
  datasetHeaders: string[],
  evaluation: EvaluationResponse | null | undefined
): UseEvaluationFormScoresReturn {
  const variablesState = useEvaluationFormScoreVariables(
    projectId,
    selectedScoreIds,
    scores,
    evaluation
  )

  const mappingsState = useEvaluationFormScoreMappings(
    selectedScoreIds,
    variablesState.scoreVariables,
    datasetHeaders,
    scores,
    evaluation,
    variablesState.isRagasScore
  )

  return {
    scoreMappings: mappingsState.scoreMappings,
    scoreVariables: variablesState.scoreVariables,
    evaluatorPromptVersions: variablesState.evaluatorPromptVersions,
    customFieldValues: mappingsState.customFieldValues,
    updateScoreMapping: mappingsState.updateScoreMapping,
    handleScoreMappingFieldChange: mappingsState.handleScoreMappingFieldChange,
    handleScoreCustomFieldChange: mappingsState.handleScoreCustomFieldChange,
    getScoreMappingSelectValue: mappingsState.getScoreMappingSelectValue,
    isRagasScore: variablesState.isRagasScore,
  }
}

