# Development Commands

This document outlines the available npm scripts and commands for development, testing, and maintenance.

## Development Commands

```bash
# Development
npm run start:dev          # Start in watch mode
npm run start:debug        # Start with debugging enabled
npm run build             # Build the application
npm run start:prod        # Start production build
```

## Testing Commands

```bash
# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:e2e         # Run end-to-end tests
npm run test:cov         # Run tests with coverage
```

## Code Quality Commands

```bash
# Code Quality
npm run lint             # Lint and fix TypeScript files
npm run format           # Format code with Prettier
```

## Database Commands

```bash
# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
```

## Development Notes

- Always run `npm run prisma:generate` after pulling database schema changes
- Use `npm run test:watch` during development for continuous testing
- Run `npm run lint` before committing changes
- Use `npm run prisma:studio` to visually inspect and manage database data

## E2E Testing Guidelines

### Overview

End-to-end (E2E) testing verifies that our application works correctly from the user's perspective by testing the complete flow through the API. In our Clean Architecture approach, E2E tests focus on testing through the API/Controller layer, which implicitly tests all underlying layers working together.

### Setup

Our E2E testing infrastructure uses:

- Jest as the testing framework
- Supertest for HTTP assertions
- Custom test database setup and teardown

### Test Structure

1. **File Location**: Place all E2E tests in the `/test` directory with the naming convention `*.e2e-spec.ts`

2. **Test Organization**: Group tests by feature/module (e.g., `/test/user/`, `/test/budgeting/`)

3. **Basic Test Structure**:
   ```typescript
   describe('ModuleName (e2e)', () => {
     let app: INestApplication;
     let testDb: TestDatabase;

     beforeAll(async () => {
       // Setup application and test database
       const moduleFixture = await Test.createTestingModule({
         imports: [AppModule],
       }).compile();

       app = moduleFixture.createNestApplication();
       setupGlobalMiddleware(app); // Apply same middleware as in main.ts
       await app.init();

       testDb = await setupTestDatabase();
     });

     afterAll(async () => {
       await cleanupDatabase(testDb);
       await app.close();
     });

     describe('Endpoint Path', () => {
       it('should perform expected action', async () => {
         // Test implementation
       });
     });
   });
   ```

### Best Practices

1. **Test Independence**: Each test should be independent and not rely on the state from previous tests.

2. **Database Reset**: Use the provided utility functions to reset the database between test suites:

   ```typescript
   import { cleanupDatabase } from '../utils/database-cleanup.utils';

   afterEach(async () => {
     await cleanupDatabase();
   });
   ```

3. **Test Data Creation**: Use factory patterns to create test data:

   ```typescript
   import { createUser } from '../factories/user.factory';

   const testUser = await createUser({
     email: 'test@example.com',
     // other properties
   });
   ```

4. **Authentication**: Use the auth utilities to simulate authenticated requests:

   ```typescript
   import { getAuthToken } from '../utils/auth.utils';

   const token = await getAuthToken(testUser);

   // Use in requests
   await request(app.getHttpServer())
     .get('/endpoint')
     .set('Authorization', `Bearer ${token}`)
     .expect(200);
   ```

5. **Test Coverage**: Ensure your tests cover:
   - Happy path (successful operations)
   - Error cases (invalid inputs, unauthorized access)
   - Edge cases specific to your feature

### What to Test

Focus your E2E tests on:

1. **API Contract**: Verify that endpoints return the expected response structure and status codes.

2. **Business Rules**: Test that business rules are correctly applied (e.g., budget limits, validation rules).

3. **Data Flow**: Verify that data is correctly persisted and retrieved.

4. **Authorization**: Test that endpoints properly enforce access control.

### What Not to Test in E2E

1. **Internal Implementation**: Don't test the internal workings of services or repositories.

2. **Individual Layers**: Don't create separate E2E tests for use cases or repositories.

3. **UI Components**: Our E2E tests focus on API testing, not UI testing.

### Running Tests

Run all E2E tests:

```bash
npm run test:e2e
```

Run specific test files:

```bash
npm run test:e2e -- test/user/user.controller.e2e-spec.ts
```

### Example Test

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { createUser } from '../factories/user.factory';
import { getAuthToken } from '../utils/auth.utils';
import { cleanupDatabase } from '../utils/database-cleanup.utils';

describe('Budget Controller (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create test user and get auth token
    const user = await createUser();
    authToken = await getAuthToken(user);
  });

  afterAll(async () => {
    await cleanupDatabase();
    await app.close();
  });

  describe('/budgets (POST)', () => {
    it('should create a new budget', async () => {
      const budgetData = {
        name: 'Test Budget',
        amount: 1000,
        category: 'fixed',
        icon: 'home',
        color: '#0055FF',
        month: 7,
        year: 2024,
      };

      const response = await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(budgetData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(budgetData.name);
      expect(response.body.amount).toBe(budgetData.amount);
    });

    it('should return 400 for invalid budget data', async () => {
      const invalidData = {
        // Missing required fields
        name: 'Test Budget',
      };

      await request(app.getHttpServer())
        .post('/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });
  });
});
```
