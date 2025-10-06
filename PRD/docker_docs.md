Perfect — below are all production-grade scaffolds bundled into your documentation suite.

---

# 🧭 CONTRIBUTING.md

## 1. Code of Conduct
All contributors are expected to uphold empathy, respect, and transparency. See `CODE_OF_CONDUCT.md` for full policy. Violations may result in contribution suspension.

## 2. Branching Model
| Branch | Purpose | CI/CD Behavior |
|---------|----------|----------------|
| `main` | Production-ready, auto-deploy to Vercel | Full pipeline + audit |
| `develop` | Active integration branch | Lint + test + preview deploy |
| `feature/*` | New component or improvement | PR → review → squash merge |
| `hotfix/*` | Urgent fixes to production | Immediate deploy on approval |

## 3. Commit Convention (Conventional Commits)
```
<type>(<scope>): <summary>
```
Examples:
- feat(booking): add calendar integration
- fix(carousel): pause autoplay on hover
- docs(readme): update setup instructions

## 4. Pull Request Requirements
- ✅ Lint passes (ESLint, Prettier)
- ✅ Type check passes (tsc or PHPStan)
- ✅ Unit + visual tests pass
- ✅ Storybook updated if UI changed
- ✅ Docs updated (README or component mdx)

## 5. Review & Approval
Each PR must have at least **1 reviewer approval** and **CI green status**. Design-related changes require UX sign-off.

## 6. Local Setup
```bash
git clone https://github.com/<org>/eldercare-sg.git
cd eldercare-sg
cp .env.example .env
composer install && npm install
php artisan serve & npm run dev
```

---

# 🚀 .github/workflows/ci.yml
```yaml
name: CI
on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop]

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
      - name: Install dependencies
        run: composer install --no-progress --no-interaction
      - name: Lint PHP
        run: vendor/bin/phpcs --standard=PSR12 app/
      - name: Lint JS
        run: npm run lint
      - name: Run unit tests
        run: vendor/bin/phpunit
      - name: Build frontend
        run: npm run build
      - name: Run Lighthouse & Accessibility audits
        uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: ./.lighthouserc.js
      - name: Run Playwright tests
        run: npx playwright test
```

---

# 🧪 docker-compose.dev.yml
```yaml
version: '3.9'
services:
  app:
    build: .
    container_name: eldercare_app
    ports:
      - '8000:8000'
    volumes:
      - .:/var/www/html
    environment:
      - APP_ENV=local
      - DB_HOST=db
      - DB_DATABASE=eldercare
      - DB_USERNAME=root
      - DB_PASSWORD=secret
    depends_on:
      - db
  db:
    image: mariadb:10.9
    container_name: eldercare_db
    environment:
      - MYSQL_ROOT_PASSWORD=secret
      - MYSQL_DATABASE=eldercare
    ports:
      - '3306:3306'
  redis:
    image: redis:alpine
    container_name: eldercare_redis
    ports:
      - '6379:6379'
```

---

# 📘 api/openapi.yaml
```yaml
openapi: 3.1.0
info:
  title: ElderCare SG API
  version: 1.0.0
  description: API endpoints for booking, testimonials, and newsletters.
servers:
  - url: https://api.eldercare.sg/v1
paths:
  /booking:
    post:
      summary: Create a daycare booking request
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name: { type: string, example: "Tan Mei Lin" }
                email: { type: string, format: email }
                date: { type: string, format: date }
                visitType: { type: string, enum: ["in_person", "virtual"] }
      responses:
        '201': { description: Booking created successfully }
        '400': { description: Validation error }
        '500': { description: Server error }
  /newsletter:
    post:
      summary: Subscribe to email newsletter
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email: { type: string, format: email }
      responses:
        '200': { description: Subscription confirmed }
```

---

# 🧩 CODE_OF_CONDUCT.md (summary)
1. Treat all contributors, users, and seniors with respect and empathy.  
2. No discrimination, harassment, or exclusionary behavior tolerated.  
3. Collaborate openly, provide constructive feedback, and document decisions.  
4. Report issues via `CODE_OF_CONDUCT_CONTACT` in `.env` (to compliance officer).

---

# 📈 Monitoring & Observability
- **Metrics:** response time (95p), uptime %, booking success ratio, API error rate.
- **Dashboards:** Grafana + Sentry + Google Analytics 4.
- **Logs:** structured JSON logs (monolog), centralized via CloudWatch.
- **Alerting:** Slack + email for API latency > 800ms or booking errors > 1%.

---

# 🧭 Next Steps
- [ ] Add `.env.example` for Mailchimp + DB vars.
- [ ] Integrate axe-core + Lighthouse CI budgets.
- [ ] Define alert escalation matrix (Singapore business hours).
- [ ] Set up weekly audit pipeline (performance + accessibility).

---

This documentation suite ensures ElderCare SG remains **auditable, extensible, and production-grade**, compliant with **PDPA (Singapore)** and **WCAG 2.1 AA** accessibility standards.

