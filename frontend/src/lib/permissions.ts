
export const PERMISSIONS = {
  INSTANCE: {
    ALL: '*'
  },
  ORGANISATION: {
    READ: 'organisations:read',
    UPDATE: 'organisations:update',
    DELETE: 'organisations:delete',
    MEMBERS_READ: 'organisations:members:read',
    MEMBERS_CREATE: 'organisations:members:create',
    MEMBERS_UPDATE: 'organisations:members:update',
    MEMBERS_DELETE: 'organisations:members:delete',
    ROLES_READ: 'organisations:roles:read',
    ROLES_CREATE: 'organisations:roles:create',
    ROLES_UPDATE: 'organisations:roles:update',
    ROLES_DELETE: 'organisations:roles:delete',
    CONFIGURATIONS_READ: 'organisations:configurations:read'
  },
  PROJECT: {
    CREATE: 'projects:create',
    READ: 'projects:read',
    UPDATE: 'projects:update',
    DELETE: 'projects:delete',
    MEMBERS_READ: 'projects:members:read',
    MEMBERS_CREATE: 'projects:members:create',
    MEMBERS_DELETE: 'projects:members:delete',
    ROLES_READ: 'projects:roles:read',
    ROLES_CREATE: 'projects:roles:create',
    ROLES_UPDATE: 'projects:roles:update',
    ROLES_DELETE: 'projects:roles:delete',
    ROLES_ASSIGN: 'projects:roles:assign',
    ROLES_REMOVE: 'projects:roles:remove',
    ATTRIBUTE_VISIBILITY_READ: 'projects:attribute-visibility:read',
    ATTRIBUTE_VISIBILITY_MANAGE: 'projects:attribute-visibility:manage',
    API_KEYS_READ: 'projects:api-keys:read',
    API_KEYS_MANAGE: 'projects:api-keys:manage'
  },
  DATASOURCE: {
    READ: 'datasources:read',
    CREATE: 'datasources:create',
    UPDATE: 'datasources:update',
    DELETE: 'datasources:delete'
  },
  DATASET: {
    READ: 'datasets:read',
    CREATE: 'datasets:create',
    UPDATE: 'datasets:update',
    DELETE: 'datasets:delete',
    IMPORT: 'datasets:import',
    EXPORT: 'datasets:export',
    ROWS_CREATE: 'datasets:rows:create'
  },
  TRACE: {
    READ: 'traces:read'
  },
  CONVERSATION: {
    READ: 'conversations:read'
  },
  PROMPT: {
    READ: 'prompts:read',
    CREATE: 'prompts:create',
    UPDATE: 'prompts:update',
    DELETE: 'prompts:delete'
  },
  EXPERIMENT: {
    READ: 'experiments:read',
    CREATE: 'experiments:create',
    UPDATE: 'experiments:update',
    DELETE: 'experiments:delete',
    RERUN: 'experiments:rerun'
  },
  EVALUATION: {
    READ: 'evaluations:read',
    CREATE: 'evaluations:create',
    UPDATE: 'evaluations:update',
    DELETE: 'evaluations:delete',
    RERUN: 'evaluations:rerun',
    RESULTS_READ: 'evaluations:results:read'
  },
  SCORE: {
    READ: 'scores:read',
    CREATE: 'scores:create',
    UPDATE: 'scores:update',
    DELETE: 'scores:delete'
  },
  ANNOTATION_QUEUE: {
    READ: 'annotation-queues:read',
    CREATE: 'annotation-queues:create',
    UPDATE: 'annotation-queues:update',
    DELETE: 'annotation-queues:delete',
    TRACES_CREATE: 'annotation-queues:traces:create',
    TRACES_DELETE: 'annotation-queues:traces:delete',
    CONVERSATIONS_CREATE: 'annotation-queues:conversations:create',
    CONVERSATIONS_DELETE: 'annotation-queues:conversations:delete'
  },
  ANNOTATION: {
    READ: 'annotations:read',
    CREATE: 'annotations:create',
    UPDATE: 'annotations:update',
    DELETE: 'annotations:delete'
  },
  MODEL_CONFIGURATION: {
    READ: 'model-configurations:read',
    CREATE: 'model-configurations:create',
    UPDATE: 'model-configurations:update',
    DELETE: 'model-configurations:delete'
  },
  CONVERSATION_CONFIG: {
    READ: 'conversation-configurations:read',
    CREATE: 'conversation-configurations:create',
    UPDATE: 'conversation-configurations:update',
    DELETE: 'conversation-configurations:delete'
  },
  ENTITY: {
    READ: 'entities:read',
    CREATE: 'entities:create',
    UPDATE: 'entities:update',
    DELETE: 'entities:delete'
  }
} as const;
export const TRACE_PERMISSIONS = {
  READ: 'trace-permissions:read'
} as const;
export interface Permissions {
  instance: string[];
  organisation: string[];
  project: string[];
  all: string[];
  features?: {
    enterprise: boolean;
  };
}
export function hasPermission(
permissions: Permissions | null | undefined,
requiredPermission: string)
: boolean {
  if (!permissions) {
    return false;
  }


  if (permissions.all.includes('*')) {
    return true;
  }


  return permissions.all.includes(requiredPermission);
}
export function hasAnyPermission(
permissions: Permissions | null | undefined,
requiredPermissions: string[])
: boolean {
  if (!permissions) {
    return false;
  }


  if (permissions.all.includes('*')) {
    return true;
  }


  return requiredPermissions.some((permission) =>
  permissions.all.includes(permission)
  );
}
export function hasAllPermissions(
permissions: Permissions | null | undefined,
requiredPermissions: string[])
: boolean {
  if (!permissions) {
    return false;
  }


  if (permissions.all.includes('*')) {
    return true;
  }


  return requiredPermissions.every((permission) =>
  permissions.all.includes(permission)
  );
}


export function isSuperAdmin(permissions: Permissions | null | undefined): boolean {
  if (!permissions) {
    return false;
  }
  return permissions.instance.includes('*');
}