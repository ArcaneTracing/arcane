"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutationAction } from "@/hooks/shared/use-mutation-action";
import { showSuccessToast } from "@/lib/toast";
import { FormErrorDisplay } from "@/components/shared/form-error-display";
import { useImportEntities } from "@/hooks/entities/use-entities-query";
import {
  TEMPLATE_INFO,
  loadTemplate,
  type InstrumentationLibrary,
} from "@/lib/entity-templates/template-loader";

export interface QuickStartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function QuickStartDialog({
  open,
  onOpenChange,
  trigger,
}: Readonly<QuickStartDialogProps>) {
  const [selectedLibrary, setSelectedLibrary] =
    useState<InstrumentationLibrary | null>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const importMutation = useImportEntities();

  const mutationAction = useMutationAction({
    mutation: importMutation,
    onSuccess: () => {
      setSelectedLibrary(null);
      onOpenChange(false);
      showSuccessToast("Entities imported successfully");
    },
    showErrorToast: true,
  });

  const isLoading = mutationAction.isPending;

  const handleLibrarySelect = async (library: InstrumentationLibrary) => {
    setSelectedLibrary(library);
    setIsLoadingTemplate(true);

    try {
      const yamlContent = await loadTemplate(library);
      const blob = new Blob([yamlContent], { type: "application/x-yaml" });
      const file = new File([blob], `${library}-entities.yaml`, {
        type: "application/x-yaml",
      });

      await importMutation.mutateAsync(file);
    } catch {
      // Error handled by useMutationAction (showErrorToast)
    } finally {
      setIsLoadingTemplate(false);
    }
  };

  const libraries = Object.keys(TEMPLATE_INFO) as InstrumentationLibrary[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="rounded-2xl border-0 bg-white p-0 shadow-lg dark:bg-[#0D0D0D] sm:max-w-[600px]">
        <DialogHeader className="px-6 pb-6 pt-8">
          <DialogTitle className="text-xl font-semibold dark:text-white">
            Start from Source
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            Choose an instrumentation library to quickly import pre-configured
            entities.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6">
          <FormErrorDisplay
            error={mutationAction.errorMessage}
            variant="default"
          />

          <div className="grid grid-cols-1 gap-3">
            {libraries.map((library) => {
              const info = TEMPLATE_INFO[library];
              const isSelected = selectedLibrary === library;
              const isProcessing =
                isSelected && (isLoading || isLoadingTemplate);

              return (
                <Button
                  key={library}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  className="h-auto justify-start p-4"
                  onClick={() => handleLibrarySelect(library)}
                  disabled={isLoading || isLoadingTemplate}
                >
                  <div className="flex w-full items-center gap-3">
                    {isProcessing ? (
                      <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white dark:bg-[#1A1A1A]">
                        <img
                          src={info.logoPath}
                          alt={`${info.name} logo`}
                          className="h-8 w-8 object-contain"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 text-left">
                      <div className="font-medium">{info.name}</div>
                      <div className="text-xs opacity-70">{info.description}</div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-6 dark:border-[#2A2A2A]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 text-sm font-medium"
            disabled={isLoading || isLoadingTemplate}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
