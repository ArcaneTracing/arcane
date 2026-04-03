
import { DatasourceType, DatasourceSource } from './enums';

export interface DatasourceResponse {
  id: string;
  name: string;
  description: string;
  url: string;
  type: DatasourceType;
  source: DatasourceSource;
  config?: Record<string, any> | null;
}

export interface DatasourceListItemResponse {
  id: string;
  name: string;
  description: string | null;
  type: DatasourceType;
  source: DatasourceSource;
  isSearchByQueryEnabled: boolean;
  isSearchByAttributesEnabled: boolean;
  isGetAttributeNamesEnabled: boolean;
  isGetAttributeValuesEnabled: boolean;
}

export interface CreateDatasourceRequest {
  name: string;
  description?: string;
  url?: string;
  type: DatasourceType;
  source: DatasourceSource;
  config?: Record<string, any>;
}

export interface UpdateDatasourceRequest {
  name?: string;
  description?: string;
  url?: string;
  type?: DatasourceType;
  source?: DatasourceSource;
  config?: Record<string, any>;
}

export interface DatasourceMessageResponse {
  message: string;
}
export interface TempoJaegerAuthConfig {
  authentication?: {
    type: 'basic' | 'bearer';
    username?: string;
    password?: string;
    token?: string;
  };
}

export interface CustomApiConfig {
  baseUrl: string;
  endpoints: {
    search: {path: string;};
    searchByTraceId: {path: string;};
    attributeNames?: {path: string;};
    attributeValues?: {path: string;};
  };
  capabilities?: {
    searchByQuery?: boolean;
    searchByAttributes?: boolean;
    filterByAttributeExists?: boolean;
    getAttributeNames?: boolean;
    getAttributeValues?: boolean;
  };
  authentication?: {
    type: 'header' | 'bearer' | 'basic';
    headerName?: string;
    value?: string;
    username?: string;
    password?: string;
  };
  headers?: Record<string, string>;
}