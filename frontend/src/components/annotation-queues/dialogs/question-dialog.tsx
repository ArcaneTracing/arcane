"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import { AnnotationQuestionResponse, AnnotationQuestionType } from '@/types';
import { QuestionPreview } from '@/components/annotation-queues/question-preview/question-preview';

interface QuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: AnnotationQuestionResponse | null;
  onSave: (question: AnnotationQuestionResponse) => void;
  isLoading: boolean;
}

export function QuestionDialog({ open, onOpenChange, question, onSave, isLoading }: Readonly<QuestionDialogProps>) {
  const [formData, setFormData] = useState<AnnotationQuestionResponse>({
    id: question?.id,
    question: question?.question || '',
    helperText: question?.helperText,
    placeholder: question?.placeholder,
    type: question?.type || AnnotationQuestionType.FREEFORM,
    options: question?.options,
    min: question?.min,
    max: question?.max,
    required: question?.required ?? false,
    default: question?.default
  });

  const [optionsText, setOptionsText] = useState(
    question?.options?.join(', ') || ''
  );

  useEffect(() => {
    if (question) {
      setFormData({ ...question });
      setOptionsText(question.options?.join(', ') || '');
    } else {
      setFormData({
        id: `question-${Date.now()}`,
        question: '',
        type: AnnotationQuestionType.FREEFORM,
        required: false,
        helperText: undefined,
        placeholder: undefined,
        options: undefined,
        min: undefined,
        max: undefined,
        default: undefined
      });
      setOptionsText('');
    }
  }, [question, open]);

  const handleFieldChange = (field: keyof AnnotationQuestionResponse, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const requiresOptions =
    formData.type === AnnotationQuestionType.MULTIPLE_CHOICE ||
    formData.type === AnnotationQuestionType.SINGLE_CHOICE;

    if (!formData.question.trim()) {
      return;
    }

    const normalizedOptions =
    requiresOptions && optionsText ?
    optionsText.
    split(',').
    map((opt) => opt.trim()).
    filter(Boolean) :
    undefined;

    if (requiresOptions && (!optionsText.trim() || !normalizedOptions || normalizedOptions.length === 0)) {
      return;
    }

    const questionData: AnnotationQuestionResponse = {
      ...formData,
      options: normalizedOptions
    };

    onSave(questionData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {question ? 'Edit Question' : 'Add Question'}
          </DialogTitle>
          <DialogDescription>
            Configure the question for your annotation template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="questionName">Question *</Label>
            <Input
              id="questionName"
              placeholder="e.g., Is the response helpful?"
              value={formData.question}
              onChange={(e) => handleFieldChange('question', e.target.value)}
              disabled={isLoading}
              required />

          </div>

          <div className="space-y-2">
            <Label htmlFor="questionType">Question Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleFieldChange('type', value)}
              disabled={isLoading}>

              <SelectTrigger id="questionType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AnnotationQuestionType.FREEFORM}>Freeform</SelectItem>
                <SelectItem value={AnnotationQuestionType.BOOLEAN}>Boolean</SelectItem>
                <SelectItem value={AnnotationQuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
                <SelectItem value={AnnotationQuestionType.NUMERIC}>Numeric</SelectItem>
                <SelectItem value={AnnotationQuestionType.SINGLE_CHOICE}>Single Choice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.type === AnnotationQuestionType.MULTIPLE_CHOICE ||
          formData.type === AnnotationQuestionType.SINGLE_CHOICE) &&
          <div className="space-y-2">
              <Label htmlFor="options">Options (comma-separated) *</Label>
              <Input
              id="options"
              placeholder="e.g., High, Medium, Low"
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              disabled={isLoading}
              required />

            </div>
          }

          {formData.type === AnnotationQuestionType.NUMERIC &&
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min">Min</Label>
                <Input
                id="min"
                type="number"
                value={formData.min ?? ''}
                onChange={(e) => handleFieldChange('min', e.target.value ? Number(e.target.value) : undefined)}
                disabled={isLoading} />

              </div>
              <div className="space-y-2">
                <Label htmlFor="max">Max</Label>
                <Input
                id="max"
                type="number"
                value={formData.max ?? ''}
                onChange={(e) => handleFieldChange('max', e.target.value ? Number(e.target.value) : undefined)}
                disabled={isLoading} />

              </div>
            </div>
          }

          <div className="space-y-2">
            <Label htmlFor="helperText">Helper Text</Label>
            <Textarea
              id="helperText"
              placeholder="Provide additional guidance for annotators"
              value={formData.helperText ?? ''}
              onChange={(e) => handleFieldChange('helperText', e.target.value || undefined)}
              disabled={isLoading}
              rows={2} />

          </div>

          {formData.type !== AnnotationQuestionType.BOOLEAN &&
          <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder</Label>
              <Input
              id="placeholder"
              placeholder="Enter placeholder text"
              value={formData.placeholder ?? ''}
              onChange={(e) => handleFieldChange('placeholder', e.target.value || undefined)}
              disabled={isLoading} />

            </div>
          }

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="required"
              checked={formData.required}
              onChange={(e) => handleFieldChange('required', e.target.checked)}
              disabled={isLoading}
              className="rounded" />

            <Label htmlFor="required">Required</Label>
          </div>

          {}
          {formData.question.trim() &&
          <div className="border-t pt-4 mt-4">
              <Label className="text-sm font-medium mb-3 block">Preview</Label>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <QuestionPreview question={formData} optionsText={optionsText} />
              </div>
            </div>
          }
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}>

            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
            isLoading ||
            !formData.question.trim() ||
            (formData.type === AnnotationQuestionType.MULTIPLE_CHOICE ||
            formData.type === AnnotationQuestionType.SINGLE_CHOICE) &&
            !optionsText.trim()
            }>

            {question ? 'Update' : 'Add'} Question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}