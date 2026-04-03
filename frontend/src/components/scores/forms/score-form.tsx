"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { usePromptsQuery } from "@/hooks/prompts/use-prompts-query";
import { Loader2, Plus, Trash2, Info } from "lucide-react";
import { isForbiddenError } from "@/lib/error-handling";
import { useEffect, useState } from "react";
import { ScoreResponse, CreateScoreRequest, UpdateScoreRequest, UserScoringType, ScaleOption, OrdinalConfig } from "@/types/scores";
import { ScoringType } from "@/types/enums";
import { useCreateScore, useUpdateScore } from "@/hooks/scores/use-scores-query";
import { useMutationAction } from "@/hooks/shared/use-mutation-action";
import { showSuccessToast } from "@/lib/toast";
import { FormErrorDisplay } from "@/components/shared/form-error-display";

export interface ScoreFormProps {
  score?: ScoreResponse | null;
  projectId: string;
  onSuccess?: () => void;
}

type ScaleOptionWithId = ScaleOption & {id: string;};

function withId(opt: ScaleOption): ScaleOptionWithId {
  return { ...opt, id: crypto.randomUUID() };
}

function getInitialScoringType(score: ScoreResponse | null | undefined): UserScoringType {
  if (!score?.scoringType) return ScoringType.NUMERIC;
  const t = String(score.scoringType).toUpperCase();
  if (t === 'NUMERIC' || t === 'ORDINAL' || t === 'NOMINAL') {
    return t as UserScoringType;
  }
  return ScoringType.NUMERIC;
}

