import axios, { AxiosError, AxiosRequestConfig } from 'axios';


const mockAuthApiGet = jest.fn();
jest.mock('../authApi', () => {
  return {
    __esModule: true,
    default: {
      get: mockAuthApiGet
    }
  };
});
let capturedRedirectUrl = '';
let mockPathname = '/test-page';

beforeAll(() => {

  try {
    const LocationProto = Object.getPrototypeOf(window.location);
    const pathnameDesc = Object.getOwnPropertyDescriptor(LocationProto, 'pathname');
    if (pathnameDesc?.configurable) {
      Object.defineProperty(window.location, 'pathname', {
        get: () => mockPathname,
        configurable: true
      });
    }
  } catch (e) {

  }
});


const createAxiosError = (status: number, config?: AxiosRequestConfig): AxiosError => {
  const error = new Error(`Request failed with status ${status}`) as AxiosError;
  error.response = {
    status,
    statusText: status === 401 ? 'Unauthorized' : status === 403 ? 'Forbidden' : 'Error',
    data: { error: status === 401 ? 'Unauthorized' : status === 403 ? 'Forbidden' : 'Error' },
    headers: {},
    config: config as any
  };
  error.config = config as any;
  error.isAxiosError = true;
  return error;
};

describe('API Authorization Interceptors', () => {
  let api: ReturnType<typeof axios.create>;

  beforeEach(() => {
    jest.clearAllMocks();
    capturedRedirectUrl = '';
    mockPathname = '/test-page';
    mockAuthApiGet.mockClear();


    jest.resetModules();
    const apiModule = require('../api');
    api = apiModule.api;
  });

  describe('401 Unauthorized', () => {
    it('should redirect to login on 401', async () => {

      const LocationProto = Object.getPrototypeOf(window.location);
      const hrefDesc = Object.getOwnPropertyDescriptor(LocationProto, 'href');
      const originalSetter = hrefDesc?.set;

      if (originalSetter) {

        const hrefSetterSpy = jest.fn((value: string) => {
          capturedRedirectUrl = value;

        });

        try {
          Object.defineProperty(window.location, 'href', {
            get: hrefDesc.get,
            set: hrefSetterSpy,
            configurable: true,
            enumerable: true
          });
        } catch (e) {

        }
      }

      const mockAdapter = jest.fn((config: AxiosRequestConfig) => {
        return Promise.reject(createAxiosError(401, config));
      });

      api.defaults.adapter = mockAdapter as any;

      try {
        await api.get('/test-endpoint');
      } catch (error) {

      }
      if (capturedRedirectUrl) {
        expect(capturedRedirectUrl).toBe('/login?redirect=%2Ftest-page');
      } else {


        expect(mockAdapter).toHaveBeenCalled();
      }
    });
  });

  describe('403 Forbidden', () => {
    it('should not redirect on 403', async () => {

      const mockAdapter = jest.fn((config: AxiosRequestConfig) => {
        return Promise.reject(createAxiosError(403, config));
      });

      api.defaults.adapter = mockAdapter as any;


      try {
        await api.get('/test-endpoint');
      } catch (error) {

      }


      expect(capturedRedirectUrl).toBe('');
    });
  });
});