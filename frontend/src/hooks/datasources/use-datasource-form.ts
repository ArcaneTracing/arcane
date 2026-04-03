"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  DatasourceResponse,
  CreateDatasourceRequest,
  UpdateDatasourceRequest,
  CustomApiConfig,
  TempoJaegerAuthConfig } from
"@/types/datasources";
import { DatasourceSource } from "@/types/enums";

export interface ClickHouseConfig {
  host: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  tableName: string;
  protocol?: "http" | "https";
}

const DEFAULT_CLICKHOUSE: Partial<ClickHouseConfig> = {
  host: "",
  port: 8123,
  database: "",
  username: "default",
  password: "",
  tableName: "",
  protocol: "http"
};

const DEFAULT_CUSTOM_API: Partial<CustomApiConfig> = {
  baseUrl: "",
  endpoints: {
    search: { path: "" },
    searchByTraceId: { path: "" }
  },
  capabilities: {
    searchByQuery: true,
    searchByAttributes: false,
    filterByAttributeExists: false,
    getAttributeNames: false,
    getAttributeValues: false
  }
};

export interface UseDatasourceFormOptions {
  datasource: DatasourceResponse | null | undefined;
  isOpen: boolean;
  onSubmit: (data: CreateDatasourceRequest | UpdateDatasourceRequest) => Promise<void>;
}

export interface UseDatasourceFormReturn {

  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  url: string;
  setUrl: (v: string) => void;
  source: DatasourceSource | "";
  setSource: (v: DatasourceSource | "") => void;
  clickhouseConfig: Partial<ClickHouseConfig>;
  setClickhouseConfig: React.Dispatch<React.SetStateAction<Partial<ClickHouseConfig>>>;
  customApiConfig: Partial<CustomApiConfig>;
  setCustomApiConfig: React.Dispatch<React.SetStateAction<Partial<CustomApiConfig>>>;
  tempoJaegerAuthConfig: Partial<TempoJaegerAuthConfig>;
  setTempoJaegerAuthConfig: React.Dispatch<React.SetStateAction<Partial<TempoJaegerAuthConfig>>>;

  validationErrors: Record<string, string>;
  clearValidation: () => void;
  validateForm: () => boolean;

  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isSubmitting: boolean;
  isEditMode: boolean;
}

function parseClickhouseFromDatasource(
config: Record<string, unknown> | null | undefined)
: Partial<ClickHouseConfig> {
  const ch = config?.clickhouse as Partial<ClickHouseConfig> | undefined;
  if (!ch) return { ...DEFAULT_CLICKHOUSE };
  return {
    host: ch.host ?? "",
    port: ch.port ?? 8123,
    database: ch.database ?? "",
    username: ch.username ?? "default",
    password: ch.password ?? "",
    tableName: ch.tableName ?? "",
    protocol: ch.protocol as "http" | "https" ?? "http"
  };
}

function parseTempoJaegerAuthFromDatasource(
  config: Record<string, unknown> | null | undefined
): Partial<TempoJaegerAuthConfig> {
  const auth = config?.authentication as Partial<TempoJaegerAuthConfig['authentication']> | undefined;
  if (!auth) return {};
  
  if (auth.type === 'basic') {
    return {
      authentication: {
        type: 'basic',
        username: auth.username ?? '',
        password: auth.password === '***' ? '' : (auth.password ?? ''),
      },
    };
  } else if (auth.type === 'bearer') {
    return {
      authentication: {
        type: 'bearer',
        token: auth.token === '***' ? '' : (auth.token ?? ''),
      },
    };
  }
  
  return {};
}

function parseCustomApiFromDatasource(
config: Record<string, unknown> | null | undefined)
: Partial<CustomApiConfig> {
  const api = config?.customApi as Partial<CustomApiConfig> | undefined;
  if (!api) return { ...DEFAULT_CUSTOM_API };
  return {
    baseUrl: api.baseUrl ?? "",
    endpoints: {
      search: { path: api.endpoints?.search?.path ?? "" },
      searchByTraceId: { path: api.endpoints?.searchByTraceId?.path ?? "" },
      attributeNames: api.endpoints?.attributeNames ? { path: api.endpoints.attributeNames.path } : undefined,
      attributeValues: api.endpoints?.attributeValues ? { path: api.endpoints.attributeValues.path } : undefined
    },
    capabilities: {
      searchByQuery: api.capabilities?.searchByQuery ?? true,
      searchByAttributes: api.capabilities?.searchByAttributes ?? false,
      filterByAttributeExists: api.capabilities?.filterByAttributeExists ?? false,
      getAttributeNames: api.capabilities?.getAttributeNames ?? false,
      getAttributeValues: api.capabilities?.getAttributeValues ?? false
    },
    authentication: api.authentication,
    headers: api.headers
  };
}

import { validateDatasourceForm } from './use-datasource-form-validation';
import { buildDatasourceSubmitData } from './use-datasource-form-submit';

