"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList } from
"@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger } from
"@/components/ui/popover";
import { useTraceAttributeNames } from "@/hooks/traces/use-trace-attributes";
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation";
import { isForbiddenError } from "@/lib/error-handling";

interface AttributeSelectorProps {
  projectId?: string;
  datasourceId?: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  enabled?: boolean;
}

export function AttributeSelector({
  projectId,
  datasourceId,
  value,
  onValueChange,
  disabled = false,
  enabled = true
}: Readonly<AttributeSelectorProps>) {
  const [open, setOpen] = React.useState(false);
  const organisationId = useOrganisationIdOrNull();


  const { data: attributeNames = [], isLoading: isLoadingNames, error } = useTraceAttributeNames({
    organisationId,
    projectId,
    datasourceId,
    enabled: enabled && !!organisationId && !!projectId && !!datasourceId
  });

  const isLoading = isLoadingNames;
  const hasPermissionError = error && isForbiddenError(error);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-9 w-[250px] justify-between"
          disabled={disabled || isLoading || hasPermissionError || !enabled}
          title={hasPermissionError ? "You don't have permission to view attributes" : undefined}>

          {value || (hasPermissionError ? "No permission" : "Select attribute...")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search attribute..." className="h-9" />
          <CommandList>
            <CommandEmpty>
              {(() => {
                if (isLoading) return "Loading...";
                if (hasPermissionError) return "No permission to view attributes";
                return "No attribute found.";
              })()}
            </CommandEmpty>
            <CommandGroup>
              {attributeNames.map((name) =>
              <CommandItem
                key={name}
                value={name}
                onSelect={(currentValue) => {
                  onValueChange(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}>

                  <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === name ? "opacity-100" : "opacity-0"
                  )} />

                  {name}
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>);

}