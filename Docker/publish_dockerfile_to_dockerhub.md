# 🐳 Building & Pushing LedgerSG Container to Docker Hub

## Executive Summary

Here's a complete, production-ready workflow to build your LedgerSG container with all database initializations and push it to **Docker Hub** (note: "Docker Hub" not "DocHub").

---

## Phase 1: Prerequisites

### 1.1 Docker Hub Account Setup

```bash
# 1. Create Docker Hub account (if not exists)
# Visit: https://hub.docker.com/signup

# 2. Login to Docker Hub
docker login

# Enter your Docker Hub username and password
# Expected: Login Succeeded
```

### 1.2 Verify Docker Installation

```bash
# Check Docker version
docker --version

# Check Docker is running
docker info

# Check available disk space
df -h
```

---

## Phase 2: Build the Docker Image

### 2.1 Navigate to Project Directory

```bash
# Navigate to directory containing your Dockerfile
cd /path/to/ledgersg/docker

# Verify Dockerfile exists
ls -la Dockerfile
```

### 2.2 Build the Image

```bash
# Build with tag (replace YOUR_USERNAME with your Docker Hub username)
docker build -t YOUR_USERNAME/ledgersg:latest .

# Example:
# docker build -t nordeim/ledgersg:latest .
```

### 2.3 Build with Version Tag (Recommended for Production)

```bash
# Get current version from your project
VERSION=$(grep -oP 'Version:\s*\K[\d.]+' database_schema.sql.txt || echo "1.0.1")

# Build with version tag
docker build -t YOUR_USERNAME/ledgersg:${VERSION} .

# Also tag as latest
docker tag YOUR_USERNAME/ledgersg:${VERSION} YOUR_USERNAME/ledgersg:latest

# Verify both tags exist
docker images | grep ledgersg
```

### 2.4 Build with Build Arguments (Optional)

```bash
# If your Dockerfile supports build arguments
docker build \
  --build-arg DB_PASSWORD=your_secure_password \
  --build-arg VERSION=1.0.1 \
  -t YOUR_USERNAME/ledgersg:1.0.1 \
  .
```

### 2.5 Build Output Example

```
[+] Building 180.5s (25/25) FINISHED
 => [internal] load build definition from Dockerfile
 => => transferring dockerfile: 15.2kB
 => [internal] load .dockerignore
 => => transferring context: 2.1kB
 => [internal] load metadata for docker.io/library/python:3.13-trixie
 => [1/20] FROM docker.io/library/python:3.13-trixie
 => [2/20] RUN apt-get update && apt-get install -y ...
 => [3/20] RUN cd /usr/bin && wget -q ...
 => [4/20] RUN python3 -m venv /opt/venv && ...
 => [5/20] RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && ...
 => [6/20] RUN groupadd -g 1000 user && ...
 => [7/20] RUN npm install -g --omit=dev pnpm@latest ...
 => [8/20] RUN cd /app && git clone ...
 => [9/20] RUN cd /app/apps/web && npm install && ...
 => [10/20] RUN cd /app/apps/web && echo "Verifying standalone build..."
 => [11/20] RUN mkdir -p /app/core /app/scripts && ...
 => [12/20] COPY <<'BOOTEOF' /app/core/boot.py
 => [13/20] COPY <<'ENTRYEOF' /usr/local/bin/entrypoint.sh
 => [14/20] RUN chmod +x /usr/local/bin/entrypoint.sh && ...
 => [15/20] WORKDIR /app
 => [16/20] RUN touch /app/.env && chown user:user /app/.env
 => exporting to image
 => => naming to docker.io/YOUR_USERNAME/ledgersg:latest
```

---

## Phase 3: Test the Image Locally

### 3.1 Run Container Locally

```bash
# Run container with port mapping
docker run -d \
  --name ledgersg-test \
  -p 7860:7860 \
  -p 3000:3000 \
  -p 8000:8000 \
  -v ledgersg-data:/data \
  YOUR_USERNAME/ledgersg:latest
```

### 3.2 Monitor Startup

```bash
# View startup logs
docker logs -f ledgersg-test

# Expected to see:
# 🎉 All critical services are ready!
# ✅ Backend API:    http://localhost:8000 (Gunicorn)
# ✅ Frontend:       http://localhost:3000
# ✅ Redis:          localhost:6379
# ✅ PostgreSQL:     localhost:5432
```

