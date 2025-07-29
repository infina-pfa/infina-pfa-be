# Integration Testing Guide

This document provides comprehensive guidance for writing and maintaining integration tests for the Infina Personal Finance Advisor backend.

## Overview

Our integration testing strategy focuses on:
- **API endpoint testing** with proper authentication
- **Database operations** through the repository pattern
- **Cross-domain business logic** verification
- **Clean Architecture compliance** across all layers
- **Data isolation** between tests and users

## Architecture

The integration testing framework follows these architectural principles:

```
test/
├── setup/                    # Test environment configuration
│   ├── database.setup.ts     # Database management utilities
│   ├── test-environment.ts   # Environment configuration
│   ├── jest.setup.ts         # Jest configuration
│   ├── global.setup.ts       # Global test setup
│   └── global.teardown.ts    # Global test teardown
├── utils/                    # Test utilities
│   ├── auth.utils.ts         # Authentication helpers
│   └── database-cleanup.utils.ts # Database cleanup utilities
├── factories/                # Test data factories
│   ├── budget.factory.ts     # Budget entity factory
│   ├── transaction.factory.ts # Transaction entity factory
│   ├── user.factory.ts       # User entity factory
│   └── index.ts              # Factory aggregation
├── budgeting/               # Domain-specific integration tests
├── repositories/            # Repository integration tests
├── integration/             # Cross-domain integration tests
└── README.md                # This documentation
```

## Quick Start

### Prerequisites

1. **Local Supabase instance** running on `http://127.0.0.1:54321`
2. **PostgreSQL database** accessible at `127.0.0.1:54322`
3. **Environment variables** configured (see `.env` file)

### Running Tests

```bash
# Run all integration tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- budget.controller.e2e-spec.ts

# Run tests with verbose output
NODE_ENV=test-verbose npm run test:e2e

# Run tests in watch mode (for development)
npm run test:e2e -- --watch
```

## Writing Integration Tests

### 1. Controller Integration Tests

Controller tests verify API endpoints with proper authentication and data isolation.

```typescript
// test/budgeting/budget.controller.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TestDatabaseManager } from '../setup/database.setup';
import { AuthTestUtils, TEST_USERS } from '../utils/auth.utils';

describe('Budget Controller (e2e)', () => {
  let app: INestApplication;
  let prisma: any;
  let authHeaders: Record<string, { Authorization: string }>;

  beforeAll(async () => {
    // Setup test database and authentication
    prisma = await TestDatabaseManager.setupTestDatabase();
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue(AuthTestUtils.mockSupabaseAuthGuard())
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const authSetup = await AuthTestUtils.setupTestAuthentication(prisma);
    authHeaders = authSetup.authHeaders;
  });

  afterAll(async () => {
    await AuthTestUtils.cleanupTestUsers(prisma);
    await TestDatabaseManager.teardownTestDatabase();
    await app.close();
  });

  beforeEach(async () => {
    await TestDatabaseManager.cleanupTestDatabase();
    // Recreate test users for each test
    for (const testUser of Object.values(TEST_USERS)) {
      await AuthTestUtils.createTestUserInDatabase(prisma, testUser);
    }
  });

  it('should create a budget with authentication', async () => {
    const response = await request(app.getHttpServer())
      .post('/budgets')
      .set(authHeaders.JOHN_DOE)
      .send({
        name: 'Groceries',
        amount: 500,
        category: 'variable',
        month: 7,
        year: 2024,
        userId: TEST_USERS.JOHN_DOE.id,
      })
      .expect(201);

    expect(response.body.name).toBe('Groceries');
    expect(response.body.amount).toBe(500);
  });
});
```

### 2. Repository Integration Tests

Repository tests verify database operations using real Prisma client.

