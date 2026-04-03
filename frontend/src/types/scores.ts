
import { ScoringType } from './enums';
export type UserScoringType = Exclude<ScoringType, ScoringType.RAGAS>;

export interface ScaleOption {
  label: string;
  value: number;
}

export interface OrdinalConfig {
  acceptable_set?: string[];
  threshold_rank?: number;
}

export interface ScoreEvaluatorResponse {
  id: string;
  name?: string | null;
}

export interface ScoreResponse {
  id: string;
  projectId: string | null;
  name: string;
  description: string | null;
  scoringType: ScoringType;
  scale?: ScaleOption[] | null;
  ordinalConfig?: OrdinalConfig | null;

  evaluatorPrompt?: ScoreEvaluatorResponse | null;
  ragasScoreKey?: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface CreateScoreRequest {
  name: string;
  description?: string;
  scoringType: ScoringType;
  scale?: ScaleOption[];
  ordinalConfig?: OrdinalConfig;
  evaluatorPromptId?: string;
}

export interface UpdateScoreRequest {
  name?: string;
  description?: string;
  scale?: ScaleOption[];
  ordinalConfig?: OrdinalConfig | null;
  evaluatorPromptId?: string | null;
}