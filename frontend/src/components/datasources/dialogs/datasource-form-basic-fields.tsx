"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatasourceSource } from "@/types/enums"
import { InfoButton } from "@/components/shared/info-button"
import { datasourceTooltips } from "@/constants/datasource-tooltips"

const TRACE_SOURCES = [
  { value: DatasourceSource.TEMPO, label: "Tempo" },
  { value: DatasourceSource.JAEGER, label: "Jaeger" },
  { value: DatasourceSource.CLICKHOUSE, label: "ClickHouse" },
  { value: DatasourceSource.CUSTOM_API, label: "Custom API" },
]

const inputClassName =
  "w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"

const textareaClassName =
  "w-full min-h-[80px] border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"

const labelClassName = "text-sm font-medium dark:text-gray-200"

export interface DatasourceFormBasicFieldsProps {
  name: string
  description: string
  source: DatasourceSource | ""
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onSourceChange: (value: DatasourceSource | "") => void
  disabled?: boolean
}

export function DatasourceFormBasicFields({
  name,
  description,
  source,
  onNameChange,
  onDescriptionChange,
  onSourceChange,
  disabled = false,
}: Readonly<DatasourceFormBasicFieldsProps>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="name" className={labelClassName}>
            Name
          </Label>
          <InfoButton content={datasourceTooltips.form.name} />
        </div>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="My Data Source"
          className={inputClassName}
          disabled={disabled}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="description" className={labelClassName}>
            Description
          </Label>
          <InfoButton content={datasourceTooltips.form.description} />
        </div>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Description of your data source"
          className={textareaClassName}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="source" className={labelClassName}>
          Source
        </Label>
        <Select
          value={source}
          onValueChange={onSourceChange}
          disabled={disabled}
        >
          <SelectTrigger
            id="source"
            disabled={disabled}
            className="h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm"
          >
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            {TRACE_SOURCES.map((sourceOption) => (
              <SelectItem key={sourceOption.value} value={sourceOption.value}>
                {sourceOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
