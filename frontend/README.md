# Arcane

![Arcane Hero](https://arcanetracing.com/img/landing_hero_illustration.png)

**OpenTelemetry-Native Observability for AI Systems.**

[**arcanetracing.com**](https://arcanetracing.com) · [**Documentation**](https://arcanetracing.com/docs/intro) · [**Get Started Free**](https://arcanetracing.com/docs/intro) · [**Contact**](mailto:contact@arcanetracing.com)

[![PyPI arcane-sdk](https://img.shields.io/pypi/v/arcane-sdk?label=pypi%20arcane-sdk)](https://pypi.org/project/arcane-sdk/) [![npm arcane-sdk](https://img.shields.io/npm/v/arcane-sdk?label=npm%20arcane-sdk)](https://www.npmjs.com/package/arcane-sdk) [![Docker Pulls](https://img.shields.io/docker/pulls/arcanetracing/arcane?label=docker%20pulls)](https://hub.docker.com/u/arcanetracing)

This package is part of the **[Arcane monorepo](https://github.com/ArcaneTracing/arcane)**. For layout and contributing, see the root [`README.md`](https://github.com/ArcaneTracing/arcane/blob/main/README.md) and [`CONTRIBUTING.md`](https://github.com/ArcaneTracing/arcane/blob/main/CONTRIBUTING.md).

## Features

- **Traces** — View and analyze distributed traces from your AI/LLM systems (OpenTelemetry-compatible)
- **Entities** — Define reusable rules to categorize spans (models, tools, agents, embeddings, etc.) with automatic matching
- **Datasets** — Manage datasets for evaluation and experimentation
- **Experiments** — Run and compare AI experiments
- **Evaluations** — Evaluate model outputs and trace quality
- **Prompts** — Version and manage prompts across your projects
- **Scores** — Define and track custom score types
- **Annotation Queues** — Human-in-the-loop annotation workflows
- **Conversations** — Inspect multi-turn conversation traces
- **Configurations** — Configure datasources, entities, and organisation settings
- **Project Management** — Users, roles, and access control

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** — Build tool and dev server
- **TanStack Router** — Type-safe routing
- **TanStack Query** — Server state management
- **Tailwind CSS 4** — Styling
- **Radix UI** — Accessible component primitives
- **Better Auth** — Authentication (SSO supported)
- **Zustand** — Client state
- **Zod** — Schema validation

## Prerequisites

- **Node.js** 18+ (recommended: 20+)
- A running **backend API** (default: `http://localhost:8085`)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
# Backend API URL (required for production; dev uses proxy)
VITE_BACKEND_URL=http://localhost:8085

# Optional: base URL for the app (e.g. when served under a subpath)
# VITE_BASE_URL=/
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. First-time setup

On first run, the app will guide you through setup (create organisation, project, etc.).

## Project Structure

```
src/
├── api/           # API client and auth
├── components/    # Shared components
├── lib/           # Utilities, entity templates, navigation
├── pages/         # Route-level pages
├── constants/     # Tooltips, config, etc.
└── router.tsx     # TanStack Router setup
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run unit tests (Jest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run test:e2e:ui` | Run E2E tests with Playwright UI |
| `npm run test:all` | Run unit + E2E tests |
| `npm run sonar` | Run tests + SonarQube scanner |

## Development

### Dev server proxy

In development, requests to `/api` are proxied to the backend (default `http://0.0.0.0:8085`), so:

- Auth routes (`/api/auth/*`) go to the backend as-is  
- Other routes (`/api/v1/*`) are rewritten to `/v1/*` on the backend  

This avoids CORS and cookie issues during local development.

### Backend requirement

The frontend expects a backend that provides:

- Auth (Better Auth at `/api/auth`)
- REST API under `/v1` (or equivalent)
- OpenTelemetry-compatible trace ingestion

## Testing

- **Unit tests**: Jest + React Testing Library
- **E2E tests**: Playwright (starts dev server automatically)
- **Coverage**: `npm run test:coverage` → `coverage/`

## Building for production

```bash
npm run build
```

Output is in `dist/`. Serve with any static host (Nginx, Vercel, etc.). Ensure `VITE_BACKEND_URL` points to your backend API.

## License

See [LICENSE](LICENSE).  
Copyright © 2023–2025 ArcaneTracing. Some components are under the EE license as noted in LICENSE.

---

## 💭 Support

- **Documentation** — [arcanetracing.com/docs](https://arcanetracing.com/docs/intro)
- **Contact** — [contact@arcanetracing.com](mailto:contact@arcanetracing.com)
- **GitHub** — [github.com/ArcaneTracing](https://github.com/ArcaneTracing)

## Built on Open Standards. Ready for Production.

Get started for free or schedule a demo to see how Arcane can transform your GenAI observability.

[**Start Free Now**](https://arcanetracing.com/docs/intro) · [**Star on GitHub**](https://github.com/ArcaneTracing)
