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
import { useAnnotationQueuesByTypeQuery, useAddTracesBulk } from "@/hooks/annotation-queues/use-annotation-queues-query";
import { AnnotationQueueType } from "@/types/enums";
import { useMutationAction } from "@/hooks/shared/use-mutation-action";
import { showSuccessToast } from "@/lib/toast";

interface AddToQueueDialogProps {
  selectedTraces: Set<string>;
  projectId: string;
  datasourceId: string;
  startDate?: Date;
  endDate?: Date;
  onSuccess?: () => void;
  trigger?: ReactNode;
}

export function AddToQueueDialog({
  selectedTraces,
  projectId,
  datasourceId,
  startDate,
  endDate,
  onSuccess,
  trigger
}: Readonly<AddToQueueDialogProps>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQueueId, setSelectedQueueId] = useState<string>("");

  const { data: traceQueues = [], isLoading: isQueuesLoading } = useAnnotationQueuesByTypeQuery(
    projectId,
    AnnotationQueueType.TRACES
  );
  const addTracesMutation = useAddTracesBulk(projectId);


  const mutationAction = useMutationAction({
    mutation: addTracesMutation,
    onSuccess: () => {
      setSelectedQueueId("");
      setIsDialogOpen(false);
      if (onSuccess) {
        onSuccess();
      }
      showSuccessToast('Traces added to queue successfully');
    },
    showErrorToast: true
  });

  const handleAddToQueue = async () => {
    if (!selectedQueueId || selectedTraces.size === 0 || !projectId) return;

    try {
      const traceIds = Array.from(selectedTraces);


      await addTracesMutation.mutateAsync({
        queueId: selectedQueueId,
        data: {
          otelTraceIds: traceIds,
          datasourceId,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString()
        }
      });

    } catch (error) {
      console.error('Error adding traces to queue', error);
    }
  };

  const isAddingToQueue = mutationAction.isPending;

  const handleCancel = () => {
    setIsDialogOpen(false);
    setSelectedQueueId("");
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
            Select an annotation queue to add {selectedTraces.size} trace{selectedTraces.size === 1 ? '' : 's'} to.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {(() => {
            if (isQueuesLoading) {
              return (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Loading annotation queues...
                </div>);

            }
            if (traceQueues.length === 0) {
              return (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No trace annotation queues found. Create one first.
                </div>);

            }
            return (
              <div className="space-y-2">
                {traceQueues.map((queue) =>
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