"use client";

import { useState, useEffect, useRef } from "react";
import { usePromptVersionsQuery, usePromptVersionQuery, usePromptsQuery } from "@/hooks/prompts/use-prompts-query";
import { useDatasetsQuery, useDatasetHeaderQuery } from "@/hooks/datasets/use-datasets-query";
import { useCreateExperiment } from "@/hooks/experiments/use-experiments-query";
import { ExperimentResponse, CreateExperimentRequest } from "@/types/experiments";
import { PromptVersionResponse } from "@/types/prompts";
import { DatasetListItemResponse } from "@/types/datasets";
import { extractVariablesFromPromptVersion } from "@/lib/prompt-utils";
import { promptsApi } from "@/api/prompts";
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation";

export interface UseExperimentFormReturn {

  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  promptVersionId: string;
  setPromptVersionId: (id: string) => void;
  datasetId: string;
  setDatasetId: (id: string) => void;


  selectedPromptId: string;
  setSelectedPromptId: (id: string) => void;
  selectedVersion: PromptVersionResponse | null;
  promptVersions: PromptVersionResponse[];
  loadingVersions: boolean;
  promptsError?: unknown;
  versionsError?: unknown;


  datasets: DatasetListItemResponse[];
  loadingDatasets: boolean;
  datasetsError?: unknown;


  inputMappings: Array<{key: string;value: string;}>;
  detectedVariables: string[];
  datasetHeaders: string[];
  loadingHeaders: boolean;
  customFieldValues: Record<number, string>;
  updateMapping: (index: number, field: 'key' | 'value', value: string) => void;
  handleDatasetFieldChange: (index: number, value: string) => void;
  handleCustomFieldChange: (index: number, value: string) => void;
  getSelectValue: (mappingValue: string, index: number) => string;


  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isEditMode: boolean;
}

