import api from './api';

export interface SetupStatusResponse {
  shouldSetup: boolean;
}

export async function checkSetupStatus(signal?: AbortSignal): Promise<SetupStatusResponse> {
  const { data } = await api.get<SetupStatusResponse>('/setup', {
    signal,

    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
  return data;
}