# arcane-sdk

Official Python SDK for the Arcane public API. Developed in the **[Arcane monorepo](https://github.com/ArcaneTracing/arcane)** under `sdks/arcane-sdk-py/` — see root [`CONTRIBUTING.md`](https://github.com/ArcaneTracing/arcane/blob/main/CONTRIBUTING.md) to contribute.

## Installation

```bash
pip install arcane-sdk
```

## Quick Start

### Sync client

```python
from arcane_sdk import ArcaneClient

client = ArcaneClient(
    base_url="https://your-instance.example.com",
    api_key="your-api-key",
)

# List prompts
prompts = client.prompts.list()

# Get a dataset (paginated rows)
dataset = client.datasets.get("dataset-uuid", {"page": 1, "limit": 20})

# Iterate over all rows without loading everything
for row in client.datasets.list_rows_paginated("dataset-uuid"):
    print(row["values"])

# Add a row
new_row = client.datasets.add_row("dataset-uuid", ["input1", "input2", "expected"])

# Search traces
search_result = client.traces.search("datasource-uuid", {"limit": 100})

# Iterate over experiment results (paginated, memory-efficient)
for result in client.experiments.list_results_paginated("experiment-uuid"):
    print(result["dataset_row"], result["experiment_result"])
```

### Async client

```python
import asyncio
from arcane_sdk import ArcaneClientAsync

async def main():
    async with ArcaneClientAsync(
        base_url="https://your-instance.example.com",
        api_key="your-api-key",
    ) as client:
        prompts = await client.prompts.list()
        datasets = await client.datasets.list()

        async for result in client.experiments.list_results_paginated(
            "experiment-uuid"
        ):
            print(result)

asyncio.run(main())
```

## Authentication

Use a **project-scoped API key**. Create one in the Arcane UI under Project → API Keys.

The SDK uses HTTP Basic Auth with username `api-key` and the API key as the password.

## Resources

| Resource      | Methods                                                                 |
| ------------- | ----------------------------------------------------------------------- |
| `prompts`     | `list()`, `get(id)`, `list_versions(id)`, `get_latest_version(id)`       |
| `datasources` | `list()`                                                                |
| `traces`      | `search()`, `get()`, `get_attribute_names()`, `get_attribute_values()` |
| `datasets`    | `list()`, `get(id, params?)`, `list_rows_paginated(id)`, `add_row(id, values)` |
| `entities`    | `list()`, `get(id)`                                                             |
| `evaluations` | `list()`, `get(id)`, `get_experiment_scores()`, `create()`, `create_result()` |
| `experiments` | `list()`, `get(id)`, `list_results()`, `list_results_paginated()`, `create()`, `create_result()` |

## Async iterators

For paginated experiment results:

```python
# Sync
for result in client.experiments.list_results_paginated(experiment_id):
    ...

# Async
async for result in client.experiments.list_results_paginated(experiment_id):
    ...
```

For paginated dataset rows:

```python
# Sync
for row in client.datasets.list_rows_paginated(dataset_id):
    print(row["values"])

# Async
async for row in client.datasets.list_rows_paginated(dataset_id):
    print(row["values"])
```

## Error handling

```python
from arcane_sdk import ArcaneClient, ArcanApiError, ArcanNotFoundError

try:
    client.datasets.get("invalid-id")
except ArcanNotFoundError:
    print("Dataset not found")
except ArcanApiError as e:
    print(e.status_code, e.message, e.request_id)
```

## Retries

The SDK automatically retries on HTTP 5xx and network errors.
Configure with `max_retries` (default: 3):

```python
client = ArcaneClient(
    base_url="https://api.example.com",
    api_key="...",
    max_retries=5,
)
```

## License

MIT
