import { fetchAnnotateConversationData } from '../fetch-annotate-conversation-data'

describe('fetchAnnotateConversationData', () => {
  const baseParams = {
    organisationId: 'org1',
    projectId: 'proj1',
    datasourceId: 'ds1',
    traceIds: [] as string[],
    conversationConfigId: 'cc1',
    conversationId: 'conv1',
    startDate: '2024-01-01',
    endDate: '2024-01-02',
  }

  it('returns early when organisationId is empty', async () => {
    const fetchByTraces = jest.fn()
    const fetchFull = jest.fn()

    await fetchAnnotateConversationData(
      { ...baseParams, organisationId: '' },
      { fetchConversationByTraces: fetchByTraces, fetchFullConversation: fetchFull }
    )

    expect(fetchByTraces).not.toHaveBeenCalled()
    expect(fetchFull).not.toHaveBeenCalled()
  })

  it('calls fetchConversationByTraces when traceIds provided', async () => {
    const fetchByTraces = jest.fn().mockResolvedValue(undefined)
    const fetchFull = jest.fn()

    await fetchAnnotateConversationData(
      { ...baseParams, traceIds: ['t1', 't2'] },
      { fetchConversationByTraces: fetchByTraces, fetchFullConversation: fetchFull }
    )

    expect(fetchByTraces).toHaveBeenCalledWith({
      organisationId: 'org1',
      projectId: 'proj1',
      datasourceId: 'ds1',
      traceIds: ['t1', 't2'],
      start: '2024-01-01',
      end: '2024-01-02',
    })
    expect(fetchFull).not.toHaveBeenCalled()
  })

  it('calls fetchFullConversation when no traceIds but has conversationConfigId', async () => {
    const fetchByTraces = jest.fn()
    const fetchFull = jest.fn().mockResolvedValue(undefined)

    await fetchAnnotateConversationData(
      baseParams,
      { fetchConversationByTraces: fetchByTraces, fetchFullConversation: fetchFull }
    )

    expect(fetchByTraces).not.toHaveBeenCalled()
    expect(fetchFull).toHaveBeenCalledWith({
      organisationId: 'org1',
      projectId: 'proj1',
      datasourceId: 'ds1',
      conversationConfigId: 'cc1',
      value: 'conv1',
      start: '2024-01-01',
      end: '2024-01-02',
    })
  })

  it('does not call fetchFullConversation when startDate or endDate missing', async () => {
    const fetchFull = jest.fn()
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    await fetchAnnotateConversationData(
      { ...baseParams, startDate: undefined, endDate: undefined },
      { fetchConversationByTraces: jest.fn(), fetchFullConversation: fetchFull }
    )

    expect(fetchFull).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('tries fallback when fetchByTraces fails and fallback params available', async () => {
    const fetchByTraces = jest.fn().mockRejectedValue(new Error('traces failed'))
    const fetchFull = jest.fn().mockResolvedValue(undefined)
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

    await fetchAnnotateConversationData(
      { ...baseParams, traceIds: ['t1'] },
      { fetchConversationByTraces: fetchByTraces, fetchFullConversation: fetchFull }
    )

    expect(fetchByTraces).toHaveBeenCalled()
    expect(fetchFull).toHaveBeenCalled()
    consoleWarn.mockRestore()
  })
})
