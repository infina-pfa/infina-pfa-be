# E2E Testing Guidelines

## Overview

This document provides streamlined guidelines for writing resilient end-to-end (E2E) tests in the Infina Personal Finance Advisor backend. The E2E testing strategy focuses on testing complete API workflows with real database operations and authentication flows, while remaining stable during code refactoring.

## Architecture

### Tech Stack

- **Jest** with `ts-jest` for TypeScript support
- **Supertest** for HTTP request testing
- **Prisma Client** for database operations
- **Mock Authentication** using custom guards
- **PostgreSQL** (Supabase) for test database

### Directory Structure

```
test/
├── factories/           # Test data factories
│   └── user.factory.ts
├── setup/              # Test environment setup
│   ├── database.setup.ts
│   ├── global.setup.ts
│   ├── global.teardown.ts
│   ├── jest.setup.ts
│   └── test-environment.ts
├── utils/              # Test utilities
│   ├── auth.utils.ts
│   └── database-cleanup.utils.ts
├── [domain]/           # Domain-specific E2E tests
│   └── *.e2e-spec.ts
├── jest-e2e.json       # Jest E2E configuration
└── README.md
```

## Test Configuration

### Jest Configuration (`test/jest-e2e.json`)

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testMatch": ["**/*.e2e-spec.ts"],
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/../src/$1",
    "^@test/(.*)$": "<rootDir>/$1"
  },
  "setupFilesAfterEnv": ["<rootDir>/setup/jest.setup.ts"],
  "globalSetup": "<rootDir>/setup/global.setup.ts",
  "globalTeardown": "<rootDir>/setup/global.teardown.ts",
  "testTimeout": 30000,
  "maxWorkers": 1,
  "forceExit": true,
  "detectOpenHandles": true,
  "verbose": true
}
```

### Environment Configuration

Tests use local Supabase instance by default:

- **Database URL**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- **Supabase URL**: `http://127.0.0.1:54321`
- **Test timeout**: 30 seconds
- **Single worker**: Ensures test isolation

## Authentication Strategy

### Mock Authentication Guard

E2E tests use a custom `MockGuard` that:

- Bypasses real Supabase authentication
- Extracts user ID from Bearer token
- Creates mock Supabase User objects
- Enables testing authenticated endpoints without real auth tokens

```typescript
class MockGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) return false;

    const token = authHeader.split(' ')[1];
    const user = mockUsers.find((u) => token.includes(u.id));

    if (user) {
      request.user = AuthTestUtils.createMockSupabaseUser(user);
      return true;
    }

    return false;
  }
}
```

### Test Users

Predefined test users in `TEST_USERS`:

```typescript
export const TEST_USERS = {
  JOHN_DOE: {
    id: '99999999-9999-9999-9999-999999999999',
    email: 'john.doe@test.com',
    name: 'John Doe',
    aud: 'authenticated',
    role: 'authenticated',
  },
  // ... more test users
};
```

## Database Management

### Setup and Cleanup Strategy

1. **Global Setup**: Initialize test database connection
2. **Before All**: Setup test module and authentication
3. **Before Each**: Clean database and recreate test users
4. **After All**: Cleanup users and teardown database

### Database Cleanup Order

Due to foreign key constraints, cleanup follows specific order:

```typescript
await prisma.budget_transactions.deleteMany();
await prisma.goal_transactions.deleteMany();
await prisma.onboarding_messages.deleteMany();
await prisma.messages.deleteMany();
await prisma.conversations.deleteMany();
await prisma.onboarding_profiles.deleteMany();
await prisma.transactions.deleteMany();
await prisma.budgets.deleteMany();
await prisma.goals.deleteMany();
await prisma.public_users.deleteMany();
await prisma.auth_users.deleteMany();
```

## Test Structure Patterns

### Basic E2E Test Structure

```typescript
describe('Controller Name (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let authHeaders: Record<string, { Authorization: string }>;

  beforeAll(async () => {
    // Setup test database
    prisma = await TestDatabaseManager.setupTestDatabase();

    // Create test module with mock authentication
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SupabaseAuthGuard)
      .useClass(MockGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Setup test authentication
    const authSetup = await AuthTestUtils.setupTestAuthentication(prisma);
    authHeaders = authSetup.authHeaders;
  });

  afterAll(async () => {
    await TestDatabaseManager.cleanupTestDatabase();
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

  // Test cases...
});
```

### Core Test Categories

#### 1. Happy Path Tests

```typescript
it('should return current user profile with correct data structure', async () => {
  const response = await request(app.getHttpServer())
    .get('/users/profile')
    .set(authHeaders.JOHN_DOE)
    .expect(200);

  const body = response.body as UserProfileResponseDto;

  // Verify expected data structure and values
  expect(body.id).toBeDefined();
  expect(body.name).toBeDefined();
  expect(typeof body.id).toBe('string');
  expect(typeof body.name).toBe('string');
  expect(new Date(body.createdAt)).toBeInstanceOf(Date);

  // Verify business logic outcomes
  if (body.onboardingCompletedAt) {
    expect(body.financialStage).toBeDefined();
  }
});
```

#### 2. Unhappy Path Tests

```typescript
// Authentication errors
it('should return 403 when not authenticated', async () => {
  await request(app.getHttpServer()).get('/users/profile').expect(403);
});

// Validation errors
it('should return 400 when providing invalid data', async () => {
  await request(app.getHttpServer())
    .post('/users/profile')
    .set(authHeaders.JOHN_DOE)
    .send({ name: 123 }) // Invalid type
    .expect(400);
});

// Resource errors
it('should return 404 if user profile not found in database', async () => {
  await prisma.public_users.delete({
    where: { user_id: TEST_USERS.JOHN_DOE.id },
  });

  await request(app.getHttpServer())
    .get('/users/profile')
    .set(authHeaders.JOHN_DOE)
    .expect(404);
});
```

#### Optional: Performance Tests

```typescript
it('should respond within reasonable time', async () => {
  const startTime = Date.now();

  await request(app.getHttpServer())
    .get('/users/profile')
    .set(authHeaders.JOHN_DOE)
    .expect(200);

  const responseTime = Date.now() - startTime;
  expect(responseTime).toBeLessThan(500);
});
```

## Test Data Management

### Using Factory Pattern

The `UserFactory` provides consistent test data creation:

```typescript
// Create entity instances
const userEntity = UserFactory.create({
  name: 'Custom Name',
  financialStage: 'building_foundation',
});

// Create database records
const dbUser = UserFactory.createDatabaseData({
  user_id: 'custom-id',
  name: 'Custom Name',
});

// Create complete user setup
const userSetup = UserFactory.createCompleteUserSetup({
  userId: 'test-id',
  email: 'test@example.com',
  name: 'Test User',
});
```

### Predefined User Types

```typescript
// New user (no onboarding)
const newUser = UserFactory.createNewUser(userId, email, name);

// Onboarded user
const onboardedUser = UserFactory.createOnboardedUser(userId, email, name);

// Experienced user
const experiencedUser = UserFactory.createExperiencedUser(userId, email, name);
```

## Best Practices

### 1. Focus on Behavior, Not Implementation

- Test what the system does, not how it does it
- Tests should not break when internal code is refactored
- Focus on public APIs and observable outcomes

### 2. Test Isolation

- Each test should be independent
- Clean database before each test
- Use consistent test data

### 3. Comprehensive Coverage

- Cover both happy path and unhappy path scenarios
- Test authentication, validation, and error handling
- Verify business logic through observable outcomes

### 4. Maintainable Tests

- Group related tests in describe blocks
- Use descriptive test names
- Follow consistent naming patterns
- Keep tests simple and focused

### 5. Performance Considerations

- Include basic performance tests when necessary
- Set reasonable timeout expectations
- Monitor test execution time

## Writing New E2E Tests

### Step-by-Step Process

1. **Create Test File**

   ```typescript
   // test/[domain]/[controller].e2e-spec.ts
   describe('Domain Controller (e2e)', () => {
     // Test setup...
   });
   ```

2. **Setup Test Infrastructure**

   - Import required modules and utilities
   - Setup database and authentication
   - Configure test module with mock guards

3. **Write Test Cases**

   - Happy path scenarios (valid inputs, expected behavior)
   - Unhappy path scenarios (invalid inputs, error conditions)
   - Optional performance tests when needed

4. **Use Test Utilities**

   - Leverage existing factories for test data
   - Use auth utils for authentication setup
   - Follow database cleanup patterns

5. **Run and Validate**
   ```bash
   npm run test:e2e
   npm run test:e2e -- --testNamePattern="specific test"
   ```

## Running E2E Tests

### Prerequisites

- Local Supabase instance running on port 54321
- PostgreSQL database on port 54322
- All dependencies installed

### Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- test/user/user.controller.e2e-spec.ts

# Run with coverage
npm run test:e2e -- --coverage

# Run in watch mode
npm run test:e2e -- --watch
```

### Environment Variables

```bash
# Required for E2E tests
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**

   - Ensure local Supabase is running
   - Check DATABASE_URL configuration
   - Verify database schema is up to date

2. **Authentication Failures**

   - Verify mock guard is properly configured
   - Check test user creation in database
   - Ensure auth headers are correctly formatted

3. **Test Timeouts**

   - Check database cleanup efficiency
   - Verify no hanging connections
   - Consider increasing test timeout for complex tests

4. **Flaky Tests**
   - Ensure proper test isolation
   - Check for race conditions in setup/teardown
   - Verify database cleanup is complete

### Debugging Tips

- Use `console.log` in test setup for debugging
- Check database state before/after tests
- Verify test data is created correctly
- Use Jest's `--verbose` flag for detailed output

## Future Enhancements

### Planned Improvements

1. **Test Data Seeding**: Automated test data generation
2. **API Contract Testing**: Schema validation
3. **Refactoring-Resilient Tests**: Further improve test stability during code changes

### Integration Opportunities

1. **CI/CD Integration**: Automated E2E testing in deployment pipeline
2. **Test Reporting**: Enhanced test result reporting
3. **Monitoring**: Test execution metrics and alerting
