import { render, RenderOptions, waitFor, screen } from '@testing-library/react'
import { createElement, ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { UseMutationResult } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { ErrorBoundary } from 'react-error-boundary'
import type { FallbackProps } from 'react-error-boundary'
import { createTestQueryClient } from '@/__tests__/test-utils'
export function Thrower() {
  throw new Error('Test render error')
}
export function createOneTimeThrower() {
  let hasThrown = false
  return function OneTimeThrower() {
    if (!hasThrown) {
      hasThrown = true
      throw new Error('Test first-render error')
    }
    return createElement('div', null, 'Recovered')
  }
}
export const mockToast = {
  error: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
  info: jest.fn(),
}
jest.mock('sonner', () => ({
  toast: {
    error: (...args: any[]) => mockToast.error(...args),
    success: (...args: any[]) => mockToast.success(...args),
    warning: (...args: any[]) => mockToast.warning(...args),
    info: (...args: any[]) => mockToast.info(...args),
  },
  Toaster: () => null,
}))
function TestErrorFallback({ error }: FallbackProps) {
  const msg = error instanceof Error ? error.message : String(error ?? 'Unknown error')
  return (
    <div role="alert">
      Something went wrong: {msg}
    </div>
  )
}
interface RenderWithErrorBoundaryOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
}
export function renderWithErrorBoundary(
  ui: ReactElement,
  options: RenderWithErrorBoundaryOptions = {}
) {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary FallbackComponent={TestErrorFallback}>
        {children}
      </ErrorBoundary>
      <Toaster />
    </QueryClientProvider>
  )
  return render(ui, { wrapper: Wrapper, ...renderOptions })
}
export async function waitForError(
  errorText: string | RegExp,
  options: { timeout?: number } = {}
) {
  return waitFor(
    () => {
      const errorElement = screen.queryByText(errorText)
      if (!errorElement) {
        throw new Error(`Error message "${errorText}" not found`)
      }
      return errorElement
    },
    { timeout: options.timeout || 3000 }
  )
}
export async function expectErrorDisplay(
  errorText: string | RegExp,
  options: {
    variant?: 'default' | 'inline'
    timeout?: number
  } = {}
) {
  const errorElement = await waitForError(errorText, { timeout: options.timeout })
  expect(errorElement).toBeInTheDocument()
  if (options.variant === 'default') {
    const parent = errorElement.closest('.text-red-500, .bg-red-50, [class*="red"]')
    expect(parent || errorElement).toBeInTheDocument()
  } else if (options.variant === 'inline') {
    expect(errorElement).toBeInTheDocument()
  }
  return errorElement
}
export function expectToast(
  type: 'error' | 'success' | 'warning' | 'info',
  message?: string | RegExp
) {
  const toastFn = mockToast[type]
  expect(toastFn).toHaveBeenCalled()
  if (message) {
    expect(toastFn).toHaveBeenCalledWith(
      expect.stringMatching(typeof message === 'string' ? message : message)
    )
  }
}
export function createMockMutation<TData = any, TError = Error, TVariables = any>(
  options: Partial<UseMutationResult<TData, TError, TVariables, unknown>> = {}
): UseMutationResult<TData, TError, TVariables, unknown> {
  return {
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    reset: jest.fn(),
    context: undefined,
    data: undefined,
    error: null,
    failureCount: 0,
    failureReason: null,
    isError: false,
    isIdle: true,
    isPending: false,
    isPaused: false,
    isSuccess: false,
    status: 'idle',
    submittedAt: undefined,
    variables: undefined,
    ...options,
  } as UseMutationResult<TData, TError, TVariables, unknown>
}
export function createMockError(
  message: string = 'Test error',
  type: 'Error' | 'AxiosError' = 'Error'
): Error | AxiosError {
  if (type === 'AxiosError') {
    const error = new Error(message) as AxiosError
    error.isAxiosError = true
    error.config = {} as any
    error.response = {
      status: 500,
      statusText: 'Internal Server Error',
      data: { message },
      headers: {},
      config: {} as any,
    }
    return error
  }
  return new Error(message)
}
export function resetErrorMocks() {
  mockToast.error.mockClear()
  mockToast.success.mockClear()
  mockToast.warning.mockClear()
  mockToast.info.mockClear()
}
export function expectNoError() {
  const errorElements = screen.queryAllByRole('alert')
  const errorTexts = screen.queryAllByText(/error/i)
  expect(errorElements.length).toBe(0)
  expect(errorTexts.length).toBe(0)
}
export async function expectFieldErrors(fieldErrors: Record<string, string>) {
  for (const [field, error] of Object.entries(fieldErrors)) {
    await waitFor(() => {
      const errorElement = screen.getByText(error)
      expect(errorElement).toBeInTheDocument()
    })
  }
}
export async function waitForMutation(
  mutation: UseMutationResult<any, any, any, any>,
  options: { timeout?: number } = {}
) {
  return waitFor(
    () => {
      if (mutation.isPending) {
        throw new Error('Mutation is still pending')
      }
      return mutation
    },
    { timeout: options.timeout || 3000 }
  )
}
