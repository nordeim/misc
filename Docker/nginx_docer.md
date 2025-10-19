# Nginx reverse proxy for forwarding container LAN to physical LAN

You want a clean, production-like reverse proxy that:
- Exposes ports on the physical LAN (host) and forwards requests into the Docker private LAN (172.20.0.0/16).
- Targets your dev app container at 172.20.0.6 on ports 3000, 8000, and 5555.
- Works headlessly on Ubuntu 24.04 with Docker.

Below is a meticulous plan and fully ready-to-use Dockerfile, Compose, and Nginx configs, including validation steps, healthchecks, WebSocket support, and security headers.

---

## Executive summary

- Create an Nginx container that:
  - Publishes host ports 3000, 8000, and 5555.
  - Proxies traffic to 172.20.0.6:3000, :8000, :5555 inside the Docker network.
- Join the Nginx container to the same Docker network as your dev containers (external network mode).
- Provide robust Nginx configs with:
  - Correct proxy headers
  - WebSocket upgrade support
  - Reasonable timeouts for dev
  - Simple healthcheck
  - Optional access logs per service

---

## Detailed plan

### 1) Network validation and setup
- **Identify the Docker network:**  
  - Run `docker network ls` and locate the network that your dev app runs on (commonly `<project>_default`, e.g., `alpine-dev_default`).
- **Confirm IP reachability:**  
  - From the host: you cannot reach 172.20.0.6 directly.  
  - From containers on the same Docker network: they can reach 172.20.0.6.  
- **Compose uses external network:**  
  - We’ll reference the existing network in `docker-compose-nginx.yml` to ensure nginx can reach the app container IP.

### 2) Files to create
- **Dockerfile.nginx**: pins nginx:alpine, adds config, includes healthcheck utility, and runs nginx in foreground.
- **docker-compose-nginx.yml**: defines the nginx service, publishes host ports, attaches to the external Docker network.
- **nginx.conf**: main configuration tuned for reverse proxy behavior, includes upstream definitions for each dev service.

### 3) Security and robustness
- **WebSocket support:** Required for Next.js/Turbopack/Bun dev servers (`Upgrade`/`Connection` headers).
- **Proxy headers:** Pass original host, client IP (via `X-Forwarded-*`) for accurate logging/auth flows.
- **Timeouts:** Generous but not unlimited; suitable for dev.
- **Access logs:** Separate logs per server block for easy analysis.
- **Healthcheck:** Simple `/health` endpoint served by nginx (not the backend app) for container health.

### 4) Validation checkpoints
- **Container health:** Nginx responds to `/health` on each published port.
- **Proxy reachability:** Curl from Windows workstation to Ubuntu host IP on 3000/8000/5555 returns proxied app content.
- **WebSocket behavior:** Dev hot reload works via proxy.
- **Log inspection:** Access/error logs show expected requests.

---

## Implementation

### Dockerfile.nginx
```dockerfile
# Dockerfile.nginx
FROM nginx:1.27-alpine

# Install curl for healthcheck debugging (optional)
RUN apk add --no-cache curl

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Create log directories
RUN mkdir -p /var/log/nginx \
    && touch /var/log/nginx/access_3000.log /var/log/nginx/access_8000.log /var/log/nginx/access_5555.log \
    && touch /var/log/nginx/error.log

# Expose ports (informational; compose will publish)
EXPOSE 3000 8000 5555

# Healthcheck script (optional)
RUN printf '%s\n' 'server { listen 8080; location = /health { return 200 "OK\n"; add_header Content-Type text/plain; } }' > /etc/nginx/conf.d/health.conf

# Default command
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose-nginx.yml
```yaml
version: "3.9"

