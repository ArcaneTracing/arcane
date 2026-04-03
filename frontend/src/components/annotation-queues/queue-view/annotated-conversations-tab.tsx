"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { AnnotationResponse } from "@/types/annotation-queue";
import { DeleteAnnotationDialog } from "@/components/annotation-queues/queue-view/delete-annotation-dialog";
import { AnnotateConversationDialog } from "./annotate-conversation-dialog";
import { useQueueAnnotations } from "@/hooks/annotation-queues/use-queue-annotations";
import { useQueryClient } from "@tanstack/react-query";
import { useAnnotationQueueQuery } from "@/hooks/annotation-queues/use-annotation-queues-query";
import { useActionError } from "@/hooks/shared/use-action-error";
import { showSuccessToast } from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from
"@/components/ui/dialog";

interface AnnotatedConversationsTabProps {
  projectId: string;
  queueId: string;
  annotations: AnnotationResponse[];
  conversations?: Array<{
    conversationId: string;
    queueConversationId: string;
    conversationConfigId: string;
    datasourceId: string;
    traceIds: string[];
  }>;
}

export function AnnotatedConversationsTab({ projectId, queueId, annotations, conversations = [] }: Readonly<AnnotatedConversationsTabProps>) {
  const [annotationToDelete, setAnnotationToDelete] = useState<string | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<AnnotationResponse | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const queryClient = useQueryClient();
  const fetchAnnotationQueue = () => {
    queryClient.invalidateQueries({ queryKey: ['annotationQueue', projectId, queueId] });
  };
  const { deleteAnnotation, isDeleteLoading } = useQueueAnnotations(projectId, queueId);
  const deleteActionError = useActionError({ showToast: true });

  const { data: annotationQueue } = useAnnotationQueueQuery(projectId, queueId);
  const allConversations = annotationQueue?.conversationsToBeAnnotated || conversations;

  const allAnnotations = annotationQueue?.annotations || annotations;


  const conversationAnnotations = allAnnotations.filter((ann) => ann.conversationId || ann.otelConversationId);

  const handleView = (annotation: AnnotationResponse) => {
    setSelectedAnnotation(annotation);
    setIsViewMode(true);
  };

  const handleEdit = (annotation: AnnotationResponse) => {
    setSelectedAnnotation(annotation);
    setIsViewMode(false);
  };

  const handleAnnotationComplete = async () => {
    setSelectedAnnotation(null);
    setIsViewMode(false);
    fetchAnnotationQueue();
  };

  const handleDelete = async () => {
    if (annotationToDelete) {
      try {
        await deleteAnnotation(annotationToDelete);
        setAnnotationToDelete(null);
        showSuccessToast('Annotation deleted successfully');
        fetchAnnotationQueue();
      } catch (error) {
        console.error("Error deleting annotation:", error);
        deleteActionError.handleError(error);
      }
    }
  };

  if (conversationAnnotations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-gray-100 dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#0D0D0D]">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">No annotated conversations found</p>
        </div>
      </div>);

  }

  return (
    <>
      <div className="rounded-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-medium text-gray-900 dark:text-gray-100">Conversation ID</TableHead>
              <TableHead className="text-xs font-medium text-gray-900 dark:text-gray-100">Answers</TableHead>
              <TableHead className="text-xs font-medium text-gray-900 dark:text-gray-100 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conversationAnnotations.map((annotation) =>
            <TableRow
              key={annotation.id}
              className="border-b border-gray-100 dark:border-[#2A2A2A] hover:bg-gray-50/50 dark:hover:bg-[#1F1F1F]/50">

                <TableCell className="py-3">
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {annotation.conversationId}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-gray-600 dark:text-gray-400">
                  {annotation.answers?.length || 0} answer{annotation.answers?.length === 1 ? '' : 's'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 justify-end">
                    <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-[#1F1F1F]/80"
                    onClick={() => handleView(annotation)}>

                      <span className="sr-only">View</span>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-[#1F1F1F]/80"
                    onClick={() => handleEdit(annotation)}>

                      <span className="sr-only">Edit</span>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
                    onClick={() => setAnnotationToDelete(annotation.id)}>

                      <span className="sr-only">Delete</span>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DeleteAnnotationDialog
        isOpen={!!annotationToDelete}
        isLoading={isDeleteLoading}
        onClose={() => setAnnotationToDelete(null)}
        onConfirm={handleDelete} />


      {selectedAnnotation && (selectedAnnotation.conversationId || selectedAnnotation.otelConversationId) && (() => {
        const sel = selectedAnnotation;

        const conversation = allConversations.find((c) =>
        c.otelConversationId === (sel.conversationId || sel.otelConversationId) ||
        sel.id && c.id === sel.id
        );
        const conversationConfigId = conversation?.conversationConfigId || selectedAnnotation.conversationConfigId || "";
        const datasourceId = conversation?.datasourceId || selectedAnnotation.conversationDatasourceId || selectedAnnotation.datasourceId || "";
        const traceIds = conversation?.traceIds || [];

        const startDate = conversation?.startDate?.toString() || selectedAnnotation.startDate?.toString();
        const endDate = conversation?.endDate?.toString() || selectedAnnotation.endDate?.toString();


        if (!conversationConfigId || !datasourceId) {
          return (
            <Dialog open={!!selectedAnnotation} onOpenChange={() => {
              setSelectedAnnotation(null);
              setIsViewMode(false);
            }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Conversation Details Not Available</DialogTitle>
                  <DialogDescription>
                    <p className="mb-2">
                      The conversation details for conversation "{selectedAnnotation.conversationId || selectedAnnotation.otelConversationId}" are not available.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Missing required fields: {!conversationConfigId && "conversationConfigId "}{!datasourceId && "datasourceId"}
                    </p>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button onClick={() => {
                    setSelectedAnnotation(null);
                    setIsViewMode(false);
                  }}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>);

        }

        return (
          <AnnotateConversationDialog
            key={selectedAnnotation.id}
            projectId={projectId}
            queueId={queueId}
            conversationId={selectedAnnotation.conversationId || selectedAnnotation.otelConversationId || ""}
            conversationConfigId={conversationConfigId}
            datasourceId={datasourceId}
            traceIds={traceIds}
            startDate={startDate}
            endDate={endDate}
            queueConversationId={selectedAnnotation.id}
            isOpen={!!selectedAnnotation}
            onClose={() => {
              setSelectedAnnotation(null);
              setIsViewMode(false);
            }}
            onComplete={handleAnnotationComplete}
            existingAnnotation={selectedAnnotation}
            readOnly={isViewMode} />);


      })()}
    </>);

}