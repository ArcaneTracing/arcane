"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger } from
"@/components/ui/dialog";
import { useCreateConversationConfiguration, useUpdateConversationConfiguration } from "@/hooks/conversation/use-conversation-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConversationConfigurationResponse, CreateConversationConfigurationRequest, UpdateConversationConfigurationRequest } from "@/types/conversation-configuration";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { DialogErrorHandler } from "@/components/shared/dialog-error-handler";
import { useMutationAction } from "@/hooks/shared/use-mutation-action";
import { showSuccessToast } from "@/lib/toast";
import { InfoButton } from "@/components/shared/info-button";
import { conversationTooltips } from "@/constants/conversation-tooltips";
import { TooltipProvider } from "@/components/ui/tooltip";

export interface ConversationDialogProps {
  configuration?: ConversationConfigurationResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function ConversationDialog({ configuration, open, onOpenChange, trigger }: Readonly<ConversationDialogProps>) {
  const createMutation = useCreateConversationConfiguration();
  const updateMutation = useUpdateConversationConfiguration();
  const mutation = configuration ? updateMutation : createMutation;
  const isEditMode = !!configuration;


  const mutationAction = useMutationAction({
    mutation,
    onSuccess: () => {
      onOpenChange(false);
      showSuccessToast(isEditMode ? 'Conversation configuration updated successfully' : 'Conversation configuration created successfully');
    },
    showErrorToast: true
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stitchingAttributesName, setStitchingAttributesName] = useState<{ id: string; value: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isLoading = mutationAction.isPending;


  useEffect(() => {
    if (open) {
      if (isEditMode && configuration) {
        setName(configuration.name || "");
        setDescription(configuration.description || "");
        setStitchingAttributesName(
          (configuration.stitchingAttributesName || []).map((v) => ({ id: crypto.randomUUID(), value: v }))
        );
      } else {
        setName("");
        setDescription("");
        setStitchingAttributesName([]);
      }
      setError(null);
    }
  }, [open, isEditMode, configuration]);

  const handleAddAttribute = () => {
    setStitchingAttributesName([...stitchingAttributesName, { id: crypto.randomUUID(), value: "" }]);
  };

  const handleRemoveAttribute = (id: string) => {
    setStitchingAttributesName(stitchingAttributesName.filter((a) => a.id !== id));
  };

  const handleAttributeChange = (id: string, value: string) => {
    setStitchingAttributesName(
      stitchingAttributesName.map((a) => (a.id === id ? { ...a, value } : a))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Name cannot be empty");
      return;
    }


    const validAttributes = stitchingAttributesName
      .map((a) => a.value.trim())
      .filter((v) => v !== "");

    if (validAttributes.length === 0) {
      setError("At least one stitching attribute name is required");
      return;
    }


    const uniqueAttributes = new Set(validAttributes.map((attr) => attr.toLowerCase()));
    if (uniqueAttributes.size !== validAttributes.length) {
      setError("Duplicate attribute names are not allowed");
      return;
    }

    try {
      const data: CreateConversationConfigurationRequest | UpdateConversationConfigurationRequest = {
        name: trimmedName,
        description: description.trim() || undefined,
        stitchingAttributesName: validAttributes
      };

      if (isEditMode) {
        if (!configuration) return;
        await updateMutation.mutateAsync({ id: configuration.id, data });
      } else {
        await createMutation.mutateAsync(data as CreateConversationConfigurationRequest);
      }

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="bg-white dark:bg-[#0D0D0D] rounded-2xl shadow-lg border-0 sm:max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden">
        <TooltipProvider delayDuration={300} skipDelayDuration={0}>
          <DialogErrorHandler mutation={mutation} errorDisplayPosition="top">
            <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? "Edit Conversation Configuration" : "Create Conversation Configuration"}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                  {conversationTooltips.dialog.header}
                </DialogDescription>
              </DialogHeader>

            <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0">
              {error &&
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                }

            <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
                <strong>OR Operation:</strong> Traces will be grouped into conversations if they share the same value for <strong>any</strong> of the configured attribute names. Multiple attribute names are combined with an OR operation - this means a trace matches if it has a matching value for ANY of the attributes, not all of them.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <InfoButton content={conversationTooltips.form.name} />
              </div>
              <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Default Conversation"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="w-full"
                    autoFocus />

            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="description">
                  Description
                </Label>
                <InfoButton content={conversationTooltips.form.description} />
              </div>
              <Textarea
                    id="description"
                    placeholder="Optional description for this conversation configuration"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading}
                    className="w-full min-h-[80px]" />

            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>
                  Stitching Attribute Names <span className="text-red-500">*</span>
                </Label>
                <InfoButton content={conversationTooltips.form.stitchingAttributesHeader} />
              </div>
              <p className="text-xs text-muted-foreground">
                Configure span attribute names that will stitch traces together for a conversation.
              </p>
              
              <div className="space-y-3">
                {stitchingAttributesName.length === 0 ?
                    <div className="flex items-center justify-center h-[100px] text-muted-foreground border border-dashed rounded-lg">
                    <div className="text-center">
                      <p className="mb-2 text-sm">No attribute names configured</p>
                      <Button
                          type="button"
                          onClick={handleAddAttribute}
                          variant="outline"
                          size="sm"
                          disabled={isLoading}
                          className="flex items-center gap-2">

                        <Plus className="h-4 w-4" />
                        Add Attribute Name
                      </Button>
                    </div>
                  </div> :

                    stitchingAttributesName.map((attr, index) =>
                    <div
                      key={attr.id}
                      className="rounded-xl border border-gray-200 dark:border-[#2A2A2A] p-3 space-y-2">

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Attribute Name {index + 1}
                          </Label>
                          <InfoButton content={conversationTooltips.form.stitchingAttributeInput} iconSize="sm" />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAttribute(attr.id)}
                          disabled={isLoading}
                          className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 h-8 w-8">

                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove attribute</span>
                        </Button>
                      </div>

                      <Input
                        type="text"
                        placeholder="e.g., conversation.id, trace.conversation_id"
                        value={attr.value}
                        onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                        disabled={isLoading}
                        className="w-full" />

                    </div>
                    )
                    }

                {stitchingAttributesName.length > 0 &&
                    <Button
                      type="button"
                      onClick={handleAddAttribute}
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      className="flex items-center gap-2 w-full">

                    <Plus className="h-4 w-4" />
                    Add Another Attribute Name
                  </Button>
                    }
              </div>
            </div>
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
                  type="submit"
                  disabled={isLoading || !name.trim() || stitchingAttributesName.every((a) => a.value.trim() === "")}>

              {(() => {
                    if (isLoading) return "Saving...";
                    if (isEditMode) return "Save Changes";
                    return "Create Configuration";
                  })()}
            </Button>
          </DialogFooter>
        </form>
        </DialogErrorHandler>
        </TooltipProvider>
      </DialogContent>
    </Dialog>);

}