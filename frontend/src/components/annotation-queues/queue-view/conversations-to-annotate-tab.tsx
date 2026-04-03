"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { QueuedConversationResponse } from "@/types/annotation-queue"
import { useQueryClient } from "@tanstack/react-query"
import { useRemoveConversation } from "@/hooks/annotation-queues/use-annotation-queues-query"
import { DeleteConversationDialog } from "./delete-conversation-dialog"
import { AnnotateConversationDialog } from "./annotate-conversation-dialog"
import { useActionError } from "@/hooks/shared/use-action-error"
import { showSuccessToast } from "@/lib/toast"

interface ConversationsToAnnotateTabProps {
  projectId: string
  queueId: string
  conversations: QueuedConversationResponse[]
}

export function ConversationsToAnnotateTab({ projectId, queueId, conversations }: Readonly<ConversationsToAnnotateTabProps>) {
  const [conversationToAnnotate, setConversationToAnnotate] = useState<QueuedConversationResponse | null>(null)
  const [conversationToDelete, setConversationToDelete] = useState<QueuedConversationResponse | null>(null)
  const queryClient = useQueryClient()
  const fetchAnnotationQueue = () => {
    queryClient.invalidateQueries({ queryKey: ['annotationQueue', projectId, queueId] })
  }
  const removeConversationMutation = useRemoveConversation(projectId)
  const deleteActionError = useActionError({ showToast: true })

  const handleAnnotate = (conversation: QueueConversation) => {
    setConversationToAnnotate(conversation)
  }

  const handleAnnotateComplete = async () => {
    setConversationToAnnotate(null)
    fetchAnnotationQueue()
  }

  const handleDelete = async () => {
    if (conversationToDelete) {
      try {
        await removeConversationMutation.mutateAsync({
          queueId,
          id: conversationToDelete.id,
        })
        setConversationToDelete(null)
        showSuccessToast('Conversation removed from queue successfully')
        fetchAnnotationQueue()
      } catch (error) {
        console.error("Error deleting conversation:", error)
        deleteActionError.handleError(error)
      }
    }
  }
  
  const isDeleting = removeConversationMutation.isPending

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-gray-100 dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#0D0D0D]">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">No conversations to be annotated</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-medium text-gray-900 dark:text-gray-100">Conversation ID</TableHead>
              <TableHead className="text-xs font-medium text-gray-900 dark:text-gray-100">Trace Count</TableHead>
              <TableHead className="text-xs font-medium text-gray-900 dark:text-gray-100 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conversations.map((conversation) => (
              <TableRow 
                key={conversation.id}
                className="border-b border-gray-100 dark:border-[#2A2A2A] hover:bg-gray-50/50 dark:hover:bg-[#1F1F1F]/50"
              >
                <TableCell className="py-3">
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {conversation.otelConversationId}
                  </span>
                </TableCell>
                <TableCell className="py-3">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {conversation.traceIds?.length || 0} trace{conversation.traceIds?.length === 1 ? '' : 's'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAnnotate(conversation)}
                    >
                      Annotate
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
                      onClick={() => setConversationToDelete(conversation)}
                    >
                      <span className="sr-only">Delete</span>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {conversationToAnnotate && (
        <AnnotateConversationDialog
          projectId={projectId}
          queueId={queueId}
          conversationId={conversationToAnnotate.otelConversationId}
          conversationConfigId={conversationToAnnotate.conversationConfigId}
          datasourceId={conversationToAnnotate.datasourceId}
          traceIds={conversationToAnnotate.traceIds}
          startDate={conversationToAnnotate.startDate?.toString()}
          endDate={conversationToAnnotate.endDate?.toString()}
          queueConversationId={conversationToAnnotate.id}
          isOpen={!!conversationToAnnotate}
          onClose={() => setConversationToAnnotate(null)}
          onComplete={handleAnnotateComplete}
        />
      )}

      <DeleteConversationDialog
        isOpen={!!conversationToDelete}
        isLoading={isDeleting}
        onClose={() => setConversationToDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

