"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TempoJaegerAuthConfig } from "@/types/datasources";
import { InfoButton } from "@/components/shared/info-button";
import { datasourceTooltips } from "@/constants/datasource-tooltips";

const inputBase =
  "w-full h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm focus:ring-0 focus:ring-offset-0 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500";

const labelClassName = "text-sm font-medium dark:text-gray-200";

export interface DatasourceFormAuthFieldsProps {
  authConfig: Partial<TempoJaegerAuthConfig>;
  onAuthConfigChange: React.Dispatch<React.SetStateAction<Partial<TempoJaegerAuthConfig>>>;
  disabled?: boolean;
  validationErrors?: Record<string, string>;
}

export function DatasourceFormAuthFields({
  authConfig,
  onAuthConfigChange,
  disabled = false,
  validationErrors = {},
}: Readonly<DatasourceFormAuthFieldsProps>) {
  const authType = authConfig.authentication?.type || 'none';

  const handleAuthTypeChange = (value: string) => {
    if (value === 'none') {
      onAuthConfigChange({});
    } else {
      onAuthConfigChange({
        authentication: {
          type: value as 'basic' | 'bearer',
          ...(value === 'basic' ? { username: '', password: '' } : { token: '' }),
        },
      });
    }
  };

  return (
    <div className="pt-2 border-t border-gray-100 dark:border-[#2A2A2A]">
      <div className="flex items-center gap-2 mb-3">
        <Label className={`${labelClassName} block`}>
          Authentication (Optional)
        </Label>
        <InfoButton content={datasourceTooltips.form.tempoJaegerAuth || "Configure authentication for Tempo/Jaeger datasource"} />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="authType" className={labelClassName}>
            Authentication Type
          </Label>
          <Select
            value={authType}
            onValueChange={handleAuthTypeChange}
            disabled={disabled}
          >
            <SelectTrigger id="authType" className="h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white rounded-lg text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="basic">Basic Authentication</SelectItem>
              <SelectItem value="bearer">Bearer Token</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {authType === 'basic' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="authUsername" className={labelClassName}>
                Username
                {validationErrors['authentication.username'] && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              <Input
                id="authUsername"
                name="authUsername"
                value={authConfig.authentication?.username ?? ""}
                onChange={(e) =>
                  onAuthConfigChange((prev) => ({
                    ...prev,
                    authentication: {
                      ...prev.authentication,
                      type: 'basic',
                      username: e.target.value,
                      password: prev.authentication?.password ?? '',
                    },
                  }))
                }
                placeholder="Enter username"
                className={`${inputBase} ${validationErrors['authentication.username'] ? 'border-red-500 dark:border-red-500' : ''}`}
                disabled={disabled}
              />
              {validationErrors['authentication.username'] && (
                <p className="text-xs text-red-500">{validationErrors['authentication.username']}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="authPassword" className={labelClassName}>
                Password
                {validationErrors['authentication.password'] && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              <Input
                id="authPassword"
                name="authPassword"
                type="password"
                value={authConfig.authentication?.password ?? ""}
                onChange={(e) =>
                  onAuthConfigChange((prev) => ({
                    ...prev,
                    authentication: {
                      ...prev.authentication,
                      type: 'basic',
                      username: prev.authentication?.username ?? '',
                      password: e.target.value,
                    },
                  }))
                }
                placeholder={authConfig.authentication?.password === '***' ? "Enter new password to update" : "Enter password"}
                className={`${inputBase} ${validationErrors['authentication.password'] ? 'border-red-500 dark:border-red-500' : ''}`}
                disabled={disabled}
              />
              {validationErrors['authentication.password'] && (
                <p className="text-xs text-red-500">{validationErrors['authentication.password']}</p>
              )}
            </div>
          </>
        )}

        {authType === 'bearer' && (
          <div className="space-y-2">
            <Label htmlFor="authToken" className={labelClassName}>
              Token
              {validationErrors['authentication.token'] && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <Input
              id="authToken"
              name="authToken"
              type="password"
              value={authConfig.authentication?.token ?? ""}
              onChange={(e) =>
                onAuthConfigChange((prev) => ({
                  ...prev,
                  authentication: {
                    ...prev.authentication,
                    type: 'bearer',
                    token: e.target.value,
                  },
                }))
              }
              placeholder={authConfig.authentication?.token === '***' ? "Enter new token to update" : "Enter bearer token"}
              className={`${inputBase} ${validationErrors['authentication.token'] ? 'border-red-500 dark:border-red-500' : ''}`}
              disabled={disabled}
            />
            {validationErrors['authentication.token'] && (
              <p className="text-xs text-red-500">{validationErrors['authentication.token']}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
