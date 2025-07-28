# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

**Development**
- `npm run start:dev` - Start development server with watch mode
- `npm run build` - Build the application
- `npm run start:prod` - Start production server

**Testing**
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests

**Code Quality**
- `npm run lint` - Lint code with ESLint and auto-fix
- `npm run format` - Format code with Prettier

**Database**
- `npm run prisma:generate` - Generate Prisma client (outputs to `generated/prisma`)
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Architecture Overview

This is a **NestJS 11 TypeScript backend** for Infina Personal Finance Advisor following **Clean Architecture** and **Domain-Driven Design** principles.

**Tech Stack**: NestJS 11, TypeScript 5.7, PostgreSQL (Supabase), Prisma 6.12, Supabase Auth, Swagger

**Domain Structure**: Each domain module (`budgeting/`, `user/`) follows the pattern:
- `controllers/` - HTTP endpoints with Swagger documentation
- `domain/` - Entities, repositories, value objects
- `infrastructure/` - Repository implementations using Prisma
- `use-cases/` - Business logic classes
- `module/` - NestJS module configuration

**Key Patterns**:
- Repository Pattern with abstract base classes and Prisma implementations
- Use Cases for business logic isolation
- Value Objects for domain primitives (Email, Password)
- Global `SupabaseAuthGuard` with `@Public()` decorator for public endpoints
- `@CurrentUser()` decorator for authenticated user context

**Database**: Multi-schema Prisma setup with `auth` (Supabase) and `public` (application) schemas. Core entities include budgets, transactions, goals, debts, conversations, and onboarding data.

**Authentication**: Supabase Auth with JWT validation. Users available via `@CurrentUser()` in controllers.

## API Implementation Workflow

When implementing new APIs, follow this established 8-step pattern:

1. **Domain Entity** - Create in `domain/entities/` extending `BaseEntity`
2. **Repository Interface** - Define abstract repository in `domain/repositories/`
3. **Repository Implementation** - Implement with Prisma in `infrastructure/repositories/`
4. **DTOs** - Create request/response DTOs in `controllers/dto/` with `@ApiProperty` for Swagger
5. **Use Cases** - Business logic in `use-cases/` using repository abstractions
6. **Controller** - HTTP endpoints with `@ApiOperation`, `@ApiResponse`, and `@CurrentUser()` decorator
7. **Module Configuration** - Wire dependencies in domain module
8. **Database Schema** - Update Prisma schema and run migrations

## Development Guidelines

- **Authentication**: Global `SupabaseAuthGuard` - use `@Public()` for public endpoints
- **User Context**: Access authenticated user via `@CurrentUser()` decorator
- **Response Format**: Use `.toObject()` on entities; global interceptor wraps responses
- **Validation**: Use class-validator decorators on DTOs for automatic validation
- **Documentation**: Every endpoint needs comprehensive Swagger documentation
- **Repository Pattern**: Always use abstract repositories in use cases
- **Type Safety**: Maintain strict TypeScript types throughout all layers
- **Testing**: Follow existing patterns in `*.spec.ts` files
- Extend base classes from `common/entities` for new domain entities
- Prisma client generates to `generated/prisma` directory
- Use path aliases: `@/common/*`, `@/budgeting/*`, `@/*`
- Always run `npm run prisma:generate` after pulling database schema changes

## Architectural Design Principles

### Entity Design
- **Entity Purity**: Entities represent core domain concepts, not API response shapes
- **No Derived Entities**: Never create new entities for computed/derived data (e.g., avoid `BudgetWithSpendingEntity`)
- **Single Responsibility**: One entity per aggregate root, focused on core domain behavior
- **Domain Focus**: Entities model business domain, not presentation requirements

### Handling Derived/Computed Data
When you need "Entity + computed data", use these patterns:

1. **Domain Service + Projection** (Recommended)
   - Domain Service handles cross-aggregate business logic
   - Projection classes represent view models for specific use cases
   - Example: `BudgetAnalyticsService` with `BudgetWithSpendingProjection`

2. **DTO Enrichment**
   - Keep entities pure, enrich DTOs in use cases
   - Compute derived data in use case layer before returning

3. **Enhanced Aggregates**
   - Add computed methods to existing aggregates
   - Override `toObject()` to include computed properties

### Anti-Patterns to Avoid
- ❌ Creating `EntityWithExtraDataEntity` for each new derived attribute
- ❌ Mixing domain logic with presentation concerns in entities
- ❌ Entity proliferation for different API response shapes
- ❌ N+1 query patterns for computed data

### Pattern Selection Guide
- **Cross-aggregate logic** → Domain Service
- **Simple computed properties** → Enhanced Aggregate methods
- **Complex view requirements** → Projection pattern
- **API-specific enrichment** → DTO enrichment in use cases