```typescript
// test/repositories/budget.repository.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BudgetRepository } from '../../src/budgeting/domain/repositories/budget.repository';
import { BudgetPrismaRepository } from '../../src/budgeting/infrastructure/repositories/budget.repository';
import { PrismaModule } from '../../src/common/prisma/prisma.module';
import { TestDatabaseManager } from '../setup/database.setup';
import { BudgetFactory } from '../factories';

describe('Budget Repository Integration', () => {
  let repository: BudgetRepository;
  let prisma: any;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    prisma = await TestDatabaseManager.setupTestDatabase();
    
    moduleRef = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [
        {
          provide: BudgetRepository,
          useClass: BudgetPrismaRepository,
        },
      ],
    }).compile();

    repository = moduleRef.get<BudgetRepository>(BudgetRepository);
  });

  it('should create and retrieve a budget', async () => {
    const budgetEntity = BudgetFactory.create({
      userId: 'test-user-id',
      name: 'Test Budget',
      amount: 1000,
    });

    const createdBudget = await repository.create(budgetEntity);
    const foundBudget = await repository.findById(createdBudget.id);

    expect(foundBudget).toBeDefined();
    expect(foundBudget!.name).toBe('Test Budget');
  });
});
```

### 3. Cross-Domain Integration Tests

Cross-domain tests verify business workflows that span multiple domains.

```typescript
// test/integration/budget-transaction.e2e-spec.ts
describe('Budget-Transaction Integration (e2e)', () => {
  it('should create budget, add transactions, and show spending analytics', async () => {
    // Step 1: Create a budget via API
    const budgetResponse = await request(app.getHttpServer())
      .post('/budgets')
      .set(authHeaders.JOHN_DOE)
      .send(budgetData)
      .expect(201);

    // Step 2: Create and link transactions
    const transaction = await prisma.transactions.create({
      data: TransactionFactory.createDatabaseData({
        user_id: TEST_USERS.JOHN_DOE.id,
        amount: 85.50,
        type: 'outcome',
      }),
    });

    await prisma.budget_transactions.create({
      data: {
        user_id: TEST_USERS.JOHN_DOE.id,
        budget_id: budgetResponse.body.id,
        transaction_id: transaction.id,
      },
    });

    // Step 3: Verify spending analytics
    const analyticsResponse = await request(app.getHttpServer())
      .get('/budgets/with-spending')
      .set(authHeaders.JOHN_DOE)
      .expect(200);

    expect(analyticsResponse.body[0].totalSpent).toBe(85.50);
  });
});
```

## Test Utilities

### Authentication Utils

Use `AuthTestUtils` for authentication-related testing:

```typescript
import { AuthTestUtils, TEST_USERS } from '../utils/auth.utils';

// Create authentication headers
const authHeaders = AuthTestUtils.createAuthHeader(TEST_USERS.JOHN_DOE);

// Setup test users in database
await AuthTestUtils.setupTestAuthentication(prisma);

// Mock Supabase Auth Guard
.overrideGuard(SupabaseAuthGuard)
.useValue(AuthTestUtils.mockSupabaseAuthGuard())
```

### Data Factories

Use factories to create consistent test data:

```typescript
import { BudgetFactory, TransactionFactory, UserFactory } from '../factories';

// Create budget entity
const budget = BudgetFactory.create({
  userId: 'user-id',
  name: 'Groceries',
  amount: 500,
});

// Create database-ready data
const budgetData = BudgetFactory.createDatabaseData({
  user_id: 'user-id',
  name: 'Groceries',
});

// Create complete test scenario
await TestDataFactory.createCompleteTestScenario(prisma, userId);
```

### Database Cleanup

Use cleanup utilities to maintain test isolation:

```typescript
import { DatabaseCleanupUtils } from '../utils/database-cleanup.utils';

// Clean all test data
await DatabaseCleanupUtils.cleanupAllTestData(prisma);

// Clean user-specific data
await DatabaseCleanupUtils.cleanupUserTestData(prisma, userId);

// Clean specific entities
await DatabaseCleanupUtils.cleanupBudgets(prisma, userId);

// Verify database is clean
const isClean = await DatabaseCleanupUtils.verifyDatabaseIsClean(prisma);
```

