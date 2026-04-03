# Arcane

![Arcane Hero](https://arcanetracing.com/img/landing_hero_illustration.png)

**OpenTelemetry-Native Observability for AI Systems.**

[**arcanetracing.com**](https://arcanetracing.com) · [**Documentation**](https://arcanetracing.com/docs/intro) · [**Get Started Free**](https://arcanetracing.com/docs/intro) · [**Contact**](mailto:contact@arcanetracing.com)

[![PyPI arcane-sdk](https://img.shields.io/pypi/v/arcane-sdk?label=pypi%20arcane-sdk)](https://pypi.org/project/arcane-sdk/) [![npm arcane-sdk](https://img.shields.io/npm/v/arcane-sdk?label=npm%20arcane-sdk)](https://www.npmjs.com/package/arcane-sdk) [![Docker Pulls](https://img.shields.io/docker/pulls/arcanetracing/arcane?label=docker%20pulls)](https://hub.docker.com/u/arcanetracing)

---

This directory is part of the **[Arcane monorepo](https://github.com/ArcaneTracing/arcane)**. For layout and contributing, see the root [`README.md`](https://github.com/ArcaneTracing/arcane/blob/main/README.md) and [`CONTRIBUTING.md`](https://github.com/ArcaneTracing/arcane/blob/main/CONTRIBUTING.md).

## Arcane SDKs

Official SDKs for the [Arcane](https://arcanetracing.com) public API. Both Python and TypeScript/JavaScript implementations live here.

## SDKs

| SDK | Package | Description |
|-----|---------|-------------|
| [Python](./arcane-sdk-py/) | `arcane-sdk` | Sync and async clients for Python 3.10+ |
| [TypeScript](./arcane-sdk-ts/) | `arcane-sdk` | ESM and CJS compatible SDK for Node.js 18+ |

## Installation

### Python

```bash
pip install arcane-sdk
```

### TypeScript / JavaScript

```bash
npm install arcane-sdk
```

## Quick Start

### Python

```python
from arcane_sdk import ArcaneClient

client = ArcaneClient(
    base_url="https://your-instance.example.com",
    api_key="your-api-key",
)
prompts = client.prompts.list()
```

### TypeScript

```typescript
import { Arcane } from 'arcane-sdk';

const arcane = new Arcane({
  baseUrl: 'https://your-instance.example.com',
  apiKey: process.env.ARCAN_API_KEY!,
});
const prompts = await arcane.prompts.list();
```

## Authentication

Use a **project-scoped API key**. Create one in the Arcane UI under Project → API Keys.

The SDKs use HTTP Basic Auth with username `api-key` and the API key as the password.

## Resources

Both SDKs support the same API resources:

- **prompts** — List, get, versions
- **datasources** — List datasources
- **traces** — Search and query traces
- **datasets** — List, get, paginate rows, add rows
- **entities** — List, get
- **evaluations** — List, get, scores, create
- **experiments** — List, get, results, create

See each SDK's README for detailed usage and method signatures.

## Development

From the monorepo root:

```bash
# Python SDK
cd sdks/arcane-sdk-py
pip install -e ".[dev]"
pytest

# TypeScript SDK
cd sdks/arcane-sdk-ts
npm install
npm run build
```

## 💭 Support

- **Documentation** — [arcanetracing.com/docs](https://arcanetracing.com/docs/intro)
- **Contact** — [contact@arcanetracing.com](mailto:contact@arcanetracing.com)
- **GitHub** — [github.com/ArcaneTracing](https://github.com/ArcaneTracing)

## Built on Open Standards. Ready for Production.

Get started for free or schedule a demo to see how Arcane can transform your GenAI observability.

[**Start Free Now**](https://arcanetracing.com/docs/intro) · [**Star on GitHub**](https://github.com/ArcaneTracing)

## License

MIT
