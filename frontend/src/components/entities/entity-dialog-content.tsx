import { MessageMatching } from "@/types/entities";
import { MatchPatternType, EntityType } from "@/types/enums";
import { EntityTypeStep } from "./forms/entity-type-step";
import { BasicInfoStep } from "./forms/basic-info-step";
import { MatchingStep } from "./forms/matching-step";
import { EntitySpecificStep } from "./forms/entity-specific-step";
import { MessageMatchingStep } from "./forms/message-matching-step";
import { CustomEntityStep } from "./forms/custom-entity-step";
import { FormData } from "@/hooks/entity/use-entity-form";

interface EntityDialogContentProps {
  currentStep: number;
  formData: FormData;
  isLoading: boolean;
  totalSteps: number;
  onFieldChange: (field: keyof FormData, value: string | MatchPatternType | EntityType | undefined) => void;
  onAttributesChange: (attributes: FormData["entityHighlights"]) => void;
  onMessageMatchingChange: (messageMatching: MessageMatching) => void;
}

export function EntityDialogContent({
  currentStep,
  formData,
  isLoading,
  totalSteps,
  onFieldChange,
  onAttributesChange,
  onMessageMatchingChange
}: Readonly<EntityDialogContentProps>) {

  const isModelEntity = formData.entityType === EntityType.MODEL;
  const isCustomEntity = formData.entityType === EntityType.CUSTOM;

  switch (currentStep) {
    case 1:

      if (isCustomEntity) {
        return (
          <fieldset className="border-0 p-0 m-0 space-y-4">
            <EntityTypeStep
              entityType={formData.entityType}
              onEntityTypeChange={(type) => onFieldChange('entityType', type)}
              disabled={isLoading} />

            <CustomEntityStep
              customType={formData.customType || ""}
              iconId={formData.iconId}
              onCustomTypeChange={(value) => onFieldChange('customType', value)}
              onIconChange={(value) => onFieldChange('iconId', value)}
              disabled={isLoading} />

          </fieldset>);

      }

      return (
        <fieldset className="border-0 p-0 m-0 space-y-4">
          <EntityTypeStep
            entityType={formData.entityType}
            onEntityTypeChange={(type) => onFieldChange('entityType', type)}
            disabled={isLoading} />

          <BasicInfoStep
            name={formData.name}
            description={formData.description}
            onNameChange={(value) => onFieldChange('name', value)}
            onDescriptionChange={(value) => onFieldChange('description', value)}
            disabled={isLoading} />

        </fieldset>);

    case 2:

      if (isCustomEntity) {
        return (
          <fieldset className="border-0 p-0 m-0 space-y-4">
            <BasicInfoStep
              name={formData.name}
              description={formData.description}
              onNameChange={(value) => onFieldChange('name', value)}
              onDescriptionChange={(value) => onFieldChange('description', value)}
              disabled={isLoading} />

          </fieldset>);

      }

      return (
        <fieldset className="border-0 p-0 m-0 space-y-4">
          <MatchingStep
            attributeName={formData.attributeName}
            matchPatternType={formData.matchPatternType}
            matchValue={formData.matchValue}
            matchPatttern={formData.matchPatttern}
            onAttributeNameChange={(value) => onFieldChange('attributeName', value)}
            onMatchPatternTypeChange={(value) => onFieldChange('matchPatternType', value)}
            onMatchValueChange={(value) => onFieldChange('matchValue', value)}
            onMatchPatternChange={(value) => onFieldChange('matchPatttern', value)}
            disabled={isLoading} />

        </fieldset>);

    case 3:

      if (isCustomEntity) {
        return (
          <fieldset className="border-0 p-0 m-0 space-y-4">
            <MatchingStep
              attributeName={formData.attributeName}
              matchPatternType={formData.matchPatternType}
              matchValue={formData.matchValue}
              matchPatttern={formData.matchPatttern}
              onAttributeNameChange={(value) => onFieldChange('attributeName', value)}
              onMatchPatternTypeChange={(value) => onFieldChange('matchPatternType', value)}
              onMatchValueChange={(value) => onFieldChange('matchValue', value)}
              onMatchPatternChange={(value) => onFieldChange('matchPatttern', value)}
              disabled={isLoading} />

          </fieldset>);

      }

      return (
        <fieldset className="border-0 p-0 m-0 space-y-4">
          <EntitySpecificStep
            entityType={formData.entityType}
            attributes={formData.entityHighlights}
            onAttributesChange={onAttributesChange}
            disabled={isLoading} />

        </fieldset>);

    case 4:

      if (isCustomEntity) {
        return (
          <fieldset className="border-0 p-0 m-0 space-y-4">
            <EntitySpecificStep
              entityType={formData.entityType}
              attributes={formData.entityHighlights}
              onAttributesChange={onAttributesChange}
              disabled={isLoading} />

          </fieldset>);

      }

      if (isModelEntity) {
        return (
          <fieldset className="border-0 p-0 m-0 space-y-4">
            <MessageMatchingStep
              messageMatching={formData.messageMatching}
              onMessageMatchingChange={onMessageMatchingChange}
              disabled={isLoading} />

          </fieldset>);

      }
      return null;
    case 5:

      if (isModelEntity) {
        return (
          <fieldset className="border-0 p-0 m-0 space-y-4">
            <MessageMatchingStep
              messageMatching={formData.messageMatching}
              onMessageMatchingChange={onMessageMatchingChange}
              disabled={isLoading} />

          </fieldset>);

      }
      return null;
    default:
      return null;
  }
}