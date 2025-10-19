# Canonical `.env.local` using Docker service hostnames

Below is a meticulous plan and a ready-to-use canonical `.env.local` that leverages Docker Compose service names for reliable intra-container connectivity. It’s designed for your T3-App (Next.js + Prisma + NextAuth) running inside the `claude-dev` container, with databases and services reachable on the internal Docker network.

---

## Objectives and principles

- **Consistency:** Use Docker service names (not localhost) for all internal connections.
- **Separation of concerns:** One file for containerized dev; optionally add host/dev variants later.
- **Least surprise:** Values match your Compose environment (`appuser/apppass`, `appdb`, ports).
- **Security:** Keep secrets in env, generate strong `AUTH_SECRET`, avoid leaking to client-side.

---

## Canonical `.env.local`

```dotenv
# -------------------------
# Application environment
# -------------------------
# Set explicitly for clarity in dev; Next.js defaults to "development" locally.
NODE_ENV=development

# -------------------------
# NextAuth / Authentication
# -------------------------
# Generate a strong random secret for signing JWTs (stable between runs):
# On Linux: openssl rand -base64 32
AUTH_SECRET=replace-with-a-long-random-string

# Discord OAuth credentials (from Discord Developer Portal)
# Ensure your redirect URL matches NextAuth route:
# http://localhost:3000/api/auth/callback/discord
AUTH_DISCORD_ID=replace-with-your-discord-client-id
AUTH_DISCORD_SECRET=replace-with-your-discord-client-secret

# -------------------------
# Database (PostgreSQL via Prisma)
# -------------------------
# IMPORTANT: use Docker service name (postgres), not localhost.
# Matches docker-compose: POSTGRES_USER=appuser, POSTGRES_PASSWORD=apppass, POSTGRES_DB=appdb
DATABASE_URL=postgresql://appuser:apppass@postgres:5432/appdb?schema=public

# -------------------------
# MariaDB (optional, if your app uses it)
# -------------------------
MARIADB_HOST=mariadb
MARIADB_PORT=3306
MARIADB_DATABASE=appdb
MARIADB_USER=appuser
MARIADB_PASSWORD=apppass

# -------------------------
# Redis
# -------------------------
REDIS_HOST=redis
REDIS_PORT=6379

# -------------------------
# SMTP / Mailhog
# -------------------------
# For server-side email sending:
SMTP_HOST=mailhog
SMTP_PORT=1025

# -------------------------
# Client-side env (prefix NEXT_PUBLIC_)
# -------------------------
# Do NOT expose secrets here. Only non-sensitive values should be prefixed with NEXT_PUBLIC_.
# Example:
# NEXT_PUBLIC_APP_NAME=T3 Test
```

---

## Validation checklist

- **Env loading:**  
  - From inside `claude-dev`:  
    - **Postgres:** psql -h postgres -U appuser -d appdb -c "SELECT 1;"
    - **Redis:** redis-cli -h redis ping
    - **Mailhog:** curl -fsS http://mailhog:8025/ (if you need to access the UI from inside)
- **Prisma:**  
  - npx prisma generate  
  - npx prisma migrate dev --name init  
  - npm run db:studio
- **Next.js:**  
  - npm run dev (reachable via Nginx reverse proxy on the Ubuntu host as configured)
- **Auth:**  
  - Visit /api/auth/signin and test Discord; ensure Discord OAuth redirect matches your host (via Nginx: http://<ubuntu-host-ip>:3000)

---

## Guardrails and best practices

- **Do not use localhost** inside containers; always use service names (`postgres`, `mariadb`, `redis`, `mailhog`).  
- **Separate envs:**  
  - Use `.env.local` for containerized dev (service names).  
  - If you also run directly on host (no Docker), create `.env.host` with `localhost` and exposed ports, then symlink or copy as needed.  
- **Skip validation sparingly:**  
  - For image builds or CI: SKIP_ENV_VALIDATION=1 npm run build (only as a temporary measure; ensure runtime has proper envs).  
- **Secrets:**  
  - Keep `AUTH_SECRET`, OAuth secrets, and DB passwords out of `NEXT_PUBLIC_*`.  
  - Rotate secrets when moving to staging/production.

---

## Optional multi-environment pattern

- **.env.local (container dev):** service names as above.  
- **.env.host (host dev):** use localhost with exposed ports (e.g., 5432:5432) and update DATABASE_URL accordingly.  
- **.env.production:** production secrets and URLs; do not commit.  
- **Selection strategy:** choose which file to copy to `.env.local` depending on your run mode.

---

## Quick commands to validate end-to-end

- **Prisma (inside claude-dev):**
  - npx prisma generate
  - npx prisma migrate dev --name init
  - npm run db:migrate
  - npm run db:push
- **App dev:**
  - npm run dev
  - curl http://<ubuntu-host-ip>:3000/ (from Windows workstation, via Nginx proxy)
- **Mail testing:**
  - Send a test email from app → view in Mailhog at http://<ubuntu-host-ip>:8025/

---

https://copilot.microsoft.com/shares/UWThX8J8QUnbNUbhbnVax
