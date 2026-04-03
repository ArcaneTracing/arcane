"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger } from
"@/components/ui/popover";

interface DateRangePickerProps {
  className?: string;
  value?: DateRange | undefined;
  onChange?: (range: DateRange | undefined) => void;
  disabled?: boolean;
}

export function DateRangePicker({
  className,
  value,
  onChange,
  disabled = false
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<DateRange | undefined>(value);


  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleSelect = (range: DateRange | undefined) => {
    console.log('DateRangePicker - handleSelect:', range);
    setInternalValue(range);


    if (range?.from && range?.to) {
      onChange?.(range);
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setInternalValue(undefined);
    onChange?.(undefined);
    setOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal group",
              !value?.from && "text-muted-foreground"
            )}
            disabled={disabled}>

            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from && value?.to ?
            <span className="flex-1">
                {format(value.from, "LLL dd, y")} -{" "}
                {format(value.to, "LLL dd, y")}
              </span> :

            <span>Pick a date range</span>
            }
            {(value?.from || value?.to) && !disabled &&
            <div
              role="button"
              className="ml-2 rounded-full hover:bg-muted p-1"
              onMouseDown={handleClear}
              onClick={handleClear}>

                <X className="h-4 w-4 opacity-50 group-hover:opacity-100" />
              </div>
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from || new Date()}
            selected={internalValue}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={disabled} />

        </PopoverContent>
      </Popover>
    </div>);

}