"use client"

import { useState } from 'react'
import { useConversationByTraces as useConversationByTracesMutation } from './use-conversation-query'
import { ConversationByTracesParams } from '@/api/conversations'
import { TempoTraceResponse } from '@/types/traces'

export function useConversationByTraces() {
  const [traces, setTraces] = useState<TempoTraceResponse[]>([])
  const mutation = useConversationByTracesMutation()

  const fetchConversationByTraces = async (params: ConversationByTracesParams) => {
    const result = await mutation.mutateAsync(params)
    setTraces(result.traces || [])
    return result
  }

  const reset = () => {
    mutation.reset()
    setTraces([])
  }

  return {
    traces,
    isFetchLoading: mutation.isPending,
    fetchError: mutation.error?.message || null,
    fetchConversationByTraces,
    reset,
  }
}

