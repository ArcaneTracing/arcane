"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Play } from "lucide-react";
import { TemplateFormat } from "@/types/enums";
import type { ModelConfigurationResponse } from "@/types/model-configuration";
import { isForbiddenError } from "@/lib/error-handling";
import { cn } from "@/lib/utils";

const TEMPLATE_FORMATS: TemplateFormat[] = [TemplateFormat.NONE, TemplateFormat.MUSTACHE, TemplateFormat.F_STRING];

function getTemplateFormatLabel(format: TemplateFormat): string {
  if (format === TemplateFormat.NONE) return 'None';
  if (format === TemplateFormat.MUSTACHE) return 'Mustache';
  return 'F-String';
}

export interface PromptFormTopBarProps {
  templateFormat: TemplateFormat;
  modelConfigurationId: string;
  configurations: ModelConfigurationResponse[];
  isEditMode: boolean;
  isLoading: boolean;
  isRunning: boolean;
  canRun: boolean;
  onTemplateFormatChange: (format: TemplateFormat) => void;
  onModelConfigurationChange: (id: string, config: ModelConfigurationResponse | null) => void;
  onRun: () => void;
  onSave: () => void;
  error?: unknown;
  isLoadingConfigs?: boolean;

  modelConfigurationError?: string;

  modelSelectOpen?: boolean;
  onModelSelectOpenChange?: (open: boolean) => void;
}

export function PromptFormTopBar({
  templateFormat,
  modelConfigurationId,
  configurations,
  isEditMode,
  isLoading,
  isRunning,
  canRun,
  onTemplateFormatChange,
  onModelConfigurationChange,
  onRun,
  onSave,
  error,
  isLoadingConfigs = false,
  modelConfigurationError,
  modelSelectOpen,
  onModelSelectOpenChange
}: Readonly<PromptFormTopBarProps>) {
  const hasConfigsPermissionError = error && isForbiddenError(error);

  const getModelSelectPlaceholder = (): string => {
    if (isLoadingConfigs) return "Loading...";
    if (hasConfigsPermissionError) return "No permission";
    if (modelConfigurationId && configurations.length > 0 && !configurations.some((c) => c.id === modelConfigurationId)) {
      return "Loading selection...";
    }
    return "Select model configuration";
  };

  const renderSelectContent = () => {
    if (hasConfigsPermissionError) {
      return (
        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
          You don't have permission to view model configurations
        </div>);

    }
    if (configurations.length === 0) {
      return (
        <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
          No configurations available
        </div>);

    }
    return configurations.map((config) =>
    <SelectItem key={config.id} value={config.id}>
        {config.name} ({config.configuration.modelName})
      </SelectItem>
    );
  };

  return (
    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-[#2A2A2A]">
      <div className="flex items-center gap-2">
        {TEMPLATE_FORMATS.map((format) =>
        <Button
          key={format}
          type="button"
          variant={templateFormat === format ? "default" : "outline"}
          size="sm"
          onClick={() => onTemplateFormatChange(format)}
          className="h-8 text-xs">

            {getTemplateFormatLabel(format)}
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-1">
        <Select
            value={
            modelConfigurationId && configurations.some((c) => c.id === modelConfigurationId) ?
            modelConfigurationId :
            ''
            }
            onValueChange={(value) => {
              const config = configurations.find((c) => c.id === value);
              onModelConfigurationChange(value, config || null);
            }}
            disabled={isLoadingConfigs || hasConfigsPermissionError}
            open={modelSelectOpen}
            onOpenChange={onModelSelectOpenChange}>

          <SelectTrigger
              className={cn(
                "h-8 w-[200px] text-xs",
                modelConfigurationError && "border-red-500 focus:ring-red-500"
              )}>

            <SelectValue placeholder={getModelSelectPlaceholder()} />
          </SelectTrigger>
          <SelectContent>
            {renderSelectContent()}
          </SelectContent>
        </Select>
        {modelConfigurationError &&
          <p className="text-xs text-red-500">{modelConfigurationError}</p>
          }
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRun}
          disabled={isRunning || !canRun}
          className="h-8 px-4 text-xs">

          {isRunning ?
          <>
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              Running...
            </> :

          <>
              <Play className="h-3 w-3 mr-2" />
              Run
            </>
          }
        </Button>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={onSave}
          disabled={isLoading}
          className="h-8 px-4 text-xs">

          {(() => {
            if (isLoading) {
              return (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Saving...
                </>);

            }
            return isEditMode ? 'Save as New Version' : 'Save Prompt';
          })()}
        </Button>
      </div>
    </div>);

}