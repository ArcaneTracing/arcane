"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import type { UseDatasourceFormReturn } from "@/hooks/datasources/use-datasource-form"
import { DatasourceResponse } from "@/types/datasources"
import { DialogErrorHandler } from "@/components/shared/dialog-error-handler"
import { DatasourceFormBasicFields } from "./datasource-form-basic-fields"
import { DatasourceFormAdvancedFields } from "./datasource-form-advanced-fields"
import { DatasourceFormActions } from "./datasource-form-actions"
import { DatasourceTestConnectionButton } from "./datasource-test-connection-button"
import type { UseMutationResult } from "@tanstack/react-query"
import { datasourceTooltips } from "@/constants/datasource-tooltips"
import { TooltipProvider } from "@/components/ui/tooltip"

export interface DatasourceDialogViewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ReactNode
  datasource?: DatasourceResponse
  form: UseDatasourceFormReturn
  busy: boolean
  mutation: UseMutationResult<unknown, unknown, unknown, unknown>
}

export function DatasourceDialogView({
  open,
  onOpenChange,
  trigger,
  datasource,
  form,
  busy,
  mutation,
}: Readonly<DatasourceDialogViewProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="bg-white dark:bg-[#0D0D0D] rounded-2xl shadow-lg border-0 sm:max-w-[525px] p-0 flex flex-col max-h-[90vh]">
        <TooltipProvider delayDuration={300} skipDelayDuration={0}>
          <DialogErrorHandler mutation={mutation} errorDisplayPosition="top">
            <form onSubmit={form.handleSubmit} className="flex flex-col h-full min-h-0">
              <DialogHeader className="px-6 pt-8 pb-6 flex-shrink-0">
                <DialogTitle className="text-xl font-semibold dark:text-white">
                  {datasource ? "Refine Your Data Stream" : "Add a New Data Source"}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                  {datasourceTooltips.dialog.header}
                </DialogDescription>
              </DialogHeader>

              <div className="px-6 flex-1 overflow-y-auto min-h-0">
                <div className="space-y-4 pb-4">
                  {Object.keys(form.validationErrors).length > 0 && (
                    <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-2">
                      {Object.values(form.validationErrors)[0]}
                    </div>
                  )}

                  <div className="space-y-4">
                    <DatasourceFormBasicFields
                      name={form.name}
                      description={form.description}
                      source={form.source}
                      onNameChange={form.setName}
                      onDescriptionChange={form.setDescription}
                      onSourceChange={form.setSource}
                      disabled={busy}
                    />
                    <DatasourceFormAdvancedFields
                      source={form.source}
                      url={form.url}
                      clickhouseConfig={form.clickhouseConfig}
                      customApiConfig={form.customApiConfig}
                      tempoJaegerAuthConfig={form.tempoJaegerAuthConfig}
                      validationErrors={form.validationErrors}
                      onUrlChange={form.setUrl}
                      onClickhouseConfigChange={form.setClickhouseConfig}
                      onCustomApiConfigChange={form.setCustomApiConfig}
                      onTempoJaegerAuthConfigChange={form.setTempoJaegerAuthConfig}
                      disabled={busy}
                    />
                  </div>

                  <div className="space-y-4 pt-4">
                    <DatasourceTestConnectionButton
                      datasourceId={datasource?.id}
                      form={form}
                      disabled={busy}
                    />
                  </div>
                </div>
              </div>

              <DatasourceFormActions
                isEditMode={form.isEditMode}
                busy={busy}
                onCancel={() => onOpenChange(false)}
              />
            </form>
          </DialogErrorHandler>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  )
}
