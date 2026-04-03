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
import { useImportDataset } from "@/hooks/datasets/use-datasets-query";
import { Loader2, Upload, X, FileText } from "lucide-react";
import { useState, useRef, useCallback, useId } from "react";
import { useMutationAction } from "@/hooks/shared/use-mutation-action";
import { showSuccessToast } from "@/lib/toast";
import { FormErrorDisplay } from "@/components/shared/form-error-display";

export interface ImportDatasetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  projectId: string;
}

export function ImportDatasetDialog({ open, onOpenChange, trigger, projectId }: Readonly<ImportDatasetDialogProps>) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();

  const importMutation = useImportDataset(projectId);


  const mutationAction = useMutationAction({
    mutation: importMutation,
    onSuccess: () => {
      setSelectedFile(null);
      setDatasetName("");
      onOpenChange(false);
      showSuccessToast('Dataset imported successfully');
    },
    showErrorToast: true
  });

  const isLoading = mutationAction.isPending;


  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedFile(null);
      setDatasetName("");
      setIsDragging(false);
    }
    onOpenChange(newOpen);
  };


  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);

    if (!datasetName && file.name.endsWith('.csv')) {
      const nameWithoutExt = file.name.replace(/\.csv$/i, '');
      setDatasetName(nameWithoutExt);
    } else if (!datasetName) {
      setDatasetName(file.name);
    }
  }, [datasetName]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel' || file.name.toLowerCase().endsWith('.csv'))) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel' || file.name.toLowerCase().endsWith('.csv'))) {
      handleFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setDatasetName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedFile) {
      return;
    }

    const name = datasetName.trim() || selectedFile.name.replace(/\.csv$/i, '');

    try {
      await importMutation.mutateAsync({
        file: selectedFile,
        name,
        description: "Imported from CSV"
      });

    } catch (err) {
      console.error('Error importing dataset', err);

    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-[#0D0D0D] rounded-2xl shadow-lg border-0 sm:max-w-[600px] p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-6 pt-8 pb-6">
            <DialogTitle className="text-xl font-semibold dark:text-white">
              Import Dataset
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              Upload a CSV file to import as a new dataset.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 space-y-4">
            <FormErrorDisplay error={mutationAction.errorMessage} variant="default" />
            
            <div className="space-y-4">
              {}
              <div className="space-y-2">
                <Label className="text-sm font-medium dark:text-gray-200">
                  CSV File
                </Label>
                <input
                  id={fileInputId}
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileInputChange}
                  className="hidden" />

                
                {selectedFile ?
                <div className="border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-4 bg-gray-50 dark:bg-[#1A1A1A]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                      disabled={isLoading}
                      aria-label="Remove file">

                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div> :

                <label
                  htmlFor={fileInputId}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                      block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                      ${isDragging ?
                  'border-primary bg-primary/5 dark:bg-primary/10' :
                  'border-gray-300 dark:border-[#2A2A2A] hover:border-gray-400 dark:hover:border-[#3A3A3A]'}
                    `
                  }>

                    <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Drag and drop your CSV file here
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      or click to browse
                    </p>
                    <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }}
                    className="mt-2">

                      Browse Files
                    </Button>
                  </label>
                }
              </div>

              {}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium dark:text-gray-200">
                  Dataset Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter dataset name"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  disabled={isLoading}
                  required />

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  If not provided, the filename (without .csv) will be used
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 px-6 py-6 mt-4">
            <Button
              type="button"
              variant="modern"
              size="sm"
              onClick={() => handleOpenChange(false)}
              className="h-9 px-4 text-sm font-medium"
              disabled={isLoading}>

              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !selectedFile || !datasetName.trim()}
              className="h-9 px-4 text-sm font-medium">

              {isLoading ?
              <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </> :

              <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Dataset
                </>
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>);

}