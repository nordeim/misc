# https://business.gemini.google/home/cid/61d46f46-4a8f-4a34-bee7-4ccc51dae0e1/r/share/a6dfd9bc-cdf7-4c85-9f92-5c4997f12ce3?csesidx=850711315&mods=

$ cat docker-compose.yml 

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

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: morning-brew-backend
    ports:
      - "8000:8000"
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
      - FRONTEND_URL=http://frontend:3000
    volumes:
      - ./backend:/var/www/html
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
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    depends_on:
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
pete@pop-os:/home/project/authentic-kopitiam
$ cat docker-compose.override.yml 

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
      - XDEBUG_CONFIG=client_host=host.docker.internal
    volumes:
      - ./backend/storage/logs:/var/www/html/storage/logs
      - ./backend/storage/app:/var/www/html/storage/app

  frontend:
    environment:
      - NEXT_PUBLIC_DEBUG=true
      - NEXT_PUBLIC_ANALYTICS=false
    volumes:
      - ./frontend/.next:/app/.next
pete@pop-os:/home/project/authentic-kopitiam
$ cat backend/Dockerfile.dev
FROM php:8.4-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    postgresql-dev \
    icu-dev \
    linux-headers \
    $PHPIZE_DEPS

# Install PHP extensions (core extensions only)
RUN docker-php-ext-install pgsql pdo_pgsql bcmath intl opcache pdo pcntl

# Install Redis extension via PECL
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files first for better caching
COPY composer.json composer.lock ./

# Install dependencies
RUN composer install --no-scripts --no-autoloader --prefer-dist --optimize-autoloader

# Generate autoloader
RUN composer dump-autoload --optimize

# Copy application code
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p storage/framework/{sessions,views,cache} \
    && mkdir -p storage/logs \
    && mkdir -p bootstrap/cache \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html \
    && chmod -R 775 storage bootstrap/cache

# Expose port
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm"]
pete@pop-os:/home/project/authentic-kopitiam
$ cat frontend/Dockerfile.dev
FROM node:22-alpine

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies based on lock file
COPY package.json package-lock.json* ./
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Development command
CMD ["npm", "run", "dev"]
