import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// Mock API handlers
export const handlers = [
  // Projects
  http.get('/api/projects', () => {
    return HttpResponse.json([
      { id: '1', name: 'Test Project', description: 'Test Description' },
    ])
  }),

  // Experiments
  http.get('/api/projects/:projectId/experiments', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Test Experiment',
        description: 'Test Description',
        promptVersionId: 'prompt-1',
        datasetId: 'dataset-1',
      },
    ])
  }),

  http.post('/api/projects/:projectId/experiments', () => {
    return HttpResponse.json({
      id: '2',
      name: 'New Experiment',
      description: 'New Description',
    })
  }),

  // Prompts
  http.get('/api/projects/:projectId/prompts', () => {
    return HttpResponse.json([
      {
        id: '1',
        identifier: 'test-prompt',
        name: 'Test Prompt',
      },
    ])
  }),

  http.get('/api/projects/:projectId/prompts/:identifier/versions', () => {
    return HttpResponse.json([
      {
        id: 'version-1',
        modelConfigurationId: 'model-config-1',
        templateFormat: 'MUSTACHE',
        templateType: 'CHAT',
        template: {
          messages: [
            {
              role: 'user',
              content: 'Hello {{name}}, welcome to {{platform}}',
            },
          ],
        },
      },
    ])
  }),

  // Datasets
  http.get('/api/projects/:projectId/datasets/unpaginated', () => {
    return HttpResponse.json([
      {
        id: 'dataset-1',
        name: 'Test Dataset',
      },
    ])
  }),

  http.get('/api/projects/:projectId/datasets/:datasetId/header', () => {
    return HttpResponse.json(['name', 'email', 'message'])
  }),

  // Entities
  http.get('/api/entities/unpaginated', () => {
    return HttpResponse.json([
      {
        id: 'entity-1',
        name: 'Test Entity',
        entityType: 'MODEL',
      },
    ])
  }),

  // Evaluations
  http.get('/api/projects/:projectId/evaluations', () => {
    return HttpResponse.json([
      {
        id: 'eval-1',
        name: 'Test Evaluation',
        evaluationType: 'AUTOMATED',
      },
    ])
  }),

  // Admin - List all users
  http.get('/api/v1/admin/users', () => {
    return HttpResponse.json([
      {
        id: 'user-1',
        email: 'user1@example.com',
        name: 'User One',
      },
      {
        id: 'user-2',
        email: 'user2@example.com',
        name: 'User Two',
      },
      {
        id: 'user-3',
        email: 'admin@example.com',
        name: 'Admin User',
      },
    ])
  }),

  // Admin - Search users by email
  http.get('/api/v1/admin/users/search', ({ request }) => {
    const url = new URL(request.url)
    const email = url.searchParams.get('email') || ''
    return HttpResponse.json({
      users: [
        {
          id: 'user-1',
          email: 'user1@example.com',
          name: 'User One',
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          name: 'User Two',
        },
      ].filter((user) => user.email.toLowerCase().includes(email.toLowerCase())),
    })
  }),

  // Admin - Delete user
  http.delete('/api/v1/admin/users/:userId', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Audit Logs - Organisation audit logs (paginated)
  http.get('/api/v1/organisations/:organisationId/audit-logs', ({ request }) => {
    const url = new URL(request.url)
    const cursor = url.searchParams.get('cursor')
    const limit = parseInt(url.searchParams.get('limit') || '50', 10)
    
    const mockLogs = [
      {
        id: 'log-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        action: 'organisation.user.added',
        actorId: 'actor-1',
        actorType: 'user',
        resourceType: 'organisation_membership',
        resourceId: 'resource-1',
        organisationId: 'org-1',
        projectId: null,
        beforeState: null,
        afterState: {},
        metadata: {},
      },
      {
        id: 'log-2',
        createdAt: '2024-01-02T00:00:00.000Z',
        action: 'organisation.role.created',
        actorId: 'actor-2',
        actorType: 'user',
        resourceType: 'role',
        resourceId: 'resource-2',
        organisationId: 'org-1',
        projectId: null,
        beforeState: null,
        afterState: {},
        metadata: {},
      },
    ]
    
    // Return paginated response
    return HttpResponse.json({
      data: cursor ? [] : mockLogs.slice(0, limit),
      nextCursor: cursor ? null : '2024-01-02T00:00:00.000Z',
      hasMore: !cursor && mockLogs.length > limit,
      limit,
    })
  }),

  // Audit Logs - Admin organisation audit logs (paginated)
  http.get('/api/v1/admin/organisations/audit-logs', ({ request }) => {
    const url = new URL(request.url)
    const cursor = url.searchParams.get('cursor')
    const limit = parseInt(url.searchParams.get('limit') || '50', 10)
    
    const mockLogs = [
      {
        id: 'log-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        action: 'organisation.created',
        actorId: 'actor-1',
        actorType: 'user',
        resourceType: 'organisation',
        resourceId: 'org-1',
        organisationId: 'org-1',
        projectId: null,
        beforeState: null,
        afterState: {},
        metadata: {},
      },
    ]
    
    return HttpResponse.json({
      data: cursor ? [] : mockLogs.slice(0, limit),
      nextCursor: cursor ? null : '2024-01-01T00:00:00.000Z',
      hasMore: !cursor && mockLogs.length > limit,
      limit,
    })
  }),

  // Audit Logs - Instance owner audit logs (paginated)
  http.get('/api/v1/users/audit-logs', ({ request }) => {
    const url = new URL(request.url)
    const cursor = url.searchParams.get('cursor')
    const limit = parseInt(url.searchParams.get('limit') || '50', 10)
    
    const mockLogs = [
      {
        id: 'log-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        action: 'instance_owner.assigned',
        actorId: 'actor-1',
        actorType: 'user',
        resourceType: 'user',
        resourceId: 'user-1',
        organisationId: null,
        projectId: null,
        beforeState: null,
        afterState: {},
        metadata: {},
      },
    ]
    
    return HttpResponse.json({
      data: cursor ? [] : mockLogs.slice(0, limit),
      nextCursor: cursor ? null : '2024-01-01T00:00:00.000Z',
      hasMore: !cursor && mockLogs.length > limit,
      limit,
    })
  }),
]

export const server = setupServer(...handlers)

