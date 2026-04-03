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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger } from
"@/components/ui/accordion";
import type { CustomApiConfig } from "@/types/datasources";
import { InfoButton } from "@/components/shared/info-button";
import { datasourceTooltips } from "@/constants/datasource-tooltips";

const inputBase =
"w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500";

const inputError = "border-red-500 dark:border-red-500";

const textareaBase =
"w-full min-h-[80px] border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500";

const labelClassName = "text-sm font-medium dark:text-gray-200";

export interface DatasourceFormCustomApiFieldsProps {
  customApiConfig: Partial<CustomApiConfig>;
  validationErrors: Record<string, string>;
  onCustomApiConfigChange: React.Dispatch<React.SetStateAction<Partial<CustomApiConfig>>>;
  disabled?: boolean;
}

function parseHeaders(headersText: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!headersText.trim()) return headers;

  headersText.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) return;
    const key = trimmed.substring(0, colonIndex).trim();
    const value = trimmed.substring(colonIndex + 1).trim();
    if (key && value) {
      headers[key] = value;
    }
  });
  return headers;
}

function formatHeaders(headers: Record<string, string> | undefined): string {
  if (!headers || Object.keys(headers).length === 0) return "";
  return Object.entries(headers).
  map(([key, value]) => `${key}: ${value}`).
  join("\n");
}

