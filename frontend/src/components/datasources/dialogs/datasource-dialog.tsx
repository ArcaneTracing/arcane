"use client"

import { useRef } from "react"
import type { UseMutationResult } from "@tanstack/react-query"
import { useDatasourceForm } from "@/hooks/datasources/use-datasource-form"
import { useDatasourceDialog } from "@/components/datasources/dialogs/use-datasource-dialog"
import type { CreateDatasourceRequest, DatasourceResponse, UpdateDatasourceRequest } from "@/types/datasources"
import { DatasourceDialogView } from "./datasource-dialog-view"

export interface DatasourceDialogProps {
  trigger?: React.ReactNode
  datasource?: DatasourceResponse
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

export function DatasourceDialog({
  trigger,
  datasource,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
}: Readonly<DatasourceDialogProps>) {
  const onCloseRef = useRef<(() => void) | null>(null)

  const {
    open,
    setOpen,
    mutation,
    createMutation,
    updateMutation,
    isCreateLoading,
    isUpdateLoading,
  } = useDatasourceDialog({
    datasource,
    open: controlledOpen,
    onOpenChange,
    onSuccess,
    onCloseRef,
  })

  const form = useDatasourceForm({
    datasource,
    isOpen: open,
    onSubmit: async (data) => {
      if (datasource) {
        await updateMutation.mutateAsync({ id: datasource.id, data: data as UpdateDatasourceRequest })
      } else {
        await createMutation.mutateAsync(data as CreateDatasourceRequest)
      }
    },
  })

  onCloseRef.current = form.clearValidation

  const busy = form.isSubmitting || isCreateLoading || isUpdateLoading

  return (
    <DatasourceDialogView
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      datasource={datasource}
      form={form}
      busy={busy}
      mutation={mutation as UseMutationResult<unknown, unknown, unknown, unknown>}
    />
  )
}
