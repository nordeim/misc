# Comprehensive Enterprise Application Architecture: Python Backend + Next.js Frontend

## Table of Contents
1. [Understanding REST API Architecture](#understanding-rest-api-architecture)
2. [Enterprise Application Architecture Overview](#enterprise-application-architecture-overview)
3. [Backend Architecture (Python)](#backend-architecture-python)
4. [Frontend Architecture (Next.js)](#frontend-architecture-nextjs)
5. [Database Design & Optimization](#database-design--optimization)
6. [Caching Strategy](#caching-strategy)
7. [Message Queue & Background Tasks](#message-queue--background-tasks)
8. [Security Architecture](#security-architecture)
9. [Testing Strategy](#testing-strategy)
10. [Performance Optimization](#performance-optimization)
11. [Monitoring & Observability](#monitoring--observability)
12. [CI/CD Pipeline](#cicd-pipeline)
13. [Development Environment Setup Guide](#development-environment-setup-guide)

## Understanding REST API Architecture

REST (Representational State Transfer) is an architectural paradigm that has become the de facto standard for building web services. Understanding its principles is crucial for designing scalable and maintainable APIs.

### Core REST Principles Deep Dive

**1. Client-Server Architecture**
The fundamental principle separates user interface concerns from data storage concerns. This separation allows both components to evolve independently, improving scalability and simplifying the components.

**2. Statelessness**
Each request from client to server must contain all the information needed to understand and process the request. The server should not store any client context between requests. This principle ensures:
- Better scalability (any server can handle any request)
- Improved reliability (no session state to lose)
- Simplified server design

**3. Cacheability**
REST APIs must define whether responses are cacheable or not. Proper caching can:
- Reduce server load
- Improve response times
- Decrease bandwidth usage

**4. Uniform Interface**
This constraint simplifies and decouples the architecture, enabling each part to evolve independently. The four interface constraints are:
- Resource identification (URIs)
- Resource manipulation through representations
- Self-descriptive messages
- Hypermedia as the engine of application state (HATEOAS)

**5. Layered System**
The architecture should be composed of hierarchical layers, each layer only knowing about the layer directly beneath it. This allows for:
- Load balancing
- Shared caches
- Security policies at different layers

### Advanced REST API Design Patterns

#### 1. Resource Naming Conventions
```
# Good - Resource-based URLs
GET    /api/v1/users              # Get all users
GET    /api/v1/users/123          # Get specific user
POST   /api/v1/users              # Create new user
PUT    /api/v1/users/123          # Update entire user
PATCH  /api/v1/users/123          # Partial update
DELETE /api/v1/users/123          # Delete user

# Nested Resources
GET    /api/v1/users/123/orders   # Get user's orders
POST   /api/v1/users/123/orders   # Create order for user
```

#### 2. Query Parameters for Filtering, Sorting, and Pagination
```
# Filtering
GET /api/v1/products?category=electronics&price_min=100&price_max=500

# Sorting
GET /api/v1/products?sort=price&order=desc

# Pagination
GET /api/v1/products?page=2&limit=20

# Combined
GET /api/v1/products?category=electronics&sort=price&order=asc&page=1&limit=10
```

#### 3. API Versioning Strategies
- **URI Versioning**: `/api/v1/resource`
- **Header Versioning**: `Accept: application/vnd.myapp.v1+json`
- **Query Parameter**: `/api/resource?version=1`

#### 4. HATEOAS Implementation
```json
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "_links": {
    "self": { "href": "/api/v1/users/123" },
    "orders": { "href": "/api/v1/users/123/orders" },
    "update": { "href": "/api/v1/users/123", "method": "PUT" },
    "delete": { "href": "/api/v1/users/123", "method": "DELETE" }
  }
}
```

## Enterprise Application Architecture Overview

### Comprehensive System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                                   CDN (CloudFlare)                              │
└────────────────────────────────────────────────────────────────────────────────┘
                                          │
┌────────────────────────────────────────────────────────────────────────────────┐
│                            Load Balancer (Nginx/HAProxy)                        │
└────────────────────────────────────────────────────────────────────────────────┘
                                          │
        ┌─────────────────────────────────┴─────────────────────────────────┐
        │                                                                     │
┌───────▼────────────┐                                          ┌────────────▼────────────┐
│   Next.js App      │                                          │    Python API           │
│   (Frontend)       │◄──────────── HTTPS/WSS ─────────────────►│    (Backend)            │
│   - SSR/SSG        │                                          │    - FastAPI            │
│   - React 18       │                                          │    - Async              │
│   - TypeScript     │                                          │    - WebSockets         │
└────────────────────┘                                          └─────────────────────────┘
                                                                              │
                                    ┌─────────────────────────────────────────┼─────────────────────────────────────┐
                                    │                                         │                                     │
                            ┌───────▼────────────┐                   ┌────────▼────────────┐             ┌──────────▼────────────┐
                            │   PostgreSQL       │                   │      Redis          │             │   RabbitMQ/Celery     │
                            │   (Primary DB)     │                   │   (Cache/Sessions)  │             │   (Message Queue)     │
                            │   - Replication    │                   │   - Pub/Sub         │             │   - Task Processing   │
                            │   - Partitioning   │                   │   - Rate Limiting   │             │   - Event Streaming   │
                            └────────────────────┘                   └─────────────────────┘             └───────────────────────┘
                                    │                                                                                 │
                            ┌───────▼────────────┐                                                         ┌──────────▼────────────┐
                            │   Read Replicas    │                                                         │   Worker Nodes        │
                            │   (PostgreSQL)     │                                                         │   (Celery Workers)    │
                            └────────────────────┘                                                         └───────────────────────┘
```

### Microservices-Ready Architecture

While starting as a monolith, the architecture is designed to easily transition to microservices:

```
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway (Kong/Traefik)              │
└─────────────────────────────────────────────────────────────┘
                                  │
        ┌────────────┬────────────┼────────────┬────────────┐
        │            │            │            │            │
┌───────▼───────┐ ┌──▼────────┐ ┌▼──────────┐ ┌▼──────────┐ ┌▼──────────┐
│ Auth Service  │ │User Service│ │Product    │ │Order      │ │Notification│
│               │ │            │ │Service    │ │Service    │ │Service     │
└───────────────┘ └────────────┘ └───────────┘ └───────────┘ └────────────┘
```

## Backend Architecture (Python)

### Advanced Technology Stack

**Core Framework**: FastAPI with Extensions
```python
# Enhanced dependencies
fastapi==0.104.1
uvicorn[standard]==0.24.0          # Includes uvloop for better performance
gunicorn==21.2.0                   # Production WSGI server
pydantic==2.5.0
pydantic-settings==2.1.0           # Settings management
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
fastapi-limiter==0.1.5             # Rate limiting
fastapi-pagination==0.12.13        # Pagination support
fastapi-cache2==0.2.1              # Caching decorator

# Database & ORM
sqlalchemy==2.0.23
alembic==1.12.1
asyncpg==0.29.0                    # PostgreSQL async driver
databases==0.8.0                   # Async database support

# Caching & Message Queue
redis==5.0.1
hiredis==2.2.3                     # C parser for redis (performance)
celery[redis]==5.3.4
flower==2.0.1
kombu==5.3.4                       # Message transport

# Observability
opentelemetry-api==1.21.0
opentelemetry-sdk==1.21.0
opentelemetry-instrumentation-fastapi==0.42b0
prometheus-client==0.19.0
sentry-sdk[fastapi]==1.38.0
structlog==23.2.0                  # Structured logging

# Development & Testing
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
pytest-env==1.1.3
factory-boy==3.3.0                 # Test data factories
httpx==0.25.2
black==23.11.0                     # Code formatting
ruff==0.1.6                        # Fast Python linter
mypy==1.7.1                        # Type checking
pre-commit==3.5.0                  # Git hooks
```

### Enhanced Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app initialization
│   ├── config.py                  # Configuration management
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── auth/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py     # Auth endpoints
│   │   │   │   ├── schemas.py    # Auth DTOs
│   │   │   │   └── dependencies.py
│   │   │   ├── users/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py
│   │   │   │   ├── schemas.py
│   │   │   │   └── dependencies.py
│   │   │   └── router.py          # V1 router aggregation
│   │   ├── middleware/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py            # Auth middleware
│   │   │   ├── cors.py
│   │   │   ├── logging.py
│   │   │   ├── rate_limit.py
│   │   │   └── request_id.py     # Request tracking
│   │   └── dependencies.py        # Global dependencies
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py            # Security utilities
│   │   ├── database.py            # Database configuration
│   │   ├── cache.py               # Redis configuration
│   │   ├── celery_app.py          # Celery configuration
│   │   ├── logging.py             # Logging configuration
│   │   └── exceptions.py          # Global exceptions
│   ├── domain/                    # Domain layer (DDD)
│   │   ├── __init__.py
│   │   ├── entities/
│   │   │   ├── __init__.py
│   │   │   ├── user.py            # User entity
│   │   │   └── base.py            # Base entity
│   │   ├── value_objects/
│   │   │   ├── __init__.py
│   │   │   └── email.py           # Email value object
│   │   └── events/
│   │       ├── __init__.py
│   │       └── user_events.py     # Domain events
│   ├── infrastructure/
│   │   ├── __init__.py
│   │   ├── persistence/
│   │   │   ├── __init__.py
│   │   │   ├── models/            # SQLAlchemy models
│   │   │   │   ├── __init__.py
│   │   │   │   ├── user.py
│   │   │   │   └── base.py
│   │   │   └── repositories/      # Repository implementations
│   │   │       ├── __init__.py
│   │   │       ├── user.py
│   │   │       └── base.py
│   │   ├── cache/
│   │   │   ├── __init__.py
│   │   │   └── redis_cache.py
│   │   └── messaging/
│   │       ├── __init__.py
│   │       └── event_bus.py       # Event publishing
│   ├── application/               # Application layer
│   │   ├── __init__.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   └── user_service.py
│   │   ├── use_cases/             # Use case implementations
│   │   │   ├── __init__.py
│   │   │   └── user/
│   │   │       ├── __init__.py
│   │   │       ├── create_user.py
│   │   │       └── authenticate.py
│   │   └── dto/                   # Data Transfer Objects
│   │       ├── __init__.py
│   │       └── user_dto.py
│   ├── presentation/              # Presentation utilities
│   │   ├── __init__.py
│   │   └── serializers.py
│   └── utils/
│       ├── __init__.py
│       ├── pagination.py
│       ├── validators.py
│       └── datetime.py
├── migrations/                    # Alembic migrations
├── tests/
│   ├── __init__.py
│   ├── conftest.py                # Pytest configuration
│   ├── factories/                 # Test data factories
│   ├── unit/                      # Unit tests
│   ├── integration/               # Integration tests
│   └── e2e/                       # End-to-end tests
├── scripts/                       # Utility scripts
│   ├── init_db.py
│   └── seed_data.py
├── docker/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── entrypoint.sh
├── .env.example
├── .env.test
├── alembic.ini
├── pyproject.toml                 # Python project configuration
├── requirements.txt
├── requirements-dev.txt
└── docker-compose.yml
```

### Advanced Implementation Patterns

#### 1. Domain-Driven Design with Repository Pattern

```python
# domain/entities/user.py
from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from app.domain.value_objects.email import Email

@dataclass
class User:
    id: Optional[int]
    email: Email
    username: str
    hashed_password: str
    is_active: bool = True
    is_verified: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def verify(self) -> None:
        """Verify user account"""
        self.is_verified = True
        
    def deactivate(self) -> None:
        """Deactivate user account"""
        self.is_active = False

# domain/value_objects/email.py
from dataclasses import dataclass
import re

@dataclass(frozen=True)
class Email:
    value: str
    
    def __post_init__(self):
        if not self._is_valid_email(self.value):
            raise ValueError(f"Invalid email: {self.value}")
    
    @staticmethod
    def _is_valid_email(email: str) -> bool:
        pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        return re.match(pattern, email) is not None

# infrastructure/persistence/repositories/user.py
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.domain.entities.user import User as UserEntity
from app.infrastructure.persistence.models.user import User as UserModel
from app.domain.value_objects.email import Email

class UserRepository:
    def __init__(self, session: AsyncSession):
        self._session = session
    
    async def find_by_id(self, user_id: int) -> Optional[UserEntity]:
        result = await self._session.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        user_model = result.scalar_one_or_none()
        return self._to_entity(user_model) if user_model else None
    
    async def find_by_email(self, email: str) -> Optional[UserEntity]:
        result = await self._session.execute(
            select(UserModel).where(UserModel.email == email)
        )
        user_model = result.scalar_one_or_none()
        return self._to_entity(user_model) if user_model else None
    
    async def save(self, user: UserEntity) -> UserEntity:
        user_model = self._to_model(user)
        if user.id:
            await self._session.merge(user_model)
        else:
            self._session.add(user_model)
        await self._session.flush()
        return self._to_entity(user_model)
    
    def _to_entity(self, model: UserModel) -> UserEntity:
        return UserEntity(
            id=model.id,
            email=Email(model.email),
            username=model.username,
            hashed_password=model.hashed_password,
            is_active=model.is_active,
            is_verified=model.is_verified,
            created_at=model.created_at,
            updated_at=model.updated_at
        )
    
    def _to_model(self, entity: UserEntity) -> UserModel:
        return UserModel(
            id=entity.id,
            email=entity.email.value,
            username=entity.username,
            hashed_password=entity.hashed_password,
            is_active=entity.is_active,
            is_verified=entity.is_verified
        )
```

#### 2. Use Case Pattern with Dependency Injection

```python
# application/use_cases/user/create_user.py
from app.domain.entities.user import User
from app.domain.value_objects.email import Email
from app.infrastructure.persistence.repositories.user import UserRepository
from app.core.security import hash_password
from app.domain.events.user_events import UserCreatedEvent
from app.infrastructure.messaging.event_bus import EventBus

class CreateUserUseCase:
    def __init__(
        self, 
        user_repository: UserRepository,
        event_bus: EventBus
    ):
        self._user_repository = user_repository
        self._event_bus = event_bus
    
    async def execute(
        self, 
        email: str, 
        username: str, 
        password: str
    ) -> User:
        # Check if user already exists
        existing_user = await self._user_repository.find_by_email(email)
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Create user entity
        user = User(
            id=None,
            email=Email(email),
            username=username,
            hashed_password=hash_password(password)
        )
        
        # Save user
        saved_user = await self._user_repository.save(user)
        
        # Publish domain event
        await self._event_bus.publish(
            UserCreatedEvent(
                user_id=saved_user.id,
                email=saved_user.email.value,
                username=saved_user.username
            )
        )
        
        return saved_user
```

#### 3. Advanced Caching Strategy

```python
# infrastructure/cache/redis_cache.py
import json
import pickle
from typing import Optional, Any, Union
from redis.asyncio import Redis
from functools import wraps
import hashlib

class RedisCache:
    def __init__(self, redis: Redis):
        self._redis = redis
    
    async def get(
        self, 
        key: str, 
        deserializer: str = 'json'
    ) -> Optional[Any]:
        value = await self._redis.get(key)
        if value is None:
            return None
            
        if deserializer == 'json':
            return json.loads(value)
        elif deserializer == 'pickle':
            return pickle.loads(value)
        else:
            return value.decode()
    
    async def set(
        self, 
        key: str, 
        value: Any, 
        ttl: Optional[int] = None,
        serializer: str = 'json'
    ) -> None:
        if serializer == 'json':
            value = json.dumps(value)
        elif serializer == 'pickle':
            value = pickle.dumps(value)
        
        if ttl:
            await self._redis.setex(key, ttl, value)
        else:
            await self._redis.set(key, value)
    
    async def delete(self, key: str) -> None:
        await self._redis.delete(key)
    
    async def invalidate_pattern(self, pattern: str) -> None:
        """Invalidate all keys matching pattern"""
        cursor = 0
        while True:
            cursor, keys = await self._redis.scan(
                cursor, match=pattern, count=100
            )
            if keys:
                await self._redis.delete(*keys)
            if cursor == 0:
                break

def cache_result(
    ttl: int = 300, 
    key_prefix: str = "", 
    serializer: str = 'json'
):
    """Decorator for caching function results"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{key_prefix}:{func.__name__}"
            if args or kwargs:
                key_data = f"{args}:{kwargs}"
                key_hash = hashlib.md5(key_data.encode()).hexdigest()
                cache_key = f"{cache_key}:{key_hash}"
            
            # Try to get from cache
            cache = kwargs.get('cache')
            if cache:
                cached_value = await cache.get(cache_key, serializer)
                if cached_value is not None:
                    return cached_value
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Store in cache
            if cache and result is not None:
                await cache.set(cache_key, result, ttl, serializer)
            
            return result
        return wrapper
    return decorator
```

#### 4. WebSocket Support for Real-time Features

```python
# api/v1/websocket/router.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.core.security import verify_websocket_token
from app.api.v1.websocket.connection_manager import ConnectionManager

router = APIRouter()
manager = ConnectionManager()

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    client_id: str,
    token: str = Depends(verify_websocket_token)
):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_json()
            # Process received data
            await process_websocket_message(data, client_id)
    except WebSocketDisconnect:
        manager.disconnect(client_id)
        await manager.broadcast(
            f"Client {client_id} left the chat",
            exclude=[client_id]
        )

# api/v1/websocket/connection_manager.py
from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
    
    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
    
    async def send_personal_message(self, message: str, client_id: str):
        websocket = self.active_connections.get(client_id)
        if websocket:
            await websocket.send_text(message)
    
    async def broadcast(self, message: str, exclude: List[str] = None):
        exclude = exclude or []
        for client_id, connection in self.active_connections.items():
            if client_id not in exclude:
                await connection.send_text(message)
```

## Frontend Architecture (Next.js)

### Advanced Project Structure

```
frontend/
├── src/
│   ├── app/                        # Next.js 13+ App Router
│   │   ├── (auth)/                 # Auth group route
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/
│   │   │   └── register/
│   │   ├── (dashboard)/            # Protected routes
│   │   │   ├── layout.tsx
│   │   │   ├── middleware.ts       # Route protection
│   │   │   └── dashboard/
│   │   ├── api/                    # API routes (BFF pattern)
│   │   │   ├── auth/
│   │   │   │   └── [...].ts
│   │   │   └── trpc/               # tRPC integration
│   │   │       └── [trpc].ts
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   ├── error.tsx               # Error boundary
│   │   ├── loading.tsx             # Loading state
│   │   └── not-found.tsx           # 404 page
│   ├── components/
│   │   ├── ui/                     # Shadcn-UI components
│   │   │   ├── accordion.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   └── toast.tsx
│   │   ├── layouts/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── features/               # Feature-specific components
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   └── dashboard/
│   │   │       ├── StatsCard.tsx
│   │   │       └── DataTable.tsx
│   │   └── common/                 # Shared components
│   │       ├── ErrorBoundary.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── SEO.tsx
│   ├── lib/
│   │   ├── api/                    # API client layer
│   │   │   ├── client.ts           # Axios instance
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   └── websocket.ts        # WebSocket client
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useApi.ts
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useDebounce.ts
│   │   │   └── useInfiniteScroll.ts
│   │   ├── utils/                  # Utility functions
│   │   │   ├── constants.ts
│   │   │   ├── helpers.ts
│   │   │   └── formatters.ts
│   │   ├── validations/            # Zod schemas
│   │   │   ├── auth.schema.ts
│   │   │   └── user.schema.ts
│   │   └── services/               # Business logic
│   │       ├── auth.service.ts
│   │       └── analytics.service.ts
│   ├── store/                      # State management
│   │   ├── index.ts                # Store configuration
│   │   ├── auth.store.ts
│   │   ├── app.store.ts
│   │   └── middleware/             # Zustand middleware
│   │       └── persist.ts
│   ├── types/                      # TypeScript definitions
│   │   ├── api.types.ts
│   │   ├── app.types.ts
│   │   └── global.d.ts
│   ├── styles/
│   │   ├── globals.css             # Global styles
│   │   └── themes/                 # Theme configurations
│   │       ├── light.ts
│   │       └── dark.ts
│   └── config/
│       ├── site.config.ts          # Site configuration
│       └── env.config.ts           # Environment config
├── public/
│   ├── images/
│   ├── fonts/
│   └── manifest.json
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│       └── cypress/
├── .env.local
├── .env.test
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── jest.config.js
├── cypress.config.ts
└── package.json
```

### Advanced Frontend Patterns

#### 1. Advanced API Client with Request Queue and Retry Logic

```typescript
// lib/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '@/store/auth.store';

interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: AxiosError) => boolean;
}

interface QueuedRequest {
  config: AxiosRequestConfig;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: QueuedRequest[] = [];
  private retryConfig: RetryConfig = {
    retries: 3,
    retryDelay: 1000,
    retryCondition: (error) => {
      return error.response?.status === 503 || 
             error.response?.status === 500 ||
             error.code === 'ECONNABORTED';
    }
  };

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ config: originalRequest, resolve, reject });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            await this.refreshToken();
            this.processQueue(null);
            return this.instance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError);
            useAuthStore.getState().logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Retry logic
        if (this.shouldRetry(error, originalRequest)) {
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          
          if (originalRequest._retryCount <= this.retryConfig.retries) {
            await this.delay(this.retryConfig.retryDelay * originalRequest._retryCount);
            return this.instance(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshToken() {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) throw new Error('No refresh token');

    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      refresh_token: refreshToken
    });

    const { access_token, refresh_token } = response.data;
    useAuthStore.getState().updateTokens(access_token, refresh_token);
  }

  private processQueue(error: any) {
    this.failedQueue.forEach(({ config, resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(this.instance(config));
      }
    });
    
    this.failedQueue = [];
  }

  private shouldRetry(error: AxiosError, config: AxiosRequestConfig): boolean {
    if (!this.retryConfig.retryCondition) return false;
    if (config.method?.toLowerCase() !== 'get') return false;
    return this.retryConfig.retryCondition(error);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  get api() {
    return this.instance;
  }
}

export const apiClient = new ApiClient().api;
```

#### 2. Advanced React Hooks for Data Fetching

```typescript
// lib/hooks/useApi.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { apiClient } from '@/lib/api/client';

interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: AxiosError) => void;
  cache?: boolean;
  cacheTime?: number;
  refetchInterval?: number;
  retryCount?: number;
  retryDelay?: number;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: AxiosError | null;
  execute: (config?: AxiosRequestConfig) => Promise<T>;
  reset: () => void;
  mutate: (data: T) => void;
}

const cache = new Map<string, { data: any; timestamp: number }>();

export function useApi<T>(
  url: string,
  config?: AxiosRequestConfig,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getCacheKey = useCallback(() => {
    return `${url}-${JSON.stringify(config?.params || {})}`;
  }, [url, config?.params]);

  const checkCache = useCallback(() => {
    if (!options.cache) return null;
    
    const cacheKey = getCacheKey();
    const cached = cache.get(cacheKey);
    
    if (cached) {
      const isExpired = Date.now() - cached.timestamp > (options.cacheTime || 300000);
      if (!isExpired) {
        return cached.data;
      }
      cache.delete(cacheKey);
    }
    
    return null;
  }, [options.cache, options.cacheTime, getCacheKey]);

  const execute = useCallback(async (overrideConfig?: AxiosRequestConfig) => {
    // Check cache first
    const cachedData = checkCache();
    if (cachedData) {
      setData(cachedData);
      return cachedData;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient({
        url,
        ...config,
        ...overrideConfig,
        signal: abortControllerRef.current.signal,
      });

      const responseData = response.data;
      setData(responseData);

      // Update cache
      if (options.cache) {
        cache.set(getCacheKey(), {
          data: responseData,
          timestamp: Date.now(),
        });
      }

      options.onSuccess?.(responseData);
      return responseData;
    } catch (err) {
      if (axios.isCancel(err)) {
        return;
      }

      const axiosError = err as AxiosError;
      setError(axiosError);
      options.onError?.(axiosError);
      throw axiosError;
    } finally {
      setLoading(false);
    }
  }, [url, config, options, checkCache, getCacheKey]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  const mutate = useCallback((newData: T) => {
    setData(newData);
    if (options.cache) {
      cache.set(getCacheKey(), {
        data: newData,
        timestamp: Date.now(),
      });
    }
  }, [options.cache, getCacheKey]);

  // Auto-fetch on mount
  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, []);

  // Refetch interval
  useEffect(() => {
    if (options.refetchInterval && data) {
      intervalRef.current = setInterval(() => {
        execute();
      }, options.refetchInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [options.refetchInterval, data]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { data, loading, error, execute, reset, mutate };
}
```

#### 3. WebSocket Hook for Real-time Features

```typescript
// lib/hooks/useWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';

interface UseWebSocketOptions {
  onOpen?: (event: Event) => void;
  onMessage?: (data: any) => void;
  onError?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  reconnectAttempts?: number;
}

interface UseWebSocketResult {
  sendMessage: (data: any) => void;
  lastMessage: any;
  readyState: number;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(
  url: string,
  options: UseWebSocketOptions = {}
): UseWebSocketResult {
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    try {
      const token = useAuthStore.getState().accessToken;
      const wsUrl = `${url}?token=${token}`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = (event) => {
        setReadyState(WebSocket.OPEN);
        reconnectAttemptsRef.current = 0;
        options.onOpen?.(event);
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        options.onMessage?.(data);
      };

      wsRef.current.onerror = (event) => {
        options.onError?.(event);
      };

      wsRef.current.onclose = (event) => {
        setReadyState(WebSocket.CLOSED);
        options.onClose?.(event);

        if (options.reconnect && reconnectAttemptsRef.current < (options.reconnectAttempts || 5)) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, options.reconnectInterval || 3000);
        }
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }, [url, options]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  useEffect(() => {
    if (wsRef.current) {
      setReadyState(wsRef.current.readyState);
    }
  }, [wsRef.current?.readyState]);

  return { sendMessage, lastMessage, readyState, connect, disconnect };
}
```

## Database Design & Optimization

### PostgreSQL Schema Design

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS app;
CREATE SCHEMA IF NOT EXISTS audit;

-- Base tables
CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX idx_users_email_trgm ON auth.users USING gin (email gin_trgm_ops);
CREATE INDEX idx_users_username ON auth.users (username);
CREATE INDEX idx_users_created_at ON auth.users (created_at DESC);
CREATE INDEX idx_users_metadata ON auth.users USING gin (metadata);

-- Audit table
CREATE TABLE audit.user_changes (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL,
    changed_by UUID,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    old_values JSONB,
    new_values JSONB
);

-- Partitioning for large tables
CREATE TABLE app.events (
    id BIGSERIAL,
    event_type VARCHAR(50) NOT NULL,
    user_id UUID,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE app.events_2024_01 PARTITION OF app.events
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Function for automatic partition creation
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
DECLARE
    start_date date;
    end_date date;
    partition_name text;
BEGIN
    start_date := date_trunc('month', CURRENT_DATE);
    end_date := start_date + interval '1 month';
    partition_name := 'app.events_' || to_char(start_date, 'YYYY_MM');
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF app.events FOR VALUES FROM (%L) TO (%L)',
        partition_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;

-- Trigger for audit logging
CREATE OR REPLACE FUNCTION audit.log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO audit.user_changes (
            user_id, operation, changed_by, old_values, new_values
        ) VALUES (
            NEW.id, TG_OP, current_setting('app.current_user_id')::uuid,
            to_jsonb(OLD), to_jsonb(NEW)
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit.user_changes (
            user_id, operation, changed_by, old_values
        ) VALUES (
            OLD.id, TG_OP, current_setting('app.current_user_id')::uuid,
            to_jsonb(OLD)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_audit_trigger
AFTER UPDATE OR DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION audit.log_user_changes();
```

## Caching Strategy

### Multi-Level Caching Architecture

```python
# core/cache.py
from typing import Optional, Any, Dict
import json
import pickle
from redis.asyncio import Redis
from functools import lru_cache
import asyncio
from datetime import timedelta

class CacheLevel:
    MEMORY = "memory"
    REDIS = "redis"
    
class MultiLevelCache:
    def __init__(self, redis: Redis):
        self.redis = redis
        self.memory_cache: Dict[str, Any] = {}
        self.memory_cache_ttl: Dict[str, float] = {}
        
    async def get(
        self, 
        key: str, 
        level: str = CacheLevel.REDIS
    ) -> Optional[Any]:
        # Check memory cache first
        if level == CacheLevel.MEMORY:
            return self._get_from_memory(key)
        
        # Check Redis
        value = await self._get_from_redis(key)
        if value is not None:
            # Populate memory cache
            self._set_in_memory(key, value, ttl=300)
        
        return value
    
    async def set(
        self, 
        key: str, 
        value: Any, 
        ttl: Optional[int] = None,
        level: str = CacheLevel.REDIS
    ):
        if level == CacheLevel.MEMORY:
            self._set_in_memory(key, value, ttl)
        else:
            await self._set_in_redis(key, value, ttl)
            # Also set in memory cache
            self._set_in_memory(key, value, ttl=min(ttl or 3600, 300))
    
    async def delete(self, key: str):
        # Delete from all levels
        self._delete_from_memory(key)
        await self.redis.delete(key)
    
    async def invalidate_pattern(self, pattern: str):
        # Invalidate memory cache
        keys_to_delete = [k for k in self.memory_cache.keys() if pattern in k]
        for key in keys_to_delete:
            self._delete_from_memory(key)
        
        # Invalidate Redis cache
        cursor = 0
        while True:
            cursor, keys = await self.redis.scan(cursor, match=pattern, count=100)
            if keys:
                await self.redis.delete(*keys)
            if cursor == 0:
                break
    
    def _get_from_memory(self, key: str) -> Optional[Any]:
        if key in self.memory_cache:
            if asyncio.get_event_loop().time() < self.memory_cache_ttl.get(key, 0):
                return self.memory_cache[key]
            else:
                self._delete_from_memory(key)
        return None
    
    def _set_in_memory(self, key: str, value: Any, ttl: Optional[int] = None):
        self.memory_cache[key] = value
        if ttl:
            self.memory_cache_ttl[key] = asyncio.get_event_loop().time() + ttl
    
    def _delete_from_memory(self, key: str):
        self.memory_cache.pop(key, None)
        self.memory_cache_ttl.pop(key, None)
    
    async def _get_from_redis(self, key: str) -> Optional[Any]:
        value = await self.redis.get(key)
        if value:
            try:
                return json.loads(value)
            except:
                return pickle.loads(value)
        return None
    
    async def _set_in_redis(self, key: str, value: Any, ttl: Optional[int] = None):
        try:
            serialized = json.dumps(value)
        except:
            serialized = pickle.dumps(value)
        
        if ttl:
            await self.redis.setex(key, ttl, serialized)
        else:
            await self.redis.set(key, serialized)

# Cache key generator
class CacheKeyGenerator:
    @staticmethod
    def user_key(user_id: str) -> str:
        return f"user:{user_id}"
    
    @staticmethod
    def user_list_key(page: int, limit: int, **filters) -> str:
        filter_str = ":".join([f"{k}={v}" for k, v in sorted(filters.items())])
        return f"users:page={page}:limit={limit}:{filter_str}"
    
    @staticmethod
    def api_response_key(endpoint: str, params: Dict[str, Any]) -> str:
        param_str = ":".join([f"{k}={v}" for k, v in sorted(params.items())])
        return f"api:{endpoint}:{param_str}"
```

## Message Queue & Background Tasks

### Celery Configuration with Advanced Patterns

```python
# core/celery_app.py
from celery import Celery, Task
from celery.signals import task_prerun, task_postrun, task_failure
from kombu import Exchange, Queue
import logging
from app.config import settings

# Configure Celery
celery_app = Celery(
    "app",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks"]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    result_expires=3600,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=4,
    worker_max_tasks_per_child=1000,
)

# Define queues
celery_app.conf.task_routes = {
    "app.tasks.email.*": {"queue": "email"},
    "app.tasks.analytics.*": {"queue": "analytics"},
    "app.tasks.export.*": {"queue": "heavy"},
}

celery_app.conf.task_queues = (
    Queue("default", Exchange("default"), routing_key="default"),
    Queue("email", Exchange("email"), routing_key="email"),
    Queue("analytics", Exchange("analytics"), routing_key="analytics"),
    Queue("heavy", Exchange("heavy"), routing_key="heavy"),
)

# Custom task class with retry logic
class RetryTask(Task):
    autoretry_for = (Exception,)
    retry_kwargs = {"max_retries": 3}
    retry_backoff = True
    retry_backoff_max = 600
    retry_jitter = True

# Signal handlers
@task_prerun.connect
def task_prerun_handler(sender=None, task_id=None, task=None, **kwargs):
    logging.info(f"Task {task.name}[{task_id}] starting")

@task_postrun.connect
def task_postrun_handler(sender=None, task_id=None, task=None, **kwargs):
    logging.info(f"Task {task.name}[{task_id}] completed")

@task_failure.connect
def task_failure_handler(sender=None, task_id=None, exception=None, **kwargs):
    logging.error(f"Task {sender.name}[{task_id}] failed: {exception}")

# tasks/email.py
from app.core.celery_app import celery_app, RetryTask
from app.services.email import EmailService
from typing import Dict, List

@celery_app.task(base=RetryTask, bind=True)
def send_email(
    self, 
    to: List[str], 
    subject: str, 
    template: str, 
    context: Dict[str, Any]
):
    """Send email with retry logic"""
    try:
        email_service = EmailService()
        email_service.send(
            to=to,
            subject=subject,
            template=template,
            context=context
        )
    except Exception as exc:
        # Log the exception
        logging.error(f"Email sending failed: {exc}")
        # Retry with exponential backoff
        raise self.retry(exc=exc)

@celery_app.task
def send_bulk_emails(email_batch: List[Dict[str, Any]]):
    """Send bulk emails"""
    for email_data in email_batch:
        send_email.delay(**email_data)

# tasks/analytics.py
@celery_app.task
def process_user_analytics(user_id: str, action: str, metadata: Dict[str, Any]):
    """Process user analytics events"""
    # Implementation here
    pass

# tasks/export.py
@celery_app.task(bind=True)
def export_large_dataset(self, export_id: str, filters: Dict[str, Any]):
    """Export large dataset with progress tracking"""
    total_records = get_total_records(filters)
    processed = 0
    
    for batch in process_in_batches(filters, batch_size=1000):
        # Process batch
        process_batch(batch)
        processed += len(batch)
        
        # Update progress
        self.update_state(
            state="PROGRESS",
            meta={
                "current": processed,
                "total": total_records,
                "percentage": (processed / total_records) * 100
            }
        )
    
    return {"status": "completed", "total": processed}
```

## Security Architecture

### Comprehensive Security Implementation

```python
# core/security.py
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from cryptography.fernet import Fernet
import re

class SecurityManager:
    def __init__(self, settings):
        self.settings = settings
        self.pwd_context = CryptContext(
            schemes=["bcrypt"],
            deprecated="auto",
            bcrypt__rounds=12
        )
        self.fernet = Fernet(settings.ENCRYPTION_KEY.encode())
    
    # Password handling
    def hash_password(self, password: str) -> str:
        """Hash password with bcrypt"""
        return self.pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def validate_password_strength(self, password: str) -> Dict[str, Any]:
        """Validate password strength"""
        errors = []
        
        if len(password) < 8:
            errors.append("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", password):
            errors.append("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", password):
            errors.append("Password must contain at least one lowercase letter")
        if not re.search(r"\d", password):
            errors.append("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
            errors.append("Password must contain at least one special character")
        
        # Check against common passwords
        if password.lower() in self._get_common_passwords():
            errors.append("Password is too common")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "strength": self._calculate_password_strength(password)
        }
    
    # JWT handling
    def create_access_token(self, data: Dict[str, Any]) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(
            minutes=self.settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
        to_encode.update({
            "exp": expire,
            "type": "access",
            "jti": secrets.token_urlsafe(32)
        })
        return jwt.encode(
            to_encode, 
            self.settings.SECRET_KEY, 
            algorithm=self.settings.ALGORITHM
        )
    
    def create_refresh_token(self, data: Dict[str, Any]) -> str:
        """Create JWT refresh token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(
            days=self.settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
        to_encode.update({
            "exp": expire,
            "type": "refresh",
            "jti": secrets.token_urlsafe(32)
        })
        return jwt.encode(
            to_encode, 
            self.settings.REFRESH_SECRET_KEY, 
            algorithm=self.settings.ALGORITHM
        )
    
    def verify_token(self, token: str, token_type: str = "access") -> Dict[str, Any]:
        """Verify and decode JWT token"""
        try:
            secret_key = (
                self.settings.SECRET_KEY 
                if token_type == "access" 
                else self.settings.REFRESH_SECRET_KEY
            )
            payload = jwt.decode(
                token, 
                secret_key, 
                algorithms=[self.settings.ALGORITHM]
            )
            
            if payload.get("type") != token_type:
                raise ValueError("Invalid token type")
            
            return payload
        except JWTError:
            raise ValueError("Invalid token")
    
    # Data encryption
    def encrypt_sensitive_data(self, data: str) -> str:
        """Encrypt sensitive data"""
        return self.fernet.encrypt(data.encode()).decode()
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        return self.fernet.decrypt(encrypted_data.encode()).decode()
    
    # API key generation
    def generate_api_key(self) -> str:
        """Generate secure API key"""
        return f"sk_{secrets.token_urlsafe(32)}"
    
    def hash_api_key(self, api_key: str) -> str:
        """Hash API key for storage"""
        return hashlib.sha256(api_key.encode()).hexdigest()
    
    # CSRF protection
    def generate_csrf_token(self) -> str:
        """Generate CSRF token"""
        return secrets.token_urlsafe(32)
    
    def verify_csrf_token(self, token: str, session_token: str) -> bool:
        """Verify CSRF token"""
        return secrets.compare_digest(token, session_token)
    
    # Rate limiting
    def generate_rate_limit_key(self, identifier: str, endpoint: str) -> str:
        """Generate rate limit key"""
        return f"rate_limit:{identifier}:{endpoint}"
    
    # Helper methods
    def _get_common_passwords(self) -> set:
        """Get set of common passwords"""
        # In production, load from file or database
        return {
            "password", "123456", "password123", "admin", "letmein",
            "welcome", "monkey", "dragon", "baseball", "football"
        }
    
    def _calculate_password_strength(self, password: str) -> int:
        """Calculate password strength score (0-100)"""
        score = 0
        
        # Length score
        score += min(len(password) * 4, 40)
        
        # Character variety score
        if re.search(r"[a-z]", password):
            score += 10
        if re.search(r"[A-Z]", password):
            score += 10
        if re.search(r"\d", password):
            score += 10
        if re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
            score += 10
        
        # Pattern penalty
        if re.search(r"(.)\1{2,}", password):  # Repeated characters
            score -= 10
        if re.search(r"(012|123|234|345|456|567|678|789)", password):  # Sequential numbers
            score -= 10
        
        return max(0, min(score, 100))

# middleware/security_headers.py
from fastapi import Request
from fastapi.responses import Response

async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self'; "
        "connect-src 'self' wss: https:;"
    )
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = (
        "camera=(), microphone=(), geolocation=(), payment=()"
    )
    
    return response
```

## Testing Strategy

### Comprehensive Testing Setup

```python
# tests/conftest.py
import pytest
import asyncio
from typing import Generator, AsyncGenerator
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from app.main import app
from app.core.database import Base, get_session
from app.core.config import settings

# Test database URL
TEST_DATABASE_URL = settings.DATABASE_URL.replace(
    "postgresql://", "postgresql+asyncpg://"
).replace("/appdb", "/testdb")

# Create test engine
engine = create_async_engine(
    TEST_DATABASE_URL,
    poolclass=NullPool,
)

# Create test session
TestingSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def setup_database():
    """Create test database schema"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def db_session(setup_database) -> AsyncGenerator[AsyncSession, None]:
    """Get test database session"""
    async with TestingSessionLocal() as session:
        yield session
        await session.rollback()

@pytest.fixture
def client(db_session: AsyncSession) -> Generator[TestClient, None, None]:
    """Get test client"""
    def get_session_override():
        return db_session
    
    app.dependency_overrides[get_session] = get_session_override
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()

# Factory fixtures
@pytest.fixture
def user_factory():
    """User factory for tests"""
    from tests.factories.user import UserFactory
    return UserFactory

@pytest.fixture
async def authenticated_client(client: TestClient, user_factory):
    """Get authenticated test client"""
    user = await user_factory.create()
    
    # Login and get token
    response = client.post(
        "/api/v1/auth/login",
        json={"email": user.email, "password": "testpassword"}
    )
    token = response.json()["access_token"]
    
    # Set authorization header
    client.headers["Authorization"] = f"Bearer {token}"
    
    yield client

# tests/unit/test_security.py
import pytest
from app.core.security import SecurityManager
from app.config import settings

class TestSecurity:
    @pytest.fixture
    def security_manager(self):
        return SecurityManager(settings)
    
    def test_password_hashing(self, security_manager):
        password = "SecurePassword123!"
        hashed = security_manager.hash_password(password)
        
        assert hashed != password
        assert security_manager.verify_password(password, hashed)
        assert not security_manager.verify_password("WrongPassword", hashed)
    
    def test_password_validation(self, security_manager):
        # Test weak password
        result = security_manager.validate_password_strength("weak")
        assert not result["valid"]
        assert len(result["errors"]) > 0
        
        # Test strong password
        result = security_manager.validate_password_strength("Str0ng!Password")
        assert result["valid"]
        assert result["strength"] > 70
    
    @pytest.mark.asyncio
    async def test_jwt_tokens(self, security_manager):
        user_data = {"sub": "user123", "email": "test@example.com"}
        
        # Create tokens
        access_token = security_manager.create_access_token(user_data)
        refresh_token = security_manager.create_refresh_token(user_data)
        
        # Verify tokens
        access_payload = security_manager.verify_token(access_token, "access")
        refresh_payload = security_manager.verify_token(refresh_token, "refresh")
        
        assert access_payload["sub"] == "user123"
        assert refresh_payload["sub"] == "user123"
        assert access_payload["type"] == "access"
        assert refresh_payload["type"] == "refresh"

# tests/integration/test_auth_api.py
import pytest
from fastapi import status

class TestAuthAPI:
    @pytest.mark.asyncio
    async def test_register_user(self, client):
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "username": "newuser",
                "password": "SecurePass123!"
            }
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert "id" in data
        assert "password" not in data
    
    @pytest.mark.asyncio
    async def test_login(self, client, user_factory):
        user = await user_factory.create(
            email="testuser@example.com",
            password="TestPass123!"
        )
        
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "testuser@example.com",
                "password": "TestPass123!"
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
```

## Performance Optimization

### Backend Performance Optimization

```python
# core/performance.py
from functools import wraps
import time
import asyncio
from typing import Callable, Any
import cProfile
import pstats
import io
from app.core.logging import logger

class PerformanceMonitor:
    @staticmethod
    def measure_time(func: Callable) -> Callable:
        """Decorator to measure function execution time"""
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start_time = time.perf_counter()
            try:
                result = await func(*args, **kwargs)
                return result
            finally:
                end_time = time.perf_counter()
                execution_time = end_time - start_time
                logger.info(
                    f"{func.__name__} executed in {execution_time:.4f} seconds"
                )
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start_time = time.perf_counter()
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                end_time = time.perf_counter()
                execution_time = end_time - start_time
                logger.info(
                    f"{func.__name__} executed in {execution_time:.4f} seconds"
                )
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    
    @staticmethod
    def profile(func: Callable) -> Callable:
        """Decorator to profile function performance"""
        @wraps(func)
        def wrapper(*args, **kwargs):
            profiler = cProfile.Profile()
            profiler.enable()
            
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                profiler.disable()
                
                # Get profile statistics
                s = io.StringIO()
                ps = pstats.Stats(profiler, stream=s).sort_stats('cumulative')
                ps.print_stats(10)  # Print top 10 functions
                
                logger.info(f"Profile for {func.__name__}:\n{s.getvalue()}")
        
        return wrapper

# Database query optimization
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload, joinedload, contains_eager

class OptimizedQueries:
    @staticmethod
    async def get_users_with_related_data(session: AsyncSession):
        """Get users with all related data in a single query"""
        stmt = (
            select(User)
            .options(
                selectinload(User.profile),
                selectinload(User.roles).selectinload(Role.permissions),
                selectinload(User.posts).selectinload(Post.comments)
            )
            .where(User.is_active == True)
            .limit(100)
        )
        
        result = await session.execute(stmt)
        return result.scalars().unique().all()
    
    @staticmethod
    async def bulk_insert_users(session: AsyncSession, users_data: List[Dict]):
        """Bulk insert users for better performance"""
        # Use bulk_insert_mappings for best performance
        await session.run_sync(
            lambda sync_session: sync_session.bulk_insert_mappings(
                User, users_data
            )
        )
        await session.commit()
    
    @staticmethod
    async def get_paginated_results(
        session: AsyncSession,
        model: Any,
        page: int,
        limit: int,
        filters: Dict[str, Any] = None
    ):
        """Optimized pagination with filtering"""
        # Build base query
        stmt = select(model)
        
        # Apply filters
        if filters:
            conditions = []
            for field, value in filters.items():
                if hasattr(model, field):
                    conditions.append(getattr(model, field) == value)
            if conditions:
                stmt = stmt.where(and_(*conditions))
        
        # Apply pagination
        offset = (page - 1) * limit
        stmt = stmt.offset(offset).limit(limit)
        
        # Execute query
        result = await session.execute(stmt)
        items = result.scalars().all()
        
        # Get total count (optimized with select count)
        count_stmt = select(func.count()).select_from(model)
        if filters and conditions:
            count_stmt = count_stmt.where(and_(*conditions))
        
        total_result = await session.execute(count_stmt)
        total = total_result.scalar()
        
        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
```

### Frontend Performance Optimization

```typescript
// lib/performance/optimization.ts
import dynamic from 'next/dynamic';
import { lazy, Suspense } from 'react';

// Image optimization
export const OptimizedImage = dynamic(
  () => import('next/image'),
  { 
    loading: () => <div className="skeleton-image" />,
    ssr: false 
  }
);

// Lazy loading components
export const lazyLoad = (
  importFunc: () => Promise<any>,
  fallback: React.ReactNode = <div>Loading...</div>
) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: any) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Debounce hook for search inputs
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Virtual scrolling for large lists
import { VariableSizeList as List } from 'react-window';

export const VirtualList = ({ items, height, itemHeight, renderItem }) => {
  const getItemSize = (index: number) => itemHeight(items[index]);
  
  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={getItemSize}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {renderItem(items[index], index)}
        </div>
      )}
    </List>
  );
};

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

export async function deduplicatedFetch(url: string, options?: RequestInit) {
  const key = `${url}-${JSON.stringify(options)}`;
  
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  
  const promise = fetch(url, options)
    .then(response => response.json())
    .finally(() => {
      pendingRequests.delete(key);
    });
  
  pendingRequests.set(key, promise);
  return promise;
}
```

## Monitoring & Observability

### Comprehensive Monitoring Setup

```python
# core/monitoring.py
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from fastapi import Response
import time

# Initialize OpenTelemetry
resource = Resource(attributes={
    "service.name": "enterprise-app",
    "service.version": "1.0.0",
})

provider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(
    OTLPSpanExporter(endpoint="http://localhost:4317")
)
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

# Prometheus metrics
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

http_request_duration_seconds = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

active_connections = Gauge(
    'active_connections',
    'Number of active connections'
)

database_connection_pool_size = Gauge(
    'database_connection_pool_size',
    'Database connection pool size'
)

cache_hit_rate = Gauge(
    'cache_hit_rate',
    'Cache hit rate percentage'
)

# Custom middleware for metrics
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    
    # Track active connections
    active_connections.inc()
    
    try:
        response = await call_next(request)
        
        # Record metrics
        duration = time.time() - start_time
        http_requests_total.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()
        
        http_request_duration_seconds.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)
        
        return response
    finally:
        active_connections.dec()

# Metrics endpoint
@app.get("/metrics")
async def metrics():
    return Response(
        content=generate_latest(),
        media_type="text/plain"
    )

# Health check endpoint
@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_session)):
    checks = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {}
    }
    
    # Database check
    try:
        await db.execute(text("SELECT 1"))
        checks["checks"]["database"] = {"status": "healthy"}
    except Exception as e:
        checks["status"] = "unhealthy"
        checks["checks"]["database"] = {"status": "unhealthy", "error": str(e)}
    
    # Redis check
    try:
        await redis.ping()
        checks["checks"]["redis"] = {"status": "healthy"}
    except Exception as e:
        checks["status"] = "unhealthy"
        checks["checks"]["redis"] = {"status": "unhealthy", "error": str(e)}
    
    # Celery check
    try:
        celery_app.control.inspect().stats()
        checks["checks"]["celery"] = {"status": "healthy"}
    except Exception as e:
        checks["status"] = "unhealthy"
        checks["checks"]["celery"] = {"status": "unhealthy", "error": str(e)}
    
    status_code = 200 if checks["status"] == "healthy" else 503
    return JSONResponse(content=checks, status_code=status_code)

# Custom logging with context
import structlog

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.dict_tracebacks,
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Usage example
async def process_order(order_id: str, user_id: str):
    log = logger.bind(order_id=order_id, user_id=user_id)
    
    log.info("Processing order", status="started")
    
    try:
        # Process order logic
        result = await order_service.process(order_id)
        log.info("Order processed successfully", result=result)
        return result
    except Exception as e:
        log.error("Order processing failed", error=str(e), exc_info=True)
        raise
```

## CI/CD Pipeline

### GitHub Actions Configuration

```yaml
# .github/workflows/main.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  PYTHON_VERSION: '3.11'
  NODE_VERSION: '18'
  DOCKER_REGISTRY: ghcr.io

jobs:
  # Backend tests
  backend-test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Cache pip packages
        uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements*.txt') }}
          restore-keys: |
            ${{ runner.os }}-pip-
      
      - name: Install dependencies
        run: |
          cd backend
          python -m pip install --upgrade pip
          pip install -r requirements.txt -r requirements-dev.txt
      
      - name: Run linting
        run: |
          cd backend
          black --check .
          ruff check .
          mypy .
      
      - name: Run tests
        env:
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/testdb
          REDIS_URL: redis://localhost:6379
          SECRET_KEY: test-secret-key
        run: |
          cd backend
          pytest -v --cov=app --cov-report=xml --cov-report=html
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./backend/coverage.xml
  
  # Frontend tests
  frontend-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Cache node modules
        uses: actions/cache@v3
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Run linting
        run: |
          cd frontend
          npm run lint
          npm run type-check
      
      - name: Run tests
        run: |
          cd frontend
          npm run test -- --coverage
      
      - name: Build application
        run: |
          cd frontend
          npm run build
  
  # E2E tests
  e2e-test:
    needs: [backend-test, frontend-test]
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run E2E tests
        run: |
          docker-compose -f docker-compose.test.yml up -d
          cd frontend
          npm run cypress:run
      
      - name: Upload E2E test artifacts
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: cypress-screenshots
          path: frontend/cypress/screenshots
  
  # Build and push Docker images
  build-and-push:
    needs: [backend-test, frontend-test, e2e-test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Log in to registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.DOCKER_REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push backend
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: |
            ${{ env.DOCKER_REGISTRY }}/${{ github.repository }}/backend:latest
            ${{ env.DOCKER_REGISTRY }}/${{ github.repository }}/backend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Build and push frontend
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: true
          tags: |
            ${{ env.DOCKER_REGISTRY }}/${{ github.repository }}/frontend:latest
            ${{ env.DOCKER_REGISTRY }}/${{ github.repository }}/frontend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
  
  # Deploy to staging
  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - name: Deploy to Kubernetes
        run: |
          # Configure kubectl
          # Apply Kubernetes manifests
          # Run database migrations
          echo "Deploying to staging..."
```

## Development Environment Setup Guide

### Complete Setup Guide for Ubuntu 24.04.1

#### 1. System Prerequisites

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential build tools
sudo apt install -y \
    build-essential \
    curl \
    wget \
    git \
    vim \
    htop \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    zip \
    unzip
```

#### 2. Install Python 3.11

```bash
# Add deadsnakes PPA for Python 3.11
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update

# Install Python 3.11 and related packages
sudo apt install -y \
    python3.11 \
    python3.11-dev \
    python3.11-venv \
    python3.11-distutils \
    python3-pip

# Set Python 3.11 as default
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1
sudo update-alternatives --config python3

# Verify installation
python3 --version  # Should show Python 3.11.x
```

#### 3. Install Node.js 18 and npm

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x

# Install global packages
sudo npm install -g yarn pnpm
```

#### 4. Install PostgreSQL 15

```bash
# Add PostgreSQL official repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update

# Install PostgreSQL 15
sudo apt install -y postgresql-15 postgresql-client-15 postgresql-contrib-15

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE USER appuser WITH PASSWORD 'apppassword';
CREATE DATABASE appdb OWNER appuser;
GRANT ALL PRIVILEGES ON DATABASE appdb TO appuser;
EOF

# Configure PostgreSQL for local development
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/15/main/postgresql.conf
echo "host    all             all             127.0.0.1/32            md5" | sudo tee -a /etc/postgresql/15/main/pg_hba.conf
sudo systemctl restart postgresql
```

#### 5. Install Redis

```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis for development
sudo sed -i 's/supervised no/supervised systemd/' /etc/redis/redis.conf
sudo sed -i 's/# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
sudo sed -i 's/# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf

# Start and enable Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify Redis is running
redis-cli ping  # Should return PONG
```

#### 6. Install Docker and Docker Compose

```bash
# Remove old versions
sudo apt remove docker docker-engine docker.io containerd runc

# Install Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

#### 7. Install Additional Development Tools

```bash
# Install VS Code
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt update
sudo apt install -y code

# Install useful VS Code extensions
code --install-extension ms-python.python
code --install-extension ms-python.vscode-pylance
code --install-extension ms-azuretools.vscode-docker
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss

# Install HTTPie for API testing
sudo apt install -y httpie

# Install jq for JSON processing
sudo apt install -y jq

# Install direnv for environment management
sudo apt install -y direnv
echo 'eval "$(direnv hook bash)"' >> ~/.bashrc
```

#### 8. Clone and Setup the Project

```bash
# Create workspace directory
mkdir -p ~/workspace
cd ~/workspace

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/yourusername/enterprise-app.git
cd enterprise-app
```

#### 9. Setup Backend Development Environment

```bash
cd backend

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt -r requirements-dev.txt

# Create .env file from example
cp .env.example .env

# Edit .env file with your local settings
cat > .env << EOF
DATABASE_URL=postgresql://appuser:apppassword@localhost:5432/appdb
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=$(openssl rand -hex 32)
REFRESH_SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ENCRYPTION_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000"]

# Sentry (optional)
SENTRY_DSN=

# Email (optional)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
EOF

# Initialize database
alembic upgrade head

# Create initial admin user (optional)
python scripts/init_db.py

# Run backend development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 10. Setup Frontend Development Environment

```bash
# Open new terminal
cd ~/workspace/enterprise-app/frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8000/ws
NEXT_PUBLIC_APP_NAME=Enterprise App
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

# Run frontend development server
npm run dev
```

#### 11. Setup Development Database Tools

```bash
# Install pgAdmin4 (optional)
curl -fsS https://www.pgadmin.org/static/packages_pgadmin_org.pub | sudo gpg --dearmor -o /usr/share/keyrings/packages-pgadmin-org.gpg
sudo sh -c 'echo "deb [signed-by=/usr/share/keyrings/packages-pgadmin-org.gpg] https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/$(lsb_release -cs) pgadmin4 main" > /etc/apt/sources.list.d/pgadmin4.list'
sudo apt update
sudo apt install -y pgadmin4-desktop

# Install Redis GUI (optional)
sudo snap install redis-desktop-manager
```

#### 12. Setup Git Hooks

```bash
cd ~/workspace/enterprise-app

# Install pre-commit
pip install pre-commit

# Create pre-commit configuration
cat > .pre-commit-config.yaml << EOF
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: check-json
      - id: check-merge-conflict

  - repo: https://github.com/psf/black
    rev: 23.11.0
    hooks:
      - id: black
        language_version: python3.11
        files: ^backend/

  - repo: https://github.com/charliermarsh/ruff-pre-commit
    rev: v0.1.6
    hooks:
      - id: ruff
        files: ^backend/

  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.0.3
    hooks:
      - id: prettier
        files: ^frontend/
        types_or: [javascript, jsx, ts, tsx, css, json]
EOF

# Install git hooks
pre-commit install
```

#### 13. Running the Full Stack

```bash
# Terminal 1: PostgreSQL and Redis (already running as services)

# Terminal 2: Backend
cd ~/workspace/enterprise-app/backend
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 3: Celery Worker
cd ~/workspace/enterprise-app/backend
source venv/bin/activate
celery -A app.core.celery_app worker --loglevel=info

# Terminal 4: Celery Beat (for scheduled tasks)
cd ~/workspace/enterprise-app/backend
source venv/bin/activate
celery -A app.core.celery_app beat --loglevel=info

# Terminal 5: Frontend
cd ~/workspace/enterprise-app/frontend
npm run dev

# Terminal 6: Celery Flower (monitoring)
cd ~/workspace/enterprise-app/backend
source venv/bin/activate
celery -A app.core.celery_app flower
```

#### 14. Verify Everything is Working

```bash
# Check backend health
curl http://localhost:8000/health

# Check API documentation
open http://localhost:8000/docs

# Check frontend
open http://localhost:3000

# Check Celery Flower
open http://localhost:5555

# Run backend tests
cd ~/workspace/enterprise-app/backend
source venv/bin/activate
pytest

# Run frontend tests
cd ~/workspace/enterprise-app/frontend
npm test
```

#### 15. Useful Development Commands

```bash
# Backend commands
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Format code
black .
ruff check . --fix

# Type checking
mypy .

# Frontend commands
# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Analyze bundle size
npm run analyze
```

#### 16. Troubleshooting Common Issues

```bash
# PostgreSQL connection issues
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"

# Redis connection issues
redis-cli ping
sudo systemctl status redis-server

# Port already in use
sudo lsof -i :8000  # Check what's using port 8000
sudo lsof -i :3000  # Check what's using port 3000

# Python virtual environment issues
deactivate
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Node modules issues
rm -rf node_modules package-lock.json
npm install

# Docker issues
docker system prune -a  # Clean up Docker
sudo systemctl restart docker
```

## Production Deployment Considerations

### Kubernetes Deployment

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  labels:
    app: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: ghcr.io/yourusername/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8000
  type: ClusterIP
```

### Security Hardening Checklist

1. **Infrastructure Security**:
   - Use HTTPS everywhere with valid SSL certificates
   - Implement Web Application Firewall (WAF)
   - Enable DDoS protection
   - Use VPN for administrative access
   - Implement network segmentation

2. **Application Security**:
   - Regular dependency updates and vulnerability scanning
   - Implement Content Security Policy (CSP)
   - Use secure session management
   - Implement proper CORS configuration
   - Enable security headers

3. **Data Security**:
   - Encrypt data at rest and in transit
   - Implement database encryption
   - Use secure key management (AWS KMS, HashiCorp Vault)
   - Regular security audits
   - Implement data retention policies

4. **Access Control**:
   - Implement principle of least privilege
   - Use multi-factor authentication (MFA)
   - Regular access reviews
   - Implement IP whitelisting for admin panels
   - Use role-based access control (RBAC)

## Conclusion

This comprehensive architecture provides a robust foundation for building enterprise-grade applications. The combination of modern technologies, best practices, and scalable patterns ensures that your application can grow with your business needs while maintaining high performance, security, and developer productivity.

Key takeaways:

1. **Scalability**: The architecture supports both vertical and horizontal scaling
2. **Maintainability**: Clear separation of concerns and consistent patterns
3. **Security**: Multiple layers of security from infrastructure to application
4. **Performance**: Optimized for speed with caching, async operations, and efficient queries
5. **Developer Experience**: Modern tooling, type safety, and automated workflows
6. **Observability**: Comprehensive monitoring and logging for production insights

Remember to adapt these patterns to your specific use case and requirements. This architecture serves as a starting point that can be customized based on your team's expertise and project needs.
