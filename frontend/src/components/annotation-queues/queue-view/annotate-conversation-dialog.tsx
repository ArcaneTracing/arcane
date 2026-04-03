"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from
"@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { AnnotationQuestionType } from "@/types/enums";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TraceConversation } from "@/components/traces/conversation/trace-conversation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TraceViewer } from "@/components/traces/tree/trace-viewer";
import { useConversationByTraces } from "@/hooks/conversation/use-conversation-by-traces";
import { useFullConversation } from "@/hooks/conversation/use-full-conversation";
import { AnnotationResponse, CreateAnnotationAnswerRequest } from "@/types/annotation-queue";
import { useQueueAnnotations } from "@/hooks/annotation-queues/use-queue-annotations";
import { AnnotationQuestionsContent } from "./annotation-questions-content";
import { mergeTraces } from "@/lib/trace-utils";
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation";
import { useActionError } from "@/hooks/shared/use-action-error";
import { showSuccessToast } from "@/lib/toast";
import { fetchAnnotateConversationData } from "./fetch-annotate-conversation-data";

interface AnnotateConversationDialogProps {
  projectId: string;
  queueId: string;
  conversationId: string;
  conversationConfigId: string;
  datasourceId: string;
  traceIds: string[];
  startDate?: string;
  endDate?: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  existingAnnotation?: AnnotationResponse;
  queueConversationId?: string;
  readOnly?: boolean;
}

