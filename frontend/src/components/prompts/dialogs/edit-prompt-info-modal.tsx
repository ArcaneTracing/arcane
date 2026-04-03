"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from
"@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PromptResponse } from "@/types/prompts";
import { useUpdatePrompt } from "@/hooks/prompts/use-prompts-query";
import { showSuccessToast } from "@/lib/toast";

export interface EditPromptInfoModalProps {
  prompt: PromptResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  projectId: string;
}

export function EditPromptInfoModal({
  prompt,
  open,
  onOpenChange,
  onSuccess,
  projectId
}: Readonly<EditPromptInfoModalProps>) {
  const [name, setName] = useState(prompt.name);
  const [description, setDescription] = useState(prompt.description ?? "");

  const updateMutation = useUpdatePrompt(projectId);

  useEffect(() => {
    if (open) {
      setName(prompt.name);
      setDescription(prompt.description ?? "");
    }
  }, [open, prompt.name, prompt.description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === "") return;
    try {
      await updateMutation.mutateAsync({
        id: prompt.id,
        data: {
          name: name.trim(),
          description: description.trim() || undefined
        }
      });
      showSuccessToast("Prompt updated");
      onOpenChange(false);
      onSuccess?.();
    } catch {

    }
  };

  const hasChanges = name !== prompt.name || description !== (prompt.description ?? "");
  const isLoading = updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit prompt</DialogTitle>
          <DialogDescription>
            Update the prompt name and description. This does not create a new version.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-prompt-name">Name</Label>
              <Input
                id="edit-prompt-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter prompt name"
                disabled={isLoading} />

            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-prompt-description">Description</Label>
              <Input
                id="edit-prompt-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter prompt description"
                disabled={isLoading} />

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
            <Button type="submit" disabled={isLoading || !hasChanges}>
              {isLoading ?
              <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </> :

              "Save"
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);

}