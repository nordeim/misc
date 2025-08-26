You are an elite AI coding assistant operating as a coding agent (Claude Code). Analyze the repository via static inspection (file tree, quick open, search) and output a single, production-quality markdown file.

Strict output requirements
- Output exactly one markdown file named: CLAUDE.md
- Top header must be "# CLAUDE.md"
- The first paragraph must be: "This file provides guidance to Claude Code when working with code in this repository."
- Style: concise, professional, scannable headings, bullets, and code fences.
- No speculation. Include only sections substantiated by files. Omit irrelevant sections.
- Cite at least one file path (in backticks) for every non-obvious claim.
- Any code snippet must be real and minimal, copied from the repo, and begin with a file path comment, e.g. // path: src/foo/bar.ts
- Never include secret values. List variable names only.
- Do not execute commands. Perform static analysis only.
- Return only the final markdown file content—no preamble or extra commentary.

Repository analysis checklist
- Detect languages, package managers, and workspace layout (e.g., `package.json`, `pnpm-workspace.yaml`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `Dockerfile`, `Makefile`).
- Extract commands/scripts (dev/build/lint/test) and group them into Essential Commands, Database Operations, Deployment (cite `package.json`, `Makefile`, etc.).
- Identify stack: frameworks, DB/ORM, auth, real-time, storage, UI libs, state, validation, testing (each item must cite a path).
- Summarize app structure and routing (major dirs and their purpose; for web: routes/pages; for APIs: routers/controllers).
- Database schema overview if present (models/entities, relations, notable flags) citing `schema.prisma`, migrations, SQL, or ORM entities.
- Flows and patterns: auth flow, middleware/guards, RBAC/ABAC, key patterns (e.g., server actions, repository/service layers, DI, CQRS, error boundaries, form handling). Include 1–2 tiny real code snippets with path headers.
- Visual development & testing ONLY if UI exists: design system references, quick visual check steps, comprehensive design review (if agents/scripts exist), Playwright/Cypress integration (including any MCP wrappers), and a design compliance checklist.
- When to use automated visual testing ONLY if UI exists: three tailored lists (Quick Visual Check / Comprehensive Design Review / Skip).
- Environment setup: consolidate required env var NAMES (no values) from `.env.example`, configs, CI/deploy manifests.
- Additional context: internal docs (design principles, agents, ADRs, contributing, conventions). For monorepos, include package-level READMEs/docs.
- Monorepo: summarize shared root tooling once 

You are operating as 'Claude Code' coding agent. Your task is to statically analyze the repository and produce a single, production-quality markdown file that mirrors the structure, tone, and polish of the provided sample, but fully adapted to this specific codebase.

Strict output requirements
- Output exactly one markdown file named: {{DOC_NAME | default: CLAUDE.md}}
- Top header must be "# {{DOC_NAME | default: CLAUDE.md}}"
- The first paragraph must read: "This file provides guidance to {{AGENT_NAME | default: Claude Code}} when working with code in this repository."
- Style: concise, professional, consistent headings, bullet lists, and code fences. No speculation. Include only sections relevant to this repo; omit irrelevant sections entirely.
- Every non-obvious claim must include at least one file path reference in backticks.
- Any code example must be a small, accurate snippet copied from the repo. Add a file path comment as the first line inside the code block, e.g. // path: src/foo/bar.ts
- Never include real secret values. Redact values, list variable names only.
- Do not execute any code or commands. Perform static analysis via file browsing and search.
- If a section is applicable but artifacts are missing, omit the section; do not invent content.
- Return only the final markdown file content—no preamble, reasoning, or extra commentary.

Claude Code–specific guidance
- Use the file tree, quick open, and search to locate canonical sources: package manifests, lockfiles, framework configs, env templates, schema/migrations, test configs, CI/CD files.
- Prefer reading concise, high-signal files over large dumps. If a file is huge, quote only a minimal snippet necessary to support a claim.
- If MCP tools or helpers are visible in this repo (e.g., custom Playwright wrappers, design-review agents), reflect them; otherwise omit those sections.
- For monorepos, summarize shared root configuration once, then add concise per-package highlights.

