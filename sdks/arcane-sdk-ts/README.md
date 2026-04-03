# arcane-sdk

Official TypeScript/JavaScript SDK for the Arcane public API. Developed in the **[Arcane monorepo](https://github.com/ArcaneTracing/arcane)** under `sdks/arcane-sdk-ts/` — see root [`CONTRIBUTING.md`](https://github.com/ArcaneTracing/arcane/blob/main/CONTRIBUTING.md) to contribute.

## Installation

```bash
npm install arcane-sdk
```

## Quick Start

```typescript
import { Arcane } from 'arcane-sdk';

const arcane = new Arcane({
  baseUrl: 'https://your-instance.example.com',
  apiKey: process.env.ARCAN_API_KEY!,
});

// List prompts
const prompts = await arcane.prompts.list();

// Get a dataset (paginated rows, default page 1)
const dataset = await arcane.datasets.get('dataset-uuid', { page: 1, limit: 20 });

// Iterate over all rows without loading everything
for await (const row of arcane.datasets.listRowsPaginated('dataset-uuid')) {
  console.log(row.values);
}

// Add a row
const newRow = await arcane.datasets.addRow('dataset-uuid', {
  values: ['input1', 'input2', 'expected'],
});

// Search traces
const searchResult = await arcane.traces.search('datasource-uuid', {
  limit: 100,
  q: 'status_code=200',
});

// Iterate over experiment results (paginated, memory-efficient)
for await (const result of arcane.experiments.listResultsPaginated('experiment-uuid')) {
  console.log(result.datasetRow, result.experimentResult);
}
```

## Authentication

Use a **project-scoped API key**. Create one in the Arcane UI under Project → API Keys.

The SDK uses HTTP Basic Auth with username `api-key` and the API key as the password.

## Resources

| Resource     | Methods                                                                 |
| ------------ | ----------------------------------------------------------------------- |
| `prompts`    | `list()`, `get(id)`, `listVersions(id)`, `getLatestVersion(id)`         |
| `datasources`| `list()`                                                                |
| `traces`     | `search(datasourceId, params)`, `get(datasourceId, traceId)`, `getAttributeNames()`, `getAttributeValues()` |
| `datasets`   | `list()`, `get(id, params?)`, `listRowsPaginated(id)`, `addRow(id, { values })` |
| `entities`   | `list()`, `get(id)`                                                             |
| `evaluations`| `list()`, `get(id)`, `getExperimentScores()`, `create()`, `createResult()` |
| `experiments`| `list()`, `get(id)`, `listResults()`, `listResultsPaginated()`, `create()`, `createResult()` |

## Retries

The SDK automatically retries on:

- HTTP 5xx errors
- Network errors (`ECONNRESET`, `ETIMEDOUT`)

Configure with `maxRetries` (default: 3):

```typescript
const arcane = new Arcane({
  baseUrl: 'https://api.example.com',
  apiKey: '...',
  maxRetries: 5,
});
```

## Error Handling

```typescript
import { Arcane, ArcanApiError, ArcanNotFoundError } from 'arcane-sdk';

try {
  await arcane.datasets.get('invalid-id');
} catch (err) {
  if (err instanceof ArcanNotFoundError) {
    console.log('Dataset not found');
  } else if (err instanceof ArcanApiError) {
    console.log(err.statusCode, err.message, err.requestId);
  }
}
```

## License

MIT
