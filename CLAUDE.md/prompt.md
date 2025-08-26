I can’t share internal chain-of-thought, but I will provide a rigorous plan and a production-ready prompt template you can hand to any AI coding agent to generate a codebase summary that mirrors the style and structure of your sample.

Execution plan
- Align on goal: Produce a reusable prompt template that instructs an AI agent to analyze any repository and generate a single, high-quality summary markdown file modeled after your sample CLAUDE.md.
- Generalize the structure: Keep the same sections and tone as the sample, but make each section conditional and adaptable to any stack (web, backend, polyglot, monorepo).
- Bake in accuracy controls: Force path-citations for claims, forbid speculation, include conditional logic for UI/DB/etc., and require minimal, real code snippets with file path headers.
- Ensure UX excellence: Preserve the concise, scannable layout, include checklists, and maintain a polished, professional voice.

Quality checklist
- The prompt forces: no hallucinations, path-citations for each claim, small real code snippets with file path comments, conditional sections, monorepo support, and a final single-file markdown output.
- The output layout mirrors the sample CLAUDE.md, with sections included only when applicable.
- The agent is instructed to detect and document stack specifics (frameworks, DB, auth, real-time, storage, UI, state, validation, testing).
- Includes visual testing/design sections only for UI projects; otherwise instructs to omit.
- The prompt is self-contained and ready to paste into any AI coding agent.

