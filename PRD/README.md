# ElderCare SG

[![Build Status](https://img.shields.io/badge/build-pending-lightgrey)](##)
[![Lint](https://img.shields.io/badge/lint-pending-lightgrey)](##)
[![Tests](https://img.shields.io/badge/tests-pending-lightgrey)](##)
[![Coverage](https://img.shields.io/badge/coverage-pending-lightgrey)](##)
[![Lighthouse](https://img.shields.io/badge/lighthouse--perf-90%2B-lightgrey)](##)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

> **ElderCare SG** — Compassionate Daycare Solutions

A high-trust, accessible, and performance-first web platform that helps Singapore families discover, evaluate, and book visits to accredited elderly daycare centres. This repository contains the code, documentation, and operational artifacts for the project.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Quick Start (local dev)](#quick-start-local-dev)
3. [Repository layout](#repository-layout)
4. [Architecture & Stack](#architecture--stack)
5. [APIs & Data model](#apis--data-model)
6. [Testing & CI](#testing--ci)
7. [Accessibility & Compliance (PDPA)](#accessibility--compliance-pdpa)
8. [Observability & SLAs](#observability--slas)
9. [Deployment](#deployment)
10. [Contributing](#contributing)
11. [Troubleshooting & Runbooks](#troubleshooting--runbooks)
12. [Roadmap & Next steps](#roadmap--next-steps)
13. [License & Attributions](#license--attributions)

---

## Project Overview
**Goal:** Ship a mobile-friendly marketing + booking platform that increases visit bookings by 30% within 3 months of launch, while meeting WCAG 2.1 AA accessibility, PDPA obligations, and strict performance targets (Lighthouse ≥ 90).

**MVP scope:**
- Public marketing site (hero media, programs, philosophy, credentials)
- Booking funnel (lead capture → confirmation → centre notification)
- Newsletter (double opt-in) and content CMS for editors
- Accessibility & performance automation in CI

If you're evaluating the repository for the first time and want the high-level PRD, see: `docs/PRD.md` and `docs/acceptance-criteria.md`.

---

## Quick Start (local dev)
This repo is organized as a **monorepo** with `api/` (Laravel) and `web/` (Next.js) when the decoupled architecture is chosen. If the repo is configured to run a single-stack Blade flow, the top-level README will reflect that choice.

> The instructions below assume you have `git`, `docker`, `docker-compose`, `node >= 18`, and `composer` installed.

### 1) Clone
```bash
git clone git@github.com:yourorg/eldercare-sg.git
cd eldercare-sg
```

### 2) Copy env files
```bash
cp .env.example .env
cp api/.env.example api/.env
cp web/.env.example web/.env
```

### 3) Start local dev environment (docker)
> This will run the API, frontend, MariaDB, Redis and Mailhog for email testing.
```bash
# from repo root
docker-compose up --build
```

### 4) Laravel API bootstrap (if using API)
```bash
cd api
composer install --no-interaction --prefer-dist
php artisan key:generate
php artisan migrate --seed
php artisan queue:work --tries=3 &
```

### 5) Frontend bootstrap (Next.js)
```bash
cd web
npm ci
npm run dev
```

### 6) Seeded test accounts and example content
Seeders populate: a demo centre, 5 testimonials, and one sample booking window. Check `api/database/seeders` for details.

---

## Repository layout
```
/ (repo root)
├─ api/                # Laravel API (or Blade app if chosen)
├─ web/                # Frontend (Next.js) or legacy Blade views
├─ docs/               # PRD, acceptance, PDPA checklist, runbooks
├─ .github/workflows/  # CI: lint, test, lighthouse, axe, deploy
├─ assets/             # licensed media & license files
├─ runbooks/           # incident playbooks (PDPA breaches, outages)
└─ README.md
```

---

## Architecture & Stack
**Recommended (decoupled)**
- Frontend: Next.js + TypeScript + Tailwind CSS + Storybook
- Backend: Laravel 12 (PHP 8.3) — REST API servicing bookings & content
- Data: MariaDB 10.11, Redis (queues)
- Dev & Infra: Docker (local), GitHub Actions -> Vercel (frontend)/Docker image -> GKE or Cloud Run (API)
- Observability: OpenTelemetry traces, Prometheus metrics, Grafana dashboards, Sentry for errors, RUM for Web Vitals

**Alternative (monolithic Blade)**
- Laravel Blade + Alpine.js + Tailwind — faster delivery if you prefer server-rendered approach

The repo supports both flows; the chosen architecture is recorded at `docs/architecture-choice.md`.

---

## APIs & Data model
Canonical API definitions live in `/api/openapi.yaml`.

**Core endpoint (booking example)**
- `POST /api/v1/bookings` — create booking (returns 201 + booking_id)
- `GET /api/v1/centres` — list accredited centres

See `api/README.md` for full contract and a Postman collection at `api/postman/`.

---

## Testing & CI
**Local test commands**
- Run PHP unit tests (API):
```bash
cd api
composer test    # runs phpunit/pest
```
- Run frontend tests & Storybook:
```bash
cd web
npm run test     # unit + integration
npm run storybook
```
- Run E2E (Playwright):
```bash
cd web
npx playwright install
npx playwright test
```
- Accessibility check (axe-core):
```bash
# quick scan of a running site
npx -y @axe-core/cli http://localhost:3000
```

**CI pipeline** (`.github/workflows/ci.yml`):
1. Checkout
2. Install deps (api + web)
3. Lint (ESLint + Stylelint + PHP CS)
4. Unit tests (api + web)
5. Storybook build + visual regression
6. Lighthouse CI (audit pages) — thresholds enforced
7. Accessibility (axe-core) — fail on new critical issues
8. Deploy preview to staging on PR merge

> Required passing checks for merging to `main`: `lint`, `unit-tests`, `lighthouse`, `axe`.

---

## Accessibility & Compliance (PDPA)
**PDPA / Data protection artifacts** are stored under `/docs/pdpa/` including:
- `pdpa-checklist.md` — engineering checklist for consent, retention, and transfers
- `consent-text/` — versioned consent copy used in forms
- `data-retention-policy.md` — retention periods for marketing vs. clinical records
- `pdpa-breach-runbook.md` — step-by-step actions & notification templates

**Minimum accessibility requirements**
- Target: WCAG 2.1 AA. Run `axe` in CI and manual screen-reader tests (VoiceOver / NVDA).
- All videos require captions & text transcripts; images must have meaningful alt text.

**DPO / Compliance contact**
- DPO: `DPO_NAME` (placeholder) — please set actual contact in `docs/pdpa/owner.md` before launch.

---

## Observability & SLAs
**Metrics & tracing**
- Expose app metrics at `/metrics` (Prometheus format)
- Include `X-Request-ID` in responses; use it to trace logs & traces
- Capture errors in Sentry: `SENTRY_DSN` in env

**SLOs (examples)**
- Booking API success rate ≥ 99% (5m window)
- Booking API p95 latency < 500ms
- Public site Core Web Vitals: LCP ≤ 2.5s (75th pct), CLS ≤ 0.1

Dashboards & alerts live in `/docs/observability/` and include runbook links.

---

## Deployment
**Staging & Production**
- Frontend: Vercel (recommended) — automatic preview deployments for PRs
- API: Docker image → GKE / Cloud Run; use managed DB with encryption at rest

**Secrets**
Set the following GitHub secrets for CI/CD:
- `API_URL`, `DATABASE_URL`, `SENTRY_DSN`, `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `CLOUD_PROVIDER_CREDENTIALS`

**Release process**
- Use semantic versioning. Tag release with `vMAJOR.MINOR.PATCH` and push changelog entry to `CHANGELOG.md`.

---

## Security & Responsible Disclosure
If you discover a security vulnerability, please follow `/runbooks/security-vuln-reporting.md` and email `security@yourorg.example`.

**Basic hardening checklist:**
- TLS only; HSTS enabled
- Database encrypted at rest
- Secrets in a vault (do not commit .env)
- Dependency scanning on weekly cron

---

## Contributing
We welcome contributions. Please follow these steps:
1. Fork the repo and create a feature branch: `feature/<short-desc>`
2. Work on a branch; ensure lint & tests pass locally
3. Open a PR against `main` with a descriptive title and reference the relevant issue
4. Fill PR template (automated checklist)

**Pull Request checklist** (required before merge):
- [ ] Typecheck & lint ✅
- [ ] Unit tests & E2E smoke tests ✅
- [ ] Storybook stories for new UI components ✅
- [ ] Accessibility: axe-core shows no new critical issues ✅
- [ ] PR size < 400 lines (or split into smaller PRs) ✅
- [ ] Changelog entry added ✅

See `CONTRIBUTING.md` for details and `CODE_OF_CONDUCT.md` for community rules.

---

## Troubleshooting & Runbooks
Common issues and runbooks live under `/runbooks/`. Examples:
- `pdpa-breach-runbook.md` — what to do if PDPA breach suspected
- `incident-response.md` — outage triage steps
- `deploy-rollback.md` — how to roll back a failing deployment

If the local dev environment fails to spin up, check:
- Docker memory limits
- Ports collisions (8000, 3000, 1025)
- DB migrations and seeded credentials

---

## Roadmap & Next steps
Planned Phase 2 items (post-MVP):
- CRM integration & lead enrichment
- Multilingual expansion (Chinese + Malay + Tamil)
- Admin portal for centre scheduling & roster management
- Analytics-backed personalization of hero CTAs

---

## Maintainers & Contacts
- Product Owner: `PO_NAME` — `po@yourorg.example`
- Engineering Lead: `ENG_NAME` — `eng@yourorg.example`
- DPO / Compliance: `DPO_NAME` — `dpo@yourorg.example`

(Update `docs/owners.md` with real contacts before launch.)

---

## Changelog
See `CHANGELOG.md` for a full history of releases.

---

## License & Attributions
This repository is released under the MIT License. See `LICENSE`.

**Media & asset licensing**
All hero videos and photos live in `/assets/` with accompanying license files. Ensure any image/video used in new content has a license record in `assets/licenses/`.

---

*Thank you — let’s make a beautiful, responsible product that Singapore families can trust.*

