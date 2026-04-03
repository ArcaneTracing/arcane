"use client";

import { useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { MessageMatching } from "@/types/entities";
import { MessageMatchingType } from "@/types/enums";
import { CanonicalMessageMatchingStep } from "./canonical-message-matching-step";
import { FlatMessageMatchingStep } from "./flat-message-matching-step";
import { InfoButton } from "@/components/shared/info-button";
import { entityTooltips } from "@/constants/entity-tooltips";

interface MessageMatchingStepProps {
  messageMatching: MessageMatching;
  onMessageMatchingChange: (messageMatching: MessageMatching) => void;
  disabled?: boolean;
}

export function MessageMatchingStep({
  messageMatching,
  onMessageMatchingChange,
  disabled
}: Readonly<MessageMatchingStepProps>) {
  const handleTypeChange = useCallback((type: MessageMatchingType) => {

    if (type === MessageMatchingType.CANONICAL) {
      onMessageMatchingChange({
        type,
        canonicalMessageMatchingConfiguration: messageMatching.canonicalMessageMatchingConfiguration || {
          inputAttributeKey: "",
          outputAttributeKey: ""
        },
        flatMessageMatchingConfiguration: null
      });
    } else {
      onMessageMatchingChange({
        type,
        canonicalMessageMatchingConfiguration: null,
        flatMessageMatchingConfiguration: messageMatching.flatMessageMatchingConfiguration || {
          flatInputMessageMatchingKeys: {
            rolePattern: "",
            contentPattern: "",
            namePattern: "",
            toolMessageCallPattern: "",
            toolCallFunctionNamePattern: "",
            toolCallIdPattern: "",
            toolCallFunctionArgumentPattern: ""
          },
          flatOutputMessageMatchingKeys: {
            rolePattern: "",
            contentPattern: "",
            namePattern: "",
            toolMessageCallPattern: "",
            toolCallFunctionNamePattern: "",
            toolCallIdPattern: "",
            toolCallFunctionArgumentPattern: ""
          }
        }
      });
    }
  }, [messageMatching, onMessageMatchingChange]);

  const handleCanonicalConfigurationChange = (configuration: NonNullable<MessageMatching['canonicalMessageMatchingConfiguration']>) => {
    onMessageMatchingChange({
      ...messageMatching,
      canonicalMessageMatchingConfiguration: configuration
    });
  };

  const handleFlatConfigurationChange = (configuration: NonNullable<MessageMatching['flatMessageMatchingConfiguration']>) => {
    onMessageMatchingChange({
      ...messageMatching,
      flatMessageMatchingConfiguration: configuration
    });
  };

  const isCanonical = messageMatching.type === MessageMatchingType.CANONICAL;


  useEffect(() => {
    if (isCanonical && !messageMatching.canonicalMessageMatchingConfiguration) {
      handleTypeChange(MessageMatchingType.CANONICAL);
    } else if (!isCanonical && !messageMatching.flatMessageMatchingConfiguration) {
      handleTypeChange(MessageMatchingType.FLAT);
    }
  }, [messageMatching.type, messageMatching.canonicalMessageMatchingConfiguration, messageMatching.flatMessageMatchingConfiguration, isCanonical, handleTypeChange]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium dark:text-gray-200">
            Message Matching Type <span className="text-red-500">*</span>
          </Label>
          <InfoButton
            content={
            <div className="space-y-2">
                <p><strong>Canonical (OpenTelemetry Format):</strong> {entityTooltips.messageMatching.canonical}</p>
                <p><strong>Flat (Individual Span Attributes):</strong> {entityTooltips.messageMatching.flat}</p>
              </div>
            }
            maxWidth="max-w-lg" />

        </div>
        <Select
          value={messageMatching.type}
          onValueChange={(value) => handleTypeChange(value as MessageMatchingType)}
          disabled={disabled}>

          <SelectTrigger className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm">
            <SelectValue placeholder="Select message matching type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={MessageMatchingType.CANONICAL}>
              Canonical (OpenTelemetry Format)
            </SelectItem>
            <SelectItem value={MessageMatchingType.FLAT}>
              Flat (Individual Span Attributes)
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {isCanonical ?
          "Messages are stored in OpenTelemetry format with input and output attribute keys." :
          "Each message role, tool, and content is stored as a different span attribute."}
        </p>
      </div>

      {isCanonical ?
      messageMatching.canonicalMessageMatchingConfiguration &&
      <CanonicalMessageMatchingStep
        configuration={messageMatching.canonicalMessageMatchingConfiguration}
        onConfigurationChange={handleCanonicalConfigurationChange}
        disabled={disabled} /> :
      messageMatching.flatMessageMatchingConfiguration &&
      <FlatMessageMatchingStep
        configuration={messageMatching.flatMessageMatchingConfiguration}
        onConfigurationChange={handleFlatConfigurationChange}
        disabled={disabled} />


      }
    </div>);

}