"use client";

import { useState, useCallback, useEffect } from "react";
import { useCreateDatasource, useUpdateDatasource } from "@/hooks/datasources/use-datasources-query";
import { useMutationAction } from "@/hooks/shared/use-mutation-action";
import type { DatasourceResponse } from "@/types/datasources";

export interface UseDatasourceDialogOptions {
  datasource?: DatasourceResponse | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;

  onCloseRef?: React.RefObject<(() => void) | null | undefined>;
}

export interface UseDatasourceDialogReturn {
  open: boolean;
  setOpen: (open: boolean) => void;
  mutation: ReturnType<typeof useCreateDatasource> | ReturnType<typeof useUpdateDatasource>;
  createMutation: ReturnType<typeof useCreateDatasource>;
  updateMutation: ReturnType<typeof useUpdateDatasource>;
  isCreateLoading: boolean;
  isUpdateLoading: boolean;
}

export function useDatasourceDialog({
  datasource,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
  onCloseRef
}: UseDatasourceDialogOptions): UseDatasourceDialogReturn {
  const [internalOpen, setInternalOpen] = useState(false);
  const createMutation = useCreateDatasource(undefined);
  const updateMutation = useUpdateDatasource();
  const mutation = datasource ? updateMutation : createMutation;

  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined;
  const open = isControlled ? controlledOpen ?? false : internalOpen;

  const setOpen = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        onCloseRef?.current?.();
      }
      if (isControlled && onOpenChange) {
        onOpenChange(newOpen);
      } else {
        setInternalOpen(newOpen);
      }
    },
    [isControlled, onOpenChange, onCloseRef]
  );

  useMutationAction({
    mutation,
    successMessage: datasource ? "Datasource updated successfully" : "Datasource created successfully",
    onSuccess: () => {
      setOpen(false);
      onSuccess?.();
    },
    showErrorToast: true
  });

  useEffect(() => {
    if (!open && (createMutation.isSuccess || updateMutation.isSuccess)) {
      createMutation.reset();
      updateMutation.reset();
    }
  }, [open, createMutation, updateMutation]);

  return {
    open,
    setOpen,
    mutation,
    createMutation,
    updateMutation,
    isCreateLoading: createMutation.isPending,
    isUpdateLoading: updateMutation.isPending
  };
}