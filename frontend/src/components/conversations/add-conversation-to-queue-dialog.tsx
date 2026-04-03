"use client";

import { useState, ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from
"@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAnnotationQueuesByTypeQuery, useAddConversation } from "@/hooks/annotation-queues/use-annotation-queues-query";
import { AnnotationQueueType } from "@/types/enums";
import { ConversationListItemResponse } from "@/types/conversations";
import { useActionError } from "@/hooks/shared/use-action-error";
import { showSuccessToast } from "@/lib/toast";

interface AddConversationToQueueDialogProps {
  selectedConversations: Set<string>;
  conversations: ConversationListItemResponse[];
  projectId: string;
  datasourceId: string;
  conversationConfigId: string;
  startDate?: Date;
  endDate?: Date;

  decodeTraceIds?: boolean;
  onSuccess?: () => void;
  trigger?: ReactNode;
}

export function AddConversationToQueueDialog({
  selectedConversations,
  conversations,
  projectId,
  datasourceId,
  conversationConfigId,
  startDate,
  endDate,
  decodeTraceIds = false,
  onSuccess,
  trigger
}: Readonly<AddConversationToQueueDialogProps>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQueueId, setSelectedQueueId] = useState<string>("");

  const { data: conversationQueues = [], isLoading: isQueuesLoading } = useAnnotationQueuesByTypeQuery(
    projectId,
    isDialogOpen ? AnnotationQueueType.CONVERSATIONS : undefined
  );
  const addConversationMutation = useAddConversation(projectId);
  const actionError = useActionError({ showToast: true, showInline: true });

  const handleAddToQueue = async () => {
    if (!selectedQueueId || selectedConversations.size === 0 || !projectId) return;

    actionError.clear();
    try {

      const selectedConvs = conversations.filter((conv) => selectedConversations.has(conv.conversationId));


      const promises = selectedConvs.map((conv) =>
      addConversationMutation.mutateAsync({
        queueId: selectedQueueId,
        decodeTraceIds,
        data: {
          conversationConfigId,
          datasourceId,
          otelConversationId: conv.conversationId,
          otelTraceIds: conv.traceIds ?? [],
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString()
        }
      })
      );

      await Promise.all(promises);


      setSelectedQueueId("");
      setIsDialogOpen(false);
      showSuccessToast(`Added ${selectedConvs.length} conversation(s) to queue successfully`);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding conversations to queue:", error);
      actionError.handleError(error);
    }
  };

  const isAddingToQueue = addConversationMutation.isPending;

  const handleCancel = () => {
    setIsDialogOpen(false);
    setSelectedQueueId("");
    actionError.clear();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {trigger ||
        <Button size="sm" variant="default">
            <Plus className="h-4 w-4 mr-2" />
            Add to Annotation Queue
          </Button>
        }
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Annotation Queue</DialogTitle>
          <DialogDescription>
            Select an annotation queue to add {selectedConversations.size} conversation{selectedConversations.size === 1 ? '' : 's'} to.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {actionError.message &&
          <Alert variant="destructive">
              <AlertDescription>{actionError.message}</AlertDescription>
            </Alert>
          }
          {(() => {
            if (isQueuesLoading) {
              return (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Loading annotation queues...
                </div>);

            }
            if (conversationQueues.length === 0) {
              return (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No conversation annotation queues found. Create one first.
                </div>);

            }
            return (
              <div className="space-y-2">
              {conversationQueues.map((queue) =>
                <button
                  key={queue.id}
                  type="button"
                  className={`w-full text-left p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedQueueId === queue.id ?
                  'border-primary bg-primary/5' :
                  'border-border hover:bg-accent'}`
                  }
                  onClick={() => setSelectedQueueId(queue.id)}>

                  <div className="font-medium text-sm">{queue.name}</div>
                  {queue.description &&
                  <div className="text-xs text-muted-foreground mt-1">
                      {queue.description}
                    </div>
                  }
                </button>
                )}
            </div>);

          })()}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isAddingToQueue}>

              Cancel
            </Button>
            <Button
              onClick={handleAddToQueue}
              disabled={!selectedQueueId || isAddingToQueue}>

              {isAddingToQueue ? "Adding..." : "Add to Queue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>);

}