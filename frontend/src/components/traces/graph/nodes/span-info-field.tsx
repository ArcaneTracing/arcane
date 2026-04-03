import React from 'react';

interface SpanInfoFieldProps {
  label: string;
  value: string | number | object | null | undefined | React.ReactNode;
  className?: string;
}

function toRenderableValue(value: SpanInfoFieldProps['value']): React.ReactNode {
  if (value == null) return '—';
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'object' && !Array.isArray(value) && React.isValidElement(value)) return value;
  return JSON.stringify(value);
}

export function SpanInfoField({ label, value, className = "text-sm" }: Readonly<SpanInfoFieldProps>) {
  return (
    <div className={className}>
      <span className="text-muted-foreground">{label}: </span>
      {toRenderableValue(value)}
    </div>
  );
}