export function useExperimentForm(
experiment: ExperimentResponse | null | undefined,
projectId: string,
onSuccess?: () => void)
: UseExperimentFormReturn {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [promptVersionId, setPromptVersionId] = useState<string>('');
  const [datasetId, setDatasetId] = useState<string>('');
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [promptVersions, setPromptVersions] = useState<PromptVersionResponse[]>([]);
  const [inputMappings, setInputMappings] = useState<Array<{key: string;value: string;}>>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<PromptVersionResponse | null>(null);
  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<number, string>>({});
  const initializedRef = useRef(false);

  const organisationId = useOrganisationIdOrNull();
  const { data: prompts = [], error: promptsError } = usePromptsQuery(projectId);

  const createMutation = useCreateExperiment(projectId);

  const isLoading = createMutation.isPending;
  const error = createMutation.error?.message ?? null;
  const isEditMode = !!experiment;


  const { data: datasetsData = [], isLoading: isLoadingDatasets, error: datasetsError } = useDatasetsQuery(projectId);
  const datasets = datasetsData;
  const loadingDatasets = isLoadingDatasets;


  const { data: datasetHeadersData = [], isLoading: isLoadingHeaders } = useDatasetHeaderQuery(projectId, datasetId);
  const [datasetHeaders, setDatasetHeaders] = useState<string[]>([]);


  const inputMappingsRef = useRef(inputMappings);
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current += 1;
  });

  useEffect(() => {
    inputMappingsRef.current = inputMappings;
  }, [inputMappings]);

  useEffect(() => {
    if (datasetHeadersData.length > 0) {

      setDatasetHeaders((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(datasetHeadersData)) {
          return prev;
        }
        return datasetHeadersData;
      });

      const currentMappings = inputMappingsRef.current;
      if (currentMappings.length > 0) {
        const customValues: Record<number, string> = {};
        currentMappings.forEach((mapping, idx) => {
          if (mapping.value && !datasetHeadersData.includes(mapping.value)) {
            customValues[idx] = mapping.value;
          }
        });
        if (Object.keys(customValues).length > 0) {
          setCustomFieldValues((prevCustom) => {

            const hasChanges = Object.keys(customValues).some((idx) =>
            prevCustom[Number(idx)] !== customValues[Number(idx)]
            );
            return hasChanges ? { ...prevCustom, ...customValues } : prevCustom;
          });
        }
      }
    } else if (!datasetId) {

      setDatasetHeaders((prev) => {
        if (prev.length === 0) {
          return prev;
        }
        return [];
      });
      setCustomFieldValues((prevCustom) => {
        if (Object.keys(prevCustom).length === 0) {
          return prevCustom;
        }
        return {};
      });
    }
  }, [datasetHeadersData, datasetId]);

  const loadingHeaders = isLoadingHeaders;


  const { data: promptVersionsData = [], isLoading: isLoadingVersions, error: versionsError } = usePromptVersionsQuery(projectId, selectedPromptId);

  useEffect(() => {
    if (selectedPromptId) {

      setPromptVersions((prev) => {
        if (prev.length === promptVersionsData.length &&
        prev.every((v, i) => v.id === promptVersionsData[i]?.id)) {
          return prev;
        }
        return promptVersionsData;
      });
      setLoadingVersions((prev) => {
        if (prev === isLoadingVersions) {
          return prev;
        }
        return isLoadingVersions;
      });
    } else {

      setPromptVersions((prev) => {
        if (prev.length === 0) {
          return prev;
        }
        return [];
      });
      setPromptVersionId((prev) => {
        if (prev === '') {
          return prev;
        }
        return '';
      });
      setSelectedVersion((prev) => {
        if (prev === null) {
          return prev;
        }
        return null;
      });
      setDetectedVariables((prev) => {
        if (prev.length === 0) {
          return prev;
        }
        return [];
      });
      setLoadingVersions((prev) => {
        if (prev === false) {
          return prev;
        }
        return false;
      });
    }
  }, [promptVersionsData, isLoadingVersions, selectedPromptId]);


  const { data: selectedVersionData } = usePromptVersionQuery(projectId, promptVersionId);

  useEffect(() => {
    if (selectedVersionData) {

      setSelectedVersion((prev) => {
        if (prev?.id === selectedVersionData.id) {
          return prev;
        }
        return selectedVersionData;
      });
      const vars = extractVariablesFromPromptVersion(selectedVersionData);


      setDetectedVariables((prev) => {
        if (prev.length === vars.length && prev.every((v, i) => v === vars[i])) {
          return prev;
        }
        return vars;
      });
      if (vars.length > 0) {
        setInputMappings((prev) => {
          const existingMappings = new Map(prev.map((m) => [m.key, m.value]));
          const newMappings = vars.map((v) => ({
            key: v,
            value: existingMappings.get(v) || ''
          }));

          if (prev.length === newMappings.length &&
          prev.every((m, i) => m.key === newMappings[i].key && m.value === newMappings[i].value)) {
            return prev;
          }
          return newMappings;
        });
      } else {
        setInputMappings((prev) => {
          if (prev.length === 0) {
            return prev;
          }
          return [];
        });
      }
    } else if (!promptVersionId) {

      setSelectedVersion((prev) => {
        if (prev === null) {
          return prev;
        }
        return null;
      });
      setDetectedVariables((prev) => {
        if (prev.length === 0) {
          return prev;
        }
        return [];
      });
      setInputMappings((prev) => {
        if (prev.length === 0) {
          return prev;
        }
        return [];
      });
    }
  }, [selectedVersionData, promptVersionId]);


  useEffect(() => {
    if (experiment && !initializedRef.current) {
      initializedRef.current = true;
      setName(experiment.name || '');
      setDescription(experiment.description || '');
      setPromptVersionId(experiment.promptVersionId);
      setDatasetId(experiment.datasetId);


      if (prompts.length > 0 && experiment.promptVersionId && organisationId) {
        promptsApi.getVersionById(organisationId, projectId, experiment.promptVersionId).
        then((version) => {

          if (version.promptId) {
            setSelectedPromptId(version.promptId);
          }

          const vars = extractVariablesFromPromptVersion(version);
          setDetectedVariables(vars);


          const existingMappings = experiment.promptInputMappings || {};
          if (vars.length > 0) {
            setInputMappings(vars.map((v) => ({
              key: v,
              value: existingMappings[v] || ''
            })));

          } else {
            setInputMappings([]);
          }
        }).
        catch(console.error);
      }
    } else if (!experiment) {
      initializedRef.current = false;
    }
  }, [experiment?.id, projectId, prompts.length]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();


    const promptInputMappings: Record<string, string> = {};
    inputMappings.forEach((mapping) => {
      if (mapping.key.trim() && mapping.value.trim()) {
        promptInputMappings[mapping.key.trim()] = mapping.value.trim();
      }
    });

    const requestData: CreateExperimentRequest = {
      name: name.trim(),
      description: description.trim() || null,
      promptVersionId,
      datasetId,
      promptInputMappings: Object.keys(promptInputMappings).length > 0 ? promptInputMappings : undefined
    };

    try {

      await createMutation.mutateAsync(requestData);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateMapping = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...inputMappings];
    updated[index] = { ...updated[index], [field]: value };
    setInputMappings(updated);
  };

  const handleDatasetFieldChange = (index: number, value: string) => {
    if (value === '__other__') {

      if (!customFieldValues[index] && inputMappings[index]?.value && !datasetHeaders.includes(inputMappings[index].value)) {
        setCustomFieldValues((prev) => ({ ...prev, [index]: inputMappings[index].value }));
      }
      updateMapping(index, 'value', customFieldValues[index] || '');
    } else {

      setCustomFieldValues((prev) => {
        const newValues = { ...prev };
        delete newValues[index];
        return newValues;
      });
      updateMapping(index, 'value', value);
    }
  };

  const handleCustomFieldChange = (index: number, value: string) => {
    setCustomFieldValues((prev) => ({ ...prev, [index]: value }));
    updateMapping(index, 'value', value);
  };

  const getSelectValue = (mappingValue: string, index: number): string => {
    if (datasetHeaders.includes(mappingValue)) {
      return mappingValue;
    }

    if (mappingValue && mappingValue.trim() !== '') {
      return '__other__';
    }
    return '';
  };

  return {
    name,
    setName,
    description,
    setDescription,
    promptVersionId,
    setPromptVersionId,
    datasetId,
    setDatasetId,
    selectedPromptId,
    setSelectedPromptId,
    selectedVersion,
    promptVersions,
    loadingVersions,
    promptsError,
    versionsError,
    datasets,
    loadingDatasets,
    datasetsError,
    inputMappings,
    detectedVariables,
    datasetHeaders,
    loadingHeaders,
    customFieldValues,
    updateMapping,
    handleDatasetFieldChange,
    handleCustomFieldChange,
    getSelectValue,
    handleSubmit,
    isLoading,
    error,
    isEditMode
  };
}