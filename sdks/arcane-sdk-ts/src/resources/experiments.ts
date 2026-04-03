import type { ArcaneClient } from '../client';
import type {
  Experiment,
  ExperimentResult,
  PaginatedExperimentResults,
  CombinedExperimentResult,
  CreateExperimentParams,
  CreateExperimentResultParams,
  PaginationParams,
} from '../types';

export class ExperimentsResource {
  constructor(private readonly client: ArcaneClient) {}

  async list(): Promise<Experiment[]> {
    return this.client.get<Experiment[]>('/api/public/experiments');
  }

  async get(experimentId: string): Promise<Experiment> {
    return this.client.get<Experiment>(`/api/public/experiments/${experimentId}`);
  }

  async listResults(
    experimentId: string,
    params?: PaginationParams
  ): Promise<PaginatedExperimentResults> {
    const query: Record<string, string | number> = {};
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;
    if (params?.search) query.search = params.search;
    if (params?.sortBy) query.sortBy = params.sortBy;
    if (params?.sortOrder) query.sortOrder = params.sortOrder;
    return this.client.get<PaginatedExperimentResults>(
      `/api/public/experiments/${experimentId}/results`,
      Object.keys(query).length > 0 ? query : undefined
    );
  }

  async *listResultsPaginated(
    experimentId: string,
    options?: { pageSize?: number }
  ): AsyncGenerator<CombinedExperimentResult, void, unknown> {
    const pageSize = options?.pageSize ?? 20;
    let page = 1;
    let hasNext = true;
    while (hasNext) {
      const res = await this.listResults(experimentId, { page, limit: pageSize });
      for (const item of res.data) {
        yield item;
      }
      hasNext = res.pagination.hasNextPage;
      page++;
    }
  }

  async create(params: CreateExperimentParams): Promise<Experiment> {
    return this.client.post<Experiment>('/api/public/experiments', params);
  }

  async createResult(
    experimentId: string,
    params: CreateExperimentResultParams
  ): Promise<ExperimentResult> {
    return this.client.post<ExperimentResult>(
      `/api/public/experiments/${experimentId}/results`,
      params
    );
  }
}