export function DatasourceFormCustomApiFields({
  customApiConfig,
  validationErrors,
  onCustomApiConfigChange,
  disabled = false
}: Readonly<DatasourceFormCustomApiFieldsProps>) {
  const openApiSpecUrl = new URL("./resources/custom-api-openapi.yaml", import.meta.url).toString();

  const capabilities = customApiConfig.capabilities ?? {
    searchByQuery: true,
    searchByAttributes: false,
    filterByAttributeExists: false,
    getAttributeNames: false,
    getAttributeValues: false
  };

  return (
    <div className="space-y-4">
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Want a reference implementation?{" "}
        <a
          href={openApiSpecUrl}
          download="custom-api-openapi.yaml"
          className="text-blue-600 dark:text-blue-400 hover:underline">

          Download the Custom API OpenAPI spec.
        </a>
      </div>

      {}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="baseUrl" className={labelClassName}>
            Base URL <span className="text-red-500">*</span>
          </Label>
          <InfoButton content={datasourceTooltips.form.customApi.baseUrl} />
        </div>
        <Input
          id="baseUrl"
          name="baseUrl"
          value={customApiConfig.baseUrl ?? ""}
          onChange={(e) =>
          onCustomApiConfigChange((c) => ({ ...c, baseUrl: e.target.value }))
          }
          placeholder="https://api.example.com"
          className={`${inputBase} ${validationErrors.baseUrl ? inputError : ""}`}
          disabled={disabled}
          required />

        {validationErrors.baseUrl &&
        <p className="text-xs text-red-500">{validationErrors.baseUrl}</p>
        }
      </div>

      {}
      <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-[#2A2A2A]">
        <h3 className="text-sm font-semibold dark:text-gray-200">Endpoints</h3>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="searchPath" className={labelClassName}>
              Search Endpoint Path <span className="text-red-500">*</span>
            </Label>
            <InfoButton content={datasourceTooltips.form.customApi.endpoints.search} />
          </div>
          <Input
            id="searchPath"
            name="searchPath"
            value={customApiConfig.endpoints?.search?.path ?? ""}
            onChange={(e) =>
            onCustomApiConfigChange((c) => ({
              ...c,
              endpoints: {
                ...c.endpoints,
                search: { path: e.target.value },
                searchByTraceId: c.endpoints?.searchByTraceId ?? { path: "" },
                attributeNames: c.endpoints?.attributeNames,
                attributeValues: c.endpoints?.attributeValues
              }
            }))
            }
            placeholder="/api/traces/search"
            className={`${inputBase} ${validationErrors["endpoints.search.path"] ? inputError : ""}`}
            disabled={disabled}
            required />

          {validationErrors["endpoints.search.path"] &&
          <p className="text-xs text-red-500">{validationErrors["endpoints.search.path"]}</p>
          }
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="searchByTraceIdPath" className={labelClassName}>
              Search by Trace ID Endpoint Path <span className="text-red-500">*</span>
            </Label>
            <InfoButton content={datasourceTooltips.form.customApi.endpoints.searchByTraceId} />
          </div>
          <Input
            id="searchByTraceIdPath"
            name="searchByTraceIdPath"
            value={customApiConfig.endpoints?.searchByTraceId?.path ?? ""}
            onChange={(e) =>
            onCustomApiConfigChange((c) => ({
              ...c,
              endpoints: {
                ...c.endpoints,
                search: c.endpoints?.search ?? { path: "" },
                searchByTraceId: { path: e.target.value },
                attributeNames: c.endpoints?.attributeNames,
                attributeValues: c.endpoints?.attributeValues
              }
            }))
            }
            placeholder="/api/traces/{traceId}"
            className={`${inputBase} ${validationErrors["endpoints.searchByTraceId.path"] ? inputError : ""}`}
            disabled={disabled}
            required />

          {validationErrors["endpoints.searchByTraceId.path"] &&
          <p className="text-xs text-red-500">{validationErrors["endpoints.searchByTraceId.path"]}</p>
          }
        </div>

        {capabilities.getAttributeNames &&
        <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="attributeNamesPath" className={labelClassName}>
                Attribute Names Endpoint Path <span className="text-red-500">*</span>
              </Label>
              <InfoButton content={datasourceTooltips.form.customApi.endpoints.attributeNames} />
            </div>
            <Input
            id="attributeNamesPath"
            name="attributeNamesPath"
            value={customApiConfig.endpoints?.attributeNames?.path ?? ""}
            onChange={(e) =>
            onCustomApiConfigChange((c) => ({
              ...c,
              endpoints: {
                ...c.endpoints,
                search: c.endpoints?.search ?? { path: "" },
                searchByTraceId: c.endpoints?.searchByTraceId ?? { path: "" },
                attributeNames: { path: e.target.value },
                attributeValues: c.endpoints?.attributeValues
              }
            }))
            }
            placeholder="/api/attributes"
            className={`${inputBase} ${validationErrors["endpoints.attributeNames.path"] ? inputError : ""}`}
            disabled={disabled}
            required />

            {validationErrors["endpoints.attributeNames.path"] &&
          <p className="text-xs text-red-500">{validationErrors["endpoints.attributeNames.path"]}</p>
          }
          </div>
        }

        {capabilities.getAttributeValues &&
        <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="attributeValuesPath" className={labelClassName}>
                Attribute Values Endpoint Path <span className="text-red-500">*</span>
              </Label>
              <InfoButton content={datasourceTooltips.form.customApi.endpoints.attributeValues} />
            </div>
            <Input
            id="attributeValuesPath"
            name="attributeValuesPath"
            value={customApiConfig.endpoints?.attributeValues?.path ?? ""}
            onChange={(e) =>
            onCustomApiConfigChange((c) => ({
              ...c,
              endpoints: {
                ...c.endpoints,
                search: c.endpoints?.search ?? { path: "" },
                searchByTraceId: c.endpoints?.searchByTraceId ?? { path: "" },
                attributeNames: c.endpoints?.attributeNames,
                attributeValues: { path: e.target.value }
              }
            }))
            }
            placeholder="/api/attributes/{attributeName}/values"
            className={`${inputBase} ${validationErrors["endpoints.attributeValues.path"] ? inputError : ""}`}
            disabled={disabled}
            required />

            {validationErrors["endpoints.attributeValues.path"] &&
          <p className="text-xs text-red-500">{validationErrors["endpoints.attributeValues.path"]}</p>
          }
          </div>
        }
      </div>

      {}
      <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-[#2A2A2A]">
        <h3 className="text-sm font-semibold dark:text-gray-200">Capabilities</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="searchByQuery" className={labelClassName}>
                Search by Query
              </Label>
              <InfoButton content={datasourceTooltips.form.customApi.capabilities.searchByQuery} />
            </div>
            <Switch
              id="searchByQuery"
              checked={capabilities.searchByQuery ?? true}
              onCheckedChange={(checked) =>
              onCustomApiConfigChange((c) => ({
                ...c,
                capabilities: {
                  ...c.capabilities,
                  searchByQuery: checked,
                  searchByAttributes: c.capabilities?.searchByAttributes ?? false,
                  filterByAttributeExists: c.capabilities?.filterByAttributeExists ?? false,
                  getAttributeNames: c.capabilities?.getAttributeNames ?? false,
                  getAttributeValues: c.capabilities?.getAttributeValues ?? false
                }
              }))
              }
              disabled={disabled} />

          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="searchByAttributes" className={labelClassName}>
                Search by Attributes
              </Label>
              <InfoButton content={datasourceTooltips.form.customApi.capabilities.searchByAttributes} />
            </div>
            <Switch
              id="searchByAttributes"
              checked={capabilities.searchByAttributes ?? false}
              onCheckedChange={(checked) =>
              onCustomApiConfigChange((c) => ({
                ...c,
                capabilities: {
                  ...c.capabilities,
                  searchByQuery: c.capabilities?.searchByQuery ?? true,
                  searchByAttributes: checked,
                  filterByAttributeExists: c.capabilities?.filterByAttributeExists ?? false,
                  getAttributeNames: c.capabilities?.getAttributeNames ?? false,
                  getAttributeValues: c.capabilities?.getAttributeValues ?? false
                }
              }))
              }
              disabled={disabled} />

          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="filterByAttributeExists" className={labelClassName}>
                Filter by Attribute Exists
              </Label>
              <InfoButton content={datasourceTooltips.form.customApi.capabilities.filterByAttributeExists} />
            </div>
            <Switch
              id="filterByAttributeExists"
              checked={capabilities.filterByAttributeExists ?? false}
              onCheckedChange={(checked) =>
              onCustomApiConfigChange((c) => ({
                ...c,
                capabilities: {
                  ...c.capabilities,
                  searchByQuery: c.capabilities?.searchByQuery ?? true,
                  searchByAttributes: c.capabilities?.searchByAttributes ?? false,
                  filterByAttributeExists: checked,
                  getAttributeNames: c.capabilities?.getAttributeNames ?? false,
                  getAttributeValues: c.capabilities?.getAttributeValues ?? false
                }
              }))
              }
              disabled={disabled} />

          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="getAttributeNames" className={labelClassName}>
                Get Attribute Names
              </Label>
              <InfoButton content={datasourceTooltips.form.customApi.capabilities.getAttributeNames} />
            </div>
            <Switch
              id="getAttributeNames"
              checked={capabilities.getAttributeNames ?? false}
              onCheckedChange={(checked) =>
              onCustomApiConfigChange((c) => {
                const newConfig = {
                  ...c,
                  capabilities: {
                    ...c.capabilities,
                    searchByQuery: c.capabilities?.searchByQuery ?? true,
                    searchByAttributes: c.capabilities?.searchByAttributes ?? false,
                    filterByAttributeExists: c.capabilities?.filterByAttributeExists ?? false,
                    getAttributeNames: checked,
                    getAttributeValues: c.capabilities?.getAttributeValues ?? false
                  }
                };

                if (!checked && newConfig.endpoints) {
                  const { attributeNames, ...restEndpoints } = newConfig.endpoints;
                  newConfig.endpoints = restEndpoints;
                }
                return newConfig;
              })
              }
              disabled={disabled} />

          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="getAttributeValues" className={labelClassName}>
                Get Attribute Values
              </Label>
              <InfoButton content={datasourceTooltips.form.customApi.capabilities.getAttributeValues} />
            </div>
            <Switch
              id="getAttributeValues"
              checked={capabilities.getAttributeValues ?? false}
              onCheckedChange={(checked) =>
              onCustomApiConfigChange((c) => {
                const newConfig = {
                  ...c,
                  capabilities: {
                    ...c.capabilities,
                    searchByQuery: c.capabilities?.searchByQuery ?? true,
                    searchByAttributes: c.capabilities?.searchByAttributes ?? false,
                    filterByAttributeExists: c.capabilities?.filterByAttributeExists ?? false,
                    getAttributeNames: c.capabilities?.getAttributeNames ?? false,
                    getAttributeValues: checked
                  }
                };

                if (!checked && newConfig.endpoints) {
                  const { attributeValues, ...restEndpoints } = newConfig.endpoints;
                  newConfig.endpoints = restEndpoints;
                }
                return newConfig;
              })
              }
              disabled={disabled} />

          </div>
        </div>
      </div>

      {}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="authentication" className="border-t border-gray-100 dark:border-[#2A2A2A]">
          <div className="flex items-center gap-2">
            <AccordionTrigger className="text-sm font-semibold dark:text-gray-200">
              Authentication (Optional)
            </AccordionTrigger>
            <InfoButton content={datasourceTooltips.form.customApi.authentication.type} />
          </div>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="authType" className={labelClassName}>
                  Authentication Type
                </Label>
                <Select
                  value={customApiConfig.authentication?.type ?? ""}
                  onValueChange={(value: "header" | "bearer" | "basic" | "") =>
                  onCustomApiConfigChange((c) => ({
                    ...c,
                    authentication: value ?
                    {
                      type: value,
                      headerName: value === "header" ? c.authentication?.headerName : undefined,
                      value: value === "header" || value === "bearer" ? c.authentication?.value : undefined,
                      username: value === "basic" ? c.authentication?.username : undefined,
                      password: value === "basic" ? c.authentication?.password : undefined
                    } :
                    undefined
                  }))
                  }
                  disabled={disabled}>

                  <SelectTrigger id="authType" className="h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm">
                    <SelectValue placeholder="Select authentication type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="bearer">Bearer</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {customApiConfig.authentication?.type === "header" &&
              <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="headerName" className={labelClassName}>
                        Header Name <span className="text-red-500">*</span>
                      </Label>
                      <InfoButton content={datasourceTooltips.form.customApi.authentication.headerName} />
                    </div>
                    <Input
                    id="headerName"
                    name="headerName"
                    value={customApiConfig.authentication.headerName ?? ""}
                    onChange={(e) =>
                    onCustomApiConfigChange((c) => ({
                      ...c,
                      authentication: {
                        ...c.authentication!,
                        headerName: e.target.value
                      }
                    }))
                    }
                    placeholder="X-API-Key"
                    className={`${inputBase} ${validationErrors["authentication.headerName"] ? inputError : ""}`}
                    disabled={disabled}
                    required />

                    {validationErrors["authentication.headerName"] &&
                  <p className="text-xs text-red-500">{validationErrors["authentication.headerName"]}</p>
                  }
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="authValue" className={labelClassName}>
                        Value <span className="text-red-500">*</span>
                      </Label>
                      <InfoButton content={datasourceTooltips.form.customApi.authentication.value} />
                    </div>
                    <Input
                    id="authValue"
                    name="authValue"
                    type="password"
                    value={customApiConfig.authentication.value ?? ""}
                    onChange={(e) =>
                    onCustomApiConfigChange((c) => ({
                      ...c,
                      authentication: {
                        ...c.authentication!,
                        value: e.target.value
                      }
                    }))
                    }
                    placeholder="your-api-key"
                    className={`${inputBase} ${validationErrors["authentication.value"] ? inputError : ""}`}
                    disabled={disabled}
                    required />

                    {validationErrors["authentication.value"] &&
                  <p className="text-xs text-red-500">{validationErrors["authentication.value"]}</p>
                  }
                  </div>
                </>
              }

              {customApiConfig.authentication?.type === "bearer" &&
              <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="bearerToken" className={labelClassName}>
                      Token <span className="text-red-500">*</span>
                    </Label>
                    <InfoButton content={datasourceTooltips.form.customApi.authentication.value} />
                  </div>
                  <Input
                  id="bearerToken"
                  name="bearerToken"
                  type="password"
                  value={customApiConfig.authentication.value ?? ""}
                  onChange={(e) =>
                  onCustomApiConfigChange((c) => ({
                    ...c,
                    authentication: {
                      ...c.authentication!,
                      value: e.target.value
                    }
                  }))
                  }
                  placeholder="your-bearer-token"
                  className={`${inputBase} ${validationErrors["authentication.value"] ? inputError : ""}`}
                  disabled={disabled}
                  required />

                  {validationErrors["authentication.value"] &&
                <p className="text-xs text-red-500">{validationErrors["authentication.value"]}</p>
                }
                </div>
              }

              {customApiConfig.authentication?.type === "basic" &&
              <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="username" className={labelClassName}>
                        Username <span className="text-red-500">*</span>
                      </Label>
                      <InfoButton content={datasourceTooltips.form.customApi.authentication.username} />
                    </div>
                    <Input
                    id="username"
                    name="username"
                    value={customApiConfig.authentication.username ?? ""}
                    onChange={(e) =>
                    onCustomApiConfigChange((c) => ({
                      ...c,
                      authentication: {
                        ...c.authentication!,
                        username: e.target.value
                      }
                    }))
                    }
                    placeholder="username"
                    className={`${inputBase} ${validationErrors["authentication.username"] ? inputError : ""}`}
                    disabled={disabled}
                    required />

                    {validationErrors["authentication.username"] &&
                  <p className="text-xs text-red-500">{validationErrors["authentication.username"]}</p>
                  }
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="password" className={labelClassName}>
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <InfoButton content={datasourceTooltips.form.customApi.authentication.password} />
                    </div>
                    <Input
                    id="password"
                    name="password"
                    type="password"
                    value={customApiConfig.authentication.password ?? ""}
                    onChange={(e) =>
                    onCustomApiConfigChange((c) => ({
                      ...c,
                      authentication: {
                        ...c.authentication!,
                        password: e.target.value
                      }
                    }))
                    }
                    placeholder="password"
                    className={`${inputBase} ${validationErrors["authentication.password"] ? inputError : ""}`}
                    disabled={disabled}
                    required />

                    {validationErrors["authentication.password"] &&
                  <p className="text-xs text-red-500">{validationErrors["authentication.password"]}</p>
                  }
                  </div>
                </>
              }
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="headers" className="border-t border-gray-100 dark:border-[#2A2A2A]">
          <div className="flex items-center gap-2">
            <AccordionTrigger className="text-sm font-semibold dark:text-gray-200">
              Custom Headers (Optional)
            </AccordionTrigger>
            <InfoButton content={datasourceTooltips.form.customApi.headers} />
          </div>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              <Textarea
                id="headers"
                name="headers"
                value={formatHeaders(customApiConfig.headers)}
                onChange={(e) => {
                  const headers = parseHeaders(e.target.value);
                  onCustomApiConfigChange((c) => ({
                    ...c,
                    headers: Object.keys(headers).length > 0 ? headers : undefined
                  }));
                }}
                placeholder="X-Custom-Header: value1&#10;X-Another-Header: value2"
                className={textareaBase}
                disabled={disabled} />

            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>);

}