import type { ArcaneClient } from '../client';
import type { Entity } from '../types';

export class EntitiesResource {
  constructor(private readonly client: ArcaneClient) {}

  async list(): Promise<Entity[]> {
    return this.client.get<Entity[]>('/api/public/entities');
  }

  async get(entityId: string): Promise<Entity> {
    return this.client.get<Entity>(`/api/public/entities/${entityId}`);
  }
}
