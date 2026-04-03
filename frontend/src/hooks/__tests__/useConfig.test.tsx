import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useConfig } from '../useConfig'
import { getConfig } from '@/api/config'

jest.mock('@/api/config')

const mockGetConfig = getConfig as jest.MockedFunction<typeof getConfig>

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns config when fetch succeeds', async () => {
    const mockConfig = {
      features: { enterprise: true },
      oktaEnabled: true,
    }
    mockGetConfig.mockResolvedValue(mockConfig)

    const { result } = renderHook(() => useConfig(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.config).toEqual(mockConfig)
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(mockGetConfig).toHaveBeenCalled()
  })

  it('returns isLoading true initially', () => {
    mockGetConfig.mockImplementation(() => new Promise(() => {}))

    const { result } = renderHook(() => useConfig(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.config).toBeUndefined()
  })

  it('returns isError and error when fetch fails', async () => {
    const mockError = new Error('Failed to fetch config')
    mockGetConfig.mockRejectedValue(mockError)

    const { result } = renderHook(() => useConfig(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(mockError)
    expect(result.current.config).toBeUndefined()
  })

  it('exposes refetch function', async () => {
    const mockConfig = { features: { enterprise: false }, oktaEnabled: false }
    mockGetConfig.mockResolvedValue(mockConfig)

    const { result } = renderHook(() => useConfig(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.config).toEqual(mockConfig)
    })

    expect(typeof result.current.refetch).toBe('function')
  })
})
