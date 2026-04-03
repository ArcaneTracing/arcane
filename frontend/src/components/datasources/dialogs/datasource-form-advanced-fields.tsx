"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import type { ClickHouseConfig } from "@/hooks/datasources/use-datasource-form";
import { DatasourceSource } from "@/types/enums";
import type { CustomApiConfig, TempoJaegerAuthConfig } from "@/types/datasources";
import { InfoButton } from "@/components/shared/info-button";
import { datasourceTooltips } from "@/constants/datasource-tooltips";
import { DatasourceFormCustomApiFields } from "./datasource-form-custom-api-fields";
import { DatasourceFormAuthFields } from "./datasource-form-auth-fields";

const inputBase =
"w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500";

const inputError = "border-red-500 dark:border-red-500";

const labelClassName = "text-sm font-medium dark:text-gray-200";

export interface DatasourceFormAdvancedFieldsProps {
  source: DatasourceSource | "";
  url: string;
  clickhouseConfig: Partial<ClickHouseConfig>;
  customApiConfig: Partial<CustomApiConfig>;
  tempoJaegerAuthConfig: Partial<TempoJaegerAuthConfig>;
  validationErrors: Record<string, string>;
  onUrlChange: (value: string) => void;
  onClickhouseConfigChange: React.Dispatch<React.SetStateAction<Partial<ClickHouseConfig>>>;
  onCustomApiConfigChange: React.Dispatch<React.SetStateAction<Partial<CustomApiConfig>>>;
  onTempoJaegerAuthConfigChange: React.Dispatch<React.SetStateAction<Partial<TempoJaegerAuthConfig>>>;
  disabled?: boolean;
}

