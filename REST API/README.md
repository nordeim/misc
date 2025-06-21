# Enterprise-Grade Full-Stack Application Architecture: Complete Implementation Guide

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [REST API Architecture & Design Principles](#rest-api-architecture--design-principles)
3. [Enterprise Architecture Overview](#enterprise-architecture-overview)
4. [Backend Architecture Deep Dive](#backend-architecture-deep-dive)
5. [Frontend Architecture Deep Dive](#frontend-architecture-deep-dive)
6. [Database Design & Data Architecture](#database-design--data-architecture)
7. [Security Architecture](#security-architecture)
8. [Microservices & Scalability Patterns](#microservices--scalability-patterns)
9. [DevOps & Infrastructure](#devops--infrastructure)
10. [Testing Strategy & Quality Assurance](#testing-strategy--quality-assurance)
11. [Performance Optimization](#performance-optimization)
12. [Monitoring & Observability](#monitoring--observability)
13. [Step-by-Step Ubuntu 24.04.1 Development Environment Setup](#step-by-step-ubuntu-24041-development-environment-setup)
14. [Advanced Development Patterns](#advanced-development-patterns)
15. [Production Deployment Guide](#production-deployment-guide)

## Executive Summary

This comprehensive architectural blueprint defines a modern, scalable, and maintainable enterprise application using cutting-edge technologies and industry best practices. The architecture leverages Python's FastAPI ecosystem for high-performance backend services and Next.js with TypeScript for a robust, type-safe frontend experience.

**Key Architectural Decisions:**
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL + Redis + Celery
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + Shadcn-UI
- **Infrastructure**: Docker + Kubernetes + CI/CD + Monitoring Stack
- **Architecture Pattern**: Clean Architecture with Domain-Driven Design principles
- **Security**: OAuth2 + JWT + RBAC + End-to-end encryption
- **Scalability**: Horizontal scaling with load balancers and caching layers

## REST API Architecture & Design Principles

### REST Maturity Model Implementation

Our API follows Richardson's REST Maturity Model Level 3, implementing:

**Level 0 - HTTP as Transport**: Basic HTTP communication
**Level 1 - Resources**: Individual URIs for different resources
**Level 2 - HTTP Verbs**: Proper use of HTTP methods and status codes
**Level 3 - Hypermedia Controls**: HATEOAS implementation for API discoverability

### Advanced API Design Patterns

**Resource Modeling:**
```python
# Domain-driven resource modeling
class UserResource:
    """
    User resource following REST conventions
    
    Endpoints:
    - GET /api/v1/users - List users with filtering, sorting, pagination
    - POST /api/v1/users - Create new user
    - GET /api/v1/users/{id} - Retrieve specific user
    - PUT /api/v1/users/{id} - Complete user update
    - PATCH /api/v1/users/{id} - Partial user update
    - DELETE /api/v1/users/{id} - Soft delete user
    """
    pass

# Nested resource relationships
class UserOrdersResource:
    """
    GET /api/v1/users/{user_id}/orders - User's orders
    POST /api/v1/users/{user_id}/orders - Create order for user
    """
    pass
```

**API Versioning Strategy:**
```python
from fastapi import APIRouter

# URL-based versioning (recommended for breaking changes)
v1_router = APIRouter(prefix="/api/v1")
v2_router = APIRouter(prefix="/api/v2")

# Header-based versioning (for non-breaking changes)
@app.middleware("http")
async def version_middleware(request: Request, call_next):
    version = request.headers.get("API-Version", "v1")
    request.state.api_version = version
    return await call_next(request)
```

**Content Negotiation:**
```python
from fastapi import Request, Response
from fastapi.responses import JSONResponse, XMLResponse

@app.get("/api/v1/users/{id}")
async def get_user(id: int, request: Request):
    user = await get_user_by_id(id)
    
    accept_header = request.headers.get("accept", "application/json")
    
    if "application/xml" in accept_header:
        return XMLResponse(content=serialize_to_xml(user))
    elif "application/json" in accept_header:
        return JSONResponse(content=user.dict())
    else:
        return JSONResponse(content=user.dict())  # Default to JSON
```

## Enterprise Architecture Overview

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Load Balancer                                   │
│                           (NGINX/HAProxy)                                    │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │
    ┌────────────────────────┼────────────────────────┐
    │                        │                        │
    ▼                        ▼                        ▼
┌─────────┐            ┌─────────┐            ┌─────────┐
│Frontend │            │Frontend │            │Frontend │
│Instance │            │Instance │            │Instance │
│(Next.js)│            │(Next.js)│            │(Next.js)│
└─────────┘            └─────────┘            └─────────┘
    │                        │                        │
    └────────────────────────┼────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │  (Kong/Traefik) │
                    └────────┬────────┘
                             │
    ┌────────────────────────┼────────────────────────┐
    │                        │                        │
    ▼                        ▼                        ▼
┌─────────┐            ┌─────────┐            ┌─────────┐
│Backend  │            │Backend  │            │Backend  │
│Instance │            │Instance │            │Instance │
│(FastAPI)│            │(FastAPI)│            │(FastAPI)│
└─────────┘            └─────────┘            └─────────┘
    │                        │                        │
    └────────────────────────┼────────────────────────┘
                             │
    ┌────────────────────────┼────────────────────────┐
    │                        │                        │
    ▼                        ▼                        ▼
┌─────────┐            ┌─────────┐            ┌─────────┐
│PostgreSQL           │  Redis   │            │  File   │
│Master/  │            │ Cluster  │            │ Storage │
│Replica  │            │          │            │(S3/Min) │
└─────────┘            └─────────┘            └─────────┘
```

### Clean Architecture Implementation

Our system follows Uncle Bob's Clean Architecture principles:

**Dependency Rule**: Inner layers never depend on outer layers
**Entities**: Core business logic and rules
**Use Cases**: Application-specific business rules  
**Interface Adapters**: Controllers, presenters, gateways
**Frameworks & Drivers**: External concerns (web, database, UI)

```python
# Clean Architecture Layer Structure
src/
├── domain/                 # Entities & Business Rules
│   ├── entities/
│   ├── value_objects/
│   └── exceptions/
├── application/           # Use Cases & Application Services
│   ├── use_cases/
│   ├── services/
│   └── interfaces/
├── infrastructure/        # External Concerns
│   ├── database/
│   ├── external_apis/
│   └── messaging/
└── presentation/         # Controllers & Presenters
    ├── api/
    ├── schemas/
    └── middleware/
```

## Backend Architecture Deep Dive

### Advanced FastAPI Configuration

```python
# main.py - Production-ready FastAPI setup
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
import logging
import structlog

# Configure structured logging
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
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

app = FastAPI(
    title="Enterprise API",
    description="Production-ready enterprise application API",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
)

# Security middleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

# Prometheus metrics
instrumentator = Instrumentator()
instrumentator.instrument(app).expose(app)

# Global exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger = structlog.get_logger()
    logger.error("HTTP exception occurred", 
                status_code=exc.status_code, 
                detail=exc.detail,
                path=request.url.path)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    )
```

### Repository Pattern Implementation

```python
# repositories/base.py
from abc import ABC, abstractmethod
from typing import Generic, TypeVar, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, update, delete

T = TypeVar('T')

class BaseRepository(Generic[T], ABC):
    def __init__(self, session: AsyncSession, model_class: type):
        self.session = session
        self.model_class = model_class
    
    async def create(self, **kwargs) -> T:
        instance = self.model_class(**kwargs)
        self.session.add(instance)
        await self.session.commit()
        await self.session.refresh(instance)
        return instance
    
    async def get_by_id(self, id: int) -> Optional[T]:
        stmt = select(self.model_class).where(self.model_class.id == id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def list(self, skip: int = 0, limit: int = 100, **filters) -> List[T]:
        stmt = select(self.model_class)
        
        # Apply filters
        for key, value in filters.items():
            if hasattr(self.model_class, key):
                stmt = stmt.where(getattr(self.model_class, key) == value)
        
        stmt = stmt.offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()
    
    async def update(self, id: int, **kwargs) -> Optional[T]:
        stmt = update(self.model_class).where(
            self.model_class.id == id
        ).values(**kwargs).returning(self.model_class)
        
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.scalar_one_or_none()
    
    async def delete(self, id: int) -> bool:
        stmt = delete(self.model_class).where(self.model_class.id == id)
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.rowcount > 0

# repositories/user_repository.py
class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, User)
    
    async def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_active_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        stmt = select(User).where(User.is_active == True).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()
```

### Advanced Service Layer

```python
# services/user_service.py
from typing import Optional, List
from repositories.user_repository import UserRepository
from core.security import get_password_hash, verify_password
from schemas.user import UserCreate, UserUpdate
from models.user import User

class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository
    
    async def create_user(self, user_data: UserCreate) -> User:
        # Business logic validation
        existing_user = await self.user_repository.get_by_email(user_data.email)
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user
        user = await self.user_repository.create(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_password,
            full_name=user_data.full_name
        )
        
        # Send welcome email (async task)
        from tasks.email_tasks import send_welcome_email
        send_welcome_email.delay(user.email, user.full_name)
        
        return user
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = await self.user_repository.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user
    
    async def update_user_profile(self, user_id: int, update_data: UserUpdate) -> Optional[User]:
        # Business logic for profile updates
        return await self.user_repository.update(user_id, **update_data.dict(exclude_unset=True))
```

## Frontend Architecture Deep Dive

### Advanced Next.js Configuration

```typescript
// next.config.js
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: ['localhost', 'api.example.com'],
    formats: ['image/webp', 'image/avif'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:8000/api/:path*'
          : 'https://api.example.com/api/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

### Advanced State Management with Zustand

```typescript
// store/auth-store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User } from '@/types/user'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  updateProfile: (data: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })
          
          if (!response.ok) {
            throw new Error('Login failed')
          }
          
          const { user, access_token, refresh_token } = await response.json()
          
          // Store tokens securely
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)
          
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      
      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, isAuthenticated: false })
      },
      
      refreshToken: async () => {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          get().logout()
          return
        }
        
        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${refreshToken}`
            },
          })
          
          if (!response.ok) {
            throw new Error('Token refresh failed')
          }
          
          const { access_token } = await response.json()
          localStorage.setItem('access_token', access_token)
        } catch (error) {
          get().logout()
        }
      },
      
      updateProfile: (data: Partial<User>) => {
        set(state => ({
          user: state.user ? { ...state.user, ...data } : null
        }))
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)
```

### Advanced Form Management

```typescript
// components/forms/UserForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type UserFormData = z.infer<typeof userSchema>

interface UserFormProps {
  onSubmit: (data: UserFormData) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<UserFormData>
}

export function UserForm({ onSubmit, isLoading = false, defaultValues }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues,
    mode: 'onBlur'
  })

  const onSubmitHandler = async (data: UserFormData) => {
    try {
      clearErrors()
      await onSubmit(data)
    } catch (error) {
      if (error instanceof Error) {
        setError('root', { message: error.message })
      }
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create User Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <span className="text-sm text-red-500">{errors.email.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              {...register('username')}
              className={errors.username ? 'border-red-500' : ''}
            />
            {errors.username && (
              <span className="text-sm text-red-500">{errors.username.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              {...register('fullName')}
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && (
              <span className="text-sm text-red-500">{errors.fullName.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <span className="text-sm text-red-500">{errors.password.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className={errors.confirmPassword ? 'border-red-500' : ''}
            />
            {errors.confirmPassword && (
              <span className="text-sm text-red-500">{errors.confirmPassword.message}</span>
            )}
          </div>

          {errors.root && (
            <Alert variant="destructive">
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

## Database Design & Data Architecture

### Advanced PostgreSQL Configuration

```sql
-- Performance optimizations
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Connection pooling
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';

SELECT pg_reload_conf();
```

### Database Schema with Advanced Features

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Users table with comprehensive indexing
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(200),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Comprehensive indexing strategy
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_uuid ON users(uuid);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX idx_users_verified ON users(is_verified) WHERE is_verified = true;
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_full_name_gin ON users USING gin(full_name gin_trgm_ops);

-- Audit trail table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Security Architecture

### OAuth2 + JWT Implementation

```python
# core/security.py
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import secrets

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

class SecurityManager:
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.access_token_expire_minutes = 15
        self.refresh_token_expire_days = 7
    
    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)
    
    def create_access_token(self, data: Dict[str, Any]) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        to_encode.update({"exp": expire, "type": "access"})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(self, data: Dict[str, Any]) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        to_encode.update({"exp": expire, "type": "refresh"})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str, token_type: str = "access") -> Dict[str, Any]:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            if payload.get("type") != token_type:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type"
                )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired"
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

# RBAC Implementation
class RolePermissionManager:
    def __init__(self):
        self.permissions = {
            "admin": ["*"],
            "manager": ["users:read", "users:write", "orders:read", "orders:write"],
            "user": ["profile:read", "profile:write", "orders:read"]
        }
    
    def has_permission(self, user_roles: list, required_permission: str) -> bool:
        for role in user_roles:
            role_permissions = self.permissions.get(role, [])
            if "*" in role_permissions or required_permission in role_permissions:
                return True
        return False

# Rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/v1/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, user_credentials: UserLogin):
    # Login implementation with rate limiting
    pass
```

## Microservices & Scalability Patterns

### Service Decomposition Strategy

```python
# services/user_service.py - User Management Microservice
class UserMicroservice:
    """
    Handles all user-related operations:
    - User registration and authentication
    - Profile management
    - User preferences
    """
    pass

# services/order_service.py - Order Management Microservice  
class OrderMicroservice:
    """
    Handles order processing:
    - Order creation and management
    - Payment processing integration
    - Order fulfillment
    """
    pass

# services/notification_service.py - Notification Microservice
class NotificationMicroservice:
    """
    Handles all notifications:
    - Email notifications
    - Push notifications
    - SMS notifications
    """
    pass
```

### Event-Driven Architecture

```python
# events/event_bus.py
import asyncio
from typing import Dict, List, Callable, Any
from dataclasses import dataclass
from abc import ABC, abstractmethod

@dataclass
class Event:
    event_type: str
    data: Dict[str, Any]
    timestamp: datetime
    correlation_id: str

class EventHandler(ABC):
    @abstractmethod
    async def handle(self, event: Event) -> None:
        pass

class EventBus:
    def __init__(self):
        self.handlers: Dict[str, List[EventHandler]] = {}
    
    def subscribe(self, event_type: str, handler: EventHandler):
        if event_type not in self.handlers:
            self.handlers[event_type] = []
        self.handlers[event_type].append(handler)
    
    async def publish(self, event: Event):
        handlers = self.handlers.get(event.event_type, [])
        tasks = [handler.handle(event) for handler in handlers]
        await asyncio.gather(*tasks, return_exceptions=True)

# Event handlers
class UserRegisteredHandler(EventHandler):
    async def handle(self, event: Event):
        user_data = event.data
        # Send welcome email
        await send_welcome_email(user_data['email'], user_data['name'])
        
        # Create user profile
        await create_user_profile(user_data['user_id'])
        
        # Log analytics event
        await track_user_registration(user_data['user_id'])
```

## DevOps & Infrastructure

### Docker Configuration

```dockerfile
# Backend Dockerfile - Multi-stage build
FROM python:3.11-slim as builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-slim

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=builder /root/.local /home/appuser/.local

# Copy application code
COPY . .

# Change ownership to appuser
RUN chown -R appuser:appuser /app

USER appuser

# Make sure scripts are executable
ENV PATH=/home/appuser/.local/bin:$PATH

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Kubernetes Deployment

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-api
  labels:
    app: backend-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend-api
  template:
    metadata:
      labels:
        app: backend-api
    spec:
      containers:
      - name: backend-api
        image: your-registry/backend-api:latest
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
            configMapKeyRef:
              name: app-config
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
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: backend-api-service
spec:
  selector:
    app: backend-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8000
  type: ClusterIP
```

## Testing Strategy & Quality Assurance

### Comprehensive Testing Pyramid

```python
# tests/unit/test_user_service.py
import pytest
from unittest.mock import AsyncMock, Mock
from services.user_service import UserService
from schemas.user import UserCreate

@pytest.fixture
def mock_user_repository():
    return AsyncMock()

@pytest.fixture
def user_service(mock_user_repository):
    return UserService(mock_user_repository)

@pytest.mark.asyncio
async def test_create_user_success(user_service, mock_user_repository):
    # Arrange
    user_data = UserCreate(
        email="test@example.com",
        username="testuser",
        password="TestPass123!",
        full_name="Test User"
    )
    mock_user_repository.get_by_email.return_value = None
    mock_user_repository.create.return_value = Mock(id=1, email=user_data.email)
    
    # Act
    result = await user_service.create_user(user_data)
    
    # Assert
    assert result.email == user_data.email
    mock_user_repository.get_by_email.assert_called_once_with(user_data.email)
    mock_user_repository.create.assert_called_once()

@pytest.mark.asyncio
async def test_create_user_duplicate_email(user_service, mock_user_repository):
    # Arrange
    user_data = UserCreate(
        email="existing@example.com",
        username="testuser",
        password="TestPass123!",
        full_name="Test User"
    )
    mock_user_repository.get_by_email.return_value = Mock(id=1)
    
    # Act & Assert
    with pytest.raises(ValueError, match="User with this email already exists"):
        await user_service.create_user(user_data)
```

```python
# tests/integration/test_user_api.py
import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
async def test_create_user_integration():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/v1/users", json={
            "email": "integration@example.com",
            "username": "integrationuser",
            "password": "IntegrationPass123!",
            "full_name": "Integration User"
        })
    
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "integration@example.com"
```

## Performance Optimization

### Database Query Optimization

```python
# Optimized queries with proper indexing and eager loading
from sqlalchemy.orm import selectinload, joinedload

async def get_users_with_orders(session: AsyncSession, limit: int = 100):
    """Optimized query to get users with their orders"""
    stmt = (
        select(User)
        .options(selectinload(User.orders))
        .where(User.is_active == True)
        .limit(limit)
    )
    result = await session.execute(stmt)
    return result.scalars().unique().all()

# Query optimization with proper indexing
async def search_users_optimized(session: AsyncSession, search_term: str):
    """Full-text search with GIN index"""
    stmt = (
        select(User)
        .where(User.full_name.op('@@')(func.plainto_tsquery(search_term)))
        .order_by(func.ts_rank(User.full_name, func.plainto_tsquery(search_term)))
    )
    result = await session.execute(stmt)
    return result.scalars().all()
```

### Caching Strategy

```python
# Advanced caching with Redis
import redis.asyncio as redis
import pickle
from typing import Optional, Any
import json

class CacheManager:
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url)
    
    async def get(self, key: str) -> Optional[Any]:
        try:
            value = await self.redis.get(key)
            if value:
                return pickle.loads(value)
        except Exception as e:
            logger.error(f"Cache get error: {e}")
        return None
    
    async def set(self, key: str, value: Any, expire: int = 3600):
        try:
            await self.redis.set(key, pickle.dumps(value), ex=expire)
        except Exception as e:
            logger.error(f"Cache set error: {e}")
    
    async def delete(self, key: str):
        try:
            await self.redis.delete(key)
        except Exception as e:
            logger.error(f"Cache delete error: {e}")

# Cache decorator
def cache_result(expire: int = 3600):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached = await cache_manager.get(cache_key)
            if cached is not None:
                return cached
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache_manager.set(cache_key, result, expire)
            return result
        
        return wrapper
    return decorator
```

## Monitoring & Observability

### Comprehensive Logging Configuration

```python
# logging_config.py
import structlog
import logging
from pythonjsonlogger import jsonlogger

def configure_logging():
    # Configure standard library logging
    handler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter(
        '%(asctime)s %(name)s %(levelname)s %(message)s'
    )
    handler.setFormatter(formatter)
    
    root_logger = logging.getLogger()
    root_logger.addHandler(handler)
    root_logger.setLevel(logging.INFO)
    
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.dev.ConsoleRenderer() if settings.DEBUG else structlog.processors.JSONRenderer()
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

# Application metrics
from prometheus_client import Counter, Histogram, Gauge
import time

# Define metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')
ACTIVE_USERS = Gauge('active_users_total', 'Number of active users')

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    # Record metrics
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    REQUEST_DURATION.observe(time.time() - start_time)
    
    return response
```

## Step-by-Step Ubuntu 24.04.1 Development Environment Setup

### Prerequisites and System Preparation

```bash
#!/bin/bash
# setup_ubuntu_dev_environment.sh

set -e

echo "🚀 Setting up Enterprise Development Environment on Ubuntu 24.04.1"

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential development tools
echo "🔧 Installing essential development tools..."
sudo apt install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    tree \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    build-essential \
    libssl-dev \
    libffi-dev \
    libpq-dev \
    pkg-config

echo "✅ System preparation completed!"
```

### Python Environment Setup

```bash
# Install Python 3.11+ and pip
echo "🐍 Setting up Python environment..."
sudo apt install -y python3.11 python3.11-dev python3.11-venv python3-pip

# Install pipx for global Python packages
python3 -m pip install --user pipx
python3 -m pipx ensurepath

# Install poetry for dependency management
pipx install poetry

# Configure poetry
poetry config virtualenvs.create true
poetry config virtualenvs.in-project true

echo "✅ Python environment setup completed!"
```

### Node.js and npm Setup

```bash
# Install Node.js 18+ using NodeSource repository
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm (faster package manager)
npm install -g pnpm

# Install global development tools
npm install -g @next/codemod typescript ts-node

echo "✅ Node.js environment setup completed!"
```

### Database Setup (PostgreSQL & Redis)

```bash
# Install PostgreSQL
echo "🐘 Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib postgresql-client

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database user and database
sudo -u postgres psql << EOF
CREATE USER devuser WITH PASSWORD 'devpassword';
ALTER USER devuser CREATEDB;
CREATE DATABASE enterprise_dev OWNER devuser;
GRANT ALL PRIVILEGES ON DATABASE enterprise_dev TO devuser;
\q
EOF

# Install Redis
echo "🔴 Installing Redis..."
sudo apt install -y redis-server

# Configure Redis
sudo sed -i 's/supervised no/supervised systemd/' /etc/redis/redis.conf
sudo systemctl restart redis
sudo systemctl enable redis

echo "✅ Database setup completed!"
```

### Docker Installation

```bash
# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose standalone
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "✅ Docker installation completed!"
```

### Project Structure Creation

```bash
# Create project structure
echo "📁 Creating project structure..."
mkdir -p ~/enterprise-app
cd ~/enterprise-app

# Backend structure
mkdir -p backend/{app/{api/{v1},core,models,schemas,services,utils,tasks},tests/{unit,integration},alembic/versions}

# Frontend structure
mkdir -p frontend/{src/{app,components/{ui,forms,layout,features},lib,hooks,store,types},public,tests}

# Infrastructure structure
mkdir -p infrastructure/{docker,k8s,monitoring,scripts}

# Documentation
mkdir -p docs/{api,architecture,deployment}

echo "✅ Project structure created!"
```

### Backend Project Initialization

```bash
# Initialize backend project
echo "🚀 Initializing backend project..."
cd backend

# Create pyproject.toml
cat > pyproject.toml << 'EOF'
[tool.poetry]
name = "enterprise-backend"
version = "0.1.0"
description = "Enterprise Backend API"
authors = ["Your Name <your.email@example.com>"]

[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.104.1"
uvicorn = {extras = ["standard"], version = "^0.24.0"}
sqlalchemy = "^2.0.23"
asyncpg = "^0.29.0"
alembic = "^1.12.1"
pydantic = "^2.5.0"
pydantic-settings = "^2.1.0"
python-jose = {extras = ["cryptography"], version = "^3.3.0"}
passlib = {extras = ["bcrypt"], version = "^1.7.4"}
python-multipart = "^0.0.6"
redis = "^5.0.1"
celery = "^5.3.4"
structlog = "^23.2.0"
prometheus-fastapi-instrumentator = "^6.1.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.3"
pytest-asyncio = "^0.21.1"
httpx = "^0.25.2"
black = "^23.11.0"
isort = "^5.12.0"
flake8 = "^6.1.0"
mypy = "^1.7.1"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"

[tool.black]
line-length = 88
target-version = ['py311']

[tool.isort]
profile = "black"
line_length = 88

[tool.mypy]
python_version = "3.11"
strict = true
EOF

# Install dependencies
poetry install

# Create basic FastAPI app
cat > app/main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Enterprise API",
    description="Production-ready enterprise application API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Enterprise API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
EOF

# Create basic configuration
cat > app/core/config.py << 'EOF'
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Enterprise API"
    debug: bool = False
    database_url: str = "postgresql+asyncpg://devuser:devpassword@localhost/enterprise_dev"
    redis_url: str = "redis://localhost:6379"
    secret_key: str = "your-secret-key-change-in-production"
    
    class Config:
        env_file = ".env"

settings = Settings()
EOF

echo "✅ Backend project initialized!"
```

### Frontend Project Initialization

```bash
# Initialize frontend project
echo "⚛️ Initializing frontend project..."
cd ../frontend

# Create Next.js project with TypeScript
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Install additional dependencies
pnpm add \
    @hookform/resolvers \
    @radix-ui/react-alert-dialog \
    @radix-ui/react-button \
    @radix-ui/react-card \
    @radix-ui/react-dialog \
    @radix-ui/react-dropdown-menu \
    @radix-ui/react-form \
    @radix-ui/react-input \
    @radix-ui/react-label \
    @radix-ui/react-select \
    @radix-ui/react-table \
    @tanstack/react-query \
    axios \
    class-variance-authority \
    clsx \
    lucide-react \
    next-themes \
    react-hook-form \
    tailwind-merge \
    tailwindcss-animate \
    zod \
    zustand

# Install development dependencies
pnpm add -D \
    @types/node \
    @typescript-eslint/eslint-plugin \
    @typescript-eslint/parser \
    eslint-config-prettier \
    prettier \
    prettier-plugin-tailwindcss

# Initialize Shadcn-UI
npx shadcn-ui@latest init -d

echo "✅ Frontend project initialized!"
```

### Development Scripts Creation

```bash
# Create development scripts
echo "📝 Creating development scripts..."
cd ..

# Backend development script
cat > scripts/dev-backend.sh << 'EOF'
#!/bin/bash
cd backend
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
EOF

# Frontend development script
cat > scripts/dev-frontend.sh << 'EOF'
#!/bin/bash
cd frontend
pnpm dev
EOF

# Database migration script
cat > scripts/migrate.sh << 'EOF'
#!/bin/bash
cd backend
poetry run alembic upgrade head
EOF

# Test script
cat > scripts/test.sh << 'EOF'
#!/bin/bash
echo "Running backend tests..."
cd backend
poetry run pytest

echo "Running frontend tests..."
cd ../frontend
pnpm test
EOF

# Make scripts executable
chmod +x scripts/*.sh

echo "✅ Development scripts created!"
```

### Docker Development Environment

```bash
# Create Docker Compose for development
echo "🐳 Creating Docker development environment..."

cat > docker-compose.dev.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: enterprise_dev
      POSTGRES_USER: devuser
      POSTGRES_PASSWORD: devpassword
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infrastructure/docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://devuser:devpassword@postgres/enterprise_dev
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./backend:/app
    depends_on:
      - postgres
      - redis
    command: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
EOF

# Create development Dockerfiles
mkdir -p backend infrastructure/docker/postgres

cat > backend/Dockerfile.dev << 'EOF'
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml poetry.lock ./
RUN pip install poetry && poetry config virtualenvs.create false && poetry install

COPY . .

CMD ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
EOF

cat > frontend/Dockerfile.dev << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
EOF

echo "✅ Docker development environment created!"
```

### IDE Configuration

```bash
# Create VS Code workspace configuration
echo "💻 Creating IDE configuration..."

mkdir -p .vscode

cat > .vscode/settings.json << 'EOF'
{
  "python.defaultInterpreterPath": "./backend/.venv/bin/python",
  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "python.linting.mypyEnabled": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "eslint.workingDirectories": ["frontend"],
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
EOF

cat > .vscode/launch.json << 'EOF'
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/backend/.venv/bin/uvicorn",
      "args": ["app.main:app", "--reload"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal"
    },
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "cwd": "${workspaceFolder}/frontend"
    }
  ]
}
EOF

echo "✅ IDE configuration created!"
```

### Environment Configuration

```bash
# Create environment files
echo "🔧 Creating environment configuration..."

# Backend environment
cat > backend/.env.example << 'EOF'
# Application
APP_NAME="Enterprise API"
DEBUG=true
SECRET_KEY="your-secret-key-change-in-production"

# Database
DATABASE_URL="postgresql+asyncpg://devuser:devpassword@localhost/enterprise_dev"

# Redis
REDIS_URL="redis://localhost:6379"

# Email (optional)
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASSWORD=""

# AWS (optional)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET=""
EOF

# Frontend environment
cat > frontend/.env.example << 'EOF'
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:8000"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
EOF

# Copy example files to actual env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

echo "✅ Environment configuration created!"
```

### Final Setup and Verification

```bash
# Final setup and verification
echo "🔍 Running final setup and verification..."

# Install and configure pre-commit hooks
cd backend
poetry add --group dev pre-commit
poetry run pre-commit install

# Create pre-commit configuration
cat > .pre-commit-config.yaml << 'EOF'
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/psf/black
    rev: 23.11.0
    hooks:
      - id: black

  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort

  - repo: https://github.com/pycqa/flake8
    rev: 6.1.0
    hooks:
      - id: flake8
EOF

cd ..

# Create README with setup instructions
cat > README.md << 'EOF'
# Enterprise Application

A modern, scalable enterprise application built with FastAPI and Next.js.

## Quick Start

1. **Start the development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Or run services individually:**
   ```bash
   # Backend
   ./scripts/dev-backend.sh
   
   # Frontend (in another terminal)
   ./scripts/dev-frontend.sh
   ```

3. **Access the applications:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Development

- Backend: FastAPI + SQLAlchemy + PostgreSQL
- Frontend: Next.js + TypeScript + Tailwind CSS
- Database: PostgreSQL + Redis
- Containerization: Docker + Docker Compose

## Testing

```bash
./scripts/test.sh
```

## Documentation

- [Architecture](docs/architecture/)
- [API Documentation](docs/api/)
- [Deployment Guide](docs/deployment/)
EOF

echo "🎉 Enterprise development environment setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. cd ~/enterprise-app"
echo "2. Review and update .env files with your configuration"
echo "3. Start development: docker-compose -f docker-compose.dev.yml up -d"
echo "4. Visit http://localhost:3000 for frontend and http://localhost:8000/docs for API"
echo ""
echo "🚀 Happy coding!"
```

## Advanced Development Patterns

### Domain-Driven Design Implementation

```python
# domain/entities/user.py
from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class UserEntity:
    id: Optional[int]
    email: str
    username: str
    full_name: str
    hashed_password: str
    is_active: bool = True
    is_verified: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def change_password(self, new_password_hash: str):
        """Business rule: Password change updates timestamp"""
        self.hashed_password = new_password_hash
        self.updated_at = datetime.utcnow()
    
    def verify_email(self):
        """Business rule: Email verification activates user"""
        self.is_verified = True
        self.updated_at = datetime.utcnow()
    
    def deactivate(self):
        """Business rule: Deactivation maintains data integrity"""
        self.is_active = False
        self.updated_at = datetime.utcnow()
```

### Advanced Error Handling

```python
# core/exceptions.py
from fastapi import HTTPException, status
from typing import Any, Dict, Optional

class ApplicationException(Exception):
    """Base application exception"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

class ValidationException(ApplicationException):
    """Raised when business rule validation fails"""
    pass

class EntityNotFoundException(ApplicationException):
    """Raised when entity is not found"""
    pass

class DuplicateEntityException(ApplicationException):
    """Raised when attempting to create duplicate entity"""
    pass

# Exception handlers
@app.exception_handler(EntityNotFoundException)
async def entity_not_found_handler(request: Request, exc: EntityNotFoundException):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "success": False,
            "error": {
                "code": "ENTITY_NOT_FOUND",
                "message": exc.message,
                "details": exc.details
            }
        }
    )

@app.exception_handler(ValidationException)
async def validation_exception_handler(request: Request, exc: ValidationException):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": exc.message,
                "details": exc.details
            }
        }
    )
```

## Production Deployment Guide

### Production Docker Configuration

```dockerfile
# Production backend Dockerfile
FROM python:3.11-slim as builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY pyproject.toml poetry.lock ./
RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --only=main --no-dev

# Production stage
FROM python:3.11-slim

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application
COPY . .
RUN chown -R appuser:appuser /app

USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