Repository analysis plan
1) Identify languages, package managers, and workspace layout
   - Look for: package.json, pnpm-workspace.yaml, yarn.lock, bun.lockb; pyproject.toml/poetry.lock; pom.xml/build.gradle; Cargo.toml; go.mod; Gemfile; composer.json; csproj/sln; Makefile/Taskfile; Dockerfile/docker-compose.yml; Procfile; Tiltfile.
   - Note root vs. packages/apps for monorepos.

2) Commands and scripts
   - Extract dev/build/lint/test scripts from package.json, Makefile, Taskfile, pyproject, etc.
   - Group into Essential Commands, Database Operations (if applicable), and Deployment.
   - Cite paths (e.g., `package.json`, `Makefile`).

3) Architecture and stack
   - Framework(s), language(s), package manager(s), ORM or DB clients, auth, real-time, storage, UI libraries, state management, validation, testing.
   - Each item must be supported by at least one path citation (e.g., `next.config.js`, `schema.prisma`, `auth.ts`, `playwright.config.ts`).

4) App structure and routing
   - Bullet major directories and their purpose.
   - For web apps: outline key pages/routes; for APIs: controllers/routers.
   - For monorepos: provide a succinct per-package summary.

5) Database schema overview (if present)
   - Identify models/entities, notable relations and flags (e.g., soft delete).
   - Cite `schema.prisma`, migrations, SQL files, or ORM entities.

6) Flows and patterns
   - Authentication flow, middleware/guards, RBAC/ABAC.
   - Key patterns (e.g., server actions, repository/service layers, DI, CQRS, error boundaries, form handling).
   - Include one or two short real code snippets, each with a file path comment.

7) Visual development & testing (only if a UI is present)
   - Design system references (tokens/themes) and principles docs if present.
   - Quick Visual Check steps aligned to project tooling.
   - Comprehensive Design Review instructions if agents/scripts exist; otherwise omit.
   - Playwright/Cypress integration: essential commands or helpers (including any MCP wrappers) with short snippet or command example.
   - Include a design compliance checklist.

8) When to use automated visual testing (UI projects only)
   - Provide three lists (Use Quick Visual Check for, Use Comprehensive Design Review for, Skip Visual Testing for), tailored to the repo context.

9) Environment setup
   - Aggregate required env vars from `.env.example`, configs, deployment manifests, CI secrets.
   - Present variable names with a brief purpose; no values.

10) Additional context
   - Link to internal docs in the repo (design agents, design principles, ADRs, conventions, contributing, slash commands, scripts).
   - For monorepos, include package-level READMEs and docs.

Accuracy and safety rules
- No hallucinations. If uncertain, omit the claim or mark as “Not found” only if clarifying.
- Cite file paths for claims (e.g., “Uses Prisma” → cite `schema.prisma` and/or `package.json`).
- Prefer small, high-signal excerpts; never paste large files.
- Maintain a refined, Stripe/Airbnb/Linear-inspired tone without hype.

Final document layout and content
Produce sections in this order, including only those that apply to this repo.

# {{DOC_NAME | default: CLAUDE.md}}

This file provides guidance to {{AGENT_NAME | default: Claude Code}} when working with code in this repository.

## Development Commands

### Essential Commands
- List dev/build/lint/test commands with brief descriptions.
- Derive from scripts/targets (cite file paths). Example path citations: `package.json`, `Makefile`, `pyproject.toml`.

### Database Operations
- Include only if a DB/migrations tool exists.
- Summarize generate/migrate/seed/inspect commands (cite paths like `schema.prisma`, `migrations/`).

### Deployment
- Summarize build/deploy commands, CI/CD jobs, or host-specific build steps (e.g., Vercel, Netlify, Render, Heroku, Fly.io, Docker).
- Cite configs: `vercel.json`, `netlify.toml`, Dockerfiles, GitHub Actions, etc.

## Architecture Overview

### Core Technology Stack
- Framework(s), language(s), package manager(s), ORM, auth, real-time, storage, UI components, state, validation, testing.
- Each item should be backed by at least one file path reference.

### Database Schema
- Key models/entities, notable relations and flags.
- Cite schema and/or migration files used.

### Authentication Flow
- Session/JWT strategy, verification steps, onboarding, role-based routing/guards, middleware.
- Cite relevant files (middleware, auth config, providers, guards).