export function DatasourceFormAdvancedFields({
  source,
  url,
  clickhouseConfig,
  customApiConfig,
  tempoJaegerAuthConfig,
  validationErrors,
  onUrlChange,
  onClickhouseConfigChange,
  onCustomApiConfigChange,
  onTempoJaegerAuthConfigChange,
  disabled = false
}: Readonly<DatasourceFormAdvancedFieldsProps>) {
  if (!source) return null;

  if (source === DatasourceSource.CUSTOM_API) {
    return (
      <DatasourceFormCustomApiFields
        customApiConfig={customApiConfig}
        validationErrors={validationErrors}
        onCustomApiConfigChange={onCustomApiConfigChange}
        disabled={disabled} />);


  }

  if (source === DatasourceSource.CLICKHOUSE) {
    return (
      <>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="host" className={labelClassName}>
              Host <span className="text-red-500">*</span>
            </Label>
            <InfoButton content={datasourceTooltips.form.clickhouse.host} />
          </div>
          <Input
            id="host"
            name="host"
            value={clickhouseConfig.host ?? ""}
            onChange={(e) =>
            onClickhouseConfigChange((c) => ({ ...c, host: e.target.value }))
            }
            placeholder="localhost"
            className={`${inputBase} ${validationErrors.host ? inputError : ""}`}
            disabled={disabled}
            required />

          {validationErrors.host &&
          <p className="text-xs text-red-500">{validationErrors.host}</p>
          }
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="port" className={labelClassName}>
              Port
            </Label>
            <InfoButton content={datasourceTooltips.form.clickhouse.port} />
          </div>
          <Input
            id="port"
            name="port"
            type="number"
            value={clickhouseConfig.port ?? ""}
            onChange={(e) =>
            onClickhouseConfigChange((c) => ({
              ...c,
              port: Number.parseInt(e.target.value, 10) || 8123
            }))
            }
            placeholder="8123"
            min={1}
            max={65535}
            className={`${inputBase} ${validationErrors.port ? inputError : ""}`}
            disabled={disabled} />

          {validationErrors.port &&
          <p className="text-xs text-red-500">{validationErrors.port}</p>
          }
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="database" className={labelClassName}>
              Database <span className="text-red-500">*</span>
            </Label>
            <InfoButton content={datasourceTooltips.form.clickhouse.database} />
          </div>
          <Input
            id="database"
            name="database"
            value={clickhouseConfig.database ?? ""}
            onChange={(e) =>
            onClickhouseConfigChange((c) => ({ ...c, database: e.target.value }))
            }
            placeholder="default"
            className={`${inputBase} ${validationErrors.database ? inputError : ""}`}
            disabled={disabled}
            required />

          {validationErrors.database &&
          <p className="text-xs text-red-500">{validationErrors.database}</p>
          }
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="protocol" className={labelClassName}>
              Protocol
            </Label>
            <InfoButton content={datasourceTooltips.form.clickhouse.protocol} />
          </div>
          <Select
            value={clickhouseConfig.protocol || "http"}
            onValueChange={(value: "http" | "https") =>
            onClickhouseConfigChange((c) => ({ ...c, protocol: value }))
            }
            disabled={disabled}>

            <SelectTrigger id="protocol" className="h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="http">HTTP</SelectItem>
              <SelectItem value="https">HTTPS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="tableName" className={labelClassName}>
              Table Name <span className="text-red-500">*</span>
            </Label>
            <InfoButton content={datasourceTooltips.form.clickhouse.tableName} />
          </div>
          <Input
            id="tableName"
            name="tableName"
            value={clickhouseConfig.tableName ?? ""}
            onChange={(e) =>
            onClickhouseConfigChange((c) => ({ ...c, tableName: e.target.value }))
            }
            placeholder="traces"
            className={`${inputBase} ${validationErrors.tableName ? inputError : ""}`}
            disabled={disabled}
            required />

          {validationErrors.tableName &&
          <p className="text-xs text-red-500">{validationErrors.tableName}</p>
          }
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-[#2A2A2A]">
          <div className="flex items-center gap-2 mb-3">
            <Label className={`${labelClassName} block`}>
              Authentication (Optional)
            </Label>
            <InfoButton content={datasourceTooltips.form.clickhouse.authentication} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="username" className={labelClassName}>
                Username
              </Label>
              <InfoButton content={datasourceTooltips.form.clickhouse.username} />
            </div>
            <Input
              id="username"
              name="username"
              value={clickhouseConfig.username ?? ""}
              onChange={(e) =>
              onClickhouseConfigChange((c) => ({ ...c, username: e.target.value }))
              }
              placeholder="default"
              className={inputBase}
              disabled={disabled} />

          </div>
          <div className="space-y-2 mt-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="password" className={labelClassName}>
                Password
              </Label>
              <InfoButton content={datasourceTooltips.form.clickhouse.password} />
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              value={clickhouseConfig.password ?? ""}
              onChange={(e) =>
              onClickhouseConfigChange((c) => ({ ...c, password: e.target.value }))
              }
              placeholder="Leave empty for no password"
              className={inputBase}
              disabled={disabled} />

          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="url" className={labelClassName}>
              URL (Alternative)
            </Label>
            <InfoButton content={datasourceTooltips.form.clickhouse.urlAlternative} />
          </div>
          <Input
            id="url"
            name="url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="http://localhost:8123/default?table=traces"
            className={inputBase}
            disabled={disabled} />

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Optional: Use URL instead of config fields above for backward compatibility
          </p>
        </div>
      </>);

  }


  if (source === DatasourceSource.TEMPO || source === DatasourceSource.JAEGER) {
    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="url" className={labelClassName}>
            URL <span className="text-red-500">*</span>
          </Label>
          <Input
            id="url"
            name="url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="http://localhost:9090"
            className={`${inputBase} ${validationErrors.url ? 'border-red-500 dark:border-red-500' : ''}`}
            disabled={disabled}
            required />
          {validationErrors.url && (
            <p className="text-xs text-red-500">{validationErrors.url}</p>
          )}
        </div>
        <DatasourceFormAuthFields
          authConfig={tempoJaegerAuthConfig}
          onAuthConfigChange={onTempoJaegerAuthConfigChange}
          disabled={disabled}
          validationErrors={validationErrors}
        />
      </>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="url" className={labelClassName}>
        URL
      </Label>
      <Input
        id="url"
        name="url"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="http://localhost:9090"
        className={inputBase}
        disabled={disabled}
        required />

    </div>);

}