"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { PromptVersionResponse, PromptResponse } from "@/types/prompts";
import { isForbiddenError } from "@/lib/error-handling";

interface ExperimentFormPromptSelectionProps {
  prompts: PromptResponse[];
  loadingPrompts: boolean;
  selectedPromptId: string;
  setSelectedPromptId: (id: string) => void;
  promptVersions: PromptVersionResponse[];
  loadingVersions: boolean;
  promptVersionId: string;
  setPromptVersionId: (id: string) => void;
  isLoading: boolean;
  isEditMode: boolean;
  promptsError?: unknown;
  versionsError?: unknown;
}

export function ExperimentFormPromptSelection({
  prompts,
  loadingPrompts,
  selectedPromptId,
  setSelectedPromptId,
  promptVersions,
  loadingVersions,
  promptVersionId,
  setPromptVersionId,
  isLoading,
  isEditMode,
  promptsError,
  versionsError
}: Readonly<ExperimentFormPromptSelectionProps>) {
  const hasPromptsPermissionError = promptsError && isForbiddenError(promptsError);
  const hasVersionsPermissionError = versionsError && isForbiddenError(versionsError);

  const renderPromptSelectContent = () => {
    if (hasPromptsPermissionError) {
      return (
        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
          You don't have permission to view prompts
        </div>);

    }
    if (prompts.length === 0) {
      return (
        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
          No prompts available
        </div>);

    }
    return prompts.map((prompt) =>
    <SelectItem key={prompt.id} value={prompt.id}>
        {prompt.name}
      </SelectItem>
    );
  };

  const renderVersionSelectContent = () => {
    if (hasVersionsPermissionError) {
      return (
        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
          You don't have permission to view prompt versions
        </div>);

    }
    if (promptVersions.length === 0) {
      return (
        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
          No versions available
        </div>);

    }
    return promptVersions.map((version) =>
    <SelectItem key={version.id} value={version.id}>
        {version.versionName || `Version ${version.id.substring(0, 8)}`}
      </SelectItem>
    );
  };

  return (
    <>
      {}
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-sm font-medium dark:text-gray-200">
          Prompt <span className="text-red-500">*</span>
        </Label>
        <Select
          value={selectedPromptId}
          onValueChange={setSelectedPromptId}
          disabled={isLoading || isEditMode || loadingPrompts || hasPromptsPermissionError}>

          <SelectTrigger id="prompt" className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white">
            {loadingPrompts && !selectedPromptId ?
            <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading prompts...</span>
              </div> :

            <SelectValue placeholder={hasPromptsPermissionError ? "No permission" : "Select a prompt"} />
            }
          </SelectTrigger>
          <SelectContent>
            {renderPromptSelectContent()}
          </SelectContent>
        </Select>
      </div>

      {}
      <div className="space-y-2">
        <Label htmlFor="promptVersion" className="text-sm font-medium dark:text-gray-200">
          Prompt Version <span className="text-red-500">*</span>
        </Label>
        <Select
          value={promptVersionId}
          onValueChange={setPromptVersionId}
          disabled={isLoading || !selectedPromptId || loadingVersions || hasVersionsPermissionError}>

          <SelectTrigger id="promptVersion" className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white">
            {loadingVersions && !promptVersionId ?
            <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading versions...</span>
              </div> :

            <SelectValue placeholder={hasVersionsPermissionError ? "No permission" : "Select a prompt version"} />
            }
          </SelectTrigger>
          <SelectContent>
            {renderVersionSelectContent()}
          </SelectContent>
        </Select>
      </div>
    </>);

}