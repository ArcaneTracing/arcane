"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EvaluationScope } from "@/types/enums"

export interface EvaluationFormScopeSelectionProps {
  evaluationScope: EvaluationScope
  onScopeChange: (scope: EvaluationScope) => void
  onScopeReset?: () => void
  isLoading?: boolean
  isEditMode?: boolean
}

export function EvaluationFormScopeSelection({
  evaluationScope,
  onScopeChange,
  onScopeReset,
  isLoading = false,
  isEditMode = false,
}: Readonly<EvaluationFormScopeSelectionProps>) {
  const handleScopeChange = (value: string) => {
    const newScope = value as EvaluationScope
    onScopeChange(newScope)
    if (onScopeReset) {
      onScopeReset()
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="evaluationScope" className="text-sm font-medium dark:text-gray-200">
        Evaluation Scope <span className="text-red-500">*</span>
      </Label>
      <Select 
        value={evaluationScope} 
        onValueChange={handleScopeChange}
        disabled={isLoading || isEditMode}
      >
        <SelectTrigger
          id="evaluationScope"
          disabled={isLoading || isEditMode}
          className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={EvaluationScope.DATASET}>Dataset</SelectItem>
          <SelectItem value={EvaluationScope.EXPERIMENT}>Experiment</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

