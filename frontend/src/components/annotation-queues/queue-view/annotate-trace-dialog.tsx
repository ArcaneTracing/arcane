"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from
"@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnnotationQuestionType } from "@/types/enums";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TraceViewer } from "@/components/traces/tree/trace-viewer";
import { TraceConversation } from "@/components/traces/conversation/trace-conversation";
import { useTraceQuery } from "@/hooks/traces/use-traces-query";
import { AnnotationResponse, CreateAnnotationAnswerRequest } from "@/types/annotation-queue";
import { useQueueAnnotations } from "@/hooks/annotation-queues/use-queue-annotations";
import { QuestionPreview } from "@/components/annotation-queues/question-preview/question-preview";
import { useActionError } from "@/hooks/shared/use-action-error";
import { showSuccessToast } from "@/lib/toast";

interface AnnotateTraceDialogProps {
  projectId: string;
  queueId: string;
  traceId: string;
  datasourceId: string;
  startDate?: string;
  endDate?: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  existingAnnotation?: AnnotationResponse;
  queueTraceId?: string;
  readOnly?: boolean;
}

export function AnnotateTraceDialog({
  projectId,
  queueId,
  traceId,
  datasourceId,
  startDate,
  endDate,
  isOpen,
  onClose,
  onComplete,
  existingAnnotation,
  queueTraceId,
  readOnly = false
}: Readonly<AnnotateTraceDialogProps>) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [traceViewTab, setTraceViewTab] = useState<"viewer" | "conversation">("viewer");
  const prevIsOpenRef = useRef(false);

  const { data: trace, isLoading: isTraceLoading, error: traceError } = useTraceQuery(
    isOpen ? projectId : undefined,
    isOpen ? datasourceId : undefined,
    isOpen ? traceId : undefined
  );
  const {
    template,
    isTemplateLoading,
    createAnnotation,
    updateAnnotation,
    isCreateLoading,
    isUpdateLoading
  } = useQueueAnnotations(projectId, queueId);


  const actionError = useActionError({ showToast: true, showInline: true });
  const existingAnnotationRef = useRef(existingAnnotation);
  const actionErrorRef = useRef(actionError);

  useEffect(() => {
    existingAnnotationRef.current = existingAnnotation;
    actionErrorRef.current = actionError;
  }, [existingAnnotation, actionError]);

  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;

    if (!isOpen) return;


    if (!wasOpen) {
      const currentAnnotation = existingAnnotationRef.current;
      const answers = currentAnnotation?.answers;
      if (answers) {
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
      } else {
        setAnswers({});
      }

      actionErrorRef.current.clear();
    }
  }, [isOpen]);


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

        if (!queueTraceId) {
          const errorMsg = 'traceId (queue trace entry ID) is required for creating annotations in queue view';
          console.error('[AnnotateTraceDialog]', errorMsg);
          throw new Error(errorMsg);
        }

        await createAnnotation({
          traceId: queueTraceId,
          answers: annotationAnswers
        });
      }
      showSuccessToast(existingAnnotation ? 'Annotation updated successfully' : 'Annotation created successfully');
      onComplete();
    } catch (error) {
      console.error(`[AnnotateTraceDialog] Error ${existingAnnotation ? 'updating' : 'creating'} annotation:`, error);
      actionError.handleError(error);
    }
  };

  const isSubmitting = isCreateLoading || isUpdateLoading;

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
    <Dialog open={isOpen} onOpenChange={(open) => {

      if (!open && !isSubmitting) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0" onInteractOutside={(e) => {

        if (isSubmitting) {
          e.preventDefault();
        }
      }}>
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle>
            {(() => {
              if (readOnly) return "View Annotation";
              if (existingAnnotation) return "Edit Annotation";
              return "Annotate Trace";
            })()}
          </DialogTitle>
          <DialogDescription>
            {(() => {
              if (readOnly) return `View the annotation for trace ${traceId}`;
              if (existingAnnotation) return `Review and edit the annotation for trace ${traceId}`;
              return `Review the trace and answer the questions below to annotate trace ${traceId}`;
            })()}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex gap-6 px-6 overflow-hidden">
          {}
          <div className="flex-[0.7] flex flex-col min-w-0 border-r pr-6 overflow-hidden">
            <Tabs value={traceViewTab} onValueChange={(v) => setTraceViewTab(v as "viewer" | "conversation")} className="flex flex-col h-full">
              <TabsList className="mb-4 flex-shrink-0">
                <TabsTrigger value="viewer">Trace Viewer</TabsTrigger>
                <TabsTrigger value="conversation">Conversation</TabsTrigger>
              </TabsList>
              <div className="flex-1 min-h-0 overflow-hidden">
                {(() => {
                  if (isTraceLoading) {
                    return (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>);

                  }
                  if (traceError) {
                    return (
                      <div className="flex items-center justify-center py-8 text-sm text-red-500">
                        Error loading trace: {traceError.message || 'Failed to load trace'}
                      </div>);

                  }
                  if (!trace) {
                    return (
                      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                        Trace not found
                      </div>);

                  }
                  return (
                    <>
                    <TabsContent value="viewer" className="m-0 h-full">
                      <div className="h-full">
                        {}
                        <TraceViewer trace={trace} traceId={traceId} showAddToAnnotationQueue={false} showAddToDataset={false} />
                      </div>
                    </TabsContent>
                    <TabsContent value="conversation" className="m-0 h-full">
                      <div className="h-full">
                        <TraceConversation trace={trace} />
                      </div>
                    </TabsContent>
                  </>);

                })()}
              </div>
            </Tabs>
          </div>

          {}
          <div className="flex-[0.3] flex flex-col min-w-0 overflow-y-auto">
            <div className="space-y-6 pb-4">
            {template?.questions.length === 0 ?
              <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                No questions found in template. Please configure the template first.
              </div> :

              template?.questions.map((question) =>
              <QuestionPreview
                key={question.id}
                question={question}
                value={answers[question.id]}
                onChange={readOnly ? undefined : (value) => setAnswers((prev) => ({
                  ...prev,
                  [question.id]: value
                }))}
                disabled={readOnly} />

              )
              }
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 px-6 pb-6 pt-4 border-t flex-col gap-3">
          {actionError.message &&
          <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{actionError.message}</AlertDescription>
            </Alert>
          }
          <div className="flex gap-2 w-full justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}>

              {readOnly ? "Close" : "Cancel"}
            </Button>
            {!readOnly &&
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit();
              }}
              onMouseDown={(e) => {
              }}
              disabled={isSubmitting || !allQuestionsAnswered || isTemplateLoading}
              title={(() => {
                if (!allQuestionsAnswered) return 'Please answer all required questions';
                if (isTemplateLoading) return 'Loading template...';
                return '';
              })()}>

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
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}