export function ScoreForm({ score, projectId, onSuccess }: Readonly<ScoreFormProps>) {
  const [name, setName] = useState<string>(() => score?.name ?? '');
  const [description, setDescription] = useState<string>(() => score?.description ?? '');
  const [scoringType, setScoringType] = useState<UserScoringType>(() => getInitialScoringType(score));
  const [scale, setScale] = useState<ScaleOptionWithId[]>(() => {
    const opts = score?.scale && score.scale.length > 0 ? score.scale : [{ label: '', value: 0 }];
    return opts.map(withId);
  });
  const [ordinalConfig, setOrdinalConfig] = useState<OrdinalConfig>(() =>
  score?.ordinalConfig ?? { acceptable_set: [], threshold_rank: undefined }
  );
  const [evaluatorPromptId, setEvaluatorPromptId] = useState<string>(
    () => score?.evaluatorPrompt?.id ?? ''
  );

  const { data: prompts = [], error: promptsError, isLoading: isLoadingPrompts } = usePromptsQuery(projectId);
  const hasPromptsPermissionError = promptsError && isForbiddenError(promptsError);

  const createMutation = useCreateScore(projectId);
  const updateMutation = useUpdateScore(projectId);
  const mutation = score ? updateMutation : createMutation;
  const isEditMode = !!score;


  const mutationAction = useMutationAction({
    mutation,
    onSuccess: () => {
      if (onSuccess) {
        onSuccess();
      }
      showSuccessToast(isEditMode ? 'Score updated successfully' : 'Score created successfully');
    },
    showErrorToast: true
  });

  const isLoading = mutationAction.isPending;


  useEffect(() => {
    if (score) {
      setName(score.name || '');
      setDescription(score.description || '');
      setScoringType(getInitialScoringType(score));
      setScale((score.scale && score.scale.length > 0 ? score.scale : [{ label: '', value: 0 }]).map(withId));
      setEvaluatorPromptId(score.evaluatorPrompt?.id ?? '');
      setOrdinalConfig(score.ordinalConfig ?? { acceptable_set: [], threshold_rank: undefined });
    } else {

      setName('');
      setDescription('');
      setScoringType(ScoringType.NUMERIC);
      setScale([withId({ label: '', value: 0 })]);
      setOrdinalConfig({ acceptable_set: [], threshold_rank: undefined });
      setEvaluatorPromptId('');
    }
  }, [score]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();


    if (!name.trim()) {
      alert('Please enter a name for the score');
      return;
    }


    if (scoringType === 'ORDINAL' || scoringType === 'NOMINAL') {
      const validScaleOptions = scale.filter((opt) => opt.label.trim() && opt.value !== undefined);
      if (validScaleOptions.length === 0) {
        alert('Please add at least one scale option with a label and value');
        return;
      }
    }

    const validScaleOptions = scale.filter((opt) => opt.label.trim() && opt.value !== undefined);

    const requestData: CreateScoreRequest | UpdateScoreRequest = {
      name,
      ...(description.trim() ? { description } : {}),
      scoringType,
      ...(scoringType === ScoringType.ORDINAL || scoringType === ScoringType.NOMINAL ?
      { scale: validScaleOptions.map(({ label, value }) => ({ label, value })) } :
      {}),

      ...(() => {
        if (scoringType === ScoringType.ORDINAL) {
          return {
            ordinalConfig: {
              ...(ordinalConfig.acceptable_set && ordinalConfig.acceptable_set.length > 0 ?
              { acceptable_set: ordinalConfig.acceptable_set } :
              {}),
              ...(ordinalConfig.threshold_rank === undefined ?
              {} :
              { threshold_rank: ordinalConfig.threshold_rank })
            }
          };
        }
        if (isEditMode && scoringType !== 'ORDINAL') {
          return { ordinalConfig: null };
        }
        return {};
      })(),
      evaluatorPromptId: evaluatorPromptId || null
    };

    try {
      if (isEditMode && score) {
        await updateMutation.mutateAsync({ id: score.id, data: requestData });
      } else {
        await createMutation.mutateAsync(requestData as CreateScoreRequest);
      }

    } catch (err) {
      console.error(err);
    }
  };

  const addScaleOption = () => {
    setScale([...scale, withId({ label: '', value: scale.length })]);
  };

  const removeScaleOption = (id: string) => {
    if (scale.length > 1) {
      setScale(scale.filter((opt) => opt.id !== id));
    }
  };

  const updateScaleOption = (id: string, field: 'label' | 'value', value: string | number) => {
    setScale(scale.map((opt) => opt.id === id ? { ...opt, [field]: value } : opt));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormErrorDisplay error={mutationAction.errorMessage} variant="default" />

      {}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium dark:text-gray-200">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Enter score name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
          required />

      </div>

      {}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium dark:text-gray-200">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="What does this score measure? (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full min-h-[80px] border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500" />

      </div>

      {}
      <div className="space-y-2">
        <Label htmlFor="scoringType" className="text-sm font-medium dark:text-gray-200">
          Scoring Type <span className="text-red-500">*</span>
        </Label>
        <Select
          value={scoringType}
          onValueChange={(value) => {
            const newType = value as UserScoringType;
            setScoringType(newType);

            if (newType !== ScoringType.ORDINAL) {
              setOrdinalConfig({ acceptable_set: [], threshold_rank: undefined });
            }
          }}>

          <SelectTrigger id="scoringType" className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NUMERIC">Numeric</SelectItem>
            <SelectItem value="ORDINAL">Ordinal</SelectItem>
            <SelectItem value="NOMINAL">Nominal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {}
      {(scoringType === ScoringType.ORDINAL || scoringType === ScoringType.NOMINAL) &&
      <div className="space-y-4 p-4 border border-gray-200 dark:border-[#2A2A2A] rounded-lg bg-gray-50 dark:bg-[#1A1A1A]">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium dark:text-gray-200">Scale Options <span className="text-red-500">*</span></Label>
            <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addScaleOption}
            className="h-8 text-xs">

              <Plus className="h-3 w-3 mr-1" />
              Add Option
            </Button>
          </div>
          <div className="space-y-2">
            {scale.map((option) =>
          <div key={option.id} className="flex items-center gap-2">
                <Input
              placeholder="Option label"
              value={option.label}
              onChange={(e) => {
                updateScaleOption(option.id, 'label', e.target.value);

                if (scoringType === 'ORDINAL' && ordinalConfig.acceptable_set) {
                  const oldLabel = option.label;
                  if (oldLabel && ordinalConfig.acceptable_set.includes(oldLabel)) {
                    setOrdinalConfig({
                      ...ordinalConfig,
                      acceptable_set: ordinalConfig.acceptable_set.filter((l) => l !== oldLabel)
                    });
                  }
                }
              }}
              className="flex-1 h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm" />

                <Input
              type="number"
              placeholder="Value"
              value={option.value}
              onChange={(e) => updateScaleOption(option.id, 'value', Number.parseFloat(e.target.value) || 0)}
              className="w-24 h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm" />

                {scale.length > 1 &&
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                const removedLabel = option.label;
                removeScaleOption(option.id);

                if (scoringType === ScoringType.ORDINAL && removedLabel && ordinalConfig.acceptable_set?.includes(removedLabel)) {
                  setOrdinalConfig({
                    ...ordinalConfig,
                    acceptable_set: ordinalConfig.acceptable_set.filter((l) => l !== removedLabel)
                  });
                }
              }}
              className="h-9 w-9">

                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
            }
              </div>
          )}
          </div>
        </div>
      }

      {}
      {scoringType === ScoringType.ORDINAL &&
      <div className="space-y-4 p-4 border border-gray-200 dark:border-[#2A2A2A] rounded-lg bg-gray-50 dark:bg-[#1A1A1A]">
          <div className="space-y-1">
            <Label className="text-sm font-medium dark:text-gray-200">Ordinal Configuration (Optional)</Label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Configure statistics calculations for ordinal scores
            </p>
          </div>

          {}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium dark:text-gray-200">Acceptable Set</Label>
                  <div className="group relative">
                    <Info className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 w-80 p-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Acceptable set of category codes (labels) that are considered "passing" or "acceptable". Used to calculate pass_rate: the proportion of results that fall into these categories.
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select categories considered "passing" or "acceptable" (for pass_rate calculation)
                </p>
                {scale.some((opt) => opt.label.trim()) ?
              <div className="space-y-2 mt-2">
                    {scale.
                filter((opt) => opt.label.trim()).
                map((option) =>
                <div key={option.label} className="flex items-center gap-2">
                          <Checkbox
                    id={`acceptable-${option.label}`}
                    checked={ordinalConfig.acceptable_set?.includes(option.label) || false}
                    onCheckedChange={(checked) => {
                      const currentSet = ordinalConfig.acceptable_set || [];
                      if (checked) {
                        setOrdinalConfig({
                          ...ordinalConfig,
                          acceptable_set: [...currentSet, option.label]
                        });
                      } else {
                        setOrdinalConfig({
                          ...ordinalConfig,
                          acceptable_set: currentSet.filter((l) => l !== option.label)
                        });
                      }
                    }} />

                          <Label
                    htmlFor={`acceptable-${option.label}`}
                    className="text-sm font-normal cursor-pointer dark:text-gray-300">

                            {option.label} (value: {option.value})
                          </Label>
                        </div>
                )}
                  </div> :

              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    Add scale options above to configure acceptable set
                  </p>
              }
              </div>
            </div>
          </div>

          {}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="threshold_rank" className="text-sm font-medium dark:text-gray-200">Threshold Rank</Label>
              <div className="group relative">
                <Info className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 w-80 p-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Threshold rank value. Results with ranks below this threshold are considered "bad". Used to calculate tail_mass_below: the proportion of results below this threshold.
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Rank threshold below which results are considered "bad" (for tail_mass_below calculation)
            </p>
            <Input
            id="threshold_rank"
            type="number"
            placeholder="Enter threshold rank (e.g., 2)"
            value={ordinalConfig.threshold_rank ?? ''}
            onChange={(e) => {
              const value = e.target.value === '' ? undefined : Number.parseFloat(e.target.value);
              setOrdinalConfig({
                ...ordinalConfig,
                threshold_rank: value !== undefined && !Number.isNaN(value) ? value : undefined
              });
            }}
            className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm" />

            {scale.some((opt) => opt.label.trim()) &&
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                Available rank values: {scale.filter((opt) => opt.label.trim()).map((opt) => opt.value).join(', ')}
              </p>
          }
          </div>
        </div>
      }

      {}
      <div className="space-y-2">
        <Label htmlFor="evaluatorPrompt" className="text-sm font-medium dark:text-gray-200">
          Evaluator Prompt (Optional)
        </Label>
        <Select
          value={evaluatorPromptId || "none"}
          onValueChange={(value) => setEvaluatorPromptId(value === "none" ? "" : value)}
          disabled={isLoadingPrompts || hasPromptsPermissionError}>

          <SelectTrigger id="evaluatorPrompt" className="w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white">
            <SelectValue placeholder={
            (() => {
              if (isLoadingPrompts) return "Loading prompts...";
              if (hasPromptsPermissionError) return "No permission";
              return "Select a prompt (optional)";
            })()
            } />
          </SelectTrigger>
          <SelectContent>
            {hasPromptsPermissionError ?
            <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                You don't have permission to view prompts
              </div> :

            <>
                <SelectItem value="none">None</SelectItem>
                {prompts.map((prompt) =>
              <SelectItem key={prompt.id} value={prompt.id}>
                    {prompt.name}
                  </SelectItem>
              )}
              </>
            }
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          A prompt used to evaluate outputs against this score. Scores without a prompt are manual scores; enter results in the evaluation detailed view.
        </p>
      </div>

      {}
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-[#2A2A2A]">
        <Button
          type="submit"
          disabled={isLoading}>

          {(() => {
            if (isLoading) {
              return (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>);

            }
            return isEditMode ? 'Update Score' : 'Create Score';
          })()}
        </Button>
      </div>
    </form>);

}