"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Info } from 'lucide-react';
import { useOrganisationRetention } from '@/hooks/retention/use-organisation-retention';
import { useOrganisationIdOrNull } from '@/hooks/useOrganisation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger } from
'@/components/ui/tooltip';

const DEFAULT_RETENTION_DAYS = 365;
const MIN_RETENTION_DAYS = 30;
const MAX_RETENTION_DAYS = 2555;

export function OrganisationRetentionTab() {
  const organisationId = useOrganisationIdOrNull();
  const { data, isLoading, updateRetention, isUpdating } = useOrganisationRetention(
    organisationId || ''
  );

  const [auditLogRetentionDays, setAuditLogRetentionDays] = useState<string>('');

  useEffect(() => {
    if (data) {
      setAuditLogRetentionDays(
        String(data.auditLogRetentionDays ?? DEFAULT_RETENTION_DAYS)
      );
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>);

  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const days = Number.parseInt(auditLogRetentionDays, 10);
    if (Number.isNaN(days) || days < MIN_RETENTION_DAYS || days > MAX_RETENTION_DAYS) {
      return;
    }
    updateRetention({ auditLogRetentionDays: days });
  };

  const currentValue = data?.auditLogRetentionDays ?? DEFAULT_RETENTION_DAYS;
  const hasChanges = Number.parseInt(auditLogRetentionDays, 10) !== currentValue;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Data Retention Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure how long data is retained before automatic deletion. These settings help manage
          storage costs while maintaining compliance requirements.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="audit-log-retention">Audit Log Retention (days)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Audit logs record all actions performed in the system. They are critical for
                    compliance and security auditing. Older logs will be automatically deleted based
                    on this retention period.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="audit-log-retention"
            type="number"
            min={MIN_RETENTION_DAYS}
            max={MAX_RETENTION_DAYS}
            value={auditLogRetentionDays}
            onChange={(e) => setAuditLogRetentionDays(e.target.value)}
            placeholder={String(DEFAULT_RETENTION_DAYS)} />

          <p className="text-xs text-muted-foreground">
            Minimum: {MIN_RETENTION_DAYS} days, Maximum: {MAX_RETENTION_DAYS} days (7 years).
            Default: {DEFAULT_RETENTION_DAYS} days.
          </p>
        </div>

        {hasChanges &&
        <div className="flex items-center gap-2">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
            <Button
            type="button"
            variant="outline"
            onClick={() =>
            setAuditLogRetentionDays(String(data?.auditLogRetentionDays ?? DEFAULT_RETENTION_DAYS))
            }>

              Cancel
            </Button>
          </div>
        }
      </form>

      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold mb-2">Current Settings</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Audit Logs:</span>
            <span className="font-medium">{currentValue} days</span>
          </div>
        </div>
      </div>
    </div>);

}