import type { ArcaneClient } from '../client';
import type {
  Evaluation,
  EvaluationResult,
  ExperimentScores,
  CreateEvaluationParams,
  CreateEvaluationResultParams,
  PendingScoreResult,
  ImportScoreResultRow,
  ImportScoreResultsResponse,
  ListPendingScoreResultsOptions,
} from '../types';

export class EvaluationsResource {
  constructor(private readonly client: ArcaneClient) {}

  async list(): Promise<Evaluation[]> {
    return this.client.get<Evaluation[]>('/api/public/evaluations');
  }

  async get(evaluationId: string): Promise<Evaluation> {
    return this.client.get<Evaluation>(`/api/public/evaluations/${evaluationId}`);
  }

  async getExperimentScores(
    evaluationId: string,
    experimentId: string
  ): Promise<ExperimentScores> {
    return this.client.get<ExperimentScores>(
      `/api/public/evaluations/${evaluationId}/experiments/${experimentId}/scores`
    );
  }

  async create(params: CreateEvaluationParams): Promise<Evaluation> {
    return this.client.post<Evaluation>('/api/public/evaluations', params);
  }

  async createResult(
    evaluationId: string,
    params: CreateEvaluationResultParams
  ): Promise<EvaluationResult> {
    return this.client.post<EvaluationResult>(
      `/api/public/evaluations/${evaluationId}/results`,
      params
    );
  }

  async listPendingScoreResults(
    evaluationId: string,
    scoreId: string,
    options: ListPendingScoreResultsOptions = {}
  ): Promise<{ data: PendingScoreResult[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean } }> {
    const params: Record<string, string | number> = {};
    if (options.experimentId) params.experimentId = options.experimentId;
    if (options.page != null) params.page = options.page;
    if (options.limit != null) params.limit = options.limit;
    return this.client.get(
      `/api/public/evaluations/${evaluationId}/scores/${scoreId}/pending-results`,
      params
    );
  }

  async *listPendingScoreResultsIterator(
    evaluationId: string,
    scoreId: string,
    options: Omit<ListPendingScoreResultsOptions, 'page'> = {}
  ): AsyncGenerator<PendingScoreResult> {
    const limit = options.limit ?? 100;
    let page = 1;
    let hasNext = true;
    while (hasNext) {
      const res = await this.listPendingScoreResults(evaluationId, scoreId, {
        ...options,
        page,
        limit,
      });
      for (const item of res.data) {
        yield item;
      }
      hasNext = res.pagination.hasNextPage;
      page++;
    }
  }

  async importScoreResults(
    evaluationId: string,
    scoreId: string,
    results: ImportScoreResultRow[]
  ): Promise<ImportScoreResultsResponse> {
    return this.client.post<ImportScoreResultsResponse>(
      `/api/public/evaluations/${evaluationId}/scores/${scoreId}/import-results`,
      { results }
    );
  }
}
