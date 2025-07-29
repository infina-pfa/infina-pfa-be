# Infina PFA Financial Service Migration Plan

> **Version**: 1.0  
> **Date**: 2025-07-29  
> **Status**: Planning Phase  
> **Estimated Timeline**:  
> **Scope**: Financial Service Only (EST: 26 APIs)

## 📋 Executive Summary

This document outlines the focused plan to extract the financial service from the monolithic Next.js application into a dedicated NestJS service following Domain-Driven Design (DDD) and Clean Architecture principles:

1. **Financial Service** (NestJS + DDD + Clean Architecture + PrismaORM + PostgreSQL)
2. **Web Frontend Updates** (Next.js client integration)

The migration focuses on speed and core functionality preservation.

---

## 🎯 Current State Analysis

### **Monolithic Architecture Issues**

- **35+ API endpoints** mixed in `/app/api/` directory
- **Tight coupling** between financial logic and AI processing
- **Performance bottlenecks** due to shared resources
- **Scaling limitations** - cannot independently scale AI vs financial operations
- **Development complexity** - single codebase for different domains

### **Current Technology Stack**

```
Next.js 15 (App Router)
├── Frontend: React 19 + TypeScript
├── Backend: Next.js API Routes
├── Database: Supabase (PostgreSQL)
├── AI: OpenAI GPT-4 integration
├── State Management: SWR
└── Styling: Tailwind CSS
```

### **Migration Scope**

- **Financial APIs**: 35+ endpoints (budgets, goals, income, users)
- **Database Tables**: 6 core financial tables

---

### **Financial Service (NestJS + DDD + Clean Architecture)**

**Technology Stack:**

- **Framework**: NestJS (Node.js/TypeScript)
- **Architecture**: Domain-Driven Design + Clean Architecture
- **ORM**: PrismaORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Validation**: class-validator + class-transformer
- **Testing**: Jest

**Current DDD Domain Structure:**

```
src/
├── common/                    # Shared Common Layer
│   ├── entities/             # Base entity classes
│   ├── repositories/         # Base repository classes & implementations
│   ├── value-objects/        # Shared value objects (Email, Password)
│   ├── guards/              # Authentication guards (SupabaseAuthGuard)
│   ├── decorators/          # Custom decorators (@CurrentUser, @Public)
│   ├── interceptors/        # Response and logging interceptors
│   ├── filters/             # Exception filters
│   ├── prisma/              # Prisma client configuration
│   └── types/               # Shared type definitions
├── {domain}/                 # Domain Modules (budgeting/, user/)
│   ├── controllers/         # REST controllers with Swagger docs
│   │   └── dto/            # Request/Response DTOs
│   ├── domain/             # Pure Domain Layer
│   │   ├── entities/       # Domain entities extending BaseEntity
│   │   ├── repositories/   # Abstract repository interfaces
│   │   ├── services/       # Domain services for business logic
│   │   └── projections/    # View models for complex queries
│   ├── infrastructure/     # Infrastructure Layer
│   │   ├── repositories/   # Prisma repository implementations
│   │   └── services/       # External service integrations
│   ├── use-cases/          # Application Use Cases
│   └── module/             # NestJS module configuration
└── main.ts                 # Application bootstrap
```

**Core Responsibilities:**

- User data management and authentication
- Financial logic (budgets, goals, income, transactions)
- Business rules and domain validations
- Financial calculations and analytics
- Data persistence and retrieval

---

## 📋 Feature-Based Migration Plan

> **Approach**: Build financial service with independently shippable features. Each feature is complete, tested, and delivers immediate user value. Ship features as they're completed, not on a fixed schedule.

### **🏗️ Foundation Features (Required First)**

**Infrastructure Setup**

- NestJS 11 + TypeScript 5.7 project setup
- DDD + Clean Architecture folder structure
- Prisma 6.12 + PostgreSQL (Supabase) integration
- Authentication infrastructure (Supabase Auth)
- Base entities, repositories, and value objects
- API documentation (Swagger) setup
- Testing framework (Jest) configuration

