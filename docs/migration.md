# Infina PFA Financial Service Migration Plan

> **Version**: 1.0  
> **Date**: 2025-07-29  
> **Status**: Planning Phase  
> **Estimated Timeline**: 2-3 weeks (120 hours)  
> **Scope**: Web Frontend + Financial Service Only

## 📋 Executive Summary

This document outlines the focused plan to extract the financial service from the monolithic Next.js application into a dedicated NestJS service following Domain-Driven Design (DDD) and Clean Architecture principles:

1. **Financial Service** (NestJS + DDD + Clean Architecture + PrismaORM + PostgreSQL)
2. **Web Frontend Updates** (Next.js client integration)

The migration focuses on speed and core functionality preservation, with AI service planning deferred to a later phase.

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

- **Financial APIs**: 23 endpoints (budgets, goals, income, transactions, users)
- **Service Layers**: 7 financial services in `/lib/services/`
- **Database Tables**: 6 core financial tables
- **Frontend Integration**: SWR hooks and API clients

---

### **Financial Service (NestJS + DDD + Clean Architecture)**

**Technology Stack:**

- **Framework**: NestJS (Node.js/TypeScript)
- **Architecture**: Domain-Driven Design + Clean Architecture
- **ORM**: PrismaORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Validation**: class-validator + class-transformer
- **Testing**: Jest + Supertest

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

**Infrastructure Setup** - _Estimated: 8 hours_

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

---

## **Foundation Features**

### **F1: Project Setup & Infrastructure** ⏱️ **6 hours**

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

### **F2: User Authentication & Management** ⏱️ **8 hours**

**🎯 Delivery Value**: Users can register, login, and manage their accounts

**Feature Scope:**

- User registration with email validation
- User login with JWT tokens
- Basic user profile management
- Password reset functionality

**Technical Implementation:**

- Create User domain (entity, repository, use cases)
- Implement UserController with auth endpoints
- Setup SupabaseAuthGuard with @CurrentUser() decorator
- Create user DTOs with validation
- Setup Email and Password value objects
- Implement user profile use cases

**API Endpoints:**

```
POST /api/auth/register       # User registration
POST /api/auth/login          # User login
POST /api/auth/reset-password # Password reset
GET  /api/users/profile       # Get user profile
PUT  /api/users/profile       # Update user profile
```

**✅ Ship When**: Users can successfully register, login, and manage profiles

---

## **Core Financial Features**

### **F3: Budget Management** ⏱️ **8 hours**

**🎯 Delivery Value**: Users can create and manage monthly budgets

**Feature Scope:**