### 3.3 Test Services

```bash
# Test boot monitor
curl http://localhost:7860/health

# Test backend API
curl http://localhost:8000/api/v1/health/

# Test frontend
curl http://localhost:3000

# View logs via boot.py
curl http://localhost:7860/logs/backend
```

### 3.4 Stop Test Container

```bash
# Stop and remove test container
docker stop ledgersg-test
docker rm ledgersg-test
```

---

## Phase 4: Push to Docker Hub

### 4.1 Verify Login Status

```bash
# Check if logged in
docker info | grep Username

# If not logged in, login again
docker login
```

### 4.2 Push Image

```bash
# Push latest tag
docker push YOUR_USERNAME/ledgersg:latest

# Push version tag
docker push YOUR_USERNAME/ledgersg:1.0.1

# Push both tags
docker push --all-tags YOUR_USERNAME/ledgersg
```

### 4.3 Push Output Example

```
The push refers to repository [docker.io/YOUR_USERNAME/ledgersg]
abc123def456: Pushed
789ghi012jkl: Pushed
345mno678pqr: Pushed
901stu234vwx: Pushed
567yza890bcd: Pushed
latest: digest: sha256:abc123... size: 2567
```

### 4.4 Verify on Docker Hub

```bash
# Visit your Docker Hub repository
# https://hub.docker.com/r/YOUR_USERNAME/ledgersg

# Or use Docker CLI
docker images YOUR_USERNAME/ledgersg
```

---

## Phase 5: Advanced Build Options

### 5.1 Multi-Platform Build (ARM + AMD64)

```bash
# Enable BuildKit
export DOCKER_BUILDKIT=1

# Create builder instance
docker buildx create --name ledgersg-builder --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t YOUR_USERNAME/ledgersg:latest \
  -t YOUR_USERNAME/ledgersg:1.0.1 \
  --push \
  .
```

### 5.2 Build with Cache Optimization

```bash
# Use build cache for faster rebuilds
docker build \
  --cache-from YOUR_USERNAME/ledgersg:latest \
  -t YOUR_USERNAME/ledgersg:1.0.1 \
  .
```

### 5.3 Build with Secrets (for passwords)

```bash
# Create secrets file
echo "my_secure_password" > /tmp/db_password.txt

# Build with secret
docker build \
  --secret id=db_password,src=/tmp/db_password.txt \
  -t YOUR_USERNAME/ledgersg:1.0.1 \
  .

# Clean up secret
rm /tmp/db_password.txt
```

### 5.4 Build with Labels

```bash
docker build \
  --label org.opencontainers.image.version="1.0.1" \
  --label org.opencontainers.image.description="LedgerSG Enterprise Accounting Platform" \
  --label org.opencontainers.image.source="https://github.com/nordeim/ledgersg" \
  -t YOUR_USERNAME/ledgersg:1.0.1 \
  .
```

---

## Phase 6: Automation Script

### 6.1 Create Build Script

Create `scripts/build-and-push.sh`:

```bash
#!/bin/bash
set -e

# Configuration
DOCKER_USERNAME="YOUR_USERNAME"
IMAGE_NAME="ledgersg"
VERSION="1.0.1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   LedgerSG Docker Build & Push Script${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ ERROR: Docker is not running${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Check Docker Hub login
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}⚠ Not logged in to Docker Hub${NC}"
    docker login
fi
echo -e "${GREEN}✓ Logged in to Docker Hub${NC}"

# Build image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build -t ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION} .
docker tag ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION} ${DOCKER_USERNAME}/${IMAGE_NAME}:latest
echo -e "${GREEN}✓ Image built successfully${NC}"

# Test image locally (optional)
echo -e "${YELLOW}Testing image locally...${NC}"
docker run --rm ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION} echo "Test successful"
echo -e "${GREEN}✓ Image test passed${NC}"

# Push to Docker Hub
echo -e "${YELLOW}Pushing to Docker Hub...${NC}"
docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}
docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:latest
echo -e "${GREEN}✓ Image pushed successfully${NC}"

# Summary
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Build & Push Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Image: ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}${NC}"
echo -e "${GREEN}   Tags:  ${VERSION}, latest${NC}"
echo -e "${GREEN}   URL:   https://hub.docker.com/r/${DOCKER_USERNAME}/${IMAGE_NAME}${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
```

### 6.2 Make Script Executable

