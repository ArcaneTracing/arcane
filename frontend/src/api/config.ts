import api from './api';

export interface ConfigResponse {
  features: {enterprise: boolean;};
  oktaEnabled: boolean;
}

export async function getConfig(signal?: AbortSignal): Promise<ConfigResponse> {
  const { data } = await api.get<ConfigResponse>('/v1/config', { signal });
  return data;
}