"use client"

import { useState } from 'react'
import { useConversationsSearch } from './use-conversation-query'
import { ConversationSearchParams } from '@/api/conversations'
import { ConversationListItemResponse } from '@/types/conversations'

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationListItemResponse[]>([])
  const searchMutation = useConversationsSearch()

  const searchConversations = async (params: ConversationSearchParams) => {
    const result = await searchMutation.mutateAsync(params)
    setConversations(result.conversations || [])
    return result
  }

  return {
    conversations,
    isSearchLoading: searchMutation.isPending,
    searchError: searchMutation.error?.message || null,
    searchConversations,
  }
}