Prompt template (copy-paste to your coding agent)
```text
You are an expert codebase analyst and technical writer. Your task is to statically analyze the repository and produce a single, production-quality markdown file that mirrors the structure, tone, and polish of the provided sample, but is fully adapted to this specific codebase.

Output requirements
- Output exactly one markdown file named: {{DOC_NAME | default: CLAUDE.md}}
- Top header must be "# {{DOC_NAME | default: CLAUDE.md}}"
- The first paragraph must read: "This file provides guidance to {{AGENT_NAME | default: the AI coding agent}} when working with code in this repository."
- Style: concise, professional, consistent headings, bullet lists, and code fences. No speculation. Only include sections relevant to this repo; omit irrelevant sections entirely.
- Every non-obvious claim must include at least one file path reference in backticks. Examples: package.json scripts, migrations folder, env templates, configs, middleware, etc.
- Any code example you include must be a small, accurate snippet found in the repo. Add a file path comment as the first line inside the code block, e.g. // path: src/foo/bar.ts
- Never include real secret values. If secrets are found, redact values and just list variable names.
- Do not execute code. Rely on static analysis only.
- If a section is applicable but underlying artifacts are missing, omit the section rather than inventing content.

Repository analysis plan
1) Detect languages and package managers
   - Look for: package.json, pnpm-lock.yaml, yarn.lock, bun.lockb; pyproject.toml, poetry.lock, requirements.txt; pom.xml, build.gradle; Cargo.toml; go.mod; Gemfile; composer.json; csproj/sln; Makefile/Taskfile; Dockerfile; docker-compose.yml; Procfile; Tiltfile.
   - Note top-level and per-package (monorepo) locations.

2) Commands and scripts
   - Extract dev/build/lint/test scripts (package.json scripts, Make targets, Poetry scripts, NPM scripts, task runners).
   - Group into Essential Commands, Database Operations (if applicable), and Deployment.

3) Architecture and stack
   - Frameworks: Next.js/React/Vue/Svelte/Angular/NestJS/Express/FastAPI/Django/Spring/.NET/etc.
   - Database and ORM: PostgreSQL/MySQL/SQLite/MongoDB; Prisma/TypeORM/Sequelize/Drizzle/Mongoose/SQLAlchemy/Entity Framework, etc.
   - Auth: NextAuth/Passport/JWT libs/OAuth/OIDC/Session middleware/Devise/Django Auth/etc.
   - Real-time: WebSockets/Socket.IO/Pusher/Ably/SSE/Redis PubSub.
   - File storage: S3/Cloudinary/Firebase/Local.
   - UI components/design system: Tailwind/MUI/Chakra/Ant/NextUI/Bootstrap/Radix/Design tokens.
   - State management: Redux/Zustand/MobX/Recoil/Vuex/Pinia/NgRx.
   - Validation: Zod/Yup/Joi/Class-validator/Pydantic/Validator.js/etc.
   - Testing: Jest/Vitest/Mocha/RTL/Cypress/Playwright/Pytest/JUnit/RSpec/Go test, etc.

4) App structure and routing
   - Summarize key directories and their purposes.
   - For web projects, outline key routes/pages. For APIs, outline key endpoints or controllers.
   - For monorepos, summarize each package/app succinctly.

5) Database schema overview (if present)
   - Identify models/entities (names, key fields/relations).
   - Cite the schema/migrations files used to derive the summary.

6) Flows and patterns
   - Authentication flow, middlewares/guards, RBAC/ABAC.
   - Key patterns: e.g., Next.js server actions, repository/service layers, CQRS, DI containers, error boundaries/global handlers/interceptors, form handling, domain modules, event-driven patterns.
   - Include one or two short real code snippets to illustrate critical patterns (each snippet must include a file path comment and be directly copied from the repo).

7) Visual development & testing (only if a UI is present)
   - Design system references and design principles docs if found.
   - Quick Visual Check steps tailored to the repo tools.
   - Comprehensive Design Review instructions—if a design-review agent/tool or scripts exist, document them; otherwise omit.
   - Playwright/Cypress integration: show essential commands; if MCP wrappers or test helpers exist, include their usage; otherwise show the project’s actual CLI commands.
   - Design Compliance Checklist (checkbox list).

8) When to use automated visual testing (only if UI is present)
   - Provide three lists (Use Quick Visual Check for, Use Comprehensive Design Review for, Skip Visual Testing for), adapted to the repo context.

9) Environment setup
   - Aggregate all required env vars from .env.example, .env.*, config files, deployment configs, CI secrets.
   - Present variable names with brief purpose; never include actual secret values.

10) Additional context
   - Link to internal docs in the repo (design docs, context files, conventions, agents, slash commands, ADRs).
   - If monorepo: include per-package READMEs and configs here.

Accuracy and safety rules
- No hallucinations. If you cannot verify from files, omit or mark as “Not found” only if essential to clarity.
- Cite file paths for claims (e.g., “Uses Prisma” → cite schema.prisma, package.json, or prisma/ dir).
- Prefer small, high-signal excerpts; do not paste large files.
- Keep a concise, polished, Stripe/Airbnb/Linear-inspired tone without hype.

Final document layout and content
Produce the following sections, including only those that apply to this repo. Keep the order as listed.

# {{DOC_NAME | default: CLAUDE.md}}

This file provides guidance to {{AGENT_NAME | default: the AI coding agent}} when working with code in this repository.

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
- Key models/entities, notable relations and flags (e.g., soft delete, approval flags).
- Cite schema and/or migration files used.

### Authentication Flow
- Session/JWT strategy, verification steps, onboarding, role-based routing/guards, middleware.
- Cite relevant files (middleware, auth config, providers, guards).

### App Structure
- Bullet-list major directories with purpose (e.g., `src/app/`, `src/routes/`, `packages/<name>/`, `services/`, `cmd/`, etc.).
- Note key pages/routes or controllers where applicable.

### State Management
- List stores or patterns (e.g., Redux slices, Zustand stores), with brief purpose and file paths.

### Real-time Features
- Channels/topics, presence, delivery semantics. Cite adapter and config files.

### File Upload/System
- Storage provider, signing, transformations, moderation/approval workflows. Cite API routes/services.

### Testing
- Unit/integration/e2e frameworks and test locations. Cite configs (jest.config, vitest.config, playwright.config, pytest.ini, etc.).

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
- If applicable (e.g., React), show usage of error boundary or error handler with a short real snippet:

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
- If MCP wrappers or helpers exist, show those. Otherwise show CLI commands the repo uses.
- Include a short code or command snippet block.

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
```

How to use
- Set DOC_NAME (e.g., CLAUDE.md) and AGENT_NAME (e.g., Claude Code, GitHub Copilot, Cursor, Code Llama).
- Paste the prompt into your AI coding agent with repository access.
- Review the generated markdown for path-citations and accuracy; it should read like your sample, but be completely project-specific.

If you’d like, I can tailor this template for a specific agent (e.g., Claude, Cursor, Copilot) or a specific ecosystem (Next.js, Python monorepo, Go services) to further tighten defaults.
