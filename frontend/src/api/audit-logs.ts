import api from './api';

export interface AuditLog {
  id: string;
  createdAt: string;
  action: string;
  actorId: string;
  actorType: string;
  resourceType: string;
  resourceId: string;
  organisationId: string | null;
  projectId: string | null;
  beforeState: object | null;
  afterState: object | null;
  metadata: Record<string, unknown>;
}

export interface PaginatedAuditLogsResponse {
  data: AuditLog[];
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

export interface GetOrganisationAuditLogsParams {
  organisationId?: string;
  action?: string;
  cursor?: string;
  limit?: number;
}

export interface GetInstanceOwnerAuditLogsParams {
  action?: string;
  cursor?: string;
  limit?: number;
}

export interface GetProjectAuditLogsParams {
  organisationId: string;
  projectId: string;
  action?: string;
  cursor?: string;
  limit?: number;
}

export async function getOrganisationAuditLogs(
params?: GetOrganisationAuditLogsParams,
signal?: AbortSignal)
: Promise<PaginatedAuditLogsResponse> {
  const queryParams: Record<string, string> = {};

  if (params?.organisationId) {
    queryParams.organisationId = params.organisationId;
  }
  if (params?.action) {
    queryParams.action = params.action;
  } else {

    queryParams.action = 'organisation.*';
  }
  if (params?.cursor) {
    queryParams.cursor = params.cursor;
  }
  if (params?.limit) {
    queryParams.limit = String(params.limit);
  } else {
    queryParams.limit = '50';
  }

  const { data } = await api.get<PaginatedAuditLogsResponse>('/v1/admin/organisations/audit-logs', {
    params: queryParams,
    signal
  });

  return data;
}

export async function getInstanceOwnerAuditLogs(
params?: GetInstanceOwnerAuditLogsParams,
signal?: AbortSignal)
: Promise<PaginatedAuditLogsResponse> {
  const queryParams: Record<string, string> = {};

  if (params?.action) {
    queryParams.action = params.action;
  } else {

    queryParams.action = 'instance_owner.*';
  }
  if (params?.cursor) {
    queryParams.cursor = params.cursor;
  }
  if (params?.limit) {
    queryParams.limit = String(params.limit);
  } else {
    queryParams.limit = '50';
  }

  const { data } = await api.get<PaginatedAuditLogsResponse>('/v1/users/audit-logs', {
    params: queryParams,
    signal
  });

  return data;
}

export async function getProjectAuditLogs(
params: GetProjectAuditLogsParams,
signal?: AbortSignal)
: Promise<PaginatedAuditLogsResponse> {
  const { organisationId, projectId, ...queryParams } = params;
  const query: Record<string, string> = {};

  if (queryParams.action) {
    query.action = queryParams.action;
  }
  if (queryParams.cursor) {
    query.cursor = queryParams.cursor;
  }
  if (queryParams.limit) {
    query.limit = String(queryParams.limit);
  } else {
    query.limit = '50';
  }

  const { data } = await api.get<PaginatedAuditLogsResponse>(
    `/v1/organisations/${organisationId}/projects/${projectId}/audit-logs`,
    { params: query, signal }
  );

  return data;
}