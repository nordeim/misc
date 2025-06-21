# Enterprise Application Architecture: Python Backend + Next.js Frontend

## Understanding REST API

REST (Representational State Transfer) is an architectural style for designing networked applications. A REST API is an application programming interface that adheres to REST principles, enabling different software systems to communicate over HTTP/HTTPS protocols.

### Core REST Principles:
- **Client-Server Architecture**: Separation of concerns between UI and data storage
- **Statelessness**: Each request contains all information needed to understand it
- **Cacheability**: Responses must define themselves as cacheable or non-cacheable
- **Uniform Interface**: Standardized way of communicating between client and server
- **Layered System**: Architecture composed of hierarchical layers
- **Code on Demand** (optional): Servers can extend client functionality

### REST API Best Practices:
- Use HTTP methods semantically (GET, POST, PUT, DELETE, PATCH)
- Design resource-based URLs (nouns, not verbs)
- Implement proper status codes (200, 201, 400, 401, 404, 500, etc.)
- Version your API (/api/v1/, /api/v2/)
- Use consistent naming conventions (camelCase or snake_case)
- Implement pagination for large datasets
- Provide comprehensive error messages

## Enterprise Application Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Load Balancer (Nginx)                     │
└─────────────────────────────────────────────────────────────────┘
                                  │
        ┌─────────────────────────┴─────────────────────────┐
        │                                                   │
┌───────▼────────┐                               ┌─────────▼────────┐
│   Next.js App  │                               │   Python API     │
│   (Frontend)   │◄──────── HTTPS/WSS ──────────►│   (Backend)      │
└────────────────┘                               └──────────────────┘
                                                          │
                                    ┌─────────────────────┼─────────────────────┐
                                    │                     │                     │
                            ┌───────▼────────┐   ┌────────▼────────┐   ┌────────▼────────┐
                            │   PostgreSQL   │   │     Redis       │   │   Message Queue │
                            │   (Primary DB) │   │    (Cache)      │   │    (Celery)     │
                            └────────────────┘   └─────────────────┘   └─────────────────┘
```

## Backend Architecture (Python)

### Technology Stack

**Core Framework**: FastAPI
- Modern, fast, and production-ready
- Automatic API documentation
- Built-in data validation with Pydantic
- Async support
- Type hints support

**Key Libraries**:
```python
# Core dependencies
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
python-jose[cryptography]==3.3.0  # JWT handling
passlib[bcrypt]==1.7.4           # Password hashing
python-multipart==0.0.6          # File uploads

# Database
sqlalchemy==2.0.23
alembic==1.12.1                  # Database migrations
asyncpg==0.29.0                  # Async PostgreSQL driver

# Caching & Background Tasks
redis==5.0.1
celery==5.3.4
flower==2.0.1                    # Celery monitoring

# Utilities
python-dotenv==1.0.0
httpx==0.25.2                    # Async HTTP client
email-validator==2.1.0

# Testing
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
```

### Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app initialization
│   ├── config.py            # Configuration management
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py      # Authentication endpoints
│   │   │   ├── users.py     # User management
│   │   │   ├── resources.py # Business resources
│   │   │   └── router.py    # API router aggregation
│   │   └── dependencies.py  # Shared dependencies
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py      # Security utilities
│   │   ├── database.py      # Database configuration
│   │   ├── cache.py         # Redis configuration
│   │   └── celery_app.py    # Celery configuration
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py          # SQLAlchemy base
│   │   ├── user.py          # User model
│   │   └── resource.py      # Business models
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py          # Pydantic schemas
│   │   └── resource.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication logic
│   │   ├── user.py          # User business logic
│   │   └── resource.py      # Resource business logic
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── base.py          # Base repository pattern
│   │   └── user.py          # User data access
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── cors.py          # CORS configuration
│   │   ├── logging.py       # Request logging
│   │   └── rate_limit.py    # Rate limiting
│   └── utils/
│       ├── __init__.py
│       ├── pagination.py    # Pagination helpers
│       └── exceptions.py    # Custom exceptions
├── migrations/              # Alembic migrations
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   └── test_resources.py
├── .env.example
├── requirements.txt
└── docker-compose.yml
```

### Key Implementation Patterns

#### 1. Repository Pattern for Data Access
```python
# repositories/base.py
from typing import Generic, TypeVar, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

ModelType = TypeVar("ModelType")

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: type[ModelType], session: AsyncSession):
        self.model = model
        self.session = session
    
    async def get(self, id: int) -> Optional[ModelType]:
        result = await self.session.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()
    
    async def list(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        result = await self.session.execute(
            select(self.model).offset(skip).limit(limit)
        )
        return result.scalars().all()
```

