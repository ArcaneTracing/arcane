# Contributing to Arcane

First off, thanks for taking the time to contribute.

The main ways to help:

- Open or comment on **Issues** in this repository on GitHub.
- Submit a **pull request** with a clear description and, when possible, tests.

We use a **monorepo**: backend, frontend, worker, and SDKs live in one tree. **Docker Compose** stacks for full-stack local/self-hosted runs are maintained in **[arcane-deployment](https://github.com/ArcaneTracing/arcane-deployment)**. You can work on one area without publishing separate packages, but cross-cutting changes (API + UI + worker) should stay in a single PR when they belong together.

> If you like the project but cannot contribute code, you can still help by starring the repo, sharing feedback via issues, and pointing others to [Arcane](https://arcanetracing.com).

## Making a change

Before **large or behavior-changing** work, open an issue (or comment on an existing one) so maintainers can align on design. Small fixes (typos, obvious bugs, docs) can go straight to a PR.

When you open a PR:

- Describe **what** changed and **why** (link issues with `Fixes #123` when applicable).
- Keep changes focused; unrelated refactors make review harder.
- Run **lint and tests** for the packages you touched (see below).
- Update **documentation** (README, comments) if behavior or setup changes.

## Project overview

### Technologies (by area)

| Area | Stack |
|------|--------|
| Backend | NestJS, TypeScript, TypeORM, PostgreSQL, Better Auth, RabbitMQ or Kafka, optional Redis |
| Frontend | React 19, TypeScript, Vite, TanStack Router & Query, Tailwind CSS, Radix UI, Better Auth |
| Worker | Python 3.12+, FastStream, FastAPI, optional RabbitMQ or Kafka |
| SDKs | Python package and npm package both named `arcane-sdk` |
| Deployment | Docker Compose in [arcane-deployment](https://github.com/ArcaneTracing/arcane-deployment) |

Architecture and product concepts are described in the [public documentation](https://arcanetracing.com/docs/intro).

### Monorepo structure

```
arcane/
├── backend/           # API service
├── frontend/          # Web UI
├── worker/            # Async jobs (experiments, evaluations)
└── sdks/
    ├── arcane-sdk-py/
    └── arcane-sdk-ts/
```

`backend/localsetup/` contains a smaller Docker Compose used for local Postgres (and optional tooling) while developing the API. For full-stack Compose (trace backends, brokers, images), clone **[arcane-deployment](https://github.com/ArcaneTracing/arcane-deployment)**.

## Development setup

Requirements depend on what you are working on:

- **Node.js** — Use **24+** for the backend; the frontend targets modern Node (18+; 20+ recommended). Match versions your team standardizes on.
- **Python 3.12+** and **[uv](https://github.com/astral-sh/uv)** for the worker (recommended) or pip.
- **Docker** — For databases and brokers via `backend/localsetup/`, or full-stack Compose from **[arcane-deployment](https://github.com/ArcaneTracing/arcane-deployment)**.

### Backend (`backend/`)

```bash
cd backend
npm install
cp .env-example .env   # edit values
cd localsetup && docker compose up -d postgres   # example: Postgres only
cd ..
npm run migration:run
npm run start:dev
```

Swagger: `http://localhost:8085/api-docs` (when configured). See [`backend/README.md`](./backend/README.md) for env vars, migrations, and tests.

### Frontend (`frontend/`)

```bash
cd frontend
npm install
# create .env with VITE_BACKEND_URL=http://localhost:8085 (see README)
npm run dev
```

See [`frontend/README.md`](./frontend/README.md) for proxy behavior, testing, and E2E.

### Worker (`worker/`)

Use the same message broker and API settings as the backend (`MESSAGE_BROKER`, queue names, `API_BASE_URL`, `INTERNAL_API_KEY`, etc.).

```bash
cd worker
cp .env-example .env
uv sync --dev
uv run python -m app.main
```

See [`worker/README.md`](./worker/README.md).

### SDKs (`sdks/`)

```bash
# Python
cd sdks/arcane-sdk-py
pip install -e ".[dev]"
pytest

# TypeScript
cd sdks/arcane-sdk-ts
npm install
npm test   # if defined
npm run build
```

See [`sdks/README.md`](./sdks/README.md) and per-SDK READMEs.

### Full stack with Docker Compose

Clone **[arcane-deployment](https://github.com/ArcaneTracing/arcane-deployment)** and follow its [README](https://github.com/ArcaneTracing/arcane-deployment/blob/main/README.md): copy `.env.example` to `.env`, load env vars into your shell, then run the compose file for your trace backend (Tempo, Jaeger, ClickHouse) and broker choice.

## Commit messages

We follow **[Conventional Commits](https://www.conventionalcommits.org/)** on the main line of history (e.g. `feat:`, `fix:`, `docs:`, `chore:`). Pull requests are often **squash-merged**, so the PR title and description should be clear; the merged commit should read well in the changelog.

## Tests and quality

- Run package-local **lint** and **unit tests** before requesting review.
- Backend: `npm run lint`, `npm run test`, and `npm run test:e2e` when your change affects integration behavior.
- Frontend: `npm run test`, and E2E when UI flows change.
- Worker: `uv run pytest` (or project-standard command in `worker/README.md`).

Fix CI failures on your branch when checks exist in the repository.

## Security

Do **not** commit secrets, production URLs, or API keys. Use `.env` files locally and CI secrets for automation. Report security issues according to the process your organization documents (e.g. private disclosure to maintainers).

## License and copyright

By contributing, you agree that your contributions are licensed under the same terms as the project files you modify. See each package’s `LICENSE` where applicable.
