# API Service Layer

This directory contains API service files that replace the Next.js API route proxies. All services use the `api` instance from `./api.ts` which handles cookie-based authentication automatically.

## Pattern

All service files follow this pattern:

```typescript
import api from './api'

// Types
export interface Entity { ... }
export interface CreateEntityDto { ... }

// Service functions
export async function getEntities(params?: ListParams) {
  const { data } = await api.get<EntitiesResponse>('/entities', { params })
  return data
}

export async function createEntity(body: CreateEntityDto) {
  const { data } = await api.post<Entity>('/entities', body)
  return data
}
```

## Key Differences from Next.js API Routes

- ❌ **No token extraction** - Cookies handled automatically
- ❌ **No Authorization headers** - Cookies sent automatically
- ❌ **No NextAuth dependency** - Direct backend communication
- ✅ **Simpler code** - Just call the API endpoint
- ✅ **Automatic auth** - Cookies included via `withCredentials: true`

## Service Files

- `api.ts` - Main Axios instance with cookie support
- `authApi.ts` - Auth-specific API instance
- `projects.ts` - Project API functions
- `datasets.ts` - Dataset API functions
- `traces.ts` - Trace API functions
- `entities.ts` - Entity API functions
- `experiments.ts` - Experiment API functions
- `evaluations.ts` - Evaluation API functions
- `prompts.ts` - Prompt API functions
- `annotation-queues.ts` - Annotation queue API functions
- `scores.ts` - Score API functions
- `conversations.ts` - Conversation API functions
- `conversation-config.ts` - Conversation configuration API functions
- `model-configurations.ts` - Model configuration API functions
- `datasources.ts` - Datasource API functions
- `users.ts` - User API functions

## Migration Status

✅ **All API Routes Migrated:**
- `projects.ts` - All project endpoints (5 routes)
- `datasets.ts` - All dataset endpoints (6 routes)
- `traces.ts` - All trace endpoints (5 routes)
- `entities.ts` - All entity endpoints (2 routes)
- `experiments.ts` - All experiment endpoints (4 routes)
- `evaluations.ts` - All evaluation endpoints (6 routes)
- `prompts.ts` - All prompt endpoints (5 routes)
- `annotation-queues.ts` - All annotation queue endpoints (10 routes)
- `scores.ts` - All score endpoints (2 routes)
- `conversations.ts` - All conversation endpoints (4 routes)
- `conversation-config.ts` - All conversation config endpoints (2 routes)
- `model-configurations.ts` - All model configuration endpoints (2 routes)
- `datasources.ts` - All datasource endpoints (3 routes)
- `users.ts` - All user endpoints (1 route)

**Total: 60 API routes migrated** ✅

## Usage Example

```typescript
import { projectsApi } from '@/api/projects'
import { useOrganisationId } from '@/hooks/useOrganisation'

// Get projects (returns array directly, no pagination)
const organisationId = useOrganisationId()
const projects = await projectsApi.getAll(organisationId)

// Create project
const newProject = await projectsApi.create(organisationId, { name: 'My Project' })
```

