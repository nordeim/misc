You are Claude Code operating in claude.ai/code. Analyze the repository at:
https://github.com/nordeim/Chronos.git

Use static inspection only (file tree, quick open, search). If the repo isn’t loaded, request access/import; proceed once files are visible. Produce a single, production-quality markdown file modeled after the provided structure and tone below, fully adapted to this codebase.

Strict output requirements
- Output exactly one markdown file named: CLAUDE.md
- Top header must be "# CLAUDE.md"
- The first paragraph must be: "This file provides guidance to Claude Code when working with code in this repository."
- Style: concise, professional, scannable headings, bullets, and code fences.
- No speculation. Include only sections substantiated by files; omit irrelevant sections entirely.
- Every non-obvious claim must cite at least one file path in backticks.
- Any code snippet must be real and minimal, copied from the repo, beginning with a file path comment, e.g. // path: src/foo/bar.ts
- Never include secret values. List variable names only; redact values.
- Do not execute commands. Perform static analysis only.
- Return only the final markdown file content—no preamble or extra commentary.

Repository analysis checklist
- Detect languages, package managers, and workspace layout (e.g., `package.json`, `pnpm-workspace.yaml`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `Dockerfile`, `Makefile`, lockfiles).
- Extract dev/build/lint/test commands and group them into: Essential Commands, Database Operations, Deployment (cite `package.json`, `Makefile`, task runners).
- Identify the stack: frameworks, DB/ORM, auth, real-time, storage, UI libs, state, validation, testing (each item must cite a path, e.g., `next.config.js`, `schema.prisma`, `auth.ts`, `playwright.config.ts`).
- Summarize app structure and routing: major directories and their purposes; for web, key routes/pages; for APIs, routers/controllers; for monorepos, concise per-package summary.
- Database schema overview if present: models/entities, relations, notable flags (soft delete, approval flags), citing `schema.prisma`, migrations, SQL, or ORM entities.
- Flows and patterns: auth flow, middleware/guards, RBAC/ABAC, and key patterns (e.g., server actions, repository/service layers, DI, CQRS, error boundaries, form handling). Include 1–2 tiny real code snippets with path headers.
- Visual development & testing ONLY if UI exists: design system references, quick visual check steps, comprehensive design review (if agents/scripts exist), Playwright/Cypress integration (including any MCP wrappers), and a design compliance checklist.
- When to use automated visual testing ONLY if UI exists: three tailored lists (Use Quick Visual Check / Use Comprehensive Design Review / Skip).
- Environment setup: consolidate required env variable NAMES (no values) from `.env.example`, `.env.*`, configs, deployment manifests, CI secrets.
- Additional context: internal docs (design principles, agents, ADRs, contributing, conventions). For monorepos, include package-level READMEs/docs.
- Monorepo: summarize shared root tooling once (eslint/prettier/tsconfig, CI), then concise per-package highlights.

Final document layout (use this order; include only applicable sections)

# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Development Commands

### Essential Commands
- List dev/build/lint/test commands with brief descriptions.
- Derive from scripts/targets (cite file paths like `package.json`, `Makefile`, `pyproject.toml`).

### Database Operations
- Include only if a DB/migrations tool exists.
- Summarize generate/migrate/seed/inspect commands (cite paths like `schema.prisma`, `migrations/`).

### Deployment
- Summarize build/deploy commands, CI/CD jobs, or host-specific steps (e.g., Vercel, Netlify, Render, Heroku, Fly.io, Docker).
- Cite configs such as `vercel.json`, `netlify.toml`, Dockerfiles, GitHub Actions.

## Architecture Overview

### Core Technology Stack
- Framework(s), language(s), package manager(s), ORM, auth, real-time, storage, UI components, state, validation, testing.
- Back each item with at least one file path reference.

### Database Schema
- Key models/entities and notable relations/flags.
- Cite schema and/or migration files used.

### Authentication Flow
- Session/JWT strategy, verification steps, onboarding, role-based routing/guards, middleware.
- Cite relevant files (middleware, auth config, providers, guards).

### App Structure
- Bullet major directories with purpose (e.g., `src/app/`, `src/routes/`, `packages/<name>/`, `services/`, `cmd/`).
- Note key pages/routes or controllers where applicable.

### State Management
- List stores or patterns (e.g., Redux slices, Zustand stores) with brief purpose and file paths.

### Real-time Features
- Channels/topics, presence, delivery semantics. Cite adapter and config files.

### File Upload/System
- Storage provider, signing, transformations, moderation/approval workflows. Cite API routes/services.

### Testing
- Unit/integration/e2e frameworks and test locations. Cite configs (e.g., `jest.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `pytest.ini`).

## Key Patterns

### [Pattern 1: name]
- Describe what/why/where (include file paths).
```typescript
// path: <relative/path/to/file.ts>
<exact small snippet copied from the repo>
```

### [Pattern 2: name]
- Describe what/why/where (include file paths).
```typescript
// path: <relative/path/to/file.ts>
<exact small snippet copied from the repo>
```

### Error Handling
- Explain cross-cutting error handling (e.g., ErrorBoundary or server middleware), grounded in code.
```typescript
// path: <relative/path/to/file.(ts|tsx|js)>
<exact small snippet if applicable>
```
- Bullet key features (fallback UI, callbacks, logging hooks, dev-mode details) with path citations.

## Visual Development & Testing
(Include only if a UI is present.)

### Design System
- Link to design principles, tokens, theming, component library usage. Cite file paths (e.g., `context/design-principles.md`, theme files).

### Quick Visual Check
- Provide a 6–8 step checklist tailored to this repo’s tooling. Include any custom helpers if present; otherwise use project’s e2e tool or a manual check.

### Comprehensive Design Review
- If a design review agent/script exists, show how to invoke it (cite files/scripts); otherwise provide tool-agnostic steps.

### Playwright/Cypress Integration
- If present, show essential commands/helpers (including any MCP wrappers) with a short snippet or commands.
```javascript
// path: <relative/path/to/test/or/helper.(js|ts)>
<exact small snippet or representative commands>
```

### Design Compliance Checklist
- [ ] Visual hierarchy
- [ ] Consistency (tokens/patterns)
- [ ] Responsiveness (repo breakpoints)
- [ ] Accessibility (keyboard, contrast, semantics)
- [ ] Performance (targets/animation timing)
- [ ] Error/empty/loading states
- [ ] Polish (micro-interactions)

## When to Use Automated Visual Testing
(Include only if a UI is present; otherwise omit.)

### Use Quick Visual Check for:
- Tailor bullets to typical changes in this repo.

### Use Comprehensive Design Review for:
- Tailor bullets to major feature/architecture changes.

### Skip Visual Testing for:
- List non-visual categories for this repo.

## Environment Setup
- List required environment variable NAMES (no values), grouped by concern (DB, auth, storage, email, third-party APIs).
- Cite sources: `.env.example`, `.env.*`, config files, deployment manifests, CI secrets.

## Additional Context
- Link to internal docs within the repo (design agents, design principles, ADRs, conventions, contributing, slash commands, scripts).
- For monorepos, include package-level READMEs and docs.

Monorepo guidance
- If this is a monorepo, summarize shared root tooling once (eslint/prettier/tsconfig, CI) and provide concise per-package highlights.
- Keep it readable—avoid duplicating identical content; summarize once and note exceptions per package.

Self-check before returning
- Sections included only if substantiated by files; no speculation.
- Each claim backed by path citations in backticks.
- All code examples are real, minimal, and begin with a file path comment.
- Tone, layout, and polish mirror the sample style.
- Output is a single, polished markdown file with the exact required header and intro line.
