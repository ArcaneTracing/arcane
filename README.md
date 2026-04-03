# Arcane

![Arcane Hero](https://arcanetracing.com/img/landing_hero_illustration.png)

**OpenTelemetry-native observability for AI systems.**

[**Website**](https://arcanetracing.com) · [**Documentation**](https://arcanetracing.com/docs/intro) · [**Get started**](https://arcanetracing.com/docs/intro) · [**Contact**](mailto:contact@arcanetracing.com)

[![PyPI arcane-sdk](https://img.shields.io/pypi/v/arcane-sdk?label=pypi%20arcane-sdk)](https://pypi.org/project/arcane-sdk/) [![npm arcane-sdk](https://img.shields.io/npm/v/arcane-sdk?label=npm%20arcane-sdk)](https://www.npmjs.com/package/arcane-sdk) [![Docker Pulls](https://img.shields.io/docker/pulls/arcanetracing/arcane?label=docker%20pulls)](https://hub.docker.com/u/arcanetracing)

---

Arcane brings GenAI observability and evaluation on top of OpenTelemetry-compatible backends. Connect Tempo, Jaeger, ClickHouse, or a custom OTLP-compatible API and get LLM and agent tracing, datasets, annotations, scores, and auditability **without vendor lock-in**.

This repository is the **single home** for the Arcane application stack: backend API, web UI, worker, and SDKs.

**Docker Compose** for running the full stack locally or self-hosted lives in a separate repo: **[arcane-deployment](https://github.com/ArcaneTracing/arcane-deployment)**.

## Repository layout

| Path | Description |
|------|-------------|
| [`backend/`](./backend/) | NestJS API (TypeScript), PostgreSQL, integrations with trace backends and message brokers |
| [`frontend/`](./frontend/) | Web application (React, Vite, TanStack Router) |
| [`worker/`](./worker/) | Python worker (FastStream / FastAPI) for experiments and evaluations |
| [`sdks/`](./sdks/) | Official Python and TypeScript/JavaScript SDKs (`arcane-sdk` on PyPI and npm) |

Each directory has its own README with prerequisites, environment variables, and scripts.

## Quick start (developers)

1. Clone this repository.
2. Start infrastructure and services you need — see [`CONTRIBUTING.md`](./CONTRIBUTING.md) for a full local development workflow.
3. Typical flow: run PostgreSQL (and optionally RabbitMQ/Kafka) via [`backend/localsetup/`](./backend/localsetup/), or use **[arcane-deployment](https://github.com/ArcaneTracing/arcane-deployment)** for a full Docker Compose stack; apply backend migrations, then run `backend`, `frontend`, and `worker` as described in their READMEs.

For **product** onboarding (cloud signup, datasources, tracing), use the [documentation](https://arcanetracing.com/docs/intro).

## Contributing

We welcome issues and pull requests. Please read **[CONTRIBUTING.md](./CONTRIBUTING.md)** for workflow, project structure, and expectations before you open a large change.

## Support

- **Documentation** — [arcanetracing.com/docs](https://arcanetracing.com/docs/intro)
- **Contact** — [contact@arcanetracing.com](mailto:contact@arcanetracing.com)
- **GitHub** — [github.com/ArcaneTracing](https://github.com/ArcaneTracing)

## License

Licensing varies by package; see each component’s `LICENSE` file. SDKs under `sdks/` are MIT unless noted otherwise.
