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
import { MatchPatternType } from "@/types/enums"
import { InfoButton } from "@/components/shared/info-button"
import { entityTooltips } from "@/constants/entity-tooltips"

interface MatchingStepProps {
  attributeName: string
  matchPatternType: MatchPatternType
  matchValue: string
  matchPatttern?: string
  onAttributeNameChange: (value: string) => void
  onMatchPatternTypeChange: (value: MatchPatternType) => void
  onMatchValueChange: (value: string) => void
  onMatchPatternChange: (value: string) => void
  disabled?: boolean
}

export function MatchingStep({
  attributeName,
  matchPatternType,
  matchValue,
  matchPatttern,
  onAttributeNameChange,
  onMatchPatternTypeChange,
  onMatchValueChange,
  onMatchPatternChange,
  disabled
}: Readonly<MatchingStepProps>) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="attributeName" className="text-sm font-medium dark:text-gray-200">
            Matching Attribute Key <span className="text-red-500">*</span>
          </Label>
          <InfoButton content={entityTooltips.matching.attributeKey} />
        </div>
        <Input  
          id="attributeName"
          placeholder="e.g., gen_ai.request.model, gen_ai.agent.id"
          value={attributeName}
          onChange={(e) => onAttributeNameChange(e.target.value)}
          className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
          disabled={disabled}
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          The OpenTelemetry attribute key to match against (e.g., gen_ai.request.model)
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="matchPatternType" className="text-sm font-medium dark:text-gray-200">
            Match Pattern Type <span className="text-red-500">*</span>
          </Label>
          <InfoButton 
            content={
              <div className="space-y-2">
                <p><strong>Value (Exact Match):</strong> {entityTooltips.matching.patternTypeValue}</p>
                <p><strong>Regex (Pattern Match):</strong> {entityTooltips.matching.patternTypeRegex}</p>
              </div>
            }
            maxWidth="max-w-lg"
          />
        </div>
        <Select
          value={matchPatternType}
          onValueChange={(value) => onMatchPatternTypeChange(value as MatchPatternType)}
          disabled={disabled}
        >
          <SelectTrigger className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm">
            <SelectValue placeholder="Select match pattern type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={MatchPatternType.VALUE}>Value (Exact Match)</SelectItem>
            <SelectItem value={MatchPatternType.REGEX}>Regex (Pattern Match)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {matchPatternType === MatchPatternType.REGEX && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="matchPatttern" className="text-sm font-medium dark:text-gray-200">
              Match Pattern (Regex) <span className="text-red-500">*</span>
            </Label>
            <InfoButton content={entityTooltips.matching.matchPattern} />
          </div>
          <Input
            id="matchPatttern"
            placeholder="e.g., ^gpt-4.*$"
            value={matchPatttern || ""}
            onChange={(e) => onMatchPatternChange(e.target.value)}
            className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
            disabled={disabled}
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Regular expression pattern to match attribute values
          </p>
        </div>
      )}

      {matchPatternType === MatchPatternType.VALUE && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="matchValue" className="text-sm font-medium dark:text-gray-200">
              Match Value <span className="text-red-500">*</span>
            </Label>
            <InfoButton content={entityTooltips.matching.matchValue} />
          </div>
          <Input
            id="matchValue"
            placeholder="e.g., gpt-4-turbo"
            value={matchValue}
            onChange={(e) => onMatchValueChange(e.target.value)}
            className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
            disabled={disabled}
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Exact value to match against the attribute
          </p>
        </div>
      )}
    </div>
  )
}