- Create monthly budgets with categories
- View budget list and details
- Basic budget validation and rules
- Budget CRUD operations

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
```

**Dependencies**: F1, F2
**✅ Ship When**: Users can create, view, edit, and delete budgets

---

### **F4: Goal Management** ⏱️ **8 hours**

**🎯 Delivery Value**: Users can set and track financial goals

**Feature Scope:**

- Create financial goals (emergency fund, etc.)
- Goal progress tracking with percentages
- Goal deadline management
- Goal completion celebrations

**Technical Implementation:**

- Create Goal domain (entity, repository, use cases)
- Implement GoalController with CRUD endpoints
- Goal progress calculation service
- Goal DTOs with validation and progress tracking
- Database schema for goals table

**API Endpoints:**

```
POST /api/goals               # Create new goal
GET  /api/goals               # List user goals
GET  /api/goals/:id           # Get goal with progress
PUT  /api/goals/:id           # Update goal
PUT  /api/goals/:id/progress  # Update goal progress
DELETE /api/goals/:id         # Delete goal
```

**Dependencies**: F1, F2
**✅ Ship When**: Users can create goals and track progress

---

### **F5: Transaction Management** ⏱️ **8 hours**

**🎯 Delivery Value**: Users can record all financial transactions

**Feature Scope:**

- Record income and expense transactions
- Transaction categorization and tagging
- Transaction history with filtering
- Integration with budgets and goals

**Technical Implementation:**

- Create Transaction domain (entity, repository, use cases)
- Implement TransactionController with CRUD endpoints
- Transaction categorization service
- Transaction DTOs with validation
- Integration with budget spending calculations

**API Endpoints:**

```
POST /api/transactions        # Create transaction
GET  /api/transactions        # List transactions with filters
GET  /api/transactions/:id    # Get transaction details
PUT  /api/transactions/:id    # Update transaction
DELETE /api/transactions/:id  # Delete transaction
```

**Dependencies**: F1, F2, F3 (for budget integration)
**✅ Ship When**: Users can record and manage all transactions

---

### **F6: Income Tracking** ⏱️ **8 hours**

**🎯 Delivery Value**: Users can manage multiple income sources

**Feature Scope:**

- Add multiple income sources (salary, freelance, etc.)
- Monthly income tracking and projections
- Income vs expense analysis
- Income source categorization

**Technical Implementation:**

- Create Income domain (entity, repository, use cases)
- Implement IncomeController with CRUD endpoints
- Income categorization and tracking service
- Income DTOs with source management
- Integration with financial overview calculations

**API Endpoints:**

```
POST /api/incomes             # Create income source
GET  /api/incomes             # List income sources
GET  /api/incomes/:id         # Get income details
PUT  /api/incomes/:id         # Update income
DELETE /api/incomes/:id       # Delete income
GET  /api/incomes/summary     # Income summary and projections
```

**Dependencies**: F1, F2
**✅ Ship When**: Users can track all income sources

---

## **Analytics Features**

### **F7: Budget Analytics** ⏱️ **8 hours**

**🎯 Delivery Value**: Users can track spending against their budgets

**Feature Scope:**

- Budget vs actual spending comparison
- Spending percentage calculations
- Budget remaining amounts
- Basic spending analytics

**Technical Implementation:**

- Create BudgetAnalyticsService for calculations
- Implement budget projections and analytics
- Create BudgetWithSpendingProjection for complex queries
- Enhanced budget use cases with analytics
- Advanced budget DTOs with spending data

**API Endpoints:**

```
GET /api/budgets/with-spending    # Budgets with spending analytics
GET /api/budgets/:id/analytics    # Detailed budget analysis
GET /api/budgets/summary          # Budget overview summary
```

**Dependencies**: F3, F5
**✅ Ship When**: Users get insights into budget performance

---

### **F8: Goal Progress & Milestones** ⏱️ **8 hours**

**🎯 Delivery Value**: Users get enhanced goal tracking with milestones

**Feature Scope:**

- Goal milestones and checkpoints
- Goal progress notifications
- Goal achievement celebrations
- Goal sharing and social features
- Smart goal recommendations

**Technical Implementation:**

- Enhanced Goal domain with milestones
- Goal notification service
- Achievement tracking system
- Goal recommendation algorithms
- Social sharing DTOs and endpoints

**API Endpoints:**

```
POST /api/goals/:id/milestones    # Create goal milestones
GET  /api/goals/:id/milestones    # List goal milestones
PUT  /api/goals/:id/milestones/:milestoneId # Update milestone
GET  /api/goals/achievements      # List achievements
POST /api/goals/:id/share         # Share goal progress
GET  /api/goals/recommendations   # Get goal recommendations
```

**Dependencies**: F4
**✅ Ship When**: Enhanced goal tracking is complete

---

## 🚀 Backend Development Strategy

> **Approach**: Ship complete backend features when ready, not on fixed schedules. Each feature includes domain implementation, API endpoints, and comprehensive testing.

### **Backend Feature Completion Pattern**

**For Each Backend Feature**:

1. **Domain Development** (4-5 hours): Entities, repositories, use cases
2. **API Implementation** (2-3 hours): Controllers, DTOs, validation
3. **Testing** (1-2 hours): Unit tests, integration tests
4. **Documentation** (30 minutes): API docs and technical documentation

**Total Backend Commitment**: **6-8 hours per complete backend feature**

### **Frontend Integration**

Frontend development is handled separately and documented in:
📋 **[Frontend Migration Plan](./frontend-migration.md)**

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

## 📊 Success Metrics & Timeline

### **Daily Success Metrics**

**Technical Metrics:**

- ✅ Feature completion within 6-8 hours
- ✅ All tests passing (>95% coverage)
- ✅ API response time <200ms
- ✅ Zero critical bugs in production

**User Value Metrics:**

- ✅ Feature immediately usable by users
- ✅ No regression in existing functionality
- ✅ Improved user workflow completion rates
- ✅ Positive user feedback on new features

### **Backend Feature Development Summary**

| Feature | Category       | Estimated Hours | Dependencies   | API Value                  |
| ------- | -------------- | --------------- | -------------- | -------------------------- |
| F1      | Foundation     | 6h + setup     | None           | ✅ Development foundation  |
| F2      | Foundation     | 8h backend      | F1             | ✅ User accounts & auth    |
| F3      | Core Financial | 8h backend      | F1, F2         | ✅ Budget management APIs  |
| F4      | Core Financial | 8h backend      | F1, F2         | ✅ Goal setting & tracking APIs |
| F5      | Core Financial | 8h backend      | F1, F2, F3     | ✅ Transaction recording APIs   |
| F6      | Core Financial | 8h backend      | F1, F2         | ✅ Income tracking APIs         |
| F7      | Analytics      | 8h backend      | F3, F5         | ✅ Budget analytics APIs        |
| F8      | Analytics      | 8h backend      | F4             | ✅ Goal milestones APIs         |

**Total Backend Development**: **8 core features** with **62 hours** estimated
**Average Feature Time**: **6-8 hours per backend feature**
**Approach**: **Ship backend features as completed, frontend integrates as available**

### **Frontend Integration**

Frontend features are documented separately in **[Frontend Migration Plan](./frontend-migration.md)** with:
- **16 frontend features** (FF1-FF16) 
- **114 hours** estimated frontend development
- **Feature-based shipping** aligned with backend API availability

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
