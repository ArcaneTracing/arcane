"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useTestDatasourceConnection } from "@/hooks/datasources/use-test-datasource-connection";
import { DatasourceSource } from "@/types/enums";
import type { UseDatasourceFormReturn } from "@/hooks/datasources/use-datasource-form";

export interface DatasourceTestConnectionButtonProps {
  datasourceId?: string;
  form: UseDatasourceFormReturn;
  disabled?: boolean;
}

function buildTestConfig(form: UseDatasourceFormReturn): Record<string, any> | undefined {
  if (form.source === DatasourceSource.CLICKHOUSE) {
    return form.clickhouseConfig && Object.keys(form.clickhouseConfig).length > 0
      ? { clickhouse: form.clickhouseConfig }
      : undefined;
  } else if (form.source === DatasourceSource.CUSTOM_API) {
    return form.customApiConfig?.baseUrl
      ? { customApi: form.customApiConfig }
      : undefined;
  } else if (form.source === DatasourceSource.TEMPO || form.source === DatasourceSource.JAEGER) {
    return form.tempoJaegerAuthConfig?.authentication
      ? { authentication: form.tempoJaegerAuthConfig.authentication }
      : undefined;
  }
  return undefined;
}

export function DatasourceTestConnectionButton({
  datasourceId,
  form,
  disabled = false,
}: Readonly<DatasourceTestConnectionButtonProps>) {
  const testConnection = useTestDatasourceConnection();
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setTestResult(null);
  }, [form.url, form.source, form.tempoJaegerAuthConfig, form.clickhouseConfig, form.customApiConfig]);

  const handleTest = async () => {
    if (!form.source) {
      setTestResult({ success: false, message: 'Please select a datasource source first' });
      return;
    }

    if (form.source === DatasourceSource.CLICKHOUSE) {
      const hasConfig = form.clickhouseConfig?.host && form.clickhouseConfig?.database && form.clickhouseConfig?.tableName;
      if (!hasConfig && !form.url) {
        setTestResult({ success: false, message: 'Please configure ClickHouse connection details (host, database, table) or URL' });
        return;
      }
    } else if (form.source === DatasourceSource.CUSTOM_API) {
      if (!form.customApiConfig?.baseUrl) {
        setTestResult({ success: false, message: 'Please configure Custom API baseUrl first' });
        return;
      }
    } else if (!form.url) {
      setTestResult({ success: false, message: 'Please configure URL first' });
      return;
    }

    try {
      const result = await testConnection.mutateAsync({
        datasourceId,
        url: form.url,
        source: form.source,
        config: buildTestConfig(form),
      });
      setTestResult(result);
    } catch (error: any) {
      setTestResult({ 
        success: false, 
        message: error.response?.data?.message || error.message || 'Test failed' 
      });
    }
  };

  const hasSourceConfig = (() => {
    if (form.source === DatasourceSource.CLICKHOUSE) {
      return (
        (form.clickhouseConfig?.host && form.clickhouseConfig?.database && form.clickhouseConfig?.tableName) ||
        !!form.url
      );
    }
    if (form.source === DatasourceSource.CUSTOM_API) {
      return !!form.customApiConfig?.baseUrl;
    }
    return !!form.url;
  })();
  const canTest = !!form.source && hasSourceConfig && !disabled && !testConnection.isPending;

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleTest}
        disabled={!canTest}
        className="w-full"
      >
        {testConnection.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Testing...
          </>
        ) : (
          'Test Connection'
        )}
      </Button>
      {testResult && (
        <div className={`flex items-center gap-2 text-sm ${
          testResult.success 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          {testResult.success ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}
    </div>
  );
}
