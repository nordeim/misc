Okay, I have meticulously reviewed your existing Docker Compose setup and your requirements for transitioning to Debian Trixie-based images for your backend and frontend services.

The main changes involve:
*   **Backend (Laravel 12 API):** Switching from `php:8.4-fpm-alpine` to `php:8.4-fpm-trixie`. This also necessitates adding an Nginx service to serve the Laravel application and proxy requests to PHP-FPM.
*   **Frontend (React 19, Tailwind CSS v4, Next.js 15):** Switching from `node:22-alpine` to `node:24-trixie`.
*   Updating `docker-compose.yml` to incorporate the new Nginx service and adjust the backend/frontend configurations.
*   Ensuring the build processes within the Dockerfiles are adapted for Debian's `apt-get` package manager instead of Alpine's `apk`.
*   Maintaining the existing `docker-compose.override.yml` functionality.

Here is the complete fully working replacement set of Docker Compose files and Dockerfiles, along with the new Nginx configuration.

---

### 📦 Project Structure

First, ensure your project structure accommodates the new Nginx configuration file:

```
.
├── docker-compose.yml
├── docker-compose.override.yml
├── backend/
│   ├── Dockerfile.dev
│   ├── composer.json
│   ├── composer.lock
│   ├── storage/
│   │   ├── logs/
│   │   └── app/
│   └── (other Laravel files)
├── frontend/
│   ├── Dockerfile.dev
│   ├── package.json
│   ├── package-lock.json
│   ├── .next/
│   └── (other React/Next.js files)
└── infra/
    ├── postgres/
    │   └── init.sql
    └── nginx/
        └── default.conf  # <--- NEW FILE: Nginx configuration
```

---

### 📝 `backend/Dockerfile.dev` (Laravel PHP-FPM)

This Dockerfile uses `php:8.4-fpm-trixie` as its base, installs necessary system dependencies using `apt-get`, and then configures PHP extensions and Composer for your Laravel application.

```dockerfile
# Start with the official PHP 8.4 Trixie FPM image
FROM php:8.4-fpm-trixie

# Install system dependencies
# Use apt-get for Debian-based images
# build-essential is useful for compiling extensions if needed
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev \
    libicu-dev \
    build-essential \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
# The docker-php-ext-install utility is available on official PHP images
RUN docker-php-ext-install -j$(nproc) pgsql pdo_pgsql bcmath intl opcache pdo pcntl

# Install Redis extension via PECL
# $PHPIZE_DEPS are often needed for pecl extensions compilation
RUN apt-get update && apt-get install -y $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge -y $PHPIZE_DEPS # Remove build dependencies to keep image size small

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory inside the container
WORKDIR /var/www/html

# Copy composer files first for better caching and faster builds
COPY composer.json composer.lock ./

# Install Composer dependencies
RUN composer install --no-scripts --no-autoloader --prefer-dist --optimize-autoloader

# Generate autoloader
RUN composer dump-autoload --optimize

# Copy application code into the container
COPY . .

# Create necessary directories with proper permissions for Laravel
# www-data is the default user for php-fpm in Debian-based images
RUN mkdir -p storage/framework/{sessions,views,cache} \
    && mkdir -p storage/logs \
    && mkdir -p bootstrap/cache \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html \
    && chmod -R 775 storage bootstrap/cache

# Expose PHP-FPM port (default is 9000)
EXPOSE 9000

# The default entrypoint for php-fpm images will start php-fpm
# No explicit CMD needed unless you want to override it.
```

---

### 📝 `frontend/Dockerfile.dev` (Next.js Node.js)

This Dockerfile uses `node:24-trixie` as its base and sets up your Next.js frontend application.

```dockerfile
# Start with the official Node.js 24 Trixie image
FROM node:24-trixie

# No need for libc6-compat as Debian-based images (Trixie) have glibc by default.

# Set working directory inside the container
WORKDIR /app

# Copy package.json and lock files first for efficient caching
COPY package.json package-lock.json* ./

# Install Node.js dependencies
RUN npm ci

# Copy the rest of your application code
COPY . .

# Expose the port where the Next.js development server will run
EXPOSE 3000

# Command to start the Next.js development server
CMD ["npm", "run", "dev"]
```

---

### 📝 `infra/nginx/default.conf` (Nginx Configuration)

This is a new file that defines how Nginx will serve your Laravel backend, passing PHP requests to the `backend` PHP-FPM service. Create this file in the `infra/nginx/` directory.

