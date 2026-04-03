import api from '../api'
import { tracesApi } from '../traces'

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    post: jest.fn().mockResolvedValue({ data: { traces: [], total: 0 } }),
    get: jest.fn(),
  },
}))

describe('tracesApi.search', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('throws when required params missing', async () => {
    await expect(
      tracesApi.search('', 'p1', 'd1', { start: '2024-01-01', end: '2024-01-02' })
    ).rejects.toThrow('Organisation ID')
  })

  it('throws when start/end missing', async () => {
    await expect(
      tracesApi.search('o1', 'p1', 'd1', { start: '', end: '2024-01-02' })
    ).rejects.toThrow('Start and End')
  })

  it('builds minimal request body with start and end', async () => {
    await tracesApi.search('o1', 'p1', 'd1', {
      start: '2024-01-01T00:00:00Z',
      end: '2024-01-02T00:00:00Z',
    })
    expect(api.post).toHaveBeenCalledWith(
      expect.any(String),
      { start: '2024-01-01T00:00:00Z', end: '2024-01-02T00:00:00Z' },
      expect.any(Object)
    )
  })

  it('adds optional q when provided', async () => {
    await tracesApi.search('o1', 'p1', 'd1', {
      start: '2024-01-01',
      end: '2024-01-02',
      q: 'span.http.status_code=200',
    })
    const call = (api.post as jest.Mock).mock.calls[0]
    expect(call[1].q).toBe('span.http.status_code=200')
  })

  it('adds minDuration as number when string', async () => {
    await tracesApi.search('o1', 'p1', 'd1', {
      start: '2024-01-01',
      end: '2024-01-02',
      minDuration: '1000000',
    })
    const call = (api.post as jest.Mock).mock.calls[0]
    expect(call[1].minDuration).toBe(1000000)
  })

  it('adds limit with default 20 when empty', async () => {
    await tracesApi.search('o1', 'p1', 'd1', {
      start: '2024-01-01',
      end: '2024-01-02',
      limit: '',
    })
    const call = (api.post as jest.Mock).mock.calls[0]
    expect(call[1].limit).toBeUndefined()
  })
})