### **🎯 Feature Categories & Dependencies**

**📚 Foundation Features (Must be completed first)**

- F1: Project Setup & Infrastructure
- F2: User Authentication & Management

**💰 Core Financial Features (Can be built in any order after Foundation)**

- F3: Budget Management
- F4: Goal Management
- F5: Income Tracking
- F6: Integrate with AI service - onboarding
- F7: Integrate with AI service - daily chat

---

## **Foundation Features**

### **F1: Project Setup & Infrastructure**

**🎯 Delivery Value**: Scalable development foundation ready for all features

**Feature Scope:**

- Complete NestJS project setup with TypeScript
- DDD folder structure (`common/`, domain modules)
- Base entities, repositories, and value objects
- Prisma + PostgreSQL integration
- Authentication infrastructure setup
- Testing and documentation framework

**Technical Implementation:**

- Initialize NestJS project with strict TypeScript
- Create DDD folder structure: `src/{common,domain}/`
- Setup BaseEntity, BaseRepository, BaseValueObject classes
- Configure Prisma with Supabase PostgreSQL
- Setup Supabase Auth integration and guards
- Configure Swagger for API documentation
- Setup Jest testing framework

**API Endpoints:**

```
GET /api/health           # Health check endpoint
```

**✅ Ship When**: Development environment is fully operational

---

### **F2: User Authentication & Management**

**🎯 Delivery Value**: Users can register, login, and manage their accounts

**Feature Scope:**

- User registration with email validation
- User login with JWT tokens
- Basic user profile management

**Technical Implementation:**

- Create User domain (entity, repository, use cases)
- Implement UserController with auth endpoints
- Setup SupabaseAuthGuard with @CurrentUser() decorator
- Create user DTOs with validation
- Implement user profile use cases

**API Endpoints:**

```
GET  /api/users/profile       # Get user profile
PUT  /api/users/profile       # Update user profile
```

**✅ Ship When**: Users can successfully register, login, and manage profiles

---

## **Core Financial Features**

### **F3: Budget Management**

**🎯 Delivery Value**: Users can create and manage monthly budgets

**Feature Scope:**

- Create monthly budgets with categories
- View budget list with spending and details in month
- Basic budget validation and rules
- Budget create, update, archive
- Add, update, delete spending for a budget

**Technical Implementation:**

- Create Budget domain (entity, repository, use cases)
- Implement BudgetController with CRUD endpoints
- Create budget DTOs with validation
- Setup budget categories (Fixed, Flexible)
- Implement basic budget business rules
- Create database schema and migration

**API Endpoints:**

```
POST /api/budgets             # Create budget
GET  /api/budgets             # List user budgets
GET  /api/budgets/:id         # Get budget details
PUT  /api/budgets/:id         # Update budget
DELETE /api/budgets/:id       # Delete budget
GET /api/budgets/spendings              # Get all spending of all budgets in month
POST /api/budgets/:id/spending          # Add a spending
PUT /api/budgets/:id/spending/:id       # Update a spending
DELETE /api/budgets/:id/spending/:id    # Delete a spending
```

**Dependencies**: F1, F2
**✅ Ship When**: Users can create, view, edit, and delete budgets

---

### **F4: Goal Management**

**🎯 Delivery Value**: Users can set and track financial goals

**Feature Scope:**

- Create financial goals (emergency fund, etc.)
- Get list of financial goals
- Get list of transaction of all goals in month

**Technical Implementation:**

- Create Goal domain (entity, repository, use cases)
- Implement GoalController with CRU, archive endpoints
- Goal progress calculation service
- Goal DTOs with validation and progress tracking
- Database schema for goals table
- Get list of transactions for all goals

**API Endpoints:**

```
POST /api/goals               # Create new goal
GET  /api/goals               # List user goals
GET  /api/goals/:id           # Get goal with progress
POST /api/goals/              # Update goal
POST /api/goals/archive       # Archive goal
GET  /api/goals/transactions  # Get all transactions of all goals in month
```

