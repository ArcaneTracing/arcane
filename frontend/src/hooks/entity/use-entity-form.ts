import { useState, useEffect } from "react";
import { EntityResponse, Highlight, MessageMatching } from "@/types/entities";
import { MatchPatternType, EntityType, HighlightValueType, MessageMatchingType } from "@/types/enums";
import { getDefaultEntityAttributes } from "@/components/entities/forms/entity-specific-step";
import { validateEntityFormStep } from "./use-entity-form-validation";

export interface FormData {
  name: string;
  description: string;
  attributeName: string;
  matchPatttern?: string;
  matchPatternType: MatchPatternType;
  matchValue: string;
  entityType: EntityType;
  entityHighlights: Highlight[];
  messageMatching: MessageMatching;
  customType?: string;
  iconId?: string;
}

const BASE_STEPS = ["Basic Info", "Matching", "Highlights"];
const CUSTOM_ENTITY_STEP = "Custom Entity";
const MESSAGE_MATCHING_STEP = "Message Matching";

const getSteps = (entityType: EntityType): string[] => {
  if (entityType === EntityType.CUSTOM) {
    return [CUSTOM_ENTITY_STEP, ...BASE_STEPS];
  }
  if (entityType === EntityType.MODEL) {
    return [...BASE_STEPS, MESSAGE_MATCHING_STEP];
  }
  return BASE_STEPS;
};

const getInitialFormData = (): FormData => ({
  name: "",
  description: "",
  attributeName: "",
  matchPatttern: "",
  matchPatternType: MatchPatternType.VALUE,
  matchValue: "",
  entityType: EntityType.MODEL,
  entityHighlights: getDefaultEntityAttributes(EntityType.MODEL),
  messageMatching: {
    type: MessageMatchingType.CANONICAL,
    canonicalMessageMatchingConfiguration: {
      inputAttributeKey: "",
      outputAttributeKey: ""
    },
    flatMessageMatchingConfiguration: {
      flatInputMessageMatchingKeys: {
        rolePattern: "",
        contentPattern: "",
        namePattern: "",
        toolMessageCallIdPattern: "",
        toolCallFunctionNamePattern: "",
        toolCallIdPattern: "",
        toolCallFunctionArgumentPattern: ""
      },
      flatOutputMessageMatchingKeys: {
        rolePattern: "",
        contentPattern: "",
        namePattern: "",
        toolMessageCallIdPattern: "",
        toolCallFunctionNamePattern: "",
        toolCallIdPattern: "",
        toolCallFunctionArgumentPattern: ""
      }
    }
  }
});

export function useEntityForm(entity: EntityResponse | null | undefined, open: boolean) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(getInitialFormData);


  const STEPS = getSteps(formData.entityType);


  useEffect(() => {
    if (entity && open) {
      setFormData({
        name: entity.name,
        description: entity.description || "",
        attributeName: entity.matchingAttributeName || "",
        matchPatttern: entity.matchingPattern || "",
        matchPatternType: entity.matchingPatternType || MatchPatternType.VALUE,
        matchValue: entity.matchingValue || "",
        entityType: entity.entityType || EntityType.MODEL,
        entityHighlights: entity.entityHighlights || getDefaultEntityAttributes(entity.entityType || EntityType.MODEL),
        messageMatching: entity.messageMatching || getInitialFormData().messageMatching,
        customType: entity.entityType === EntityType.CUSTOM ? entity.type : undefined,
        iconId: entity.iconId
      });
      setCurrentStep(1);
    } else if (!open) {
      setFormData(getInitialFormData());
      setCurrentStep(1);
    }
  }, [entity, open]);


  useEffect(() => {
    const steps = getSteps(formData.entityType);


    if (formData.entityType === EntityType.CUSTOM && currentStep > 1 && currentStep <= steps.length) {
      /* No step adjustment needed for CUSTOM in this range */
    } else if (formData.entityType !== EntityType.CUSTOM && currentStep === 1 && steps[0] === CUSTOM_ENTITY_STEP) {
      setCurrentStep(1);
    }


    if (currentStep === 5 && formData.entityType !== EntityType.MODEL) {
      setCurrentStep(4);
    }

    if (currentStep > steps.length) {
      setCurrentStep(steps.length);
    }
  }, [formData.entityType, currentStep]);

  const validateStep = (step: number): boolean => {
    const steps = getSteps(formData.entityType);
    const stepName = steps[step - 1];
    return validateEntityFormStep({ step, stepName, formData });
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const steps = getSteps(formData.entityType);
    if (validateStep(currentStep) && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string | MatchPatternType | EntityType | MessageMatchingType | MessageMatching | undefined) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === 'entityType' && value !== EntityType.CUSTOM) {
        updated.customType = undefined;
        updated.iconId = undefined;
      }
      return updated;
    });
  };

  const prepareEntityData = (): Partial<EntityResponse> => {
    const normalizedHighlights = formData.entityHighlights.
    map((highlight) => ({
      title: highlight.title.trim(),
      key: highlight.key.trim(),
      valueType: highlight.valueType || HighlightValueType.STRING
    })).
    filter((highlight) => highlight.title.length > 0 && highlight.key.length > 0);

    const entityData: Partial<EntityResponse> = {
      name: formData.name,
      description: formData.description || undefined,
      type: formData.entityType === EntityType.CUSTOM ?
      formData.customType || "" :
      normalizedHighlights[0]?.key || "",
      entityHighlights: normalizedHighlights,
      matchingAttributeName: formData.attributeName,
      matchingPatternType: formData.matchPatternType,
      entityType: formData.entityType,
      messageMatching: formData.messageMatching
    };


    if (formData.entityType === EntityType.CUSTOM && formData.iconId) {
      entityData.iconId = formData.iconId;
    }

    if (formData.matchPatternType === MatchPatternType.REGEX) {
      entityData.matchingPattern = formData.matchPatttern || "";
    }

    if (formData.matchPatternType === MatchPatternType.VALUE) {
      entityData.matchingValue = formData.matchValue;
    }

    return entityData;
  };

  return {
    currentStep,
    formData,
    setFormData,
    STEPS,
    validateStep,
    handleNext,
    handlePrevious,
    handleFieldChange,
    prepareEntityData
  };
}