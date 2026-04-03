

import type { NavigateOptions } from '@tanstack/react-router';
import type { router } from '@/router';

type ToOptions = Parameters<typeof router.navigate>[0]['to'];


export function createNavigationPath(path: string): ToOptions {


  return path as ToOptions;
}

export function createNavigationOptions(
path: string,
options?: Omit<NavigateOptions, 'to'>)
: NavigateOptions {
  return {
    to: path as ToOptions,
    ...options
  };
}