import axios, { type AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { ArcanApiError } from './errors';

export interface ArcaneClientConfig {
  baseUrl: string;
  apiKey: string;
  maxRetries?: number;
  timeout?: number;
}

export class ArcaneClient {
  private readonly http: AxiosInstance;

  constructor(config: ArcaneClientConfig) {
    const { baseUrl, apiKey, maxRetries = 3, timeout = 30_000 } = config;
    const base = baseUrl.replace(/\/$/, '');
    this.http = axios.create({
      baseURL: base,
      timeout,
      auth: {
        username: 'api-key',
        password: apiKey,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    axiosRetry(this.http, {
      retries: maxRetries,
      retryCondition: (err) => {
        const status = err.response?.status;
        if (status && status >= 500 && status < 600) return true;
        if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') return true;
        return false;
      },
      retryDelay: axiosRetry.exponentialDelay,
    });
  }

  getHttp(): AxiosInstance {
    return this.http;
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const res = await this.http.get<T>(path, { params });
    return res.data;
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await this.http.post<T>(path, body);
    return res.data;
  }

  handleError(err: unknown): never {
    if (axios.isAxiosError(err)) {
      throw ArcanApiError.fromAxiosError(err);
    }
    throw err;
  }
}
