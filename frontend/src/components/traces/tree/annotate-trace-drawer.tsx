"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle } from
"@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnnotationQuestionType, AnnotationResponse, AnnotationAnswerResponse } from "@/types/annotation-queue";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { useQueueAnnotations } from "@/hooks/annotation-queues/use-queue-annotations";
import { useAnnotationQueuesByTypeQuery, useAnnotationQueueQuery, useAddTrace } from "@/hooks/annotation-queues/use-annotation-queues-query";
import { AnnotationQuestionsContent } from "@/components/annotation-queues/queue-view/annotation-questions-content";
import { useParams } from "@tanstack/react-router";
import { AnnotationQueueType } from "@/types/enums";
import { useActionError } from "@/hooks/shared/use-action-error";
import { showSuccessToast } from "@/lib/toast";

interface AnnotateTraceDrawerProps {
  projectId: string;
  traceId: string;
  datasourceId?: string;
  startDate?: string;
  endDate?: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function AnnotateTraceDrawer({
  projectId,
  traceId,
  datasourceId: propDatasourceId,
  startDate,
  endDate,
  isOpen,
  onClose,
  onComplete
}: Readonly<AnnotateTraceDrawerProps>) {
  const params = useParams({ strict: false });
  const datasourceId = propDatasourceId || params?.datasourceId as string;
  const [selectedQueueId, setSelectedQueueId] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [existingAnnotation, setExistingAnnotation] = useState<AnnotationResponse | null>(null);

  const {
    template,
    isTemplateLoading,
    createAnnotation,
    updateAnnotation,
    isCreateLoading,
    isUpdateLoading
  } = useQueueAnnotations(
    projectId,
    selectedQueueId || undefined
  );

  const { data: traceQueues = [], isLoading: isQueuesLoading } = useAnnotationQueuesByTypeQuery(
    projectId,
    isOpen ? AnnotationQueueType.TRACES : undefined
  );
  const { data: queue } = useAnnotationQueueQuery(projectId, selectedQueueId);
  const addTraceMutation = useAddTrace(projectId);
  const actionError = useActionError({ showToast: true, showInline: true });
  const actionErrorRef = useRef(actionError);
  const queueRef = useRef(queue);
  const prevIsOpenRef = useRef(isOpen);


  useEffect(() => {
    actionErrorRef.current = actionError;
    queueRef.current = queue;
  }, [actionError, queue]);


  useEffect(() => {
    const currentQueue = queueRef.current;
    if (currentQueue && traceId) {
      const existing = currentQueue.annotations?.find((ann: AnnotationResponse) => ann.traceId === traceId || ann.otelTraceId === traceId);
      setExistingAnnotation(existing || null);
    } else {
      setExistingAnnotation(null);
    }
  }, [queue?.id, traceId]);


  const existingAnnotationIdRef = useRef<string | null>(null);
  useEffect(() => {
    const currentId = existingAnnotation?.id || null;
    const prevId = existingAnnotationIdRef.current;

    const answers = existingAnnotation?.answers;
    if (answers && currentId !== prevId) {
      existingAnnotationIdRef.current = currentId;
      const preFilledAnswers: Record<string, any> = {};
      answers.forEach((answer) => {
        if (answer.booleanValue !== undefined) {
          preFilledAnswers[answer.questionId] = answer.booleanValue;
        } else if (answer.numberValue !== undefined) {
          preFilledAnswers[answer.questionId] = answer.numberValue;
        } else if (answer.stringArrayValue !== undefined) {
          preFilledAnswers[answer.questionId] = answer.stringArrayValue;
        } else if (answer.value !== undefined) {
          preFilledAnswers[answer.questionId] = answer.value;
        }
      });
      setAnswers(preFilledAnswers);
    } else if (selectedQueueId && !existingAnnotation) {

      setAnswers({});
      existingAnnotationIdRef.current = null;
    }
  }, [existingAnnotation?.id, selectedQueueId]);


  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;

    if (!isOpen && wasOpen) {

      setSelectedQueueId("");
      setAnswers({});
      setExistingAnnotation(null);
      existingAnnotationIdRef.current = null;
      actionErrorRef.current.clear();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!template || !selectedQueueId || !datasourceId) {
      return;
    }

    try {

      const annotationAnswers: AnnotationAnswerResponse[] = template.questions.
      filter((q): q is typeof q & {id: string;} => !!(q.id && answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== "")).
      map((q) => {
        const answer = answers[q.id];
        const baseAnswer: AnnotationAnswerResponse = {
          id: `ans-${Date.now()}-${q.id}`,
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

      if (existingAnnotation?.id) {
        await updateAnnotation(existingAnnotation.id, {
          answers: annotationAnswers
        });
      } else {

        const result = await addTraceMutation.mutateAsync({
          queueId: selectedQueueId,
          traceId,
          datasourceId,
          startDate,
          endDate
        });

        await createAnnotation({
          traceId: result.id,
          answers: annotationAnswers
        });
      }
      showSuccessToast(existingAnnotation ? 'Annotation updated successfully' : 'Annotation created successfully');
      onComplete?.();
      onClose();
    } catch (error) {
      console.error(`Error ${existingAnnotation ? 'updating' : 'creating'} annotation:`, error);
      actionError.handleError(error);
    }
  };

  const isSubmitting = isCreateLoading || isUpdateLoading;

  const allQuestionsAnswered = template?.questions.every((q) => {
    const qId = q.id;
    if (!qId) return true;
    const answer = answers[qId];
    if (q.required) {
      if (q.type === AnnotationQuestionType.MULTIPLE_CHOICE) {
        return Array.isArray(answer) && answer.length > 0;
      }
      return answer !== undefined && answer !== null && answer !== "";
    }
    return true;
  }) ?? false;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{existingAnnotation ? "View/Edit Annotation" : "Annotate Trace"}</SheetTitle>
          <SheetDescription>
            {existingAnnotation ?
            `Review and edit the annotation for trace ${traceId}` :
            `Select an annotation queue and answer the questions to annotate trace ${traceId}`
            }
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {}
          {actionError.message &&
          <Alert variant="destructive">
              <AlertDescription>{actionError.message}</AlertDescription>
            </Alert>
          }

          {}
          <div className="space-y-2">
            <Label htmlFor="queue-select">Annotation Queue</Label>
            <Select value={selectedQueueId} onValueChange={setSelectedQueueId}>
              <SelectTrigger id="queue-select">
                <SelectValue placeholder="Select an annotation queue" />
              </SelectTrigger>
              <SelectContent>
                {(() => {
                  if (isQueuesLoading) return <div className="p-2 text-sm text-muted-foreground">Loading queues...</div>;
                  if (traceQueues.length === 0) return <div className="p-2 text-sm text-muted-foreground">No trace annotation queues found</div>;
                  return traceQueues.map((queue) =>
                  <SelectItem key={queue.id} value={queue.id}>
                      {queue.name}
                    </SelectItem>
                  );
                })()}
              </SelectContent>
            </Select>
          </div>

          {}
          {selectedQueueId &&
          <div className="space-y-6">
              <AnnotationQuestionsContent
              isTemplateLoading={isTemplateLoading}
              questions={template?.questions}
              answers={answers}
              readOnly={false}
              onAnswerChange={(questionId, value) => {
                setAnswers((prev) => ({
                  ...prev,
                  [questionId]: value
                }));
              }} />

            </div>
          }
        </div>

        <SheetFooter className="mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}>

            Cancel
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit();
            }}
            disabled={isSubmitting || !allQuestionsAnswered || isTemplateLoading || !selectedQueueId}>

            {(() => {
              const submitLabel = existingAnnotation ? "Update Annotation" : "Submit Annotation";
              return isSubmitting ?
              <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </> :
              submitLabel;
            })()}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>);

}