"use client"

import { useState, useCallback } from 'react'
import { useFullConversation as useFullConversationMutation } from './use-conversation-query'
import { FullConversationParams } from '@/api/conversations'
import { TempoTraceResponse } from '@/types/traces'

export function useFullConversation() {
  const [traces, setTraces] = useState<TempoTraceResponse[]>([])
  const mutation = useFullConversationMutation()

  const fetchFullConversation = useCallback(async (params: FullConversationParams) => {
    const result = await mutation.mutateAsync(params)
    setTraces(result.traces || [])
    return result
  }, [mutation])

  const reset = useCallback(() => {
    mutation.reset()
    setTraces([])
  }, [mutation])

  return {
    traces,
    isFetchLoading: mutation.isPending,
    fetchError: mutation.error?.message || null,
    fetchFullConversation,
    reset,
  }
}

