import type { ArcaneClient } from '../client';
import type { Prompt, PromptVersion } from '../types';

export class PromptsResource {
  constructor(private readonly client: ArcaneClient) {}

  async list(): Promise<Prompt[]> {
    const res = await this.client.get<{ data: Prompt[] }>('/api/public/prompts');
    return res.data;
  }

  async get(promptIdentifier: string): Promise<Prompt> {
    const res = await this.client.get<{ data: Prompt }>(
      `/api/public/prompts/${encodeURIComponent(promptIdentifier)}`
    );
    return res.data;
  }

  async listVersions(promptIdentifier: string): Promise<PromptVersion[]> {
    const res = await this.client.get<{ data: PromptVersion[] }>(
      `/api/public/prompts/${encodeURIComponent(promptIdentifier)}/versions`
    );
    return res.data;
  }

  async getLatestVersion(promptIdentifier: string): Promise<PromptVersion> {
    const res = await this.client.get<{ data: PromptVersion }>(
      `/api/public/prompts/${encodeURIComponent(promptIdentifier)}/latest`
    );
    return res.data;
  }
}