```nginx
server {
    listen 80; # Nginx listens on port 80
    server_name localhost;
    root /var/www/html/public; # Point to Laravel's public directory for serving assets

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    index index.php index.html index.htm;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    # Pass PHP requests to the backend PHP-FPM service
    location ~ \.php$ {
        fastcgi_pass backend:9000; # 'backend' is the service name, 9000 is FPM port
        fastcgi_index index.php;
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

---

### 📝 `docker-compose.yml` (Updated)

This updated `docker-compose.yml` includes the new `nginx` service and adjusts the `backend` and `frontend` services accordingly.

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: morning-brew-postgres
    environment:
      POSTGRES_DB: morning_brew
      POSTGRES_USER: brew_user
      POSTGRES_PASSWORD: ${DB_PASSWORD:-brew_secret}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infra/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U brew_user -d morning_brew"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - morning-brew-network

  redis:
    image: redis:7-alpine
    container_name: morning-brew-redis
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - morning-brew-network

  # NEW SERVICE: Nginx acts as the web server for the Laravel backend
  nginx:
    image: nginx:stable-bookworm # Using a stable Debian-based Nginx image
    container_name: morning-brew-nginx
    ports:
      - "80:80" # Expose HTTP port to the host
    volumes:
      - ./infra/nginx/default.conf:/etc/nginx/conf.d/default.conf # Mount custom Nginx config
      - ./backend:/var/www/html # Mount backend code for Nginx to serve static assets
    depends_on:
      - backend # Nginx depends on the PHP-FPM backend service being available
    networks:
      - morning-brew-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: morning-brew-backend
    # PHP-FPM listens internally on port 9000, Nginx will proxy to it.
    # We no longer expose port 8000 from the backend service to the host.
    # ports: # Removed
    #   - "8000:8000"
    environment:
      - APP_ENV=local
      - DB_CONNECTION=pgsql
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_DATABASE=morning_brew
      - DB_USERNAME=brew_user
      - DB_PASSWORD=${DB_PASSWORD:-brew_secret}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - CACHE_DRIVER=redis
      - QUEUE_CONNECTION=redis
      - SESSION_DRIVER=redis
      - FRONTEND_URL=http://frontend:3000 # Still refers to the frontend service internally
    volumes:
      - ./backend:/var/www/html # Mount backend code for PHP-FPM processes
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - morning-brew-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: morning-brew-frontend
    ports:
      - "3000:3000" # Frontend still exposes its development server to the host
    environment:
      - NODE_ENV=development
      # Frontend API URL now points to the Nginx service (which is on port 80)
      # Use 'nginx' as the hostname for inter-container communication
      - NEXT_PUBLIC_API_URL=http://nginx/api
    volumes:
      - ./frontend:/app
      - /app/node_modules # Anonymous volume for node_modules cache
      - /app/.next        # Anonymous volume for Next.js build artifacts cache
    depends_on:
      # Frontend implicitly depends on backend via Nginx,
      # but keeping this ensures the backend (and thus Nginx) starts first.
      - backend
    networks:
      - morning-brew-network

  mailpit:
    image: axllent/mailpit
    container_name: morning-brew-mailpit
    ports:
      - "1025:1025"
      - "8025:8025"
    networks:
      - morning-brew-network

volumes:
  postgres_data:
  redis_data:

networks:
  morning-brew-network:
    driver: bridge
```

---

### 📝 `docker-compose.override.yml` (Unchanged)

Your `docker-compose.override.yml` can remain largely the same, as the volume paths and environment variables for Xdebug and Next.js debugging are relative to the container's `WORKDIR` or established bind mounts, which have not changed.

```yaml
services:
  postgres:
    command: postgres
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  redis:
    command: redis-server --appendonly yes --loglevel debug

  backend:
    environment:
      - XDEBUG_MODE=develop,coverage
      - XDEBUG_CONFIG=client_host=host.docker.internal # 'host.docker.internal' is typically resolved to the Docker host's IP for Xdebug
    volumes:
      # These bind mounts ensure logs and app storage persist on the host filesystem
      - ./backend/storage/logs:/var/www/html/storage/logs
      - ./backend/storage/app:/var/www/html/storage/app

  frontend:
    environment:
      - NEXT_PUBLIC_DEBUG=true
      - NEXT_PUBLIC_ANALYTICS=false
    volumes:
      # This bind mount ensures .next build artifacts persist on the host
      - ./frontend/.next:/app/.next
```

---

### ✨ To Get Started

1.  **Create the new Nginx config file:** `infra/nginx/default.conf` with the content provided above.
2.  **Update your Dockerfiles:** Replace the content of `backend/Dockerfile.dev` and `frontend/Dockerfile.dev` with the new content.
3.  **Update your `docker-compose.yml`:** Replace its content with the new version.
4.  **Ensure `docker-compose.override.yml` is present** (and its content if you have any changes).
5.  **Build and run your services:**
    ```bash
    docker-compose down # Optional, but good for a clean start with major changes
    docker-compose up --build -d
    ```

You should now have your Laravel backend served by Nginx (accessible on `http://localhost:80`) and your Next.js frontend running (accessible on `http://localhost:3000`), both using Debian Trixie-based images.
