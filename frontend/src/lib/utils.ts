import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Primitive types that are safe to pass to String() (excludes object, null, undefined, string) */
export type NonObjectPrimitive = number | boolean | symbol | bigint;

export function safeStringify(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'string') return value;
  return String(value as NonObjectPrimitive);
}