import type { ArcaneClient } from '../client';
import type {
  DatasetListItem,
  DatasetRow,
  PaginatedDataset,
  PaginationParams,
  AddDatasetRowParams,
} from '../types';

export class DatasetsResource {
  constructor(private readonly client: ArcaneClient) {}

  async list(): Promise<DatasetListItem[]> {
    return this.client.get<DatasetListItem[]>('/api/public/datasets');
  }

  async get(
    datasetId: string,
    params?: PaginationParams
  ): Promise<PaginatedDataset> {
    const query: Record<string, string | number> = {};
    if (params?.page) query.page = params.page;
    if (params?.limit) query.limit = params.limit;
    if (params?.search) query.search = params.search;
    if (params?.sortBy) query.sortBy = params.sortBy;
    if (params?.sortOrder) query.sortOrder = params.sortOrder;
    return this.client.get<PaginatedDataset>(
      `/api/public/datasets/${datasetId}`,
      Object.keys(query).length > 0 ? query : undefined
    );
  }

  async *listRowsPaginated(
    datasetId: string,
    options?: { pageSize?: number }
  ): AsyncGenerator<DatasetRow, void, unknown> {
    const pageSize = options?.pageSize ?? 20;
    let page = 1;
    let hasNext = true;
    while (hasNext) {
      const res = await this.get(datasetId, { page, limit: pageSize });
      for (const row of res.data) {
        yield row;
      }
      hasNext = res.pagination.hasNextPage;
      page++;
    }
  }

  async addRow(
    datasetId: string,
    params: AddDatasetRowParams
  ): Promise<DatasetRow> {
    return this.client.post<DatasetRow>(
      `/api/public/datasets/${datasetId}/rows`,
      params
    );
  }
}