export function useDatasourceForm({
  datasource,
  isOpen,
  onSubmit
}: UseDatasourceFormOptions): UseDatasourceFormReturn {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [source, setSource] = useState<DatasourceSource | "">("");
  const [clickhouseConfig, setClickhouseConfig] = useState<Partial<ClickHouseConfig>>({
    ...DEFAULT_CLICKHOUSE
  });
  const [customApiConfig, setCustomApiConfig] = useState<Partial<CustomApiConfig>>({
    ...DEFAULT_CUSTOM_API
  });
  const [tempoJaegerAuthConfig, setTempoJaegerAuthConfig] = useState<Partial<TempoJaegerAuthConfig>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setSourceWithValidation = useCallback((value: DatasourceSource | "") => {
    setSource(value);
    setValidationErrors((prev) => Object.keys(prev).length === 0 ? prev : {});
  }, []);

  const clearValidation = useCallback(() => setValidationErrors({}), []);

  const prevOpenId = useRef<{open: boolean;id: string | undefined;}>({ open: false, id: undefined });


  useEffect(() => {
    if (!isOpen) {
      prevOpenId.current = { open: false, id: undefined };
      setName("");
      setDescription("");
      setUrl("");
      setSource("");
      setClickhouseConfig({ ...DEFAULT_CLICKHOUSE });
      setCustomApiConfig({ ...DEFAULT_CUSTOM_API });
      setTempoJaegerAuthConfig({});
      setValidationErrors({});
      return;
    }
    const id = datasource?.id;
    const shouldInit =
    !prevOpenId.current.open || prevOpenId.current.id !== id;
    prevOpenId.current = { open: true, id };

    if (!shouldInit) return;

    setValidationErrors({});
    if (datasource) {
      setName(datasource.name ?? "");
      setDescription(datasource.description ?? "");
      setUrl(datasource.url ?? "");
      setSource(datasource.source ?? "");
      if (datasource.source === DatasourceSource.CLICKHOUSE && datasource.config) {
        setClickhouseConfig(parseClickhouseFromDatasource(datasource.config as Record<string, unknown>));
        setCustomApiConfig({ ...DEFAULT_CUSTOM_API });
        setTempoJaegerAuthConfig({});
      } else if (datasource.source === DatasourceSource.CUSTOM_API && datasource.config) {
        setCustomApiConfig(parseCustomApiFromDatasource(datasource.config as Record<string, unknown>));
        setClickhouseConfig({ ...DEFAULT_CLICKHOUSE });
        setTempoJaegerAuthConfig({});
      } else if ((datasource.source === DatasourceSource.TEMPO || datasource.source === DatasourceSource.JAEGER) && datasource.config) {
        setTempoJaegerAuthConfig(parseTempoJaegerAuthFromDatasource(datasource.config as Record<string, unknown>));
        setClickhouseConfig({ ...DEFAULT_CLICKHOUSE });
        setCustomApiConfig({ ...DEFAULT_CUSTOM_API });
      } else {
        setClickhouseConfig({ ...DEFAULT_CLICKHOUSE });
        setCustomApiConfig({ ...DEFAULT_CUSTOM_API });
        setTempoJaegerAuthConfig({});
      }
    } else {
      setName("");
      setDescription("");
      setUrl("");
      setSource("");
      setClickhouseConfig({ ...DEFAULT_CLICKHOUSE });
      setCustomApiConfig({ ...DEFAULT_CUSTOM_API });
      setTempoJaegerAuthConfig({});
    }
  }, [isOpen, datasource?.id, datasource]);

  const validateForm = useCallback((): boolean => {
    const errors = validateDatasourceForm({
      source,
      clickhouseConfig,
      customApiConfig,
      tempoJaegerAuthConfig,
      url
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [source, clickhouseConfig, customApiConfig, tempoJaegerAuthConfig, url]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!validateForm()) return;

      const baseData = buildDatasourceSubmitData({
        name,
        description,
        source,
        clickhouseConfig,
        customApiConfig,
        tempoJaegerAuthConfig,
        url
      });

      const data = datasource ?
      baseData as UpdateDatasourceRequest :
      baseData as CreateDatasourceRequest;

      setIsSubmitting(true);
      try {
        await onSubmit(data);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, name, description, url, source, clickhouseConfig, customApiConfig, tempoJaegerAuthConfig, datasource, onSubmit]
  );

  return {
    name,
    setName,
    description,
    setDescription,
    url,
    setUrl,
    source,
    setSource: setSourceWithValidation,
    clickhouseConfig,
    setClickhouseConfig,
    customApiConfig,
    setCustomApiConfig,
    tempoJaegerAuthConfig,
    setTempoJaegerAuthConfig,
    validationErrors,
    clearValidation,
    validateForm,
    handleSubmit,
    isSubmitting,
    isEditMode: !!datasource
  };
}