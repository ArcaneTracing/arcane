type FetchParams = {
  organisationId: string
  projectId: string
  datasourceId: string
  traceIds: string[]
  conversationConfigId: string
  conversationId: string
  startDate?: string
  endDate?: string
}

type FetchFns = {
  fetchConversationByTraces: (params: {
    organisationId: string
    projectId: string
    datasourceId: string
    traceIds: string[]
    start?: string
    end?: string
  }) => Promise<void>
  fetchFullConversation: (params: {
    organisationId: string
    projectId: string
    datasourceId: string
    conversationConfigId: string
    value: string
    start: string
    end: string
  }) => Promise<void>
}

async function tryFetchByTracesWithFallback(
  params: FetchParams,
  fns: FetchFns
): Promise<void> {
  try {
    await fns.fetchConversationByTraces({
      organisationId: params.organisationId,
      projectId: params.projectId,
      datasourceId: params.datasourceId,
      traceIds: params.traceIds,
      start: params.startDate,
      end: params.endDate,
    })
    return
  } catch (error) {
    console.warn('Failed to fetch conversation by traces, trying fallback:', error)
    const canFallback =
      params.conversationConfigId &&
      params.conversationId &&
      params.startDate &&
      params.endDate

    if (!canFallback) {
      console.error('Failed to fetch conversation by traces and no fallback available (missing required params):', error)
      return
    }

    try {
      await fns.fetchFullConversation({
        organisationId: params.organisationId,
        projectId: params.projectId,
        datasourceId: params.datasourceId,
        conversationConfigId: params.conversationConfigId,
        value: params.conversationId,
        start: params.startDate,
        end: params.endDate,
      })
    } catch (fallbackError) {
      console.error('Both fetch methods failed:', { original: error, fallback: fallbackError })
    }
  }
}

async function tryFetchFullConversation(params: FetchParams, fns: FetchFns): Promise<void> {
  if (!params.startDate || !params.endDate) {
    console.error('Cannot fetch full conversation: startDate and endDate are required')
    return
  }

  try {
    await fns.fetchFullConversation({
      organisationId: params.organisationId,
      projectId: params.projectId,
      datasourceId: params.datasourceId,
      conversationConfigId: params.conversationConfigId,
      value: params.conversationId,
      start: params.startDate,
      end: params.endDate,
    })
  } catch (error) {
    console.error('Failed to fetch full conversation:', error)
  }
}

export async function fetchAnnotateConversationData(
  params: FetchParams,
  fns: FetchFns
): Promise<void> {
  const orgId = params.organisationId
  if (!orgId) return

  const hasTraceIds = params.traceIds && params.traceIds.length > 0
  const hasConversationConfig =
    params.conversationConfigId && params.conversationId

  if (hasTraceIds) {
    await tryFetchByTracesWithFallback(params, fns)
    return
  }

  if (hasConversationConfig) {
    await tryFetchFullConversation(params, fns)
  }
}
