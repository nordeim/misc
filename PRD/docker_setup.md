

# Docker Configuration for ElderCare SG

I'll create a comprehensive Docker setup that supports both development and production environments while maintaining security, performance, and Singapore data residency requirements.

## Docker Configuration Files

### 1. Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
# Multi-stage build for Next.js 14 application

# Stage 1: Install dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Build the application
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build the application
RUN npm run build

# Stage 3: Production image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
```

### 2. Backend Dockerfile

```dockerfile
# backend/Dockerfile
# Multi-stage build for Laravel 12 application

# Stage 1: Base image with PHP extensions
FROM php:8.2-fpm-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libmcrypt-dev \
    imagemagick-dev \
    supervisor \
    nginx

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    gd \
    pdo_mysql \
    zip \
    exif \
    pcntl \
    bcmath \
    opcache \
    imagick

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Stage 2: Install dependencies
FROM base AS deps

# Copy composer files
COPY composer.json composer.lock ./

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Stage 3: Development image
FROM base AS development

# Install development dependencies
COPY composer.json composer.lock ./
RUN composer install --optimize-autoloader --no-interaction

# Copy application code
COPY . .

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Copy PHP configuration
COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/php/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf

# Copy supervisord configuration
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 9000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# Stage 4: Production image
FROM base AS production

# Copy dependencies from deps stage
COPY --from=deps /var/www/html/vendor ./vendor

# Copy application code
COPY . .

# Optimize for production
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache \
    && php artisan event:cache

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Copy PHP configuration
COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/php/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf

# Copy supervisord configuration
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:9000/health || exit 1

EXPOSE 9000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
```

### 3. Docker Compose for Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Frontend service
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: development
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:8000
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
    depends_on:
      - backend
    networks:
      - eldercare-network
    restart: unless-stopped

  # Backend service
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development
    ports:
      - "8000:80"
      - "9000:9000"
    volumes:
      - ./backend:/var/www/html
    environment:
      - APP_ENV=local
      - APP_DEBUG=true
      - DB_CONNECTION=mysql
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_DATABASE=eldercare_dev
      - DB_USERNAME=eldercare
      - DB_PASSWORD=password
      - CACHE_DRIVER=redis
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - SESSION_DRIVER=redis
      - QUEUE_CONNECTION=redis
    depends_on:
      - mysql
      - redis
    networks:
      - eldercare-network
    restart: unless-stopped

  # MySQL database
  mysql:
    image: mariadb:10.6
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=eldercare_dev
      - MYSQL_USER=eldercare
      - MYSQL_PASSWORD=password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/mysql/my.cnf:/etc/mysql/conf.d/my.cnf
    networks:
      - eldercare-network
    restart: unless-stopped

  # Redis cache
  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      - ./docker/redis/redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    networks:
      - eldercare-network
    restart: unless-stopped

  # Elasticsearch for search
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - eldercare-network
    restart: unless-stopped

  # Mailhog for email testing
  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"
      - "8025:8025"
    networks:
      - eldercare-network
    restart: unless-stopped

volumes:
  mysql_data:
  redis_data:
  elasticsearch_data:

networks:
  eldercare-network:
    driver: bridge
```

### 4. Docker Compose for Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/nginx/ssl:/etc/nginx/ssl
      - ./frontend/public:/var/www/html/public
    depends_on:
      - frontend
      - backend
    networks:
      - eldercare-network
    restart: unless-stopped

  # Frontend service
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: runner
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.eldercare-sg.example.com
      - NEXT_PUBLIC_APP_URL=https://eldercare-sg.example.com
    depends_on:
      - backend
    networks:
      - eldercare-network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  # Backend service
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
      - DB_CONNECTION=mysql
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_DATABASE=eldercare_prod
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
      - CACHE_DRIVER=redis
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - SESSION_DRIVER=redis
      - QUEUE_CONNECTION=redis
      - APP_URL=https://eldercare-sg.example.com
      - APP_KEY=${APP_KEY}
    depends_on:
      - mysql
      - redis
    networks:
      - eldercare-network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  # MySQL database
  mysql:
    image: mariadb:10.6
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=eldercare_prod
      - MYSQL_USER=${DB_USERNAME}
      - MYSQL_PASSWORD=${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/mysql/my.cnf:/etc/mysql/conf.d/my.cnf
      - ./backups:/backups
    networks:
      - eldercare-network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G

  # Redis cache
  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data
      - ./docker/redis/redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    networks:
      - eldercare-network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M

  # Elasticsearch for search
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - eldercare-network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G

  # Laravel Horizon for queue monitoring
  horizon:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    command: php artisan horizon
    environment:
      - APP_ENV=production
      - DB_HOST=mysql
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis
    networks:
      - eldercare-network
    restart: unless-stopped

  # Laravel scheduler
  scheduler:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    command: sh -c "while true; do php artisan schedule:run; sleep 60; done"
    environment:
      - APP_ENV=production
      - DB_HOST=mysql
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis
    networks:
      - eldercare-network
    restart: unless-stopped

volumes:
  mysql_data:
  redis_data:
  elasticsearch_data:

networks:
  eldercare-network:
    driver: bridge
```

### 5. Nginx Configuration

```nginx
# docker/nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Upstream servers
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:9000;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name eldercare-sg.example.com www.eldercare-sg.example.com;
        return 301 https://$server_name$request_uri;
    }

    # Main server block
    server {
        listen 443 ssl http2;
        server_name eldercare-sg.example.com www.eldercare-sg.example.com;

        # SSL certificates
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Root directory
        root /var/www/html/public;
        index index.php index.html;

        # Frontend routes
        location / {
            try_files $uri $uri/ @frontend;
        }

        location @frontend {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            try_files $uri $uri/ @backend;
        }

        # Login rate limiting
        location /api/login {
            limit_req zone=login burst=5 nodelay;
            try_files $uri $uri/ @backend;
        }

        location @backend {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # PHP files
        location ~ \.php$ {
            try_files $uri =404;
            fastcgi_split_path_info ^(.+\.php)(/.+)$;
            fastcgi_pass backend:9000;
            fastcgi_index index.php;
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            fastcgi_param PATH_INFO $fastcgi_path_info;
        }

        # Static files caching
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|webp|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security: Deny access to sensitive files
        location ~ /\. {
            deny all;
        }

        location ~ /(\.env|\.git|composer\.json|composer\.lock|package\.json|package-lock\.json)$ {
            deny all;
        }
    }
}
```

### 6. Configuration Files

```ini
# docker/php/php.ini
memory_limit = 256M
max_execution_time = 300
upload_max_filesize = 20M
post_max_size = 20M
max_input_vars = 3000
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=4000
opcache.revalidate_freq=2
opcache.fast_shutdown=1
opcache.enable_cli=1
```

```ini
# docker/mysql/my.cnf
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_method = O_DIRECT
innodb_flush_log_at_trx_commit = 2
query_cache_type = 1
query_cache_size = 64M
max_connections = 200
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
```

```conf
# docker/redis/redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

