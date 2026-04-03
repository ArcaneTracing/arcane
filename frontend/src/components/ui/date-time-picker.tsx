"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger } from
"@/components/ui/popover";

interface DateTimePickerProps {
  className?: string;
  value?: Date | undefined;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function DateTimePicker({
  className,
  value,
  onChange,
  disabled = false,
  placeholder = "Pick a date and time"
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [timeValue, setTimeValue] = React.useState<string>("");


  React.useEffect(() => {
    if (value) {
      const hours = value.getHours().toString().padStart(2, '0');
      const minutes = value.getMinutes().toString().padStart(2, '0');
      setTimeValue(`${hours}:${minutes}`);
    } else {
      setTimeValue("");
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange?.(undefined);
      return;
    }


    if (timeValue) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      date.setHours(hours || 0, minutes || 0, 0, 0);
    } else {

      const now = new Date();
      date.setHours(now.getHours(), now.getMinutes(), 0, 0);
    }

    onChange?.(date);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);

    if (value && newTime) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const newDate = new Date(value);
      newDate.setHours(hours || 0, minutes || 0, 0, 0);
      onChange?.(newDate);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange?.(undefined);
    setTimeValue("");
    setOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal group",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}>

            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ?
            <span className="flex-1">
                {format(value, "LLL dd, y HH:mm")}
              </span> :

            <span>{placeholder}</span>
            }
            {value && !disabled &&
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
          <div className="p-3">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDateSelect}
              initialFocus />

            <div className="flex items-center gap-2 pt-3 border-t">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={timeValue}
                onChange={handleTimeChange}
                className="w-[120px]" />

            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>);

}