export function AnnotateConversationDialog({
  projectId,
  queueId,
  conversationId,
  conversationConfigId,
  datasourceId,
  traceIds,
  startDate,
  endDate,
  isOpen,
  onClose,
  onComplete,
  existingAnnotation,
  queueConversationId,
  readOnly = false
}: Readonly<AnnotateConversationDialogProps>) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [traceViewTab, setTraceViewTab] = useState<"conversation" | "viewer">("conversation");
  const organisationId = useOrganisationIdOrNull();
  const hasFetchedRef = useRef(false);
  const paramsRef = useRef({ datasourceId, conversationConfigId, conversationId, traceIds, projectId, organisationId, startDate, endDate });

  const { traces: tracesByTraces, isFetchLoading: isTracesLoadingByTraces, fetchError: tracesErrorByTraces, fetchConversationByTraces, reset: resetByTraces } = useConversationByTraces();
  const { traces: tracesFull, isFetchLoading: isTracesLoadingFull, fetchError: tracesErrorFull, fetchFullConversation, reset: resetFullConversation } = useFullConversation();
  const {
    template,
    isTemplateLoading,
    createAnnotation,
    updateAnnotation,
    isCreateLoading,
    isUpdateLoading
  } = useQueueAnnotations(projectId, queueId);


  const actionError = useActionError({ showToast: true, showInline: true });


  useEffect(() => {
    paramsRef.current = { datasourceId, conversationConfigId, conversationId, traceIds, projectId, organisationId, startDate, endDate };
  }, [datasourceId, conversationConfigId, conversationId, traceIds, projectId, organisationId, startDate, endDate]);


  const traces = tracesByTraces.length > 0 ? tracesByTraces : tracesFull;

  const isTracesLoading = (isTracesLoadingByTraces || isTracesLoadingFull) && traces.length === 0;
  const tracesError = tracesErrorByTraces || tracesErrorFull;


  useEffect(() => {
    if (!isOpen) {
      hasFetchedRef.current = false;
      actionError.clear();

      resetByTraces();
      resetFullConversation();
    }
  }, [isOpen, resetByTraces, resetFullConversation, actionError]);


  useEffect(() => {
    const params = paramsRef.current;
    if (!params.datasourceId || !params.projectId || !params.organisationId || !isOpen || hasFetchedRef.current) return;

    hasFetchedRef.current = true;

    fetchAnnotateConversationData(
      {
        organisationId: params.organisationId ?? '',
        projectId: params.projectId,
        datasourceId: params.datasourceId,
        traceIds: params.traceIds,
        conversationConfigId: params.conversationConfigId,
        conversationId: params.conversationId,
        startDate: params.startDate,
        endDate: params.endDate
      },
      { fetchConversationByTraces, fetchFullConversation }
    );

  }, [isOpen, conversationId]);


  useEffect(() => {
    const answers = existingAnnotation?.answers;
    if (answers && isOpen) {
      const preFilledAnswers: Record<string, any> = {};
      answers.forEach((answer) => {
        if (answer.booleanValue != null) {
          preFilledAnswers[answer.questionId] = answer.booleanValue;
        } else if (answer.numberValue != null) {
          preFilledAnswers[answer.questionId] = answer.numberValue;
        } else if (answer.stringArrayValue != null) {
          preFilledAnswers[answer.questionId] = answer.stringArrayValue;
        } else if (answer.value != null) {
          preFilledAnswers[answer.questionId] = answer.value;
        }
      });
      setAnswers(preFilledAnswers);
    } else if (isOpen) {
      setAnswers({});
    }
  }, [existingAnnotation, isOpen]);


  const mergedTrace = useMemo(() => {
    if (!traces || traces.length === 0) return null;
    return mergeTraces(traces);
  }, [traces]);

  const handleSubmit = async () => {
    if (!template) {
      actionError.handleError(new Error('Template not loaded'));
      return;
    }

    actionError.clear();
    try {

      const annotationAnswers: CreateAnnotationAnswerRequest[] = template.questions.
      filter((q) => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== "").
      map((q) => {
        const answer = answers[q.id];
        const baseAnswer: CreateAnnotationAnswerRequest = {
          questionId: q.id
        };

        if (q.type === AnnotationQuestionType.BOOLEAN) {
          baseAnswer.booleanValue = answer;
        } else if (q.type === AnnotationQuestionType.NUMERIC) {
          baseAnswer.numberValue = Number(answer);
        } else if (q.type === AnnotationQuestionType.MULTIPLE_CHOICE) {
          baseAnswer.stringArrayValue = Array.isArray(answer) ? answer : [];
        } else {
          baseAnswer.value = String(answer);
        }

        return baseAnswer;
      });

      if (existingAnnotation) {
        await updateAnnotation(existingAnnotation.id, {
          answers: annotationAnswers
        });
      } else {

        if (!queueConversationId) {
          throw new Error('conversationId (queue conversation entry ID) is required for creating annotations in queue view');
        }

        await createAnnotation({
          conversationId: queueConversationId,
          answers: annotationAnswers
        });
      }
      showSuccessToast(existingAnnotation ? 'Annotation updated successfully' : 'Annotation created successfully');
      onComplete();
      onClose();
    } catch (error) {
      console.error(`Error ${existingAnnotation ? 'updating' : 'creating'} annotation:`, error);
      actionError.handleError(error);
    }
  };

  const isSubmitting = isCreateLoading || isUpdateLoading;

  const handleAnswerChange = useCallback((questionId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const allQuestionsAnswered = template?.questions.every((q) => {
    const answer = answers[q.id];
    if (q.required) {
      if (q.type === AnnotationQuestionType.MULTIPLE_CHOICE) {
        return Array.isArray(answer) && answer.length > 0;
      }
      return answer !== undefined && answer !== null && answer !== "";
    }
    return true;
  }) ?? false;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>
            {(() => {
              if (readOnly) return "View Annotation";
              if (existingAnnotation) return "Edit Annotation";
              return "Annotate Conversation";
            })()}
          </DialogTitle>
          <DialogDescription>
            {(() => {
              if (readOnly) return `View the annotation for conversation ${conversationId}`;
              if (existingAnnotation) return `Review and edit the annotation for conversation ${conversationId}`;
              return `Review the conversation and answer the questions below to annotate conversation ${conversationId}`;
            })()}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex gap-6 px-6 overflow-hidden">
          {}
          <div className="flex-[0.7] flex flex-col min-w-0 border-r pr-6 overflow-hidden">
            {(() => {
              if (isTracesLoading) {
                return (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>);

              }
              if (tracesError) {
                return (
                  <div className="flex items-center justify-center py-8 text-sm text-red-500">
                    Error loading conversation: {tracesError instanceof Error ? tracesError.message : String(tracesError)}
                  </div>);

              }
              if (!mergedTrace) {
                return (
                  <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                    Conversation not found
                  </div>);

              }
              return (
                <Tabs value={traceViewTab} onValueChange={(v) => setTraceViewTab(v as "conversation" | "viewer")} className="flex flex-col h-full">
                <TabsList className="mb-4 flex-shrink-0">
                  <TabsTrigger value="conversation">Conversation</TabsTrigger>
                  <TabsTrigger value="viewer">Trace Viewer</TabsTrigger>
                </TabsList>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <TabsContent value="conversation" className="h-full overflow-auto m-0">
                    <TraceConversation trace={mergedTrace} />
                  </TabsContent>
                  <TabsContent value="viewer" className="h-full overflow-auto m-0">
                    <TraceViewer
                        trace={mergedTrace}
                        traceId={traceIds?.[0] || conversationId}
                        showAddToAnnotationQueue={false}
                        showAddToDataset={false} />

                  </TabsContent>
                </div>
              </Tabs>);

            })()}
          </div>

          {}
          <div className="flex-[0.3] flex flex-col min-w-0 overflow-y-auto">
            <div className="space-y-6 pb-4">
            {actionError.message &&
              <Alert variant="destructive">
                <AlertDescription>{actionError.message}</AlertDescription>
              </Alert>
              }
            <AnnotationQuestionsContent
                isTemplateLoading={isTemplateLoading}
                questions={template?.questions}
                answers={answers}
                readOnly={readOnly}
                onAnswerChange={handleAnswerChange} />

            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 px-6 pb-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}>

            {readOnly ? "Close" : "Cancel"}
          </Button>
          {!readOnly &&
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !allQuestionsAnswered || isTemplateLoading}>

              {(() => {
              if (isSubmitting) {
                return (
                  <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>);

              }
              return existingAnnotation ? "Update Annotation" : "Submit Annotation";
            })()}
            </Button>
          }
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}