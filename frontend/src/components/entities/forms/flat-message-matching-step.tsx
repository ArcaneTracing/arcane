"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlatMessageMatchingConfiguration, FlatMessageMatchingPatterns } from "@/types/entities";
import { InfoButton } from "@/components/shared/info-button";
import { entityTooltips } from "@/constants/entity-tooltips";

interface FlatMessageMatchingStepProps {
  configuration: FlatMessageMatchingConfiguration;
  onConfigurationChange: (configuration: FlatMessageMatchingConfiguration) => void;
  disabled?: boolean;
}

export function FlatMessageMatchingStep({
  configuration,
  onConfigurationChange,
  disabled
}: Readonly<FlatMessageMatchingStepProps>) {
  const handlePatternChange = (
  section: 'flatInputMessageMatchingKeys' | 'flatOutputMessageMatchingKeys',
  field: keyof FlatMessageMatchingPatterns,
  value: string) =>
  {
    onConfigurationChange({
      ...configuration,
      [section]: {
        ...configuration[section],
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {}
      <div className="space-y-4 p-4 border border-gray-200 dark:border-[#2A2A2A] rounded-lg bg-gray-50 dark:bg-[#1A1A1A]">
        <div className="space-y-2">
          <Label className="text-sm font-medium dark:text-gray-200">
            Input Message Matching Keys
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Configure span attribute keys for input messages
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="input-role-pattern" className="text-xs font-medium dark:text-gray-300">
                Role Pattern
              </Label>
              <InfoButton content={entityTooltips.messageMatching.flatRolePattern} iconSize="sm" />
            </div>
            <Input
              id="input-role-pattern"
              placeholder="e.g., message.role"
              value={configuration.flatInputMessageMatchingKeys.rolePattern}
              onChange={(e) => handlePatternChange('flatInputMessageMatchingKeys', 'rolePattern', e.target.value)}
              className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={disabled} />

          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="input-content-pattern" className="text-xs font-medium dark:text-gray-300">
                Content Pattern
              </Label>
              <InfoButton content={entityTooltips.messageMatching.flatContentPattern} iconSize="sm" />
            </div>
            <Input
              id="input-content-pattern"
              placeholder="e.g., message.content"
              value={configuration.flatInputMessageMatchingKeys.contentPattern}
              onChange={(e) => handlePatternChange('flatInputMessageMatchingKeys', 'contentPattern', e.target.value)}
              className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={disabled} />

          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="input-name-pattern" className="text-xs font-medium dark:text-gray-300">
                Name Pattern
              </Label>
              <InfoButton content={entityTooltips.messageMatching.flatNamePattern} iconSize="sm" />
            </div>
            <Input
              id="input-name-pattern"
              placeholder="e.g., message.name"
              value={configuration.flatInputMessageMatchingKeys.namePattern}
              onChange={(e) => handlePatternChange('flatInputMessageMatchingKeys', 'namePattern', e.target.value)}
              className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={disabled} />

          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="input-tool-message-call-pattern" className="text-xs font-medium dark:text-gray-300">
                Tool Message Call Pattern
              </Label>
              <InfoButton content={entityTooltips.messageMatching.flatToolMessageCallPattern} iconSize="sm" />
            </div>
            <Input
              id="input-tool-message-call-pattern"
              placeholder="e.g., tool.message.call"
              value={configuration.flatInputMessageMatchingKeys.toolMessageCallIdPattern}
              onChange={(e) => handlePatternChange('flatInputMessageMatchingKeys', 'toolMessageCallIdPattern', e.target.value)}
              className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={disabled} />

          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="input-tool-call-function-name-pattern" className="text-xs font-medium dark:text-gray-300">
                Tool Call Function Name Pattern
              </Label>
              <InfoButton content={entityTooltips.messageMatching.flatToolCallFunctionNamePattern} iconSize="sm" />
            </div>
            <Input
              id="input-tool-call-function-name-pattern"
              placeholder="e.g., tool.call.function.name"
              value={configuration.flatInputMessageMatchingKeys.toolCallFunctionNamePattern}
              onChange={(e) => handlePatternChange('flatInputMessageMatchingKeys', 'toolCallFunctionNamePattern', e.target.value)}
              className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={disabled} />

          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="input-tool-call-id-pattern" className="text-xs font-medium dark:text-gray-300">
                Tool Call ID Pattern
              </Label>
              <InfoButton content={entityTooltips.messageMatching.flatToolCallIdPattern} iconSize="sm" />
            </div>
            <Input
              id="input-tool-call-id-pattern"
              placeholder="e.g., tool.call.id"
              value={configuration.flatInputMessageMatchingKeys.toolCallIdPattern}
              onChange={(e) => handlePatternChange('flatInputMessageMatchingKeys', 'toolCallIdPattern', e.target.value)}
              className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={disabled} />

          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="input-tool-call-function-argument-pattern" className="text-xs font-medium dark:text-gray-300">
                Tool Call Function Argument Pattern
              </Label>
              <InfoButton content={entityTooltips.messageMatching.flatToolCallFunctionArgumentPattern} iconSize="sm" />
            </div>
            <Input
              id="input-tool-call-function-argument-pattern"
              placeholder="e.g., tool.call.function.argument"
              value={configuration.flatInputMessageMatchingKeys.toolCallFunctionArgumentPattern}
              onChange={(e) => handlePatternChange('flatInputMessageMatchingKeys', 'toolCallFunctionArgumentPattern', e.target.value)}
              className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={disabled} />

          </div>
        </div>
      </div>

      {}
      <div className="space-y-4 p-4 border border-gray-200 dark:border-[#2A2A2A] rounded-lg bg-gray-50 dark:bg-[#1A1A1A]">
        <div className="space-y-2">
          <Label className="text-sm font-medium dark:text-gray-200">
            Output Message Matching Keys
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Configure span attribute keys for output messages
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="output-role-pattern" className="text-xs font-medium dark:text-gray-300">
                Role Pattern
              </Label>
              <InfoButton content={entityTooltips.messageMatching.flatRolePattern} iconSize="sm" />
            </div>
            <Input
              id="output-role-pattern"
              placeholder="e.g., message.role"
              value={configuration.flatOutputMessageMatchingKeys.rolePattern}
              onChange={(e) => handlePatternChange('flatOutputMessageMatchingKeys', 'rolePattern', e.target.value)}
              className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={disabled} />

          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="output-content-pattern" className="text-xs font-medium dark:text-gray-300">
                Content Pattern
              </Label>
              <InfoButton content={entityTooltips.messageMatching.flatContentPattern} iconSize="sm" />
            </div>
            <Input
              id="output-content-pattern"
              placeholder="e.g., message.content"
              value={configuration.flatOutputMessageMatchingKeys.contentPattern}
              onChange={(e) => handlePatternChange('flatOutputMessageMatchingKeys', 'contentPattern', e.target.value)}
              className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={disabled} />

          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="output-name-pattern" className="text-xs font-medium dark:text-gray-300">
                Name Pattern
              </Label>
              <InfoButton content={entityTooltips.messageMatching.flatNamePattern} iconSize="sm" />
            </div>
            <Input
              id="output-name-pattern"
              placeholder="e.g., message.name"
              value={configuration.flatOutputMessageMatchingKeys.namePattern}
              onChange={(e) => handlePatternChange('flatOutputMessageMatchingKeys', 'namePattern', e.target.value)}
              className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={disabled} />

          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="output-tool-message-call-pattern" className="text-xs font-medium dark:text-gray-300">
                Tool Message Call Pattern
              </Label>
              <InfoButton content={entityTooltips.messageMatching.flatToolMessageCallPattern} iconSize="sm" />
            </div>
            <Input
              id="output-tool-message-call-pattern"
              placeholder="e.g., tool.message.call"
              value={configuration.flatOutputMessageMatchingKeys.toolMessageCallIdPattern}
              onChange={(e) => handlePatternChange('flatOutputMessageMatchingKeys', 'toolMessageCallIdPattern', e.target.value)}
              className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={disabled} />

          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="output-tool-call-function-name-pattern" className="text-xs font-medium dark:text-gray-300">
                Tool Call Function Name Pattern
              </Label>
              <InfoButton content={entityTooltips.messageMatching.flatToolCallFunctionNamePattern} iconSize="sm" />
            </div>
            <Input
              id="output-tool-call-function-name-pattern"
              placeholder="e.g., tool.call.function.name"
              value={configuration.flatOutputMessageMatchingKeys.toolCallFunctionNamePattern}
              onChange={(e) => handlePatternChange('flatOutputMessageMatchingKeys', 'toolCallFunctionNamePattern', e.target.value)}
              className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={disabled} />

          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="output-tool-call-id-pattern" className="text-xs font-medium dark:text-gray-300">
                Tool Call ID Pattern
              </Label>
              <InfoButton content={entityTooltips.messageMatching.flatToolCallIdPattern} iconSize="sm" />
            </div>
            <Input
              id="output-tool-call-id-pattern"
              placeholder="e.g., tool.call.id"
              value={configuration.flatOutputMessageMatchingKeys.toolCallIdPattern}
              onChange={(e) => handlePatternChange('flatOutputMessageMatchingKeys', 'toolCallIdPattern', e.target.value)}
              className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={disabled} />

          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="output-tool-call-function-argument-pattern" className="text-xs font-medium dark:text-gray-300">
                Tool Call Function Argument Pattern
              </Label>
              <InfoButton content={entityTooltips.messageMatching.flatToolCallFunctionArgumentPattern} iconSize="sm" />
            </div>
            <Input
              id="output-tool-call-function-argument-pattern"
              placeholder="e.g., tool.call.function.argument"
              value={configuration.flatOutputMessageMatchingKeys.toolCallFunctionArgumentPattern}
              onChange={(e) => handlePatternChange('flatOutputMessageMatchingKeys', 'toolCallFunctionArgumentPattern', e.target.value)}
              className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
              disabled={disabled} />

          </div>
        </div>
      </div>
    </div>);

}