services:
  reverse-proxy:
    build:
      context: .
      dockerfile: Dockerfile.nginx
    container_name: reverse-proxy
    restart: unless-stopped
    ports:
      # Publish host ports to physical LAN
      - "3000:3000"
      - "8000:8000"
      - "5555:5555"
    healthcheck:
      test: ["CMD-SHELL", "curl -fsS http://127.0.0.1:8080/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      # Attach to the existing network where the app container lives
      - alpine_dev_net

networks:
  alpine_dev_net:
    external: true
    name: alpine-dev_default
```

Notes:
- Replace `name: alpine-dev_default` if your actual network name differs. Validate with `docker network ls`.

### nginx.conf
```nginx
# /etc/nginx/nginx.conf
# Global nginx configuration tuned for reverse proxy

user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;

events {
  worker_connections  1024;
}

http {
  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;

  sendfile        on;
  tcp_nopush      on;
  tcp_nodelay     on;
  keepalive_timeout  65;
  types_hash_max_size 2048;

  # Real IP / forwarded headers (if you later sit behind another proxy)
  # Uncomment & configure if using a load balancer in front:
  # set_real_ip_from  0.0.0.0/0;
  # real_ip_header    X-Forwarded-For;
  # real_ip_recursive on;

  # Logging formats
  log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                  '$status $body_bytes_sent "$http_referer" "$http_user_agent" '
                  '"$http_x_forwarded_for"';
  access_log /var/log/nginx/access.log main;

  # Common proxy settings (include WebSocket support)
  map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
  }

  # Tune proxy buffers/timeouts for dev
  proxy_read_timeout 300s;
  proxy_send_timeout 300s;
  proxy_connect_timeout 15s;

  # Upstreams to internal container IP (dev app)
  upstream app_3000 {
    server 172.20.0.6:3000;
  }
  upstream app_8000 {
    server 172.20.0.6:8000;
  }
  upstream app_5555 {
    server 172.20.0.6:5555;
  }

  # Base server template (reused per port)
  # Note: separate access logs for easier analysis

  server {
    listen 3000;
    server_name _;

    access_log /var/log/nginx/access_3000.log main;

    # If you need CORS for APIs in dev, consider adding headers here
    # add_header Access-Control-Allow-Origin "*" always;

    location / {
      proxy_pass http://app_3000;
      proxy_http_version 1.1;

      # Forwarded headers for app awareness
      proxy_set_header Host              $host;
      proxy_set_header X-Real-IP         $remote_addr;
      proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;

      # WebSocket upgrade
      proxy_set_header Upgrade           $http_upgrade;
      proxy_set_header Connection        $connection_upgrade;
    }
  }

  server {
    listen 8000;
    server_name _;

    access_log /var/log/nginx/access_8000.log main;

    location / {
      proxy_pass http://app_8000;
      proxy_http_version 1.1;

      proxy_set_header Host              $host;
      proxy_set_header X-Real-IP         $remote_addr;
      proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;

      proxy_set_header Upgrade           $http_upgrade;
      proxy_set_header Connection        $connection_upgrade;
    }
  }

  server {
    listen 5555;
    server_name _;

    access_log /var/log/nginx/access_5555.log main;

    location / {
      proxy_pass http://app_5555;
      proxy_http_version 1.1;

      proxy_set_header Host              $host;
      proxy_set_header X-Real-IP         $remote_addr;
      proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;

      proxy_set_header Upgrade           $http_upgrade;
      proxy_set_header Connection        $connection_upgrade;
    }
  }

  # Health endpoint (served locally; not proxied)
  include /etc/nginx/conf.d/health.conf;
}
```

---

## Validation and rollout

### 1) Build and start the proxy
- **Build:**  
  `docker compose -f docker-compose-nginx.yml build`
- **Run:**  
  `docker compose -f docker-compose-nginx.yml up -d`
- **Check network:**  
  `docker network inspect alpine-dev_default` and confirm `reverse-proxy` is attached.

### 2) Health and logs
- **Healthcheck:**  
  `curl http://<ubuntu-host-ip>:3000/health` → `OK`  
  `curl http://<ubuntu-host-ip>:8000/health` → `OK`  
  `curl http://<ubuntu-host-ip>:5555/health` → `OK`
- **Proxy test:**  
  `curl http://<ubuntu-host-ip>:3000/` should return your dev app at 172.20.0.6:3000. Repeat for 8000 and 5555.
- **Logs:**  
  `docker logs reverse-proxy`  
  `docker exec -it reverse-proxy sh -c 'tail -n 100 /var/log/nginx/access_3000.log /var/log/nginx/access_8000.log /var/log/nginx/access_5555.log /var/log/nginx/error.log'`

### 3) WebSocket/hot reload verification
- Open your dev app from the Windows workstation via `http://<ubuntu-host-ip>:3000`.  
- Confirm hot reload and HMR work; if not, check Upgrade/Connection headers and any framework-specific dev server messages.

---

## Notes and options

- **Alternative: name-based routing**  
  If you prefer a single port (e.g., 80) with different server_names or paths, you can map all upstreams under one listener with separate location blocks. I kept direct port mapping for simplicity and transparency.

- **HTTPS in dev**  
  If you need TLS, add `listen 443 ssl;` + certs via `ssl_certificate` and `ssl_certificate_key`, or use `nginx-proxy`/`Caddy` for automated local certs.

- **Dynamic upstreams**  
  If the dev app IP changes, consider targeting the service name (e.g., `alpine-dev-claude-dev-1`) if discoverable, or attach nginx to the same network and use service names if the app is also in Compose. For now, you requested explicit 172.20.0.6 forwarding.

---

## Quick checklist

- **Network:** Identify and use the correct external Docker network name.  
- **Config correctness:** Upstreams point to 172.20.0.6 and ports 3000/8000/5555.  
- **WebSocket:** Upgrade headers present.  
- **Health:** `/health` OK on all published ports.  
- **Validation:** Requests from Windows workstation to Ubuntu host IP reach dev app through proxy.

---

https://copilot.microsoft.com/shares/UWThX8J8QUnbNUbhbnVax