## Best Practices

### 1. Test Structure

- **One test file per controller/repository/use case**
- **Group related tests using `describe` blocks**
- **Use descriptive test names** that explain the scenario
- **Follow AAA pattern**: Arrange, Act, Assert

### 2. Test Data Management

- **Use factories** for consistent data creation
- **Clean up after each test** to ensure isolation
- **Use realistic test data** that reflects production scenarios
- **Create minimal data** needed for each test

### 3. Authentication Testing

- **Test both authenticated and unauthenticated scenarios**
- **Verify user data isolation** across different users
- **Test different user roles and permissions**
- **Mock external authentication services** for reliable testing

### 4. Database Testing

- **Use real database operations** for integration tests
- **Test database constraints and relationships**
- **Verify data persistence** across operations
- **Test transaction handling** and rollback scenarios

### 5. Error Handling

- **Test error scenarios** alongside happy paths
- **Verify error messages and status codes**
- **Test input validation** and boundary conditions
- **Test system behavior** under failure conditions

### 6. Performance Considerations

- **Run tests with limited parallelism** (maxWorkers: 1)
- **Use database transactions** for test isolation when possible
- **Monitor test execution time** and optimize slow tests
- **Clean up resources properly** to prevent memory leaks

## Configuration

### Jest Configuration

The e2e Jest configuration includes:

```json
{
  "moduleNameMapping": {
    "^@/(.*)$": "<rootDir>/../src/$1",
    "^@test/(.*)$": "<rootDir>/$1"
  },
  "setupFilesAfterEnv": ["<rootDir>/setup/jest.setup.ts"],
  "globalSetup": "<rootDir>/setup/global.setup.ts",
  "globalTeardown": "<rootDir>/setup/global.teardown.ts",
  "testTimeout": 30000,
  "maxWorkers": 1,
  "forceExit": true
}
```

### Environment Variables

Ensure these environment variables are set for testing:

```bash
NODE_ENV=test
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your-test-anon-key
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure local Supabase is running
   - Check DATABASE_URL configuration
   - Verify database migrations are applied

2. **Authentication Failures**
   - Verify test user setup in beforeEach hooks
   - Check Supabase Auth Guard mocking
   - Ensure proper JWT token generation

3. **Test Data Conflicts**
   - Use unique IDs in test data
   - Ensure proper cleanup between tests
   - Check foreign key constraints

4. **Timeout Issues**
   - Increase test timeout for slow operations
   - Optimize database queries in tests
   - Check for hanging database connections

### Debugging Tips

1. **Enable verbose logging**:
   ```bash
   NODE_ENV=test-verbose npm run test:e2e
   ```

2. **Check database state**:
   ```typescript
   await DatabaseCleanupUtils.getDatabaseStats(prisma);
   ```

3. **Isolate failing tests**:
   ```bash
   npm run test:e2e -- --testNamePattern="specific test name"
   ```

4. **Monitor test performance**:
   ```typescript
   import { TestPerformanceUtils } from '../utils/database-cleanup.utils';
   
   const { result, duration } = await TestPerformanceUtils.measureDatabaseOperation(
     'budget creation',
     () => repository.create(budget)
   );
   ```

## Contributing

When adding new integration tests:

1. **Follow existing patterns** and conventions
2. **Add comprehensive test coverage** for new features
3. **Update factories** when adding new entities
4. **Document complex test scenarios** with comments
5. **Ensure tests are reliable** and don't produce false positives

## Examples

See the following files for complete examples:

- **Controller Testing**: `test/budgeting/budget.controller.e2e-spec.ts`
- **Repository Testing**: `test/repositories/budget.repository.e2e-spec.ts`
- **Cross-Domain Testing**: `test/integration/budget-transaction.e2e-spec.ts`
- **Test Factories**: `test/factories/budget.factory.ts`
- **Auth Utilities**: `test/utils/auth.utils.ts`

Each example demonstrates different aspects of integration testing and can serve as templates for new tests.