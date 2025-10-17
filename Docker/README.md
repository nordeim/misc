# Alpine Dev Container with Claude Code CLI

A lightweight, SSH-accessible Alpine-based development environment for **Node.js v22.20.0**, **Python 3.12**, and **PHP 8.3**, bundled with Composer, Claude Code CLI, and common developer tools.  
Designed for reproducibility, local development, and WSL/Windows integration.

---

## ✨ Features

- **Base:** `node:22.20-alpine3.22` (musl-compatible Node v22.20.0)
- **Languages & Tools:**
  - Node.js v22.20.0, npm, npx
  - Python 3.12 + pip
  - PHP 8.3 + common extensions
  - Composer
  - Claude Code CLI (`claude`)
- **Utilities:**
  - bash, vim, curl, wget, jq
  - git, make, g++, build-base
  - docker-cli
- **User & Access:**
  - Non-root user: `devuser`
  - Default password: `devpass`
  - Passwordless `sudo`
  - SSH server enabled on port 22 (mapped to host port 2222)
- **Persistence:**
  - Named volume for `/home/devuser`

---

## 🚀 Quick Start

### Pull the image
```bash
docker pull nordeim/alpine-dev-claude-dev:latest
```

### Run the container
```bash
docker run -d -p 2222:22 --name claude-dev nordeim/alpine-dev-claude-dev:latest
```

### SSH into the container
```bash
ssh -o PreferredAuthentications=password \
    -o PubkeyAuthentication=no \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    devuser@localhost -p 2222
```

- **Username:** `devuser`  
- **Password:** `devpass`

---

## 🧪 Verify Installed Tools

```bash
node -v        # v22.20.0
npm -v         # 10.x
python3 --version
php -v
composer --version
claude --help
```

---

## 🛠️ Development Workflows

- **Install global npm packages:**
  ```bash
  sudo npm install -g pnpm
  sudo npm install -g bun
  ```
- **Python virtual environments:**
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  pip install requests flask
  ```
- **PHP Composer:**
  ```bash
  composer init
  composer require vendor/package
  ```
- **Claude Code CLI:**
  ```bash
  claude login
  claude <subcommand>
  ```

---

## 🔐 Hardening Options

### 1. Key-Based SSH Authentication
- Generate a keypair on your host:
  ```bash
  ssh-keygen -t ed25519 -C "devuser@alpine-dev"
  ```
- Copy your public key into the container:
  ```bash
  mkdir -p /home/devuser/.ssh
  echo "<your-public-key>" >> /home/devuser/.ssh/authorized_keys
  chmod 600 /home/devuser/.ssh/authorized_keys
  chown -R devuser:devuser /home/devuser/.ssh
  ```
- Update `/etc/ssh/sshd_config`:
  ```
  PasswordAuthentication no
  PubkeyAuthentication yes
  ```
- Restart sshd:
  ```bash
  sudo service sshd restart
  ```

### 2. UID/GID Alignment for Bind Mounts
To avoid permission mismatches when mounting host directories:
- Create `devuser` with the same UID/GID as your host user:
  ```dockerfile
  ARG HOST_UID=1000
  ARG HOST_GID=1000
  RUN addgroup -g $HOST_GID devgroup && \
      adduser -D -u $HOST_UID -G devgroup -s /bin/bash devuser
  ```
- Build with:
  ```bash
  docker build --build-arg HOST_UID=$(id -u) --build-arg HOST_GID=$(id -g) -t alpine-dev-claude-dev .
  ```

### 3. Production-Oriented Security Profile
- Disable password login (`PasswordAuthentication no`)
- Remove `NOPASSWD` sudo; require password or restrict commands
- Limit exposed ports (bind SSH to localhost only)
- Use minimal volumes and mount only what’s needed
- Regularly update base image and rebuild

---

## 📂 Docker Configs (for customization)

### Dockerfile
```Dockerfile
FROM node:22.20-alpine3.22

RUN apk update && apk add --no-cache \
    bash libstdc++ openssh wget curl git vim shadow jq make g++ build-base docker-cli ca-certificates \
    python3 py3-pip \
    php83 php83-cli php83-mbstring php83-openssl php83-json php83-phar php83-dom php83-tokenizer php83-xml php83-curl \
    sudo && \
    echo "devuser ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

RUN useradd -m -s /bin/bash devuser && \
    echo "devuser:devpass" | chpasswd

RUN curl -sS https://getcomposer.org/installer | php83 -- --install-dir=/usr/local/bin --filename=composer

RUN npm install -g @anthropic-ai/claude-code

RUN ssh-keygen -A && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

RUN chown -R devuser:devuser /home/devuser

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D"]
```

### docker-compose.yml
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

## 🔄 Build & Push Workflow

### Build locally
```bash
docker compose build --no-cache
docker compose up -d
```

### Tag and push to Docker Hub
```bash
docker tag alpine-dev-claude-dev:latest nordeim/alpine-dev-claude-dev:latest
docker push nordeim/alpine-dev-claude-dev:latest
```

### List local images
```bash
docker images
```

---

## 📖 Deploying README on Docker Hub

1. Log in to [Docker Hub](https://hub.docker.com/).
2. Navigate to your repository: `nordeim/alpine-dev-claude-dev`.
3. Go to the **Overview** tab.
4. Paste this README content and save.

---

## ⚠️ Security Notes

- Default credentials (`devuser/devpass`) are for development only.  
- For production-like use:
  - Switch to key-based SSH
  - Disable password login
  - Restrict sudo privileges
  - Bind SSH to localhost or VPN only
- Always rebuild regularly to pull in upstream security patches.

---

https://copilot.microsoft.com/shares/7QgPydwJ9N1eb6fubUfvg
