# Architecture Overview

This is a **NestJS 11 TypeScript backend** for Infina Personal Finance Advisor that follows **Clean Architecture** and **Domain-Driven Design** principles.

## Core Technology Stack

- **Framework**: NestJS 11.x with TypeScript 5.7
- **Database**: PostgreSQL via Supabase (multi-schema: `auth`, `public`)
- **ORM**: Prisma 6.12 with client generation to `generated/prisma`
- **Authentication**: Supabase Auth with JWT tokens
- **API Documentation**: Swagger/OpenAPI at `/api`
- **Testing**: Jest with ts-jest

## Domain Architecture

The codebase uses **domain modules** with clear separation:

```
src/
├── budgeting/           # Budget management domain
├── user/               # User management domain
├── common/             # Shared infrastructure
└── app.module.ts       # Root module
```

Each domain follows the pattern:

- `controllers/` - HTTP endpoints
- `domain/` - Entities, repositories, services, value objects
- `infrastructure/` - Repository, service implementations
- `use-cases/` - Business logic
- `module/` - NestJS module configuration

## Key Patterns

**Repository Pattern**: Abstract base repositories with Prisma implementations
**Use Cases**: Business logic isolated in dedicated classes
**Value Objects**: Domain primitives (Email, Password)
**Guards**: Global `SupabaseAuthGuard` with `@Public()` decorator bypass
**Decorators**: `@CurrentUser()` extracts authenticated user from request

## Database Schema

Multi-schema Prisma setup with:

- **auth schema**: Supabase authentication tables (users, sessions, etc.)
- **public schema**: Application domain models

Core entities:

- `budgets` - Monthly budget planning with categories
- `transactions` - Financial transactions with type (income/outcome/transfer)
- `goals` - Financial goals and savings targets
- `debts` - Debt tracking with interest rates
- `conversations/messages` - AI chat functionality
- `onboarding_*` - User onboarding flow

## Path Aliases

```typescript
"@/common/*": ["src/common/*"]
"@/budgeting/*": ["src/budgeting/*"]
"@/*": ["src/*"]
```

## Global Configuration

- **Global Guard**: `SupabaseAuthGuard` for JWT authentication
- **Global Interceptors**: `LoggingInterceptor`, `ResponseInterceptor`
- **Global Filters**: `HttpExceptionFilter`, `AllExceptionsFilter`
- **Swagger**: Auto-generated API docs with DTOs and decorators

## Authentication Flow

Users authenticate via Supabase Auth, with JWT tokens validated by `SupabaseAuthGuard`. Public endpoints use `@Public()` decorator. User context available via `@CurrentUser()` parameter decorator.

## Development Notes

- Prisma client generates to `generated/prisma` directory
- Database has Row Level Security (RLS) enabled
- All domain entities extend base classes from `common/entities`
- Repository implementations in `infrastructure/repositories`
- Use existing DTOs and validation patterns when adding new endpoints