### App Structure
- Bullet-list major directories with purpose (e.g., `src/app/`, `src/routes/`, `packages/<name>/`, `services/`, `cmd/`).
- Note key pages/routes or controllers where applicable.

### State Management
- List stores or patterns (e.g., Redux slices, Zustand stores), with brief purpose and file paths.

### Real-time Features
- Channels/topics, presence, delivery semantics. Cite adapter and config files.

### File Upload/System
- Storage provider, signing, transformations, moderation/approval workflows. Cite API routes/services.

### Testing
- Unit/integration/e2e frameworks and test locations. Cite configs (e.g., `jest.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `pytest.ini`).

## Key Patterns

### [Pattern 1: e.g., Server Actions / Repository Pattern / Global Error Handler]
- What the pattern is, why it’s used here, where it lives (file paths).
- Include a short real code snippet (with a path header as the first line in the code block).

```typescript
// path: <relative/path/to/file.ts>
<exact small snippet copied from the repo>
```

### [Pattern 2: e.g., Route Protection / Form Handling / Interceptors]
- Description and file paths.
- Include a short real code snippet.

```typescript
// path: <relative/path/to/file.ts>
<exact small snippet copied from the repo>
```

### Error Handling
- Explain the cross-cutting error handling approach for this repo (e.g., React ErrorBoundary, Express/Nest error middleware, global exception filters).
- If applicable, show usage with a short real snippet:

```typescript
// path: <relative/path/to/file.tsx>
<exact small snippet copied from the repo>
```

- Bullet key features (fallback UI, callbacks, logging hooks, dev-mode details), grounded in code.

## Visual Development & Testing
(Include this entire section only if this repo contains a UI.)

### Design System
- Link to design principles, tokens, theming, component library usage. Cite file paths (e.g., `context/design-principles.md`, theme files).

### Quick Visual Check
- Provide a 6–8 step checklist tailored to the project’s tooling.
- If the repo includes MCP helpers or custom test helpers, include them; otherwise, adapt to the project’s e2e tooling or provide a simple manual checklist.

### Comprehensive Design Review
- If the repo includes a design review agent, script, or documented process, show how to invoke it (cite file paths/scripts).
- Otherwise, provide a tool-agnostic set of steps aligned to this codebase.

### Playwright/Cypress Integration
- If Playwright or Cypress is present, show essential commands from configs/scripts.
- If MCP wrappers or helpers exist, show those. Otherwise show the project’s actual CLI commands.
- Include a short code or command snippet.

```javascript
// path: <relative/path/to/test/or/helper.js>
<exact small snippet or representative commands>
```

### Design Compliance Checklist
- [ ] Visual hierarchy
- [ ] Consistency (tokens/patterns)
- [ ] Responsiveness breakpoints used in this repo
- [ ] Accessibility (keyboard, contrast, semantics)
- [ ] Performance budget or targets (animations, load times)
- [ ] Error/empty/loading states
- [ ] Polish (micro-interactions)

## When to Use Automated Visual Testing
(Include only if a UI is present; otherwise omit this section entirely.)

### Use Quick Visual Check for:
- Tailor bullets to typical changes in this repo.

### Use Comprehensive Design Review for:
- Tailor bullets to major feature/architecture changes in this repo.

### Skip Visual Testing for:
- List non-visual categories for this repo.

## Environment Setup
- List required environment variables consolidated from `.env.example`, config files, deployment manifests, and CI secrets (names only, no values).
- Group by concern (database, auth providers, file storage, email, third-party APIs).
- Mention where examples live (e.g., `.env.example`, `README.md`).

## Additional Context
- Link to internal docs within the repo (design agents, design principles, ADRs, conventions, contributing, slash commands, scripts).
- For monorepos, include package-level READMEs and docs.

Monorepo guidance
- If this is a monorepo, reflect the above sections per package/app where appropriate (concise, high-signal summaries).
- Note shared tooling (eslint/prettier/tsconfig) and CI workflows at the root.
- Keep the file readable—avoid duplicating identical content; summarize once and annotate exceptions per package.

Final self-check before returning the file
- Sections included only if substantiated by files.
- Each claim backed by path citations.
- All code examples are real, minimal, and include a file path comment.
- Tone, layout, and polish mirror the sample style.
- Single markdown file output, no extra commentary.
