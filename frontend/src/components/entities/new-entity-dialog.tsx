"use client";

import { useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger } from
"@/components/ui/dialog";
import { useCreateEntity, useUpdateEntity } from "@/hooks/entities/use-entities-query";
import { EntityResponse } from "@/types/entities";
import { Stepper } from "@/components/ui/stepper";
import { useEntityForm } from "@/hooks/entity/use-entity-form";
import { EntityDialogHeader } from "./entity-dialog-header";
import { EntityDialogFooter } from "./entity-dialog-footer";
import { EntityDialogContent } from "./entity-dialog-content";
import { DialogErrorHandler } from "@/components/shared/dialog-error-handler";
import { useMutationAction } from "@/hooks/shared/use-mutation-action";
import { showSuccessToast } from "@/lib/toast";
import { TooltipProvider } from "@/components/ui/tooltip";

export interface EntityDialogProps {
  entity?: EntityResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function EntityDialog({ entity, open, onOpenChange, trigger }: Readonly<EntityDialogProps>) {
  const createMutation = useCreateEntity();
  const updateMutation = useUpdateEntity();
  const mutation = entity ? updateMutation : createMutation;
  const isEditMode = !!entity;


  const mutationAction = useMutationAction({
    mutation,
    onSuccess: () => {
      onOpenChange(false);
      showSuccessToast(isEditMode ? 'Entity updated successfully' : 'Entity created successfully');
    },
    showErrorToast: true
  });

  const isLoading = mutationAction.isPending;

  const {
    currentStep,
    formData,
    setFormData,
    STEPS,
    validateStep,
    handleNext,
    handlePrevious,
    handleFieldChange,
    prepareEntityData
  } = useEntityForm(entity, open);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();


    if (currentStep !== STEPS.length) {
      return;
    }


    if (!validateStep(currentStep)) {
      return;
    }


    const submitButton = (e.nativeEvent as any).submitter as HTMLButtonElement;
    if (submitButton && submitButton.type !== 'submit') {
      return;
    }

    const entityData = prepareEntityData();

    try {
      if (isEditMode) {
        if (!entity) return;
        await updateMutation.mutateAsync({ id: entity.id, data: entityData });
      } else {
        await createMutation.mutateAsync(entityData);
      }

    } catch (err) {

      console.error('Error submitting entity', err);
    }
  };

  const formRef = useRef<HTMLFormElement>(null);


  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'BUTTON' || (target as HTMLButtonElement).type !== 'submit') {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };
    form.addEventListener('keydown', handleKeyDown);
    return () => form.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-[#0D0D0D] rounded-2xl shadow-lg border-0 sm:max-w-[600px] p-0 max-h-[90vh] flex flex-col overflow-hidden">
        <TooltipProvider delayDuration={300} skipDelayDuration={0}>
          <DialogErrorHandler mutation={mutation} errorDisplayPosition="top">
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
            <DialogHeader className="px-6 pt-8 pb-6">
              <EntityDialogHeader isEditMode={isEditMode} />
            </DialogHeader>

            <div className="px-6 pb-4 flex-shrink-0">
              <Stepper currentStep={currentStep} steps={STEPS} />
            </div>

            <div className="px-6 space-y-4 overflow-y-auto flex-1 min-h-0">
              <EntityDialogContent
                  currentStep={currentStep}
                  formData={formData}
                  isLoading={isLoading}
                  totalSteps={STEPS.length}
                  onFieldChange={handleFieldChange}
                  onAttributesChange={(attributes) => setFormData((prev) => ({ ...prev, entityHighlights: attributes }))}
                  onMessageMatchingChange={(messageMatching) => setFormData((prev) => ({ ...prev, messageMatching }))} />

          </div>

          <EntityDialogFooter
                currentStep={currentStep}
                totalSteps={STEPS.length}
                isLoading={isLoading}
                canProceed={validateStep(currentStep)}
                isEditMode={isEditMode}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onCancel={() => onOpenChange(false)} />

          </form>
        </DialogErrorHandler>
        </TooltipProvider>
      </DialogContent>
    </Dialog>);

}