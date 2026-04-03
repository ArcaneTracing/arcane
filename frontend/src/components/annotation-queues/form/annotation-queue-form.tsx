"use client";

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AnnotationQueueResponse, AnnotationTemplateResponse, AnnotationQuestionResponse, AnnotationQueueType } from '@/types';
import { useCreateAnnotationQueue, useUpdateAnnotationQueue } from '@/hooks/annotation-queues/use-annotation-queues-query';
import { QueueDetailsForm } from '@/components/annotation-queues/form/queue-details-form';
import { QuestionsList } from '@/components/annotation-queues/form/questions-list';
import { QuestionDialog } from '@/components/annotation-queues/dialogs/question-dialog';
import { FormFooter } from '@/components/annotation-queues/form/form-footer';
import { useOrganisationIdOrNull } from '@/hooks/useOrganisation';
import { useMutationAction } from '@/hooks/shared/use-mutation-action';
import { showSuccessToast } from '@/lib/toast';
import { FormErrorDisplay } from '@/components/shared/form-error-display';

interface AnnotationQueueFormProps {
  projectId: string;
  queue?: AnnotationQueueResponse | null;
  template?: AnnotationTemplateResponse | null;
}

interface QueueFormData {
  name: string;
  description: string;
  type: AnnotationQueueType;
}

export function AnnotationQueueForm({ projectId, queue, template: initialTemplate }: Readonly<AnnotationQueueFormProps>) {
  const organisationId = useOrganisationIdOrNull();
  const navigate = useNavigate();
  const [queueFormData, setQueueFormData] = useState<QueueFormData>({
    name: '',
    description: '',
    type: AnnotationQueueType.TRACES
  });
  const [template, setTemplate] = useState<AnnotationTemplateResponse>({
    id: '',
    questions: []
  });
  const [editingQuestion, setEditingQuestion] = useState<AnnotationQuestionResponse | null>(null);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);

  const createMutation = useCreateAnnotationQueue(projectId);
  const updateMutation = useUpdateAnnotationQueue(projectId);
  const mutation = queue ? updateMutation : createMutation;
  const isEditMode = !!queue;


  const mutationAction = useMutationAction({
    mutation,
    onSuccess: () => {
      if (!organisationId) return;
      showSuccessToast(isEditMode ? 'Annotation queue updated successfully' : 'Annotation queue created successfully');
      navigate({ to: "/organisations/$organisationId/projects/$projectId/annotation-queues", params: { organisationId, projectId } });
    },
    showErrorToast: true
  });

  const isLoading = mutationAction.isPending;


  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {

      if (queueFormData.name.trim() || template.questions.length > 0) {
        e.preventDefault();
      }
    };

    globalThis.addEventListener('beforeunload', handleBeforeUnload);
    return () => globalThis.removeEventListener('beforeunload', handleBeforeUnload);
  }, [queueFormData.name, template.questions.length]);


  useEffect(() => {
    if (queue) {
      setQueueFormData({
        name: queue.name,
        description: queue.description || '',
        type: queue.type
      });

      if (initialTemplate) {
        setTemplate(initialTemplate);
      } else {
        setTemplate({
          id: queue.templateId,
          questions: []
        });
      }
    }
  }, [queue, initialTemplate]);

  const handleQueueFieldChange = (field: keyof QueueFormData, value: string | AnnotationQueueType) => {
    setQueueFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    if (!organisationId) return;
    navigate({ to: "/organisations/$organisationId/projects/$projectId/annotation-queues", params: { organisationId, projectId } });
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsQuestionDialogOpen(true);
  };

  const handleEditQuestion = (question: AnnotationQuestionResponse) => {
    setEditingQuestion(question);
    setIsQuestionDialogOpen(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setTemplate((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId)
    }));
  };

  const handleSaveQuestion = (question: AnnotationQuestionResponse) => {
    if (editingQuestion) {

      setTemplate((prev) => ({
        ...prev,
        questions: prev.questions.map((q) => q.id === question.id ? question : q)
      }));
    } else {

      setTemplate((prev) => ({
        ...prev,
        questions: [...prev.questions, question]
      }));
    }
    setIsQuestionDialogOpen(false);
    setEditingQuestion(null);
  };

  const handleSubmit = async () => {
    if (!queueFormData.name.trim()) {
      return;
    }

    if (template.questions.length === 0) {
      return;
    }

    const templateData: CreateAnnotationTemplateRequest = {
      questions: template.questions.map((q) => ({
        question: q.question,
        helperText: q.helperText,
        placeholder: q.placeholder,
        type: q.type,
        options: q.options,
        min: q.min,
        max: q.max,
        required: q.required,
        default: q.default
      }))
    };

    try {
      if (isEditMode) {
        if (!queue) return;

        const updateData = {
          name: queueFormData.name.trim(),
          description: queueFormData.description.trim() || undefined
        };
        await updateMutation.mutateAsync({
          queueId: queue.id,
          data: updateData
        });
      } else {

        const createData = {
          name: queueFormData.name.trim(),
          description: queueFormData.description.trim() || undefined,
          template: templateData,
          type: queueFormData.type
        };
        await createMutation.mutateAsync(createData);
      }

    } catch (error) {
      console.error('Error saving annotation queue:', error);

    }
  };

  return (
    <div className="flex-1 p-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="mb-4">

          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Annotation Queues
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight mb-1.5">
          {isEditMode ? 'Edit Annotation Queue' : 'Create New Annotation Queue'}
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the queue details and create the template with questions for your annotation queue.
        </p>
      </div>

      <FormErrorDisplay error={mutationAction.errorMessage} variant="default" className="mb-6" />

      <div className="bg-white dark:bg-[#0D0D0D] border border-gray-100 dark:border-[#2A2A2A] rounded-lg shadow-sm p-6 space-y-8">
        <div className="space-y-6">
          <QueueDetailsForm
            name={queueFormData.name}
            description={queueFormData.description}
            type={queueFormData.type}
            onNameChange={(value) => handleQueueFieldChange('name', value)}
            onDescriptionChange={(value) => handleQueueFieldChange('description', value)}
            onTypeChange={(value) => handleQueueFieldChange('type', value)}
            disabled={isLoading}
            isEditMode={isEditMode} />


          <QuestionsList
            questions={template.questions}
            onAdd={handleAddQuestion}
            onEdit={handleEditQuestion}
            onDelete={handleDeleteQuestion}
            isLoading={isLoading} />

        </div>
      </div>

      <FormFooter
        isLoading={isLoading}
        isEditMode={isEditMode}
        canSubmit={queueFormData.name.trim().length > 0 && template.questions.length > 0}
        onCancel={handleCancel}
        onSubmit={handleSubmit} />


      <QuestionDialog
        open={isQuestionDialogOpen}
        onOpenChange={setIsQuestionDialogOpen}
        question={editingQuestion}
        onSave={handleSaveQuestion}
        isLoading={isLoading} />

    </div>);

}