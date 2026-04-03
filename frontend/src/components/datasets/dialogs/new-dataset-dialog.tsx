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
import { useCreateDataset, useUpdateDataset } from "@/hooks/datasets/use-datasets-query";
import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DatasetListItemResponse, CreateDatasetRequest, UpdateDatasetRequest } from "@/types/datasets";
import { DialogErrorHandler } from "@/components/shared/dialog-error-handler";
import { useMutationAction } from "@/hooks/shared/use-mutation-action";
import { showSuccessToast } from "@/lib/toast";

export interface DatasetDialogProps {
  dataset?: DatasetListItemResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  projectId: string;
}

interface FormData {
  name: string;
  description: string;
  columns: string[];
}

export function DatasetDialog({ dataset, open, onOpenChange, trigger, projectId }: Readonly<DatasetDialogProps>) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    columns: [""]
  });

  const createMutation = useCreateDataset(projectId);
  const updateMutation = useUpdateDataset(projectId);
  const mutation = dataset ? updateMutation : createMutation;
  const isEditMode = !!dataset;


  const mutationAction = useMutationAction({
    mutation,
    onSuccess: () => {
      onOpenChange(false);
      showSuccessToast(isEditMode ? 'Dataset updated successfully' : 'Dataset created successfully');
    },
    showErrorToast: true
  });

  const isLoading = mutationAction.isPending;


  const validColumns = formData.columns.filter((col) => col.trim() !== "");
  const canSubmit = isEditMode || validColumns.length > 0;


  useEffect(() => {
    if (dataset && open) {


      setFormData({
        name: dataset.name,
        description: dataset.description || "",
        columns: [""]
      });
    } else if (!open) {
      setFormData({
        name: "",
        description: "",
        columns: [""]
      });
    }
  }, [dataset, open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();


    const header = formData.columns.filter((col) => col.trim() !== "");

    try {
      if (isEditMode) {
        if (!dataset) return;
        const updateData: UpdateDatasetRequest = {
          name: formData.name,
          description: formData.description
        };
        await updateMutation.mutateAsync({ id: dataset.id, data: updateData });

      } else {
        if (header.length === 0) {

          return;
        }
        const createData: CreateDatasetRequest = {
          name: formData.name,
          description: formData.description,
          header: header
        };
        await createMutation.mutateAsync(createData);

      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFieldChange = (field: keyof Omit<FormData, 'columns'>, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleColumnChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newColumns = [...prev.columns];
      newColumns[index] = value;
      return { ...prev, columns: newColumns };
    });
  };

  const handleAddColumn = () => {
    setFormData((prev) => ({
      ...prev,
      columns: [...prev.columns, ""]
    }));
  };

  const handleRemoveColumn = (index: number) => {
    setFormData((prev) => {
      const newColumns = prev.columns.filter((_, i) => i !== index);

      return { ...prev, columns: newColumns.length > 0 ? newColumns : [""] };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-[#0D0D0D] rounded-2xl shadow-lg border-0 sm:max-w-[600px] p-0">
        <DialogErrorHandler mutation={mutation} errorDisplayPosition="top">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="px-6 pt-8 pb-6">
              <DialogTitle className="text-xl font-semibold dark:text-white">
                {isEditMode ? 'Edit Dataset' : 'Create New Dataset'}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                {isEditMode ?
                  'Update your dataset details.' :
                  'Create a new dataset for your project.'}
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
                    placeholder="Enter dataset name"
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
                    placeholder="Enter dataset description"
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-transparent focus:ring-blue-600 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    disabled={isLoading} />

              </div>

              {!isEditMode &&
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium dark:text-gray-200">
                      Columns
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAddColumn}
                      className="h-8 px-2 text-xs"
                      disabled={isLoading}>

                      <Plus className="h-3 w-3 mr-1" />
                      Add Column
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {formData.columns.map((column, index) =>
                    <div key={column || `col-${index}`} className="flex items-center gap-2">
                        <Input
                        placeholder={`Column ${index + 1} name`}
                        value={column}
                        onChange={(e) => handleColumnChange(index, e.target.value)}
                        className="flex-1 h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        disabled={isLoading} />

                        {formData.columns.length > 1 &&
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveColumn(index)}
                        className="h-9 w-9 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
                        disabled={isLoading}>

                            <X className="h-4 w-4" />
                          </Button>
                      }
                      </div>
                    )}
                  </div>
                  {formData.columns.filter((col) => col.trim() !== "").length === 0 &&
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                      At least one column is required
                    </p>
                  }
                </div>
                }
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
            <Button
                type="submit"
                size="sm"
                disabled={isLoading || !canSubmit}
                className="h-9 px-4 text-sm font-medium">

              {isLoading ?
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </> :

                'Save'
                }
            </Button>
          </div>
        </form>
        </DialogErrorHandler>
      </DialogContent>
    </Dialog>);

}