```bash
chmod +x scripts/build-and-push.sh
```

### 6.3 Run Script

```bash
./scripts/build-and-push.sh
```

---

## Phase 7: CI/CD Integration

### 7.1 GitHub Actions Workflow

Create `.github/workflows/docker-build.yml`:

```yaml
name: Build and Push Docker Image

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

env:
  REGISTRY: docker.io
  IMAGE_NAME: ${{ github.repository_owner }}/ledgersg

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./docker/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=registry,ref=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
          cache-to: type=inline
```

### 7.2 Add GitHub Secrets

```bash
# In GitHub Repository Settings → Secrets and variables → Actions
# Add:
# DOCKERHUB_USERNAME = your_docker_hub_username
# DOCKERHUB_TOKEN = your_docker_hub_access_token
```

---

## Phase 8: Important Considerations

### 8.1 Database State in Container

| Concern | Recommendation |
|---------|----------------|
| **Schema initialized at runtime** | ✅ Good - Schema applies on first container start |
| **Data persistence** | ⚠️ Use Docker volumes for `/data/postgresql` |
| **Container recreation** | ✅ Schema won't re-apply (idempotent check) |
| **Image size** | ⚠️ ~2.5GB - Consider multi-stage build for production |

### 8.2 Security Considerations

```bash
# 1. Don't hardcode passwords in Dockerfile
# Use environment variables or secrets

# 2. Scan image for vulnerabilities
docker scan YOUR_USERNAME/ledgersg:latest

# 3. Use specific base image versions
# FROM python:3.13.1-trixie instead of FROM python:3.13-trixie

# 4. Regularly rebuild with security updates
docker build --no-cache -t YOUR_USERNAME/ledgersg:latest .
```

### 8.3 Storage Requirements

| Component | Size |
|-----------|------|
| Base Image (Python 3.13) | ~1.2GB |
| Node.js + npm packages | ~500MB |
| Python dependencies | ~400MB |
| PostgreSQL + Redis | ~300MB |
| Application code | ~100MB |
| **Total** | **~2.5GB** |

---

## Phase 9: Complete Command Reference

### Quick Start (Copy & Paste)

```bash
# 1. Login to Docker Hub
docker login

# 2. Navigate to Dockerfile directory
cd /path/to/ledgersg/docker

# 3. Build image
docker build -t YOUR_USERNAME/ledgersg:latest .

# 4. Test locally (optional)
docker run --rm YOUR_USERNAME/ledgersg:latest echo "Build successful"

# 5. Push to Docker Hub
docker push YOUR_USERNAME/ledgersg:latest

# 6. Verify on Docker Hub
# Visit: https://hub.docker.com/r/YOUR_USERNAME/ledgersg
```

### One-Liner Build & Push

```bash
docker build -t YOUR_USERNAME/ledgersg:latest . && docker push YOUR_USERNAME/ledgersg:latest
```

### Versioned Build & Push

```bash
VERSION=1.0.1 && \
docker build -t YOUR_USERNAME/ledgersg:${VERSION} . && \
docker tag YOUR_USERNAME/ledgersg:${VERSION} YOUR_USERNAME/ledgersg:latest && \
docker push YOUR_USERNAME/ledgersg:${VERSION} && \
docker push YOUR_USERNAME/ledgersg:latest
```

---

## Phase 10: Troubleshooting

| Issue | Solution |
|-------|----------|
| `denied: requested access to the resource is denied` | Run `docker login` |
| `image does not exist` | Check username/repository name |
| `build failed: context not found` | Run from directory containing Dockerfile |
| `push failed: unauthorized` | Re-authenticate with `docker logout && docker login` |
| `no space left on device` | Run `docker system prune -a` |
| `build too slow` | Use `--cache-from` flag |

---

## 🎯 Summary Checklist

- [ ] Docker Hub account created
- [ ] Logged in with `docker login`
- [ ] Dockerfile in correct directory
- [ ] Image built with `docker build -t USERNAME/ledgersg:latest .`
- [ ] Image tested locally
- [ ] Image pushed with `docker push USERNAME/ledgersg:latest`
- [ ] Verified on Docker Hub website
- [ ] Build script created for automation
- [ ] CI/CD pipeline configured (optional)

**Your LedgerSG container is now ready for deployment!** 🚀

# https://chat.qwen.ai/s/45c614b3-6930-4765-9cb4-397bb7356a45?fev=0.2.9
