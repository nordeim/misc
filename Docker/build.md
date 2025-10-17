# Alpine dev container with Claude Code

A lightweight, SSH-accessible Alpine dev environment for Python, PHP, and Node.js (v22.20.0), with Composer, Claude Code CLI, sudo-enabled non-root user, and common build tools. Ideal for local development, WSL, and reproducible setups.

---

## Features and included tools

- **Base:** node:22.20-alpine3.22 (musl-compatible Node v22.20.0)
- **Shell & SSH:** bash, openssh, sudo (passwordless for devuser)
- **Editors & utils:** vim, curl, wget, jq
- **VC & build:** git, make, g++, build-base
- **Python:** Python 3.12, pip
- **PHP:** PHP 8.3 + common extensions, Composer
- **Node.js:** npm, npx, global Claude Code CLI
- **Container tooling:** docker-cli
- **User:** devuser with bash shell and passwordless sudo
- **Ports/Volumes:** SSH on 22 (mapped to 2222), persistent /home/devuser volume

---

## Quick start

1. **Pull the image**
   - docker pull nordeim/alpine-dev-claude-dev:latest

2. **Run the container**
   - docker run -d -p 2222:22 --name claude-dev nordeim/alpine-dev-claude-dev:latest

3. **SSH into the container**
   - ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null devuser@localhost -p 2222
   - **Default user:** devuser
   - **Default password:** devpass

4. **Verify runtimes**
   - node -v, npm -v, python3 --version, php -v, composer --version, claude --help

---

## Usage details

- **Passwordless sudo**
  - sudo <command>
- **Global npm installs**
  - sudo npm install -g pnpm
- **Python virtualenvs**
  - python3 -m venv .venv && source .venv/bin/activate && pip install <pkgs>
- **PHP Composer**
  - composer init && composer require <package>
- **Claude Code CLI**
  - claude login
  - claude <subcommand>

> Tip: For frictionless SSH, consider switching to key-based auth and disabling password login in sshd_config for hardened setups.

---

## Docker configs (for customization and rebuilding)

### File: Dockerfile (final)
```Dockerfile
FROM node:22.20-alpine3.22

# Ensure base OS and dev tools
RUN apk update && apk add --no-cache \
    bash \
    libstdc++ \
    openssh \
    wget \
    curl \
    git \
    vim \
    shadow \
    jq \
    make \
    g++ \
    build-base \
    docker-cli \
    ca-certificates \
    # Python 3.12 + pip
    python3 \
    py3-pip \
    # PHP 8.3 + common extensions
    php83 \
    php83-cli \
    php83-mbstring \
    php83-openssl \
    php83-json \
    php83-phar \
    php83-dom \
    php83-tokenizer \
    php83-xml \
    php83-curl

RUN apk add --no-cache sudo && \
    echo "devuser ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Create non-root dev user
RUN useradd -m -s /bin/bash devuser && \
    echo "devuser:devpass" | chpasswd

# Composer
RUN curl -sS https://getcomposer.org/installer | php83 -- --install-dir=/usr/local/bin --filename=composer

# Claude Code CLI (Node v22 already present from base image)
RUN npm install -g @anthropic-ai/claude-code

# SSH configuration
RUN ssh-keygen -A && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Ownership hygiene
RUN chown -R devuser:devuser /home/devuser

EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]
```

### File: docker-compose.yml (final)
```yaml
services:
  claude-dev:
    build:
      context: .
    ports:
      - "2222:22"
    volumes:
      - dev_data:/home/devuser
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "nc -z 127.0.0.1 22 || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  dev_data:
```

---

## Build and run from source (for future customization)

- **Clean build from Dockerfile**
  - docker compose build --no-cache
  - docker compose up -d

- **SSH access (force yes and password-only)**
  - ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null devuser@localhost -p 2222

- **Reset environment**
  - docker compose down --volumes --rmi all
  - docker compose build --no-cache
  - docker compose up -d

- **Tag and push to Docker Hub**
  - docker tag alpine-dev-claude-dev:latest nordeim/alpine-dev-claude-dev:latest
  - docker push nordeim/alpine-dev-claude-dev:latest

---

## Security notes

- **Default credentials:** devuser/devpass are for development. Change immediately or switch to key-based auth:
  - Disable password login: set PasswordAuthentication no in /etc/ssh/sshd_config
  - Provision authorized_keys for devuser during build or via bind mount
- **Port exposure:** the Compose maps 2222->22. Keep it bound to localhost unless you need remote access.
- **Sudo:** NOPASSWD is convenient for dev; restrict or remove in production-like environments.

---

## List your deployed custom image

- **List local images**
  - docker images

- **Inspect the pushed image digest on Docker Hub**
  - docker pull nordeim/alpine-dev-claude-dev:latest
  - docker image inspect nordeim/alpine-dev-claude-dev:latest --format '{{.RepoDigests}}'

---

## Publish the README on Docker Hub

You have two options:

### Option A: Manually via Docker Hub UI
- **Log in** to https://hub.docker.com/
- **Navigate** to your repo: nordeim/alpine-dev-claude-dev
- **Edit** the README in the “Overview” tab
- **Paste** the contents of this README and save

### Option B: Automate via GitHub + Description file
- **Create** a GitHub repo with your Dockerfile and README.md
- **Link** Docker Hub to GitHub to build automatically (Automated Builds)
- **Ensure** README.md is present; Docker Hub can display it on the repo page
- **Push** changes to GitHub; Docker Hub rebuilds and updates the overview

---

## Example README snippet to paste into Docker Hub

- **Title:** Alpine Dev Container (Node v22.20.0, Python 3.12, PHP 8.3, Composer, Claude Code CLI)
- **Pull:** docker pull nordeim/alpine-dev-claude-dev:latest
- **Run:** docker run -d -p 2222:22 --name claude-dev nordeim/alpine-dev-claude-dev:latest
- **SSH:** ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null devuser@localhost -p 2222
- **What’s inside:** Node 22.20.0, npm/npx, Python 3.12 + pip, PHP 8.3 + extensions, Composer, bash, vim, git, jq, make, g++, build-base, docker-cli, Claude Code CLI, sudo-enabled devuser.

---

https://copilot.microsoft.com/shares/YH9BS5hnrspttEW3nHpa3
