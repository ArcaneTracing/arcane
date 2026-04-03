"use client"

import { useEntitiesQuery } from '@/hooks/entities/use-entities-query'
import { Loader } from '@/components/ui/loader'
import { ComponentErrorBoundary } from '@/components/ComponentErrorBoundary'
import { UnifiedConversation } from './unified-conversation'
import type { TempoTraceResponse } from '@/types/traces'

interface TraceConversationProps {
  trace: TempoTraceResponse | Record<string, unknown> | null | undefined
}

export function TraceConversation({ trace }: Readonly<TraceConversationProps>) {
  const { isLoading: isFetchLoading } = useEntitiesQuery()

  if (isFetchLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <ComponentErrorBoundary resetKeys={[trace]} scope="TraceConversation">
      <UnifiedConversation trace={trace} />
    </ComponentErrorBoundary>
  )
}