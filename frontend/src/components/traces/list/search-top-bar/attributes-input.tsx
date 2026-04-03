"use client";

import { Input } from "@/components/ui/input";
import { TagBadge } from "./tag-badge";

interface AttributesInputProps {
  attributes: string[];
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemoveAttribute: (attribute: string) => void;
}


export function AttributesInput({
  attributes,
  value,
  onChange,
  onKeyDown,
  onRemoveAttribute
}: Readonly<AttributesInputProps>) {
  return (
    <div className="flex-1 flex flex-col gap-1.5 min-w-0">
      {attributes.length > 0 &&
      <div className="flex flex-wrap gap-1.5">
          {attributes.map((attr) =>
        <TagBadge
          key={attr}
          label={attr}
          onRemove={() => onRemoveAttribute(attr)} />

        )}
        </div>
      }
      <Input
        className="h-9"
        placeholder="Add attribute (e.g. service.name=my-service)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown} />

    </div>);

}