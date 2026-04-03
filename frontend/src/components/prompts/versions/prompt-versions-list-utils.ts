import type { PromptVersionResponse } from '@/types/prompts'
import type { ModelConfigurationResponse } from '@/types/model-configuration'
import { modelConfigurationsApi } from '@/api/model-configurations'

export function needsModelConfigFetch(
  version: PromptVersionResponse,
  fetchedIds: Set<string>
): boolean {
  return !!(version.modelConfigurationId && !fetchedIds.has(version.modelConfigurationId))
}

export async function fetchModelConfig(
  organisationId: string,
  modelConfigurationId: string,
  onSuccess: (config: ModelConfigurationResponse) => void,
  onError: () => void,
  onFinally: () => void
): Promise<void> {
  try {
    const config = await modelConfigurationsApi.getById(organisationId, modelConfigurationId)
    onSuccess(config)
  } catch {
    onError()
  } finally {
    onFinally()
  }
}