**Dependencies**: F1, F2
**✅ Ship When**: Users can create goals and track progress

---

### **F5: Income Tracking**

**🎯 Delivery Value**: Users can manage multiple income sources

**Feature Scope:**

- Add multiple income sources (salary, freelance, etc.)
- Monthly income tracking and projections

**Technical Implementation:**

- Create Income domain (entity, repository, use cases)
- Implement IncomeController with CRUD endpoints

**API Endpoints:**

```
POST /api/incomes             # Create income source
GET  /api/incomes             # List income sources
PUT  /api/incomes/:id         # Update income
DELETE /api/incomes/:id       # Delete income
```

**Dependencies**: F1, F2
**✅ Ship When**: Users can track all income sources

---

### **F6: Integrate with AI service - onboarding**

**🎯 Delivery Value**: User can chat with AI advisor in onboarding.

**Feature Scope:**

- Onboarding conversation management
- Chat with AI advisor in onboarding flow
- Streaming the message from AI service

**Technical Implementation:**

- API endpoints listed below
- Integrate with AI service

**API Endpoints:**

```
GET  /api/onboarding/messages          # Get all onboarding message
POST /api/onboarding/messages          # Send message to ai advisor
POST /api/onboarding/complete         # Complete onboarding flow
```

**Dependencies**: F3, F4, F5
**✅ Ship When**: Users can complete onboarding flow

---

### **F7: Integrate with AI service - daily chat**

**🎯 Delivery Value**: User can chat with AI advisor

**Feature Scope:**

- Create new conversations
- Chat with AI advisor after onboarding
- Streaming the message from AI service

**Technical Implementation:**

- API endpoints listed below
- Integrate with AI service

**API Endpoints:**

```
POST /api/conversations               # Create a conversation
POST /api/conversations/messages      # Send message to ai advisor
```

**Dependencies**: F3, F4, F5
**✅ Ship When**: Users can chat with AI advisor

---

## 🚀 Backend Development Strategy

> **Approach**: Ship complete backend features when ready, not on fixed schedules. Each feature includes domain implementation, API endpoints, and comprehensive testing.

### **Backend Feature Completion Pattern**

**For Each Backend Feature**:

1. **Domain Development**: Entities, repositories, use cases
2. **API Implementation**: Controllers, DTOs, validation
3. **Testing**: Unit tests, integration tests
4. **Documentation**: API docs and technical documentation

### **Frontend Integration**

Frontend development is handled separately and documented in: 📋 **[Frontend Migration Plan](./frontend-migration.md)**

The frontend features are designed to integrate with the backend APIs as they become available, following the same feature-based shipping approach.

---

## ⚡ Deployment & Testing Strategy

### **Backend Deployment Pipeline**

**Feature-Based Deployment Process:**

1. **Feature Branch**: Each feature in separate branch
2. **Automated Testing**: Unit tests + integration tests + API tests
3. **Staging Deploy**: Automatic deployment to staging environment
4. **Production Deploy**: After manual verification and testing

**Backend Testing Strategy:**

- **Unit Tests**: Domain logic and use case testing
- **Integration Tests**: Repository and database integration
- **API Tests**: Endpoint testing with Supertest
- **Contract Tests**: API contract validation for frontend integration

---

## 🎯 Success Metrics

### **Technical Metrics**

- ✅ **API Response Time**: <200ms for financial operations
- ✅ **Service Availability**: 99.9% uptime
- ✅ **Database Performance**: <100ms query response
- ✅ **Zero Data Loss**: All existing data preserved
- ✅ **Feature Parity**: 100% functionality maintained

### **Development Metrics**

- ✅ **Test Coverage**: >80% for Financial Service
- ✅ **Code Quality**: Clean Architecture compliance
- ✅ **Documentation**: 100% API coverage
- ✅ **Migration Success**: No regression in user experience

**Note**: AI Service planning and implementation deferred to future phase based on user request. This plan focuses exclusively on Financial Service extraction and Web Frontend integration.
