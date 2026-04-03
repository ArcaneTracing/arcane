"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Plus, Trash2 } from "lucide-react";

export interface PromptFormModelParametersProps {
  temperature: string;
  maxTokens: string;
  topP: string;
  customParams: Array<{key: string;value: string;}>;
  onTemperatureChange: (temp: string) => void;
  onMaxTokensChange: (tokens: string) => void;
  onTopPChange: (p: string) => void;
  onCustomParamsChange: (params: Array<{key: string;value: string;}>) => void;
}

export function PromptFormModelParameters({
  temperature,
  maxTokens,
  topP,
  customParams,
  onTemperatureChange,
  onMaxTokensChange,
  onTopPChange,
  onCustomParamsChange
}: Readonly<PromptFormModelParametersProps>) {
  return (
    <Collapsible defaultOpen className="mb-4 pb-4 border-b border-gray-200 dark:border-[#2A2A2A]">
      <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 w-full">
        <ChevronDown className="h-4 w-4" />
        Model Parameters
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="temperature" className="text-sm font-medium dark:text-gray-200">
              Temperature
            </Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              min="0"
              max="2"
              placeholder="0.7"
              value={temperature}
              onChange={(e) => onTemperatureChange(e.target.value)}
              className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500" />

          </div>
          <div className="space-y-2">
            <Label htmlFor="max-tokens" className="text-sm font-medium dark:text-gray-200">
              Max Tokens
            </Label>
            <Input
              id="max-tokens"
              type="number"
              min="1"
              placeholder="1000"
              value={maxTokens}
              onChange={(e) => onMaxTokensChange(e.target.value)}
              className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500" />

          </div>
          <div className="space-y-2">
            <Label htmlFor="top-p" className="text-sm font-medium dark:text-gray-200">
              Top P
            </Label>
            <Input
              id="top-p"
              type="number"
              step="0.1"
              min="0"
              max="1"
              placeholder="1.0"
              value={topP}
              onChange={(e) => onTopPChange(e.target.value)}
              className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500" />

          </div>
        </div>
        
        {}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#2A2A2A]">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium dark:text-gray-200">
              Custom Parameters
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onCustomParamsChange([...customParams, { key: '', value: '' }])}
              className="h-7 text-xs">

              <Plus className="h-3 w-3 mr-1" />
              Add Parameter
            </Button>
          </div>
          <div className="space-y-2">
            {customParams.map((param, index) =>
            <div key={`${param.key}-${param.value}`} className="flex items-center gap-2">
                <Input
                placeholder="Parameter name"
                value={param.key}
                onChange={(e) => {
                  const newParams = [...customParams];
                  newParams[index].key = e.target.value;
                  onCustomParamsChange(newParams);
                }}
                className="flex-1 h-8 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-xs focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500" />

                <Input
                placeholder="Value (string, number, JSON)"
                value={param.value}
                onChange={(e) => {
                  const newParams = [...customParams];
                  newParams[index].value = e.target.value;
                  onCustomParamsChange(newParams);
                }}
                className="flex-1 h-8 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-xs focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500" />

                <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onCustomParamsChange(customParams.filter((_, i) => i !== index));
                }}
                className="h-8 w-8 p-0">

                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            )}
            {customParams.length === 0 &&
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                No custom parameters. Click "Add Parameter" to add one.
              </p>
            }
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>);

}