#### 2. Service Layer Pattern
```python
# services/user.py
from typing import Optional
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import hash_password

class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository
    
    async def create_user(self, user_data: UserCreate) -> User:
        user_data.password = hash_password(user_data.password)
        return await self.user_repository.create(user_data)
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        return await self.user_repository.get_by_email(email)
```

#### 3. Dependency Injection
```python
# api/dependencies.py
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_session
from app.repositories.user import UserRepository
from app.services.user import UserService

async def get_user_service(
    session: AsyncSession = Depends(get_session)
) -> UserService:
    user_repository = UserRepository(session)
    return UserService(user_repository)
```

### Authentication & Authorization

Implement JWT-based authentication with refresh tokens:

```python
# core/security.py
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise ValueError("Invalid token")
```

## Frontend Architecture (Next.js + TypeScript)

### Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js 13+ App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── (auth)/             # Auth group route
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── (dashboard)/        # Protected routes
│   │       ├── layout.tsx
│   │       └── dashboard/
│   ├── components/
│   │   ├── ui/                 # Shadcn-UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── form.tsx
│   │   ├── layouts/
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── features/           # Feature-specific components
│   │       ├── auth/
│   │       └── dashboard/
│   ├── lib/
│   │   ├── api/                # API client
│   │   │   ├── client.ts       # Axios/Fetch wrapper
│   │   │   ├── auth.ts         # Auth API calls
│   │   │   └── resources.ts    # Resource API calls
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   └── useApi.ts
│   │   ├── utils/              # Utility functions
│   │   └── validations/        # Zod schemas
│   ├── store/                  # State management (Zustand)
│   │   ├── auth.store.ts
│   │   └── app.store.ts
│   ├── types/                  # TypeScript types
│   │   ├── api.types.ts
│   │   └── app.types.ts
│   └── styles/
│       └── globals.css         # Tailwind CSS
├── public/
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Key Frontend Patterns

#### 1. API Client with Interceptors
```typescript
// lib/api/client.ts
import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '@/store/auth.store';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
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
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle token refresh
          await this.refreshToken();
        }
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken() {
    // Implement token refresh logic
  }

  get api() {
    return this.instance;
  }
}

export const apiClient = new ApiClient().api;
```

#### 2. Type-Safe API Hooks
```typescript
// lib/hooks/useApi.ts
import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';

interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: AxiosError) => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      setData(result);
      options.onSuccess?.(result);
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError);
      options.onError?.(axiosError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, []);

  return { data, loading, error, execute };
}
```

#### 3. Form Handling with React Hook Form & Zod
```typescript
// components/features/auth/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    // Handle login
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register('email')}
        type="email"
        placeholder="Email"
        error={errors.email?.message}
      />
      <Input
        {...register('password')}
        type="password"
        placeholder="Password"
        error={errors.password?.message}
      />
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
```

### State Management with Zustand

```typescript
// store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      updateTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        refreshToken: state.refreshToken,
      }),
    }
  )
);
```

## Infrastructure & Deployment

### Docker Configuration

```dockerfile
# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
```

### Environment Configuration

Backend `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

Frontend `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8000/ws
```

## Security Best Practices

1. **API Security**:
   - Implement rate limiting
   - Use HTTPS in production
   - Validate all inputs
   - Implement CORS properly
   - Use security headers

2. **Authentication**:
   - Store passwords hashed with bcrypt
   - Implement JWT with short expiration
   - Use refresh tokens for extended sessions
   - Implement logout functionality

3. **Frontend Security**:
   - Sanitize user inputs
   - Use Content Security Policy
   - Implement proper CORS
   - Avoid storing sensitive data in localStorage

## Monitoring & Logging

Implement comprehensive monitoring:

1. **Application Monitoring**:
   - Use Sentry for error tracking
   - Implement structured logging
   - Monitor API response times
   - Track user activities

2. **Infrastructure Monitoring**:
   - Use Prometheus + Grafana
   - Monitor resource usage
   - Set up alerts for critical issues

## Conclusion

This architecture provides a solid foundation for building scalable enterprise applications. The separation of concerns, type safety, and modern development practices ensure maintainability and developer productivity. The use of established patterns like repository pattern, service layer, and proper state management on the frontend creates a robust system that can grow with your business needs.

Key advantages of this architecture:
- **Scalability**: Microservices-ready with clear boundaries
- **Type Safety**: Full TypeScript on frontend, type hints on backend
- **Developer Experience**: Hot reloading, auto-documentation, consistent patterns
- **Production Ready**: Comprehensive error handling, monitoring, and security
- **Maintainable**: Clear structure and separation of concerns

Remember to adapt this architecture to your specific needs, but these patterns and practices will serve as an excellent starting point for most enterprise applications.