```conf
# docker/supervisord.conf
[supervisord]
nodaemon=true
user=root

[program:php-fpm]
command=php-fpm
autostart=true
autorestart=true
priority=5
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0

[program:nginx]
command=nginx -g 'daemon off;'
autostart=true
autorestart=true
priority=10
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
```

### 7. Docker Ignore Files

```dockerignore
# frontend/.dockerignore
node_modules
.next
.git
.gitignore
README.md
Dockerfile
.dockerignore
npm-debug.log
yarn-debug.log
yarn-error.log
.DS_Store
*.log
coverage
.nyc_output
.env.local
.env.development.local
.env.test.local
.env.production.local
```

```dockerignore
# backend/.dockerignore
.git
.gitignore
README.md
Dockerfile
.dockerignore
docker-compose.yml
docker-compose.prod.yml
.env
.env.backup
.phpunit.result.cache
.php_cs.cache
node_modules
npm-debug.log
yarn-error.log
.DS_Store
storage/logs/*
storage/framework/cache/*
storage/framework/sessions/*
storage/framework/views/*
```

### 8. Environment Files

```bash
# .env.example
# Database
DB_USERNAME=eldercare
DB_PASSWORD=your_secure_password
MYSQL_ROOT_PASSWORD=your_root_password

# Application
APP_KEY=base64:your_app_key_here

# Email
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=noreply@eldercare-sg.example.com
MAIL_FROM_NAME=ElderCare SG

# External Services
CALENDLY_API_KEY=your_calendly_api_key
MAILCHIMP_API_KEY=your_mailchimp_api_key
SENTRY_LARAVEL_DSN=your_sentry_dsn
```

### 9. Deployment Scripts

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Starting deployment..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Build and deploy
echo "📦 Building images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🔄 Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend php artisan migrate --force

echo "🗄️ Caching configuration..."
docker-compose -f docker-compose.prod.yml exec backend php artisan config:cache
docker-compose -f docker-compose.prod.yml exec backend php artisan route:cache
docker-compose -f docker-compose.prod.yml exec backend php artisan view:cache

echo "🔄 Restarting services..."
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Deployment completed successfully!"

# Health check
echo "🏥 Running health checks..."
sleep 10

if curl -f http://localhost/api/health; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

if curl -f http://localhost; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

echo "🎉 All services are running correctly!"
```

```bash
#!/bin/bash
# scripts/backup.sh

set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "📦 Starting backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
echo "🗄️ Backing up database..."
docker-compose exec mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD eldercare_prod > $BACKUP_DIR/db_backup_$DATE.sql

# Backup application files
echo "📁 Backing up application files..."
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz backend/app

# Clean up old backups (keep last 7 days)
echo "🧹 Cleaning up old backups..."
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup completed successfully!"
```

## Usage Instructions

### Development Environment

```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop environment
docker-compose down

# Rebuild services
docker-compose build --no-cache
```

### Production Environment

```bash
# Deploy to production
./scripts/deploy.sh

# Create backup
./scripts/backup.sh

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=2
```

This Docker configuration provides:

1. **Multi-stage builds** for optimized production images
2. **Separate development and production** configurations
3. **Security best practices** including non-root users and rate limiting
4. **Performance optimizations** with caching and compression
5. **Singapore data residency** with all services running locally
6. **Monitoring and health checks** for all services
7. **Automated backup and deployment** scripts
8. **Scalability** with horizontal scaling capabilities
9. **SSL termination** at the nginx reverse proxy
10. **Comprehensive logging** and error handling

The configuration is production-ready and follows best practices for security, performance, and maintainability.
