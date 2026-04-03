"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ExperimentFormInputMappingsProps {
  detectedVariables: string[]
  datasetId: string
  loadingHeaders: boolean
  inputMappings: Array<{ key: string; value: string }>
  datasetHeaders: string[]
  customFieldValues: Record<number, string>
  getSelectValue: (mappingValue: string, index: number) => string
  handleDatasetFieldChange: (index: number, value: string) => void
  handleCustomFieldChange: (index: number, value: string) => void
  updateMapping: (index: number, field: 'key' | 'value', value: string) => void
}

export function ExperimentFormInputMappings({
  detectedVariables,
  datasetId,
  loadingHeaders,
  inputMappings,
  datasetHeaders,
  customFieldValues,
  getSelectValue,
  handleDatasetFieldChange,
  handleCustomFieldChange,
  updateMapping,
}: Readonly<ExperimentFormInputMappingsProps>) {
  if (detectedVariables.length === 0 || !datasetId || loadingHeaders) {
    return null
  }

  return (
    <div className="space-y-4 p-4 border border-gray-200 dark:border-[#2A2A2A] rounded-lg bg-gray-50 dark:bg-[#1A1A1A]">
      <div>
        <Label className="text-sm font-medium dark:text-gray-200">Prompt Input Mappings (Optional)</Label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Map each prompt input variable to a dataset field
        </p>
      </div>
      <div className="space-y-2">
        {inputMappings.map((mapping, index) => (
          <div key={mapping.key} className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Prompt input variable"
                value={mapping.key}
                readOnly
                disabled
                className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-gray-100 dark:bg-[#1A1A1A] dark:text-gray-400 rounded-lg text-sm cursor-not-allowed"
              />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">→</span>
            <div className="flex-1 space-y-2">
              {datasetId && !loadingHeaders ? (
                <>
                  <Select
                    value={getSelectValue(mapping.value, index)}
                    onValueChange={(value) => handleDatasetFieldChange(index, value)}
                    disabled={loadingHeaders}
                  >
                    <SelectTrigger className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm">
                      <SelectValue placeholder="Select dataset field" />
                    </SelectTrigger>
                    <SelectContent>
                      {datasetHeaders.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                      <SelectItem value="__other__">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {getSelectValue(mapping.value, index) === '__other__' && (
                    <Input
                      placeholder="Enter custom field name"
                      value={customFieldValues[index] || mapping.value}
                      onChange={(e) => handleCustomFieldChange(index, e.target.value)}
                      className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm"
                    />
                  )}
                </>
              ) : (
                <Input
                  placeholder={loadingHeaders ? "Loading headers..." : "Dataset field name"}
                  value={mapping.value}
                  onChange={(e) => updateMapping(index, 'value', e.target.value)}
                  className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm"
                  disabled={!datasetId || loadingHeaders}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

