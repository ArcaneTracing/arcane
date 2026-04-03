"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger } from
"@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateProject, useUpdateProject } from "@/hooks/projects/use-projects-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ProjectResponse } from "@/types/projects";
import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/lib/permissions";
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation";
import { DialogErrorHandler } from "@/components/shared/dialog-error-handler";
import { useMutationAction } from "@/hooks/shared/use-mutation-action";
import { showSuccessToast } from "@/lib/toast";

export interface ProjectDialogProps {
  project?: ProjectResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

interface FormData {
  name: string;
  description: string;
  traceFilterAttributeName?: string;
  traceFilterAttributeValue?: string;
}

export function ProjectDialog({ project, open, onOpenChange, trigger }: Readonly<ProjectDialogProps>) {
  const organisationId = useOrganisationIdOrNull();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    traceFilterAttributeName: "",
    traceFilterAttributeValue: ""
  });

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const mutation = project ? updateMutation : createMutation;
  const isEditMode = !!project;


  const mutationAction = useMutationAction({
    mutation,
    onSuccess: () => {
      onOpenChange(false);
      showSuccessToast(isEditMode ? 'Project updated successfully' : 'Project created successfully');
    },
    showErrorToast: true
  });

  const isLoading = mutationAction.isPending;


  useEffect(() => {
    if (project && open) {
      setFormData({
        name: project.name,
        description: project.description || "",
        traceFilterAttributeName: project.traceFilterAttributeName || "",
        traceFilterAttributeValue: project.traceFilterAttributeValue || ""
      });
    } else if (!open) {
      setFormData({
        name: "",
        description: "",
        traceFilterAttributeName: "",
        traceFilterAttributeValue: ""
      });
    }
  }, [project, open]);


  const validateTraceFilter = (): boolean => {
    const hasName = !!formData.traceFilterAttributeName?.trim();
    const hasValue = !!formData.traceFilterAttributeValue?.trim();

    if (hasName && !hasValue) {
      return false;
    }
    if (hasValue && !hasName) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();


    if (!validateTraceFilter()) {

      return;
    }

    try {

      const submitData = {
        name: formData.name,
        description: formData.description,
        ...(formData.traceFilterAttributeName?.trim() && formData.traceFilterAttributeValue?.trim() ?
        {
          traceFilterAttributeName: formData.traceFilterAttributeName.trim(),
          traceFilterAttributeValue: formData.traceFilterAttributeValue.trim()
        } :
        {
          traceFilterAttributeName: undefined,
          traceFilterAttributeValue: undefined
        })
      };

      if (isEditMode) {
        if (!project) return;
        await updateMutation.mutateAsync({ id: project.id, data: submitData });
      } else {
        await createMutation.mutateAsync(submitData);
      }

    } catch (err) {
      console.error(err);
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-[#0D0D0D] rounded-2xl shadow-lg border-0 sm:max-w-[480px] p-0">
        <DialogErrorHandler mutation={mutation} errorDisplayPosition="top">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="px-6 pt-8 pb-6">
              <DialogTitle className="text-xl font-semibold dark:text-white">
                {isEditMode ? 'Navigate Your Expedition' : 'Start a New Expedition'}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                {isEditMode ?
                'Refine your course and update your project details for the journey ahead.' :
                'Launch your next big adventure in the deep.'}
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 space-y-4">
              <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium dark:text-gray-200">
                  Name
                </Label>
                <Input
                    id="name"
                    placeholder="Enter project name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    disabled={isLoading}
                    required />

              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium dark:text-gray-200">
                  Description
                </Label>
                <Input
                    id="description"
                    placeholder="Enter project description"
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-transparent focus:ring-blue-600 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    disabled={isLoading} />

              </div>

              <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-[#2A2A2A]">
                <div>
                  <Label className="text-sm font-medium dark:text-gray-200">
                    Trace Attribute Filter (Optional)
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Configure an attribute filter that will be automatically applied to all trace searches in this project. Both fields must be provided together.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="traceFilterAttributeName" className="text-sm font-medium dark:text-gray-200">
                    Attribute Name
                  </Label>
                  <Input
                      id="traceFilterAttributeName"
                      placeholder="e.g., project.id"
                      value={formData.traceFilterAttributeName || ""}
                      onChange={(e) => handleFieldChange('traceFilterAttributeName', e.target.value)}
                      className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-transparent focus:ring-blue-600 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      disabled={isLoading} />

                </div>
                <div className="space-y-2">
                  <Label htmlFor="traceFilterAttributeValue" className="text-sm font-medium dark:text-gray-200">
                    Attribute Value
                  </Label>
                  <Input
                      id="traceFilterAttributeValue"
                      placeholder="e.g., project-123"
                      value={formData.traceFilterAttributeValue || ""}
                      onChange={(e) => handleFieldChange('traceFilterAttributeValue', e.target.value)}
                      className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-transparent focus:ring-blue-600 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      disabled={isLoading} />

                  {!validateTraceFilter() && (formData.traceFilterAttributeName?.trim() || formData.traceFilterAttributeValue?.trim()) &&
                    <p className="text-xs text-red-500 dark:text-red-400">
                      Both attribute name and value must be provided together.
                    </p>
                    }
                </div>
              </div>
              </div>
            </div>

          <div className="flex justify-end gap-2 px-6 py-6 mt-4">
            <Button
                type="button"
                variant="modern"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-9 px-4 text-sm font-medium"
                disabled={isLoading}>

              Cancel
            </Button>
            {isEditMode ?
              <PermissionGuard
                permission={PERMISSIONS.PROJECT.UPDATE}
                organisationId={organisationId || undefined}
                projectId={project?.id || undefined}>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading}
                  className="h-9 px-4 text-sm font-medium">

                  {isLoading ?
                  <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </> :

                  'Save'
                  }
                </Button>
              </PermissionGuard> :

              <Button
                type="submit"
                size="sm"
                disabled={isLoading}
                className="h-9 px-4 text-sm font-medium">

                {isLoading ?
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </> :

                'Save'
                }
              </Button>
              }
          </div>
          </form>
        </DialogErrorHandler>
      </DialogContent>
    </Dialog>);

}