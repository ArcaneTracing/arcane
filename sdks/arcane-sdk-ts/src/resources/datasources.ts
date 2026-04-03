import type { ArcaneClient } from '../client';
import type { DatasourceListItem } from '../types';

export class DatasourcesResource {
  constructor(private readonly client: ArcaneClient) {}

  async list(): Promise<DatasourceListItem[]> {
    return this.client.get<DatasourceListItem[]>('/api/public/datasources');
  }
}
